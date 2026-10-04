import { CalendarEventEntity } from "../../domain/entities/CalendarEventEnt.js";
import { CalendarEventRepoContract } from "../../domain/repoContracts/CalendarEventContract.js";
import {prisma} from "./prisma.js"

export class CalendarEventRepo implements CalendarEventRepoContract{

    constructor(){
        return this
    }

    public async getEventByMonthAndYear(familyId: string, month: number, year: number): Promise<CalendarEventEntity[]> { 
    // 1. Manejo seguro de fechas en UTC para evitar desfases de zona horaria.
    // Nota: El objeto Date de JS usa meses base 0 (0 = Enero, 11 = Diciembre).
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)); 
    // Calculamos el primer día del MES SIGUIENTE. 
    // JS maneja automáticamente el desbordamiento (ej. si mes es 12, pasa a enero del año siguiente).
    const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

    // 2. Ejecución de la consulta optimizada en Prisma
    try {
      const events = await prisma.calendarEvent.findMany({
        where: {
          family_id: familyId, // Aislamiento de seguridad vitalicio por familia
          event_date: {
            gte: startDate, // Mayor o igual al inicio del mes
            lt: endDate,    // Estrictamente menor al inicio del mes siguiente
          },
        },
        orderBy: {
          event_date: 'asc', // Ordenamos cronológicamente para la vista de la app móvil
        },
      });
    
      return events as unknown as CalendarEventEntity[];
    } catch (error) {
      console.error(error) 
      throw error
    } 
  }

  public async saveCalendarEvent(_event: CalendarEventEntity){
    try {
      const savedEvent = await prisma.calendarEvent.create({data:
        {
        id: _event.id,
        family_id: _event.family_id,
        created_by: _event.created_by,
        targeted_user_id: _event.targeted_user_id,
        title: _event.title,
        category: _event.category,
        event_date: _event.event_date,
        created_at: _event.created_at,   
        updated_at: _event.updated_at      
      }})      

      if(!savedEvent){
        throw new Error("Internal Server Error, no se ha podido crear el evento")
      }
      return savedEvent as CalendarEventEntity

    } catch (error) {
       console.error(error) 
       throw error
    }
  }

}

