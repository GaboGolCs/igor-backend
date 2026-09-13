import { Router } from "express";
import { zodMiddleware } from "../middlewares/zodMiddleware.js";
import { ConMood } from "../controllers/ConMood.js";
import { registerMood, monthlyStatistics } from "../validators/moodValidators.js";
import {zodQParametersMiddleware} from "../middlewares/zodQParametersMiddleware.js"
const ConMoodInstance = new ConMood()
export const rMoodInstace = Router()


//Incluir zodObject
rMoodInstace.post("", zodMiddleware(registerMood), ConMoodInstance.registerMood)
rMoodInstace.get("/analytics", zodQParametersMiddleware(monthlyStatistics) ,ConMoodInstance.getMonthlyAnalitics)