import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import { prisma } from '../../src/infrastructure/database/prisma.js';
import { reminderQueue, ReminderMessageProducer } from '../../src/infrastructure/messaging/ReminderQueue.js';
import { ReminderRepo } from '../../src/infrastructure/database/ReminderRepo.js';
import { api, bearer, createFamily, expectError, ghostToken, invalidToken, registerChild } from '../helpers/fixtures.js';
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

// Crea un recordatorio vía API y devuelve la fila creada
const createReminder = async (token: string, childId: string, overrides: Record<string, unknown> = {}) => {
  const res = await postReminder(token, { title: 'Tarea', recurrenceTime: '18:00', childId, ...overrides });
  expect(res.status).toBe(201);
  return res.body as { id: string; title: string; recurrence_time: string; is_active: boolean };
};

const getReminders = (token: string, query: Record<string, string> = {}) =>
  api().get('/api/v1/reminders').query(query).set(bearer(token));

const patchReminder = (token: string, id: string, body: Record<string, unknown>) =>
  api().patch(`/api/v1/reminders/${id}`).set(bearer(token)).send(body);

const deleteReminder = (token: string, id: string) =>
  api().delete(`/api/v1/reminders/${id}`).set(bearer(token));

describe('GET /api/v1/reminders', () => {
  it('200: el apoderado ve solo los de su familia, ordenados por hora', async () => {
    const { parent, child } = await createFamily();
    const other = await createFamily();
    const late = await createReminder(parent.token, child.userId, { recurrenceTime: '20:00' });
    const early = await createReminder(parent.token, child.userId, { recurrenceTime: '07:15' });
    await createReminder(other.parent.token, other.child.userId);

    const res = await getReminders(parent.token);

    expect(res.status).toBe(200);
    expect(res.body.map((r: { id: string }) => r.id)).toEqual([early.id, late.id]);
  });

  it('200: filtra por childId', async () => {
    const { parent, child } = await createFamily();
    const sibling = await registerChild(parent.token);
    const own = await createReminder(parent.token, child.userId);
    await createReminder(parent.token, sibling.userId);

    const res = await getReminders(parent.token, { childId: child.userId });

    expect(res.status).toBe(200);
    expect(res.body.map((r: { id: string }) => r.id)).toEqual([own.id]);
  });

  it('404 CHILD_NOT_FOUND si childId es de otra familia o no es un niño', async () => {
    const { parent } = await createFamily();
    const other = await createFamily();
    expectError(await getReminders(parent.token, { childId: other.child.userId }), 404, 'CHILD_NOT_FOUND');
    expectError(await getReminders(parent.token, { childId: parent.userId }), 404, 'CHILD_NOT_FOUND');
    expectError(await getReminders(parent.token, { childId: randomUUID() }), 404, 'CHILD_NOT_FOUND');
  });

  it('200: el niño solo ve los suyos e ignora childId', async () => {
    const { parent, child } = await createFamily();
    const sibling = await registerChild(parent.token);
    const own = await createReminder(parent.token, child.userId);
    await createReminder(parent.token, sibling.userId);

    const res = await getReminders(child.token, { childId: sibling.userId });

    expect(res.status).toBe(200);
    expect(res.body.map((r: { id: string }) => r.id)).toEqual([own.id]);
  });

  it('400 si childId no es uuid; 401 sin token, inválido o de usuario inexistente', async () => {
    const { parent } = await createFamily();
    expectError(await getReminders(parent.token, { childId: 'abc' }), 400, 'VALIDATION_ERROR');
    expectError(await api().get('/api/v1/reminders'), 401, 'TOKEN_MISSING');
    expectError(await getReminders(invalidToken()), 401, 'TOKEN_INVALID');
    expectError(await getReminders(ghostToken('CHILD')), 401, 'SESSION_USER_NOT_FOUND');
  });
});

describe('PATCH /api/v1/reminders/:reminderId', () => {
  it('200: cambiar title y recurrenceTime actualiza la fila y el scheduler', async () => {
    const { parent, child } = await createFamily();
    const reminder = await createReminder(parent.token, child.userId);

    const res = await patchReminder(parent.token, reminder.id, { title: 'Ordenar la pieza', recurrenceTime: '09:45' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: reminder.id, title: 'Ordenar la pieza', recurrence_time: '09:45', is_active: true });
    expect(res.body.updated_at).not.toBeNull();

    const scheduler = await reminderQueue.getJobScheduler(reminder.id);
    expect(scheduler?.pattern).toBe('45 09 * * *');
    expect(scheduler?.template?.data).toEqual({ reminderId: reminder.id, targetUserId: child.userId, title: 'Ordenar la pieza' });
  });

  it('200: isActive false elimina el scheduler y true lo vuelve a crear', async () => {
    const { parent, child } = await createFamily();
    const reminder = await createReminder(parent.token, child.userId, { recurrenceTime: '10:30' });

    const paused = await patchReminder(parent.token, reminder.id, { isActive: false });
    expect(paused.status).toBe(200);
    expect(paused.body.is_active).toBe(false);
    expect(await reminderQueue.getJobScheduler(reminder.id)).toBeUndefined();

    // Editar un recordatorio pausado no lo vuelve a programar
    const edited = await patchReminder(parent.token, reminder.id, { title: 'Pausado' });
    expect(edited.status).toBe(200);
    expect(await reminderQueue.getJobScheduler(reminder.id)).toBeUndefined();

    const resumed = await patchReminder(parent.token, reminder.id, { isActive: true });
    expect(resumed.status).toBe(200);
    expect(resumed.body.is_active).toBe(true);
    const scheduler = await reminderQueue.getJobScheduler(reminder.id);
    expect(scheduler?.pattern).toBe('30 10 * * *');
    expect(scheduler?.template?.data).toEqual({ reminderId: reminder.id, targetUserId: child.userId, title: 'Pausado' });
  });

  it.each([
    ['body vacío', {}],
    ['hora con formato inválido', { recurrenceTime: '25:00' }],
    ['título de 1 carácter', { title: 'x' }],
    ['isActive no booleano', { isActive: 'no' }],
  ])('400 VALIDATION_ERROR: %s', async (_case, body) => {
    const { parent, child } = await createFamily();
    const reminder = await createReminder(parent.token, child.userId);
    expectError(await patchReminder(parent.token, reminder.id, body), 400, 'VALIDATION_ERROR');
  });

  it('400 si reminderId no es uuid', async () => {
    const { parent } = await createFamily();
    expectError(await patchReminder(parent.token, 'abc', { title: 'Nuevo' }), 400, 'VALIDATION_ERROR');
  });

  it('404 REMINDER_NOT_FOUND para uno de otra familia o inexistente, sin tocarlo', async () => {
    const { parent } = await createFamily();
    const other = await createFamily();
    const foreign = await createReminder(other.parent.token, other.child.userId);

    expectError(await patchReminder(parent.token, foreign.id, { isActive: false }), 404, 'REMINDER_NOT_FOUND');
    expectError(await patchReminder(parent.token, randomUUID(), { isActive: false }), 404, 'REMINDER_NOT_FOUND');
    expect((await prisma.dailyReminder.findUnique({ where: { id: foreign.id } }))?.is_active).toBe(true);
    expect(await reminderQueue.getJobScheduler(foreign.id)).toBeDefined();
  });

  it('401 sin token, inválido o de usuario inexistente; 403 para un niño', async () => {
    const { parent, child } = await createFamily();
    const reminder = await createReminder(parent.token, child.userId);
    expectError(await api().patch(`/api/v1/reminders/${reminder.id}`).send({ title: 'Nuevo' }), 401, 'TOKEN_MISSING');
    expectError(await patchReminder(invalidToken(), reminder.id, { title: 'Nuevo' }), 401, 'TOKEN_INVALID');
    expectError(await patchReminder(ghostToken('PARENT'), reminder.id, { title: 'Nuevo' }), 401, 'SESSION_USER_NOT_FOUND');
    expectError(await patchReminder(child.token, reminder.id, { title: 'Nuevo' }), 403, 'FORBIDDEN_ROLE');
  });

  it('500 y restaura el scheduler si falla la actualización en la BD', async () => {
    const { parent, child } = await createFamily();
    const reminder = await createReminder(parent.token, child.userId, { title: 'Original', recurrenceTime: '06:00' });
    const spy = vi.spyOn(ReminderRepo.prototype, 'update').mockRejectedValue(new Error('BD caída'));

    const edit = await patchReminder(parent.token, reminder.id, { title: 'Cambiado', recurrenceTime: '22:10' });
    const pause = await patchReminder(parent.token, reminder.id, { isActive: false });

    spy.mockRestore();
    expectError(edit, 500, 'INTERNAL_ERROR');
    expectError(pause, 500, 'INTERNAL_ERROR');

    const scheduler = await reminderQueue.getJobScheduler(reminder.id);
    expect(scheduler?.pattern).toBe('00 06 * * *');
    expect(scheduler?.template?.data).toEqual({ reminderId: reminder.id, targetUserId: child.userId, title: 'Original' });
    expect(await prisma.dailyReminder.findUnique({ where: { id: reminder.id } })).toMatchObject({ title: 'Original', recurrence_time: '06:00', is_active: true });
  });
});

describe('DELETE /api/v1/reminders/:reminderId', () => {
  it('204 y elimina la fila y el scheduler', async () => {
    const { parent, child } = await createFamily();
    const reminder = await createReminder(parent.token, child.userId);

    const res = await deleteReminder(parent.token, reminder.id);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(await prisma.dailyReminder.findUnique({ where: { id: reminder.id } })).toBeNull();
    expect(await reminderQueue.getJobScheduler(reminder.id)).toBeUndefined();
  });

  it('404 REMINDER_NOT_FOUND para uno de otra familia o inexistente, sin tocarlo', async () => {
    const { parent } = await createFamily();
    const other = await createFamily();
    const foreign = await createReminder(other.parent.token, other.child.userId);

    expectError(await deleteReminder(parent.token, foreign.id), 404, 'REMINDER_NOT_FOUND');
    expectError(await deleteReminder(parent.token, randomUUID()), 404, 'REMINDER_NOT_FOUND');
    expect(await prisma.dailyReminder.findUnique({ where: { id: foreign.id } })).not.toBeNull();
    expect(await reminderQueue.getJobScheduler(foreign.id)).toBeDefined();
  });

  it('400 si reminderId no es uuid; 401 sin token o de usuario inexistente; 403 para un niño', async () => {
    const { parent, child } = await createFamily();
    const reminder = await createReminder(parent.token, child.userId);
    expectError(await deleteReminder(parent.token, 'abc'), 400, 'VALIDATION_ERROR');
    expectError(await api().delete(`/api/v1/reminders/${reminder.id}`), 401, 'TOKEN_MISSING');
    expectError(await deleteReminder(invalidToken(), reminder.id), 401, 'TOKEN_INVALID');
    expectError(await deleteReminder(ghostToken('PARENT'), reminder.id), 401, 'SESSION_USER_NOT_FOUND');
    expectError(await deleteReminder(child.token, reminder.id), 403, 'FORBIDDEN_ROLE');
    expect(await prisma.dailyReminder.findUnique({ where: { id: reminder.id } })).not.toBeNull();
  });
});
