import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { verifyPassword } from "../../infrastructure/security/verifyPasswd.js";
import {createJWToken} from "../../infrastructure/security/createJWToken.js"
import { UserEntity } from "../../domain/entities/UserEnt.js";
export async function LoginChild(alias: string, passwordProvided: string){
    const UserRepoInstance = new UserRepo()
   
    let userFound: UserEntity | null;
    try {
        if(!alias || !passwordProvided) {
            console.error("Alias o contraseña no proporcionados")
            throw new Error("Alias o contraseña no proporcionados")
        } 

        userFound = await UserRepoInstance.findByAlias(alias)
        if(!userFound) {
            console.error("Usuario no encontrado")
            throw new Error("Usuario no encontrado")
        }
    } catch (error) {
       console.error(error)
       throw error 
    }

    try { 
        ////ENVIAR EL ERROR A LA CAPA DE PRESENTACION PARA QUE SEAPA QUE FALLÓ LA CONTRASEÑA
        const passComparation = await verifyPassword(userFound.password_hash, passwordProvided)
        if(!passComparation) {
            console.error("Contraseña incorrecta")
            throw new Error("Contraseña incorrecta")
        }

    } catch (error) {
        console.error(error)
        throw error
    }

    try {

        const tokenToSend = createJWToken(userFound) 
        if(!tokenToSend) {
            console.error("Error al crear el token")
            throw new Error("Error al crear el token")
        }
        return tokenToSend
    } catch (error) {
        console.log(error)
        throw error
    }
    
}