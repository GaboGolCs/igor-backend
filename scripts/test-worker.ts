import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Nombre de la cola que escucha el Worker (REMINDER_QUEUE_NAME en ReminderQueue.ts)
const QUEUE_NAME = 'daily-reminders';

async function runTestWorker() {
  // Leemos el UUID del usuario del argumento de línea de comandos
  const targetUserId = process.argv[2];

  if (!targetUserId) {
    console.error('❌ Error: Debes ingresar el UUID del usuario objetivo.');
    console.log('\n💡 Uso correcto:');
    console.log('   npm run test:worker -- <UUID_DEL_USUARIO>\n');
    process.exit(1);
  }

  console.log(`📡 Conectando a Redis (${REDIS_URL})...`);

  const connection = new Redis(REDIS_URL, { maxRetriesPerRequest: null });
  const remindersQueue = new Queue(QUEUE_NAME, { connection });

  console.log(`🚀 Inyectando tarea de prueba en la cola "${QUEUE_NAME}"...`);

  // Agregamos el Job a la cola con los datos necesarios para el FCMPushService
  const job = await remindersQueue.add('send-push-reminder', {
    reminderId: 'test-manual',
    targetUserId: targetUserId,
    title: '🔔 Recordatorio de Prueba IGOR',
    body: '¡Hola! Si ves este mensaje, la cola de Redis y el Worker con FCM funcionan correctamente.',
  });

  console.log(`✅ Job creado exitosamente con ID: ${job.id}`);
  console.log('👀 Revisa la consola donde está corriendo tu servidor para ver el procesamiento del Worker en tiempo real.\n');

  await remindersQueue.close();
  await connection.quit();
  process.exit(0);
}

runTestWorker().catch((error) => {
  console.error('❌ Error crítico inyectando la tarea en Redis:', error);
  process.exit(1);
});
