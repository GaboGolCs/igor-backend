import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../../src/infrastructure/database/prisma.js';
import { api, bearer, createFamily, expectError, invalidToken } from '../helpers/fixtures.js';
import { closeConnections, resetDb } from '../helpers/db.js';

beforeAll(resetDb);
afterAll(closeConnections);

const getTips = (token: string) => api().get('/api/v1/tips').set(bearer(token));

describe('GET /api/v1/tips', () => {
  it('200 con lista vacía si no hay consejos', async () => {
    const { parent } = await createFamily();
    const res = await getTips(parent.token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('200 con los consejos { id, title, content }', async () => {
    await prisma.parentalTip.create({ data: { title: 'Rutinas', content: 'Horarios claros.' } });
    const { parent } = await createFamily();

    const res = await getTips(parent.token);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: expect.any(String), title: 'Rutinas', content: 'Horarios claros.' }]);
  });

  it('401 sin token o inválido; 403 para un niño', async () => {
    const { child } = await createFamily();
    expectError(await api().get('/api/v1/tips'), 401, 'TOKEN_MISSING');
    expectError(await getTips(invalidToken()), 401, 'TOKEN_INVALID');
    expectError(await getTips(child.token), 403, 'FORBIDDEN_ROLE');
  });
});
