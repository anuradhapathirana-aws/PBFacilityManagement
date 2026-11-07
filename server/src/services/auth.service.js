import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

// Compared against when the email does not exist, so response time doesn't reveal valid emails.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

export async function login({ email, password }) {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, admin?.passwordHash || DUMMY_HASH);
  if (!admin || !ok) throw new HttpError(401, 'Invalid email or password', { code: 'INVALID_CREDENTIALS' });

  const token = jwt.sign({ sub: String(admin.id) }, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: env.JWT_EXPIRES_IN });
  return { token, admin: { id: admin.id, name: admin.name, email: admin.email } };
}
