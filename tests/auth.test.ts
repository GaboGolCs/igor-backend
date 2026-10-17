import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import { prisma } from '../src/infrastructure/database/prisma.js';
import { api, parentPayload, registerParent, uniqueSuffix } from './helpers/fixtures.js';
import { closeConnections, resetDb } from './helpers/db.js';

beforeAll(resetDb);
afterAll(closeConnections);

describe('POST /api/v1/auth/register-parent', () => {
  it('responde 201 con la forma AuthResponse del contrato', async () => {
    const res = await api().post('/api/v1/auth/register-parent').send(parentPayload());

    expect(res.status).toBe(201);
    expect(res.body.data).toEqual({
      accessToken: expect.any(String),
      user: { id: expect.any(String), role: 'PARENT' },
    });
  });

  it('rechaza con 400 un email ya registrado', async () => {
    const { payload } = await registerParent();

    const res = await api()
      .post('/api/v1/auth/register-parent')
      .send(parentPayload({ parentEmail: payload.parentEmail, alias: `otro_${uniqueSuffix()}` }));

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Email ya registrado');
  });
});

describe('POST /api/v1/auth/login (padre)', () => {
  it('emite un token cuyo sub es el id real del usuario', async () => {
    const { payload, userId } = await registerParent();

    const res = await api()
      .post('/api/v1/auth/login')
      .send({ identifier: payload.parentEmail, secret: payload.password });

    expect(res.status).toBe(200);
    expect(res.body.data.user).toEqual({ id: userId, role: 'PARENT' });

    const decoded = jwt.decode(res.body.data.accessToken) as jwt.JwtPayload;
    expect(decoded.sub).toBe(userId);
    expect(await prisma.user.findUnique({ where: { id: decoded.sub } })).not.toBeNull();
  });
});
