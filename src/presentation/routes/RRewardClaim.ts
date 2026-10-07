import { Router } from "express";
import { ConReminder } from "../controllers/ConReminder.js";
import { zodMiddleware } from "../middlewares/zodMiddleware.js";
import { postReminderValidator } from "../validators/reminderValidators.js";
import { ConRewardClaim } from "../controllers/ConRewardClaim.js";
import { claimRewardSchema } from "../validators/RewardClaimValidator.js";


export const rRewardClaim = Router()

const conRewardClaimInstance = new ConRewardClaim()

rRewardClaim.post("/", zodMiddleware(claimRewardSchema), conRewardClaimInstance.postRewardClaim)
