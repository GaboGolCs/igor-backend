import { ParentalTipEnt } from "../entities/ParentalTipEnt.js";
export interface ParentalTipRepoContract{

  getAll(): Promise<ParentalTipEnt[]>;

}