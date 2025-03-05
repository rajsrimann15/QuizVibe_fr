import { useState } from 'react';
import './App.css';
import Home from './pages/Home';
import JoinRoom from './pages/JoinRoom';
import CreateRoom from './pages/CreateRoom';
import Room from './pages/Room';
import AdminRoom from './pages/AdminRoom';
import Scorecard from './pages/Scorecard';
import AdminScorecard from './pages/AdminScorecard';
import NavigationGuard from './pages/NavigationGuard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {

  return (
    <Router>
      <NavigationGuard />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/Create-room" element={<CreateRoom />} />
        <Route path="/admin-room/:roomCode" element={<AdminRoom />} />
        <Route path="/join-room/:roomCode" element={<JoinRoom />} />
        <Route path="/room/:roomCode/:nickname" element={<Room />} />
        <Route path="/scorecard/:roomCode/:nickname" element={<Scorecard />} />
        <Route path="/admin-scorecard/:roomCode" element={<AdminScorecard />} />
        <Route path="/room/:roomCode/display" element={<Room />} />
      </Routes>
    </Router>
  );
}

export default App;
