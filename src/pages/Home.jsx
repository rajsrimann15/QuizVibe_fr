import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

function Home() {
  const [inputRoomCode, setInputRoomCode] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const joinRoom = () => {
    if (!inputRoomCode) {
      alert("Please enter a room code");
      return;
    }

    socket.emit("check-room-exists", inputRoomCode, (exists) => {
      if (exists) {
        window.open(`/join-room/${inputRoomCode}`, "_blank");
      } else {
        alert("Invalid room code. Please enter a valid room code.");
      }
    });
  };

  const handleGoogleSignIn = () => {
    navigate("/create-room");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Join or Create a Room
        </h1>

        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-purple-800 text-white py-2 rounded-lg hover:bg-purple-900 transition duration-300"
        >
          Create Room
        </button>

        <div className="mt-4">
          <input
            type="text"
            value={inputRoomCode}
            onChange={(e) => setInputRoomCode(e.target.value.trim())}
            placeholder="Enter room code"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={joinRoom}
          className="w-full mt-3 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300"
        >
          Join Room
        </button>

        {message && (
          <p className="text-red-500 text-sm text-center mt-2">{message}</p>
        )}
      </div>
    </div>
  );
}

export default Home;
