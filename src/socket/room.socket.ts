import { Server, Socket } from 'socket.io';

const roomsSocket = (io: Server) => {
 io.on('connection', (socket: Socket) => {

    // Create room emit
    socket.on('create', (data) => {
      const { room_name } = data;
      io.emit('create', { room_name }); //emit event create room
      socket.broadcast.emit('join room', { room_name }); //emit enter right after create

    });

    //join room
    socket.on('join room', (room: string) => {
      socket.broadcast.emit('join room', { room }); //emit join room
    });

    // leave room
    socket.on('leave room', (room: string) => {
      socket.broadcast.emit('leave room', { room }); //emit event leave room
    });

  });
};

export default roomsSocket;
