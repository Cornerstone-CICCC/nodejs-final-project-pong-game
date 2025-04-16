import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.route';
import historyRouter from './routes/history.routes';
import { createServer } from 'http';
import { Server } from 'socket.io';
import roomsSocket from './socket/room.socket';
import roomRouter from './routes/room.routes';

//Create server
const app = express();

//Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_PARSER_KEY));
const SIGN_KEY = process.env.COOKIE_SIGN_KEY;
const ENCRYPT_KEY = process.env.COOKIE_ENCRYPT_KEY;
if (!SIGN_KEY || !ENCRYPT_KEY) {
  throw new Error('Missing cookie keys');
}
app.use(
  cookieSession({
    name: 'Session',
    keys: [SIGN_KEY, ENCRYPT_KEY],
    maxAge: 15 * 24 * 60 * 1000,
  })
);

//Routes
app.use('/api/users', userRouter);
app.use('/api/histories', historyRouter);
app.use('/api/rooms', roomRouter);

//Fallback
app.use((req: Request, res: Response) => {
  res.status(404).send('404 server error. Page not found.');
});

//Create server and link with Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http:localhost:5173',
    methods: ['GET', 'POST'],
  },
});
//Connect to MongoDb
const MONGODB_URI = process.env.DATABASE_URI!;
mongoose
  .connect(MONGODB_URI, { dbName: 'pong_game' })
  .then(() => {
    console.log('Connected to MongoDB database');

    //Start socket
    roomsSocket(io);

    //Start server
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });
