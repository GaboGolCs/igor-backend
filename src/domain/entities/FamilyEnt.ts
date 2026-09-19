import { randomUUID } from "node:crypto";


//Se deben crear las entidades y añadir sus llaves foranes solo si es una entidad dependiente.
export class FamilyEntity {
    public readonly id: string;
    public readonly name: string;
    public readonly code: string;
    public readonly createdAt: Date;
    constructor(id: string, name: string, code: string, createdAt: Date ){
        this.id = id,
        this.name = name,
        this.code = code,
        this.createdAt = createdAt
    }

    public static createFamily(name: string): FamilyEntity{
 
         const id =  randomUUID()
         const code =  FamilyEntity.genSecureCode()
         const createdAt =  new Date()
        
        return new FamilyEntity(id, name, code, createdAt, )
        
    }

    
    private static genSecureCode(): string {
        const charset = '123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Sin 0 ni O
        let code = '';
        for (let i = 0; i < 10; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            code += charset[randomIndex];
        }
    return code;
  }
}
