import { prisma } from '../../src/infrastructure/database/prisma.js';
import { redisConnection } from '../../src/infrastructure/messaging/redisConnection.js';

// Todas las tablas de la app (la BD igor_test no tiene seeds; cada test crea lo que necesita)
const TABLES = [
  'reward_claims',
  'daily_reminders',
  'calendar_events',
  'mood_logs',
  'push_tokens',
  'users',
  'families',
  'trivia_questions',
  'parental_tips',
];

export async function resetDb() {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`);
}

export async function resetRedis() {
  await redisConnection.flushdb();
}

export async function closeConnections() {
  await prisma.$disconnect();
  await redisConnection.quit();
}
