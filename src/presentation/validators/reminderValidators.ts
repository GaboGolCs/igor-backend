import z from "zod";

export const postReminderValidator = z.object({
    recurrenceTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "recurrenceTime debe ser en el formato HH:mm"),
    title: z.string().min(2,"el largo minimo de title es de 2 caracteres").max(150,"El largo máximo de title es de 150 caracteres"),
    childId: z.uuid("La Id debe ser un string")
})