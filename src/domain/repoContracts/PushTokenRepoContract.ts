import { PushTokenEntity } from '../entities/PushTokenEnt.js';

export interface PushTokenContract {
  /**
   * Guarda o actualiza un token FCM. Si el token ya existe en la base de datos,
   * se debe actualizar su dueño (user_id) y su fecha de registro.
   */
  upsertToken(pushToken: PushTokenEntity): Promise<void>;
  
  /**
   * Busca un token específico (útil para invalidaciones futuras).
   */
  findByToken(token: string): Promise<PushTokenEntity | null>;
}