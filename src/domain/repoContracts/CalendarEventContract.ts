import { CalendarEventEntity } from "../entities/CalendarEvent.js"
export interface CalendarEventRepoContract{
   getEventByMonthAndYear(familyId:string, month: number, year: number): Promise< CalendarEventEntity[]>
 
}

