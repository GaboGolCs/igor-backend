import express from "express"
import { ConAuth } from "../controllers/ConAuth.js"
import { zodMiddleware } from "../middlewares/zodMiddleware.js"
import{RegFamilyParent, LoginUser, ForgotPasswd,ResetPasswd} from "../validators/authValidators.js"
import { midIANAVerifier } from "../middlewares/IANAValidator.js"

export const rAuthInstance= express.Router()

rAuthInstance.post("/register-parent" , zodMiddleware(RegFamilyParent), midIANAVerifier,  ConAuth.RegFamAndUser)
rAuthInstance.post("/login", zodMiddleware(LoginUser), ConAuth.LoginUser)
rAuthInstance.post('/forgot-password', zodMiddleware(ForgotPasswd), ConAuth.parentForgotPassword)
rAuthInstance.post('/reset-password', zodMiddleware(ResetPasswd), ConAuth.parentResetPassword)

