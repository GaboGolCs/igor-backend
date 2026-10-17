import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { UserEntity } from "../../domain/entities/UserEnt.js";
import { FamilyRepo } from "../../infrastructure/database/FamilyRepo.js";
import { hashPassword } from "../../infrastructure/security/hashingPasswd.js";
import { mapChildEntityToChildResponseDTO } from "../mappers/ChildRegResponseMapper.js";
import { ChildResponseDTO } from "../dtos/ChildResponseDTO.js";
import { ConflictError, sessionUserNotFound } from "../errors/AppError.js";


export async function RegChild(alias:string, password:string, avatar_icon:string, parentID: string) : Promise<ChildResponseDTO> {
    const UserRepoInstance = new UserRepo()
    const familyRepoInstance = new FamilyRepo()

    const _parent = await UserRepoInstance.findById(parentID)
    const familyFound = await familyRepoInstance.findFamilyByParentId(parentID)
    if(!_parent || !familyFound) {
        throw sessionUserNotFound()
    }

    if(await UserRepoInstance.findByAlias(alias)) {
        throw new ConflictError("Alias ya registrado", "ALIAS_TAKEN")
    }

    const hashedPassword = await hashPassword(password)

    // createChild fija email = null: un niño nunca tiene correo (también lo exige un CHECK en la BD)
    const _user = UserEntity.createChild(hashedPassword, alias, avatar_icon, familyFound.id, _parent.timezone)
    await UserRepoInstance.createUser(_user, familyFound)

    return mapChildEntityToChildResponseDTO(parentID, _user)
}
