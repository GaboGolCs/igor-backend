import { Request, Response, NextFunction } from "express";
import {ZodObject, ZodError } from "zod";

export const zodQParametersMiddleware = (schema: ZodObject) => {
    return (req: Request, res: Response,  next: NextFunction) => {
        try {
            // Zod lanza una excepción si la validación falla
            res.locals = schema.parse(req.query);
            next(); // Si pasa, continuamos al Caso de Uso
        } catch (error) {
            if (error instanceof ZodError) {
                // Formateamos el error para el frontend
                const formattedErrors = error.issues.map((issue) => ({
                    field: issue.path.join("."), // Ej: "password" o "padre.email"
                    message: issue.message       // Ej: "Debe contener al menos un número"
                }));

                return res.status(400).json({
                    message: "Error de validación en los datos enviados",
                    errors: formattedErrors
                });
            }
            // Si es otro tipo de error, lo pasamos al manejador global
            next(error);
        }
    };
};