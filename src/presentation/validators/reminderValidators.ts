import z from "zod";

const recurrenceTimeSchema = z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "recurrenceTime debe ser en el formato HH:mm")
const titleSchema = z.string().min(2,"el largo minimo de title es de 2 caracteres").max(150,"El largo máximo de title es de 150 caracteres")

export const postReminderValidator = z.object({
    recurrenceTime: recurrenceTimeSchema,
    title: titleSchema,
    childId: z.uuid("childId debe ser un UUID válido")
})

export const getRemindersQueryValidator = z.object({
    childId: z.uuid("childId debe ser un UUID válido").optional()
})

export const reminderIdParamsValidator = z.object({
    reminderId: z.uuid("reminderId debe ser un UUID válido")
})

export const patchReminderValidator = z.object({
    title: titleSchema.optional(),
    recurrenceTime: recurrenceTimeSchema.optional(),
    isActive: z.boolean("isActive debe ser booleano").optional()
}).refine(
    (body) => body.title !== undefined || body.recurrenceTime !== undefined || body.isActive !== undefined,
    "Debes enviar al menos uno de: title, recurrenceTime, isActive"
)
