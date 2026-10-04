// src/infrastructure/messaging/ReminderWorker.ts

import { Worker, Job } from 'bullmq';
import { redisConnection } from './redisConnection.js';
import { FCMPushService } from './FCMPushService.js';
import {prisma} from "../database/prisma.js"; // Para limpiar tokens inválidos
// Ajustamos el nombre de la cola según tu configuración previa
const REMINDER_QUEUE_NAME = 'reminders_queue'; 

// Instanciamos dependencias (en un entorno real podrías usar inyección de dependencias)
const pushService = new FCMPushService(prisma);

interface ReminderJobPayload {
  reminderId: string;
  targetUserId: string; // Basado en el campo target_user_id de la BD
  title: string;        // El título del evento, ej: "No olvidar las llaves"
  body?: string;
}

export const startReminderWorker = () => {
  const worker = new Worker<ReminderJobPayload>(
    REMINDER_QUEUE_NAME,
    async (job: Job<ReminderJobPayload>) => {
      const { reminderId, targetUserId, title, body = '¡Es hora de tu rutina!' } = job.data;
      
      console.log(`[Worker] ⏰ Procesando recordatorio ID: ${reminderId} para usuario: ${targetUserId}`);
      
      // Llamada real al servicio de FCM para despachar la notificación push
      await pushService.sendPushNotification(targetUserId, title, body);
    },
    { 
      connection: redisConnection,
      concurrency: 10, // Procesar 10 recordatorios en paralelo para asegurar SLO
      limiter: {
        max: 100,
        duration: 1000 // Limitar a 100 jobs por segundo para no saturar FCM
      }
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Tarea ${job.id} completada. Notificación entregada.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Tarea ${job?.id} falló con error:`, err.message);
    // BullMQ manejará los reintentos automáticos si los configuraste al crear el Job
  });

  console.log('[Worker] Servicio de recordatorios en ejecución y escuchando a Redis (con FCM activado)...');
};