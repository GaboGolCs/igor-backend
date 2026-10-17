import { Router } from "express";
import {TriviaController} from "../controllers/ConTrivia.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const triviaControllerInstance = new TriviaController();

export const rTriviaQuestion = Router();

rTriviaQuestion.get('/random', requireAuth, requireRole("CHILD"), triviaControllerInstance.getRandomQuestion);
