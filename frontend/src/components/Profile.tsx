import { Edit, Save, User, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { HistoryType, userType } from '../lib/type';

const UserProfile = ({
  user,
  currentUserId,
  onSaveProfile,
}: {
  user: userType;
  currentUserId: string;
  onSaveProfile: (data: { username: string; message: string }) => void;
}) => {
  const isOwnProfile = user._id === currentUserId;

  const [isEditing, setIsEditing] = useState(false);
  const [histories, setHistories] = useState<HistoryType[]>([]);

  const [formData, setFormData] = useState({
    username: user.username || '',
    message: user.message || '',
  });

  const fetchUserInfo = async (user_id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${user_id}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      const data = await response.json();
      console.log('Fetched user info:', data);
      return data; // ユーザー情報全体を返す
    } catch (error) {
      console.error('Error fetching user info:', error);
      return { username: 'Unknown User' }; // エラー時のデフォルト値
    }
  };

  useEffect(() => {
    setFormData({
      username: user.username || '',
      message: user.message || '',
    });
  }, [user]);

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/histories/${user._id}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch histories');
        }
        const data: HistoryType[] = await response.json();
        console.log('Fetched histories:', data);

        const processedHistories = await Promise.all(
          data.map(async (history: HistoryType) => {
            if (history.opponent_user_id === user._id) {
              const opponentUser = await fetchUserInfo(history.user_id);
              return {
                ...history,
                opponent_username: opponentUser.username,
                own_score: history.opponent_score,
                opponent_score: history.own_score,
              };
            } else {
              const opponentUser = await fetchUserInfo(
                history.opponent_user_id
              );
              return {
                ...history,
                opponent_username: opponentUser.username,
              };
            }
          })
        );

        setHistories(processedHistories);
      } catch (error) {
        console.error('Error fetching histories:', error);
      }
    };

    fetchHistories();
  }, [user._id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSaveProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      username: user.username || '',
      message: user.message || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-100 p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-gray-300 rounded-full p-3">
            <User size={48} className="text-gray-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">
              {isEditing ? formData.username : user.username}
            </h2>
            {!isEditing && <p className="text-gray-500">#{user._id}</p>}
          </div>
        </div>

        {isOwnProfile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-1 bg-black text-white px-4 py-2 rounded hover:bg-gray-300 hover:text-black"
          >
            <Edit size={16} />
            <span>Edit</span>
          </button>
        )}

        {isEditing && (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center space-x-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              <Save size={16} />
              <span>Save</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UserName
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Introduction
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">UserName</h3>
                <p className="mt-1">{user.username}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Introduction
              </h3>
              <p className="mt-1 whitespace-pre-line">
                {user.message || 'No introduction provided.'}
              </p>
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">History</h3>
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">Date</th>
                  <th className="border border-gray-300 px-4 py-2">Opponent</th>
                  <th className="border border-gray-300 px-4 py-2">
                    Your Score
                  </th>
                  <th className="border border-gray-300 px-4 py-2">
                    Opponent Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {histories.length > 0 ? (
                  histories.map(history => (
                    <tr key={history._id}>
                      <td className="border border-gray-300 px-4 py-2">
                        {format(new Date(history.date), 'MMMM d, yyyy h:mm a')}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {history.opponent_username}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {history.own_score}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {history.opponent_score}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="border border-gray-300 px-4 py-2 text-center text-gray-500"
                    >
                      No history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
