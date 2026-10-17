import { z} from "zod"

// Zona horaria IANA válida (ej: "America/Santiago"); Intl lanza RangeError si no existe
const isValidTimeZone = (timeZone: string) => {
    try {
        Intl.DateTimeFormat(undefined, { timeZone })
        return true
    } catch {
        return false
    }
}

// El alias no puede contener "@": el login distingue email (padre) de alias (niño) por ese carácter
const alias = z.string()
    .min(5,"El largo minimo de un alias son 5 caracteres")
    .max(50,"El largo maximo de un alias son 50 caracateres")
    .refine((value) => !value.includes("@"), "El alias no puede contener @")

// PIN del niño: exactamente 4 dígitos (mismo formato al crear y al cambiar)
const childPin = z.string().regex(/^\d{4}$/, "El PIN debe tener exactamente 4 dígitos")

export const RegFamilyParent = z.object({
    familyName: z.string().min(3,"El nombre de la familia debe ser de minimo 3 caracteres").max(100,"El largo maximo ddel nombre de una familia es de 100 caracteres"),
    parentEmail: z.email("Debe ingresar un email válido"),
    password: z.string().regex(/\d/, "Debe contener al menos un número").min(4,"La contraseña debe ser de minimo 4 caracteres"),
    alias,
    timezone: z.string()
        .min(2,"El largo minimo de la zona horaria debe ser de 2 caracteres")
        .max(50,"El largo máximo de una zona horaria debe ser de 50 caracteres")
        .refine(isValidTimeZone, "La zona horaria no existe o esta mal formateada"),
    avatar_icon: z.string().max(100, "El largo máximo de avatar_icon es de 100 caracteres").optional()
}).strict()

export const LoginUser = z.object({
    identifier: z.string("El identificador debe ser de tipo string").min(1, "El identificador no puede estar vacío"),
    secret: z.string("La contraseña debe ser de tipo string").min(1, "La contraseña no puede estar vacía")
}).strict()


// Strict: un niño nunca tiene email, por lo que el campo no se acepta
export const RegChild = z.object({
    alias,
    password: childPin,
    avatar_icon: z.string().max(100, "El largo máximo de avatar_icon es de 100 caracteres").optional()
}).strict()

export const ChildIdParams = z.object({
    childId: z.uuid('El ID del niño (childId) debe ser un UUID válido.')
})

export const ChildNewPin = z.object({
    newPin: childPin
})
export const ForgotPasswd = z.object({
    email: z.email("Debe ingresar un email válido")
}).strict()


// Usado por /auth/refresh y /auth/logout
export const RefreshTokenBody = z.object({
    refreshToken: z.string("El refreshToken debe ser una cadena de texto").min(1, "El refreshToken no puede estar vacío")
}).strict()

export const ResetPasswd = z.object({
    token: z.string("El token debe ser una cadena de texto").min(1, "El token no puede estar vacío"),
    newPassword: z.string().regex(/\d/, "Debe contener al menos un número").min(4,"La contraseña debe ser de minimo 4 caracteres"),
})
