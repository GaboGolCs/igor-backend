import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { prisma } from '../../src/infrastructure/database/prisma.js';
import { reminderQueue, ReminderMessageProducer } from '../../src/infrastructure/messaging/ReminderQueue.js';
import { api, bearer, createFamily, expectError, ghostToken, invalidToken } from '../helpers/fixtures.js';
import { closeConnections, resetDb, resetRedis } from '../helpers/db.js';

beforeAll(async () => {
  await resetDb();
  await resetRedis();
});
afterAll(async () => {
  await reminderQueue.close();
  await closeConnections();
});

const postReminder = (token: string, body: Record<string, unknown>) =>
  api().post('/api/v1/reminders').set(bearer(token)).send(body);

describe('POST /api/v1/reminders', () => {
  it('201 y programa el scheduler con el payload que espera el worker', async () => {
    const { parent, child } = await createFamily();
    const res = await postReminder(parent.token, { title: 'Lavarse los dientes', recurrenceTime: '08:30', childId: child.userId });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ targeted_user_id: child.userId, title: 'Lavarse los dientes', recurrence_time: '08:30' });

    const scheduler = await reminderQueue.getJobScheduler(res.body.id);
    expect(scheduler?.template?.data).toEqual({
      reminderId: res.body.id,
      targetUserId: child.userId,
      title: 'Lavarse los dientes',
    });
  });

  it('404 CHILD_NOT_FOUND para un niño de otra familia, inexistente o un apoderado', async () => {
    const { parent } = await createFamily();
    const other = await createFamily();
    const body = (childId: string) => ({ title: 'Tarea', recurrenceTime: '18:00', childId });

    expectError(await postReminder(parent.token, body(other.child.userId)), 404, 'CHILD_NOT_FOUND');
    expectError(await postReminder(parent.token, body(randomUUID())), 404, 'CHILD_NOT_FOUND');
    expectError(await postReminder(parent.token, body(parent.userId)), 404, 'CHILD_NOT_FOUND');
    expect(await prisma.dailyReminder.count({ where: { targeted_user_id: other.child.userId } })).toBe(0);
  });

  it('500 y no deja el recordatorio guardado si falla la programación en Redis', async () => {
    const { parent, child } = await createFamily();
    const spy = vi.spyOn(ReminderMessageProducer, 'scheduleDailyReminder').mockRejectedValueOnce(new Error('Redis caído'));

    const res = await postReminder(parent.token, { title: 'Dormir', recurrenceTime: '21:00', childId: child.userId });

    spy.mockRestore();
    expectError(res, 500, 'INTERNAL_ERROR');
    expect(await prisma.dailyReminder.count({ where: { targeted_user_id: child.userId } })).toBe(0);
  });

  it.each([
    ['hora con formato inválido', { recurrenceTime: '8:30' }],
    ['título de 1 carácter', { title: 'x' }],
    ['childId no uuid', { childId: 'abc' }],
  ])('400 VALIDATION_ERROR: %s', async (_case, overrides) => {
    const { parent, child } = await createFamily();
    const res = await postReminder(parent.token, { title: 'Tarea', recurrenceTime: '18:00', childId: child.userId, ...overrides });
    expectError(res, 400, 'VALIDATION_ERROR');
  });

  it('401 sin token, inválido o de usuario inexistente; 403 para un niño', async () => {
    const { child } = await createFamily();
    const body = { title: 'Tarea', recurrenceTime: '18:00', childId: child.userId };
    expectError(await api().post('/api/v1/reminders').send(body), 401, 'TOKEN_MISSING');
    expectError(await postReminder(invalidToken(), body), 401, 'TOKEN_INVALID');
    expectError(await postReminder(ghostToken('PARENT'), body), 401, 'SESSION_USER_NOT_FOUND');
    expectError(await postReminder(child.token, body), 403, 'FORBIDDEN_ROLE');
  });
});
