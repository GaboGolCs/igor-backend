//Los repositorios son contratos que definen las operaciones que se pueden realizar sobre las entidades del dominio.
//En este caso las operaciones que se pueden realizar sobre la entidad UserEntity en la base de datos.

import { FamilyEntity } from "../entities/FamilyEnt.js";
import {UserEntity} from "../entities/UserEnt.js";

export interface UserRepoContract{

    createUser(newUser: UserEntity, _family:FamilyEntity): Promise<object | null>;

    findByEmail(mail: string): Promise<UserEntity | null>; 


    findByAlias(alias: string): Promise<UserEntity | null>

    findById(id: string): Promise<UserEntity | null>


}