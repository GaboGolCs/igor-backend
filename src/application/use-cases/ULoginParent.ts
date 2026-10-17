import { UserEntity } from "../../domain/entities/UserEnt.js";
import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { createJWToken } from "../../infrastructure/security/createJWToken.js";
import { verifyPassword } from "../../infrastructure/security/verifyPasswd.js";
import { AuthResponseDTO } from "../dtos/AuthResponseDTO.js";
import { mapUserEntityToAuthResponseDTO } from "../mappers/AuthResponseMapper.js";
export async function LoginParent(email: string, passwordProvided: string): Promise<AuthResponseDTO | null> {
    const UserRepoInstance = new UserRepo()
    let userFound: UserEntity | null;

    try {

        if(!email || !passwordProvided) {
            console.error("Email o contraseña no proporcionados")
            throw new Error("Email o contraseña no proporcionados")
        }

        userFound = await UserRepoInstance.findByEmail(email)
        if(!userFound) {
            console.log("Usuario no encontrado")
            throw new Error("Usuario no encontrado")
        }
    } catch (error) {
        console.error(error)
        throw error
    }

    try {
        const passComparation = await verifyPassword(userFound.password_hash, passwordProvided)
        if(!passComparation) {
            console.log("Contraseña incorrecta")
            throw new Error("Contraseña incorrecta")
        }
    }catch (error) {
        console.error(error)
        throw error
    } 

    try {
        if(userFound.email === null) {
            console.error("Error de consistencia de datos: Email del usuario es null y no debería serlo")
            throw new Error("Error de consistencia de datos: Email del usuario es null y no debería serlo")
        }

        // Usamos el usuario de la BD: createParent generaría un id nuevo y el token no apuntaría al usuario real
        const _user = userFound
        const tokenToSend = createJWToken(_user)
        if(!tokenToSend) {
            console.error("Error al crear el token")
            throw new Error("Error al crear el token")
        }
        return mapUserEntityToAuthResponseDTO(_user, tokenToSend) 

    }catch (error) {
        console.error(error)
        throw error
    }
}
