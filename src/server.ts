import express, { Request, Response } from "express"
import dotenv from "dotenv"
dotenv.config()
import mongoose from "mongoose"
import cookieSession from "cookie-session"
import userRouter from "./routes/user.route"

//Create server
const app = express()

//Middlewares
app.use(express.json())
const SIGN_KEY = process.env.COOKIE_SIGN_KEY
const ENCRYPT_KEY = process.env.COOKIE_ENCRYPT_KEY
if (!SIGN_KEY || !ENCRYPT_KEY) {
    throw new Error("Missing cookie keys")
}
app.use(cookieSession({
    name: "Session",
    keys: [
        SIGN_KEY,
        ENCRYPT_KEY
    ],
    maxAge: 5 * 60 * 1000
}))

//Routes
app.use('/users', userRouter)


//Fallback
app.use((req: Request, res: Response) => {
    res.status(404).send("404 server error. Page not found.")
})


//Start server
const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.DATABASE_URI!

mongoose
    .connect(MONGODB_URI, { dbName: 'pongDb' })
    .then(() => {
        console.log(`Connected to MongoDB`)
        app.listen(PORT, () => {
            console.log(`Server is running on port http://localhost:${PORT}`)
        })
    })
    .catch(err => {
        console.error(err)
        throw err
    })