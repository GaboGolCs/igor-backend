import jwt from 'jsonwebtoken';
import { UserEntity } from '../../domain/entities/UserEnt.js';

export function createJWToken(data:UserEntity): string | null {
    try { 

    const payload = {
        id: data.id,
        role: data.role,
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET_CREATE as string, { expiresIn: '1000h' });
    return token;
    }
    catch (error) {
        console.error(error);
        return null;
    }   
}