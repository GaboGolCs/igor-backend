import {Role} from "../../domain/entities/RoleEnt.js";

export interface ChildResponseDTO{
    id: string,
    parentId: string,
    alias: string,
    role: Role,
}