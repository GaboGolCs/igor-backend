import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { hashPassword } from "../../infrastructure/security/hashingPasswd.js";


export class UChangeChildPin{
    constructor(){}

    public static async changePin(parentId: string, childId: string, newPin: string ): Promise <void>{
        try {
            const userRepoInstance = new UserRepo()

            const _child = await userRepoInstance.findById(childId)
            if(!_child){
                throw new Error("Bad Request, no existe un usuario con la id del niño")
            }

            if(_child.role !== "CHILD"){
                throw new Error("Bad Request, la id enviada no corresponde a un niño")
            }

            const _parent = await userRepoInstance.findById(parentId)
            if(!_parent){
                throw new Error("Bad Request, No existe un padre con la id enviada en el token")
            }

            if(_parent.family_id !== _child.family_id){
                throw new Error("Bad Request, El padre y el hijo enviados no pertenecen a la misma familia")
            }

            const pinHashed = await hashPassword(newPin)
            if(!pinHashed){
                throw new Error("Internal Server Error, error al hashear el pin")
            }

            await userRepoInstance.updatePassword(_child.id,pinHashed)

        } catch (error) {
            console.error(error)
            throw error
        }

    }
}