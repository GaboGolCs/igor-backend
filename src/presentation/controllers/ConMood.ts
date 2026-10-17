import { Request, Response } from "express"
import { getMonthlyAnalitics } from "../../application/use-cases/UGetMonthlyAnalitics.js"
import { registerMoodUC } from "../../application/use-cases/URegisterMood.js"
export class ConMood{

    constructor(){
        return this
    }

    public async getMonthlyAnalitics(req: Request, res: Response){
        const { childId, month, year } = res.locals.query
        const childAnalitics = await getMonthlyAnalitics(res.locals.user.id, childId, month, year)
        return res.status(200).json(childAnalitics)
    }

    public async registerMood(req: Request, res: Response){
        await registerMoodUC(req.body.emotion, req.body.activityText, req.body.needText, res.locals.user.id)
        return res.status(201).json({message: "Mood creado con éxito"})
    }
}
