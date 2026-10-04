import {prisma} from "./prisma.js"
import { UserEntity } from "../../domain/entities/UserEnt.js";
import { UserRepoContract } from "../../domain/repoContracts/UserRepoContract.js";
import { FamilyEntity } from "../../domain/entities/FamilyEnt.js";


 export class UserRepo implements UserRepoContract{

    constructor(){
        return this
    }

     public async createUser(_user: UserEntity, _family:FamilyEntity): Promise<object | null> {
        try {
            const dbResponse = await prisma.user.create({data: {
                id: _user.id,
                email: _user.email,
                password_hash: _user.password_hash,
                alias: _user.alias,
                avatar_icon: _user.avatar_icon,
                role: _user.role,
                family_id: _family.id,
                timezone: _user.timezone

                }})
            console.log("Usuario Creado con exito")
            return dbResponse;
        } catch (error) {
            console.error(error)
            throw error
        }
        
    }


    public async findByEmail(emailToFind: string): Promise<UserEntity | null> {
        if (!emailToFind) return null;
        try {
            const  response = await prisma.user.findUnique({
                where: {email: emailToFind},
            })
          
            return response as UserEntity

        } catch (error) {
            console.error(error, "Error al encontrar el email")    
            return null        
        }

    
        
    }

    public async findByAlias(alias: string): Promise<UserEntity | null> { 
        if (!alias) return null;
       try {
            const userFound = await prisma.user.findUnique({
                where: {alias: alias}
             })
            return userFound as UserEntity

       }catch (error) {
            console.error(error)
            return null
       }
            }

    public async findById(id: string): Promise<UserEntity | null> { 
        if (!id) return null;
       try {
            const userFound = await prisma.user.findUnique({
                where: {id: id}
             })
            return userFound as UserEntity

       }catch (error) {
            console.error(error)
            return null
       }
            }


}