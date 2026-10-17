import { Router } from "express";
import { zodMiddleware } from "../middlewares/zodMiddleware.js";
import { PushTokenController } from "../controllers/ConPushToken.js";
import { registerPushTokenSchema } from "../validators/pushTokenValidators.js";
import { requireAuth } from "../middlewares/auth.js";

//Instaciamos el controlador
const pushTokenController = new PushTokenController();

//Exportamos el router para los tokens push (cualquier usuario autenticado registra su dispositivo)
export const rPushTokens = Router()

rPushTokens.post("", requireAuth, zodMiddleware(registerPushTokenSchema), pushTokenController.registerToken)
