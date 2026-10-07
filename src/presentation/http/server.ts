import express, { type Express } from 'express';
import dotenv from 'dotenv';

// Importación de rutas
import { rAuthInstance } from '../routes/RAuth.js';
import { rFamilyInstance } from '../routes/RFamily.js';
import { rMoodInstace } from '../routes/RMood.js';
import { rCalendarEventInstance } from '../routes/RCalendarEvent.js';
import { rReminderInstance } from '../routes/RReminder.js';
import { rPushTokens } from '../routes/RPushTokens.js';
import { rTriviaQuestion } from '../routes/RTriviaQuestion.js';
import { rRewardClaim } from '../routes/RRewardClaim.js';

// Importación del worker de BullMQ y la conexión de Redis
import '../../infrastructure/config/firebaseAdmin.js';
import { startReminderWorker } from '../../infrastructure/messaging/ReminderWorker.js';
import { redisConnection } from '../../infrastructure/messaging/redisConnection.js';


dotenv.config();

const PORT = process.env.PORT || 3000;
const app: Express = express();

// Middlewares
app.use(express.json());

// Registro de rutas API v1
app.use("/api/v1/auth", rAuthInstance);
app.use("/api/v1/family", rFamilyInstance);
app.use("/api/v1/moods", rMoodInstace);
app.use("/api/v1/calendar/events", rCalendarEventInstance);
app.use("/api/v1/reminders", rReminderInstance);
app.use("/api/v1/push-tokens", rPushTokens);
app.use("/api/v1/games/questions", rTriviaQuestion);
app.use("/api/v1/rewards/claims", rRewardClaim);
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

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