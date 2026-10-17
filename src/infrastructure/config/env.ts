import dotenv from 'dotenv';
import { z } from 'zod';

// Único punto de carga de variables de entorno. No pisa variables ya definidas
// (los tests cargan .env.test antes con override).
dotenv.config({ quiet: true });

const booleanFromString = z
    .enum(['true', 'false', '1', '0'])
    .transform((value) => value === 'true' || value === '1');

const envSchema = z
    .object({
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
        PORT: z.coerce.number().int().positive().default(3000),

        DATABASE_URL: z.string().min(1),
        REDIS_URL: z.string().min(1).default('redis://127.0.0.1:6379'),

        JWT_SECRET: z.string().min(1),
        JWT_EXPIRES_IN: z.string().min(1).default('24h'),

        // Orígenes permitidos para CORS, separados por coma (ej: "http://localhost:5173,https://app.igor.cl")
        CORS_ORIGINS: z
            .string()
            .default('')
            .transform((value) => value.split(',').map((origin) => origin.trim()).filter(Boolean)),
        // Valor de app.set('trust proxy'): número de proxies delante de la API, o true/false
        TRUST_PROXY: z
            .string()
            .default('false')
            .transform((value): boolean | number =>
                /^\d+$/.test(value) ? Number(value) : value === 'true'
            ),
        // Intentos permitidos por IP cada 15 minutos en login / forgot / reset
        AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
        API_DOCS_ENABLED: booleanFromString.default(true),

        FRONTEND_URL: z.url().optional(),
        GMAIL_USER: z.string().optional(),
        GMAIL_APP_PASSWORD: z.string().optional(),
        FCM_PROJECT_ID: z.string().optional(),
        FCM_CLIENT_EMAIL: z.string().optional(),
        FCM_PRIVATE_KEY: z.string().optional(),
    })
    .superRefine((env, ctx) => {
        if (env.NODE_ENV !== 'production') return;
        // En producción el correo de recuperación y las notificaciones push son obligatorios
        const requiredInProduction = [
            'FRONTEND_URL', 'GMAIL_USER', 'GMAIL_APP_PASSWORD',
            'FCM_PROJECT_ID', 'FCM_CLIENT_EMAIL', 'FCM_PRIVATE_KEY',
        ] as const;
        for (const key of requiredInProduction) {
            if (!env[key]) {
                ctx.addIssue({ code: 'custom', path: [key], message: 'Requerida en producción' });
            }
        }
    });

const parsed = envSchema.safeParse({
    ...process.env,
    // JWT_SECRET_CREATE se mantiene como alias por compatibilidad con .env existentes
    JWT_SECRET: process.env.JWT_SECRET ?? process.env.JWT_SECRET_CREATE,
});

if (!parsed.success) {
    // Solo se listan nombres de variables, nunca sus valores
    const problems = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`[Env] Configuración inválida:\n${problems.join('\n')}`);
}

export const env = parsed.data;
