import { equalShares, bookingTotalCents, BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@cleaningos/shared';
import { prisma } from '../lib/prisma.js';
import { businessToday } from '../utils/time.js';
import { bookingInclude, serializeBooking } from './serializers.js';

const sum = (list, fn) => list.reduce((n, x) => n + fn(x), 0);

/**
 * Daily report. Rules (see CLAUDE.md "Business rules"):
 * - Cancelled bookings are excluded from all values and workload.
 * - Per-cleaner amount = equal share of booking total (cents reconciled). NOT wages.
 * - Completed value counts only COMPLETED bookings.
 */
export async function dailyReport(date) {
  const [rows, staff] = await Promise.all([
    prisma.booking.findMany({ where: { date }, orderBy: [{ time: 'asc' }, { id: 'asc' }], include: bookingInclude }),
    prisma.staff.findMany({ orderBy: { name: 'asc' } }),
  ]);
  const all = rows.map(serializeBooking);
  const valid = all.filter((b) => b.status !== 'CANCELLED');
  const done = valid.filter((b) => b.status === 'COMPLETED');

  const shares = new Map(valid.map((b) => [b.id, equalShares(b.totalCents, b.cleaners.map((c) => c.id))]));
  const shareOf = (b, sid) => shares.get(b.id)?.get(sid) || 0;
  const has = (list, sid) => list.some((x) => x.id === sid);

  const cleanerRows = staff
    .filter((s) => s.role === 'CLEANER')
    .map((s) => {
      const mine = valid.filter((b) => has(b.cleaners, s.id));
      const mineDone = mine.filter((b) => b.status === 'COMPLETED');
      return {
        id: s.id,
        name: s.name,
        active: s.active,
        assigned: mine.length,
        completed: mineDone.length,
        completedHours: sum(mineDone, (b) => b.hours),
        assignedCents: sum(mine, (b) => shareOf(b, s.id)),
        completedCents: sum(mineDone, (b) => shareOf(b, s.id)),
      };
    })
    .filter((r) => r.active || r.assigned > 0);

  const driverRows = staff
    .filter((s) => s.role === 'DRIVER')
    .map((s) => ({
      id: s.id,
      name: s.name,
      active: s.active,
      assigned: valid.filter((b) => has(b.drivers, s.id)).length,
      completed: done.filter((b) => has(b.drivers, s.id)).length,
    }))
    .filter((r) => r.active || r.assigned > 0);

  const allocations = valid.flatMap((b) =>
    b.cleaners.map((c) => ({
      cleanerId: c.id,
      cleanerName: c.name,
      bookingId: b.id,
      bookingCode: b.code,
      customerName: b.customerName,
      status: b.status,
      hours: b.hours,
      totalCents: b.totalCents,
      shareCents: shareOf(b, c.id),
    }))
  );

  const statusCounts = Object.fromEntries(Object.keys(BOOKING_STATUS_LABELS).map((k) => [k, all.filter((b) => b.status === k).length]));
  const byPayment = (p) => valid.filter((b) => b.paymentStatus === p);

  return {
    date,
    summary: {
      total: all.length,
      completed: done.length,
      statusCounts,
      bookedCents: sum(valid, (b) => b.totalCents),
      completedCents: sum(done, (b) => b.totalCents),
      paidCents: sum(byPayment('PAID'), (b) => b.totalCents),
      unpaidCents: sum(byPayment('UNPAID'), (b) => b.totalCents),
      partialCents: sum(byPayment('PARTIAL'), (b) => b.totalCents),
      partialCount: byPayment('PARTIAL').length,
    },
    cleaners: cleanerRows,
    drivers: driverRows,
    allocations,
    bookings: all,
  };
}

const cell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const aed = (c) => (c / 100).toFixed(2);

export function reportToCsv(r) {
  const s = r.summary;
  const rows = [
    ['CleaningOS daily report', r.date],
    [],
    ['Metric', 'Value'],
    ['Total bookings', s.total],
    ['Completed bookings', s.completed],
    ['Booked value AED (non-cancelled)', aed(s.bookedCents)],
    ['Completed value AED', aed(s.completedCents)],
    ['Paid bookings value AED', aed(s.paidCents)],
    ['Unpaid bookings value AED', aed(s.unpaidCents)],
    [],
    ['Cleaner', 'Assigned jobs', 'Completed jobs', 'Scheduled hours (completed)', 'Assigned value AED', 'Completed value AED'],
    ...r.cleaners.map((x) => [x.name, x.assigned, x.completed, x.completedHours, aed(x.assignedCents), aed(x.completedCents)]),
    [],
    ['Cleaner allocations: equal share of booking value; NOT salary'],
    ['Cleaner', 'Booking', 'Customer', 'Status', 'Hours', 'Booking value AED', 'Cleaner share AED'],
    ...r.allocations.map((a) => [a.cleanerName, a.bookingCode, a.customerName, BOOKING_STATUS_LABELS[a.status], a.hours, aed(a.totalCents), aed(a.shareCents)]),
    [],
    ['Driver', 'Assigned bookings', 'Completed bookings'],
    ...r.drivers.map((x) => [x.name, x.assigned, x.completed]),
    [],
    ['Booking', 'Customer', 'Time', 'Status', 'Cleaners', 'Drivers', 'Value AED', 'Payment'],
    ...r.bookings.map((b) => [
      b.code,
      b.customerName,
      b.time,
      BOOKING_STATUS_LABELS[b.status],
      b.cleaners.map((c) => c.name).join('; '),
      b.drivers.map((d) => d.name).join('; '),
      aed(b.totalCents),
      PAYMENT_STATUS_LABELS[b.paymentStatus],
    ]),
  ];
  return '﻿' + rows.map((row) => row.map(cell).join(',')).join('\r\n');
}

export async function dashboard() {
  const today = businessToday();
  const [total, todayCount, pending, paidRows, recent] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { date: today, status: { not: 'CANCELLED' } } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.findMany({
      where: { paymentStatus: 'PAID', status: { not: 'CANCELLED' } },
      select: { cleanerCount: true, hours: true, hourlyRate: true },
    }),
    prisma.booking.findMany({ orderBy: [{ startsAt: 'desc' }], take: 8, include: bookingInclude }),
  ]);
  const paidCents = sum(paidRows, (b) => bookingTotalCents({ cleanerCount: b.cleanerCount, hours: b.hours, rate: b.hourlyRate }));
  return { today, total, todayCount, pending, paidCents, recent: recent.map(serializeBooking) };
}
