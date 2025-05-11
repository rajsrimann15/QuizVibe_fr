import React from "react";
import { useLocation, useParams } from "react-router-dom";

function AdminScorecard() {
    const { roomCode } = useParams();
    const location = useLocation();
    const scores = location.state?.scores || {}; // Retrieve scores passed via navigation

    // Convert scores object to an array and sort in descending order
    const sortedScores = Object.entries(scores)
        .map(([name, score]) => ({ name, score }))
        .sort((a, b) => b.score - a.score);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white p-6">
            <div className="bg-white text-gray-900 p-6 rounded-2xl shadow-lg w-full max-w-md text-center">
                <h1 className="text-3xl font-bold mb-4">Final Scorecard</h1>
                <p className="text-lg font-medium"><strong>Room Code:</strong> {roomCode}</p>

                <h3 className="text-xl font-semibold mt-4 mb-2">Leaderboard:</h3>
                <ul className="space-y-2">
                    {sortedScores.map(({ name, score }, index) => (
                        <li 
                            key={index} 
                            className={`p-3 rounded-md ${
                                index === 0 ? "bg-yellow-300 text-black font-bold" : "bg-gray-200"
                            }`}
                        >
                            {index + 1}. {name}: <strong>{score.toFixed(3)} points</strong>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default AdminScorecard;
