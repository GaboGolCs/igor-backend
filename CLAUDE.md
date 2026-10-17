# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

IGOR backend: REST API for a family socio-educational platform (parents + children). Express 5 + TypeScript (ESM, `NodeNext`), Prisma 7 on PostgreSQL, BullMQ/Redis for scheduled reminders, Firebase Cloud Messaging for push, Nodemailer (Gmail) for password recovery. Code, comments, commit messages and API error messages are in Spanish.

The API contract is `openapi.yaml` (OpenAPI 3.0.3, version 1.4.0, base path `/api/v1`). It is served by Swagger UI at `/api/docs` (raw JSON at `/api/docs/openapi.json`). **The code is the source of truth**: when you change a request/response shape or status, update `openapi.yaml` to match. `docs/frontend-integration.md` is the guide for the frontend team (auth, error codes, CORS) and should be kept in sync too.

## Commands

```bash
docker compose up -d          # Postgres (5432, db igor_db, postgres/postgres), Adminer (8080), Redis (6379)
docker compose --profile app up --build   # also runs the API container on :3000 (uses .env)
npm run dev                   # tsx watch src/presentation/http/server.ts (also starts the BullMQ reminder worker)
npm run build                 # tsc -> dist/
npm start                     # node dist/presentation/http/server.js
npx tsc --noEmit              # type-check only
docker build -t igor-backend .   # production image; runs `prisma migrate deploy` then the server
npx prisma migrate dev --name <nombre>   # create/apply a migration (migrations live in src/prisma/migrations)
npx prisma generate           # regenerate the client into src/prisma/
npm run seed:tips             # seed parental tips (scripts/seedTips.ts)
npm run seed:trivia           # seed trivia questions (scripts/seedTrivia.ts)
npm test                                      # vitest integration suite (needs `docker compose up -d`)
npx vitest run tests/endpoints/auth.test.ts   # a single test file
npx vitest run -t "EMAIL_TAKEN"               # tests whose name matches
npm run test:worker -- <USER_UUID>            # manually enqueue a reminder job on the dev Redis (scripts/test-worker.ts)
```

There is no linter configured. `prisma` is a runtime dependency (not dev) because the Docker image runs `migrate deploy` on startup.

## Configuration

`src/infrastructure/config/env.ts` is the only place that loads dotenv and reads `process.env`. It validates everything with zod at import time and exports a typed `env`; import that instead of reading `process.env`. `.env.example` lists every variable. `DATABASE_URL` and `JWT_SECRET` are required (`JWT_SECRET_CREATE` is accepted as an alias). `FRONTEND_URL`, `GMAIL_*` and `FCM_*` are required only when `NODE_ENV=production`. Sessions: `JWT_EXPIRES_IN` (access token, default `15m`) and `REFRESH_TOKEN_TTL_DAYS` (default 30). Frontend-related: `CORS_ORIGINS` (comma-separated), `TRUST_PROXY`, `AUTH_RATE_LIMIT_MAX`, `REFRESH_RATE_LIMIT_MAX`, `API_DOCS_ENABLED`.

## Tests

- `tests/endpoints/<recurso>.test.ts` covers every endpoint: happy path, 400, 401 (missing, invalid and ghost-user tokens), 403 (wrong role), 404/409, and cross-family access. `tests/app.test.ts` covers CORS, JSON 404/400/413, helmet, `/health` and `/api/docs`. `tests/endpoints/auth-session.test.ts` covers refresh rotation, reuse detection, logout and revocation. `tests/rate-limit.test.ts` reloads the app with low limits (`vi.stubEnv` + `vi.resetModules`), loading it twice to simulate two replicas that share the Redis counter. `tests/reminder-worker.test.ts` and `tests/fcm-guard.test.ts` cover the BullMQ worker and FCM.
- The suite runs against the docker-compose Postgres and Redis using `.env.test`: database `igor_test` and Redis db 1, so the dev data in `igor_db` is untouched. `tests/setup/global.ts` creates `igor_test` if missing and runs `prisma migrate deploy`. `tests/setup/env.ts` loads `.env.test` with `override` before each file's imports. Files run serially (`fileParallelism: false`).
- HTTP tests use `supertest` against `app` from `src/presentation/http/app.ts` (no `listen`). `server.ts` only adds `listen`, the worker, Firebase init and shutdown.
- `tests/helpers/fixtures.ts`:
  - `createFamily()` returns a parent and a child, each with a `token` (access) and a `refreshToken`. `registerParent` and `registerChild` are the individual pieces.
  - `invalidToken()` and `ghostToken(role)` cover the 401 cases.
  - `expectError(res, status, code)` asserts the error shape.
  - `seedTrivia()` loads sample questions.
- `tests/helpers/db.ts` has `resetDb`, `resetRedis` and `closeConnections`. Each file resets in `beforeAll` and closes connections in `afterAll`.
- External services are mocked with `vi.mock`: `FCMPushService`, and `MailService` in the auth tests (the mock captures the reset token). Infra failures are simulated with `vi.spyOn(Repo.prototype, ...)`.

## Prisma setup

- `schema.prisma` is at the repo root; `prisma.config.ts` sets `schema: "."` and the migrations path `src/prisma/migrations`.
- The generator is `prisma-client` (Prisma 7) with output `src/prisma/`, and those generated files are committed. Don't hand-edit them; change `schema.prisma` and regenerate.
- The client is created with the `@prisma/adapter-pg` driver adapter in `src/infrastructure/database/prisma.ts` (global singleton).
- DB columns/tables are snake_case (`@@map`); domain entities use camelCase. Repositories do the mapping.
- Some constraints live only in SQL migrations, because Prisma doesn't model CHECKs: `users_child_without_email` (a CHILD never has an email) and `users_parent_with_email`. To add one, use `prisma migrate dev --create-only` and edit the SQL.

## Architecture (hexagonal / layered)

All imports use explicit `.js` extensions (ESM `NodeNext`).

Request flow: **route → `requireAuth` → `requireRole` → zod middleware → controller → use case → domain entity + repository → Prisma**. Errors bubble up to `errorHandler`.

- `src/presentation/`
  - `http/app.ts`: builds the Express app. In order:
    1. `trust proxy`, then `helmet`, `cors` (from `CORS_ORIGINS`) and `express.json({ limit: '100kb' })`.
    2. `/health` and `/api/docs` (Swagger UI).
    3. Every router under `/api/v1/...`. New routers are registered here.
    4. Last, `notFoundHandler` and `errorHandler`.
  - `http/server.ts`: entry point. Imports `app`, imports `firebaseAdmin` for side effects, starts the reminder worker after `listen`, and handles graceful shutdown (closes Redis).
  - `middlewares/auth.ts`: `requireAuth` validates the Bearer JWT and sets `res.locals.user = { id, role }` (401 `TOKEN_MISSING`/`TOKEN_INVALID`). `requireRole(...roles)` returns 403 `FORBIDDEN_ROLE`. Both go **before** validation, so 401/403 win over 400.
  - `middlewares/zod*Middleware.ts`: parse body, params or query; a `ZodError` becomes 400 `VALIDATION_ERROR` in the error handler. Parsed query params go to `res.locals.query`, because `req.query` is read-only in Express 5.
  - `middlewares/errorHandler.ts`: the single error format `{ message, code, errors? }`.
    - `AppError` uses its own status and code.
    - `ZodError` → 400. Malformed JSON → 400 `INVALID_JSON`. Body too large → 413. Prisma `P2002` → 409.
    - Anything else → 500 `INTERNAL_ERROR` with a generic message.
  - `middlewares/rateLimit.ts`: `createRateLimit({ prefix, limit, windowMs })` builds limiters whose counters live in Redis (`rate-limit-redis`), so they are shared across replicas. `passOnStoreError` means that if Redis is down, requests pass without a limit instead of returning 500. `authRateLimit` (`igor:rl:auth:`) covers login, forgot and reset; `refreshRateLimit` (`igor:rl:refresh:`) covers `/auth/refresh`.
  - `controllers/Con*.ts`: thin and async, with no try/catch. Express 5 forwards rejected promises to `errorHandler`. They read the user from `res.locals.user`.
  - `validators/`: Zod schemas per resource (timezone is validated with `Intl` inside the schema), plus `extractTokenFromHeader`.
- `src/application/`
  - `errors/AppError.ts`: `ValidationError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409), each with a stable `code`, plus `sessionUserNotFound()` (401). Use cases throw these; **never match on error message strings**.
  - `use-cases/U*.ts`: plain exported async functions (not classes). They `new` the concrete infrastructure repositories directly; there is no DI container.
  - Authorization rule: before acting on a child, event target or reward, check it belongs to the caller's `family_id`. If it doesn't, return the **same 404** as "not found" so other families' ids aren't revealed. A token whose user no longer exists → `sessionUserNotFound()`.
  - `dtos/`, `mappers/`: response shapes and entity→DTO mapping. Both logins return `{ accessToken, user: { id, role } }` via `mapUserEntityToAuthResponseDTO`.
- `src/domain/`
  - `entities/*Ent.ts`: classes with static factories (for example `UserEntity.createParent`, `RewardClaimEntity.createRewardClaim`) that generate UUIDs with `crypto.randomUUID()` and set defaults.
  - `repoContracts/`: interfaces implemented by the infrastructure repos.
- `src/infrastructure/`
  - `database/*Repo.ts`: Prisma implementations.
    - Repos must not swallow errors. Return `null` only for "not found"; let DB errors propagate (they become 500).
    - Multi-step writes go through `TransactionRepo.executeTransaction(async (tx) => ...)`, which wraps `prisma.$transaction`. Repos default to the global `prisma`, so a write method used inside a transaction must accept an optional `db: Prisma.TransactionClient = prisma` parameter and receive `tx`. Otherwise it runs outside the transaction. See `createFamily`/`createUser` and `URegParentFamily`.
    - Conditional updates (`updateMany` with a status filter, as in `RewardClaimRepo.updateStatusIfPending`) prevent races.
  - `security/`: JWT create/verify (`jsonwebtoken`, secret from `env`) and argon2 hashing/verification.
  - `messaging/`:
    - `ReminderQueue`: the producer. `scheduleDailyReminder` uses `upsertJobScheduler` (scheduler key = reminder id) with a cron pattern in the parent's IANA timezone; `removeDailyReminder` removes it. It owns `REMINDER_QUEUE_NAME`. The DB and the scheduler must stay in sync:
      - `UPostReminder` deletes the row if scheduling fails.
      - `UPatchReminder` updates the scheduler first (re-upsert if the reminder stays active, remove if paused), then the DB, and restores the scheduler if the DB write fails.
      - `UDeleteReminder` removes the scheduler and then the row.
    - `ReminderWorker`: the consumer, sends through `FCMPushService`. Job data must match its `ReminderJobPayload`: `{reminderId, targetUserId, title, body?}`.
    - `redisConnection`: shared ioredis, with `maxRetriesPerRequest: null` as BullMQ requires.
    - `RedisRecoveryPassWdToken`: password-reset tokens stored in Redis with a 15-minute TTL.
    - `RedisRefreshTokenRepo`: refresh tokens.
      - Only the SHA-256 is stored, as `igor:refresh:<hash>` → `{ userId, used }`, plus a per-user set `igor:refresh:user:<id>` for `revokeAll`.
      - `consume` is an atomic Lua script, so rotation is single-use even under concurrency.
      - `application/use-cases/USession.ts` holds the session logic: `issueSession`, `refreshSession`, `logoutSession` and `revokeAllSessions`. Reusing an already-used token revokes all of the user's sessions.
      - Call `revokeAllSessions(userId)` whenever a user's credentials change; reset-password and the PIN change already do.
    - `MailService`.
  - `config/env.ts` (see Configuration) and `config/firebaseAdmin.ts`.

Domain concepts: a `Family` (unique join `code`) has `User`s with role `PARENT` (always has an email) or `CHILD` (never has an email; logs in with alias + 4-digit PIN). Login routes by identifier: one containing `@` is a parent's email, otherwise it is a child's alias, which is why aliases can't contain `@`. Sessions: login, register and refresh return `{ accessToken, refreshToken, user }`. `/auth/refresh` and `/auth/logout` are public, because the refresh token itself is the credential. forgot-password and reset-password are public. forgot always returns 200 so it doesn't reveal which emails exist. Other models: `MoodLog` (`need_text` optional), `CalendarEvent`, `DailyReminder` (a parent can list, edit, pause via `is_active` and delete them; a child lists their own), `PushToken` (per device; re-registering moves it to the current user), `TriviaQuestion`, `RewardClaim` (`PENDING`/`ACCEPTED`/`REJECTED`, a child claims and a parent patches the status once), `ParentalTip`.

## Adding an endpoint

1. Add the Zod schema in `presentation/validators/`.
2. Add a use case in `application/use-cases/` that throws `AppError` subclasses and checks family ownership.
3. Add a repo contract and Prisma repo if needed.
4. Write a thin controller method.
5. Add the route in the resource's `R*.ts` with `requireAuth`/`requireRole` before validation, and mount it in `app.ts` if it's a new router.
6. Add `tests/endpoints/<recurso>.test.ts` cases for each status.
7. Update `openapi.yaml`, and `docs/frontend-integration.md` if it adds new error codes.
