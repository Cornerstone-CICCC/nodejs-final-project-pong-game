import React from 'react';

interface JoinRoomCardProps {
  roomName: string;
  participants: number;
  onJoin: () => void;
}

const JoinRoomCard: React.FC<JoinRoomCardProps> = ({
  roomName,
  participants,
  onJoin,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-md rounded-lg border border-gray-200">
      {/* Room Name */}
      <div className="text-lg font-semibold text-gray-800">{roomName}</div>

      {/* Join Button */}
      <button
        onClick={onJoin}
        disabled={participants === 2}
        className="px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-600 transition"
      >
        {participants === 2 ? 'Room Full' : 'Join Room'}
      </button>
    </div>
  );
};

export default JoinRoomCard;
