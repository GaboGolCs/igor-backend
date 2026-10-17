import { Router } from "express";
import { zodMiddleware } from "../middlewares/zodMiddleware.js";
import { ConMood } from "../controllers/ConMood.js";
import { registerMood, monthlyStatistics } from "../validators/moodValidators.js";
import {zodQParametersMiddleware} from "../middlewares/zodQParametersMiddleware.js"
import { requireAuth, requireRole } from "../middlewares/auth.js";
const ConMoodInstance = new ConMood()
export const rMoodInstace = Router()

rMoodInstace.post("", requireAuth, requireRole("CHILD"), zodMiddleware(registerMood), ConMoodInstance.registerMood)
rMoodInstace.get("/analytics", requireAuth, requireRole("PARENT"), zodQParametersMiddleware(monthlyStatistics), ConMoodInstance.getMonthlyAnalitics)
