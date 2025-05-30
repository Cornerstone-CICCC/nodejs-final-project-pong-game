import { Router } from 'express';
import userRoomController from '../controllers/user_room.controller';

const userRoomRouter = Router();

userRoomRouter.get('/', userRoomController.getAllUserRooms);
userRoomRouter.post('/', userRoomController.createUserRoom);
userRoomRouter.post('/join', userRoomController.joinAsOpponent);
userRoomRouter.post('/leave', userRoomController.leaveRoom);
userRoomRouter.get('/:id', userRoomController.getUserRoomById);
userRoomRouter.put('/:id', userRoomController.updateUserRoomByRoomId);
userRoomRouter.get('/user/:id', userRoomController.getUserRoomsByUserId);
userRoomRouter.get(
  '/room/:id',
  userRoomController.getUserRoomInfoWithCreatorInfoByRoomId
);

export default userRoomRouter;
