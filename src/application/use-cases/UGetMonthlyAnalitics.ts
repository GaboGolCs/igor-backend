import { UserRepo } from "../../infrastructure/database/UserRepo.js"
import { MoodRepo } from "../../infrastructure/database/MoodRepo.js"
import { MoodAnalyticsResult } from "../../domain/repoContracts/MoodResponseContracts.js"

export async function getMonthlyAnalitics(childId: string, month: number, year: number): Promise<MoodAnalyticsResult>{

    try {     
            const userRepoInstance = new UserRepo()
            const searchedUser = await userRepoInstance.findById(childId)
            if(!searchedUser){
               throw new Error("Bad request, No existe un usuario con la id enviada") 
            }

            const moodRepoInstace = new MoodRepo()
            const searchedAnalitics = moodRepoInstace.getMonthlyAnalytics(searchedUser.id, month, year)
            return searchedAnalitics 

        } catch (error) {
            console.error(error)
           throw error 
        }
}