import { ReminderEnt } from "../../domain/entities/ReminderEnt.js"
import { ReminderRepoContract } from "../../domain/repoContracts/ReminderRepoContract.js"
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
            console.error
            throw error 
        }
        
    }
}