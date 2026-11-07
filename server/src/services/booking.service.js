import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { STAFF_ROLE_LABELS, bookingTotalCents } from '@cleaningos/shared';
import { prisma } from '../lib/prisma.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { toInstant, addHours, businessToday } from '../utils/time.js';
import { bookingInclude, serializeBooking } from './serializers.js';

const newCode = () => `BK-${Date.now().toString(36).toUpperCase()}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

export async function listBookings({ date, q, status, paymentStatus, page, pageSize }) {
  const where = {
    ...(date && { date }),
    ...(status && { status }),
    ...(paymentStatus && { paymentStatus }),
    ...(q && {
      OR: [{ code: { contains: q } }, { customerName: { contains: q } }, { phone: { contains: q } }, { area: { contains: q } }],
    }),
  };
  const orderBy = date ? [{ time: 'asc' }, { id: 'asc' }] : [{ startsAt: 'desc' }, { id: 'desc' }];
  const [total, rows] = await prisma.$transaction([
    prisma.booking.count({ where }),
    prisma.booking.findMany({ where, orderBy, include: bookingInclude, skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  const result = { items: rows.map(serializeBooking), total, page, pageSize };

  // Single-day view: totals over ALL matching bookings, not just the current page.
  if (date) {
    const all = await prisma.booking.findMany({ where, select: { status: true, cleanerCount: true, hours: true, hourlyRate: true } });
    const active = all.filter((b) => b.status !== 'CANCELLED');
    result.summary = {
      total: all.length,
      active: active.length,
      cleanerAssignments: active.reduce((n, b) => n + b.cleanerCount, 0),
      valueCents: active.reduce((n, b) => n + bookingTotalCents({ cleanerCount: b.cleanerCount, hours: b.hours, rate: b.hourlyRate }), 0),
    };
  }
  return result;
}

export async function getBooking(id) {
  const b = await prisma.booking.findUnique({ where: { id }, include: bookingInclude });
  if (!b) throw notFound('Booking');
  return serializeBooking(b);
}

/** Paginated bookings for one staff member + stats over all their bookings. */
export async function bookingsForStaff(staffId, { page, pageSize }) {
  const mine = { staff: { some: { staffId } } };
  const live = { ...mine, status: { not: 'CANCELLED' } };
  const done = { ...mine, status: 'COMPLETED' };
  const [total, rows, liveCount, upcoming, completed, hoursAgg] = await prisma.$transaction([
    prisma.booking.count({ where: mine }),
    prisma.booking.findMany({
      where: mine,
      orderBy: [{ startsAt: 'desc' }, { id: 'desc' }],
      include: bookingInclude,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.booking.count({ where: live }),
    prisma.booking.count({ where: { ...mine, status: { notIn: ['CANCELLED', 'COMPLETED'] }, date: { gte: businessToday() } } }),
    prisma.booking.count({ where: done }),
    prisma.booking.aggregate({ where: done, _sum: { hours: true } }),
  ]);
  return {
    items: rows.map(serializeBooking),
    total,
    page,
    pageSize,
    stats: { assigned: liveCount, upcoming, completed, completedHours: Number(hoursAgg._sum.hours || 0) },
  };
}

export const createBooking = (data) => saveBooking(null, data);
export const updateBooking = (id, data) => saveBooking(id, data);

export async function deleteBooking(id) {
  await prisma.booking.delete({ where: { id } });
}

/**
 * Create or update inside one transaction:
 *  1. lock the involved staff rows (serialises concurrent bookings for the same people)
 *  2. verify each id is an existing, active staff member with the right role
 *  3. reject if any of them is on another non-cancelled booking overlapping this time
 *  4. write booking + replace assignments
 */
async function saveBooking(id, data) {
  const startsAt = toInstant(data.date, data.time);
  const endsAt = addHours(startsAt, data.hours);
  const allIds = [...data.cleanerIds, ...data.driverIds];

  return prisma.$transaction(async (tx) => {
    let existing = null;
    if (id) {
      existing = await tx.booking.findUnique({ where: { id }, include: { staff: true } });
      if (!existing) throw notFound('Booking');
    }

    if (allIds.length) {
      await tx.$queryRaw`SELECT id FROM Staff WHERE id IN (${Prisma.join(allIds)}) FOR UPDATE`;
    }
    const staff = allIds.length ? await tx.staff.findMany({ where: { id: { in: allIds } } }) : [];
    const byId = new Map(staff.map((s) => [s.id, s]));
    const alreadyAssigned = new Set((existing?.staff || []).map((a) => a.staffId));

    const fields = {};
    const checkGroup = (ids, role, field) => {
      for (const sid of ids) {
        const s = byId.get(sid);
        if (!s) fields[field] = `Staff #${sid} does not exist`;
        else if (s.role !== role) fields[field] = `${s.name} is not a ${STAFF_ROLE_LABELS[role]}`;
        else if (!s.active && !alreadyAssigned.has(sid)) fields[field] = `${s.name} is inactive`;
      }
    };
    checkGroup(data.cleanerIds, 'CLEANER', 'cleanerIds');
    checkGroup(data.driverIds, 'DRIVER', 'driverIds');
    if (Object.keys(fields).length) throw new HttpError(422, 'Please correct the highlighted fields', { fields });

    if (data.status !== 'CANCELLED' && allIds.length) {
      const clashes = await tx.bookingStaff.findMany({
        where: {
          staffId: { in: allIds },
          booking: {
            ...(id && { id: { not: id } }),
            status: { not: 'CANCELLED' },
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
          },
        },
        include: { booking: { select: { code: true, date: true, time: true } } },
      });
      if (clashes.length) {
        const details = clashes.map((c) => ({
          staffId: c.staffId,
          staffName: byId.get(c.staffId)?.name,
          bookingCode: c.booking.code,
          date: c.booking.date,
          time: c.booking.time,
        }));
        const summary = details.map((d) => `${d.staffName} (${d.bookingCode} at ${d.time})`).join(', ');
        throw new HttpError(409, `Schedule conflict: ${summary}`, { code: 'SCHEDULE_CONFLICT', details });
      }
    }

    const record = {
      customerName: data.customerName,
      phone: data.phone,
      area: data.area,
      address: data.address,
      service: data.service,
      date: data.date,
      time: data.time,
      startsAt,
      endsAt,
      hours: new Prisma.Decimal(data.hours),
      cleanerCount: data.cleanerCount,
      hourlyRate: new Prisma.Decimal(data.rate.toFixed(2)),
      status: data.status,
      paymentStatus: data.paymentStatus,
      notes: data.notes,
    };
    const assignments = [
      ...data.cleanerIds.map((staffId) => ({ staffId, role: 'CLEANER' })),
      ...data.driverIds.map((staffId) => ({ staffId, role: 'DRIVER' })),
    ];

    let saved;
    if (id) {
      await tx.bookingStaff.deleteMany({ where: { bookingId: id } });
      saved = await tx.booking.update({
        where: { id },
        data: { ...record, staff: { create: assignments } },
        include: bookingInclude,
      });
    } else {
      saved = await tx.booking.create({
        data: { ...record, code: newCode(), staff: { create: assignments } },
        include: bookingInclude,
      });
    }
    return serializeBooking(saved);
  });
}
