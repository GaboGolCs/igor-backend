// src/application/use-cases/ParentForgotPasswd.ts

import crypto from 'crypto';
import argon2 from 'argon2';
import { MailService } from '../../infrastructure/messaging/MailService.js';
import { UserRepo } from '../../infrastructure/database/UserRepo.js';
import { RedisRecoveryTokenRepository } from '../../infrastructure/messaging/RedisRecoveryPassWdToken.js';
export class parentForgotPasswd {
  // Inyección de dependencias (Principio de Inversión de Dependencias - SOLID)
  constructor(
  ) {}

  /**
   * Inicia el flujo de recuperación de contraseña.
   * @param email Correo electrónico del apoderado (ROLE_PARENT).
   */
  static async forgotPassword(email: string): Promise<void> {

    try {
          const userRepository = new UserRepo
          const recoveryTokenRepository = new RedisRecoveryTokenRepository
          const mailService = new MailService

          const user = await userRepository.findByEmail(email);
    
          if (!user) {
            // Retorno silencioso para evitar ataques de enumeración de usuarios
            console.error(`[AuthUseCases] Intento de recuperación para email inexistente: ${email}`);
            throw new Error("Bad Request, no existe un usuario con el email enviado")
          }

          // 2. Generamos un token criptográfico seguro de un solo uso
          const resetToken = crypto.randomBytes(32).toString('hex');
    
          // 3. Guardamos el token en Redis con un TTL de 15 minutos (900 segundos)
          const TTL_SECONDS = 900;
          await recoveryTokenRepository.save(resetToken, user.id, TTL_SECONDS);

          // 4. Delegamos el envío del correo de recuperación al adaptador de mensajería
          if(user.email){
            await mailService.sendPasswordResetEmail(user.email , resetToken);
          }

          } catch (error) {
            console.error(error)
            throw error
          }

  }

  /**
   * Valida el token efímero y actualiza la contraseña del usuario.
   * @param token Token seguro enviado al correo.
   * @param newPassword Nueva contraseña en texto plano.
   */

  static async resetPassword(token: string, newPassword: string): Promise<void> {

    try {
        const userRepository = new UserRepo
        const recoveryTokenRepository = new RedisRecoveryTokenRepository


        // 1. Verificamos el token directamente en la caché rápida (Redis)
        const userId = await recoveryTokenRepository.verify(token);
    
        if (!userId) {
          throw new Error('El enlace de recuperación es inválido o ha expirado.');
        }

        // 2. Opciones de Hasheo
            const options: argon2.HashOptions = {
            type: argon2.argon2id,    // Variant of Argon2
            memoryCost: 65536,        // 64 MiB
            timeCost: 2,              // 2 passes
            parallelism: 1,           // 4 threads
            hashLength: 32,           // 32 bytes output
            salt: crypto.randomBytes(16),  // 16 bytes salt
        };
        const passwordHash = await argon2.hash(newPassword, options);

        // 3. Persistimos el cambio en PostgreSQL
        const realizado = await userRepository.updatePassword(userId, passwordHash);
        if(!realizado){
          console.error("Internal Server Error, error al acualizar la contraseña")
        }
    

        // 4. Limpiamos la memoria: Eliminamos el token de Redis tras su uso exitoso
        await recoveryTokenRepository.delete(token);
    
        console.log(`[AuthUseCases] Contraseña actualizada exitosamente para el usuario: ${userId}`);
  
    } catch (error) {
        console.error(error)
        throw error
    }
}


}