import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { prisma } from '../../src/infrastructure/database/prisma.js';
import { api, bearer, createFamily, expectError, ghostToken, invalidToken, seedTrivia } from '../helpers/fixtures.js';
import { closeConnections, resetDb } from '../helpers/db.js';

beforeAll(resetDb);
afterAll(closeConnections);

const randomQuestion = (token: string) => api().get('/api/v1/games/questions/random').set(bearer(token));

const claim = (token: string, rewardTitle: unknown = 'Helado de chocolate') =>
  api().post('/api/v1/games/rewards/claims').set(bearer(token)).send({ rewardTitle });

const patchStatus = (token: string, rewardId: string, status: unknown) =>
  api().patch(`/api/v1/games/rewards/${rewardId}/status`).set(bearer(token)).send({ status });

describe('GET /api/v1/games/questions/random', () => {
  it('404 NO_QUESTIONS si no hay preguntas cargadas', async () => {
    const { child } = await createFamily();
    expectError(await randomQuestion(child.token), 404, 'NO_QUESTIONS');
  });

  it('200 con una pregunta sin la respuesta correcta', async () => {
    await seedTrivia();
    const { child } = await createFamily();
    const res = await randomQuestion(child.token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: expect.any(String), questionText: expect.any(String), options: ['A', 'B', 'C'] });
  });

  it('401 sin token o inválido; 403 para un apoderado', async () => {
    const { parent } = await createFamily();
    expectError(await api().get('/api/v1/games/questions/random'), 401, 'TOKEN_MISSING');
    expectError(await randomQuestion(invalidToken()), 401, 'TOKEN_INVALID');
    expectError(await randomQuestion(parent.token), 403, 'FORBIDDEN_ROLE');
  });
});

describe('POST /api/v1/games/rewards/claims', () => {
  it('201 con la recompensa en estado PENDING', async () => {
    const { child } = await createFamily();
    const res = await claim(child.token);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: expect.any(String), rewardTitle: 'Helado de chocolate', status: 'PENDING' });
  });

  it('400 VALIDATION_ERROR con título muy corto', async () => {
    const { child } = await createFamily();
    expectError(await claim(child.token, 'ab'), 400, 'VALIDATION_ERROR');
  });

  it('401 (no 500) sin token, con token inválido o de un niño inexistente', async () => {
    expectError(await api().post('/api/v1/games/rewards/claims').send({ rewardTitle: 'Helado' }), 401, 'TOKEN_MISSING');
    expectError(await claim(invalidToken()), 401, 'TOKEN_INVALID');
    expectError(await claim(ghostToken('CHILD')), 401, 'SESSION_USER_NOT_FOUND');
  });

  it('403 (no 500) para un apoderado', async () => {
    const { parent } = await createFamily();
    expectError(await claim(parent.token), 403, 'FORBIDDEN_ROLE');
  });
});

describe('PATCH /api/v1/games/rewards/:rewardId/status', () => {
  it('200 al aceptar y 409 REWARD_ALREADY_PROCESSED al repetir', async () => {
    const { parent, child } = await createFamily();
    const { body: reward } = await claim(child.token);

    const res = await patchStatus(parent.token, reward.id, 'ACCEPTED');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: reward.id, rewardTitle: reward.rewardTitle, status: 'ACCEPTED' });

    expectError(await patchStatus(parent.token, reward.id, 'REJECTED'), 409, 'REWARD_ALREADY_PROCESSED');
  });

  it('solo una de dos peticiones simultáneas gana', async () => {
    const { parent, child } = await createFamily();
    const { body: reward } = await claim(child.token);

    const results = await Promise.all([
      patchStatus(parent.token, reward.id, 'ACCEPTED'),
      patchStatus(parent.token, reward.id, 'REJECTED'),
    ]);

    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
  });

  it('404 REWARD_NOT_FOUND para una recompensa de otra familia, sin revelar su estado', async () => {
    const { parent } = await createFamily();
    const other = await createFamily();
    const { body: pending } = await claim(other.child.token);
    const { body: accepted } = await claim(other.child.token);
    await patchStatus(other.parent.token, accepted.id, 'ACCEPTED');

    const resPending = await patchStatus(parent.token, pending.id, 'ACCEPTED');
    const resAccepted = await patchStatus(parent.token, accepted.id, 'ACCEPTED');

    expectError(resPending, 404, 'REWARD_NOT_FOUND');
    expectError(resAccepted, 404, 'REWARD_NOT_FOUND');
    expect(resPending.body).toEqual(resAccepted.body);
    expect((await prisma.rewardClaim.findUniqueOrThrow({ where: { id: pending.id } })).status).toBe('PENDING');
  });

  it('404 REWARD_NOT_FOUND para un id inexistente', async () => {
    const { parent } = await createFamily();
    expectError(await patchStatus(parent.token, randomUUID(), 'ACCEPTED'), 404, 'REWARD_NOT_FOUND');
  });

  it('400 VALIDATION_ERROR con id no uuid o estado PENDING', async () => {
    const { parent, child } = await createFamily();
    const { body: reward } = await claim(child.token);
    expectError(await patchStatus(parent.token, 'abc', 'ACCEPTED'), 400, 'VALIDATION_ERROR');
    expectError(await patchStatus(parent.token, reward.id, 'PENDING'), 400, 'VALIDATION_ERROR');
  });

  it('401 sin token y 403 (una sola respuesta) para un niño', async () => {
    const { child } = await createFamily();
    const { body: reward } = await claim(child.token);
    expectError(await api().patch(`/api/v1/games/rewards/${reward.id}/status`).send({ status: 'ACCEPTED' }), 401, 'TOKEN_MISSING');
    expectError(await patchStatus(child.token, reward.id, 'ACCEPTED'), 403, 'FORBIDDEN_ROLE');
  });
});
