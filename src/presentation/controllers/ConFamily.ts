import { Request, Response } from "express";
import { RegChild } from "../../application/use-cases/URegChild.js";
import { extractTokenFromHeader } from "../validators/HExtractTokenInfo.js";
import { verifyJWToken } from "../../infrastructure/security/verifyJWToken.js";

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

}