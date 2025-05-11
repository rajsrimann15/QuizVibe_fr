import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

function CreateRoom() {
    const [roomCode, setRoomCode] = useState("");
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);
    const [nicknames, setNicknames] = useState([]);
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!roomCode) return;

        const updateNicknames = (nicknames) => {
            setNicknames(nicknames);
        };

        socket.on("update-nicknames", updateNicknames);

        return () => {
            socket.off("update-nicknames", updateNicknames);
        };
    }, [roomCode]);

    const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

    const deleteQuestion = (index) => {
        setQuestions(questions.filter((_, qIndex) => qIndex !== index));
    };

    const createRoom = () => {
        if (questions.length === 0) {
            window.alert("At least one question is required!");
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            if (questions[i].options.length !== 4 || questions[i].options.some((opt) => opt.trim() === "")) {
                window.alert(`Question ${i + 1} must have exactly 4 options, and none should be empty!`);
                return;
            }
        }

        const newRoomCode = generateRoomCode();
        setRoomCode(newRoomCode);

        socket.emit("admin-watch-room", { roomCode: newRoomCode });
    };

    const handleStart = () => {
        if (roomCode && questions.length > 0) {
            socket.emit("start-room", { roomCode, questions });
            navigate(`/admin-room/${roomCode}`);
        } else {
            setError("Room code is missing or no questions added.");
        }
    };

    const addQuestion = () => {
        if (questions.length >= 10) {
            setError("Maximum 10 questions allowed.");
            return;
        }
        setQuestions([...questions, { text: "", options: ["", "", "", ""], correctIndex: 0, timer: 10 }]);
    };

    const updateQuestion = (index, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].text = value;
        setQuestions(updatedQuestions);
    };

    const updateOption = (qIndex, oIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].options[oIndex] = value;
        setQuestions(updatedQuestions);
    };

    const setCorrectAnswer = (qIndex, correctIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].correctIndex = correctIndex;
        setQuestions(updatedQuestions);
    };

    const setTimer = (qIndex, timer) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].timer = timer;
        setQuestions(updatedQuestions);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
                {!roomCode ? (
                    <>
                        <h2 className="text-xl font-bold text-center mb-4">Create a Quiz Room</h2>

                        {questions.map((q, qIndex) => (
                            <div key={qIndex} className="mb-4 p-4 bg-gray-100 rounded-lg">
                                <input
                                    type="text"
                                    placeholder="Enter question"
                                    value={q.text}
                                    onChange={(e) => updateQuestion(qIndex, e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md mb-2"
                                />
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            placeholder={`Option ${oIndex + 1}`}
                                            value={opt}
                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                            className="flex-1 p-2 border border-gray-300 rounded-md"
                                        />
                                        <input
                                            type="radio"
                                            name={`correct-${qIndex}`}
                                            checked={q.correctIndex === oIndex}
                                            onChange={() => setCorrectAnswer(qIndex, oIndex)}
                                            className="ml-2"
                                        />
                                        <span className="ml-1 text-sm">Correct</span>
                                    </div>
                                ))}
                                <label className="block text-sm font-medium mt-2">Timer:</label>
                                <select
                                    value={q.timer}
                                    onChange={(e) => setTimer(qIndex, parseInt(e.target.value))}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value={10}>10 seconds</option>
                                    <option value={15}>15 seconds</option>
                                    <option value={20}>20 seconds</option>
                                </select>
                                <button
                                    onClick={() => deleteQuestion(qIndex)}
                                    className="w-full bg-red-500 text-white py-1 mt-2 rounded-lg hover:bg-red-600 transition"
                                >
                                    Delete Question
                                </button>
                            </div>
                        ))}

                        <button
                            onClick={addQuestion}
                            className="w-full bg-purple-800 text-white py-2 rounded-lg mt-3 hover:bg-purple-900 transition"
                        >
                            Add Question
                        </button>
                        <button
                            onClick={createRoom}
                            className="w-full bg-green-500 text-white py-2 rounded-lg mt-3 hover:bg-green-600 transition"
                        >
                            Create Room
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-center text-lg font-bold text-gray-700 flex items-center justify-center gap-2">
                            Room Code: <span className="text-orange-600">{roomCode}</span>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(roomCode);
                                    alert("Room code copied!");
                                }}
                                className="text-gray-600 hover:text-gray-800 transition"
                                title="Copy Room Code"
                            >
                                📋
                            </button>
                        </p>
                        <button
                            onClick={handleStart}
                            className="w-full bg-blue-500 text-white py-2 rounded-lg mt-3 hover:bg-blue-600 transition"
                        >
                            Start
                        </button>
                        <h3 className="text-lg font-semibold mt-4">Users in Room:</h3>
                        <ul className="list-disc pl-6 text-gray-700">
                            {nicknames.map((name, index) => (
                                <li key={index}>{name}</li>
                            ))}
                        </ul>
                    </>

                )}
                {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
            </div>
        </div>
    );
}

export default CreateRoom;
