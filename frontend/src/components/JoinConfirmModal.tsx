import React from 'react';
import UserProfile from './Profile';
import useWebSocket from '../lib/useWebSocket';

interface JoinConfirmModalProps {
  user: {
    id: string;
    username: string;
    message: string;
  };
  currentUserId: string;
  roomName: string;
  onSaveProfile: (data: { username: string; message: string }) => void;
  onClose: () => void;
  onJoin: () => void;
}

const JoinConfirmModal: React.FC<JoinConfirmModalProps> = ({
  user,
  currentUserId,
  roomName,
  onSaveProfile,
  onClose,
  onJoin,
}) => {
  const { sendMessage } = useWebSocket('ws://localhost:8080');

  const handleJoinRoom = () => {
    // Send a WebSocket message to join the room
    sendMessage({
      event: 'join_room',
      room: roomName,
      userId: currentUserId,
    });

    // Call the parent onJoin handler
    onJoin();

    // navigate(`/game/${roomId}`);
  };
  return (
    <div className="fixed inset-0 bg-gray-500/50 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl mx-4">
        <div className="flex">
          <div className="w-2/3 p-6 border-r">
            <UserProfile
              user={user}
              currentUserId={currentUserId}
              onSaveProfile={onSaveProfile}
            />
          </div>

          <div className="w-1/3 p-6 flex flex-col justify-between">
            <h2 className="text-xl font-bold mb-4">Join Room</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to join this room?
            </p>
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleJoinRoom}
                className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-300 hover:text-black transition"
              >
                Join
              </button>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-300 hover:text-black transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinConfirmModal;
