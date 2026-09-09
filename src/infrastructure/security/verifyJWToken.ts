import jwt from 'jsonwebtoken';
import { IgorJwtPayload } from '../../domain/repoContracts/JWTokenPayloadContract.js';


export function verifyJWToken(token: string): IgorJwtPayload | null {
  try {
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_CREATE;
    
    if (!secret) {
      console.error('Error de configuración: Variable de entorno JWT_SECRET no definida.');
      return null;
    }

    const decoded = jwt.verify(token, secret);

    if (typeof decoded === 'object' && decoded !== null && 'sub' in decoded && 'role' in decoded) {
      return decoded as IgorJwtPayload;
    }

    return null;
  } catch (error) {
    console.error('Error al verificar el token JWT en IGOR:', error);
    return null;
  }
}