import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { createJWToken } from "../../infrastructure/security/createJWToken.js";
import { UserEntity } from "../../domain/entities/UserEnt.js";
import { FamilyRepo } from "../../infrastructure/database/FamilyRepo.js";
import { hashPassword } from "../../infrastructure/security/hashingPasswd.js";
import { mapChildEntityToChildResponseDTO } from "../mappers/ChildRegResponseMapper.js";
import { ChildResponseDTO } from "../dtos/ChildResponseDTO.js";


export async function RegChild(alias:string, password:string, avatar_icon:string, parentID: string) : Promise<ChildResponseDTO | null> {
    const UserRepoInstance = new UserRepo()
    const familyRepoInstance = new FamilyRepo()
    try{

        const aliasSearch = await UserRepoInstance.findByAlias(alias)
        if(aliasSearch) {
            const error = new Error("Alias ya registrado")
            throw error
        }

        const familyFound = await familyRepoInstance.findFamilyByParentId(parentID)
        if(!familyFound) {
            throw new Error("No se encontró la familia del padre")
        }

        const hashedPassword = await hashPassword(password)

        const _parent = await UserRepoInstance.findById(parentID)
        if(!_parent){
            throw new Error("Bad Request: No existe un padre para la id enviada")
        }

        const _user = UserEntity.createChild(hashedPassword, alias, avatar_icon, familyFound.id, _parent.timezone)

        const childSaved = await UserRepoInstance.createUser(_user, familyFound)
        if(!childSaved) {
            throw new Error("Error al crear el usuario hijo")
        }

        const tokenToSend = createJWToken(_user)
        if(!tokenToSend) {
            console.error("Error al crear el token")
            throw new Error("Error al crear el token")
        }

        return mapChildEntityToChildResponseDTO(parentID, _user) 
     
    } catch (error) {
        console.error(error)
        throw error
    }

        
}