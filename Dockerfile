# ==========================================
# IGOR Backend - Imagen de producción
# ==========================================
# Debian slim (no alpine) para usar los binarios precompilados de argon2

# --- Etapa 1: compilación TypeScript ---
FROM node:24-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json schema.prisma prisma.config.ts ./
COPY src ./src
RUN npm run build

# --- Etapa 2: runtime ---
FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY schema.prisma prisma.config.ts ./
COPY src/prisma/migrations ./src/prisma/migrations

EXPOSE 3000

# Aplica migraciones pendientes y levanta el servidor (incluye el worker de BullMQ)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/presentation/http/server.js"]
