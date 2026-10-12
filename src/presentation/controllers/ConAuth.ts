import { CreateFamilyAndParent } from "../../application/use-cases/URegParentFamily.js"
import { LoginParent } from "../../application/use-cases/ULoginParent.js"
import { LoginChild } from "../../application/use-cases/ULoginChild.js"
import { parentForgotPasswd } from "../../application/use-cases/UParentForgotPasswd.js"
import {Response, Request} from "express"
import { extractTokenFromHeader } from "../validators/extractTokenInfo.js"
import { verifyJWToken } from "../../infrastructure/security/verifyJWToken.js"
 
export class ConAuth{
    constructor(){
        return this
    }

    public static async RegFamAndUser(req:Request,res:Response){    
        try {
            const useCaseResponse = await CreateFamilyAndParent(req.body.familyName, req.body.parentEmail, req.body.password, req.body.alias, req.body.avatar_icon, req.body.timezone)
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
                    return res.json({ error: error.message });
                }
                return res.status(500).json({ message: "Internal Server Error: Error interno del servidor no controlado" });                          
            }
        }

    }



    public static async parentForgotPassword(req: Request, res: Response){
    try {

            const userJWT = extractTokenFromHeader(req)
            if(!userJWT){
                return res.status(401).json({error:"Token autorization no especificado o mal formateado" })
            }

            const decodedToken = verifyJWToken(userJWT)
            if(!decodedToken){
                return res.status(401).json({error: "No se ha podido verificar el token JWT en IGOR"})
            }

            if (decodedToken.role !== "PARENT"){
                return res.status(403).json({error: "El usuario no cuenta con los permisos para ingresar"})
            }


      await parentForgotPasswd.forgotPassword(req.body.email)
      
      // Siempre devolvemos 200 OK para evitar ataques de enumeración de usuarios
      res.status(200).json({ message: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
    } catch (error) {
       {
                if (error instanceof Error) {
                 return res.status(400).json({error:  error.message });
                }
                console.error(error)
                res.status(500).json({ message: "Internal Server Error: Error interno del servidor no controlado" });                 
            }
    }
  }



  public static async parentResetPassword(req: Request, res: Response) {
    try {
        const userJWT = extractTokenFromHeader(req)
        if(!userJWT){
            return res.status(401).json({error:"Token autorization no especificado o mal formateado" })
        }

        const decodedToken = verifyJWToken(userJWT)
        if(!decodedToken){
            return res.status(401).json({error: "No se ha podido verificar el token JWT en IGOR"})
        }

        if (decodedToken.role !== "PARENT"){
            return res.status(403).json({error: "El usuario no cuenta con los permisos para ingresar"})
        }
        
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token y nueva contraseña son requeridos.' });
        }

      await parentForgotPasswd.resetPassword(token, newPassword);
      
      res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
    } catch (error: any) {
            if (error instanceof Error) {
                return res.status(400).json({error:  error.message });
            }
            console.error(error)
            res.status(500).json({ error: "Internal Server Error: Error interno del servidor no controlado" });                    
            }
  }



}
