import {prisma} from "./prisma.js"
import type { Prisma } from "../../prisma/client.js";
import { FamilyEntity } from "../../domain/entities/FamilyEnt.js";
import { FamilyRepoContract } from "../../domain/repoContracts/FamilyRepoContract.js";
export class FamilyRepo implements FamilyRepoContract{

    constructor(){
        return this
    }


    // db: cliente de transacción (tx) cuando se llama dentro de executeTransaction
    async createFamily(_family: FamilyEntity, db: Prisma.TransactionClient = prisma): Promise<FamilyEntity> {
        // Si falla se lanza el error para que la transacción se revierta
        const _familyCreated = await db.family.create({
            data:{
                id: _family.id,
                name: _family.name,
                code: _family.code,
                created_at: _family.createdAt
            }
        })

        return _familyCreated as unknown as FamilyEntity
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