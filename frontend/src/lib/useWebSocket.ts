import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const useWebSocket = () => {
  const url = import.meta.env.VITE_BACKEND_URL;
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io(url);
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('WebSocket connected');
    });

    socketInstance.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [url]);

  // reason of using any type is because the message can be any type on server side
  const sendMessage = (event: string, message: any) => {
    if (socket) {
      socket.emit(event, message);
    }
  };

  return { sendMessage, socket };
};

export default useWebSocket;
