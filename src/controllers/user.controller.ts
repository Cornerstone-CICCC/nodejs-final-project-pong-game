import { Request, Response } from "express";
import bcrypt from "bcrypt"
import { IUser, User } from "../models/user.model";

//get all users
const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find()
        res.status(200).json(users)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Unable to fetch all users" })
    }
}


// Get user by Id
const getUserById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) {
            res.status(404).json({ message: "user not found!" })
            return
        }
        res.status(200).json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Unable to find user." })
    }
}

//get User By Username   
const getUsersByUsername = async (req: Request<{}, {}, {}, { username: string }>, res: Response) => {
    try {
        const { username } = req.query
        const users = await User.find({
            username: {
                $regex: username,
                $options: 'i'
            }
        })
        res.status(200).json(users)
    } catch (err) {
        console.error(err)
        res.status(500).send({ message: "Unable to find User with searched username." })
    }
}

//Delete user By Id
const deleteUserById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)
        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Unable to delete user" })
    }
}

//Create new User
const createUser = async (req: Request<{}, {}, IUser>, res: Response) => {
    try {
        const { username, password, message } = req.body
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = await User.create({ username, password: hashedPassword, message })
        res.status(201).json(user)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Unable to create user." })
    }
}

//Login user
const loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body

    if (!username || !password) {
        res.status(400).send('Username/password missing!')
        return
    }
    try {
        const user = await User.findOne({ username })
        if (!user) {
            res.status(401).json({ message: "Username/password incorrect" })
            return
        }

        const isValid: boolean = await bcrypt.compare(password, user.password)
        if (!isValid) {
            res.status(401).json({ message: "Username/password incorrect" })
            return
        }

        if (!req.session) {
            res.status(500).json({ message: "Session not initialized" })
            return
        }

        if (isValid === true) {

            req.session.user = {
                username: user.username
            }
        }


        res.status(200).json({ message: "User logged in" })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Login error" })
    }
}

const logoutUser = (req: Request, res: Response) => {
    req.session = null
    res.status(200).json({ message: "User logged out!" })
}

//Updates user by id
const updateUserById = async (req: Request<{ id: string }, {}, Partial<IUser>>, res: Response) => {
    try {
        const { username, password, message } = req.body

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 12)
            const updateUser = {
                username: username,
                password: hashedPassword,
                message: message
            }
            const user = await User.findByIdAndUpdate(req.params.id, updateUser, {
                new: true
            })
            res.status(200).json(user)

        }
        // const hashedPassword = await bcrypt.hash(password, 12)
        const updateUser = {
            username: username,
            message: message
        }
        const user = await User.findByIdAndUpdate(req.params.id, updateUser, {
            new: true
        })
        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Unable to  update user" })
    }
}

export default {
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    getUsersByUsername,
    loginUser,
    logoutUser
}