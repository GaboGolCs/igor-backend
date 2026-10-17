import { ReminderEnt } from "../../domain/entities/ReminderEnt.js";
import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { ReminderRepo } from "../../infrastructure/database/ReminderRepo.js";
import { ReminderMessageProducer } from "../../infrastructure/messaging/ReminderQueue.js";
import { NotFoundError, sessionUserNotFound } from "../errors/AppError.js";

export async function UPostReminder(title: string, childId: string, recurrenceTime: string, parentID: string): Promise<ReminderEnt> {
  const userRepoInstance = new UserRepo();

  const _parent = await userRepoInstance.findById(parentID);
  if (!_parent) {
    throw sessionUserNotFound();
  }

  // Aislamiento multi-tenant: el destinatario debe ser un niño de la misma familia
  const _child = await userRepoInstance.findById(childId);
  if (!_child || _child.role !== "CHILD" || _child.family_id !== _parent.family_id) {
    throw new NotFoundError("No existe un niño con esa id en tu familia", "CHILD_NOT_FOUND");
  }

  const _newReminder = ReminderEnt.createReminder(_child.family_id, childId, title, recurrenceTime, true);

  const reminderRepoInstance = new ReminderRepo();
  const savedReminder = await reminderRepoInstance.saveReminder(_newReminder);

  // Programamos el trabajo recurrente en Redis + BullMQ con la zona horaria del apoderado.
  // Si falla, se elimina el recordatorio para no dejar uno guardado que nunca se enviará.
  try {
    await ReminderMessageProducer.scheduleDailyReminder(
      savedReminder.id,
      childId,
      title,
      recurrenceTime,
      _parent.timezone || 'America/Santiago'
    );
  } catch (error) {
    await reminderRepoInstance.deleteReminder(savedReminder.id);
    throw error;
  }

  return savedReminder;
}
