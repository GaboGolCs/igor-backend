export interface ClaimRewardInputDTO {
  childId: string;
  familyId: string;
  rewardTitle: string;
}

export interface ClaimRewardOutputDTO {
  id: string;
  rewardTitle: string;
  status: string;
}