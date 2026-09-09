import { z} from "zod"

export const RegFamilyParent = z.object({
    familyName: z.string().min(3,"El nombre de la familia debe ser de minimo 3 caracteres").max(100,"El largo maximo ddel nombre de una familia es de 100 caracteres"),
    parentEmail: z.email(),
    password: z.string().regex(/\d/, "Debe contener al menos un número").min(4,"La contraseña debe ser de minimo 4 caracteres"), 
    alias: z.string().min(5,"El largo minimo de un alias son 5 caracteres").max(50,"El largo maximo de un alias son 50 caracateres"),
    avatar_icon: z.string().optional()
}).strict()

export const LoginUser = z.object({
    identifier: z.string(),
    secret: z.string()
}).strict()


export const RegChild = z.object({
    alias: z.string().min(5,"El largo minimo de un alias son 5 caracteres").max(50,"El largo maximo de un alias son 50 caracateres"),
    password: z.string().regex(/\d/, "Debe contener al menos un número").min(4,"La contraseña debe ser de minimo 4 caracteres"), 
    avatar_icon: z.string().optional()
}).strict()