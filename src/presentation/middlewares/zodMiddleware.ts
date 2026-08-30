import z, { parseAsync, ZodObject } from "zod"
import { Request, Response, NextFunction } from "express"
export async function zodMiddleware(zodSchema:ZodObject) {
    
    return async (req: Request, res: Response, next: NextFunction) => {
    try {
        req.body = await zodSchema.parseAsync(req.body)
        return next()
    } catch (error) {
       console.error(error, "Error validando en el cuerpo del request") 
       return res.status(500).json({ message: "Error interno del servidor"})
    }
}
}