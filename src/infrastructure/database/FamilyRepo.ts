import {prisma} from "./prisma.js"
import { UserEntity } from "../../domain/entities/UserEnt.js";
import { FamilyEntity } from "../../domain/entities/FamilyEnt.js";
import { FamilyRepoContract } from "../../domain/repoContracts/FamilyRepoContract.js";
import { UserRepoContract } from "../../domain/repoContracts/UserRepoContract.js";
import { TransactionRepoContract } from "../../domain/repoContracts/TransactionRepoContract.js";
export class FamilyRepo implements FamilyRepoContract{

    constructor(){
        return this
    }


    async createFamily(_family: FamilyEntity): Promise<FamilyEntity | null> {
      
        try {
            const _familyCreated = await prisma.family.create({
                data:{
                    id: _family.id,
                    name: _family.name,
                    code: _family.code,
                    created_at: _family.createdAt
                }
            })

            return _familyCreated as unknown as FamilyEntity
   
        } catch (error) {
           console.error(error)
           return null
        }

    }
    //public findById(id: FamilyEntity['id']): Promise<FamilyEntity | null>{}

    //public addMember(familyId: FamilyEntity['id'], userId: string): Promise<void>{}
    
    //public changeName(familyId: FamilyEntity['id'], newName: string): Promise<void>{}

 
 }