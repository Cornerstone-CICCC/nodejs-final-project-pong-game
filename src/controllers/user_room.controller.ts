import { Request, Response } from 'express';
import { UserRoom, IUserRoom } from '../models/user_room.model';
import { Room } from '../models/room.model';
import { User } from '../models/user.model';
import mongoose from 'mongoose';

// Get all user rooms
const getAllUserRooms = async (req: Request, res: Response) => {
  try {
    const userRooms = await UserRoom.find()
      .populate('room_id')
      .populate('creator_user_id')
      .populate('opponent_user_id');

    if (!userRooms || userRooms.length === 0) {
      res.status(404).json({ message: 'No user rooms found' });
    } else {
      res.status(200).json(userRooms);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to fetch user rooms' });
  }
};

const createUserRoom = async (req: Request, res: Response) => {
  try {
    const { room_id, creator_user_id } = req.body;

    if (!room_id || !creator_user_id) {
      res
        .status(400)
        .json({ message: 'Room ID and creator user ID are required' });
    }

    const roomExists = await Room.exists({ _id: room_id });
    const creatorExists = await User.exists({ _id: creator_user_id });

    if (!roomExists) {
      res.status(404).json({ message: 'Room not found' });
    }

    if (!creatorExists) {
      res.status(404).json({ message: 'Creator user not found' });
    }

    const userRoom = await UserRoom.create({
      room_id,
      creator_user_id,
      opponent_user_id: null, // default
    });

    res.status(201).json(userRoom);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create user room' });
  }
};

// join opponent
const joinAsOpponent = async (req: Request, res: Response) => {
  try {
    const { user_room_id, opponent_user_id } = req.body;

    if (!user_room_id || !opponent_user_id) {
      res
        .status(400)
        .json({ message: 'User room ID and opponent user ID are required' });
    }

    const userRoom = await UserRoom.findOne({ _id: user_room_id });

    if (!userRoom) {
      res.status(404).json({ message: 'User room not found' });
    } else if (userRoom.opponent_user_id) {
      res.status(400).json({ message: 'This room already has an opponent' });
    } else if (userRoom.creator_user_id.toString() === opponent_user_id) {
      res.status(400).json({ message: 'Creator cannot join as opponent' });
    }

    const opponentExists = await User.exists({ _id: opponent_user_id });

    if (!opponentExists) {
      res.status(404).json({ message: 'Opponent user not found' });
    } else if (userRoom) {
      userRoom.opponent_user_id = new mongoose.Types.ObjectId(opponent_user_id);
      await userRoom.save();

      res.status(200).json(userRoom);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to join as opponent' });
  }
};

const leaveRoom = async (req: Request, res: Response) => {
  try {
    const { user_room_id, user_id } = req.body;

    const userRoom = await UserRoom.findOne({ _id: user_room_id });

    if (!userRoom) {
      res.status(404).json({ message: 'User room not found' });
    }

    // owner leave
    else if (userRoom.creator_user_id.toString() === user_id) {
      try {
        // まず room_id を取得
        const roomId = userRoom.room_id;
        // delete userroom record
        await UserRoom.deleteOne({ _id: user_room_id });
        // 関連する room レコードも削除
        await Room.deleteOne({ _id: roomId });
        res.status(200).json({
          message: 'Creator left and both room and user_room have been deleted',
        });
      } catch (deleteError) {
        console.error('Error deleting room data:', deleteError);
        res.status(500).json({
          message: 'Error occurred while deleting room data',
        });
      }

      // opponent leave
    } else if (
      userRoom.opponent_user_id &&
      userRoom.opponent_user_id.toString() === user_id
    ) {
      userRoom.opponent_user_id = null;
      await userRoom.save();
      res.status(200).json({ message: 'Opponent left room successfully' });
    } else {
      res.status(403).json({ message: 'User is not in this room' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to leave room' });
  }
};

const getUserRoomById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const userRoomId = req.params.id;

    const userRoom = await UserRoom.findOne({ _id: userRoomId })
      .populate('room_id')
      .populate('creator_user_id')
      .populate('opponent_user_id');

    if (!userRoom) {
      res.status(404).json({ message: 'User room not found' });
    }

    res.status(200).json(userRoom);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to get user room' });
  }
};

const getUserRoomsByUserId = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const userId = req.params.id;

    const userRooms = await UserRoom.find({
      $or: [{ creator_user_id: userId }, { opponent_user_id: userId }],
    })
      .populate('room_id')
      .populate('creator_user_id')
      .populate('opponent_user_id');

    if (!userRooms || userRooms.length === 0) {
      res.status(404).json({ message: 'No user rooms found for this user' });
    }

    res.status(200).json(userRooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to get user rooms' });
  }
};

export default {
  getAllUserRooms,
  createUserRoom,
  joinAsOpponent,
  leaveRoom,
  getUserRoomById,
  getUserRoomsByUserId,
};
