import './App.css';
import { Route, Routes } from 'react-router-dom';
import HomePgae from './components/HomePage';
import backgroundImage from '/pong8.jpg'

function App() {
  return (
    <>
       <div className='bg-cover' style={{backgroundImage: `url(${backgroundImage})`}}>
      <Routes>
        <Route path="/" element={<HomePgae />} />
      </Routes>
      </div>
    </>
  );
}

export default App;
