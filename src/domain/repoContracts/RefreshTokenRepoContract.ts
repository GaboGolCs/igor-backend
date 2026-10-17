// Sesiones de larga duración: refresh tokens opacos, revocables y de un solo uso (rotación)

export interface StoredRefreshToken {
  userId: string;
  used: boolean;
}

export interface RefreshTokenRepoContract {
  /** Crea un refresh token nuevo para el usuario y lo devuelve en claro (solo se guarda su hash). */
  issue(userId: string): Promise<string>;

  /**
   * Marca el token como usado de forma atómica y devuelve su estado anterior.
   * null si no existe o expiró; used = true si ya había sido usado (posible robo).
   */
  consume(token: string): Promise<StoredRefreshToken | null>;

  /** Revoca un token (logout). No falla si no existe. */
  revoke(token: string): Promise<void>;

  /** Revoca todas las sesiones de un usuario (cambio de credenciales o reutilización detectada). */
  revokeAll(userId: string): Promise<void>;
}
