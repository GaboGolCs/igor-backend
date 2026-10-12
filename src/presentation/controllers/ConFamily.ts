import { Request, Response } from "express";
import { RegChild } from "../../application/use-cases/URegChild.js";
import { extractTokenFromHeader } from "../validators/extractTokenInfo.js";
import { verifyJWToken } from "../../infrastructure/security/verifyJWToken.js";
import { UChangeChildPin } from "../../application/use-cases/UChangeChildPin.js";
import { ChildNewPin } from "../validators/authValidators.js";
export class ConFamily {


public static async RegChild(req:Request,res:Response){
        try {
            const token = extractTokenFromHeader(req);
            if (!token) {
                return res.status(401).json({ message: "Unauthorized: Token no proporcionado o inválido" });
            }
            //No debo enviar el token debo enviar la info del token decodificandolo
            const decodedToken = verifyJWToken(token);
            if (!decodedToken || decodedToken.role !== 'PARENT') {
                return res.status(403).json({ message: "Forbidden: Solo los padres pueden registrar hijos" });
            } 

            //sub == Id del padre
            const useCaseResponse = await RegChild(req.body.alias, req.body.password, req.body.avatar_icon, decodedToken.sub);
            if(!useCaseResponse) {
                return res.status(400).json({message: "Error al crear usuario hijo"})
            }
            return res.status(201).json({message: "Usuario hijo creado correctamente", data: useCaseResponse})
        } catch (error: any) {
            if (error instanceof Error) {
                return res.status(400).json({ message: "Bad Request: " + error.message });
            }
            return res.status(500).json({ message: "Internal Server Error: Error interno del servidor no controlado" });
        }
    }
public static async ChangeChildPin(req:Request,res:Response){
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
                res.status(403).json({ message: "El usuario no cuenta con los permisos para ingresar" });
                throw new Error("El usuario no cuenta con los permisos para ingresar")
            }  

            // 1. Extraemos el ID de la URL (req.params)
            const childId = req.params.childId as string;

            await UChangeChildPin.changePin(decodedToken.sub,childId,req.body.newPin)

            return res.status(201).json({message: "Pin cambiado correctamente"})
        } catch (error: any) {
            if (error instanceof Error) {
                console.error(error)
                return res.status(400).json({ error: "Bad Request: " + error.message });
            }
            if(error.message.startWith("Internal")){
                return res.status(500).json({ error: "Internal Server Error: Error interno del servidor no controlado" })
            }
            console.error(error)
            return res.status(500).json({ error: "Internal Server Error: Error interno del servidor no controlado" });
        }
    }
}