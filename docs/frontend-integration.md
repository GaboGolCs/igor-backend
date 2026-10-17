# Guía de integración para el frontend

El contrato completo está en [`openapi.yaml`](../openapi.yaml). Con la API corriendo, también puedes verlo en **Swagger UI** en `http://localhost:3000/api/docs`.

## Base URL y conexión

| | |
|---|---|
| Base de la API | `http://localhost:3000/api/v1` |
| Health check | `GET http://localhost:3000/health` → `{ status, database, redis }` (200 o 503) |
| Formato | JSON (`Content-Type: application/json`), body de 100 KB como máximo |

**CORS:** el navegador solo acepta respuestas para los orígenes listados en `CORS_ORIGINS` (en el `.env` del backend, separados por coma). Por ejemplo, `CORS_ORIGINS=http://localhost:5173` para Vite. Las apps nativas (Android/iOS) no envían `Origin` y no se ven afectadas.

## Autenticación

- Se envía el JWT en cada petición: `Authorization: Bearer <accessToken>`.
- El token expira según `JWT_EXPIRES_IN` (por defecto 24 h). No hay refresh token: ante un **401**, vuelve a la pantalla de login.
- `register-parent` y `login` responden con la misma forma, tanto para padres como para niños:

```json
{
  "message": "Sesión iniciada correctamente",
  "data": {
    "accessToken": "eyJhbGciOi…",
    "user": { "id": "6f1c…", "role": "PARENT" }
  }
}
```

- **Login:** `POST /auth/login` con `{ identifier, secret }`. Si `identifier` contiene `@`, es el email de un apoderado; si no, es el alias de un niño (y `secret` es su PIN de 4 dígitos).

### Cambios respecto de versiones anteriores

| Antes | Ahora |
|---|---|
| `data.id` / `data.role` (padre) | `data.user.id` / `data.user.role` |
| Login de niño: `data` era el token directamente | `data.accessToken` y `data.user`, igual que el padre |
| forgot/reset-password exigían sesión | Son **públicos** |
| Errores con `{message}`, `{error}` o texto | Siempre `{ message, code }` (ver abajo) |

Los tokens de login de padre emitidos antes del PR #1 apuntaban a un id inexistente. Hay que forzar un re-login.

## Recuperación de contraseña

1. `POST /auth/forgot-password` con `{ email }`. Siempre responde **200** con el mismo mensaje, exista o no el email.
2. El correo enlaza a `${FRONTEND_URL}/reset-password?token=<token>`. El frontend necesita esa página. El token expira en 15 minutos y sirve una sola vez.
3. La página llama a `POST /auth/reset-password` con `{ token, newPassword }`, sin JWT.
   - 200: contraseña cambiada.
   - 400 `INVALID_RESET_TOKEN`: el enlace es inválido, expiró o ya se usó.

## Errores

Todas las respuestas de error tienen esta forma:

```json
{ "message": "Texto para mostrar o registrar", "code": "CODIGO_ESTABLE" }
```

En los errores de validación se agrega `errors`:

```json
{
  "message": "Error de validación en los datos enviados",
  "code": "VALIDATION_ERROR",
  "errors": [{ "field": "parentEmail", "message": "Debe ingresar un email válido" }]
}
```

Ramifica por `code` (es estable), no por `message`.

| Status | `code` | Cuándo |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Body, query o params inválidos (ver `errors`) |
| 400 | `INVALID_JSON` | El body no es JSON válido |
| 400 | `INVALID_RESET_TOKEN` | Token de recuperación inválido, expirado o usado |
| 401 | `TOKEN_MISSING` | Falta el header `Authorization: Bearer` |
| 401 | `TOKEN_INVALID` | Token inválido o expirado |
| 401 | `SESSION_USER_NOT_FOUND` | El usuario del token ya no existe |
| 401 | `INVALID_CREDENTIALS` | Email/alias o contraseña/PIN incorrectos |
| 403 | `FORBIDDEN_ROLE` | El rol no tiene acceso (por ejemplo, un niño en una ruta de padres) |
| 404 | `CHILD_NOT_FOUND` | El niño no existe o es de otra familia |
| 404 | `USER_NOT_FOUND` | Destinatario de un evento inexistente o de otra familia |
| 404 | `REWARD_NOT_FOUND` | Recompensa inexistente o de otra familia |
| 404 | `NO_QUESTIONS` | No hay preguntas de trivia cargadas |
| 404 | `ROUTE_NOT_FOUND` | La ruta no existe |
| 409 | `EMAIL_TAKEN` / `ALIAS_TAKEN` | Email o alias ya registrado |
| 409 | `REWARD_ALREADY_PROCESSED` | La recompensa ya fue aceptada o rechazada |
| 409 | `CONFLICT` | Duplicado detectado por la base de datos |
| 413 | `PAYLOAD_TOO_LARGE` | Body de más de 100 KB |
| 429 | `RATE_LIMITED` | Demasiados intentos en login, forgot o reset (por IP, cada 15 min) |
| 500 | `INTERNAL_ERROR` | Error del servidor (mensaje genérico) |

Un recurso de otra familia responde **404**, igual que uno inexistente, para no revelar que existe.

## Roles por endpoint

| Endpoint | Rol |
|---|---|
| `POST /family/children`, `PATCH /family/children/{id}/pin` | PARENT |
| `POST /moods` | CHILD |
| `GET /moods/analytics` | PARENT |
| `GET /calendar/events` | Cualquiera |
| `POST /calendar/events` | PARENT |
| `POST /reminders` | PARENT |
| `POST /push-tokens` | Cualquiera |
| `GET /games/questions/random`, `POST /games/rewards/claims` | CHILD |
| `PATCH /games/rewards/{id}/status` | PARENT |
| `GET /tips` | PARENT |

## Notas

- Los cuerpos de respuesta de calendario y recordatorios usan snake_case (`event_date`, `targeted_user_id`, `recurrence_time`), como la base de datos.
- Un niño nunca tiene email. Al crearlo solo se envían `alias`, `password` (PIN de 4 dígitos) y, opcionalmente, `avatar_icon`.
- Un alias no puede contener `@`.
