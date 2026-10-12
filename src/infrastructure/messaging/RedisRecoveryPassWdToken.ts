// src/infrastructure/messaging/redis-recovery-token.repository.ts

import { Redis } from 'ioredis';
import { RecoveryPassWdRepoContract } from '../../domain/repoContracts/RecoveryTokenRepoContract.js';
// Importamos tu conexión ya configurada
import { redisConnection } from './redisConnection.js'; 

export class RedisRecoveryTokenRepository implements RecoveryPassWdRepoContract {
  // Definimos el namespace para evitar colisiones en la base de datos Redis
  private readonly PREFIX = 'igor:passwdRecoveryToken:';
  
  // Inyectamos la dependencia de ioredis. Por defecto toma tu conexión global.
  constructor(private readonly redisClient: Redis = redisConnection) {}

  async save(token: string, userId: string, ttlSeconds: number): Promise<void> {
    const key = `${this.PREFIX}${token}`;
    
    // El comando SET con la opción 'EX' maneja la expiración a nivel de motor de Redis,
    // garantizando que la memoria se libere automáticamente.
    await this.redisClient.set(key, userId, 'EX', ttlSeconds);
    console.log(`[RedisCache] Token de recuperación guardado para usuario ${userId}`);
  }

  async verify(token: string): Promise<string | null> {
    const key = `${this.PREFIX}${token}`;
    return await this.redisClient.get(key);
  }

  async delete(token: string): Promise<void> {
    const key = `${this.PREFIX}${token}`;
    await this.redisClient.del(key);
    console.log(`[RedisCache] Token de recuperación eliminado de la memoria.`);
  }
}