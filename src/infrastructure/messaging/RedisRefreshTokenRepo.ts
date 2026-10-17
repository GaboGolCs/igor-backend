import crypto from 'crypto';
import { Redis } from 'ioredis';
import { RefreshTokenRepoContract, StoredRefreshToken } from '../../domain/repoContracts/RefreshTokenRepoContract.js';
import { env } from '../config/env.js';
import { redisConnection } from './redisConnection.js';

// En Redis solo se guarda el SHA-256 del token: si se filtra la base, los tokens no sirven
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const CONSUME_SCRIPT = `
local value = redis.call('GET', KEYS[1])
if not value then return false end
local stored = cjson.decode(value)
if not stored.used then
  stored.used = true
  redis.call('SET', KEYS[1], cjson.encode(stored), 'KEEPTTL')
end
return value
`;

export class RedisRefreshTokenRepository implements RefreshTokenRepoContract {
  private readonly PREFIX = 'igor:refresh:';
  private readonly USER_PREFIX = 'igor:refresh:user:';

  constructor(private readonly redisClient: Redis = redisConnection) {}

  private get ttlSeconds() {
    return env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60;
  }

  async issue(userId: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('base64url');
    const hash = hashToken(token);
    const value: StoredRefreshToken = { userId, used: false };

    // El set por usuario permite revocar todas sus sesiones; se renueva su TTL con cada sesión nueva
    await this.redisClient
      .multi()
      .set(`${this.PREFIX}${hash}`, JSON.stringify(value), 'EX', this.ttlSeconds)
      .sadd(`${this.USER_PREFIX}${userId}`, hash)
      .expire(`${this.USER_PREFIX}${userId}`, this.ttlSeconds)
      .exec();

    return token;
  }

  async consume(token: string): Promise<StoredRefreshToken | null> {
    const key = `${this.PREFIX}${hashToken(token)}`;

    // Script atómico: devuelve el valor anterior y lo marca como usado (conservando userId y TTL).
    // Si dos peticiones usan el mismo token a la vez, solo la primera recibe used = false.
    const previous = await this.redisClient.eval(CONSUME_SCRIPT, 1, key) as string | null;
    return previous ? JSON.parse(previous) as StoredRefreshToken : null;
  }

  async revoke(token: string): Promise<void> {
    const hash = hashToken(token);
    const raw = await this.redisClient.get(`${this.PREFIX}${hash}`);
    await this.redisClient.del(`${this.PREFIX}${hash}`);
    if (raw) {
      const { userId } = JSON.parse(raw) as Partial<StoredRefreshToken>;
      if (userId) {
        await this.redisClient.srem(`${this.USER_PREFIX}${userId}`, hash);
      }
    }
  }

  async revokeAll(userId: string): Promise<void> {
    const userKey = `${this.USER_PREFIX}${userId}`;
    const hashes = await this.redisClient.smembers(userKey);
    const keys = [...hashes.map((hash) => `${this.PREFIX}${hash}`), userKey];
    await this.redisClient.del(...keys);
  }
}
