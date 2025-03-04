import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../socket";

function Room() {
    const { roomCode, nickname } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [scores, setScores] = useState({});

    useEffect(() => {
        socket.emit("get-room-questions", roomCode, (fetchedQuestions) => {
            console.log("Fetched Questions:", fetchedQuestions);
            if (fetchedQuestions?.length) setQuestions(fetchedQuestions);
        });

        const handleStartRoom = ({ questions }) => {
            console.log("Received questions from socket:", questions);
            setQuestions(questions);
        };

        socket.on("start-room", handleStartRoom);
        socket.on("update-scores", (updatedScores) => {
            setScores(updatedScores);
        });

        return () => {
            socket.off("start-room", handleStartRoom);
            socket.off("update-scores");
        };
    }, [roomCode]);

    useEffect(() => {
        if (questions.length > 0 && currentQuestionIndex < questions.length) {
            setStartTime(performance.now());
            setTimeLeft(questions[currentQuestionIndex]?.timer || 0);
    
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        if (selectedOption === null) {
                            // User didn't select any answer, submit zero score
                            socket.emit("submit-answer", {
                                roomCode,
                                questionIndex: currentQuestionIndex,
                                selectedOption: null,
                                isCorrect: false,
                                nickname,
                                responseTime: 0, // No response time since no answer was given
                            });
                        }
                        handleNextQuestion();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000); // Update every second (fixed interval mistake)
    
            return () => clearInterval(timer);
        }
    }, [currentQuestionIndex, questions]);
    
    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
            setSelectedOption(null);
            setShowResult(false);
        } else {
            setCurrentQuestionIndex(0); // Reset index before navigating
            navigate(`/scorecard/${roomCode}/${nickname}`);
        }
    };

    const handleSubmitAnswer = () => {
        if (!nickname) {
            alert("Error: No nickname found. Please rejoin the room.");
            return;
        }
        if (selectedOption === null) {
            alert("Please select an answer.");
            return;
        }

        const endTime = performance.now();
        const responseTime = ((endTime - startTime) / 1000).toFixed(3);

        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return; // Prevent errors if the question is undefined

        const isCorrect = currentQuestion.correctIndex === selectedOption;
        socket.emit("submit-answer", { 
            roomCode, 
            questionIndex: currentQuestionIndex, 
            selectedOption, 
            isCorrect,
            nickname,
            responseTime
        });

        setShowResult(true);
        handleNextQuestion();
    };

    if (questions.length === 0) {
        return <p style={{ textAlign: "center" }}>Waiting for questions...</p>;
    }

    const currentQuestion = questions[currentQuestionIndex] || {}; // Ensure no undefined errors

    return (
        <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif" }}>
            <h1>Room Code: {roomCode}</h1>
            <h2>Nickname: {nickname}</h2>

            {currentQuestion.text ? <h2>{currentQuestion.text}</h2> : <p>Loading question...</p>}
            <h3>Time Left: {timeLeft} seconds</h3>

            {currentQuestion.options && currentQuestion.options.map((option, index) => (
                <button 
                    key={index} 
                    onClick={() => setSelectedOption(index)}
                    style={{
                        margin: "5px",
                        padding: "10px 20px",
                        backgroundColor: selectedOption === index ? "green" : "lightgray",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        color: "white"
                    }}
                >
                    {option}
                </button>
            ))}

            <br />
            <button 
                onClick={handleSubmitAnswer} 
                disabled={selectedOption === null}
                style={{
                    marginTop: "10px",
                    padding: "10px 20px",
                    backgroundColor: selectedOption !== null ? "#007bff" : "gray",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: selectedOption !== null ? "pointer" : "not-allowed"
                }}
            >
                Submit Answer
            </button>

            {showResult && (
                <p style={{ fontWeight: "bold", fontSize: "18px", color: currentQuestion.correctIndex === selectedOption ? "green" : "red" }}>
                    {currentQuestion.correctIndex === selectedOption ? "Correct!" : "Wrong Answer"}
                </p>
            )}
        </div>
    );
}

export default Room;
