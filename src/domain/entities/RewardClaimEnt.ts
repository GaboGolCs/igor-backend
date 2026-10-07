export type RewardClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export class RewardClaimEntity {
  constructor(
    public readonly id: string,
    public readonly childId: string,
    public readonly familyId: string,
    public readonly rewardTitle: string,
    public readonly status: RewardClaimStatus,
    public readonly createdAt?: Date
  ) {}


 public static createRewardClaim(childId: string, familyId: string, rewardTitle: string): RewardClaimEntity {
    const id = crypto.randomUUID();
    const status: RewardClaimStatus = 'PENDING';
    const createdAt = new Date();
    return new RewardClaimEntity(id, childId, familyId, rewardTitle, status, createdAt);
  }
}

