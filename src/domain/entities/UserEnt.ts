import { randomUUID } from "node:crypto";
import { Role } from "../entities/RoleEnt.js";
export  class UserEntity{

    public readonly id: string
    public readonly email:string | null
    public readonly password_hash: string
    public readonly alias: string
    public readonly role: Role
    public readonly avatar_icon: string
    public readonly family_id:string

    constructor(id:string, email: string | null, password_hash:string, alias:string, role:Role, avatar_icon:string, family_id:string){
        
        this.id = id, 
        this.email = email,
        this.password_hash = password_hash,
        this.alias = alias,
        this.role = role,
        this.avatar_icon = avatar_icon
        this.family_id = family_id
        }

    static createParent(email:string, password_hash:string, avatar_icon:string, family_id:string, alias:string){
       const id = randomUUID()
       const role = Role.PARENT
       return new UserEntity(id, email, password_hash, alias, role, avatar_icon, family_id)
    }

    static createChild(password_hash:string, alias:string, avatar_icon:string, family_id:string){
        const id = randomUUID()
        const role = Role.CHILD
        const email = null 
       return new UserEntity(id, email, password_hash, alias, role, avatar_icon, family_id)
    }


}
