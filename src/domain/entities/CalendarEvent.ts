import { randomUUID } from "node:crypto"
import { EventCategoryEnt } from "./EventCategoryEnt.js"

export class CalendarEventEntity{
    public readonly id: string
    public readonly family_id: string
    public readonly created_by: string
    public readonly targeted_user_id: string
    public readonly title: string
    public readonly category: EventCategoryEnt
    public readonly event_date: Date
    public readonly created_at: Date
    public readonly updated_at: Date | null

    constructor(id: string, family_id: string, created_by: string, targeted_user_id: string, title: string, category: EventCategoryEnt, event_date: Date, created_at: Date, updated_at: Date | null ){
        this.id = id
        this.family_id = family_id
        this.created_by = created_by
        this.targeted_user_id = targeted_user_id
        this.title = title
        this.category = category
        this.event_date = event_date
        this.created_at = created_at
        this.updated_at = updated_at
        return this   
    }

    public static createCalendarEvent(family_id: string, created_by: string, targeted_user_id: string, title: string, category: EventCategoryEnt, event_date: Date){
        const id = randomUUID()
        const created_at = new Date()
        const updated_at = null
        return new CalendarEventEntity(id, family_id, created_by, targeted_user_id, title, category, event_date, created_at, updated_at)
    }
}