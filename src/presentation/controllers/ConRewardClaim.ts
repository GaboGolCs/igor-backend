import { Request, Response } from 'express';
import { ClaimRewardUseCase } from '../../application/use-cases/UClaimReward.js';
import { extractTokenFromHeader } from '../validators/HExtractTokenInfo.js';
import { verifyJWToken } from '../../infrastructure/security/verifyJWToken.js';

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
            if(error.message.startsWith("Intern")){
                return res.status(500).json({message: "Error: " + error.message})
        }
                return res.json({message: "Error: " + error.message});
        } 

    }
}