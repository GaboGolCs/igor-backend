import {UserEntity} from "../../domain/entities/UserEnt.js"
import { FamilyEntity } from "../../domain/entities/FamilyEnt.js";
import { UserRepoContract } from "../../domain/repoContracts/UserRepoContract.js";
import { FamilyRepoContract } from "../../domain/repoContracts/FamilyRepoContract.js";
import { TransactionRepoContract } from "../../domain/repoContracts/TransactionRepoContract.js";
import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { FamilyRepo } from "../../infrastructure/database/FamilyRepo.js";
import { TransactionRepo } from "../../infrastructure/database/TransactionRepo.js";
// Ademas no debe comprobar si los datos son null o no
// Crear el nuevo Entity de User con clase.

//createParent(mail: string, passwordHash: string, icon: string, alias: string | null, familyId: string | null): Promise<UserEntity | null>;
export async function CreateFamilyAndParent(familyName:string, parentEmail:string, hashed_Passwd:string, alias:string, avatar_icon:string) : Promise<(UserEntity & FamilyEntity) | null> {


    const UserRepoInstance = new UserRepo()
    const FamilyRepoInstance = new FamilyRepo()
    const TransactionRepoInstance = new TransactionRepo()

    const _familiy = FamilyEntity.createFamily(familyName)
    const _user = UserEntity.createParent(parentEmail,hashed_Passwd,avatar_icon, _familiy.id, alias)
    
    
    // A Parent Need a unique Email to Register
    try {
        const emailFound = await UserRepoInstance.findByAlias(parentEmail) 
    }
    catch(error){
        console.error(error)
        return null
    }


    try {
    
        const aliasSearch = await UserRepoInstance.findByAlias(_user.alias)    
         
    } catch (error) {
       console.error(error) 
       return null
    }

        
    try {
        
    } catch (error) {
         const transactionSend = await TransactionRepoInstance.executeTransaction(async()=>{
            await FamilyRepoInstance.createFamily(_familiy)
            await UserRepoInstance.createUser(_user,_familiy)
         }) 
    }
        return null; 



}