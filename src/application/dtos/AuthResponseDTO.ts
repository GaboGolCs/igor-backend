import { Role } from "../../domain/entities/RoleEnt.js";

export interface AuthResponseDTO{
    accessToken: string,
    refreshToken: string,
    user: {
        id: string,
        role: Role,
    }
}
