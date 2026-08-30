//Los repositorios son contratos que definen las operaciones que se pueden realizar sobre las entidades del dominio.
//En este caso las operaciones que se pueden realizar sobre la entidad UserEntity en la base de datos.

import { User } from "../../prisma/generated/client.js";
import { FamilyEntity } from "../entities/FamilyEnt.js";
import {UserEntity} from "../entities/UserEnt.js";

export interface UserRepoContract{

    //Creaciónes de usuario
    createUser(newUser: UserEntity, _family:FamilyEntity): Promise<object | null>;

    //Busquedas de usuario
    findByEmail(mail: string): Promise<UserEntity | null>; 

    //findByAlias(alias: string ): Promise<UserEntity | null>;

    findByAlias(alias: string): Promise<UserEntity | null>
    //Actualizar usuario
    //changePassword(userId: UserEntity['id'], newPasswordHash: string): Promise<void>;
    
    //changeAvatarIcon(userId: UserEntity['id'], newIcon: string): Promise<void>;
    //changeAlias(userId: UserEntity['id'], newAlias: string): Promise<void>;



}