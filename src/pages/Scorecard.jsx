import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket"; // Ensure correct socket import

function Scorecard() {
    const { roomCode, nickname } = useParams(); // Get roomCode and nickname from URL
    const navigate = useNavigate();
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [scores, setScores] = useState([]);
    const [allScores, setAllScores] = useState({});

    useEffect(() => {
        // Check if all users have completed the quiz
        socket.emit("check-quiz-completion", roomCode, (allUsersCompleted) => {
            setQuizCompleted(allUsersCompleted);
        });

        // Listen for the quiz-completed event from the server
        socket.on("quiz-completed", ({ completed, scores }) => {
            setQuizCompleted(completed);
            if (completed) {
                // Convert scores object to an array and sort in descending order
                const sortedScores = Object.entries(scores)
                    .map(([nickname, score]) => ({ nickname, score }))
                    .sort((a, b) => b.score - a.score);
                setScores(sortedScores);
            }
        });

        return () => {
            socket.off("quiz-completed");
        };
    }, [roomCode, socket]);

    return (
        <div>
            <h1>Scorecard</h1>
            {quizCompleted ? (
                <div>
                    <h2>Quiz Completed!</h2>
                    <h3>Scores:</h3>
                    <ul>
                        {scores.map(({ nickname, score }, index) => (
                            <li key={nickname}>
                                {index + 1}. {nickname}: {score.toFixed(3)} points
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>Waiting for all users to complete the quiz...</p>
            )}
        </div>
    );
};

export default Scorecard;
