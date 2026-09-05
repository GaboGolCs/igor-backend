import { CreateFamilyAndParent } from "../../application/use-cases/URegParentFamily.js"
import {Response, Request} from "express"
 
export class ConAuth{
    constructor(){
        return this
    }

    public static async RegFamAndUser(req:Request,res:Response){    
        try {
            const useCaseResponse = await CreateFamilyAndParent(req.body.familyName, req.body.parentEmail, req.body.password, req.body.alias,req.body.avatar_icon)
            if(!useCaseResponse) {
                return res.status(400).json({message: "Error al crear usuario y familia"})
            }
            return res.status(201).json({message: "Usuario y familia creados correctamente", data: useCaseResponse})
        } catch (error) {
            console.error(error)
            return res.status(500).json({message: "Error del servidor", error: error})
            
        }
    }

    public static async UserUser(req: Request, res:Response){
        if(req.body.role === 'PARENT'){
            try {
                const useCaseResponse  = await LoginParent(req.body.email, req.body.password) 
            } catch (error) {
                console.error(error)
                return res.status(500).json({message: "Error del servidor"})
                           
        }
        }

        if(req.body.role === 'PARENT')
            try{
                const useCaseResponse  =  await LoginChild(req.body.alias, req.body.password)
            } catch (error){
                console.error(error)
                return res.status(500).json({message: "Error del servidor"})                             
            }
    }


}