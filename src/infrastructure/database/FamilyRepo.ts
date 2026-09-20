import {prisma} from "./prisma.js"
import { FamilyEntity } from "../../domain/entities/FamilyEnt.js";
import { FamilyRepoContract } from "../../domain/repoContracts/FamilyRepoContract.js";
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

    public async findFamilyByParentId(parentId: string): Promise<FamilyEntity | null> {
        try {
            const family = await prisma.family.findFirst({
                where: {
                    users: {
                        some: {
                            id: parentId,
                            role: 'PARENT'
                        }
                    }
                }
            });
            return family as unknown as FamilyEntity;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }


    public async findFamilyByUserId(id: string): Promise<FamilyEntity | null> {
        try {
            const family = await prisma.family.findFirst({
                where: {
                    users: {
                        some: {
                            id: id,
                        }
                    }
                }
            });
            return family as unknown as FamilyEntity;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    //public addMember(familyId: FamilyEntity['id'], userId: string): Promise<void>{}
    
    //public changeName(familyId: FamilyEntity['id'], newName: string): Promise<void>{}

 
 }