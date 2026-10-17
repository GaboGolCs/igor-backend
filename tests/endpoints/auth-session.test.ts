import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// El correo se mockea para obtener el token de recuperación en el test de reset
const { sendPasswordResetEmail } = vi.hoisted(() => ({ sendPasswordResetEmail: vi.fn() }));
vi.mock('../../src/infrastructure/messaging/MailService.js', () => ({
  MailService: class {
    sendPasswordResetEmail = sendPasswordResetEmail;
  },
}));

import { prisma } from '../../src/infrastructure/database/prisma.js';
import { redisConnection } from '../../src/infrastructure/messaging/redisConnection.js';
import { api, bearer, createFamily, expectError, registerParent } from '../helpers/fixtures.js';
import { closeConnections, resetDb, resetRedis } from '../helpers/db.js';

beforeAll(async () => {
  await resetDb();
  await resetRedis();
});
afterAll(closeConnections);

const refresh = (refreshToken: unknown) => api().post('/api/v1/auth/refresh').send({ refreshToken });
const logout = (refreshToken: unknown) => api().post('/api/v1/auth/logout').send({ refreshToken });

describe('POST /api/v1/auth/refresh', () => {
  it('devuelve un par nuevo con la forma del login; el access token nuevo funciona', async () => {
    const { refreshToken, userId } = await registerParent();

    const res = await refresh(refreshToken);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: { id: userId, role: 'PARENT' },
    });
    expect(res.body.data.refreshToken).not.toBe(refreshToken);
    expect((await api().get('/api/v1/tips').set(bearer(res.body.data.accessToken))).status).toBe(200);
  });

  it('rota: el par nuevo sirve y el viejo no', async () => {
    const { refreshToken } = await registerParent();
    const first = await refresh(refreshToken);

    expect((await refresh(first.body.data.refreshToken)).status).toBe(200);
  });

  it('reutilizar un token ya usado responde REFRESH_TOKEN_REUSED y revoca también el nuevo', async () => {
    const { refreshToken } = await registerParent();
    const rotated = await refresh(refreshToken);

    expectError(await refresh(refreshToken), 401, 'REFRESH_TOKEN_REUSED');
    expectError(await refresh(rotated.body.data.refreshToken), 401, 'REFRESH_TOKEN_INVALID');
  });

  it('con dos refresh simultáneos del mismo token, solo uno gana', async () => {
    const { refreshToken } = await registerParent();

    const results = await Promise.all([refresh(refreshToken), refresh(refreshToken)]);

    expect(results.map((r) => r.status).sort()).toEqual([200, 401]);
  });

  it('401 REFRESH_TOKEN_INVALID con un token inexistente', async () => {
    expectError(await refresh('no-existe'), 401, 'REFRESH_TOKEN_INVALID');
  });

  it('401 SESSION_USER_NOT_FOUND si el usuario fue eliminado', async () => {
    const { child } = await createFamily();
    await prisma.user.delete({ where: { id: child.userId } });

    expectError(await refresh(child.refreshToken), 401, 'SESSION_USER_NOT_FOUND');
  });

  it('el rol se lee desde la BD (niño sigue siendo CHILD)', async () => {
    const { child } = await createFamily();
    const res = await refresh(child.refreshToken);

    expect(res.status).toBe(200);
    expect(res.body.data.user).toEqual({ id: child.userId, role: 'CHILD' });
  });

  it('en Redis solo se guarda el hash, nunca el token en claro', async () => {
    const { refreshToken } = await registerParent();
    const keys = await redisConnection.keys('igor:refresh:*');

    expect(keys.length).toBeGreaterThan(0);
    expect(keys.some((key) => key.includes(refreshToken))).toBe(false);
  });

  it('400 VALIDATION_ERROR sin refreshToken', async () => {
    expectError(await api().post('/api/v1/auth/refresh').send({}), 400, 'VALIDATION_ERROR');
  });
});

describe('POST /api/v1/auth/logout', () => {
  it('204 y el refresh token deja de servir', async () => {
    const { refreshToken } = await registerParent();

    const res = await logout(refreshToken);
    expect(res.status).toBe(204);

    expectError(await refresh(refreshToken), 401, 'REFRESH_TOKEN_INVALID');
  });

  it('204 también con un token inexistente (idempotente)', async () => {
    expect((await logout('no-existe')).status).toBe(204);
  });

  it('cerrar una sesión no afecta a las otras del mismo usuario', async () => {
    const { payload, refreshToken } = await registerParent();
    const otherDevice = await api().post('/api/v1/auth/login').send({ identifier: payload.parentEmail, secret: payload.password });

    await logout(refreshToken);

    expect((await refresh(otherDevice.body.data.refreshToken)).status).toBe(200);
  });
});

describe('Revocación al cambiar credenciales', () => {
  it('reset-password cierra todas las sesiones del apoderado', async () => {
    const { payload, refreshToken } = await registerParent();
    sendPasswordResetEmail.mockClear();
    await api().post('/api/v1/auth/forgot-password').send({ email: payload.parentEmail });
    const resetToken = sendPasswordResetEmail.mock.calls[0][1] as string;

    await api().post('/api/v1/auth/reset-password').send({ token: resetToken, newPassword: 'nueva1234' });

    expectError(await refresh(refreshToken), 401, 'REFRESH_TOKEN_INVALID');
  });

  it('cambiar el PIN cierra las sesiones del niño, pero no las del apoderado', async () => {
    const { parent, child } = await createFamily();

    await api()
      .patch(`/api/v1/family/children/${child.userId}/pin`)
      .set(bearer(parent.token))
      .send({ newPin: '4321' });

    expectError(await refresh(child.refreshToken), 401, 'REFRESH_TOKEN_INVALID');
    expect((await refresh(parent.refreshToken)).status).toBe(200);
  });
});
