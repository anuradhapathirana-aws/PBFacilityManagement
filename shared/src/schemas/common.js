import { z } from 'zod';
import { LIMITS } from '../constants.js';

// Letters (any language), spaces, dot, hyphen, apostrophe.
export const PERSON_NAME_RE = /^[\p{L}][\p{L} .'-]*$/u;
// Optional leading +, then digits/spaces, 7–20 chars total.
export const PHONE_RE = /^\+?[0-9 ]{7,20}$/;
export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export const personName = (label = 'Name') =>
  z
    .string({ required_error: `${label} is required`, invalid_type_error: `${label} is required` })
    .trim()
    .min(LIMITS.nameMin, `${label} must be at least ${LIMITS.nameMin} characters`)
    .max(LIMITS.nameMax, `${label} must be at most ${LIMITS.nameMax} characters`)
    .regex(PERSON_NAME_RE, `${label} may only contain letters, spaces, . - '`);

export const phoneRequired = z
  .string({ required_error: 'Phone is required', invalid_type_error: 'Phone is required' })
  .trim()
  .min(1, 'Phone is required')
  .regex(PHONE_RE, 'Phone must be 7–20 digits, optional leading +');

// Empty string → null so forms can submit blank optional phone.
export const phoneOptional = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => (typeof v === 'string' ? v.trim() : ''))
  .refine((v) => v === '' || PHONE_RE.test(v), 'Phone must be 7–20 digits, optional leading +')
  .transform((v) => (v === '' ? null : v));

export const optionalText = (max, label) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (typeof v === 'string' ? v.trim() : ''))
    .refine((v) => v.length <= max, `${label} must be at most ${max} characters`)
    .transform((v) => (v === '' ? null : v));

export const isRealDate = (s) => {
  if (!DATE_RE.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
};

export const dateString = z
  .string({ required_error: 'Date is required' })
  .trim()
  .refine(isRealDate, 'Enter a valid date (YYYY-MM-DD)');

export const timeString = z
  .string({ required_error: 'Time is required' })
  .trim()
  .regex(TIME_RE, 'Enter a valid time (HH:mm)');

// Accepts numbers or numeric strings from form inputs.
export const numberFrom = (label) =>
  z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : typeof v === 'string' ? Number(v) : v),
    z.number({ required_error: `${label} is required`, invalid_type_error: `${label} must be a number` }).finite(`${label} must be a number`)
  );

export const idParam = z.object({
  id: z.coerce.number({ invalid_type_error: 'Invalid id' }).int('Invalid id').positive('Invalid id'),
});
