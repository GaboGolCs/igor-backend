import jwt, { SignOptions } from 'jsonwebtoken';
import { UserEntity } from '../../domain/entities/UserEnt.js';
import { IgorJwtPayload } from '../../domain/repoContracts/JWTokenPayloadContract.js';

export function createJWToken(user: UserEntity): string | null {
  try {
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_CREATE;

    if (!secret) {
      console.error('Error de configuración: JWT_SECRET no se encuentra definido.');
      return null;
    }

    const payload: Omit<IgorJwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      role: user.role,
    };

    const expiresIn = (process.env.JWT_EXPIRES_IN || '24h') as SignOptions['expiresIn'];

    return jwt.sign(payload, secret, { expiresIn });
  } catch (error) {
    console.error('Error al generar el token JWT en IGOR:', error);
    return null;
  }
}