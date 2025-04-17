import { Server, Socket } from 'socket.io';

interface Player {
    id: string;
    side: Side;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
}

interface Ball {
    x: number;
    y: number;
    dx: number;
    dy: number;
}

interface Scores {
    left: number;
    right: number;
}

interface RenderConst {
    width: number;
    height: number;
    rocketLength: number;
}

type Side = 'left' | 'right'
type Version = 'desktop' | 'taplet' | 'mobile'

const gameSocket = (io: Server) => {
    const FRAME_RATE = 60;
    const rooms: Record<string, {players: Record<string, Player>, ball: Ball, scores: Scores}> = {};
    const playerRoomMap: Record<string, string> = {}; // socket.id -> roomId
    const intervalMap: Record<string, NodeJS.Timeout> = {}
    const gameScreenSizes: Record<Version, RenderConst> = {
        desktop: {
            width: 800,
            height: 600,
            rocketLength: 100
        },
        taplet: {
            width: 640,
            height: 480,
            rocketLength: 100
        },
        mobile: {
            width: 480,
            height: 240,
            rocketLength: 50
        }
    }
    let gameScreenSize: RenderConst;

    // init player
function createPlayer(id: string, side: Side): Player {
    return { 
        id, 
        side, 
        x: side === 'left' ? 50 : (gameScreenSize.width - 50), 
        y: (gameScreenSize.height - gameScreenSize.rocketLength) / 2, 
        width: 10, 
        height: gameScreenSize.rocketLength, 
        speed: 10, 
    };
}

function handleGetScore(roomId: string, side: Side, scores: Scores) {
    scores[side] += 1;

    if (scores[side] >= 7) {
        handleGameOver(roomId, scores)
    } else {
        resetBall(roomId);
    }

    io.to(roomId).emit('current-score', scores)
}

function handleGameOver(roomId: string, scores: Scores) {
    const winner = scores.left > scores.right ? 'left' : 'right';
    io.to(roomId).emit('game-over', {winner})
    scores.left = 0;
    scores.right = 0;
}

function resetBall(roomId: string) {
    const ball = rooms[roomId].ball;

    ball.x = gameScreenSize.width / 2;
    ball.y = gameScreenSize.height / 2;
    ball.dx = Math.random() > 0.5 ? 5 : -5;
    ball.dy = Math.random() > 0.5 ? 5 : -5;
}

function gameLoop(roomId: string) {
    const {players, ball, scores} = rooms[roomId]

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Boundary bounce (top and bottom)
    if (ball.y <= 0 || ball.y >= gameScreenSize.height) ball.dy = -ball.dy;

    // Racket collision
    Object.values(players).forEach(player => {
        if (
            ball.x >= player.x &&
            ball.x <= player.x + player.width &&
            ball.y >= player.y &&
            ball.y <= player.y + player.height
        ) {
            ball.dx = -ball.dx;
        }
    });

    // Out of Bounds Reset Ball
    if (ball.x <= 0) {
        handleGetScore(roomId, 'right', scores)
    }

    if (ball.x >= gameScreenSize.width) {
        handleGetScore(roomId, 'left', scores)
    }

    io.to(roomId).emit('game-state', { players, ball });
}

io.on('connection', (socket: Socket) => {
    console.log(`player connect: ${socket.id}`);

    socket.on('check-room-is-full', (roomId) => {
        console.log(rooms, roomId, roomId in rooms)

        if (! (roomId in rooms)) {
            socket.emit('check-room-result', {isFull: false})

            return
        }

        if (Object.keys(rooms[roomId]?.players).length >= 2) {
            socket.emit('check-room-result', {isFull: true})
        } else {
            socket.emit('check-room-result', {isFull: false})
        }
    });

    socket.on('version', (roomId: string, data: {device: Version}) => {
        gameScreenSize = gameScreenSizes[data.device]
        io.to(roomId).emit('render', gameScreenSize)
    })

    socket.on('join-room', (roomId) => {
        const roomBall: Ball = { x: gameScreenSize.width / 2, y: gameScreenSize.height / 2, dx: 5, dy: 5 };
        const roomScores: Scores = {left: 0, right: 0}
        const roomPlayers = rooms[roomId]?.players ?? {};

        playerRoomMap[socket.id] = roomId;
        rooms[roomId] = {players: roomPlayers, ball: roomBall, scores: roomScores};

        socket.join(roomId);
        
        const side: Side = Object.keys(rooms[roomId].players).length === 0 ? 'left' : 'right';
        rooms[roomId].players[socket.id] = createPlayer(socket.id, side);

        // init gameState
        io.to(roomId).emit('game-state', rooms[roomId]);
    })

    // Players drag to move the racket
    socket.on('move-to', (roomId: string, mouseY: number) => {
        const player = rooms[roomId].players[socket.id];
        if (!player) return;
        player.y = Math.max(0, Math.min(gameScreenSize.height - player.height, mouseY - player.height / 2));
    });

    socket.on('game-start', (roomId: string) => {
        intervalMap[roomId] = setInterval(() => gameLoop(roomId), 1000 / FRAME_RATE);
        io.to(roomId).emit('game-is-start');
    })
    
    socket.on('game-reset', (roomId: string) => {
        clearInterval(intervalMap[roomId]);
        resetBall(roomId);

        io.to(roomId).emit('game-state', { 
            players: rooms[roomId].players, 
            ball: rooms[roomId].ball
        });
    })

    socket.on('player-ready', (roomId: string, data: {side: Side}) => {
        io.to(roomId).emit('player-is-ready', data)
    })

    socket.on('disconnect', () => {
        console.log(`player disconnect: ${socket.id}`);

        const roomId = playerRoomMap[socket.id];

        if (roomId) {
            socket.leave(roomId);

            if (rooms[roomId].players[socket.id].side === 'left') {
                socket.to(roomId).emit('room-owner-leave')
            }

            delete rooms[roomId].players[socket.id];

            Object.values(rooms[roomId].players).map(player => {
                rooms[roomId].players[player.id] = createPlayer(player.id, 'left')
            })
    
            io.to(roomId).emit('game-state', { 
                players: rooms[roomId].players, 
                ball: rooms[roomId].ball 
            });

            socket.to(roomId).emit('player-leaving')
    
            if (Object.keys(rooms[roomId].players).length === 0) {
                delete rooms[roomId]
            }

            delete playerRoomMap[socket.id];

            socket.emit('refresh')
        }
    });
});
};

export default gameSocket;