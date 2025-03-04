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
    const [timeLeft, setTimeLeft] = useState(null); // Timer state

    useEffect(() => {
        if (!roomCode) return;

        console.log("Admin joining watch room:", roomCode);
        socket.connect();
        socket.emit("admin-watch-room", { roomCode });

        socket.on("update-nicknames", (updatedNicknames) => {
            console.log("Admin received updated nicknames:", updatedNicknames);
            setNicknames([...new Set(updatedNicknames)]);
        });

        socket.on("update-scores", (updatedScores) => {
            console.log("Admin received updated scores:", updatedScores);
            setScores({ ...updatedScores });
        });

        // Listen for quiz completion event
        socket.on("quiz-completed", ({ completed, scores }) => {
            if (completed) {
                console.log("Quiz completed! Navigating to AdminScorecard...");
                navigate(`/admin-scorecard/${roomCode}`, { state: { scores } });
            }
        });

        // Listen for quiz timer start
        socket.on("quiz-timer-start", ({ totalTime }) => {
            console.log(`Quiz Timer Started: ${totalTime} seconds`);
            setTimeLeft(totalTime);
        });

        return () => {
            console.log("Admin leaving watch room:", roomCode);
            socket.off("update-nicknames");
            socket.off("update-scores");
            socket.off("quiz-completed");
            socket.off("quiz-timer-start");
            socket.disconnect();
        };
    }, [roomCode, navigate]);

    // Timer countdown logic
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    console.log("Quiz time up! Navigating to AdminScorecard...");
                    navigate(`/admin-scorecard/${roomCode}`, { state: { scores } });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, navigate, roomCode, scores]);

    const handleShowQuestions = () => {
        socket.emit("get-room-questions-admin", roomCode, (questions) => {
            console.log("Received questions from backend:", questions);
            setQuestions(questions);
            setShowQuestions(true);
        });
    };

    const sortedNicknames = [...nicknames].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));

    return (
        <div>
            <h2>Admin Room</h2>
            <p><strong>Room Code:</strong> {roomCode}</p>

            <h3>Users in Room:</h3>
            {sortedNicknames.length > 0 ? (
                <ul>
                    {sortedNicknames.map((name, index) => (
                        <li key={index}>
                            {name} - <strong>{scores[name] || 0} points</strong>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No users have joined yet.</p>
            )}

            {timeLeft !== null && (
                <p><strong>Time Left:</strong> {Math.floor(timeLeft / 60)}m {timeLeft % 60}s</p>
            )}

            <button onClick={handleShowQuestions}>Show Questions</button>

            {showQuestions && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '20px',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    maxWidth: '600px',
                    width: '90%',
                    maxHeight: '80vh',
                    overflowY: 'auto'
                }}>
                    <h3>Questions and Answers</h3>
                    {questions.map((q, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                            <p><strong>Question {index + 1}:</strong> {q.question}</p>
                            <ul>
                                {q.options.map((option, optIndex) => (
                                    <li key={optIndex} style={{
                                        color: optIndex === q.correctAnswer ? 'green' : 'black',
                                        fontWeight: optIndex === q.correctAnswer ? 'bold' : 'normal'
                                    }}>
                                        {option} {optIndex === q.correctAnswer && '(Correct Answer)'}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <button onClick={() => setShowQuestions(false)} style={{ marginTop: '10px' }}>Close</button>
                </div>
            )}
        </div>
    );
}

export default AdminRoom;
