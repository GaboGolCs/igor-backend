import { CreateFamilyAndParent } from "../../application/use-cases/URegParentFamily.js"
import { LoginParent } from "../../application/use-cases/ULoginParent.js"
import { LoginChild } from "../../application/use-cases/ULoginChild.js"
import {Response, Request} from "express"
import { RegChild } from "../../application/use-cases/URegChild.js"
 
export class ConAuth{
    constructor(){
        return this
    }

    public static async RegFamAndUser(req:Request,res:Response){    
        try {
            const useCaseResponse = await CreateFamilyAndParent(req.body.familyName, req.body.parentEmail, req.body.password, req.body.alias, req.body.avatar_icon)
            if(!useCaseResponse) {
                return res.status(400).json({message: "Error al crear usuario y familia"})
            }
            return res.status(201).json({message: "Usuario y familia creados correctamente", data: useCaseResponse})
        } catch (error) {
                if (error instanceof Error) {
                    return res.status(400).json({ message: "Bad Request: " + error.message });
                }
                return res.status(500).json({ message: "Internal Server Error: Error interno del servidor no controlado" });    
            
        }
    }


    public static async LoginUser(req: Request, res:Response){
        if(req.body.identifier.includes("@")){
            try {
                const useCaseResponse  = await LoginParent(req.body.identifier, req.body.secret) 
                if(!useCaseResponse) {
                    return res.status(400).json({message: "Error al iniciar sesión"})
                }
                return res.status(200).json({message: "Sesión iniciada correctamente", data: useCaseResponse})
            }catch (error) {
                if (error instanceof Error) {
                    return res.status(400).json({ message: "Bad Request: " + error.message });
                }
                return res.status(500).json({ message: "Internal Server Error: Error interno del servidor no controlado" });                 
            }
        }

        else{
            try{
                const useCaseResponse  =  await LoginChild(req.body.identifier, req.body.secret)
                if(!useCaseResponse) {
                    return res.status(400).json({message: "Error al iniciar sesión"})
                }
                return res.status(200).json({message: "Sesión iniciada correctamente", data: useCaseResponse})
            } catch (error){
                if (error instanceof Error) {
                    return res.status(400).json({ message: "Bad Request: " + error.message });
                }
                return res.status(500).json({ message: "Internal Server Error: Error interno del servidor no controlado" });                          
            }
        }

    }
}