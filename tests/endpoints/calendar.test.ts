import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { api, bearer, createFamily, expectError, ghostToken, invalidToken } from '../helpers/fixtures.js';
import { closeConnections, resetDb } from '../helpers/db.js';

beforeAll(resetDb);
afterAll(closeConnections);

// Una fecha del próximo mes, para que siempre sea futura
const nextMonth = new Date();
nextMonth.setUTCDate(15);
nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
const query = { month: nextMonth.getUTCMonth() + 1, year: nextMonth.getUTCFullYear() };

const eventBody = (overrides: Record<string, unknown> = {}) => ({
  title: 'Reunión de apoderados',
  category: 'MEETING',
  eventDate: nextMonth.toISOString(),
  ...overrides,
});

const postEvent = (token: string, body: Record<string, unknown>) =>
  api().post('/api/v1/calendar/events').set(bearer(token)).send(body);

const getEvents = (token: string, q: Record<string, unknown> = query) =>
  api().get('/api/v1/calendar/events').set(bearer(token)).query(q);

describe('POST /api/v1/calendar/events', () => {
  it('201 asignado al niño de la familia', async () => {
    const { parent, child } = await createFamily();
    const res = await postEvent(parent.token, eventBody({ targeted_user_id: child.userId }));

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ targeted_user_id: child.userId, created_by: parent.userId, category: 'MEETING' });
  });

  it('201 sin targeted_user_id: se asigna al creador', async () => {
    const { parent } = await createFamily();
    const res = await postEvent(parent.token, eventBody());

    expect(res.status).toBe(201);
    expect(res.body.targeted_user_id).toBe(parent.userId);
  });

  it('404 USER_NOT_FOUND si el destinatario es de otra familia o no existe', async () => {
    const { parent } = await createFamily();
    const other = await createFamily();
    expectError(await postEvent(parent.token, eventBody({ targeted_user_id: other.child.userId })), 404, 'USER_NOT_FOUND');
    expectError(await postEvent(parent.token, eventBody({ targeted_user_id: randomUUID() })), 404, 'USER_NOT_FOUND');
  });

  it.each([
    ['fecha pasada', { eventDate: '2020-01-01T00:00:00.000Z' }],
    ['categoría inválida', { category: 'PARTY' }],
    ['título vacío', { title: '' }],
    ['targeted_user_id no uuid', { targeted_user_id: 'abc' }],
  ])('400 VALIDATION_ERROR: %s', async (_case, overrides) => {
    const { parent } = await createFamily();
    expectError(await postEvent(parent.token, eventBody(overrides)), 400, 'VALIDATION_ERROR');
  });

  it('401 sin token, con token inválido o de un usuario inexistente', async () => {
    expectError(await api().post('/api/v1/calendar/events').send(eventBody()), 401, 'TOKEN_MISSING');
    expectError(await postEvent(invalidToken(), eventBody()), 401, 'TOKEN_INVALID');
    expectError(await postEvent(ghostToken('PARENT'), eventBody()), 401, 'SESSION_USER_NOT_FOUND');
  });

  it('403 FORBIDDEN_ROLE para un niño', async () => {
    const { child } = await createFamily();
    expectError(await postEvent(child.token, eventBody()), 403, 'FORBIDDEN_ROLE');
  });
});

describe('GET /api/v1/calendar/events', () => {
  it('200 solo con los eventos de la propia familia, para padre e hijo', async () => {
    const { parent, child } = await createFamily();
    const other = await createFamily();
    await postEvent(parent.token, eventBody({ title: 'Propio' }));
    await postEvent(other.parent.token, eventBody({ title: 'Ajeno' }));

    for (const token of [parent.token, child.token]) {
      const res = await getEvents(token);
      expect(res.status).toBe(200);
      expect(res.body.map((e: { title: string }) => e.title)).toEqual(['Propio']);
    }
  });

  it('400 VALIDATION_ERROR sin mes o con año fuera de rango', async () => {
    const { parent } = await createFamily();
    expectError(await getEvents(parent.token, { year: 2026 }), 400, 'VALIDATION_ERROR');
    expectError(await getEvents(parent.token, { month: 1, year: 1999 }), 400, 'VALIDATION_ERROR');
  });

  it('401 sin token o con un usuario inexistente', async () => {
    expectError(await api().get('/api/v1/calendar/events').query(query), 401, 'TOKEN_MISSING');
    expectError(await getEvents(ghostToken('CHILD')), 401, 'SESSION_USER_NOT_FOUND');
  });
});
