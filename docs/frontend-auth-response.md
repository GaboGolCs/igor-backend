# Cambio en la respuesta de autenticación (PR #1)

A partir de [PR #1](https://github.com/GaboGolCs/igor-backend/pull/1), las respuestas de autenticación de **padres** siguen el contrato `AuthResponse` de `IGOR-API-1.3.0.yaml`.

## Endpoints afectados

| Endpoint | Caso | Status |
|---|---|---|
| `POST /api/v1/auth/register-parent` | Registro de familia + padre | 201 |
| `POST /api/v1/auth/login` | `identifier` con email (login de padre) | 200 |

## Antes

```json
{
  "message": "Sesión iniciada correctamente",
  "data": {
    "id": "6f1c…",
    "role": "PARENT",
    "accessToken": "eyJhbGciOi…"
  }
}
```

## Ahora

```json
{
  "message": "Sesión iniciada correctamente",
  "data": {
    "accessToken": "eyJhbGciOi…",
    "user": {
      "id": "6f1c…",
      "role": "PARENT"
    }
  }
}
```

## Qué cambiar en el frontend

| Antes | Ahora |
|---|---|
| `data.id` | `data.user.id` |
| `data.role` | `data.user.role` |
| `data.accessToken` | `data.accessToken` (sin cambio) |

## Tokens emitidos antes del fix

Antes del PR #1, el login de padre generaba un JWT cuyo `sub` era un id aleatorio que no existía en la base de datos, así que los endpoints autenticados no encontraban al usuario. Ahora `sub` es el id real del usuario. **Hay que forzar un re-login** de los padres que tengan guardado un token emitido por un login anterior al fix. Los tokens obtenidos en el registro no tenían este problema.

## Sin cambios

- **Login de niño** (`identifier` con alias): sigue devolviendo el token directamente en `data`, es decir `{ "message": "...", "data": "<jwt>" }`.
- Los mensajes de error y los status codes no cambian.
