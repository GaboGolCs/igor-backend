import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

// El límite se fija al importar la app: se baja a 3 y se recargan los módulos solo en este archivo
let app: Express;
let close: () => Promise<void>;

beforeAll(async () => {
  vi.stubEnv('AUTH_RATE_LIMIT_MAX', '3');
  vi.resetModules();
  ({ app } = await import('../src/presentation/http/app.js'));
  ({ closeConnections: close } = await import('./helpers/db.js'));
});

afterAll(async () => {
  await close();
  vi.unstubAllEnvs();
});

describe('Rate limit de autenticación', () => {
  it('429 RATE_LIMITED después de superar el máximo de intentos de login', async () => {
    const attempt = () => request(app).post('/api/v1/auth/login').send({ identifier: 'nadie_rl', secret: '1234' });

    for (let i = 0; i < 3; i++) {
      expect((await attempt()).status).toBe(401);
    }

    const blocked = await attempt();
    expect(blocked.status).toBe(429);
    expect(blocked.body).toMatchObject({ code: 'RATE_LIMITED' });
  });

  it('no limita rutas fuera de auth', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
