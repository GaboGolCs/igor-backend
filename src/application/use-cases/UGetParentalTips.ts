import {ParentalTipRepoContract} from "../../domain/repoContracts/ParentalTipRepoContract.js";
import { ParentalTipOutputDTO } from "../dtos/ParentalTipOutputDTO.js";
import {ParentalTipRepository} from "../../infrastructure/database/ParentalTipRepo.js";

export class GetParentalTipsUC {
  constructor() {}

  async getAll(): Promise<ParentalTipOutputDTO[]> {
    const parentalTipRepoInstance = new ParentalTipRepository();
    const tips = await parentalTipRepoInstance.getAll();
    
    return tips.map(tip => ({
      id: tip.id,
      title: tip.title,
      content: tip.content,
    }));
  }
}