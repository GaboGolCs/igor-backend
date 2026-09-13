import {z} from "zod";

export const registerMood = z.object({
    emotion : z.enum(["HAPPY", "SAD", "ANXIOUS", "NEUTRAL", "ANGRY"], "Solo se admiten los valores: HAPPY, SAD, ANXIOUS, NEUTRAL, ANGRY"),
    activityText: z.string("Activity text es un campo string requerido"),
    needText: z.string("needText debe ser un string").optional()
})

export const monthlyStatistics = z.object({
    childId: z.coerce.string("se necesita un id para buscar").min(1),
    month: z.coerce.number().int().min(1,"El primer mes es el numero 1").max(12,"No existen mas de 12 meses"),
    year: z.coerce.number().int().min(2025, "No se admiten años menores a 2025").max(2200, "No se admiten alos mayores a 2020")
})