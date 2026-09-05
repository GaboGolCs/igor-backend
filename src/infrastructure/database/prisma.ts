import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../prisma/client.js";

const connectionString = `${process.env.DATABASE_URL}`;


// 1. Función que genera la instancia pura de Prisma
const prismaClientSingleton = () => {
    const adapter = new PrismaPg({ connectionString });
    const prisma = new PrismaClient({ adapter });
  return  prisma;
};

// 2. Extendemos el objeto global de Node.js para evitar errores de tipado
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// 3. Instanciamos Prisma (usando la caché global si existe)
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// 4. Prevenimos el agotamiento de conexiones en modo desarrollo
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}