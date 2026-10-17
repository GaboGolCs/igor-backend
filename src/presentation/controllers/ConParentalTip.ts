import { Request, Response } from 'express';
import {GetParentalTipsUC} from "../../application/use-cases/UGetParentalTips.js";
export class ParentalTipController {

  constructor() {}

  public async getAll(req: Request, res: Response) {
    const tips = await new GetParentalTipsUC().getAll()
    // Retorna 200 OK con la lista de consejos según la especificación
    return res.status(200).json(tips);
  }
}
