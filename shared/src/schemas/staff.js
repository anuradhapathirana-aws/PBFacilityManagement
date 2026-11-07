import { z } from 'zod';
import { STAFF_ROLES } from '../constants.js';
import { personName, phoneOptional } from './common.js';

export const staffSchema = z.object({
  name: personName('Staff name'),
  phone: phoneOptional,
  role: z.enum(STAFF_ROLES, { errorMap: () => ({ message: 'Role must be Cleaner or Driver' }) }),
  active: z.boolean().optional().default(true),
});

export const staffQuerySchema = z.object({
  role: z.enum(STAFF_ROLES).optional(),
  active: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
});
