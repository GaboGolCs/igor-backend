//Contratos 
import { FamilyEntity } from "../entities/FamilyEnt.js";
export interface FamilyRepoContract{
    //Cambiar el object por un objeto conm tipo quizas crear interfaz para las respuseta 
    // db: cliente de transacción opcional (se tipa en la implementación de infraestructura)
    createFamily(_family: FamilyEntity, db?: unknown): Promise<FamilyEntity| null>
    findFamilyByParentId(parentId: string): Promise<FamilyEntity | null>
    findFamilyByUserId(id: string): Promise<FamilyEntity | null>
    
 
}
