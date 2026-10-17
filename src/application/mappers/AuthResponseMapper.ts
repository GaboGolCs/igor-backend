import { UserEntity } from "../../domain/entities/UserEnt.js";
import { AuthResponseDTO } from "../dtos/AuthResponseDTO.js";
export function mapUserEntityToAuthResponseDTO(userEntity: UserEntity, accessToken: string, refreshToken: string): AuthResponseDTO {
    // Forma definida en openapi.yaml (AuthResponse)
    return {
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: {
            id: userEntity.id,
            role: userEntity.role
        }
    };
}
