// src/domain/repositories/recovery-token.repository.ts

export interface RecoveryPassWdRepoContract {
  /**
   * Guarda un token de recuperación asociado a un usuario con un tiempo de vida (TTL).
   * @param token El hash seguro generado.
   * @param userId El UUID del usuario.
   * @param ttlSeconds Tiempo de expiración en segundos.
   */
  save(token: string, userId: string, ttlSeconds: number): Promise<void>;

  /**
   * Verifica la existencia de un token y retorna el UUID del usuario asociado.
   * @param token El hash seguro a verificar.
   * @returns El UUID del usuario o null si no existe/expiró.
   */
  verify(token: string): Promise<string | null>;

  /**
   * Elimina un token de la memoria (idealmente tras ser utilizado con éxito).
   * @param token El hash seguro a eliminar.
   */
  delete(token: string): Promise<void>;
}