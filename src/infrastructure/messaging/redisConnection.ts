// src/infrastructure/messaging/redisConnection.ts
import { Redis } from 'ioredis';
import { env } from '../config/env.js';

const REDIS_URL = env.REDIS_URL;

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