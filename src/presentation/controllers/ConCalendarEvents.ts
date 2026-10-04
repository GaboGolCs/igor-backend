import { Request, Response } from "express";
import { extractTokenFromHeader } from "../validators/HExtractTokenInfo.js";
import { verifyJWToken } from "../../infrastructure/security/verifyJWToken.js";
import { getCalendarEventsUC } from "../../application/use-cases/UGetCalendarEvents.js";
import { postCalendarEvents } from "../../application/use-cases/UPostCalendarEvent.js";

export class ConCalendarEvent {
    constructor() {
        return this;
    }

    public async createCalendarEvent(req: Request, res: Response) {
        try {
            const userJWT = extractTokenFromHeader(req);
            if (!userJWT) {
                // El return es obligatorio para detener la ejecución y evitar ERR_HTTP_HEADERS_SENT
                return res.status(401).json({ message: "Token authorization no especificado o mal formateado" });
            }

            const decodedToken = verifyJWToken(userJWT);
            if (!decodedToken) {
                return res.status(401).json({ message: "No se ha podido verificar el token JWT en IGOR" });
            }

            if (decodedToken.role !== "PARENT") {
                return res.status(403).json({ message: "El usuario no cuenta con los permisos para ingresar" });
            }

            const data = req.body;

            // 1. Validar y parsear la fecha según el contrato OpenAPI (camelCase)
            if (!data.eventDate) {
                return res.status(400).json({ message: "Bad Request: El campo eventDate es obligatorio." });
            }
            const eventDateObj = new Date(data.eventDate);

            // 2. Controlar targeted_user_id. Si no viene en el body, asignamos el ID del creador como fallback.
            const targetedUserId = data.targeted_user_id || decodedToken.sub;

            // 3. Inyección segura al Caso de Uso
            const savedEvent = await postCalendarEvents(
                decodedToken.sub,
                targetedUserId,
                data.title,
                data.category,
                eventDateObj
            );

            return res.status(201).json(savedEvent);

        } catch (error: any) {
            if (error.message.startsWith("Bad Request")) {
                return res.status(400).json({ message: "Error: " + error.message });
            }
            return res.status(500).json({ message: "Error: " + error.message });
        }
    }

    public async getCalendarEvent(req: Request, res: Response) {
        try {
            const userJWT = extractTokenFromHeader(req);
            if (!userJWT) {
                return res.status(401).json({ message: "Token authorization no especificado o mal formateado" });
            }

            const decodedToken = verifyJWToken(userJWT);
            if (!decodedToken) {
                return res.status(401).json({ message: "No se ha podido verificar el token JWT en IGOR" });
            }

            const events = await getCalendarEventsUC(decodedToken.sub, res.locals.month, res.locals.year);
            return res.status(200).json(events);

        } catch (error: any) {
            if (error.message.startsWith("Bad Request")) {
                return res.status(400).json({ message: "Error: " + error.message });
            }
            return res.status(500).json({ message: "Error: " + error.message });
        }
    }
}