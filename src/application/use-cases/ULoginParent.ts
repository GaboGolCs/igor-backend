import { FamilyEntity } from "../../domain/entities/FamilyEnt.js";
import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { verifyPassword } from "../../infrastructure/security/verifyPasswd.js";
import {createJWToken} from "../../infrastructure/security/createJWToken.js"
import { UserEntity } from "../../domain/entities/UserEnt.js";
export async function LoginChild(alias: string, passwordProvided: string){
    const UserRepoInstance = new UserRepo()
   
    let queryUserFound: UserEntity | null;
    try {
        queryUserFound = await UserRepoInstance.findByAlias(alias)
    } catch (error) {
       console.log(error)
       return null 
    }

    try { 
        if(!queryUserFound) {
            console.log("Usuario no encontrado")
            return null
        }
        const passComparation = await verifyPassword(queryUserFound.password_hash, passwordProvided)
    } catch (error) {
        console.log(error)
        return null
    }

    try {
        const tokenToSend = createJWToken({queryUserFound}) 
        if(!tokenToSend) {
            console.error("Error al crear el token")
            return null
        }
        return tokenToSend
    } catch (error) {
        console.log(error)
        return null
    }

    
}