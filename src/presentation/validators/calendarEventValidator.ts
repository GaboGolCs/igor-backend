import z from "zod"

export const calendarEventsQueryParams = z.object({
    month: z.coerce.number().int().min(1,"El primer mes es el numero 1").max(12,"No existen mas de 12 meses"),
    year: z.coerce.number().int().min(2025, "No se admiten años menores a 2025").max(2200, "No se admiten alos mayores a 2020")
})

