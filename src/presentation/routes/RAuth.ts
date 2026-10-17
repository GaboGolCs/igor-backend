import express from "express"
import { ConAuth } from "../controllers/ConAuth.js"
import { zodMiddleware } from "../middlewares/zodMiddleware.js"
import{RegFamilyParent, LoginUser, ForgotPasswd,ResetPasswd, RefreshTokenBody} from "../validators/authValidators.js"
import { authRateLimit, refreshRateLimit } from "../middlewares/rateLimit.js"

export const rAuthInstance= express.Router()

// Rutas públicas. login / forgot / reset y refresh tienen rate limit por IP (contadores en Redis)
rAuthInstance.post("/register-parent" , zodMiddleware(RegFamilyParent), ConAuth.RegFamAndUser)
rAuthInstance.post("/login", authRateLimit, zodMiddleware(LoginUser), ConAuth.LoginUser)
rAuthInstance.post('/forgot-password', authRateLimit, zodMiddleware(ForgotPasswd), ConAuth.parentForgotPassword)
rAuthInstance.post('/reset-password', authRateLimit, zodMiddleware(ResetPasswd), ConAuth.parentResetPassword)
rAuthInstance.post("/refresh", refreshRateLimit, zodMiddleware(RefreshTokenBody), ConAuth.RefreshSession)
rAuthInstance.post('/logout', zodMiddleware(RefreshTokenBody), ConAuth.Logout)
