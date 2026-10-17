import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../../application/errors/AppError.js";
import { extractTokenFromHeader } from "../validators/extractTokenInfo.js";
import { verifyJWToken } from "../../infrastructure/security/verifyJWToken.js";

export type AuthRole = 'PARENT' | 'CHILD' | 'ADMIN';

export interface AuthUser {
    id: string
    role: AuthRole
}

declare global {
    namespace Express {
        interface Locals {
            user: AuthUser
            query: any
        }
    }
}

// Exige un JWT válido en "Authorization: Bearer <token>" y deja el usuario en res.locals.user
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = extractTokenFromHeader(req)
    if (!token) {
        throw new UnauthorizedError("Token de autorización no especificado o mal formateado", "TOKEN_MISSING")
    }

    const decodedToken = verifyJWToken(token)
    if (!decodedToken) {
        throw new UnauthorizedError("Token inválido o expirado", "TOKEN_INVALID")
    }

    res.locals.user = { id: decodedToken.sub, role: decodedToken.role as AuthRole }
    next()
}

// Debe ir después de requireAuth
export const requireRole = (...roles: AuthRole[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        if (!roles.includes(res.locals.user.role)) {
            throw new ForbiddenError("El usuario no cuenta con los permisos para ingresar", "FORBIDDEN_ROLE")
        }
        next()
    }
