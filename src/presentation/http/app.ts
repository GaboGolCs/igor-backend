import express, { type Express } from 'express';

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

// Aplicación Express sin listen: server.ts la levanta y los tests la usan con supertest
export const app: Express = express();

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
app.use("/api/v1/games/rewards", rRewardClaim);
app.use("/api/v1/tips", rParentalTip);



app.get('/', (req, res) => {
  res.send('Hello, World!');
});
