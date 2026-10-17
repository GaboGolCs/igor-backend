import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import type { Redis } from 'ioredis';

// El límite se fija al importar la app: se baja a 3 y se recargan los módulos solo en este archivo.
// Se cargan dos instancias de la app (cada una con su propia conexión a Redis) para simular dos réplicas.
interface Replica {
  app: Express;
  redis: Redis;
  close: () => Promise<void>;
}

async function loadReplica(): Promise<Replica> {
  vi.resetModules();
  const { app } = await import('../src/presentation/http/app.js');
  const { redisConnection: redis } = await import('../src/infrastructure/messaging/redisConnection.js');
  const { closeConnections: close } = await import('./helpers/db.js');
  return { app, redis, close };
}

let a: Replica;
let b: Replica;

const attempt = (app: Express) =>
  request(app).post('/api/v1/auth/login').send({ identifier: 'nadie_rl', secret: '1234' });

beforeAll(async () => {
  vi.stubEnv('AUTH_RATE_LIMIT_MAX', '3');
  a = await loadReplica();
  b = await loadReplica();
});

// Todas las peticiones salen de la misma IP: se vacían los contadores entre tests
beforeEach(async () => {
  await a.redis.flushdb();
});

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(async () => {
  await a.close();
  await b.close();
  vi.unstubAllEnvs();
});

describe('Rate limit de autenticación', () => {
  it('429 RATE_LIMITED después de superar el máximo de intentos de login', async () => {
    for (let i = 0; i < 3; i++) {
      expect((await attempt(a.app)).status).toBe(401);
    }

    const blocked = await attempt(a.app);
    expect(blocked.status).toBe(429);
    expect(blocked.body).toMatchObject({ code: 'RATE_LIMITED' });
  });

  it('el contador es compartido entre réplicas (store en Redis)', async () => {
    // a, b, a: ninguna réplica por sí sola llega al máximo (3)
    expect((await attempt(a.app)).status).toBe(401);
    expect((await attempt(b.app)).status).toBe(401);
    expect((await attempt(a.app)).status).toBe(401);

    // Cuarto intento en b (su segundo propio): bloqueado porque el contador es global
    const blocked = await attempt(b.app);
    expect(blocked.status).toBe(429);
    expect(blocked.body).toMatchObject({ code: 'RATE_LIMITED' });

    const keys = await a.redis.keys('igor:rl:auth:*');
    expect(keys.length).toBeGreaterThan(0);
  });

  it('si Redis falla, el login sigue respondiendo (sin límite) en lugar de 500', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(a.redis, 'call').mockRejectedValue(new Error('Redis caído'));

    // Más intentos que el máximo: ninguno es 429 ni 500
    for (let i = 0; i < 4; i++) {
      const res = await attempt(a.app);
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ code: 'INVALID_CREDENTIALS' });
    }
    expect(warn).toHaveBeenCalled();
  });

  it('no limita rutas fuera de auth', async () => {
    const res = await request(a.app).get('/health');
    expect(res.status).toBe(200);
  });
});
