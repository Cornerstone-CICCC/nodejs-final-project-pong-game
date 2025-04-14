import { Request, Response, NextFunction } from "express"

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.session || !req.session.isLoggedIn) {
        res.status(401).json({ message: "You have to login to access this page!" })
        return
    }
    next()
}