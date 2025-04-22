import mongoose, { Schema, Document } from 'mongoose';

export interface IUserRoom extends Document {
  room_id: mongoose.Types.ObjectId; // FK - rooms
  creator_user_id: mongoose.Types.ObjectId; // FK - users
  opponent_user_id: mongoose.Types.ObjectId | null; // FK - users (opponent or null)
}

const UserRoomSchema: Schema = new Schema({
  room_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  creator_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  opponent_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
});
UserRoomSchema.index(
  { room_id: 1, creator_user_id: 1, opponent_user_id: 1 },
  { unique: true }
);

export const UserRoom = mongoose.model<IUserRoom>('UserRoom', UserRoomSchema);
