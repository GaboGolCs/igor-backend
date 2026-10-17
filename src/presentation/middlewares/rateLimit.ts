import { rateLimit } from "express-rate-limit";
import { env } from "../../infrastructure/config/env.js";

// Limita intentos por IP en login / forgot / reset (fuerza bruta y envío masivo de correos).
// Store en memoria: suficiente para una sola instancia; con varias réplicas usar un store en Redis.
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.AUTH_RATE_LIMIT_MAX,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            message: "Demasiados intentos. Intenta nuevamente más tarde.",
            code: "RATE_LIMITED",
        })
    },
})
