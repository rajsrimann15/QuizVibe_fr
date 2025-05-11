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
                navigate(`/room/${roomCode}/${nickname}`);
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
        <div className="min-h-screen flex flex-col items-center justify-center text-white p-4">
            <div className="bg-white text-gray-900 p-6 rounded-lg shadow-md w-full max-w-md">
                {!isJoined ? (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-4">Join Room</h2>
                        <p className="text-center text-lg font-semibold text-orange-600 mb-2">
                            Room Code: <span className="font-bold">{roomCode}</span>
                        </p>
                        <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Enter your nickname"
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                            onClick={handleJoin}
                            className="w-full bg-orange-600 text-white py-2 rounded-lg mt-3 hover:bg-orange-700 transition"
                        >
                            Join Room
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-lg font-semibold text-center text-gray-700">
                            Waiting for the admin to start the room...
                        </p>
                        <h3 className="text-xl font-bold text-gray-900 mt-4 text-center">Users in Room:</h3>
                        <ul className="list-disc pl-6 text-gray-700 mt-2">
                            {nicknames.map((name, index) => (
                                <li key={index} className="text-lg">{name}</li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
}

export default JoinRoom;
