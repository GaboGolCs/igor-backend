import { UserEntity } from "../../domain/entities/UserEnt.js";
import { Role } from "../../domain/entities/RoleEnt.js";
import { AuthResponseDTO } from "../dtos/AuthResponseDTO.js";
export function mapUserEntityToAuthResponseDTO(userEntity: UserEntity, accessToken: string): AuthResponseDTO {
    // Forma definida en IGOR-API-1.3.0.yaml (AuthResponse)
    return {
        accessToken: accessToken,
        user: {
            id: userEntity.id,
            role: userEntity.role
        }
    };
}