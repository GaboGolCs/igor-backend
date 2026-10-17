import express from "express"
import { ConAuth } from "../controllers/ConAuth.js"
import { zodMiddleware } from "../middlewares/zodMiddleware.js"
import{RegFamilyParent, LoginUser, ForgotPasswd,ResetPasswd} from "../validators/authValidators.js"
import { authRateLimit } from "../middlewares/rateLimit.js"

export const rAuthInstance= express.Router()

// Rutas públicas. login / forgot / reset tienen rate limit por IP
rAuthInstance.post("/register-parent" , zodMiddleware(RegFamilyParent), ConAuth.RegFamAndUser)
rAuthInstance.post("/login", authRateLimit, zodMiddleware(LoginUser), ConAuth.LoginUser)
rAuthInstance.post('/forgot-password', authRateLimit, zodMiddleware(ForgotPasswd), ConAuth.parentForgotPassword)
rAuthInstance.post('/reset-password', authRateLimit, zodMiddleware(ResetPasswd), ConAuth.parentResetPassword)
