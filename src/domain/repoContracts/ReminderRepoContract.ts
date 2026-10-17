import { ReminderEnt } from "../entities/ReminderEnt.js";
export interface ReminderRepoContract{
    saveReminder(_reminder: ReminderEnt): Promise<ReminderEnt>
    deleteReminder(id: string): Promise<void>
}