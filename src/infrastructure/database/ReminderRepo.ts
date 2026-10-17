import { ReminderEnt } from "../../domain/entities/ReminderEnt.js"
import { ReminderRepoContract, ReminderUpdateData } from "../../domain/repoContracts/ReminderRepoContract.js"
import { prisma } from "./prisma.js"
export class ReminderRepo implements ReminderRepoContract{
    
    constructor(){
        return this
    }

    public async saveReminder(_reminder : ReminderEnt){
        
        try {
            const savedRemider = await prisma.dailyReminder.create({data:
                {
                    id: _reminder.id,
                    family_id: _reminder.family_id,
                    targeted_user_id: _reminder.targeted_user_id,
                    title: _reminder.title,
                    recurrence_time: _reminder.recurrence_time,
                    is_active: _reminder.is_active,
                    created_at: _reminder.created_at,
                    updated_at: _reminder.updated_at
                }  
            })


            return savedRemider as ReminderEnt
        } catch (error) {
            console.error(error)
            throw error
        }

    }

    public async deleteReminder(id: string): Promise<void> {
        await prisma.dailyReminder.delete({ where: { id } })
    }

    public async findById(id: string): Promise<ReminderEnt | null> {
        const reminder = await prisma.dailyReminder.findUnique({ where: { id } })
        return reminder as ReminderEnt | null
    }

    public async listByFamily(familyId: string, childId?: string): Promise<ReminderEnt[]> {
        const reminders = await prisma.dailyReminder.findMany({
            where: { family_id: familyId, ...(childId ? { targeted_user_id: childId } : {}) },
            orderBy: [{ recurrence_time: "asc" }, { created_at: "asc" }]
        })
        return reminders as ReminderEnt[]
    }

    public async update(id: string, data: ReminderUpdateData): Promise<ReminderEnt> {
        const updated = await prisma.dailyReminder.update({
            where: { id },
            data: { ...data, updated_at: new Date() }
        })
        return updated as ReminderEnt
    }
}