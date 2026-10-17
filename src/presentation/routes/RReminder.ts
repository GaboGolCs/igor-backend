import { Router } from "express";
import { ConReminder } from "../controllers/ConReminder.js";
import { zodMiddleware } from "../middlewares/zodMiddleware.js";
import { zodParamsMiddleware } from "../middlewares/zodParamsMiddleware.js";
import { zodQParametersMiddleware } from "../middlewares/zodQParametersMiddleware.js";
import { getRemindersQueryValidator, patchReminderValidator, postReminderValidator, reminderIdParamsValidator } from "../validators/reminderValidators.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";


export const rReminderInstance = Router()

const conReminderInstance = new ConReminder()

rReminderInstance.post("/", requireAuth, requireRole("PARENT"), zodMiddleware(postReminderValidator), conReminderInstance.postReminder)
rReminderInstance.get("/", requireAuth, zodQParametersMiddleware(getRemindersQueryValidator), conReminderInstance.getReminders)
rReminderInstance.patch("/:reminderId", requireAuth, requireRole("PARENT"), zodParamsMiddleware(reminderIdParamsValidator), zodMiddleware(patchReminderValidator), conReminderInstance.patchReminder)
rReminderInstance.delete("/:reminderId", requireAuth, requireRole("PARENT"), zodParamsMiddleware(reminderIdParamsValidator), conReminderInstance.deleteReminder)
