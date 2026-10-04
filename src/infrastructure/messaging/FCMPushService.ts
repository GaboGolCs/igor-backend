// src/infrastructure/messaging/FCMPushService.ts

import { getMessaging } from 'firebase-admin/messaging';
import {prisma as ps} from "../database/prisma.js"; // Para limpiar tokens inválidos
export class FCMPushService {
  constructor(private readonly prisma: typeof ps) {}

  /**
   * Despacha una notificación push y maneja la limpieza de tokens expirados.
   */
  public async sendPushNotification(targetUserId: string, title: string, body: string): Promise<void> {
    // 1. Buscamos todos los tokens activos asociados a este usuario
    const userTokens = await this.prisma.pushToken.findMany({
      where: { user_id: targetUserId }
    });

    if (userTokens.length === 0) {
      console.log(`[FCM] El usuario ${targetUserId} no tiene tokens registrados. Omitiendo push.`);
      return;
    }

    // 2. Preparamos los mensajes
    const tokens = userTokens.map(t => t.token);
    const message = {
      notification: { title, body },
      tokens: tokens,
    };

    try {
      // 3. Obtenemos la instancia de mensajería y despachamos a FCM de forma masiva
      const messaging = getMessaging();
      const response = await messaging.sendEachForMulticast(message);
      
      console.log(`[FCM] Push enviado. Éxitos: ${response.successCount}, Fallos: ${response.failureCount}`);

      // 4. Mantenimiento: Identificar y eliminar tokens que ya no son válidos (app desinstalada)
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const error = resp.error?.code;
            if (
              error === 'messaging/invalid-registration-token' ||
              error === 'messaging/registration-token-not-registered'
            ) {
              failedTokens.push(tokens[idx]);
            }
          }
        });

        if (failedTokens.length > 0) {
          await this.prisma.pushToken.deleteMany({
            where: { token: { in: failedTokens } }
          });
          console.log(`[FCM] Limpieza: Se eliminaron ${failedTokens.length} tokens inválidos.`);
        }
      }
    } catch (error) {
      console.error('[FCM] Error crítico al contactar con Firebase:', error);
      throw error; // Dejamos que BullMQ marque el trabajo como fallido para reintentos
    }
  }
}