import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../socket"; // Ensure correct socket import

function Scorecard() {
    const { roomCode } = useParams(); // Get roomCode from URL
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [scores, setScores] = useState([]);

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
    }, [roomCode]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center  text-white p-6">
            <div className="bg-white text-gray-900 p-6 rounded-2xl shadow-lg w-full max-w-md text-center">
                <h1 className="text-3xl font-bold mb-4">Scorecard</h1>
                {quizCompleted ? (
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Quiz Completed!</h2>
                        <h3 className="text-lg font-medium mb-3">Final Scores:</h3>
                        <ul className="space-y-2">
                            {scores.map(({ nickname, score }, index) => (
                                <li
                                    key={nickname}
                                    className={`p-3 rounded-md ${
                                        index === 0 ? "bg-yellow-300 text-black font-bold" : "bg-gray-200"
                                    }`}
                                >
                                    {index + 1}. {nickname}: {score.toFixed(3)} points
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-lg font-medium">Waiting for all users to complete the quiz...</p>
                )}
            </div>
        </div>
    );
}

export default Scorecard;
