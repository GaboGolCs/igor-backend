import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

// Valida req.query y deja los valores ya convertidos en res.locals.query
// (en Express 5 req.query es de solo lectura)
export const zodQParametersMiddleware = (schema: ZodObject) => {
    return (req: Request, res: Response, next: NextFunction) => {
        res.locals.query = schema.parse(req.query);
        next();
    };
};
