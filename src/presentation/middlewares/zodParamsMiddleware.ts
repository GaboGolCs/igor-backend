import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

// Valida los parámetros de la URL (req.params). Errores → 400 VALIDATION_ERROR vía errorHandler
export const zodParamsMiddleware = (schema: ZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        schema.parse(req.params);
        next();
    };
};
