import { env } from '../../infrastructure/config/env.js';

import { app } from './app.js';

// Importación del worker de BullMQ y la conexión de Redis
import '../../infrastructure/config/firebaseAdmin.js';
import { startReminderWorker } from '../../infrastructure/messaging/ReminderWorker.js';
import { redisConnection } from '../../infrastructure/messaging/redisConnection.js';



const PORT = env.PORT;

// Inicialización del servidor HTTP y encendido del Worker
const server = app.listen(PORT, () => {
  console.log(`🚀 [IGOR Backend] Server is running on port ${PORT}`);
  
  // Arrancamos el Worker para escuchar la cola de recordatorios en Redis
  startReminderWorker();
});

// Manejo de Apagado Limpio (Graceful Shutdown)
const shutdown = async (signal: string) => {
  console.log(`\n[Server] Recibida señal ${signal}. Cerrando conexiones...`);
  
  server.close(async () => {
    console.log('[Server] Servidor HTTP cerrado.');
    
    // Cierre seguro de la conexión con Redis para evitar tareas huérfanas
    await redisConnection.quit();
    console.log('[Redis] Conexión cerrada de forma segura.');
    
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
