import { ReminderEnt } from "../../domain/entities/ReminderEnt.js";
import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { ReminderRepo } from "../../infrastructure/database/ReminderRepo.js";
import { ReminderMessageProducer } from "../../infrastructure/messaging/ReminderQueue.js";
import { NotFoundError, sessionUserNotFound } from "../errors/AppError.js";

export type PatchReminderInput = {
  title?: string;
  recurrenceTime?: string;
  isActive?: boolean;
};

// Sincroniza el scheduler de BullMQ con el estado indicado (activo → upsert, inactivo → remove)
async function syncScheduler(reminder: Pick<ReminderEnt, "id" | "targeted_user_id" | "title" | "recurrence_time" | "is_active">, timezone: string) {
  if (reminder.is_active) {
    await ReminderMessageProducer.scheduleDailyReminder(
      reminder.id,
      reminder.targeted_user_id,
      reminder.title,
      reminder.recurrence_time,
      timezone
    );
  } else {
    await ReminderMessageProducer.removeDailyReminder(reminder.id);
  }
}

export async function UPatchReminder(reminderId: string, parentID: string, input: PatchReminderInput): Promise<ReminderEnt> {
  const userRepoInstance = new UserRepo();

  const _parent = await userRepoInstance.findById(parentID);
  if (!_parent) {
    throw sessionUserNotFound();
  }

  const reminderRepoInstance = new ReminderRepo();

  // Un recordatorio de otra familia responde igual que uno inexistente
  const _reminder = await reminderRepoInstance.findById(reminderId);
  if (!_reminder || _reminder.family_id !== _parent.family_id) {
    throw new NotFoundError("No existe un recordatorio con esa id en tu familia", "REMINDER_NOT_FOUND");
  }

  const timezone = _parent.timezone || 'America/Santiago';
  const finalState = {
    id: _reminder.id,
    targeted_user_id: _reminder.targeted_user_id,
    title: input.title ?? _reminder.title,
    recurrence_time: input.recurrenceTime ?? _reminder.recurrence_time,
    is_active: input.isActive ?? _reminder.is_active,
  };

  // Primero el scheduler: si falla, la fila queda intacta (500)
  await syncScheduler(finalState, timezone);

  try {
    return await reminderRepoInstance.update(reminderId, {
      title: input.title,
      recurrence_time: input.recurrenceTime,
      is_active: input.isActive,
    });
  } catch (error) {
    // Si la BD falla, el scheduler vuelve al estado anterior para no quedar desincronizado
    await syncScheduler(_reminder, timezone);
    throw error;
  }
}
