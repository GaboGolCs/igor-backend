import { Request, Response } from "express"
import { extractTokenFromHeader } from "../validators/HExtractTokenInfo.js"
import { verifyJWToken } from "../../infrastructure/security/verifyJWToken.js"
export class ConCalendarEvent{
    constructor(){
        return this
    }

    public createCalendarEvent(req: Request, res: Response){
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

            

        }catch(error:any){
            if(error.message.startsWith("Interno")){
                res.status(500).json({message: "Error: " + error.message})
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


        }catch(error:any){
            if(error.message.startsWith("Interno")){
                res.status(500).json({message: "Error: " + error.message})
            }

            res.status(500).json({message: "Error: " + error.message});
           } 
        }
}