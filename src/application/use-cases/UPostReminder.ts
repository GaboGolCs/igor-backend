import { ReminderEnt } from "../../domain/entities/ReminderEnt.js";
import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { ReminderRepo } from "../../infrastructure/database/ReminderRepo.js";
import { ReminderMessageProducer } from "../../infrastructure/messaging/ReminderQueue.js";

export async function UPostReminder(title: string, childId: string, recurrenceTime: string, parentID: string): Promise<ReminderEnt> {
  try {
    const userRepoInstance = new UserRepo();

    // 1. Validamos la existencia del apoderado (ROLE_PARENT)
    const _parent = await userRepoInstance.findById(parentID);
    if (!_parent) {
      throw new Error("Bad Request, no existe un padre con esa ID");
    }

    // 2. Validamos la existencia del hijo (ROLE_CHILD)
    const _child = await userRepoInstance.findById(childId);
    if (!_child) {
      throw new Error("Bad Request, no existe un niño con esa id");
    }

    // 3. Validamos aislamiento multi-tenant (misma familia)
    if (_child.family_id !== _parent.family_id) {
      throw new Error(
        "Bad Request, el padre y el hijo ingresados no pertenecen a la misma familia"
      );
    }

    // 4. Creamos la entidad de dominio
    const _newReminder = ReminderEnt.createReminder(
      _child.family_id,
      childId,
      title,
      recurrenceTime,
      true
    );

    // 5. Persistimos en PostgreSQL
    const reminderRepoInstance = new ReminderRepo();
    const savedReminder = await reminderRepoInstance.saveReminder(_newReminder);

    if (!savedReminder) {
      throw new Error(
        "Internal Server Error, no se ha podido guardar el reminder en la base de datos"
      );
    }

    // 6. Obtención de la zona horaria del usuario (Fallback: 'America/Santiago')
    const parentTimezone = _parent.timezone || 'America/Santiago';

    // 7. Programamos el trabajo recurrente en Redis + BullMQ con la zona horaria
    await ReminderMessageProducer.scheduleDailyReminder(
      savedReminder.id,
      childId,
      recurrenceTime,
      parentTimezone
    );

    // 8. Retornamos el objeto persistido para la respuesta HTTP (201 Created)
    return savedReminder as ReminderEnt;

  } catch (error) {
    console.error(error)
    throw error
  }
}