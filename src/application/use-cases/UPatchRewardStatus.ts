import {ClaimRewardOutputDTO } from '../dtos/ClaimRewardDTO.js';
import {RewardClaimRepository} from '../../infrastructure/database/RewardClaimRepo.js';
import {FamilyRepo} from '../../infrastructure/database/FamilyRepo.js';
import { ConflictError, NotFoundError, sessionUserNotFound } from '../errors/AppError.js';

export async function UpdateRewardStatusUseCase (rewardId: string, parentId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<ClaimRewardOutputDTO> {

    const rewardClaimRepositoryInstance = new RewardClaimRepository();

    const _family = await new FamilyRepo().findFamilyByUserId(parentId);
    if (!_family) {
        throw sessionUserNotFound();
    }

    // La familia se revisa antes que el estado: una reward ajena responde igual que una inexistente
    const _rewardClaim = await rewardClaimRepositoryInstance.getRewardClaim(rewardId);
    if (!_rewardClaim || _rewardClaim.familyId !== _family.id) {
        throw new NotFoundError('No se encontró la recompensa en tu familia', 'REWARD_NOT_FOUND');
    }

    const alreadyProcessed = () =>
        new ConflictError('La recompensa ya fue aceptada o rechazada', 'REWARD_ALREADY_PROCESSED');

    if (_rewardClaim.status !== 'PENDING') {
        throw alreadyProcessed();
    }

    // Update condicional (solo si sigue PENDING): si dos peticiones compiten, solo una gana
    const updatedReward = await rewardClaimRepositoryInstance.updateStatusIfPending(rewardId, status);
    if (!updatedReward) {
        throw alreadyProcessed();
    }

    return {
      id: updatedReward.id,
      rewardTitle: updatedReward.rewardTitle,
      status: updatedReward.status,
    };
}
