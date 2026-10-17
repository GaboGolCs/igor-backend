import { RewardClaimEntity, RewardClaimStatus } from '../entities/RewardClaimEnt.js';

export interface IRewardClaimRepository {
  create(claim: RewardClaimEntity): Promise<RewardClaimEntity>;
  getRewardClaim(rewardId: string): Promise<RewardClaimEntity | null>;
  // Actualiza solo si sigue PENDING; null si ya fue procesada
  updateStatusIfPending(rewardId: string, status: RewardClaimStatus): Promise<RewardClaimEntity | null>
}