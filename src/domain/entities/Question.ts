export class Question {
  constructor(
    public readonly id: string,
    public readonly category: string,
    public readonly questionText: string,
    public readonly options: string[],
    public readonly correctOption: number // Índice de la respuesta correcta (0-3)
  ) {}
}