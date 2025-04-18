import { useEffect, useState } from 'react';
import JoinRoomCard from './JoinRoomCard';
import MakeRoomModal from './MakeRoomModal';
import JoinConfirmModal from './JoinConfirmModal';
import { useNavigate } from 'react-router-dom';
import { currentUserType, roomCardType, userRoomType } from '../lib/type';
import { io } from 'socket.io-client';

export default function RoomListPage() {
  const [showMakeRoomModal, setShowMakeRoomModal] = useState(false);
  const [showJoinConfirmModal, setShowJoinConfirmModal] = useState(false);
  const [rooms, setRooms] = useState<roomCardType[]>([]);
  const [currentUser, setCurrentUser] = useState<currentUserType | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const navigate = useNavigate();
  const socket = io(import.meta.env.VITE_BACKEND_URL);

  const fetchRooms = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/userrooms/`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      if (!response.ok) {
        console.error('Error fetching rooms:');
        throw new Error('Failed to fetch rooms');
      }
      const data: userRoomType[] = await response.json();
      console.log('Fetched rooms:', data);

      const rooms: roomCardType[] = [];

      data.map((userRoom: userRoomType) => {
        const room = {
          _id: userRoom.room_id._id,
          room_name: userRoom.room_id.room_name,
          participants: 1,
        };

        rooms.push(room);
      });

      // setUserRooms(data);
      setRooms(rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

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
    const handleRefresh = () => {
      console.log('Refresh event received');
      fetchRooms();
    };

    socket.on('refresh', handleRefresh);

    return () => {
      socket.off('refresh', handleRefresh);
    };
  }, [socket]);

  const logout = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/logout`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to logout');
      }

      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold">Created Rooms</h1>
        <button
          onClick={() => setShowMakeRoomModal(true)}
          className="border border-black px-4 py-2 rounded hover:bg-gray-100"
        >
          Make a new room
        </button>
        <button
          onClick={logout}
          className="border border-black px-4 py-2 rounded hover:bg-gray-100"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rooms && rooms.length > 0 ? (
          rooms.map(room => (
            <div key={room._id} className="mb-4">
              <JoinRoomCard
                roomId={room._id}
                roomName={room.room_name}
                participants={room.participants}
                onJoin={() => {
                  setShowJoinConfirmModal(true);
                  setSelectedRoomId(room._id);
                }}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500">No rooms available</p>
        )}
      </div>

      {/* MakeRoomModal */}
      {showMakeRoomModal && (
        <MakeRoomModal
          onClose={() => setShowMakeRoomModal(false)}
          createUserId={currentUser?.userId || '000'}
        />
      )}

      {/* JoinConfirmModal */}
      {showJoinConfirmModal && (
        <JoinConfirmModal
          selectedRoomId={selectedRoomId}
          currentUserId={currentUser?.userId || '999'}
          onClose={() => setShowJoinConfirmModal(false)}
          // onJoin={() => setShowJoinConfirmModal(false)}
          onSaveProfile={() => {
            console.log('Profile saved');
          }}
        />
      )}
    </div>
  );
}
