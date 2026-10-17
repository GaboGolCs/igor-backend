import {Request, Response} from "express"
import { UPostReminder } from "../../application/use-cases/UPostReminder.js"
import { UGetReminders } from "../../application/use-cases/UGetReminders.js"
import { UPatchReminder } from "../../application/use-cases/UPatchReminder.js"
import { UDeleteReminder } from "../../application/use-cases/UDeleteReminder.js"
export class ConReminder{
    constructor(){
        return this
    }

    public async postReminder(req: Request, res: Response){
        const body = req.body
        const savedReminder = await UPostReminder(body.title, body.childId, body.recurrenceTime, res.locals.user.id)
        return res.status(201).json(savedReminder)
    }

    public async getReminders(_req: Request, res: Response){
        const reminders = await UGetReminders(res.locals.user.id, res.locals.query.childId)
        return res.status(200).json(reminders)
    }

    public async patchReminder(req: Request, res: Response){
        const updatedReminder = await UPatchReminder(req.params.reminderId as string, res.locals.user.id, req.body)
        return res.status(200).json(updatedReminder)
    }

    public async deleteReminder(req: Request, res: Response){
        await UDeleteReminder(req.params.reminderId as string, res.locals.user.id)
        return res.status(204).send()
    }
}
