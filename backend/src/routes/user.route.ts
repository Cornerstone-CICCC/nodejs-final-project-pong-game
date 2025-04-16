import { Router } from 'express';
import userController from '../controllers/user.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const userRouter = Router();

userRouter.get('/getAll', userController.getAllUsers);
userRouter.post('/login', userController.loginUser);
userRouter.get('/logout', userController.logoutUser);
userRouter.post('/register', userController.createUser);
userRouter.get('/check-auth', userController.checkCookie);
userRouter.delete('/:id', userController.deleteUserById);
userRouter.get('/:id', userController.getUserById);
userRouter.put('/:id', requireAuth, userController.updateUserById);
userRouter.put('/status/:id', userController.updateUserStatusById);

export default userRouter;
