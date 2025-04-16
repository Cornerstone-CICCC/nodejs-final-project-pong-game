import './App.css';
import { Route, Routes } from 'react-router-dom';
import DestopImage from '../public/background.jpg';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  return (
    <div
      className="text-white  h-[100vh] flex justify-center items-center bg-cover "
      style={{ backgroundImage: `url(${DestopImage})` }}
    >
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="Register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
