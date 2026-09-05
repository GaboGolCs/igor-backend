import { Role } from "../../domain/entities/RoleEnt.js";

export interface AuthResponseDTO{
    id: string,
    role: Role,
    accessToken: string
}