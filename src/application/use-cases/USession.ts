import { UserEntity } from "../../domain/entities/UserEnt.js";
import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { createJWToken } from "../../infrastructure/security/createJWToken.js";
import { RedisRefreshTokenRepository } from "../../infrastructure/messaging/RedisRefreshTokenRepo.js";
import { AuthResponseDTO } from "../dtos/AuthResponseDTO.js";
import { mapUserEntityToAuthResponseDTO } from "../mappers/AuthResponseMapper.js";
import { UnauthorizedError, sessionUserNotFound } from "../errors/AppError.js";

// Sesión = access token corto (JWT) + refresh token largo (opaco, en Redis, de un solo uso)

export async function issueSession(user: UserEntity): Promise<AuthResponseDTO> {
    const accessToken = createJWToken(user)
    const refreshToken = await new RedisRefreshTokenRepository().issue(user.id)
    return mapUserEntityToAuthResponseDTO(user, accessToken, refreshToken)
}

export async function refreshSession(refreshToken: string): Promise<AuthResponseDTO> {
    const refreshTokenRepo = new RedisRefreshTokenRepository()

    const stored = await refreshTokenRepo.consume(refreshToken)
    if (!stored) {
        throw new UnauthorizedError("La sesión expiró o no es válida", "REFRESH_TOKEN_INVALID")
    }

    // Un token ya usado que vuelve a aparecer indica que fue copiado: se cierran todas las sesiones
    if (stored.used) {
        await refreshTokenRepo.revokeAll(stored.userId)
        throw new UnauthorizedError("La sesión fue revocada por seguridad. Inicia sesión nuevamente.", "REFRESH_TOKEN_REUSED")
    }

    // El rol y los datos se leen desde la BD, no desde la sesión anterior
    const user = await new UserRepo().findById(stored.userId)
    if (!user) {
        await refreshTokenRepo.revokeAll(stored.userId)
        throw sessionUserNotFound()
    }

    return await issueSession(user)
}

export async function logoutSession(refreshToken: string): Promise<void> {
    await new RedisRefreshTokenRepository().revoke(refreshToken)
}

// Cierra todas las sesiones del usuario (tras cambiar su contraseña o PIN)
export async function revokeAllSessions(userId: string): Promise<void> {
    await new RedisRefreshTokenRepository().revokeAll(userId)
}
