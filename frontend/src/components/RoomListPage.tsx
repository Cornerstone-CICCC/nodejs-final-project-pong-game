import { useEffect, useState } from 'react';
import JoinRoomCard from './JoinRoomCard';
import MakeRoomModal from './MakeRoomModal';
import JoinConfirmModal from './JoinConfirmModal';
import useWebSocket from '../lib/useWebSocket';
import { useNavigate } from 'react-router-dom';

type roomType = {
  _id: string;
  room_name: string;
  participants: number;
};

type UserType = {
  _id: string;
  username: string;
  message: string;
  score: number;
  win: number;
  lose: number;
  password: string;
};

type CurrentUserType = {
  user_id: string;
  username: string;
};

export default function RoomListPage() {
  const [showMakeRoomModal, setShowMakeRoomModal] = useState(false);
  const [showJoinConfirmModal, setShowJoinConfirmModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [rooms, setRooms] = useState<roomType[]>([]);
  const [creatorUser, setCreatorUser] = useState<UserType | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUserType | null>(null);
  const { sendMessage } = useWebSocket('ws://localhost:8080');
  const navigate = useNavigate();

  useEffect(() => {
    // API call to fetch rooms and participants
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
        const data = await response.json();
        console.log('Fetched rooms:', data);

        const rooms: any = [];

        data.map((userRoom: any) => {
          const room = {
            _id: userRoom.room_id._id,
            room_name: userRoom.room_id.room_name,
            participants: 1,
          }

          rooms.push(room)
        })

        setRooms(rooms);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

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

  const handleOpenMakeRoomModal = () => {
    setShowMakeRoomModal(true);
  };

  const handleCloseMakeRoomModal = () => {
    setShowMakeRoomModal(false);
  };

  const handleOpenJoinConfirmModal = (room: roomType) => {
    console.log('Joining room:', room);

    const fetchCreatorInfo = async () => {
      try {
        console.log('Fetching creator info for room ID:', room._id);

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/userrooms/room/${room._id}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (!response.ok) {
          console.error('Error fetching room creator info:');
          throw new Error('Failed to fetch room creator info');
        }

        const data = await response.json();

        if (!data.creatorUserId) {
          console.error('Creator user ID not found in response:', data);
          throw new Error('Creator user ID not found in response');
        }

        setCreatorUser(data.creatorUserId);
        console.log('Fetched room creator info:', data.creatorUserId._id);
      } catch (error) {
        console.error('Error fetching room creator info:', error);
      }
    };

    fetchCreatorInfo();
    setSelectedRoom(room.room_name);
    setShowJoinConfirmModal(true);
  };

  const handleCloseJoinConfirmModal = () => {
    setShowJoinConfirmModal(false);
    setSelectedRoom(null);
  };

  const handleJoinRoom = () => {
    console.log(`Joining room: ${selectedRoom}`);
    setShowJoinConfirmModal(false);
  };

  const handleRoomCreated = (roomId: string, room_name: string) => {
    sendMessage({
      // this is dummy data, replace with actual data from cookies and server
      event: 'join room',
      room: room_name,
      userId: '123',
    });

    setRooms(prevRooms => [
      ...prevRooms,
      { _id: roomId, room_name: room_name, participants: 1 },
    ]);

    navigate(`/game/${roomId}`);
  };

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
          onClick={handleOpenMakeRoomModal}
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
                onJoin={() => handleOpenJoinConfirmModal(room)}
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
          onRoomCreated={handleRoomCreated}
          onClose={handleCloseMakeRoomModal}
        />
      )}

      {/* JoinConfirmModal */}
      {showJoinConfirmModal && selectedRoom && (
        <JoinConfirmModal
          // get user data from mongoDB
          user={{
            id: creatorUser?._id || '000',
            username: creatorUser?.username || 'creatorUser',
            message: creatorUser?.message || 'This is a message',
          }}
          // this date get from cookies
          currentUserId={currentUser?.user_id || '999'}
          roomName={selectedRoom}
          onSaveProfile={data => console.log('Profile saved:', data)}
          onClose={handleCloseJoinConfirmModal}
          onJoin={handleJoinRoom}
        />
      )}
    </div>
  );
}
