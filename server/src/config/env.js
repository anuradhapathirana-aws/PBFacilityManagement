import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  // Production behind Nginx: HOST=127.0.0.1 so the port is not reachable from the internet.
  // Unset = all interfaces (dev default).
  HOST: z.string().optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  // Business timezone offset in minutes. UAE = +240, no DST.
  TZ_OFFSET_MINUTES: z.coerce.number().int().default(240),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid server environment:');
  for (const i of parsed.error.issues) console.error(`  ${i.path.join('.')}: ${i.message}`);
  console.error('Copy server/.env.example to server/.env and fill it in.');
  process.exit(1);
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CLIENT_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean),
};
