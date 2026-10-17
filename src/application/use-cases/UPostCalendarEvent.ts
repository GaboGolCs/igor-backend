import { CalendarEventEntity } from "../../domain/entities/CalendarEventEnt.js";
import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { EventCategoryEnt } from "../../domain/entities/EventCategoryEnt.js";
import { CalendarEventRepo } from "../../infrastructure/database/CalendarEventRepo.js";
import { NotFoundError, sessionUserNotFound } from "../errors/AppError.js";

export async function postCalendarEvents(created_by: string, targeted_user_id: string, title: string, category: EventCategoryEnt, event_date: Date):Promise<CalendarEventEntity>{
    const userRepoInstance = new UserRepo()

    const userFound = await userRepoInstance.findById(created_by)
    if(!userFound){
        throw sessionUserNotFound()
    }

    // El destinatario debe existir y pertenecer a la misma familia del creador
    const targetedUserFound = await userRepoInstance.findById(targeted_user_id)
    if(!targetedUserFound || targetedUserFound.family_id !== userFound.family_id){
        throw new NotFoundError("No existe el usuario destinatario en tu familia", "USER_NOT_FOUND")
    }

    const calendarEventEntCreated = CalendarEventEntity.createCalendarEvent(userFound.family_id, userFound.id, targetedUserFound.id, title, category, event_date)

    return await new CalendarEventRepo().saveCalendarEvent(calendarEventEntCreated)
}
