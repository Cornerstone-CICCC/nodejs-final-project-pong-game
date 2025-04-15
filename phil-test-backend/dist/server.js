"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: '*' } });
const FRAME_RATE = 60;
const rooms = {};
const playerRoomMap = {}; // socket.id -> roomId
const intervalMap = {};
const gameScreenSizes = {
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
};
let gameScreenSize;
// init player
function createPlayer(id, side) {
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
function handleGetScore(roomId, side, scores) {
    scores[side] += 1;
    if (scores[side] >= 7) {
        handleGameOver(roomId, scores);
    }
    else {
        resetBall(roomId);
    }
    io.to(roomId).emit('current-score', scores);
}
function handleGameOver(roomId, scores) {
    const winner = scores.left > scores.right ? 'left' : 'right';
    io.to(roomId).emit('game-over', { winner });
    scores.left = 0;
    scores.right = 0;
}
function resetBall(roomId) {
    const ball = rooms[roomId].ball;
    ball.x = gameScreenSize.width / 2;
    ball.y = gameScreenSize.height / 2;
    ball.dx = Math.random() > 0.5 ? 5 : -5;
    ball.dy = Math.random() > 0.5 ? 5 : -5;
}
function gameLoop(roomId) {
    const { players, ball, scores } = rooms[roomId];
    ball.x += ball.dx;
    ball.y += ball.dy;
    // Boundary bounce (top and bottom)
    if (ball.y <= 0 || ball.y >= gameScreenSize.height)
        ball.dy = -ball.dy;
    // Racket collision
    Object.values(players).forEach(player => {
        if (ball.x >= player.x &&
            ball.x <= player.x + player.width &&
            ball.y >= player.y &&
            ball.y <= player.y + player.height) {
            ball.dx = -ball.dx;
        }
    });
    // Out of Bounds Reset Ball
    if (ball.x <= 0) {
        handleGetScore(roomId, 'right', scores);
    }
    if (ball.x >= gameScreenSize.width) {
        handleGetScore(roomId, 'left', scores);
    }
    io.to(roomId).emit('game-state', { players, ball });
}
io.on('connection', (socket) => {
    console.log(`player connect: ${socket.id}`);
    socket.on('check-room-is-full', (roomId) => {
        var _a;
        console.log(rooms, roomId, roomId in rooms);
        if (!(roomId in rooms)) {
            socket.emit('check-room-result', { isFull: false });
            return;
        }
        if (Object.keys((_a = rooms[roomId]) === null || _a === void 0 ? void 0 : _a.players).length >= 2) {
            socket.emit('check-room-result', { isFull: true });
        }
        else {
            socket.emit('check-room-result', { isFull: false });
        }
    });
    socket.on('version', (roomId, data) => {
        gameScreenSize = gameScreenSizes[data.device];
        io.to(roomId).emit('render', gameScreenSize);
    });
    socket.on('join-room', (roomId) => {
        var _a, _b;
        const roomBall = { x: gameScreenSize.width / 2, y: gameScreenSize.height / 2, dx: 5, dy: 5 };
        const roomScores = { left: 0, right: 0 };
        const roomPlayers = (_b = (_a = rooms[roomId]) === null || _a === void 0 ? void 0 : _a.players) !== null && _b !== void 0 ? _b : {};
        playerRoomMap[socket.id] = roomId;
        rooms[roomId] = { players: roomPlayers, ball: roomBall, scores: roomScores };
        socket.join(roomId);
        const side = Object.keys(rooms[roomId].players).length === 0 ? 'left' : 'right';
        rooms[roomId].players[socket.id] = createPlayer(socket.id, side);
        // init gameState
        io.to(roomId).emit('game-state', rooms[roomId]);
    });
    // Players drag to move the racket
    socket.on('move-to', (roomId, mouseY) => {
        const player = rooms[roomId].players[socket.id];
        if (!player)
            return;
        player.y = Math.max(0, Math.min(gameScreenSize.height - player.height, mouseY - player.height / 2));
    });
    socket.on('game-start', (roomId) => {
        intervalMap[roomId] = setInterval(() => gameLoop(roomId), 1000 / FRAME_RATE);
        io.to(roomId).emit('game-is-start');
    });
    socket.on('game-reset', (roomId) => {
        clearInterval(intervalMap[roomId]);
        resetBall(roomId);
        io.to(roomId).emit('game-state', {
            players: rooms[roomId].players,
            ball: rooms[roomId].ball
        });
    });
    socket.on('player-ready', (roomId, data) => {
        io.to(roomId).emit('player-is-ready', data);
    });
    socket.on('disconnect', () => {
        console.log(`player disconnect: ${socket.id}`);
        const roomId = playerRoomMap[socket.id];
        if (roomId) {
            socket.leave(roomId);
            delete rooms[roomId].players[socket.id];
            Object.values(rooms[roomId].players).map(player => {
                rooms[roomId].players[player.id] = createPlayer(player.id, 'left');
            });
            io.to(roomId).emit('game-state', {
                players: rooms[roomId].players,
                ball: rooms[roomId].ball
            });
            socket.to(roomId).emit('player-leaving');
            if (Object.keys(rooms[roomId].players).length === 0) {
                delete rooms[roomId];
            }
            delete playerRoomMap[socket.id];
        }
    });
});
server.listen(3001, () => {
    console.log('Server run on 3001');
});
