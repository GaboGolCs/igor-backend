import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { prisma } from '../../src/infrastructure/database/prisma.js';
import { api, bearer, createFamily, expectError, ghostToken, invalidToken } from '../helpers/fixtures.js';
import { closeConnections, resetDb } from '../helpers/db.js';

beforeAll(resetDb);
afterAll(closeConnections);

const postMood = (token: string, body: Record<string, unknown>) =>
  api().post('/api/v1/moods').set(bearer(token)).send(body);

const now = new Date();
const currentMonth = { month: now.getUTCMonth() + 1, year: now.getUTCFullYear() };

const analytics = (token: string, query: Record<string, unknown>) =>
  api().get('/api/v1/moods/analytics').set(bearer(token)).query(query);

describe('POST /api/v1/moods', () => {
  it('201 con needText', async () => {
    const { child } = await createFamily();
    const res = await postMood(child.token, { emotion: 'HAPPY', activityText: 'Jugué', needText: 'Nada' });
    expect(res.status).toBe(201);
  });

  it('201 sin needText (opcional) y se guarda como null', async () => {
    const { child } = await createFamily();
    const res = await postMood(child.token, { emotion: 'SAD', activityText: 'Llovió' });

    expect(res.status).toBe(201);
    const saved = await prisma.moodLog.findFirstOrThrow({ where: { user_id: child.userId } });
    expect(saved.need_text).toBeNull();
  });

  it('400 VALIDATION_ERROR con emoción inválida', async () => {
    const { child } = await createFamily();
    expectError(await postMood(child.token, { emotion: 'BORED', activityText: 'x' }), 400, 'VALIDATION_ERROR');
  });

  it('401 sin token o con token inválido', async () => {
    expectError(await api().post('/api/v1/moods').send({ emotion: 'HAPPY', activityText: 'x' }), 401, 'TOKEN_MISSING');
    expectError(await postMood(invalidToken(), { emotion: 'HAPPY', activityText: 'x' }), 401, 'TOKEN_INVALID');
  });

  it('403 FORBIDDEN_ROLE para un apoderado', async () => {
    const { parent } = await createFamily();
    expectError(await postMood(parent.token, { emotion: 'HAPPY', activityText: 'x' }), 403, 'FORBIDDEN_ROLE');
  });

  it('401 SESSION_USER_NOT_FOUND si el niño del token no existe', async () => {
    expectError(await postMood(ghostToken('CHILD'), { emotion: 'HAPPY', activityText: 'x' }), 401, 'SESSION_USER_NOT_FOUND');
  });
});

describe('GET /api/v1/moods/analytics', () => {
  it('200 con el conteo del mes del niño', async () => {
    const { parent, child } = await createFamily();
    await postMood(child.token, { emotion: 'HAPPY', activityText: 'a' });
    await postMood(child.token, { emotion: 'HAPPY', activityText: 'b' });
    await postMood(child.token, { emotion: 'ANGRY', activityText: 'c' });

    const res = await analytics(parent.token, { childId: child.userId, ...currentMonth });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalLogs: 3,
      emotionBreakdown: { HAPPY: 2, SAD: 0, ANXIOUS: 0, NEUTRAL: 0, ANGRY: 1 },
    });
  });

  it('404 CHILD_NOT_FOUND para un niño de otra familia (sin filtrar sus datos)', async () => {
    const { parent } = await createFamily();
    const other = await createFamily();
    await postMood(other.child.token, { emotion: 'SAD', activityText: 'x' });

    const res = await analytics(parent.token, { childId: other.child.userId, ...currentMonth });
    expectError(res, 404, 'CHILD_NOT_FOUND');
    expect(res.body.totalLogs).toBeUndefined();
  });

  it('404 CHILD_NOT_FOUND para un id inexistente o que no es niño', async () => {
    const { parent } = await createFamily();
    expectError(await analytics(parent.token, { childId: randomUUID(), ...currentMonth }), 404, 'CHILD_NOT_FOUND');
    expectError(await analytics(parent.token, { childId: parent.userId, ...currentMonth }), 404, 'CHILD_NOT_FOUND');
  });

  it.each([
    ['childId que no es uuid', { childId: 'abc', month: 1, year: 2026 }],
    ['mes 13', { childId: randomUUID(), month: 13, year: 2026 }],
    ['sin año', { childId: randomUUID(), month: 1 }],
  ])('400 VALIDATION_ERROR: %s', async (_case, query) => {
    const { parent } = await createFamily();
    expectError(await analytics(parent.token, query), 400, 'VALIDATION_ERROR');
  });

  it('401 sin token y 403 para un niño', async () => {
    const { child } = await createFamily();
    expectError(await api().get('/api/v1/moods/analytics').query({ childId: child.userId, ...currentMonth }), 401, 'TOKEN_MISSING');
    expectError(await analytics(child.token, { childId: child.userId, ...currentMonth }), 403, 'FORBIDDEN_ROLE');
  });
});
