import { UserRepo } from "../../infrastructure/database/UserRepo.js"
import { MoodRepo } from "../../infrastructure/database/MoodRepo.js"
import { MoodAnalyticsResult } from "../../domain/repoContracts/MoodResponseContracts.js"
import { NotFoundError, sessionUserNotFound } from "../errors/AppError.js"

export async function getMonthlyAnalitics(parentId: string, childId: string, month: number, year: number): Promise<MoodAnalyticsResult>{
    const userRepoInstance = new UserRepo()

    const _parent = await userRepoInstance.findById(parentId)
    if(!_parent){
        throw sessionUserNotFound()
    }

    // Un apoderado solo puede ver las estadísticas de los niños de su propia familia
    const _child = await userRepoInstance.findById(childId)
    if(!_child || _child.role !== "CHILD" || _child.family_id !== _parent.family_id){
        throw new NotFoundError("No existe un niño con esa id en tu familia", "CHILD_NOT_FOUND")
    }

    return await new MoodRepo().getMonthlyAnalytics(_child.id, month, year)
}
