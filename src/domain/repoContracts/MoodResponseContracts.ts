import { Emotion } from "../entities/EmotionEnt.js";
export interface MoodAnalyticsResult {
  totalLogs: number;
  emotionBreakdown: Record<Emotion, number>;
}