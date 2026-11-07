import { z } from 'zod';
import { AREAS, SERVICES, BOOKING_STATUSES, PAYMENT_STATUSES, LIMITS } from '../constants.js';
import { personName, phoneRequired, optionalText, dateString, timeString, numberFrom, isRealDate } from './common.js';

const idList = (label) =>
  z
    .array(z.coerce.number().int().positive(), { invalid_type_error: `${label} must be a list` })
    .default([])
    .refine((ids) => new Set(ids).size === ids.length, `${label} contain duplicates`);

const enumOf = (values, label) =>
  z.enum(values, { errorMap: () => ({ message: `Select a valid ${label}` }) });

export const bookingSchema = z
  .object({
    customerName: personName('Customer name'),
    phone: phoneRequired,
    area: enumOf(AREAS, 'area'),
    address: optionalText(LIMITS.addressMax, 'Address'),
    service: enumOf(SERVICES, 'service'),
    date: dateString,
    time: timeString,
    hours: numberFrom('Hours')
      .refine((n) => n >= LIMITS.hoursMin && n <= LIMITS.hoursMax, `Hours must be between ${LIMITS.hoursMin} and ${LIMITS.hoursMax}`)
      .refine((n) => Number.isInteger(n / LIMITS.hoursStep), `Hours must be in steps of ${LIMITS.hoursStep}`),
    cleanerCount: numberFrom('Number of cleaners')
      .refine((n) => Number.isInteger(n), 'Number of cleaners must be a whole number')
      .refine(
        (n) => n >= LIMITS.cleanerCountMin && n <= LIMITS.cleanerCountMax,
        `Number of cleaners must be between ${LIMITS.cleanerCountMin} and ${LIMITS.cleanerCountMax}`
      ),
    rate: numberFrom('Hourly rate')
      .refine((n) => n >= LIMITS.rateMin && n <= LIMITS.rateMax, `Hourly rate must be between ${LIMITS.rateMin} and ${LIMITS.rateMax}`)
      .refine((n) => Math.abs(Math.round(n * 100) - n * 100) < 1e-6, 'Hourly rate can have at most 2 decimals'),
    cleanerIds: idList('Cleaners'),
    driverIds: idList('Drivers').refine((ids) => ids.length <= LIMITS.driversMax, `At most ${LIMITS.driversMax} drivers`),
    status: enumOf(BOOKING_STATUSES, 'booking status'),
    paymentStatus: enumOf(PAYMENT_STATUSES, 'payment status'),
    notes: optionalText(LIMITS.notesMax, 'Special instructions'),
  })
  .superRefine((b, ctx) => {
    if (Array.isArray(b.cleanerIds) && typeof b.cleanerCount === 'number' && b.cleanerIds.length !== b.cleanerCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cleanerIds'],
        message: `Select exactly ${b.cleanerCount} cleaner(s). Selected: ${b.cleanerIds.length}`,
      });
    }
    if (Array.isArray(b.cleanerIds) && Array.isArray(b.driverIds) && b.cleanerIds.some((id) => b.driverIds.includes(id))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['driverIds'], message: 'A staff member cannot be both cleaner and driver' });
    }
  });

const optionalDate = z
  .string()
  .optional()
  .refine((v) => v === undefined || v === '' || isRealDate(v), 'Invalid date')
  .transform((v) => (v ? v : undefined));

export const bookingQuerySchema = z.object({
  date: optionalDate,
  q: z.string().trim().max(LIMITS.searchMax, 'Search is too long').optional().transform((v) => v || undefined),
  status: z.union([z.enum(BOOKING_STATUSES), z.literal('')]).optional().transform((v) => v || undefined),
  paymentStatus: z.union([z.enum(PAYMENT_STATUSES), z.literal('')]).optional().transform((v) => v || undefined),
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(25),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export const reportQuerySchema = z.object({
  date: z.string({ required_error: 'Date is required' }).refine(isRealDate, 'Invalid date'),
});
