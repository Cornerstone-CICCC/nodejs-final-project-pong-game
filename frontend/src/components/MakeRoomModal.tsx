import { X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MakeRoomModalProps {
  onClose: () => void;
  // onRoomCreated: (roomId: string) => void;
  createUserId: string;
}

type Room = {
  _id: string;
  room_name: string;
  __v: number;
};

type UserRoom = {
  _id: string;
  room_id: string;
  creator_user_id: string;
  opponent_user_id: string | null;
  __v: number;
};

type CreateRoomResponse = {
  room: Room;
  userRoom: UserRoom;
};

const MakeRoomModal: React.FC<MakeRoomModalProps> = ({
  onClose,
  // onRoomCreated,
  createUserId,
}) => {
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('public');
  const navigate = useNavigate();
  const handleCreateRoom = async () => {
    try {
      //create recode of room and user_room automatically / args: room_name, creator_user_id
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/rooms`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            room_name: roomName,
            creator_user_id: createUserId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const data: CreateRoomResponse = await response.json();

      // should use user_room id
      // return object is room Object not user_room
      console.log('/api/rooms fetch date:', data);
      navigate(`/room/${data.userRoom._id}`);

      onClose();
      setRoomName('');
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/50 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white border border-white rounded-3xl p-10 shadow-lg w-full max-w-lg mx-4">
        <div className="flex flex-col space-y-8">
          <div>
            <div className="flex justify-between">
              <label className="block text-black text-2xl mb-3">
                Room's Name
              </label>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 mb-3"
              >
                <X />
              </button>
            </div>
            <input
              type="text"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              className="w-full px-4 py-3 text-black border border-black rounded-lg focus:outline-none"
              placeholder="Gustavo's Room"
            />
          </div>

          <div className="flex">
            <button
              onClick={() => setRoomType('public')}
              className={`px-8 py-3 rounded-lg ${
                roomType === 'public' && 'underline border border-black'
              }`}
            >
              Public
            </button>

            <button
              onClick={() => setRoomType('private')}
              className={`px-8 py-3 rounded-lg ${
                roomType === 'private' && 'underline border border-black'
              }`}
            >
              Private
            </button>
          </div>

          <button
            onClick={handleCreateRoom}
            className="w-full mt-6 px-4 py-4 border border-black text-black text-xl rounded-lg hover:bg-gray-300 transition-colors"
          >
            Start new Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default MakeRoomModal;
