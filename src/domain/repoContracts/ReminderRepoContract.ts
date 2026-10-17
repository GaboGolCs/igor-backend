import { ReminderEnt } from "../entities/ReminderEnt.js";

export type ReminderUpdateData = {
    title?: string
    recurrence_time?: string
    is_active?: boolean
}

export interface ReminderRepoContract{
    saveReminder(_reminder: ReminderEnt): Promise<ReminderEnt>
    deleteReminder(id: string): Promise<void>
    findById(id: string): Promise<ReminderEnt | null>
    listByFamily(familyId: string, childId?: string): Promise<ReminderEnt[]>
    update(id: string, data: ReminderUpdateData): Promise<ReminderEnt>
}
