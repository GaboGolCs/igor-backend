import { Request, Response } from 'express';
import { ClaimRewardUseCase } from '../../application/use-cases/UClaimReward.js';
import { extractTokenFromHeader } from '../validators/extractTokenInfo.js';
import { verifyJWToken } from '../../infrastructure/security/verifyJWToken.js';
import { UpdateRewardStatusUseCase } from '../../application/use-cases/UPatchRewardStatus.js';

export class ConRewardClaim {
    public async postRewardClaim(req: Request, res: Response) {
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

            const result = await ClaimRewardUseCase(decodedToken.sub, req.body.rewardTitle);

        // Retorna 201 Created según la especificación OpenAPI
            res.status(201).json(result);


    }   catch (error: any) {
        // Manejo de errores de negocio desde el UseCase
        if(error.message.includes("Bad Request")){
            console.error(error.message); // Log del error para depuración
            return res.status(400).json({ message: error.message });
        }
        console.error(error.message); // Log del error para depuración
        return res.status(500).json("Internal Server Error")
    }
    }

    public async patchRewardClaimStatus(req: Request, res: Response) {


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
            const rewardId = req.params.rewardId as string;
            const result = await UpdateRewardStatusUseCase(rewardId, decodedToken.sub, req.body.status);

            res.status(200).json(result);


        }   catch (error: any) {
        // Manejo de errores de negocio desde el UseCase
        if(error.message.includes("Bad Request")){
            console.error(error.message); // Log del error para depuración
            return res.status(400).json({ message: error.message });
        }
        console.error(error.message); // Log del error para depuración
        return res.status(500).json("Internal Server Error")
        
    }
    }
}