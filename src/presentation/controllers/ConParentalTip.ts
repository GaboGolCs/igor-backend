import { Request, Response } from 'express';
import {GetParentalTipsUC} from "../../application/use-cases/UGetParentalTips.js";
import { extractTokenFromHeader } from '../validators/HExtractTokenInfo.js';
import { verifyJWToken } from '../../infrastructure/security/verifyJWToken.js';
export class ParentalTipController {

  constructor() {}

  public async getAll(req: Request, res: Response) {
    const getParentalTipsUseCase = new GetParentalTipsUC();

    try{   
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

        if (decodedToken.role !== "PARENT"){
            new Error("El usuario no cuenta con los permisos para ingresar")
            return res.status(403).json({ message: "El usuario no cuenta con los permisos para ingresar" });
        }  

        const tips = await getParentalTipsUseCase.getAll()
      
      // Retorna 200 OK con la lista de consejos según la especificación
        return res.status(200).json(tips);
    } catch (error: any) {
        if(error.message.startsWith("Intern")){
                return res.status(500).json({message: "Error: " + error.message})
        }

        return res.json({message: "Error: " + error.message});
    }
    }
}
