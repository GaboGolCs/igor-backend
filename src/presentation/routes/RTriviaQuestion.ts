import { Router } from "express";
import { zodMiddleware } from "../middlewares/zodMiddleware.js";
import { postReminderValidator } from "../validators/reminderValidators.js";
import {TriviaController} from "../controllers/TriviaController.js";

const triviaControllerInstance = new TriviaController();
const router = Router();

export const rTriviaQuestion = router.get('/random', triviaControllerInstance.getRandomQuestion);
