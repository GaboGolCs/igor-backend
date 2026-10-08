import { prisma } from './prisma.js';
import {ParentalTipEnt} from "../../domain/entities/ParentalTipEnt.js";
import {ParentalTipRepoContract} from "../../domain/repoContracts/ParentalTipRepoContract.js";

export class ParentalTipRepository implements ParentalTipRepoContract {
  async getAll(): Promise<ParentalTipEnt[]> {

    const records = await prisma.parentalTip.findMany({
      orderBy: { created_at: 'desc' }, // Obtenemos los consejos más recientes primero
    });

    return records as ParentalTipEnt[];
  
  }
}