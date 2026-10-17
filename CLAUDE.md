# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

IGOR backend: REST API for a family socio-educational platform (parents + children). Express 5 + TypeScript (ESM, `NodeNext`), Prisma 7 on PostgreSQL, BullMQ/Redis for scheduled reminders, Firebase Cloud Messaging for push, Nodemailer (Gmail) for password recovery. Code, comments, commit messages and API error messages are in Spanish.

The API contract is `IGOR-API-1.3.0.yaml` (OpenAPI 3.0.3, base path `/api/v1`). Status codes and response shapes should follow it.

## Commands

```bash
docker compose up -d          # Postgres (5432, db igor_db, postgres/postgres), Adminer (8080), Redis (6379)
npm run dev                   # tsx watch src/presentation/http/server.ts (also starts the BullMQ reminder worker)
npm run build                 # tsc -> dist/
npm start                     # node dist/presentation/http/server.js
npx tsc --noEmit              # type-check only
docker build -t igor-backend .   # production image; runs `prisma migrate deploy` then the server
npx prisma migrate dev --name <nombre>   # create/apply a migration (migrations live in src/prisma/migrations)
npx prisma generate           # regenerate the client into src/prisma/
npx tsx src/presentation/routes/seedTips.ts   # seed parental tips
npm run test:worker -- <USER_UUID>            # enqueue a test reminder job on Redis
```

There is no automated test suite or linter configured (vitest is installed but unused). `prisma` is a runtime dependency (not dev) because the Docker image runs `migrate deploy` on startup.

Required `.env` variables: `DATABASE_URL`, `REDIS_URL`, `PORT`, `JWT_SECRET`, `JWT_SECRET_CREATE`, `JWT_EXPIRES_IN`, `FCM_PROJECT_ID`, `FCM_CLIENT_EMAIL`, `FCM_PRIVATE_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `FRONTEND_URL`.

## Prisma setup

- `schema.prisma` is at the repo root; `prisma.config.ts` sets `schema: "."` and the migrations path `src/prisma/migrations`.
- The generator is `prisma-client` (Prisma 7) with output `src/prisma/`, and those generated files are committed. Don't hand-edit them; change `schema.prisma` and regenerate.
- The client is created with the `@prisma/adapter-pg` driver adapter in `src/infrastructure/database/prisma.ts` (global singleton).
- DB columns/tables are snake_case (`@@map`); domain entities use camelCase. Repositories do the mapping.

## Architecture (hexagonal / layered)

All imports use explicit `.js` extensions (ESM `NodeNext`).

Request flow: **route → zod middleware → controller → use case → domain entity + repository → Prisma**.

- `src/presentation/`
  - `http/server.ts`: entry point. Mounts every router under `/api/v1/...`, imports `firebaseAdmin` for side effects, starts the reminder worker after `listen`, and handles graceful shutdown (closes Redis).
  - `routes/R*.ts`: export a `Router`, instantiate the controller, and attach `zodMiddleware(schema)` (body), `zodParamsMiddleware` (params) or `zodQParametersMiddleware` (query). `IANAValidator` validates timezones.
  - `validators/`: Zod schemas per resource, plus `extractTokenFromHeader` (Bearer).
  - `controllers/Con*.ts`: classes whose methods do auth **inline**. There is no auth middleware: each handler calls `extractTokenFromHeader` → `verifyJWToken` → checks `decodedToken.role` (`PARENT` / `CHILD`) and uses `decodedToken.sub` as the user id. Errors are thrown and mapped in the `catch`, typically by matching substrings of `error.message` (for example `"Bad Request"` → 400), and anything else → 500.
- `src/application/`
  - `use-cases/U*.ts`: plain exported async functions (not classes). They `new` the concrete infrastructure repositories directly; there is no DI container.
  - `dtos/`, `mappers/`: response shapes and entity→DTO mapping.
- `src/domain/`
  - `entities/*Ent.ts`: classes with static factories (for example `UserEntity.createParent`, `RewardClaimEntity.createRewardClaim`) that generate UUIDs with `crypto.randomUUID()` and set defaults.
  - `repoContracts/`: interfaces implemented by the infrastructure repos.
- `src/infrastructure/`
  - `database/*Repo.ts`: Prisma implementations. Multi-step writes go through `TransactionRepo.executeTransaction(async (tx) => ...)`, which wraps `prisma.$transaction`. Repos default to the global `prisma`, so a write method used inside a transaction must accept an optional `db: Prisma.TransactionClient = prisma` parameter and receive `tx`. Otherwise it runs outside the transaction. See `createFamily`/`createUser` and `URegParentFamily`.
  - `security/`: JWT create/verify (`jsonwebtoken`) and argon2 hashing/verification.
  - `messaging/`: `ReminderQueue` (producer, uses `upsertJobScheduler` with a cron pattern in the user's IANA timezone; owns `REMINDER_QUEUE_NAME`), `ReminderWorker` (consumer → `FCMPushService`; the job data must match its `ReminderJobPayload`: `{reminderId, targetUserId, title, body?}`), `redisConnection` (shared ioredis, `maxRetriesPerRequest: null` as BullMQ requires), `RedisRecoveryPassWdToken` (password-reset tokens stored in Redis), `MailService`.
  - `config/firebaseAdmin.ts`: initializes firebase-admin from the `FCM_*` env vars.

Domain concepts: a `Family` (unique join `code`) has `User`s with role `PARENT` or `CHILD`. Children log in with alias + PIN, and parents can change a child's PIN. Other models: `MoodLog`, `CalendarEvent`, `DailyReminder`, `PushToken` (per device type), `TriviaQuestion`, `RewardClaim` (`PENDING`/`ACCEPTED`/`REJECTED`, a child claims and a parent patches the status), `ParentalTip`.

## Adding an endpoint

The pattern used throughout: add the Zod schema in `presentation/validators/`, a use case function in `application/use-cases/`, a repo contract and Prisma repo if needed, a controller method that does the token and role check, and a route in the resource's `R*.ts`. Then mount it in `server.ts` if it's a new router, and keep it consistent with `IGOR-API-1.3.0.yaml`.
