// Errores de aplicación con status HTTP y código estable para el frontend.
// Los use cases lanzan estas clases; errorHandler.ts las traduce a { message, code }.
export class AppError extends Error {
    constructor(
        public readonly status: number,
        public readonly code: string,
        message: string
    ) {
        super(message)
        this.name = new.target.name
    }
}

export class ValidationError extends AppError {
    constructor(message: string, code = 'VALIDATION_ERROR') {
        super(400, code, message)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string, code = 'UNAUTHORIZED') {
        super(401, code, message)
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string, code = 'FORBIDDEN') {
        super(403, code, message)
    }
}

export class NotFoundError extends AppError {
    constructor(message: string, code = 'NOT_FOUND') {
        super(404, code, message)
    }
}

export class ConflictError extends AppError {
    constructor(message: string, code = 'CONFLICT') {
        super(409, code, message)
    }
}

// El usuario del token ya no existe (por ejemplo, fue eliminado): la sesión no es válida
export const sessionUserNotFound = () =>
    new UnauthorizedError('El usuario de la sesión no existe', 'SESSION_USER_NOT_FOUND')
