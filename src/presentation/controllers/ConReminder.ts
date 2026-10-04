import {Request, Response} from "express"
import { extractTokenFromHeader } from "../validators/HExtractTokenInfo.js"
import { verifyJWToken } from "../../infrastructure/security/verifyJWToken.js"
import { ReminderEnt } from "../../domain/entities/ReminderEnt.js"
import { UPostReminder } from "../../application/use-cases/UPostReminder.js"
export class ConReminder{
    constructor(){
        return this
    }

    public async postReminder(req: Request, res: Response){
        try {
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
                res.status(403)
                throw new Error("El usuario no cuenta con los permisos para ingresar")
            }  
           
            
            //Insertar Caso de USO
            const body = req.body
            const savedReminder = await UPostReminder(body.title, body.childId, body.recurrenceTime, decodedToken.sub)
            return  res.status(201).json(savedReminder)               

        }catch(error:any){
            if(error.message.startsWith("Intern")){
                return res.status(500).json({message: "Error: " + error.message})
            }

            return res.json({message: "Error: " + error.message});
        } 


    }
}