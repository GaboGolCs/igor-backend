import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { verifyPassword } from "../../infrastructure/security/verifyPasswd.js";
import {createJWToken} from "../../infrastructure/security/createJWToken.js"
import { AuthResponseDTO } from "../dtos/AuthResponseDTO.js";
import { mapUserEntityToAuthResponseDTO } from "../mappers/AuthResponseMapper.js";
import { invalidCredentials } from "./ULoginParent.js";

export async function LoginChild(alias: string, passwordProvided: string): Promise<AuthResponseDTO> {
    const userFound = await new UserRepo().findByAlias(alias)

    // El login por alias es solo para niños (un apoderado entra con su email)
    if(!userFound || userFound.role !== "CHILD") {
        throw invalidCredentials()
    }

    if(!await verifyPassword(userFound.password_hash, passwordProvided)) {
        throw invalidCredentials()
    }

    // Misma forma de respuesta que el login de padre: { accessToken, user }
    const tokenToSend = createJWToken(userFound)
    return mapUserEntityToAuthResponseDTO(userFound, tokenToSend)
}
