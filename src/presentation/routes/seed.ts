import {prisma} from '../../infrastructure/database/prisma.js';

async function main() {
  console.log('🌱 Iniciando carga de datos (Seed) para el motor de Trivia de IGOR...');

  // Banco inicial de preguntas educativas
  const triviaQuestions = [
    {
      category: 'Ciencia',
      question_text: '¿Cuál es el planeta más grande del sistema solar?',
      options_json: ['Tierra', 'Júpiter', 'Marte', 'Saturno'], // Júpiter es el índice 1
      correct_option: 1,
    },
    {
      category: 'Naturaleza',
      question_text: '¿Qué animal es conocido como el "rey de la selva"?',
      options_json: ['Elefante', 'Tigre', 'León', 'Gorila'], // León es el índice 2
      correct_option: 2,
    },
    {
      category: 'Historia',
      question_text: '¿En qué país se encuentran las antiguas pirámides de Guiza?',
      options_json: ['México', 'Perú', 'Egipto', 'Italia'], // Egipto es el índice 2
      correct_option: 2,
    },
    {
      category: 'Matemáticas',
      question_text: '¿Cuánto es 8 x 7?',
      options_json: ['54', '56', '62', '48'], // 56 es el índice 1
      correct_option: 1,
    },
    {
      category: 'Geografía',
      question_text: '¿Cuál es el océano más grande del mundo?',
      options_json: ['Atlántico', 'Índico', 'Ártico', 'Pacífico'], // Pacífico es el índice 3
      correct_option: 3,
    }
  ];

  // Insertamos las preguntas en la base de datos iterando sobre el arreglo
  let count = 0;
  for (const question of triviaQuestions) {
    await prisma.triviaQuestion.create({
      data: question,
    });
    count++;
  }

  console.log(`✅ Seed completado con éxito. Se insertaron ${count} preguntas.`);
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });