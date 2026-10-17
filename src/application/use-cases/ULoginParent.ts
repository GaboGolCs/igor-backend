import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { createJWToken } from "../../infrastructure/security/createJWToken.js";
import { verifyPassword } from "../../infrastructure/security/verifyPasswd.js";
import { AuthResponseDTO } from "../dtos/AuthResponseDTO.js";
import { mapUserEntityToAuthResponseDTO } from "../mappers/AuthResponseMapper.js";
import { UnauthorizedError } from "../errors/AppError.js";

// Mismo mensaje para usuario inexistente y contraseña incorrecta: no revela qué emails existen
export const invalidCredentials = () =>
    new UnauthorizedError("Credenciales incorrectas", "INVALID_CREDENTIALS")

export async function LoginParent(email: string, passwordProvided: string): Promise<AuthResponseDTO> {
    const userFound = await new UserRepo().findByEmail(email)

    // El login por email es solo para apoderados
    if(!userFound || userFound.role !== "PARENT") {
        throw invalidCredentials()
    }

    if(!await verifyPassword(userFound.password_hash, passwordProvided)) {
        throw invalidCredentials()
    }

    // Usamos el usuario de la BD: createParent generaría un id nuevo y el token no apuntaría al usuario real
    const tokenToSend = createJWToken(userFound)
    return mapUserEntityToAuthResponseDTO(userFound, tokenToSend)
}
