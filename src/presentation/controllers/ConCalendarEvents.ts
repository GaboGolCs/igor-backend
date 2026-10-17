import { Request, Response } from "express";
import { getCalendarEventsUC } from "../../application/use-cases/UGetCalendarEvents.js";
import { postCalendarEvents } from "../../application/use-cases/UPostCalendarEvent.js";

export class ConCalendarEvent {
    constructor() {
        return this;
    }

    public async createCalendarEvent(req: Request, res: Response) {
        const user = res.locals.user;
        const data = req.body;

        // Si no viene targeted_user_id, el evento se asigna al creador
        const savedEvent = await postCalendarEvents(
            user.id,
            data.targeted_user_id ?? user.id,
            data.title,
            data.category,
            data.eventDate
        );

        return res.status(201).json(savedEvent);
    }

    public async getCalendarEvent(req: Request, res: Response) {
        const { month, year } = res.locals.query;
        const events = await getCalendarEventsUC(res.locals.user.id, month, year);
        return res.status(200).json(events);
    }
}
