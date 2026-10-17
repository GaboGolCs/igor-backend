import { execSync } from 'node:child_process';
import dotenv from 'dotenv';
import pg from 'pg';
import { Redis } from 'ioredis';

// Crea la BD de prueba (si no existe) y aplica las migraciones antes de toda la suite
export default async function setup() {
  const env = dotenv.config({ path: '.env.test', processEnv: {}, quiet: true }).parsed ?? {};
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL no está definida en .env.test');

  const url = new URL(databaseUrl);
  const dbName = url.pathname.slice(1);
  url.pathname = '/postgres';

  const client = new pg.Client({ connectionString: url.toString() });
  await client.connect();
  const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
  if (!rowCount) {
    await client.query(`CREATE DATABASE "${dbName}"`);
  }
  await client.end();

  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });

  // Los contadores del rate limit viven en Redis (ventana de 15 min): se vacían al empezar cada corrida
  // para que dos corridas seguidas no acumulen intentos y terminen en 429
  if (!env.REDIS_URL) throw new Error('REDIS_URL no está definida en .env.test');
  const redis = new Redis(env.REDIS_URL, { lazyConnect: true });
  await redis.connect();
  await redis.flushdb();
  await redis.quit();
}
