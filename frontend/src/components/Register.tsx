import { AiOutlineUnlock } from 'react-icons/ai';
import { BiUser } from 'react-icons/bi';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import DestopImage from '/background_purple_login.png';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to register');
        return;
      }

      navigate('/login');
    } catch (err) {
      console.error('Error during registration:', err);
      setError('An unexpected error occurred');
      navigate('/register');
    }
  };

  return (
    <section
      className="text-white  h-full flex justify-center items-center bg-cover "
      style={{ backgroundImage: `url(${DestopImage})` }}
    >
      <div className="min-h-screen w-full flex justify-center items-center px-4">
        <div className="bg-slate-800/30 border border-slate-400 rounded-md p-6 sm:p-8 shadow-lg backdrop-filter backdrop-blur-sm relative w-full max-w-md">
          <h1 className="text-4xl text-white font-bold text-center mb-6">
            Register
          </h1>
          <form onSubmit={handleRegister}>
            <div className="relative my-10">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="peer block w-full appearance-none border-0 border-b-2 border-gray-100 bg-transparent py-2.5 px-0 text-sm text-white focus:border-blue-600 focus:outline-none focus:ring-0"
                placeholder=""
                required
              />
              <label className="absolute text-sm text-white duration-200 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] left-0 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-500">
                Your Username
              </label>
              <BiUser className="absolute top-4 right-4" />
            </div>
            <div className="relative my-10">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="peer block w-full appearance-none border-0 border-b-2 border-gray-100 bg-transparent py-2.5 px-0 text-sm text-white focus:border-blue-600 focus:outline-none focus:ring-0"
                placeholder=""
                required
                minLength={8}
              />
              <label className="absolute text-sm text-white duration-200 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] left-0 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-500">
                Your Password
              </label>
              <AiOutlineUnlock className="absolute top-4 right-4" />
            </div>
            <div className="relative my-10">
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="peer block w-full appearance-none border-0 border-b-2 border-gray-100 bg-transparent py-2.5 px-0 text-sm text-white focus:border-blue-600 focus:outline-none focus:ring-0"
                placeholder=""
                required
                minLength={8}
              />
              <label className="absolute text-sm text-white duration-200 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] left-0 peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:text-blue-500">
                Confirm Password
              </label>
              <AiOutlineUnlock className="absolute top-4 right-4" />
            </div>
            {error && (
              <div className="text-red-500 text-sm mb-4 text-center">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full mb-4 text-[18px] mt-6 rounded-full bg-white text-emerald-800 hover:bg-purple-700 hover:text-white py-2 px-6 font-semibold shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_4px_rgba(147,51,234,0.4)] active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400 relative overflow-hidden"
            >
              <span className="inline-flex items-center gap-2 relative z-10">
                <span>Register</span>
                <span className="animate-pulse">🌟</span>
              </span>
              <span className="absolute inset-0 rounded-full bg-purple-500 opacity-20 animate-ping z-0" />
            </button>
            <div className="mt-4 text-sm text-center">
              <span className="text-white mr-1">
                Already Created An Account?
              </span>
              <Link className="text-blue-500 font-medium" to="/login">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Register;
