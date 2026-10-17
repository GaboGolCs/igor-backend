import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { app } from '../../src/presentation/http/app.js';

export const api = () => request(app);

export const uniqueSuffix = () => randomUUID().slice(0, 8);

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
  const res = await api()
    .post('/api/v1/family/children')
    .set('Authorization', `Bearer ${parentToken}`)
    .send({ alias: `hijo_${uniqueSuffix()}`, password: '1234' });
  if (res.status !== 201) {
    throw new Error(`registerChild falló (${res.status}): ${JSON.stringify(res.body)}`);
  }
  return { userId: res.body.data.id as string };
}
