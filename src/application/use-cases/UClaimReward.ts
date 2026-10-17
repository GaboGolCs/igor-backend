import {RewardClaimEntity} from '../../domain/entities/RewardClaimEnt.js';
import {ClaimRewardOutputDTO } from '../dtos/ClaimRewardDTO.js';
import {RewardClaimRepository} from '../../infrastructure/database/RewardClaimRepo.js';
import {FamilyRepo} from '../../infrastructure/database/FamilyRepo.js';
import { sessionUserNotFound } from '../errors/AppError.js';

export async function ClaimRewardUseCase(childId: string, rewardTitle: string): Promise<ClaimRewardOutputDTO> {

    const _family = await new FamilyRepo().findFamilyByUserId(childId);
    if (!_family) {
        throw sessionUserNotFound();
    }

    const newClaim = RewardClaimEntity.createRewardClaim(childId, _family.id, rewardTitle);
    const savedClaim = await new RewardClaimRepository().create(newClaim);

    return {
      id: savedClaim.id,
      rewardTitle: savedClaim.rewardTitle,
      status: savedClaim.status,
    }
}
