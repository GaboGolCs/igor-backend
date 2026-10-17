import { Request, Response } from "express";
import { RegChild } from "../../application/use-cases/URegChild.js";
import { UChangeChildPin } from "../../application/use-cases/UChangeChildPin.js";

export class ConFamily {

    public static async RegChild(req:Request,res:Response){
        const useCaseResponse = await RegChild(req.body.alias, req.body.password, req.body.avatar_icon, res.locals.user.id);
        return res.status(201).json({message: "Usuario hijo creado correctamente", data: useCaseResponse})
    }

    public static async ChangeChildPin(req:Request,res:Response){
        await UChangeChildPin.changePin(res.locals.user.id, req.params.childId as string, req.body.newPin)
        return res.status(201).json({message: "Pin cambiado correctamente"})
    }
}
