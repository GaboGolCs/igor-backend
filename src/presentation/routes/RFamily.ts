import express from "express"
import { ConFamily} from "../controllers/ConFamily.js"
import { zodMiddleware } from "../middlewares/zodMiddleware.js"
import{RegChild} from "../validators/authValidators.js"
export const rFamilyInstance= express.Router()

rFamilyInstance.post("/children", zodMiddleware(RegChild), ConFamily.RegChild)