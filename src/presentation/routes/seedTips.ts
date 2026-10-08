import {prisma} from "../../infrastructure/database/prisma.js"

const parentalTips = [
  {
    title: 'Crianza Respetuosa',
    content: 'Fomentar el diálogo al validar las emociones de los niños. Escucha activamente sin juzgar inmediatamente.',
  },
  {
    title: 'Rutinas Predecibles',
    content: 'Establecer horarios claros para las comidas, tareas y la hora de dormir ayuda a disminuir la ansiedad infantil y mejora la convivencia.',
  },
  {
    title: 'Tiempo de Calidad',
    content: 'Dedica al menos 15 minutos diarios a jugar o conversar con tu hijo sin distracciones digitales (celulares o televisión).',
  },
  {
    title: 'Refuerzo Positivo',
    content: 'En lugar de solo castigar lo negativo, reconoce y celebra los pequeños logros cotidianos de tu hijo para fortalecer su autoestima.',
  },
  {
    title: 'Gestión de Pantallas',
    content: 'Acuerda con tus hijos un tiempo máximo de uso de dispositivos electrónicos y fomenta actividades al aire libre o juegos de mesa familiares.',
  }
];

async function main() {
  console.log('🌱 Iniciando carga de datos (Seed) para Tips de Crianza...');

  let count = 0;
  for (const tip of parentalTips) {
    await prisma.parentalTip.create({
      data: tip,
    });
    count++;
  }

  console.log(`✅ ¡Seed completado con éxito! Se insertaron ${count} consejos educativos en la base de datos.`);
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed de Tips:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });