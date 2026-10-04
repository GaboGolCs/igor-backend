import { CalendarEventEntity } from "../entities/CalendarEventEnt.js"
export interface CalendarEventRepoContract{
   getEventByMonthAndYear(familyId:string, month: number, year: number): Promise< CalendarEventEntity[]>
 
}

