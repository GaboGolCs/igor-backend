import { Role } from "../../domain/entities/RoleEnt.js";

export interface AuthResponseDTO{
    accessToken: string,
    user: {
        id: string,
        role: Role,
    }
}