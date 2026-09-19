import {UserEntity} from "../../domain/entities/UserEnt.js"
import { FamilyEntity } from "../../domain/entities/FamilyEnt.js";
import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { FamilyRepo } from "../../infrastructure/database/FamilyRepo.js";
import { TransactionRepo } from "../../infrastructure/database/TransactionRepo.js";
import { hashPassword } from "../../infrastructure/security/hashingPasswd.js";
import { AuthResponseDTO } from "../dtos/AuthResponseDTO.js";
import { mapUserEntityToAuthResponseDTO } from "../mappers/AuthResponseMapper.js";
import { createJWToken } from "../../infrastructure/security/createJWToken.js";

export async function CreateFamilyAndParent(familyName:string, parentEmail:string, password:string, alias:string, avatar_icon:string, timezone: string) : Promise<AuthResponseDTO | null> {


    const UserRepoInstance = new UserRepo()
    const FamilyRepoInstance = new FamilyRepo()
    const TransactionRepoInstance = new TransactionRepo()
        
    try {
        const emailFound = await UserRepoInstance.findByAlias(parentEmail) 
        if(emailFound) {
            throw new Error("Email ya registrado")
        }

        const aliasSearch = await UserRepoInstance.findByAlias(alias)    
        if(aliasSearch) {
            throw new Error("Alias ya registrado")
        }

        const hashedPassword = await hashPassword(password)
        //aqui
        const _familiy = FamilyEntity.createFamily(familyName)
        const _user = UserEntity.createParent(parentEmail,hashedPassword,avatar_icon, _familiy.id, alias, timezone)

        const tokenToSend = createJWToken(_user) 
        if(!tokenToSend) {
            console.error("Error al crear el token")
            throw new Error("Error al crear el token")
        }

        const transactionSend = await TransactionRepoInstance.executeTransaction(async()=>{
            await FamilyRepoInstance.createFamily(_familiy)
            await UserRepoInstance.createUser(_user,_familiy)
        })    

        return mapUserEntityToAuthResponseDTO(_user, tokenToSend)


    }
    catch(error){
        console.error(error)
        throw error
    }

}