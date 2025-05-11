import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket";

function AdminRoom() {
    const { roomCode } = useParams();
    const navigate = useNavigate();
    const [nicknames, setNicknames] = useState([]);
    const [scores, setScores] = useState({});
    const [questions, setQuestions] = useState([]);
    const [showQuestions, setShowQuestions] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!roomCode) return;

        socket.connect();
        socket.emit("admin-watch-room", { roomCode });

        socket.on("update-nicknames", (updatedNicknames) => {
            setNicknames([...new Set(updatedNicknames)]);
        });

        socket.on("update-scores", (updatedScores) => {
            setScores({ ...updatedScores });
        });

        socket.on("quiz-completed", ({ completed, scores }) => {
            if (completed) {
               // navigate(`/admin-scorecard/${roomCode}`, { state: { scores } });
            }
        });

        socket.on("quiz-timer-start", ({ totalTime }) => {
            setTimeLeft(totalTime);
        });

        return () => {
            socket.off("update-nicknames");
            socket.off("update-scores");
            socket.off("quiz-completed");
            socket.off("quiz-timer-start");
            socket.disconnect();
        };
    }, [roomCode, navigate]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    //navigate(`/admin-scorecard/${roomCode}`, { state: { scores } });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, navigate, roomCode, scores]);

    const handleShowQuestions = () => {
        socket.emit("get-room-questions-admin", roomCode, (questions) => {
            setQuestions(questions);
            setShowQuestions(true);
        });
    };

    const sortedNicknames = [...nicknames].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));

    return (
        <div className="max-w-3xl mx-auto mt-16 p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-3xl font-bold text-center text-orange-500">Admin Room</h2>
            <p className="text-center text-gray-600 mt-2">
                <strong>Room Code:</strong> {roomCode}
            </p>

            {timeLeft !== null && (
                <p className="text-center bg-orange-100 text-orange-700 py-2 px-4 rounded-lg mt-4 font-semibold inline-block">
                    ⏳ Time Left: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                </p>
            )}

            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Leaderboard</h3>
                {sortedNicknames.length > 0 ? (
                    <ul className="bg-gray-100 p-4 rounded-lg shadow-md">
                        {sortedNicknames.map((name, index) => (
                            <li key={index} className="flex justify-between py-2 border-b">
                                <span className="font-medium text-gray-700">
                                    #{index + 1} {name}
                                </span>
                                <span className="font-bold text-orange-500">{scores[name] || 0} pts</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No users have joined yet.</p>
                )}
            </div>

            <button 
                onClick={handleShowQuestions} 
                className="mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition">
                Show Questions
            </button>

            {showQuestions && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-96 overflow-y-auto">
                        <h3 className="text-xl font-semibold text-center mb-4">Questions and Answers</h3>
                        {questions.map((q, index) => (
                            <div key={index} className="mb-4 p-3 border rounded-lg bg-gray-50">
                                <p className="font-medium">{index + 1}. {q.question}</p>
                                <ul className="mt-2">
                                    {q.options.map((option, optIndex) => (
                                        <li key={optIndex} className={`p-2 rounded ${optIndex === q.correctAnswer ? "bg-green-100 font-bold text-green-600" : "text-gray-700"}`}>
                                            {option} {optIndex === q.correctAnswer && "(✔ Correct Answer)"}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <button 
                            onClick={() => setShowQuestions(false)} 
                            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition w-full">
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminRoom;
