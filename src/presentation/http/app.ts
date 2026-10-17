import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from '../../infrastructure/config/env.js';

// Importación de rutas
import { rAuthInstance } from '../routes/RAuth.js';
import { rFamilyInstance } from '../routes/RFamily.js';
import { rMoodInstace } from '../routes/RMood.js';
import { rCalendarEventInstance } from '../routes/RCalendarEvent.js';
import { rReminderInstance } from '../routes/RReminder.js';
import { rPushTokens } from '../routes/RPushTokens.js';
import { rTriviaQuestion } from '../routes/RTriviaQuestion.js';
import { rRewardClaim } from '../routes/RRewardClaim.js';
import { rParentalTip } from '../routes/RParentalTips.js';
import { rHealth } from '../routes/RHealth.js';
import { rDocs } from '../routes/RDocs.js';
import { errorHandler, notFoundHandler } from '../middlewares/errorHandler.js';

// Aplicación Express sin listen: server.ts la levanta y los tests la usan con supertest
export const app: Express = express();

// Detrás de un proxy/balanceador (para IP real en rate limit y logs)
app.set('trust proxy', env.TRUST_PROXY);

// Middlewares
app.use(helmet());
// Solo los orígenes de CORS_ORIGINS pueden llamar desde el navegador. Las apps nativas no envían Origin.
app.use(cors({
  origin: env.CORS_ORIGINS,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}));
app.use(express.json({ limit: '100kb' }));

app.use("/health", rHealth);
if (env.API_DOCS_ENABLED) {
  app.use("/api/docs", rDocs);
}

// Registro de rutas API v1
app.use("/api/v1/auth", rAuthInstance);
app.use("/api/v1/family", rFamilyInstance);
app.use("/api/v1/moods", rMoodInstace);
app.use("/api/v1/calendar/events", rCalendarEventInstance);
app.use("/api/v1/reminders", rReminderInstance);
app.use("/api/v1/push-tokens", rPushTokens);
app.use("/api/v1/games/questions", rTriviaQuestion);
app.use("/api/v1/games/rewards", rRewardClaim);
app.use("/api/v1/tips", rParentalTip);


app.get('/', (req, res) => {
  res.json({ name: 'IGOR Backend', docs: env.API_DOCS_ENABLED ? '/api/docs' : undefined, health: '/health' });
});

// Siempre al final: rutas inexistentes y manejador global de errores (respuestas JSON)
app.use(notFoundHandler);
app.use(errorHandler);
