import { Router } from 'express'
import userController from '../controllers/user.controller'
import { requireAuth } from '../middlewares/auth.middleware'

const userRouter = Router()

userRouter.get('/', userController.getAllUsers)
userRouter.get('/check-auth', requireAuth)
userRouter.post('/login', userController.loginUser)
userRouter.get('/logout', userController.logoutUser)
userRouter.post('/', userController.createUser)
userRouter.get('/search', userController.getUsersByUsername)
userRouter.delete('/:id', userController.deleteUserById)
userRouter.get('/:id', userController.getUserById)
userRouter.put('/:id', userController.updateUserById)

export default userRouter