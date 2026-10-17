import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { ReminderRepo } from "../../infrastructure/database/ReminderRepo.js";
import { ReminderMessageProducer } from "../../infrastructure/messaging/ReminderQueue.js";
import { NotFoundError, sessionUserNotFound } from "../errors/AppError.js";

export async function UDeleteReminder(reminderId: string, parentID: string): Promise<void> {
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

  // Primero se desprograma: así nunca queda un scheduler enviando un recordatorio borrado
  await ReminderMessageProducer.removeDailyReminder(reminderId);
  await reminderRepoInstance.deleteReminder(reminderId);
}
