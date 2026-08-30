import { FamilyRepoContract } from "./FamilyRepoContract.js"
import { UserRepoContract } from "./UserRepoContract.js"

export interface TransactionRepoContract{
    executeTransaction(x:Function):Promise<object | null>
}