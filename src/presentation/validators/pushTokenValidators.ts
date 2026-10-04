// src/presentation/validators/PushTokenValidators.ts

import { z } from "zod";

export const registerPushTokenSchema = z.object({
  token: z.string("El token debe ser una cadena de texto").min(1, "El token no puede estar vacío"), 
  deviceType: z.enum(["ANDROID", "IOS", "WEB"], "El deviceType debe ser ANDROID, IOS o WEB")
});