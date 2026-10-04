import { prisma } from "./prisma.js";
import { Question } from "../../domain/entities/Question.js";
import { IQuestionRepository } from "../../domain/repoContracts/QuestionRepoContract.js";

export class PrismaQuestionRepository implements IQuestionRepository {
  
  public async getRandomQuestion(): Promise<Question | null> {
    // 1. Contamos el total de preguntas en el banco de datos
    const count = await prisma.triviaQuestion.count();

    if (count === 0) {
      return null;
    }

    // 2. Calculamos un offset (salto) aleatorio
    const randomSkip = Math.floor(Math.random() * count);

    // 3. Obtenemos un registro aplicando el salto aleatorio
    const record = await prisma.triviaQuestion.findFirst({
      skip: randomSkip,
    });

    if (!record) {
      return null;
    }

    // 4. Reconstruimos la entidad de dominio mapeando los campos de Prisma
    return new Question(
      record.id,
      record.category,
      record.question_text,
      // Prisma maneja el JSON internamente, lo casteamos al tipo de nuestro Dominio
      record.options_json as string[], 
      record.correct_option
    );
  }
}