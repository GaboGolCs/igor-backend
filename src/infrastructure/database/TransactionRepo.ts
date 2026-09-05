import { TransactionRepoContract } from "../../domain/repoContracts/TransactionRepoContract.js";
import {prisma} from "./prisma.js"
export class TransactionRepo implements TransactionRepoContract{

    constructor(){
        return this
    }

    public async executeTransaction(x: Function): Promise<object | null> {
        try {
            const transactionResponse = await prisma.$transaction( async (tx) => {
                return await x(tx)
            }) 
            return transactionResponse
        } catch (error) {
            console.error(error) 
            throw error   
        } 
    
    }
}
