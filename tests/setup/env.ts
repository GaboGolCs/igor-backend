import dotenv from 'dotenv';

// Corre antes de importar cada archivo de test: prisma.ts y redisConnection.ts
// leen estas variables (dotenv/config no pisa las que ya están definidas).
dotenv.config({ path: '.env.test', override: true, quiet: true });
