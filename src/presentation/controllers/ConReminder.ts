import {Request, Response} from "express"
import { UPostReminder } from "../../application/use-cases/UPostReminder.js"
export class ConReminder{
    constructor(){
        return this
    }

    public async postReminder(req: Request, res: Response){
        const body = req.body
        const savedReminder = await UPostReminder(body.title, body.childId, body.recurrenceTime, res.locals.user.id)
        return res.status(201).json(savedReminder)
    }
}
