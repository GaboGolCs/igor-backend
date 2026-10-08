import { IQuestionRepository } from '../../domain/repoContracts/QuestionRepoContract.js';
import { TriviaQuestionDTO } from '../dtos/TriviaQuestionDTO.js';
import {PrismaQuestionRepository} from "../../infrastructure/database/QuestionRepo.js";

export async function  GetRandomTriviaUseCase(): Promise<TriviaQuestionDTO> {

    const questionRepository: IQuestionRepository = new PrismaQuestionRepository();
    
    const question = await questionRepository.getRandomQuestion();

    if (!question) {
      throw new Error('Internal Server Error, No se han encontrado preguntas en la base de datos');
    }

    // Regla de Negocio (Anti-cheat): Solo devolvemos los campos seguros según OpenAPI.
    // Omitimos intencionalmente 'correctOption' y 'category'.
    return {
      id: question.id,
      questionText: question.questionText,
      options: question.options,
    };
  
}