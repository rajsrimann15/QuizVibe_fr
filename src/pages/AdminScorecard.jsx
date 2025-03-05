import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { socket } from "../socket"; // Ensure this is correctly set

const AdminScorecard = () => {
    const location = useLocation();
    const { roomCode } = useParams();
    const [scores, setScores] = useState({});

    useEffect(() => {
        // Restore scores from state or localStorage
        if (location.state?.scores) {
            setScores(location.state.scores);
            localStorage.setItem("quizScores", JSON.stringify(location.state.scores));
        } else {
            const storedScores = localStorage.getItem("quizScores");
            if (storedScores) {
                setScores(JSON.parse(storedScores));
            }
        }

        // Listen for live score updates
        socket.emit("admin-watch-room", { roomCode });

        socket.on("update-scores", (updatedScores) => {
            setScores(updatedScores);
            localStorage.setItem("quizScores", JSON.stringify(updatedScores));
        });

        return () => {
            socket.off("update-scores");
        };
    }, [roomCode, location.state]);

    return (
        <div>
            <h2>Admin Scorecard - Room {roomCode}</h2>
            <table>
                <thead>
                    <tr>
                        <th>Nickname</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(scores).map(([nickname, score]) => (
                        <tr key={nickname}>
                            <td>{nickname}</td>
                            <td>{score.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminScorecard;
