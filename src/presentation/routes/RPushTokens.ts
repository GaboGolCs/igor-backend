import { Router } from "express";
import { zodMiddleware } from "../middlewares/zodMiddleware.js";
import { PushTokenController } from "../controllers/ConPushToken.js";
import { registerPushTokenSchema } from "../validators/pushTokenValidators.js";

//Instaciamos el controlador
const pushTokenController = new PushTokenController();

//Exportamos el router para los tokens push
export const rPushTokens = Router()

rPushTokens.post("", zodMiddleware(registerPushTokenSchema), pushTokenController.registerToken)