import jwt from 'jsonwebtoken';

export function createJWToken(payload:object): string | null {
    try { 

    const token = jwt.sign(payload, process.env.JWT_SECRET_CREATE as string, { expiresIn: '1h' });
    return token;
    }
    catch (error) {
        console.error('Error creating JWT token');
        return null;
    }   
}