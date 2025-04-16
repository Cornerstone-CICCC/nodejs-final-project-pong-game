import { useEffect, useState } from 'react';
import JoinRoomCard from './JoinRoomCard';
import MakeRoomModal from './MakeRoomModal';
import JoinConfirmModal from './JoinConfirmModal';
import useWebSocket from '../lib/useWebSocket';
import { useNavigate } from 'react-router-dom';

type roomType = {
  id: string;
  room_name: string;
  participants: number;
};

export default function RoomListPage() {
  const [showMakeRoomModal, setShowMakeRoomModal] = useState(false);
  const [showJoinConfirmModal, setShowJoinConfirmModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [rooms, setRooms] = useState<roomType[]>([]);
  const { sendMessage } = useWebSocket('ws://localhost:8080');
  const navigate = useNavigate();

  useEffect(() => {
    // API call to fetch rooms and participants
    const fetchRooms = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/rooms`
        );
        if (!response.ok) {
          console.error('Error fetching rooms:');
          throw new Error('Failed to fetch rooms');
        }
        const data = await response.json();
        console.log('Fetched rooms:', data);
        setRooms(data); // Assuming the API returns { rooms: [...] }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  const handleOpenMakeRoomModal = () => {
    setShowMakeRoomModal(true);
  };

  const handleCloseMakeRoomModal = () => {
    setShowMakeRoomModal(false);
  };

  const handleOpenJoinConfirmModal = (roomName: string) => {
    setSelectedRoom(roomName);
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
      event: 'join_room',
      room: room_name,
      userId: '123',
    });

    setRooms(prevRooms => [
      ...prevRooms,
      { id: roomId, room_name: room_name, participants: 1 },
    ]);

    navigate(`/game/${roomId}`);
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {rooms && rooms.length > 0 ? (
          rooms.map(room => (
            <div key={room.id} className="mb-4">
              <JoinRoomCard
                roomName={room.room_name}
                participants={room.participants}
                onJoin={() => handleOpenJoinConfirmModal(room.room_name)}
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
          user={{
            id: '123',
            username: 'JohnDoe',
            bio: 'This is a sample bio.',
          }}
          currentUserId="456"
          roomName={selectedRoom}
          onSaveProfile={data => console.log('Profile saved:', data)}
          onClose={handleCloseJoinConfirmModal}
          onJoin={handleJoinRoom}
        />
      )}
    </div>
  );
}
