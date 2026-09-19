import { NextFunction, Request, Response } from "express";

export function midIANAVerifier (req: Request, res: Response, next: NextFunction){
        try {
            // Si la zona no es válida, esto lanza un RangeError inmediatamente
            Intl.DateTimeFormat(undefined, { timeZone: req.body.timezone });
            return next()
        } catch (error) {
            res.status(400).json({message: "Bad Request: La zona horaria no existe o esta mal formateada", error: error})
            return null
        }
    }