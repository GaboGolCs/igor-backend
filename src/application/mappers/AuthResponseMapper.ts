import { UserEntity } from "../../domain/entities/UserEnt.js";
import { Role } from "../../domain/entities/RoleEnt.js";
import { AuthResponseDTO } from "../dtos/AuthResponseDTO.js";
export function mapUserEntityToAuthResponseDTO(userEntity: UserEntity, accessToken: string): AuthResponseDTO {
    return {
        id: userEntity.id,
        role: userEntity.role,
        accessToken: accessToken
    };
}