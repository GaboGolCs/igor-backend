import { FamilyRepo } from "../../infrastructure/database/FamilyRepo.js";
import { CalendarEventRepo } from "../../infrastructure/database/CalendarEventRepo.js";
export async function getCalendarEventsUC(userId:string, month: number, year: number){


    try {
        const FamilyRepoinstace = new FamilyRepo();

        const _family = await FamilyRepoinstace.findFamilyByUserId(userId)
        if(_family == null){
            throw new Error("Bad request: No existe una familia asociada con la id del usuario")
        }

        const calendarEventRepoInstace = new CalendarEventRepo()
        
        const eventsArray = calendarEventRepoInstace.getEventByMonthAndYear(_family.id, month, year)

        //INSERTAR INGRESO A REDIS Y BULLMQ
        

        return eventsArray
   
    } catch (error) {
       console.error(error) 
       throw error
    }



}