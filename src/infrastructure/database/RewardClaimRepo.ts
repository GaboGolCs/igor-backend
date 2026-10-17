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
        created_at: claim.createdAt ?? new Date(), // Corregido a createdAt
        updated_at: claim.updatedAt ?? undefined,  // Corregido a updatedAt
      },
    });

    return new RewardClaimEntity(
      record.id,
      record.child_id,
      record.family_id,
      record.reward_title,
      record.status as RewardClaimStatus,
      record.created_at,
      record.updated_at ?? undefined // Conversión de null a undefined
    );
  }

  async getRewardClaim(rewardId: string): Promise<RewardClaimEntity | null> {
    const record = await prisma.rewardClaim.findFirst({
      where: {
        id: rewardId 
      },
    });

    if (!record) {
      return null;
    }

    return new RewardClaimEntity(
      record.id,
      record.child_id,
      record.family_id,
      record.reward_title,
      record.status as RewardClaimStatus,
      record.created_at,
      record.updated_at ?? undefined // Conversión de null a undefined
    );
  }

  async updateStatusIfPending(rewardId: string, status: RewardClaimStatus): Promise<RewardClaimEntity | null> {
    // updateMany permite condicionar por estado: si otra petición ya la procesó, no se actualiza nada
    const { count } = await prisma.rewardClaim.updateMany({
      where: { id: rewardId, status: 'PENDING' },
      data: { status, updated_at: new Date() },
    });
    if (count === 0) {
      return null;
    }

    const record = await prisma.rewardClaim.findUniqueOrThrow({ where: { id: rewardId } });

    return new RewardClaimEntity(
      record.id,
      record.child_id,
      record.family_id,
      record.reward_title,
      record.status as RewardClaimStatus,
      record.created_at,
      record.updated_at ?? undefined // Conversión de null a undefined
    );
  }
}