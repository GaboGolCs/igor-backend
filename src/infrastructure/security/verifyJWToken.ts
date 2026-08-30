import jwt from "jsonwebtoken";

export function verifyJWToken(token: string): string | null {
    try {
        const payloadDecoded = jwt.verify(token, process.env.JWT_SECRET_CREATE as string);
        return payloadDecoded as string;
    } catch (error) {
        console.error('Error verifying JWT token:', error);
        return null;
    }
}