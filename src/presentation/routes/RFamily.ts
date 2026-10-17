import express from "express"
import { ConFamily} from "../controllers/ConFamily.js"
import { zodMiddleware } from "../middlewares/zodMiddleware.js"
import{ChildIdParams, ChildNewPin, RegChild} from "../validators/authValidators.js"
import { zodParamsMiddleware } from "../middlewares/zodParamsMiddleware.js"
import { requireAuth, requireRole } from "../middlewares/auth.js"

export const rFamilyInstance= express.Router()

rFamilyInstance.use(requireAuth, requireRole("PARENT"))

rFamilyInstance.post("/children", zodMiddleware(RegChild), ConFamily.RegChild)
rFamilyInstance.patch("/children/:childId/pin", zodParamsMiddleware(ChildIdParams),zodMiddleware(ChildNewPin), ConFamily.ChangeChildPin)
