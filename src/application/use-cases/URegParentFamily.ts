import {UserEntity} from "../../domain/entities/UserEnt.js"
import { FamilyEntity } from "../../domain/entities/FamilyEnt.js";
import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { FamilyRepo } from "../../infrastructure/database/FamilyRepo.js";
import { TransactionRepo } from "../../infrastructure/database/TransactionRepo.js";
import type { Prisma } from "../../prisma/client.js";
import { hashPassword } from "../../infrastructure/security/hashingPasswd.js";
import { AuthResponseDTO } from "../dtos/AuthResponseDTO.js";
import { mapUserEntityToAuthResponseDTO } from "../mappers/AuthResponseMapper.js";
import { createJWToken } from "../../infrastructure/security/createJWToken.js";
import { ConflictError } from "../errors/AppError.js";

export async function CreateFamilyAndParent(familyName:string, parentEmail:string, password:string, alias:string, avatar_icon:string, timezone: string) : Promise<AuthResponseDTO> {

    const UserRepoInstance = new UserRepo()
    const FamilyRepoInstance = new FamilyRepo()
    const TransactionRepoInstance = new TransactionRepo()

    if(await UserRepoInstance.findByEmail(parentEmail)) {
        throw new ConflictError("Email ya registrado", "EMAIL_TAKEN")
    }

    if(await UserRepoInstance.findByAlias(alias)) {
        throw new ConflictError("Alias ya registrado", "ALIAS_TAKEN")
    }

    const hashedPassword = await hashPassword(password)
    const _familiy = FamilyEntity.createFamily(familyName)
    const _user = UserEntity.createParent(parentEmail,hashedPassword,avatar_icon, _familiy.id, alias, timezone)

    const tokenToSend = createJWToken(_user)

    // Ambas inserciones usan el mismo tx: si una falla, se revierte la otra
    await TransactionRepoInstance.executeTransaction(async(tx: Prisma.TransactionClient)=>{
        await FamilyRepoInstance.createFamily(_familiy, tx)
        await UserRepoInstance.createUser(_user,_familiy, tx)
    })

    return mapUserEntityToAuthResponseDTO(_user, tokenToSend)
}
