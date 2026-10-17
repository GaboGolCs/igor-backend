import { prisma } from '../../src/infrastructure/database/prisma.js';
import { redisConnection } from '../../src/infrastructure/messaging/redisConnection.js';

// Tablas que escriben los tests (trivia_questions y parental_tips son datos de seed)
const TABLES = [
  'reward_claims',
  'daily_reminders',
  'calendar_events',
  'mood_logs',
  'push_tokens',
  'users',
  'families',
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
