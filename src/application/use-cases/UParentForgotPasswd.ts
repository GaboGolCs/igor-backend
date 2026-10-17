// src/application/use-cases/ParentForgotPasswd.ts

import crypto from 'crypto';
import { MailService } from '../../infrastructure/messaging/MailService.js';
import { UserRepo } from '../../infrastructure/database/UserRepo.js';
import { RedisRecoveryTokenRepository } from '../../infrastructure/messaging/RedisRecoveryPassWdToken.js';
import { hashPassword } from '../../infrastructure/security/hashingPasswd.js';
import { AppError } from '../errors/AppError.js';

export class parentForgotPasswd {
  constructor() {}

  /**
   * Inicia el flujo de recuperación de contraseña.
   * Nunca lanza por un email inexistente ni por fallas de correo/Redis: el endpoint
   * siempre responde lo mismo para no revelar qué emails están registrados.
   * @param email Correo electrónico del apoderado (ROLE_PARENT).
   */
  static async forgotPassword(email: string): Promise<void> {
    const user = await new UserRepo().findByEmail(email);

    // Retorno silencioso: solo los apoderados tienen email y pueden recuperar contraseña
    if (!user || user.role !== 'PARENT' || !user.email) {
      return;
    }

    try {
      // Token criptográfico de un solo uso, guardado en Redis con TTL de 15 minutos
      const resetToken = crypto.randomBytes(32).toString('hex');
      const TTL_SECONDS = 900;
      await new RedisRecoveryTokenRepository().save(resetToken, user.id, TTL_SECONDS);

      await new MailService().sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      console.error('[ForgotPassword] No se pudo completar el envío del enlace de recuperación:', (error as Error).message);
    }
  }

  /**
   * Valida el token efímero y actualiza la contraseña del usuario.
   * @param token Token seguro enviado al correo.
   * @param newPassword Nueva contraseña en texto plano.
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const recoveryTokenRepository = new RedisRecoveryTokenRepository()

    const userId = await recoveryTokenRepository.verify(token);
    if (!userId) {
      throw new AppError(400, 'INVALID_RESET_TOKEN', 'El enlace de recuperación es inválido o ha expirado.');
    }

    const passwordHash = await hashPassword(newPassword);

    // Si falla el guardado se lanza el error (500) y el token NO se consume, para poder reintentar
    await new UserRepo().updatePassword(userId, passwordHash);

    await recoveryTokenRepository.delete(token);
  }
}
