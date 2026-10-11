import { Router } from "express";
import { zodMiddleware } from "../middlewares/zodMiddleware.js";
import { ConRewardClaim } from "../controllers/ConRewardClaim.js";
import { claimRewardSchema, updateRewardStatusQueryParams, updateRewardStatusSchema } from "../validators/RewardClaimValidator.js";
import { zodParamsMiddleware } from "../middlewares/zodParamsMiddleware.js";


export const rRewardClaim = Router()

const conRewardClaimInstance = new ConRewardClaim()

rRewardClaim.post("/claims", zodMiddleware(claimRewardSchema), conRewardClaimInstance.postRewardClaim)
rRewardClaim.patch("/:rewardId/status",zodParamsMiddleware(updateRewardStatusQueryParams), zodMiddleware(updateRewardStatusSchema), conRewardClaimInstance.patchRewardClaimStatus);
