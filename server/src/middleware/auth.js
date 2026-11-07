import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { HttpError, asyncHandler } from '../utils/httpError.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Please log in');

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    throw new HttpError(401, 'Session expired. Please log in again');
  }

  const admin = await prisma.adminUser.findUnique({
    where: { id: Number(payload.sub) },
    select: { id: true, name: true, email: true },
  });
  if (!admin) throw new HttpError(401, 'Account no longer exists');
  req.admin = admin;
  next();
});
