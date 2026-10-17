//Los repositorios son contratos que definen las operaciones que se pueden realizar sobre las entidades del dominio.
//En este caso las operaciones que se pueden realizar sobre la entidad UserEntity en la base de datos.

import { FamilyEntity } from "../entities/FamilyEnt.js";
import {UserEntity} from "../entities/UserEnt.js";

export interface UserRepoContract{

    // db: cliente de transacción opcional (se tipa en la implementación de infraestructura)
    createUser(newUser: UserEntity, _family:FamilyEntity, db?: unknown): Promise<object | null>;

    findByEmail(mail: string): Promise<UserEntity | null>; 


    findByAlias(alias: string): Promise<UserEntity | null>

    findById(id: string): Promise<UserEntity | null>

    updatePassword(userId: string, passwordHash: string): Promise<void>


}