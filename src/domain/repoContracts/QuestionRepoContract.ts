import { Question } from '../entities/Question.js';

export interface IQuestionRepository {
  /**
   * Obtiene una pregunta aleatoria de la base de datos.
   * Retorna null si el banco de preguntas está vacío.
   */
  getRandomQuestion(): Promise<Question | null>;
}