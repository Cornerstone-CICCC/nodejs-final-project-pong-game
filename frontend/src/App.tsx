import './App.css';
import { Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import HomePage from './components/HomePage';
import RoomListPage from './components/RoomListPage';
import Game from './components/Game';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="/roomlist" element={<RoomListPage />} />
        <Route path="/room/:roomId" element={<Game />} /> //
      </Routes>
    </div>
  );
}

export default App;
