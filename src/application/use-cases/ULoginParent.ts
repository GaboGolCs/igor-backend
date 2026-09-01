import { FamilyEntity } from "../../domain/entities/FamilyEnt.js";
import { UserRepo } from "../../infrastructure/database/UserRepo.js";
import { verifyPassword } from "../../infrastructure/security/verifyPasswd.js";

export async function LoginChild(alias: string, passwordProvided: string){
    const UserRepoInstance = new UserRepo()
   
    let queryUserFound
    try {
        queryUserFound = await UserRepoInstance.findByAlias(alias)
    } catch (error) {
       console.log(error)
       return null 
    }

    try { 
        const passComparation = await verifyPassword(queryUserFound.password_hash, passwordProvided)
    } catch (error) {
        
    }

    
}