import { Queue } from 'bullmq';
import { redisConnection } from './redisConnection.js';

export const REMINDER_QUEUE_NAME = 'daily-reminders';

export const reminderQueue = new Queue(REMINDER_QUEUE_NAME, {
  connection: redisConnection,
});

export class ReminderMessageProducer {
  /**
   * Programa un recordatorio diario en BullMQ considerando la zona horaria del usuario.
   * 
   * @param reminderId UUID del recordatorio generado en Postgres
   * @param childId UUID del niño destinatario
   * @param time Hora en formato "HH:mm" (ej. "15:00")
   * @param timezone Zona horaria en formato IANA (ej. "America/Santiago")
   */
  static async scheduleDailyReminder(
    reminderId: string,
    childId: string,
    time: string,
    timezone: string = 'America/Santiago'
  ): Promise<void> {
    const [hour, minute] = time.split(':');
    const cronPattern = `${minute} ${hour} * * *`;

    await reminderQueue.upsertJobScheduler(
      reminderId,
      {
        pattern: cronPattern,
        tz: timezone, // BullMQ gestionará el desfase horario (DST) de forma nativa
      },
      {
        name: 'send-reminder',
        data: { reminderId, childId },
      }
    );

    console.log(
      `[BullMQ] Recordatorio ${reminderId} programado para las ${time} hrs (${timezone}).`
    );
  }
}