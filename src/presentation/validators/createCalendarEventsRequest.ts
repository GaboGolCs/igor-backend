import {refine, z} from "zod"

export const createCalendarEvent = z.object
({
   category: z.enum(["EXAM", "MEETING", "MATERIAL", "FAMILY", "OTHER"], "La categoría entregada no corresponde a las categorías EXAM, MEETING, MATERIAL, FAMILY, OTHER"),
   eventDate: z.coerce.date().refine((data) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return data >= hoy;
  }, {
    message: "La fecha no puede ser anterior al día de hoy",
  }),
   title: z.string("El titulo debe ser de tipo string").min(1,"El titulo debe ser de largo minimo de 2 caracteres").max(150, "El titulo debe ser de máximo 150 caracteres"),
   targeted_user_id: z.uuid(" targeted_user_id debe ser un uuid válido")
})