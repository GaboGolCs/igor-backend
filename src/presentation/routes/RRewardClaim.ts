import { Router } from "express";
import { zodMiddleware } from "../middlewares/zodMiddleware.js";
import { ConRewardClaim } from "../controllers/ConRewardClaim.js";
import { claimRewardSchema, updateRewardStatusQueryParams, updateRewardStatusSchema } from "../validators/RewardClaimValidator.js";
import { zodParamsMiddleware } from "../middlewares/zodParamsMiddleware.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";


export const rRewardClaim = Router()

const conRewardClaimInstance = new ConRewardClaim()

rRewardClaim.post("/claims", requireAuth, requireRole("CHILD"), zodMiddleware(claimRewardSchema), conRewardClaimInstance.postRewardClaim)
rRewardClaim.patch("/:rewardId/status", requireAuth, requireRole("PARENT"), zodParamsMiddleware(updateRewardStatusQueryParams), zodMiddleware(updateRewardStatusSchema), conRewardClaimInstance.patchRewardClaimStatus);
