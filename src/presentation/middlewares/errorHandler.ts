import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../application/errors/AppError.js";

// Formato único de error para el frontend: { message, code, errors? }

export function notFoundHandler(req: Request, res: Response) {
    res.status(404).json({ message: `No existe la ruta ${req.method} ${req.path}`, code: "ROUTE_NOT_FOUND" })
}

export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
    // Si ya se envió una respuesta, Express debe cerrar la conexión
    if (res.headersSent) {
        return next(error)
    }

    if (error instanceof AppError) {
        return res.status(error.status).json({ message: error.message, code: error.code })
    }

    if (error instanceof ZodError) {
        return res.status(400).json({
            message: "Error de validación en los datos enviados",
            code: "VALIDATION_ERROR",
            errors: error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            })),
        })
    }

    // JSON malformado o body demasiado grande (express.json / body-parser)
    if (error?.type === "entity.parse.failed") {
        return res.status(400).json({ message: "El cuerpo de la petición no es un JSON válido", code: "INVALID_JSON" })
    }
    if (error?.type === "entity.too.large") {
        return res.status(413).json({ message: "El cuerpo de la petición es demasiado grande", code: "PAYLOAD_TOO_LARGE" })
    }

    // Violación de restricción única que se escapó de los chequeos previos (carrera entre peticiones)
    if (error?.code === "P2002") {
        return res.status(409).json({ message: "El recurso ya existe", code: "CONFLICT" })
    }

    console.error("[ErrorHandler] Error no controlado:", error)
    return res.status(500).json({ message: "Error interno del servidor", code: "INTERNAL_ERROR" })
}
