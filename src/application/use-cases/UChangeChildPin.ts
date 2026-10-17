import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { hashPassword } from "../../infrastructure/security/hashingPasswd.js";
import { NotFoundError, sessionUserNotFound } from "../errors/AppError.js";
import { revokeAllSessions } from "./USession.js";


export class UChangeChildPin{
    constructor(){}

    public static async changePin(parentId: string, childId: string, newPin: string ): Promise <void>{
        const userRepoInstance = new UserRepo()

        const _parent = await userRepoInstance.findById(parentId)
        if(!_parent){
            throw sessionUserNotFound()
        }

        // Inexistente, no es niño o es de otra familia: mismo 404 para no revelar ids ajenos
        const _child = await userRepoInstance.findById(childId)
        if(!_child || _child.role !== "CHILD" || _child.family_id !== _parent.family_id){
            throw new NotFoundError("No existe un niño con esa id en tu familia", "CHILD_NOT_FOUND")
        }

        const pinHashed = await hashPassword(newPin)
        await userRepoInstance.updatePassword(_child.id,pinHashed)

        // El niño debe volver a entrar con el PIN nuevo en todos sus dispositivos
        await revokeAllSessions(_child.id)
    }
}
