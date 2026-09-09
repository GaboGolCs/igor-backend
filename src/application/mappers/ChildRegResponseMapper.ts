import { ChildResponseDTO } from "../dtos/ChildResponseDTO.js";
import { UserEntity } from "../../domain/entities/UserEnt.js";
export function mapChildEntityToChildResponseDTO(parentID:string, childUser: UserEntity): ChildResponseDTO {
    return {
        id: childUser.id,
        parentId: parentID,
        alias: childUser.alias,
        role: childUser.role
    };
}