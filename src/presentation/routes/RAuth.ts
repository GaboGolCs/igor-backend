import express from "express"
import { ConAuth } from "../controllers/ConAuth.js"
import { zodMiddleware } from "../middlewares/zodMiddleware.js"
export const rAuthInstance= express.Router()

rAuthInstance.post("/" , zodMiddleware ,ConAuth.RegFamAndUser)