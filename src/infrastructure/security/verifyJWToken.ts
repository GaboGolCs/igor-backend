import jwt from 'jsonwebtoken';
import { IgorJwtPayload } from '../../domain/repoContracts/JWTokenPayloadContract.js';
import { env } from '../config/env.js';

// Devuelve null si el token es inválido, expiró o no trae sub/role
export function verifyJWToken(token: string): IgorJwtPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (typeof decoded === 'object' && decoded !== null && 'sub' in decoded && 'role' in decoded) {
      return decoded as IgorJwtPayload;
    }

    return null;
  } catch {
    // Token inválido o expirado: es un caso esperado, no se registra el error completo
    return null;
  }
}
