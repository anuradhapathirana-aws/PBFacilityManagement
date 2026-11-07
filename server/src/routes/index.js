import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginSchema, staffSchema, staffQuerySchema, bookingSchema, bookingQuerySchema, paginationQuerySchema, reportQuerySchema, idParam } from '@cleaningos/shared';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler as h } from '../utils/httpError.js';
import * as auth from '../controllers/auth.controller.js';
import * as staff from '../controllers/staff.controller.js';
import * as booking from '../controllers/booking.controller.js';
import * as report from '../controllers/report.controller.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { message: 'Too many login attempts. Try again in 15 minutes.', code: 'RATE_LIMITED' } },
});

export const api = Router();

// Public
api.get('/health', (_req, res) => res.json({ ok: true }));
api.post('/auth/login', loginLimiter, validate({ body: loginSchema }), h(auth.login));

// Everything below requires an admin token
api.use(requireAuth);
api.get('/auth/me', h(auth.me));

api.get('/dashboard', h(report.dashboard));

api.get('/staff', validate({ query: staffQuerySchema }), h(staff.list));
api.post('/staff', validate({ body: staffSchema }), h(staff.create));
api.get('/staff/:id', validate({ params: idParam }), h(staff.get));
api.put('/staff/:id', validate({ params: idParam, body: staffSchema }), h(staff.update));
api.delete('/staff/:id', validate({ params: idParam }), h(staff.remove));
api.get('/staff/:id/bookings', validate({ params: idParam, query: paginationQuerySchema }), h(staff.bookings));

api.get('/bookings', validate({ query: bookingQuerySchema }), h(booking.list));
api.post('/bookings', validate({ body: bookingSchema }), h(booking.create));
api.get('/bookings/:id', validate({ params: idParam }), h(booking.get));
api.put('/bookings/:id', validate({ params: idParam, body: bookingSchema }), h(booking.update));
api.delete('/bookings/:id', validate({ params: idParam }), h(booking.remove));

api.get('/reports/daily', validate({ query: reportQuerySchema }), h(report.daily));
api.get('/reports/daily.csv', validate({ query: reportQuerySchema }), h(report.dailyCsv));
