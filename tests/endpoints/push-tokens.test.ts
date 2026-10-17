import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../../src/infrastructure/database/prisma.js';
import { api, bearer, createFamily, expectError, ghostToken, invalidToken, uniqueSuffix } from '../helpers/fixtures.js';
import { closeConnections, resetDb } from '../helpers/db.js';

beforeAll(resetDb);
afterAll(closeConnections);

const postToken = (token: string, body: Record<string, unknown>) =>
  api().post('/api/v1/push-tokens').set(bearer(token)).send(body);

describe('POST /api/v1/push-tokens', () => {
  it('200 para apoderado y niño; el token queda asociado al usuario', async () => {
    const { parent, child } = await createFamily();

    for (const user of [parent, child]) {
      const fcmToken = `fcm_${uniqueSuffix()}`;
      const res = await postToken(user.token, { token: fcmToken, deviceType: 'ANDROID' });
      expect(res.status).toBe(200);
      const saved = await prisma.pushToken.findUniqueOrThrow({ where: { token: fcmToken } });
      expect(saved.user_id).toBe(user.userId);
    }
  });

  it('el mismo dispositivo pasa al último usuario que inicia sesión en él', async () => {
    const { parent, child } = await createFamily();
    const fcmToken = `fcm_${uniqueSuffix()}`;
    await postToken(parent.token, { token: fcmToken, deviceType: 'IOS' });
    await postToken(child.token, { token: fcmToken, deviceType: 'IOS' });

    const saved = await prisma.pushToken.findUniqueOrThrow({ where: { token: fcmToken } });
    expect(saved.user_id).toBe(child.userId);
  });

  it.each([
    ['token de solo espacios', { token: '   ', deviceType: 'ANDROID' }],
    ['deviceType inválido', { token: 'abc', deviceType: 'NOKIA' }],
    ['sin token', { deviceType: 'WEB' }],
  ])('400 VALIDATION_ERROR: %s', async (_case, body) => {
    const { parent } = await createFamily();
    expectError(await postToken(parent.token, body), 400, 'VALIDATION_ERROR');
  });

  it('401 sin token, con token inválido o de usuario inexistente', async () => {
    const body = { token: `fcm_${uniqueSuffix()}`, deviceType: 'WEB' };
    expectError(await api().post('/api/v1/push-tokens').send(body), 401, 'TOKEN_MISSING');
    expectError(await postToken(invalidToken(), body), 401, 'TOKEN_INVALID');
    expectError(await postToken(ghostToken('CHILD'), body), 401, 'SESSION_USER_NOT_FOUND');
  });
});
