import { Router } from 'express';
import roomController from '../controllers/room.controller';

const roomRouter = Router();
roomRouter.get('/', roomController.getAllRooms);
roomRouter.get('/:id', roomController.getRoomById);
roomRouter.post('/', roomController.createRoom); //create recode of room and user_room automatically
roomRouter.put('/:id', roomController.updateRoomById);
roomRouter.delete('/:id', roomController.deleteRoomById);

export default roomRouter;
