import { env } from './config/env.js';
import { app } from './app.js';
import { prisma } from './lib/prisma.js';

const onListen = () => console.log(`CleaningOS API listening on http://${env.HOST || 'localhost'}:${env.PORT}/api`);
const server = env.HOST ? app.listen(env.PORT, env.HOST, onListen) : app.listen(env.PORT, onListen);

const shutdown = async () => {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
