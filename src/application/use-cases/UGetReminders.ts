import { ReminderEnt } from "../../domain/entities/ReminderEnt.js";
import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { ReminderRepo } from "../../infrastructure/database/ReminderRepo.js";
import { NotFoundError, sessionUserNotFound } from "../errors/AppError.js";

// PARENT: todos los recordatorios de su familia (opcionalmente filtrados por niño).
// CHILD: solo los suyos; childId se ignora.
export async function UGetReminders(userId: string, childId?: string): Promise<ReminderEnt[]> {
  const userRepoInstance = new UserRepo();

  const _user = await userRepoInstance.findById(userId);
  if (!_user) {
    throw sessionUserNotFound();
  }

  const reminderRepoInstance = new ReminderRepo();

  if (_user.role === "CHILD") {
    return reminderRepoInstance.listByFamily(_user.family_id, _user.id);
  }

  if (childId) {
    // Aislamiento multi-tenant: el niño debe ser de la misma familia
    const _child = await userRepoInstance.findById(childId);
    if (!_child || _child.role !== "CHILD" || _child.family_id !== _user.family_id) {
      throw new NotFoundError("No existe un niño con esa id en tu familia", "CHILD_NOT_FOUND");
    }
  }

  return reminderRepoInstance.listByFamily(_user.family_id, childId);
}
