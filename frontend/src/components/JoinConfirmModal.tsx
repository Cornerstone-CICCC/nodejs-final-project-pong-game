import React, { useEffect, useState } from 'react';
import UserProfile from './Profile';
import { userRoomType, userType } from '../lib/type';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

interface JoinConfirmModalProps {
  currentUserId: string;
  selectedRoomId: string;
  onSaveProfile: (data: { username: string; message: string }) => void;
  onClose: () => void;
}

const JoinConfirmModal: React.FC<JoinConfirmModalProps> = ({
  currentUserId,
  selectedRoomId,
  onClose,
  onSaveProfile,
}) => {
  const navigate = useNavigate();
  const socket = io(import.meta.env.VITE_BACKEND_URL);
  const [creatorUser, setCreatorUser] = useState<userType | null>(null);
  const [selectedUserRoomId, setSelectedUserRoomId] = useState<string>('');

  useEffect(() => {
    const fetchCreatorInfo = async () => {
      try {
        console.log('Fetching creator info for room ID:', selectedRoomId);

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/userrooms/room/${selectedRoomId}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!response.ok) {
          console.error('Error fetching room creator info:');
          throw new Error('Failed to fetch room creator info');
        }

        const data: userRoomType = await response.json();
        const { creator_user_id: creator } = data;

        if (!data) {
          console.error('Creator user ID not found in response:', data);
          throw new Error('Creator user ID not found in response');
        }

        setCreatorUser(creator);
        setSelectedUserRoomId(data._id);
      } catch (error) {
        console.error('Error fetching room creator info:', error);
      }
    };

    fetchCreatorInfo();
  }, []);

  const handleJoinRoom = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/userrooms/${selectedRoomId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            opponent_user_id: currentUserId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update opponent_user_id');
      }

      const updatedRoom = await response.json();
      console.log('Updated room:', updatedRoom);

      // socket.emit('join-room', selectedUserRoomId);

      navigate(`/room/${selectedUserRoomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/50 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl mx-4">
        <div className="flex">
          <div className="w-2/3 p-6 border-r">
            {creatorUser ? (
              <UserProfile
                user={creatorUser}
                currentUserId={currentUserId}
                onSaveProfile={onSaveProfile}
              />
            ) : (
              <div>Loading user profile...</div>
            )}
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
