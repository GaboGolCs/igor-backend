import { Request, Response } from 'express';
import { GetRandomTriviaUseCase } from '../../application/use-cases/UGetRandomTrivia.js';

export class TriviaController {
    constructor() {}

    public async getRandomQuestion (req: Request, res: Response) {
      const questionDto = await GetRandomTriviaUseCase();
      return res.status(200).json(questionDto);
  }
}
