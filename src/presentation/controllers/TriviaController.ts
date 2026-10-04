import { Request, Response } from 'express';
import { GetRandomTriviaUseCase } from '../../application/use-cases/UGetRandomTrivia.js';
import { extractTokenFromHeader } from '../validators/HExtractTokenInfo.js';
import { verifyJWToken } from '../../infrastructure/security/verifyJWToken.js';

export class TriviaController {
    constructor() {}

    public async getRandomQuestion (req: Request, res: Response) {
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


      const questionDto = await GetRandomTriviaUseCase();
      
      return res.status(200).json(questionDto);

    } catch (error: any) {
        if(error.message.startsWith("Intern")){
            return res.status(500).json({message: "Error: " + error.message})
        }
        
        return res.json({message: "Error: " + error.message});
        } 
  }
}