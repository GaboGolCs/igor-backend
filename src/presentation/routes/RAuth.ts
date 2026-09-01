import express from "express"
import { ConAuth } from "../controllers/ConAuth.js"
import { zodMiddleware } from "../middlewares/zodMiddleware.js"
export const rAuthInstance= express.Router()

rAuthInstance.post("/register" , zodMiddleware ,ConAuth.RegFamAndUser)
rAuthInstance.post("login", zodMiddleware, ConAuth.LoginUser)