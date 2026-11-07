import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || '';
  const name = process.env.SEED_ADMIN_NAME || 'Admin';
  if (!email || password.length < 8) {
    throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (min 8 chars) in server/.env');
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin ${email} already exists — skipped.`);
  } else {
    await prisma.adminUser.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 12) } });
    console.log(`Created admin ${email}`);
  }

  // Production: set SEED_DEMO_STAFF=false so the live database starts with no fake staff.
  if (process.env.SEED_DEMO_STAFF !== 'false' && (await prisma.staff.count()) === 0) {
    await prisma.staff.createMany({
      data: [
        { name: 'Nimal', role: 'CLEANER' },
        { name: 'Kamal', role: 'CLEANER' },
        { name: 'Ayesha', role: 'CLEANER' },
        { name: 'Fathima', role: 'CLEANER' },
        { name: 'Ruwan', role: 'CLEANER' },
        { name: 'Sameer', role: 'DRIVER' },
      ],
    });
    console.log('Created demo staff (rename or remove them from the Staff page).');
  }
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
