import express from "express"
import { ConAuth } from "../controllers/ConAuth.js"
import { zodMiddleware } from "../middlewares/zodMiddleware.js"
import{RegFamilyParent, LoginUser} from "../validators/authValidators.js"
export const rAuthInstance= express.Router()

rAuthInstance.post("/register-parent" , zodMiddleware(RegFamilyParent) ,ConAuth.RegFamAndUser)
rAuthInstance.post("/login", zodMiddleware(LoginUser), ConAuth.LoginUser)

