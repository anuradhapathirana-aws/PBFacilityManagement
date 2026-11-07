import { prisma } from '../lib/prisma.js';
import { HttpError, notFound } from '../utils/httpError.js';
import { businessToday } from '../utils/time.js';
import { serializeStaff } from './serializers.js';

export async function listStaff({ role, active }) {
  const rows = await prisma.staff.findMany({
    where: { ...(role && { role }), ...(active !== undefined && { active }) },
    orderBy: [{ active: 'desc' }, { role: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { assignments: true } } },
  });
  return rows.map(serializeStaff);
}

export async function getStaff(id) {
  const s = await prisma.staff.findUnique({ where: { id } });
  if (!s) throw notFound('Staff member');
  return serializeStaff(s);
}

export async function createStaff(data) {
  return serializeStaff(await prisma.staff.create({ data }));
}

const upcomingAssignments = (staffId) =>
  prisma.bookingStaff.count({
    where: { staffId, booking: { status: { notIn: ['CANCELLED', 'COMPLETED'] }, date: { gte: businessToday() } } },
  });

export async function updateStaff(id, data) {
  const current = await prisma.staff.findUnique({ where: { id }, include: { _count: { select: { assignments: true } } } });
  if (!current) throw notFound('Staff member');

  if (data.role !== current.role && current._count.assignments > 0) {
    throw new HttpError(422, 'Role cannot change for staff who already have bookings', {
      fields: { role: 'Role is locked because this person has bookings' },
    });
  }
  if (current.active && data.active === false && (await upcomingAssignments(id)) > 0) {
    throw new HttpError(409, 'This staff member has upcoming bookings. Reassign them before deactivating.', {
      code: 'HAS_UPCOMING_BOOKINGS',
    });
  }
  return serializeStaff(await prisma.staff.update({ where: { id }, data }));
}

/** Hard delete only when the person has never been assigned; otherwise deactivate to keep history. */
export async function deleteStaff(id) {
  const current = await prisma.staff.findUnique({ where: { id }, include: { _count: { select: { assignments: true } } } });
  if (!current) throw notFound('Staff member');
  if (current._count.assignments > 0) {
    throw new HttpError(409, 'This staff member has booking history. Deactivate them instead of deleting.', {
      code: 'HAS_BOOKINGS',
    });
  }
  await prisma.staff.delete({ where: { id } });
}
