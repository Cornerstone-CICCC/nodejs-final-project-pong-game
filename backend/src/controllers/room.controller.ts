import { Request, Response } from 'express';
import { Room, IRoom } from '../models/room.model';
import { UserRoom } from '../models/user_room.model';

import { error } from 'console';

// Get all rooms
const getAllRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'unable' });
  }
};

// Get room by id
const getRoomById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      res.status(404).json({ message: 'No room found for this user' });
      return;
    }

    res.status(200).json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to get room' });
  }
};

// Create new room
const createRoom = async (req: Request, res: Response) => {
  try {
    const { room_name, creator_user_id } = req.body;

    if (!room_name || !creator_user_id) {
      res
        .status(400)
        .json({ message: 'Room name and creator user ID are required' });
    }

    const room = await Room.create({
      room_name,
    });

    let userRoom;
    try {
      userRoom = await UserRoom.create({
        room_id: room._id,
        creator_user_id,
        opponent_user_id: null,
      });
    } catch (userRoomError) {
      await Room.findByIdAndDelete(room._id);
      throw userRoomError;
    }

    res.status(201).json({
      room,
      userRoom,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create room' });
  }
};

//Update room by id
const updateRoomById = async (
  req: Request<{ id: string }, {}, Partial<IRoom>>,
  res: Response
) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //return update data
    });
    res.status(200).json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to update room' });
  }
};

//Delete room by id
const deleteRoomById = async (
  req: Request<{ id: string }, {}, Partial<IRoom>>,
  res: Response
) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    res.status(200).json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to delete room' });
  }
};

export default {
  createRoom,
  getRoomById,
  getAllRooms,
  updateRoomById,
  deleteRoomById,
};
