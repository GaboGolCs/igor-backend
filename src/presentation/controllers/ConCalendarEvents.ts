import { Request, Response } from "express"
import { extractTokenFromHeader } from "../validators/HExtractTokenInfo.js"
import { verifyJWToken } from "../../infrastructure/security/verifyJWToken.js"
import { getCalendarEventsUC } from "../../application/use-cases/UGetCalendarEvents.js"
import { postCalendarEvents } from "../../application/use-cases/UPostCalendarEvent.js"
export class ConCalendarEvent{
    constructor(){
        return this
    }

    public async createCalendarEvent(req: Request, res: Response){
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
            const data = req.body
            const savedEvent = await postCalendarEvents(decodedToken.sub, data.targeted_user_id, data.title, data.category, data.event_date)
            res.status(201).json(savedEvent)

        }catch(error:any){

            if(error.message.startsWith("Bad Request")){
                res.status(400).json({message: "Error: " + error.message})
            }

            res.status(500).json({message: "Error: " + error.message});
        } 
}



    public async getCalendarEvent(req:Request, res: Response){
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

            const events = await getCalendarEventsUC(decodedToken.sub, res.locals.month, res.locals.year)
            
            res.status(200).json(events)

        }catch(error:any){
            if(error.message.startsWith("Bad Request")){
                res.status(400).json({message: "Error: " + error.message})
            }

            res.status(500).json({message: "Error: " + error.message});
           } 
        }
}