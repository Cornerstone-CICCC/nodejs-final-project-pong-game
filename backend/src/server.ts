import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';
import cookieParser from 'cookie-parser';
import historyRouter from './routes/history.routes';
import { createServer } from 'http';
import { Server } from 'socket.io';
import roomsSocket from './socket/room.socket';
import roomRouter from './routes/room.routes';
import userRoomRouter from './routes/user_room.routes';
import { protectedRouter, publicRouter } from './routes/user.route';
import { requireAuth } from './middlewares/auth.middleware';
dotenv.config();

//Create server
const app = express();

//Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // allow cookies
  })
);
app.use(express.json());

//Cookie
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
    maxAge: 15 * 24 * 60 * 60 * 1000,
  })
);

//Routes
// no use auth route
app.use('/api/users', publicRouter);
// use auth route
app.use('/api/users', requireAuth, protectedRouter);
app.use('/api/histories', requireAuth, historyRouter);
app.use('/api/rooms', requireAuth, roomRouter);
app.use('/api/userrooms', requireAuth, userRoomRouter);

//Fallback
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: '404 Not Found', message: 'Page not found.' });
});

//Create server and link with Socket.IO
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
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
    const PORT = process.env.PORT || 3500;
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });
