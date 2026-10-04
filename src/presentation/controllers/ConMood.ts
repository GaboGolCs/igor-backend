import { Request, Response } from "express"
import { extractTokenFromHeader } from "../validators/HExtractTokenInfo.js"
import { verifyJWToken } from "../../infrastructure/security/verifyJWToken.js"
import { getMonthlyAnalitics } from "../../application/use-cases/UGetMonthlyAnalitics.js"
import { registerMoodUC } from "../../application/use-cases/URegisterMood.js"
export class ConMood{

    constructor(){
        return this
    }

    public async getMonthlyAnalitics(req: Request, res: Response){
        
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

            //Retorna 400 si la id no existe y 500 si hay un error con la bd
            try {
                const childAnalitics = await getMonthlyAnalitics(res.locals.childId, res.locals.month, res.locals.year)
                return res.status(200).json(childAnalitics) 
            } catch (error:any) {
                if(error.message.startsWith("Bad Request")){
                    res.status(400)
                    throw error
                }
                else{
                    res.status(500)
                    throw error
                }
            }
               
        } catch (error:any)
        {
           return res.json({message: "Error: " + error.message});
           } 
        }

    public async registerMood(req: Request, res: Response){
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


            if (decodedToken.role !== "CHILD"){
                res.status(403)
                throw new Error("El usuario no cuenta con los permisos para ingresar")
            }

            const moodCreationResult = await registerMoodUC(req.body.emotion, req.body.activityText, req.body.needText, decodedToken.sub)  
            if(moodCreationResult){
            return res.status(201).json({message: "Mood creado con éxito"})
            }


   
        } catch (error:any)
        {
            if(error.message.startsWith("Interno")){
                return res.status(500).json({message: "Error: " + error.message})
            }

            return res.status(500).json({message: "Error: " + error.message});
           } 
        }      
    }
        

