//Contratos 
import { FamilyEntity } from "../entities/FamilyEnt.js";
export interface FamilyRepoContract{
    //Cambiar el object por un objeto conm tipo quizas crear interfaz para las respuseta 
    createFamily(_family: FamilyEntity): Promise<FamilyEntity| null>
    findFamilyByParentId(parentId: string): Promise<FamilyEntity | null>
    findFamilyByUserId(id: string): Promise<FamilyEntity | null>
    
 
}
