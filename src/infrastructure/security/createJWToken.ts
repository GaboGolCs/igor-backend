import jwt, { SignOptions } from 'jsonwebtoken';
import { UserEntity } from '../../domain/entities/UserEnt.js';
import { IgorJwtPayload } from '../../domain/repoContracts/JWTokenPayloadContract.js';
import { env } from '../config/env.js';

// Lanza si no puede firmar: el errorHandler lo convierte en 500
export function createJWToken(user: UserEntity): string {
  const payload: Omit<IgorJwtPayload, 'iat' | 'exp'> = {
    sub: user.id,
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] });
}
