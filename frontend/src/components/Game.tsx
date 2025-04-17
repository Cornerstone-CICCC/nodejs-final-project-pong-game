import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

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

interface GameState {
    players: Record<string, Player>;
    ball: Ball;
}

interface Scores {
    left: number;
    right: number;
}

type Side = 'left' | 'right'

interface RenderConst {
    width: number;
    height: number;
    rocketLength: number;
}

type CurrentUserType = {
    userId: string;
    username: string;
};

const socket: Socket = io('http://localhost:3500');

function Game() {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDraggingRef = useRef<boolean>(false)
    const [width, setWidth] = useState<number>(480);
    const [height, setHeight] = useState<number>(240)

    const [gameState, setGameState] = useState<GameState>({ players: {}, ball: { x: width/2, y: height/2, dx: 5, dy: 5 } });
    const [isLeftSideReady, setIsLeftSideReady] = useState(false);
    const [isRightSideReady, setIsRightSideReady] = useState(false);
    const [leftSideScore, setLeftSideScore] = useState(0);
    const [rightSideScore, setRightSideScore] = useState(0);
    const [myPlayer, setMyPlayer] = useState<Player|undefined>();
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<CurrentUserType | null>(null);
    
    useEffect(() => {
        socket.emit('check-room-is-full', roomId)
    }, [])

    useEffect(() => {
        const fetchCurrentuserInfo = async () => {
          console.log('Fetching current user info...');
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/users/check-session`,
            {
              method: 'GET',
              credentials: 'include',
            }
          );
          if (!response.ok) {
            console.error('Error fetching current user info:');
            navigate('/login');
          }
          const data = await response.json();
          setCurrentUser(data);
        };
        fetchCurrentuserInfo();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                socket.emit('version', roomId, {device: 'desktop'})
            } else if (window.innerWidth >= 768) {
                socket.emit('version', roomId, {device: 'taplet'})
            } else {
                socket.emit('version', roomId, {device: 'mobile'})
            }
        };
      
        handleResize();
      
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [gameState]);
      
    useEffect(() => {
        draw(gameState);
    }, [width, height, gameState]);

    useEffect(() => {
        socket.emit('join-room', roomId)

        socket.on('game-state', (state: GameState) => {
            setGameState(state);
            draw(state);
            setMyPlayer(Object.values(state.players).find(player => player.id === socket.id))
        });

        socket.on('player-is-ready', (data: {side: Side}) => {
            data.side === 'left'
            ? setIsLeftSideReady(true)
            : setIsRightSideReady(true)
        })

        socket.on('current-score', (scores: Scores) => {
            setLeftSideScore(scores.left);
            setRightSideScore(scores.right);
        })

        socket.on('game-is-start', () => {
            setIsPlaying(true);
        })

        socket.on('game-over', (data) => {
            socket.emit('game-reset', roomId, {});
            alert(`winner is ${data.winner}!!`);
            setIsLeftSideReady(false)
            setIsRightSideReady(false)
            setIsPlaying(false);
        })

        socket.on('player-leaving', () => {
            setIsLeftSideReady(false)
            setIsRightSideReady(false)
        })

        socket.on('render', (data: RenderConst) => {
            setWidth(data.width)
            setHeight(data.height)
        })

        socket.on('check-room-result', (data) => {
            if (data.isFull) {
                alert('room is full');
            } 
        })

        socket.on('room-owner-leave', () => {
            alert('The room owner has left the room, you will be returned to the room list.');
            backToRoomPage()
        })

        return () => {
            socket.off('game-state');
            socket.off('player-is-ready')
            socket.off('current-score')
            socket.off('game-over')
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const startDrag = () => isDraggingRef.current = true;

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;
            const rect = canvas.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;
            socket.emit('move-to', roomId, mouseY);
        };

        const stopDragging = () => isDraggingRef.current = false;

        canvas.addEventListener('mousedown', startDrag);
        canvas.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', stopDragging);
        canvas.addEventListener('mouseleave', stopDragging);

        return () => {
            canvas.removeEventListener('mousedown', startDrag);
            canvas.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopDragging);
            canvas.removeEventListener('mouseleave', stopDragging);
        };
    }, [gameState, isDraggingRef]);

    const draw = (state: GameState) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // racket
        Object.values(state.players).forEach(player => {
            ctx.fillStyle = 'black';
            ctx.fillRect(player.x, player.y, player.width, player.height);
        });

        // ball
        const ball = state.ball;
        ctx.beginPath();
        ctx.fillStyle = 'orange';
        ctx.arc(ball.x, ball.y, 10, 0, Math.PI * 2);
        ctx.fill();
    };

    const gameStart = () => {
        socket.emit('game-start', roomId, {})
    }

    const playerReady = (side: Side) => {
        socket.emit('player-ready', roomId, {side})
    }

    const isStartable = () => {
        return isLeftSideReady && isRightSideReady && myPlayer?.side === 'left'
    }

    const backToRoomPage = async () => {
        socket.disconnect();
        await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/api/userrooms/leave`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    user_room_id: roomId, 
                    user_id: currentUser?.userId 
                }),
                credentials: 'include', // Include cookies in the request
            }
        );

        navigate('/roomlist')
    }

    const readyBtnClasses = () => {
        return 'bg-amber-500 px-4 py-1 rounded-md cursor-pointer disabled:bg-amber-300 disabled:cursor-not-allowed';
    }

    const btnAreaClasses = () => {
        const classes = ['absolute', 'bottom-0', 'flex', 'flex-col', 'justify-center', 'items-center'];
        if (isPlaying) {
            classes.push('hidden');
        } 

        return classes.join(' ');
    }

    return (
        <div className='flex flex-col justify-center items-center gap-4 h-screen bg-zinc-700'>
            {/* <h1 className='text-xl sm:text-5xl text-white'>🎮 Pong Game</h1> */}
            <div className='flex justify-center relative'>
                <h1 className='absolute top-0 left-[30%] text-2xl opacity-[50%] sm:text-9xl'>{leftSideScore}</h1>
                <canvas ref={canvasRef} width={width} height={height}/>
                <h1 className='absolute top-0 right-[30%] text-2xl opacity-[50%] sm:text-9xl'>{rightSideScore}</h1>
                <div className={btnAreaClasses()}>
                    <div className='flex justify-center gap-4 my-4'>
                        <button
                            type='button'
                            className={readyBtnClasses()}
                            onClick={() => playerReady('left')}
                            disabled={myPlayer?.side === 'right'}
                        >
                            {isLeftSideReady ? 'Left Side is Ready': 'Ready'}
                        </button>

                        <button 
                            type='button' 
                            className='bg-green-500 px-4 py-1 rounded-md cursor-pointer disabled:bg-green-300 disabled:cursor-not-allowed' 
                            onClick={gameStart}
                            disabled={! isStartable() }
                        >
                            Game Start
                        </button>
                    
                        <button
                            type='button'
                            className={readyBtnClasses()}
                            onClick={() => playerReady('right')}
                            disabled={myPlayer?.side === 'left'}
                        >
                            {isRightSideReady ? 'Right Side is Ready': 'Ready'}    
                        </button>
                    </div>
                </div>
            </div>
            <button 
                className='px-4 py-1 bg-red-500 text-white rounded-md cursor-pointer hover:bg-red-600 disabled:hover:bg-red-500 disabled:opacity-[80%] disabled:cursor-not-allowed'
                onClick={backToRoomPage}
                disabled={isPlaying}
            >
                Leave
            </button>
        </div>
    );
}

export default Game;
