import { MoodEntity } from "../../domain/entities/MoodEnt.js"
import { Emotion } from "../../domain/entities/EmotionEnt.js"
import { MoodRepo } from "../../infrastructure/database/MoodRepo.js"
export async function registerMoodUC(emotion: Emotion, activityText: string, needText: string, childId: string): Promise<boolean>{

    try {
        const moodRepoInstance = new MoodRepo()

        const _newMood = MoodEntity.createMood(childId, emotion, activityText, needText)
        const savedMood = await moodRepoInstance.SaveMood(_newMood)
        if(!savedMood){
            throw new Error("Interno en la base de datos, no se ha podido registrar el Mood")
        }
        return true

    } catch (error) {
        console.error(error) 
        throw error   
    }
 

}