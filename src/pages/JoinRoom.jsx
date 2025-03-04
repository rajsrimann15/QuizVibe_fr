import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { socket } from '../socket';

function JoinRoom() {
    const { roomCode } = useParams();
    const [nickname, setNickname] = useState('');
    const [nicknames, setNicknames] = useState([]);
    const [isJoined, setIsJoined] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isJoined) {
            socket.emit('join-room', { roomCode, nickname });

            socket.on('start-room', () => {
                navigate(`/room/${roomCode}/${nickname}`); // Pass nickname in URL
            });

            socket.on('update-nicknames', (nicknames) => {
                setNicknames(nicknames);
            });

            return () => {
                socket.off('start-room');
                socket.off('update-nicknames');
            };
        }
    }, [isJoined, roomCode, nickname, navigate]);

    const handleJoin = () => {
        if (nickname.trim()) {
            socket.emit("check-nickname", { roomCode, nickname }, (isAvailable) => {
                if (isAvailable) {
                    setIsJoined(true);
                } else {
                    alert("Nickname is already taken. Please choose another.");
                }
            });
        } else {
            alert("Nickname cannot be empty.");
        }
    };

    return (
        <div>
            {!isJoined ? (
                <>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="Enter your nickname"
                    />
                    <button onClick={handleJoin}>Join Room</button>
                </>
            ) : (
                <>
                    <p>Waiting for the admin to start the room...</p>
                    <h3>Users in Room:</h3>
                    <ul>
                        {nicknames.map((name, index) => (
                            <li key={index}>{name}</li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

export default JoinRoom;
