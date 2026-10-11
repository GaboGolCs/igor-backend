import {ClaimRewardOutputDTO } from '../dtos/ClaimRewardDTO.js';
import {RewardClaimRepository} from '../../infrastructure/database/RewardClaimRepo.js';
import {FamilyRepo} from '../../infrastructure/database/FamilyRepo.js';

export async function UpdateRewardStatusUseCase (rewardId: string, parentId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<ClaimRewardOutputDTO> {

    const rewardClaimRepositoryInstance = new RewardClaimRepository();
    const familyRepositoryInstance = new FamilyRepo();

    const _rewardClaim = await rewardClaimRepositoryInstance.getRewardClaim(rewardId);
    if (!_rewardClaim) {
        throw new Error('Bad Request, no se encontró la recompensa con el ID proporcionado.');
    }

    if(_rewardClaim.status === "ACCEPTED"){
        throw new Error("Bad Request, ya se encuentra aceptada la reward")
    }

    if(_rewardClaim.status === "REJECTED"){
        throw new Error("Bad Request, ya se encuentra rechazada la reward")
    }
    
    const _family = await familyRepositoryInstance.findFamilyByUserId(parentId);
    if (!_family) {
        throw new Error('Bad Request, no se encontró la familia para el usuario proporcionado.');
    }

    if (_rewardClaim.familyId !== _family.id) {
        throw new Error('Bad Request, la recompensa no pertenece a la familia del usuario proporcionado.');
    }

//Guardamos el Claim en la BD
    const updatedReward = await rewardClaimRepositoryInstance.updateStatus(rewardId, status);

    return {
      id: updatedReward.id,
      rewardTitle: updatedReward.rewardTitle,
      status: updatedReward.status,
    };

  }

