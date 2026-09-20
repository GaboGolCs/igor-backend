import { CalendarEventEntity } from "../../domain/entities/CalendarEvent.js";
import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { FamilyRepo } from "../../infrastructure/database/FamilyRepo.js";
import { EventCategoryEnt } from "../../domain/entities/EventCategoryEnt.js";
import { CalendarEventRepo } from "../../infrastructure/database/CalendarEventRepo.js";

export async function postCalendarEvents(created_by: string, targeted_user_id: string, title: string, category: EventCategoryEnt, event_date: Date):Promise<CalendarEventEntity>{
    try {

        const userRepoInstance = new UserRepo()
        const userFound = await userRepoInstance.findById(created_by)
        if(!userFound){
            throw new Error("Bad Request, No existe un usuario con la id ingresada")
        }

        const familyRepoInstance = new FamilyRepo()
        const familyFound = await familyRepoInstance.findFamilyByUserId(created_by)
        if(!familyFound){
            throw new Error("Bad Request: no existe una familia asociada al usuario enviado")
        }

        const targetedUserFound = await userRepoInstance.findById(targeted_user_id)
        if(!targetedUserFound){
            throw new Error("Bad Request, no existe el usuario al que se le va a asignar el evento")
        }

        const calendarEventEntCreated = CalendarEventEntity.createCalendarEvent(familyFound.id, userFound.id, targetedUserFound.id, title, category, event_date)

        const calendarEventRepoInstance = new CalendarEventRepo()
        const calendarEventSaved = calendarEventRepoInstance.saveCalendarEvent(calendarEventEntCreated)

        if (!calendarEventSaved){
            throw new Error("Internal Server Error, No se ha podido crear el nuevo evento en el calendario")
        }

        return calendarEventSaved
        //INSERTAR CONECCION CON REDIS Y BULLMQ

    } catch (error) {
        console.error(error)
        throw error
    }


}