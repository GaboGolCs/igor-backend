import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { CalendarEventRepo } from "../../infrastructure/database/CalendarEventRepo.js";
import { sessionUserNotFound } from "../errors/AppError.js";

export async function getCalendarEventsUC(userId:string, month: number, year: number){
    // Todo usuario pertenece a una familia: si no existe, el usuario del token fue eliminado
    const _user = await new UserRepo().findById(userId)
    if(!_user){
        throw sessionUserNotFound()
    }

    return await new CalendarEventRepo().getEventByMonthAndYear(_user.family_id, month, year)
}
