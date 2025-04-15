import mongoose, { Schema, Document } from 'mongoose';
export interface IRoom extends Document {
  room_name: string;
}

const RoomSchema: Schema = new Schema({
  room_name: { type: String, required: true },
});

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
