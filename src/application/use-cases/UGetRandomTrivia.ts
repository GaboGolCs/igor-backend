import { IQuestionRepository } from '../../domain/repoContracts/QuestionRepoContract.js';
import { TriviaQuestionDTO } from '../dtos/TriviaQuestionDTO.js';
import {PrismaQuestionRepository} from "../../infrastructure/database/QuestionRepo.js";
import { NotFoundError } from '../errors/AppError.js';

export async function  GetRandomTriviaUseCase(): Promise<TriviaQuestionDTO> {

    const questionRepository: IQuestionRepository = new PrismaQuestionRepository();

    const question = await questionRepository.getRandomQuestion();

    if (!question) {
      throw new NotFoundError('No hay preguntas de trivia disponibles', 'NO_QUESTIONS');
    }

    // Regla de Negocio (Anti-cheat): Solo devolvemos los campos seguros según OpenAPI.
    // Omitimos intencionalmente 'correctOption' y 'category'.
    return {
      id: question.id,
      questionText: question.questionText,
      options: question.options,
    };

}
