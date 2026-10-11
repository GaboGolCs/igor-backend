import { RewardClaimEntity, RewardClaimStatus } from '../entities/RewardClaimEnt.js';

export interface IRewardClaimRepository {
  create(claim: RewardClaimEntity): Promise<RewardClaimEntity>;
  getRewardClaim(rewardId: string, status: RewardClaimStatus): Promise<RewardClaimEntity | null>;
  updateStatus(rewardId: string, status: RewardClaimStatus): Promise<RewardClaimEntity>
}