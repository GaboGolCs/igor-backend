import { Router } from "express";
import {ParentalTipController} from "../controllers/ConParentalTip.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";
const conParentalTipInstance = new ParentalTipController()
export const rParentalTip = Router()

rParentalTip.get("", requireAuth, requireRole("PARENT"), conParentalTipInstance.getAll)
