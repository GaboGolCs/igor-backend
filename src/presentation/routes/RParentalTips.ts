import { Router } from "express";
import {ParentalTipController} from "../controllers/ConParentalTip.js";
const conParentalTipInstance = new ParentalTipController()
export const rParentalTip = Router()

rParentalTip.get("", conParentalTipInstance.getAll)