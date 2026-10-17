import { Router } from "express";
import { ConReminder } from "../controllers/ConReminder.js";
import { zodMiddleware } from "../middlewares/zodMiddleware.js";
import { postReminderValidator } from "../validators/reminderValidators.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";


export const rReminderInstance = Router()

const conReminderInstance = new ConReminder()

rReminderInstance.post("/", requireAuth, requireRole("PARENT"), zodMiddleware(postReminderValidator), conReminderInstance.postReminder)
