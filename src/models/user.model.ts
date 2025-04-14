import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
    username: string,
    password: string,
    message: string,
    win: number,
    lose: number,
    scores: number
}

const userSchema: Schema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    message: { type: String, required: true },
    win: { type: Number, required: false },
    lose: { type: Number, required: false },
    scores: { type: Number, required: false }
})

export const User = mongoose.model<IUser>('User', userSchema)