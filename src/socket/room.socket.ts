import { Server, Socket } from "socket.io";

const roomsSocket = (io: Server) => {




    io.on('connection', (socket: Socket) => {

        //create and enter
        socket.on('create', (room) => {
            socket.join(room)
        })
        // socket.emit('create', roomName) for frontend create method

        // enter room method
        socket.on('join room', async (room) => {

            const socketsInRoom = (await io.in(room).fetchSockets()).length

            if (socketsInRoom >= 2) {
                socket.emit('roomFull', room);
            } else {
                socket.join(room)
            }
        })

        socket.on('leave room', async (room) => {
            const socketsInRoom = (await io.in(room).fetchSockets()).length

            if (socketsInRoom <= 1) {
                socket.leave(room)
                socket.emit('delete room', room)
                return
            }

            socket.leave(room)
        })




    });
};

export default roomsSocket