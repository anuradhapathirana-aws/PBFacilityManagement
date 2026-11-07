import { bookingTotalCents } from '@cleaningos/shared';

export const bookingInclude = {
  staff: { include: { staff: { select: { id: true, name: true, role: true, active: true } } } },
};

/** DB row → API shape. Decimals become numbers; money in integer cents. */
export const serializeBooking = (b) => {
  const hours = Number(b.hours);
  const rate = Number(b.hourlyRate);
  const assigned = (b.staff || []).map((a) => ({ id: a.staff.id, name: a.staff.name, role: a.role, active: a.staff.active }));
  return {
    id: b.id,
    code: b.code,
    customerName: b.customerName,
    phone: b.phone,
    area: b.area,
    address: b.address,
    service: b.service,
    date: b.date,
    time: b.time,
    hours,
    cleanerCount: b.cleanerCount,
    rate,
    status: b.status,
    paymentStatus: b.paymentStatus,
    notes: b.notes,
    totalCents: bookingTotalCents({ cleanerCount: b.cleanerCount, hours, rate }),
    cleaners: assigned.filter((a) => a.role === 'CLEANER').sort((x, y) => x.id - y.id),
    drivers: assigned.filter((a) => a.role === 'DRIVER').sort((x, y) => x.id - y.id),
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
};

export const serializeStaff = (s) => ({
  id: s.id,
  name: s.name,
  phone: s.phone,
  role: s.role,
  active: s.active,
  createdAt: s.createdAt,
  ...(s._count && { assignmentCount: s._count.assignments }),
});
