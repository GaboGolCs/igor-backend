import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

// Valida req.body. Si falla, Zod lanza ZodError y errorHandler responde 400 VALIDATION_ERROR
export const zodMiddleware = (schema: ZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        req.body = schema.parse(req.body);
        next();
    };
};
