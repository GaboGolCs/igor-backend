import { MoodEntity } from "../../domain/entities/MoodEnt.js";
import { MoodContract } from "../../domain/repoContracts/MoodRepoContracts.js";
import {prisma} from "./prisma.js"
import { MoodAnalyticsResult } from "../../domain/repoContracts/MoodResponseContracts.js";
import { Emotion } from "../../prisma/enums.js";
export class MoodRepo implements MoodContract {

    constructor(){
        return this
    }

    public async SaveMood(newMood: MoodEntity): Promise<MoodEntity> {
       
        try {
            const moodSaved =  await prisma.moodLog.create({
                data: {
                id: newMood.id,
                user_id: newMood.user_id,
                emotion: newMood.emotion,
                activity_text: newMood.activity_text,
                need_text: newMood.need_text,
                logged_at: newMood.logged_at
                }
            }) 

            if (!moodSaved){
                throw new Error("Error al guardar el Mood")
            }
            
            return moodSaved as MoodEntity 

        } catch (error) {
           throw error; 
        }
        


    }

async getMonthlyAnalytics(childId: string, month: number, year: number  ): Promise<MoodAnalyticsResult> {
    // 1. Definición del rango exacto del mes[cite: 1, 2]
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // 2. Agregación en base de datos usando el índice compuesto (user_id, logged_at)
    const groupedMoods = await prisma.moodLog.groupBy({
      by: ['emotion'],
      where: {
        user_id: childId,
        logged_at: {
          gte: startDate,
          lt: endDate,
        },
      },
      _count: {
        emotion: true,
      },
    });

    // Conteo de Emociones durante el Mes
    const emotionBreakdown: Record<Emotion, number> = {
      HAPPY: 0,
      SAD: 0,
      ANXIOUS: 0,
      NEUTRAL: 0,
      ANGRY: 0,
    };

    let totalLogs = 0;

    // Cuenta cuantos logs hay en total
    groupedMoods.forEach((group) => {
      const count = group._count.emotion;
      emotionBreakdown[group.emotion] = count;
      totalLogs += count;
    });

    //Para una funcionalidad futura quizas devolvamos la fecha para mas graficos en el front
    return {
      totalLogs,
      emotionBreakdown,
    };
  }
    
}