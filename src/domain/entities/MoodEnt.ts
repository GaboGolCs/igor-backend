import {randomUUID} from "crypto";
import { Emotion } from "./EmotionEnt.js";
export class MoodEntity {
    public readonly id: string
    public readonly user_id: string
    public readonly emotion: Emotion
    public readonly activity_text: string
    public readonly need_text: string
    public readonly logged_at: Date

    constructor(id: string, user_id:string, emotion: Emotion, activity_text:string, need_text: string, logged_at: Date){
        this.id = id,
        this.user_id = user_id,
        this.emotion = emotion,
        this.activity_text = activity_text,
        this.need_text = need_text,
        this.logged_at = logged_at 
        return this
    }

    public static createMood(user_id: string, emotion: Emotion, activity_text:string, need_text: string): MoodEntity{
        const id = randomUUID()
        const logged_at = new Date
        return new MoodEntity(id, user_id, emotion, activity_text, need_text, logged_at)
    }

}