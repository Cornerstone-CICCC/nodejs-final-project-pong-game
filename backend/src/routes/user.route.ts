import { Router } from 'express';
import userController from '../controllers/user.controller';

const publicRouter = Router();
const protectedRouter = Router();

// Public routes
publicRouter.post('/login', userController.loginUser);
publicRouter.post('/register', userController.createUser);
publicRouter.get('/check-session', userController.checkCookieSession);
publicRouter.post('/logout', userController.logoutUser);

// need to be protected
protectedRouter.get('/:id', userController.getUserById);
protectedRouter.put('/:id', userController.updateUserById);
protectedRouter.put('/status/:id', userController.updateUserStatusById);
protectedRouter.delete('/:id', userController.deleteUserById);

export { publicRouter, protectedRouter };
