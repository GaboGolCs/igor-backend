import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Worker } from 'bullmq';

// FCM mockeado: no hay dispositivo real, verificamos hasta la llamada al servicio
const { sendPushNotification } = vi.hoisted(() => ({ sendPushNotification: vi.fn() }));
vi.mock('../src/infrastructure/messaging/FCMPushService.js', () => ({
  FCMPushService: class {
    sendPushNotification = sendPushNotification;
  },
}));

import { prisma } from '../src/infrastructure/database/prisma.js';
import { reminderQueue } from '../src/infrastructure/messaging/ReminderQueue.js';
import { startReminderWorker } from '../src/infrastructure/messaging/ReminderWorker.js';
import { createFamily } from './helpers/fixtures.js';
import { closeConnections, resetDb, resetRedis } from './helpers/db.js';

const DEFAULT_BODY = '¡Es hora de tu rutina!';

let childId: string;

beforeAll(async () => {
  await resetDb();
  await resetRedis();
  childId = (await createFamily()).child.userId;
});

afterAll(async () => {
  await reminderQueue.close();
  await closeConnections();
});

describe('ReminderWorker', () => {
  let worker: Worker;
  let familyId: string;

  const createReminder = (title: string, isActive = true) =>
    prisma.dailyReminder.create({
      data: {
        family_id: familyId,
        targeted_user_id: childId,
        title,
        recurrence_time: '08:30',
        is_active: isActive,
      },
    });

  beforeAll(async () => {
    const child = await prisma.user.findUniqueOrThrow({ where: { id: childId } });
    familyId = child.family_id;
    worker = startReminderWorker();
  });

  afterAll(async () => {
    await worker.close();
  });

  beforeEach(() => {
    sendPushNotification.mockClear();
  });

  it('envía el push con el payload nuevo', async () => {
    const reminder = await createReminder('Ordenar la pieza');

    await reminderQueue.add('test', { reminderId: reminder.id, targetUserId: childId, title: reminder.title });

    await vi.waitFor(() =>
      expect(sendPushNotification).toHaveBeenCalledWith(childId, 'Ordenar la pieza', DEFAULT_BODY),
    );
  });

  it('completa desde la BD un payload antiguo { reminderId, childId }', async () => {
    const reminder = await createReminder('Hacer la tarea');

    await reminderQueue.add('legacy', { reminderId: reminder.id, childId });

    await vi.waitFor(() =>
      expect(sendPushNotification).toHaveBeenCalledWith(childId, 'Hacer la tarea', DEFAULT_BODY),
    );
  });

  it('omite un recordatorio inactivo', async () => {
    const reminder = await createReminder('Recordatorio apagado', false);

    const job = await reminderQueue.add('legacy-inactive', { reminderId: reminder.id, childId });

    await vi.waitFor(async () => expect(await job.getState()).toBe('completed'));
    expect(sendPushNotification).not.toHaveBeenCalled();
  });
});
