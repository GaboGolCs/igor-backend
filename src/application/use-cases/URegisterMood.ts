import { MoodEntity } from "../../domain/entities/MoodEnt.js"
import { Emotion } from "../../domain/entities/EmotionEnt.js"
import { MoodRepo } from "../../infrastructure/database/MoodRepo.js"
import { UserRepo } from "../../infrastructure/database/UserRepo.js"
import { sessionUserNotFound } from "../errors/AppError.js"
export async function registerMoodUC(emotion: Emotion, activityText: string, needText: string | undefined, childId: string): Promise<void>{
    if(!await new UserRepo().findById(childId)){
        throw sessionUserNotFound()
    }

    // needText es opcional: se guarda como null si no viene
    const _newMood = MoodEntity.createMood(childId, emotion, activityText, needText ?? null)
    await new MoodRepo().SaveMood(_newMood)
}
