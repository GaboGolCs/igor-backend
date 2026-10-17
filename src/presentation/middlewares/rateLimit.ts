import { rateLimit, type RateLimitRequestHandler } from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import { env } from "../../infrastructure/config/env.js";
import { redisConnection } from "../../infrastructure/messaging/redisConnection.js";

interface RateLimitOptions {
    prefix: string;
    limit: number;
    windowMs: number;
}

// Contadores en Redis (compartidos entre réplicas). Si Redis falla, deja pasar la petición sin límite
// en lugar de responder 500.
export function createRateLimit({ prefix, limit, windowMs }: RateLimitOptions): RateLimitRequestHandler {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        store: new RedisStore({
            sendCommand: (command: string, ...args: string[]) =>
                redisConnection.call(command, ...args) as Promise<RedisReply>,
            prefix,
        }),
        passOnStoreError: true,
        // express-rate-limit registra aquí los fallos del store ("allowing request without rate-limiting")
        logger: {
            warn: (error, message) => console.warn(`[RateLimit ${prefix}]`, message ?? "", error),
            error: (error, message) => console.warn(`[RateLimit ${prefix}]`, message ?? "", error),
        },
        handler: (req, res) => {
            res.status(429).json({
                message: "Demasiados intentos. Intenta nuevamente más tarde.",
                code: "RATE_LIMITED",
            })
        },
    })
}

// Limita intentos por IP en login / forgot / reset (fuerza bruta y envío masivo de correos).
export const authRateLimit = createRateLimit({
    prefix: "igor:rl:auth:",
    limit: env.AUTH_RATE_LIMIT_MAX,
    windowMs: 15 * 60 * 1000,
});

// Limita las renovaciones de sesión (/auth/refresh) con un contador propio, independiente del de login
export const refreshRateLimit = createRateLimit({
    prefix: "igor:rl:refresh:",
    limit: env.REFRESH_RATE_LIMIT_MAX,
    windowMs: 15 * 60 * 1000,
});
