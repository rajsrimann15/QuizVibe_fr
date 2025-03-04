import React from "react";
import { useLocation, useParams } from "react-router-dom";

function AdminScorecard() {
    const { roomCode } = useParams();
    const location = useLocation();
    const scores = location.state?.scores || {}; // Retrieve scores passed via navigation

    return (
        <div>
            <h2>Final Scorecard</h2>
            <p><strong>Room Code:</strong> {roomCode}</p>

            <h3>Leaderboard:</h3>
            <ul>
                {Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([name, score], index) => (
                    <li key={index}>{name}: <strong>{score} points</strong></li>
                ))}
            </ul>
        </div>
    );
}

export default AdminScorecard;
