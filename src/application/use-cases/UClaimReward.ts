import {RewardClaimEntity} from '../../domain/entities/RewardClaimEnt.js';
import {ClaimRewardOutputDTO } from '../dtos/ClaimRewardDTO.js';
import {RewardClaimRepository} from '../../infrastructure/database/RewardClaimRepository.js';
import {FamilyRepo} from '../../infrastructure/database/FamilyRepo.js';

export async function ClaimRewardUseCase(childId: string, rewardTitle: string): Promise<ClaimRewardOutputDTO> {


    const rewardClaimRepositoryInstance = new RewardClaimRepository();
    const familyRepositoryInstance = new FamilyRepo();

    
    const _family = await familyRepositoryInstance.findFamilyByUserId(childId);
    if (!_family) {
        throw new Error('Internal server error, no se encontró la familia para el usuario proporcionado.');
    }

    //Creamos la Claim en la memoria
    const newClaim = RewardClaimEntity.createRewardClaim(childId, _family.id, rewardTitle);

//Guardamos el Claim en la BD
    const savedClaim = await rewardClaimRepositoryInstance.create(newClaim);

    return {
      id: savedClaim.id,
      rewardTitle: savedClaim.rewardTitle,
      status: savedClaim.status,
    }

  }
