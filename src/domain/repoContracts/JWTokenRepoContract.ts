
export interface JWTokenRepository {
    createToken(payload: object): string | null;
    verifyToken(token: string): string | null;
}