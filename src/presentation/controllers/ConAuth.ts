import { CreateFamilyAndParent } from "../../application/use-cases/URegParentFamily.js"
import { LoginParent } from "../../application/use-cases/ULoginParent.js"
import { LoginChild } from "../../application/use-cases/ULoginChild.js"
import { parentForgotPasswd } from "../../application/use-cases/UParentForgotPasswd.js"
import { logoutSession, refreshSession } from "../../application/use-cases/USession.js"
import {Response, Request} from "express"

// Los errores se lanzan como AppError desde los use cases y los responde errorHandler
export class ConAuth{
    constructor(){
        return this
    }

    public static async RegFamAndUser(req:Request,res:Response){
        const useCaseResponse = await CreateFamilyAndParent(req.body.familyName, req.body.parentEmail, req.body.password, req.body.alias, req.body.avatar_icon, req.body.timezone)
        return res.status(201).json({message: "Usuario y familia creados correctamente", data: useCaseResponse})
    }


    // Un identificador con "@" es el email de un padre; si no, es el alias de un niño
    public static async LoginUser(req: Request, res:Response){
        const { identifier, secret } = req.body
        const useCaseResponse = identifier.includes("@")
            ? await LoginParent(identifier, secret)
            : await LoginChild(identifier, secret)
        return res.status(200).json({message: "Sesión iniciada correctamente", data: useCaseResponse})
    }


    // Público. Siempre responde 200 con el mismo mensaje para no revelar qué emails existen
    public static async parentForgotPassword(req: Request, res: Response){
        await parentForgotPasswd.forgotPassword(req.body.email)
        return res.status(200).json({ message: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
    }


    // Público. El refresh token es la credencial: devuelve un par nuevo (rotación)
    public static async RefreshSession(req: Request, res: Response) {
        const useCaseResponse = await refreshSession(req.body.refreshToken)
        return res.status(200).json({message: "Sesión renovada", data: useCaseResponse})
    }


    // Público e idempotente: revoca el refresh token recibido
    public static async Logout(req: Request, res: Response) {
        await logoutSession(req.body.refreshToken)
        return res.status(204).send()
    }


    // Público. La autorización la da el token de recuperación enviado por correo
    public static async parentResetPassword(req: Request, res: Response) {
        await parentForgotPasswd.resetPassword(req.body.token, req.body.newPassword);
        return res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
    }
}
