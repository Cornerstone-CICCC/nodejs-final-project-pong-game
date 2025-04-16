import { useState, useEffect } from 'react';
import { Edit, Save, X, User } from 'lucide-react';

const UserProfile = ({
  user,
  currentUserId,
  onSaveProfile,
}: {
  user: {
    id: string;
    username: string;
    bio: string;
  };
  currentUserId: string;
  onSaveProfile: (data: { username: string; bio: string }) => void;
}) => {
  const isOwnProfile = user.id === currentUserId;

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    username: user.username || '',
    bio: user.bio || '',
  });

  useEffect(() => {
    setFormData({
      username: user.username || '',
      bio: user.bio || '',
    });
  }, [user]);

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
      bio: user.bio || '',
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
            {!isEditing && <p className="text-gray-500">#{user.id}</p>}
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
                name="bio"
                value={formData.bio}
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
                {user.bio || 'No introduction provided.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
