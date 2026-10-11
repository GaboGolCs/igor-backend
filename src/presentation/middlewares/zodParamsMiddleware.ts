import { Request, Response, NextFunction } from "express";
import {ZodObject, ZodError } from "zod";

export const zodParamsMiddleware = (schema: ZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Validamos explícitamente los parámetros de la URL (req.params)
            schema.parse(req.params);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const formattedErrors = error.issues.map((issue) => ({
                    field: `params.${issue.path.join(".")}`, 
                    message: issue.message
                }));

                return res.status(400).json({
                    message: "Error de validación en los parámetros de la ruta",
                    errors: formattedErrors
                });
            }
            next(error);
        }
    };
};