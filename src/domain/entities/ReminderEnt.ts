import { randomUUID } from "node:crypto"

export class ReminderEnt{

    public readonly id: string
    public readonly family_id: string
    public readonly targeted_user_id: string
    public readonly title: string
    public readonly recurrence_time: string
    public readonly is_active: boolean
    public readonly created_at: Date
    public readonly updated_at: Date | null
    
    constructor(id: string, family_id: string, targeted_user_id: string, title: string, recurrence_time: string, is_active: boolean, created_at: Date, updated_at: Date | null){
        this.id = id
        this.family_id = family_id
        this.targeted_user_id =  targeted_user_id
        this.title = title
        this.recurrence_time = recurrence_time
        this.is_active = is_active
        this.created_at = created_at
        this.updated_at = updated_at
        return this
    }

    public static createReminder(family_id: string, targeted_user_id: string, title: string, recurrence_time: string, is_active: boolean){
        const id = randomUUID()
        const created_at = new Date()
        const updated_at = null
        return new ReminderEnt(id, family_id, targeted_user_id, title, recurrence_time, is_active, created_at, updated_at)
    }
}