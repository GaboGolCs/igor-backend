import {UserEntity} from "../../domain/entities/UserEnt.js"
import { FamilyEntity } from "../../domain/entities/FamilyEnt.js";
import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { FamilyRepo } from "../../infrastructure/database/FamilyRepo.js";
import { TransactionRepo } from "../../infrastructure/database/TransactionRepo.js";
import { hashPassword } from "../../infrastructure/security/hashingPasswd.js";
import { AuthResponseDTO } from "../dtos/AuthResponseDTO.js";
import { mapUserEntityToAuthResponseDTO } from "../mappers/AuthResponseMapper.js";
import { createJWToken } from "../../infrastructure/security/createJWToken.js";
// Ademas no debe comprobar si los datos son null o no
// Crear el nuevo Entity de User con clase.

//createParent(mail: string, passwordHash: string, icon: string, alias: string | null, familyId: string | null): Promise<UserEntity | null>;
export async function CreateFamilyAndParent(familyName:string, parentEmail:string, password:string, alias:string, avatar_icon:string) : Promise<AuthResponseDTO | null> {


    const UserRepoInstance = new UserRepo()
    const FamilyRepoInstance = new FamilyRepo()
    const TransactionRepoInstance = new TransactionRepo()

        
    let emailFound: UserEntity | null;
    let aliasSearch: UserEntity | null;

    try {
        emailFound = await UserRepoInstance.findByAlias(parentEmail) 
        if(emailFound) {
            console.log("Email ya registrado")
            return null
        }
    }
    catch(error){
        console.error(error)
        return null
    }


    try {
        aliasSearch = await UserRepoInstance.findByAlias(alias)    
        if(aliasSearch) {
            console.log("Alias ya registrado")
            return null
        } 
    } catch (error) {
       console.error(error) 
       return null
    }

        
    try {
            const hashedPassword = await hashPassword(password)
            const _familiy = FamilyEntity.createFamily(familyName)
            const _user = UserEntity.createParent(parentEmail,hashedPassword,avatar_icon, _familiy.id, alias)

            const tokenToSend = createJWToken(_user) 
            if(!tokenToSend) {
                console.error("Error al crear el token")
                return null
            }

            const transactionSend = await TransactionRepoInstance.executeTransaction(async()=>{
                await FamilyRepoInstance.createFamily(_familiy)
                await UserRepoInstance.createUser(_user,_familiy)
            })    
            


            return mapUserEntityToAuthResponseDTO(_user, tokenToSend)
    } catch (error) {
        console.error(error)
        return null
     
    }


}