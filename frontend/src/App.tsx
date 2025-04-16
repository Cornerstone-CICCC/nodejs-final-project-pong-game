import './App.css';
import { Route, Routes } from 'react-router-dom';
// import DestopImage from '/background.jpg';
import Login from './components/Login';
import Register from './components/Register';
import HomePage from './components/HomePage';
import RoomListPage from './components/RoomListPage';

function App() {
  return (
    <div
    // className="text-white  h-[100vh] flex justify-center items-center bg-cover "
    // style={{ backgroundImage: `url(${DestopImage})` }}
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="/roomlist" element={<RoomListPage />} />
      </Routes>
    </div>
  );
}

export default App;
