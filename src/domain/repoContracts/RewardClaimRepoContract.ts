import { RewardClaimEntity } from '../entities/RewardClaimEnt.js';

export interface IRewardClaimRepository {
  create(claim: RewardClaimEntity): Promise<RewardClaimEntity>;
}