import {prisma} from "./prisma.js"
import type { Prisma } from "../../prisma/client.js";
import { UserEntity } from "../../domain/entities/UserEnt.js";
import { UserRepoContract } from "../../domain/repoContracts/UserRepoContract.js";
import { FamilyEntity } from "../../domain/entities/FamilyEnt.js";

// Las búsquedas devuelven null solo si el usuario no existe; los errores de BD se propagan (→ 500)
 export class UserRepo implements UserRepoContract{

    constructor(){
        return this
    }

     // db: cliente de transacción (tx) cuando se llama dentro de executeTransaction
     public async createUser(_user: UserEntity, _family:FamilyEntity, db: Prisma.TransactionClient = prisma): Promise<object> {
        return await db.user.create({data: {
            id: _user.id,
            email: _user.email,
            password_hash: _user.password_hash,
            alias: _user.alias,
            avatar_icon: _user.avatar_icon,
            role: _user.role,
            family_id: _family.id,
            timezone: _user.timezone
        }})
    }


    public async findByEmail(emailToFind: string): Promise<UserEntity | null> {
        if (!emailToFind) return null;
        return await prisma.user.findUnique({ where: {email: emailToFind} }) as UserEntity | null
    }

    public async findByAlias(alias: string): Promise<UserEntity | null> {
        if (!alias) return null;
        return await prisma.user.findUnique({ where: {alias: alias} }) as UserEntity | null
    }

    public async findById(id: string): Promise<UserEntity | null> {
        if (!id) return null;
        return await prisma.user.findUnique({ where: {id: id} }) as UserEntity | null
    }


    public async updatePassword(id: string, newPasswd: string): Promise<void>{
        await prisma.user.update({
            where:{id: id},
            data:{password_hash: newPasswd}
        })
    }
}
