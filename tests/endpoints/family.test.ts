import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { prisma } from '../../src/infrastructure/database/prisma.js';
import {
  api, bearer, createFamily, expectError, ghostToken, invalidToken, registerParent, uniqueSuffix,
} from '../helpers/fixtures.js';
import { closeConnections, resetDb } from '../helpers/db.js';

beforeAll(resetDb);
afterAll(closeConnections);

const createChild = (token: string, body: Record<string, unknown>) =>
  api().post('/api/v1/family/children').set(bearer(token)).send(body);

const changePin = (token: string, childId: string, newPin: string) =>
  api().patch(`/api/v1/family/children/${childId}/pin`).set(bearer(token)).send({ newPin });

describe('POST /api/v1/family/children', () => {
  it('201 y el niño se guarda sin email', async () => {
    const { token, userId } = await registerParent();
    const alias = `hijo_${uniqueSuffix()}`;

    const res = await createChild(token, { alias, password: '1234' });

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({ id: expect.any(String), parentId: userId, alias, role: 'CHILD' });
    const saved = await prisma.user.findUniqueOrThrow({ where: { id: res.body.data.id } });
    expect(saved.email).toBeNull();
  });

  it('400 VALIDATION_ERROR si se intenta enviar un email para el niño', async () => {
    const { token } = await registerParent();
    const res = await createChild(token, { alias: `hijo_${uniqueSuffix()}`, password: '1234', email: 'nino@test.cl' });
    expectError(res, 400, 'VALIDATION_ERROR');
  });

  it('la BD rechaza un niño con email (CHECK users_child_without_email)', async () => {
    const { child } = await createFamily();
    await expect(
      prisma.user.update({ where: { id: child.userId }, data: { email: `nino_${uniqueSuffix()}@test.cl` } }),
    ).rejects.toThrow(/users_child_without_email/);
  });

  it.each([
    ['PIN de 3 dígitos', '123'],
    ['PIN con letras', '12a4'],
    ['PIN de 5 dígitos', '12345'],
  ])('400 VALIDATION_ERROR: %s', async (_case, password) => {
    const { token } = await registerParent();
    expectError(await createChild(token, { alias: `hijo_${uniqueSuffix()}`, password }), 400, 'VALIDATION_ERROR');
  });

  it('409 ALIAS_TAKEN con un alias ya usado', async () => {
    const { parent, child } = await createFamily();
    expectError(await createChild(parent.token, { alias: child.alias, password: '1234' }), 409, 'ALIAS_TAKEN');
  });

  it('401 TOKEN_MISSING sin token (antes que la validación del body)', async () => {
    const res = await api().post('/api/v1/family/children').send({});
    expectError(res, 401, 'TOKEN_MISSING');
  });

  it('401 TOKEN_INVALID con token inválido', async () => {
    expectError(await createChild(invalidToken(), { alias: `hijo_${uniqueSuffix()}`, password: '1234' }), 401, 'TOKEN_INVALID');
  });

  it('401 SESSION_USER_NOT_FOUND si el apoderado del token no existe', async () => {
    expectError(await createChild(ghostToken('PARENT'), { alias: `hijo_${uniqueSuffix()}`, password: '1234' }), 401, 'SESSION_USER_NOT_FOUND');
  });

  it('403 FORBIDDEN_ROLE para un niño', async () => {
    const { child } = await createFamily();
    expectError(await createChild(child.token, { alias: `hijo_${uniqueSuffix()}`, password: '1234' }), 403, 'FORBIDDEN_ROLE');
  });
});

describe('PATCH /api/v1/family/children/:childId/pin', () => {
  it('201 y el niño entra con el PIN nuevo', async () => {
    const { parent, child } = await createFamily();

    const res = await changePin(parent.token, child.userId, '4321');
    expect(res.status).toBe(201);

    const login = await api().post('/api/v1/auth/login').send({ identifier: child.alias, secret: '4321' });
    expect(login.status).toBe(200);
  });

  it('404 CHILD_NOT_FOUND para un niño de otra familia (y su PIN no cambia)', async () => {
    const { parent } = await createFamily();
    const other = await createFamily();

    expectError(await changePin(parent.token, other.child.userId, '4321'), 404, 'CHILD_NOT_FOUND');
    const login = await api().post('/api/v1/auth/login').send({ identifier: other.child.alias, secret: other.child.pin });
    expect(login.status).toBe(200);
  });

  it('404 CHILD_NOT_FOUND para un id inexistente o que no es un niño', async () => {
    const { parent } = await createFamily();
    expectError(await changePin(parent.token, randomUUID(), '4321'), 404, 'CHILD_NOT_FOUND');
    expectError(await changePin(parent.token, parent.userId, '4321'), 404, 'CHILD_NOT_FOUND');
  });

  it('400 VALIDATION_ERROR con childId que no es uuid o PIN inválido', async () => {
    const { parent, child } = await createFamily();
    expectError(await changePin(parent.token, 'no-uuid', '4321'), 400, 'VALIDATION_ERROR');
    expectError(await changePin(parent.token, child.userId, '12'), 400, 'VALIDATION_ERROR');
  });

  it('401 sin token o con token inválido', async () => {
    const { child } = await createFamily();
    expectError(await api().patch(`/api/v1/family/children/${child.userId}/pin`).send({ newPin: '4321' }), 401, 'TOKEN_MISSING');
    expectError(await changePin(invalidToken(), child.userId, '4321'), 401, 'TOKEN_INVALID');
  });

  it('403 FORBIDDEN_ROLE para un niño, con una sola respuesta', async () => {
    const { child } = await createFamily();
    expectError(await changePin(child.token, child.userId, '4321'), 403, 'FORBIDDEN_ROLE');
  });
});
