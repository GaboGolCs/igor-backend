import { Request, Response } from "express";
import {RegisterPushTokenUseCase} from "../../application/use-cases/URegistertoken.js"
import { PrismaPushTokenRepository } from "../../infrastructure/database/PushTokenRepo.js";
export class PushTokenController {

    constructor() {
        return this;
    }

  public async registerToken (req: Request, res: Response) {
    const registerPushTokenUseCase = new RegisterPushTokenUseCase(new PrismaPushTokenRepository())

    const { token, deviceType } = req.body;
    await registerPushTokenUseCase.execute({
      userId: res.locals.user.id,
      token,
      deviceType
    });

    return res.status(200).json({
      message: "Token registrado para envío de notificaciones push."
    })
  };
}
