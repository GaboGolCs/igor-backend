import { prisma } from './prisma.js';
import { RewardClaimEntity, RewardClaimStatus } from '../../domain/entities/RewardClaimEnt.js';
import { IRewardClaimRepository } from '../../domain/repoContracts/RewardClaimRepoContract.js';

export class RewardClaimRepository implements IRewardClaimRepository {

    constructor() {}
  async create(claim: RewardClaimEntity): Promise<RewardClaimEntity> {


    const record = await prisma.rewardClaim.create({
      data: {
        id: claim.id,
        child_id: claim.childId,
        family_id: claim.familyId,
        reward_title: claim.rewardTitle,
        status: claim.status,
        created_at: claim.createdAt ?? new Date(),
      },
    });

    return new RewardClaimEntity(
      record.id,
      record.child_id,
      record.family_id,
      record.reward_title,
      record.status as RewardClaimStatus,
      record.created_at
    );
  }
}