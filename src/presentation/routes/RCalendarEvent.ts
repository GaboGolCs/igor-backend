import express from "express"
import { zodMiddleware } from "../middlewares/zodMiddleware.js"
import { createCalendarEvent } from "../validators/createCalendarEventsRequest.js"
import { ConCalendarEvent } from "../controllers/ConCalendarEvents.js"
import { zodQParametersMiddleware } from "../middlewares/zodQParametersMiddleware.js"
import { calendarEventsQueryParams } from "../validators/calendarEventValidator.js"
import { requireAuth, requireRole } from "../middlewares/auth.js"
export const rCalendarEventInstance= express.Router()
const ConCalendarEventInstace = new ConCalendarEvent()

rCalendarEventInstance.post("/", requireAuth, requireRole("PARENT"), zodMiddleware(createCalendarEvent), ConCalendarEventInstace.createCalendarEvent)
// Cualquier miembro de la familia puede ver el calendario
rCalendarEventInstance.get("/", requireAuth, zodQParametersMiddleware(calendarEventsQueryParams), ConCalendarEventInstace.getCalendarEvent)
