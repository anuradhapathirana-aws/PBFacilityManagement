import { z } from 'zod';
import { LIMITS } from '../constants.js';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .max(190, 'Email is too long')
    .email('Enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(LIMITS.passwordMin, `Password must be at least ${LIMITS.passwordMin} characters`)
    .max(LIMITS.passwordMax, `Password must be at most ${LIMITS.passwordMax} characters`),
});
