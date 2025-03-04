import React, { useState } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { socket } from "../socket";

function Home() {
    const [roomCode, setRoomCode] = useState('');
    const [inputRoomCode, setInputRoomCode] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();


    const joinRoom = () => {
        if (!inputRoomCode) {
            alert('Please enter a room code');
            return;
        }
    
        socket.emit('check-room-exists', inputRoomCode, (exists) => {
            if (exists) {
                window.open(`/join-room/${inputRoomCode}`, '_blank');
            } else {
                alert('Invalid room code. Please enter a valid room code.');
            }
        });
    };

    const handleGoogleSignIn = () => {
        // Implement Google sign-in logic here
        // On successful sign-in, navigate to the CreateRoom component
        navigate('/create-room');
    };

    return (
        <div className="App">
            <button onClick={handleGoogleSignIn}>Create Room</button>
            <input
                type="text"
                value={inputRoomCode}
                onChange={(e) => setInputRoomCode(e.target.value.trim())}
                placeholder="Enter room code"
            />
            <button onClick={joinRoom}>Join Room</button>
            {message && <p>{message}</p>}
        </div>
    );
}

export default Home;
