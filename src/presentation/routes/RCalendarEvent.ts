import express from "express"
import { zodMiddleware } from "../middlewares/zodMiddleware.js"
import { createCalendarEvent } from "../validators/createEventsRequest.js"
import { ConCalendarEvent } from "../controllers/ConCalendarEvents.js"
import { zodQParametersMiddleware } from "../middlewares/zodQParametersMiddleware.js"
import { calendarEventsQueryParams } from "../validators/calendarEventValidator.js"
export const rCalendarEventInstance= express.Router()
const ConCalendarEventInstace = new ConCalendarEvent()

rCalendarEventInstance.post("/" , zodMiddleware(createCalendarEvent),  ConCalendarEventInstace.createCalendarEvent)
rCalendarEventInstance.get("/", zodQParametersMiddleware(calendarEventsQueryParams) ,ConCalendarEventInstace.getCalendarEvent)

