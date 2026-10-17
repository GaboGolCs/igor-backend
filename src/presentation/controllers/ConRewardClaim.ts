import { Request, Response } from 'express';
import { ClaimRewardUseCase } from '../../application/use-cases/UClaimReward.js';
import { UpdateRewardStatusUseCase } from '../../application/use-cases/UPatchRewardStatus.js';

export class ConRewardClaim {
    public async postRewardClaim(req: Request, res: Response) {
        const result = await ClaimRewardUseCase(res.locals.user.id, req.body.rewardTitle);
        // Retorna 201 Created según la especificación OpenAPI
        return res.status(201).json(result);
    }

    public async patchRewardClaimStatus(req: Request, res: Response) {
        const result = await UpdateRewardStatusUseCase(req.params.rewardId as string, res.locals.user.id, req.body.status);
        return res.status(200).json(result);
    }
}
