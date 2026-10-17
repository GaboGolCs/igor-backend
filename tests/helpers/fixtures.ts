import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { expect } from 'vitest';
import { app } from '../../src/presentation/http/app.js';
import { prisma } from '../../src/infrastructure/database/prisma.js';

export const api = () => request(app);

export const uniqueSuffix = () => randomUUID().slice(0, 8);

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

// Token bien formado pero firmado con otro secreto: debe responder 401 TOKEN_INVALID
export const invalidToken = () => jwt.sign({ sub: randomUUID(), role: 'PARENT' }, 'otro-secreto');

// Token válido de un usuario que no existe en la BD: debe responder 401 SESSION_USER_NOT_FOUND
export const ghostToken = (role: 'PARENT' | 'CHILD') =>
  jwt.sign({ sub: randomUUID(), role }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

// Comprueba el formato único de error { message, code }
export function expectError(res: request.Response, status: number, code: string) {
  expect(res.status, JSON.stringify(res.body)).toBe(status);
  expect(res.body).toMatchObject({ code, message: expect.any(String) });
}

export function parentPayload(overrides: Record<string, unknown> = {}) {
  const suffix = uniqueSuffix();
  return {
    familyName: `Familia ${suffix}`,
    parentEmail: `padre_${suffix}@test.cl`,
    password: 'clave1234',
    alias: `padre_${suffix}`,
    timezone: 'America/Santiago',
    ...overrides,
  };
}

export async function registerParent(overrides: Record<string, unknown> = {}) {
  const payload = parentPayload(overrides);
  const res = await api().post('/api/v1/auth/register-parent').send(payload);
  if (res.status !== 201) {
    throw new Error(`registerParent falló (${res.status}): ${JSON.stringify(res.body)}`);
  }
  return {
    payload,
    token: res.body.data.accessToken as string,
    userId: res.body.data.user.id as string,
  };
}

export async function registerChild(parentToken: string) {
  const alias = `hijo_${uniqueSuffix()}`;
  const pin = '1234';
  const res = await api()
    .post('/api/v1/family/children')
    .set(bearer(parentToken))
    .send({ alias, password: pin });
  if (res.status !== 201) {
    throw new Error(`registerChild falló (${res.status}): ${JSON.stringify(res.body)}`);
  }

  const login = await api().post('/api/v1/auth/login').send({ identifier: alias, secret: pin });
  if (login.status !== 200) {
    throw new Error(`login del niño falló (${login.status}): ${JSON.stringify(login.body)}`);
  }

  return { userId: res.body.data.id as string, alias, pin, token: login.body.data.accessToken as string };
}

// Familia completa: apoderado + un niño, con sus tokens
export async function createFamily() {
  const parent = await registerParent();
  const child = await registerChild(parent.token);
  return { parent, child };
}

export async function seedTrivia(count = 3) {
  await prisma.triviaQuestion.createMany({
    data: Array.from({ length: count }, (_, i) => ({
      category: 'GENERAL',
      question_text: `Pregunta de prueba ${i + 1}`,
      options_json: ['A', 'B', 'C'],
      correct_option: 0,
    })),
  });
}
