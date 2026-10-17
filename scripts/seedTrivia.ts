import {prisma} from "../src/infrastructure/database/prisma.js"

// correct_option es el índice (base 0) de la opción correcta en options_json
const triviaQuestions = [
  {
    category: 'EMOCIONES',
    question_text: '¿Qué puedes hacer cuando te sientes enojado?',
    options_json: ['Respirar profundo y contar hasta diez', 'Gritarle a alguien', 'Romper algo'],
    correct_option: 0,
  },
  {
    category: 'CONVIVENCIA',
    question_text: '¿Qué hacemos si un amigo está triste?',
    options_json: ['Nos reímos de él', 'Le preguntamos cómo está y lo acompañamos', 'Lo ignoramos'],
    correct_option: 1,
  },
  {
    category: 'RUTINAS',
    question_text: '¿Cuántas veces al día debemos lavarnos los dientes?',
    options_json: ['Una vez a la semana', 'Solo cuando comemos dulces', 'Después de cada comida'],
    correct_option: 2,
  },
  {
    category: 'NATURALEZA',
    question_text: '¿Qué necesitan las plantas para crecer?',
    options_json: ['Agua, luz y tierra', 'Solo oscuridad', 'Jugo y galletas'],
    correct_option: 0,
  },
];

async function main() {
  console.log('🌱 Iniciando carga de datos (Seed) para preguntas de Trivia...');

  const { count } = await prisma.triviaQuestion.createMany({ data: triviaQuestions });

  console.log(`✅ ¡Seed completado con éxito! Se insertaron ${count} preguntas de trivia.`);
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed de Trivia:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
