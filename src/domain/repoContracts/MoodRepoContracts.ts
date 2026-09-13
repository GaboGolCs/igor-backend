import { MoodEntity } from "../entities/MoodEnt.js";
import { MoodAnalyticsResult } from "./MoodResponseContracts.js";

export interface MoodContract{
    SaveMood(newMood : MoodEntity): Promise<MoodEntity>
    getMonthlyAnalytics(childId: string, month: number, year: number  ): Promise<MoodAnalyticsResult>
}