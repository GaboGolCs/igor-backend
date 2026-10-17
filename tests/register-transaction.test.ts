import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../src/infrastructure/database/prisma.js';
import { api, parentPayload } from './helpers/fixtures.js';
import { closeConnections, resetDb } from './helpers/db.js';

beforeAll(resetDb);
afterAll(closeConnections);

describe('Registro de familia + padre (transacción)', () => {
  it('no deja una familia huérfana si falla la inserción del usuario', async () => {
    const familiesBefore = await prisma.family.count();

    // avatar_icon es VarChar(100) en la BD y Zod no lo limita: el INSERT del usuario falla
    const res = await api()
      .post('/api/v1/auth/register-parent')
      .send(parentPayload({ avatar_icon: 'x'.repeat(101) }));

    expect(res.status).toBe(400);
    expect(await prisma.family.count()).toBe(familiesBefore);
  });
});
