import mongoose, { Schema, Document } from "mongoose";
export interface IHistory extends Document {
  user_id: string;
  opponent_user_id: string;
  own_score: Number;
  opponent_score: Number;
  date: Date;
}

const HistorySchema: Schema = new Schema({
  user_id: { type: String, required: true },
  opponent_user_id: { type: String, required: true },
  own_score: { type: Number, required: true },
  opponent_score: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export const History = mongoose.model<IHistory>("History", HistorySchema);
