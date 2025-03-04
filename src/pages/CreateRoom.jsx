import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from "../socket";

function CreateRoom() {
    const [roomCode, setRoomCode] = useState('');
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);
    const [nicknames, setNicknames] = useState([]);
    const navigate = useNavigate();

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
            window.alert('At least one question is required!');
            return;
        }
    
        for (let i = 0; i < questions.length; i++) {
            if (questions[i].options.length !== 4 || questions[i].options.some(opt => opt.trim() === '')) {
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
            socket.emit('start-room', { roomCode, questions });
            navigate(`/admin-room/${roomCode}`);
        } else {
            setError('Room code is missing or no questions added.');
        }
    };

    const addQuestion = () => {
        if (questions.length >= 10) {
            setError('Maximum 10 questions allowed.');
            return;
        }
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correctIndex: 0, timer: 10 }]);
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
        <div>
            {!roomCode ? (
                <>
                    {questions.map((q, qIndex) => (
                        <div key={qIndex}>
                            <input
                                type="text"
                                placeholder="Enter question"
                                value={q.text}
                                onChange={(e) => updateQuestion(qIndex, e.target.value)}
                            />
                            {q.options.map((opt, oIndex) => (
                                <div key={oIndex}>
                                    <input
                                        type="text"
                                        placeholder={`Option ${oIndex + 1}`}
                                        value={opt}
                                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                    />
                                    <input
                                        type="radio"
                                        name={`correct-${qIndex}`}
                                        checked={q.correctIndex === oIndex}
                                        onChange={() => setCorrectAnswer(qIndex, oIndex)}
                                    /> Mark Correct
                                </div>
                            ))}
                            <select value={q.timer} onChange={(e) => setTimer(qIndex, parseInt(e.target.value))}>
                                <option value={10}>10 seconds</option>
                                <option value={15}>15 seconds</option>
                                <option value={20}>20 seconds</option>
                            </select>
                            <button onClick={() => deleteQuestion(qIndex)} style={{ color: "red" }}>Delete</button>
                        </div>

                    ))}
                    <button onClick={addQuestion}>Add Question</button>
                    <button onClick={createRoom}>Create Room</button>
                </>
            ) : (
                <>
                    <p>Room Code: <strong>{roomCode}</strong></p>
                    <button onClick={handleStart}>Start</button>
                    <h3>Users in Room:</h3>
                    <ul>
                        {nicknames.map((name, index) => (
                            <li key={index}>{name}</li>
                        ))}
                    </ul>
                </>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default CreateRoom;