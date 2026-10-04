// src/infrastructure/messaging/redisConnection.ts
import { Redis } from 'ioredis'; // Solución 1: Importación nombrada

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisConnection.on('connect', () => {
  console.log('[Redis] Conexión establecida con éxito.');
});

// Solución 2: Tipamos explícitamente '(error: Error)'
redisConnection.on('error', (error: Error) => { 
  console.error('[Redis] Error de conexión:', error.message);
});