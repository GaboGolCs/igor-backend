import { Request, Response, NextFunction } from "express";
import { extractTokenFromHeader } from "../validators/HExtractTokenInfo.js";
import { verifyJWToken } from "../../infrastructure/security/verifyJWToken.js";
import {RegisterPushTokenUseCase} from "../../application/use-cases/URegistertoken.js"
import { PrismaPushTokenRepository } from "../../infrastructure/database/PushTokenRepo.js";
export class PushTokenController {

    constructor() {
        return this;
    }

  public async registerToken (req: Request, res: Response) {

    try {
        //Instaciamos el UC
        const registerPushTokenUseCase = new RegisterPushTokenUseCase(new PrismaPushTokenRepository())

        // Extraemos el payload validado previamente por tu middleware de Zod
        const { token, deviceType } = req.body;
 
        const userJWT = extractTokenFromHeader(req)
        if(!userJWT){
            res.status(401)
            throw new Error("Token autorization no especificado o mal formateado")   
        }
        
        const decodedToken = verifyJWToken(userJWT)
        if(!decodedToken){
            res.status(401)
            throw new Error("No se ha podido verificar el token JWT en IGOR")
        }

      const userId = decodedToken.sub;
      if (!userId) {
            res.status(401) 
            throw new Error("Bad Request, El token JWT no contiene un id válido para identificar al usuario")
      }

      // Ejecutamos el caso de uso
      await registerPushTokenUseCase.execute({
        userId,
        token,
        deviceType
      });

      res.status(200).json({ 
        message: "Token registrado para envío de notificaciones push." 
      })


    } catch (error: any) {
        if(error.message.startsWith("Intern")){
            return res.status(500).json({message: "Error: " + error.message})
        }
            return res.json({message: "Error: " + error.message}); 
    }
  };
}