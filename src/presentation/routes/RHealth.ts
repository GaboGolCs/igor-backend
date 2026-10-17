import { Router } from "express";
import { prisma } from "../../infrastructure/database/prisma.js";
import { redisConnection } from "../../infrastructure/messaging/redisConnection.js";

export const rHealth = Router()

// Para balanceadores/orquestadores: 200 si Postgres y Redis responden, 503 si alguno falla
rHealth.get("/", async (req, res) => {
    const check = async (fn: () => Promise<unknown>) => {
        try {
            await fn()
            return "ok"
        } catch {
            return "error"
        }
    }

    const [database, redis] = await Promise.all([
        check(() => prisma.$queryRaw`SELECT 1`),
        check(() => redisConnection.ping()),
    ])

    const healthy = database === "ok" && redis === "ok"
    res.status(healthy ? 200 : 503).json({ status: healthy ? "ok" : "error", database, redis })
})
