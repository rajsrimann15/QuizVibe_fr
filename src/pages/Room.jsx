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
            if (fetchedQuestions?.length) setQuestions(fetchedQuestions);
        });

        const handleStartRoom = ({ questions }) => {
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
                            socket.emit("submit-answer", {
                                roomCode,
                                questionIndex: currentQuestionIndex,
                                selectedOption: null,
                                isCorrect: false,
                                nickname,
                                responseTime: 0,
                            });
                        }
                        handleNextQuestion();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [currentQuestionIndex, questions]);

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
            setSelectedOption(null);
            setShowResult(false);
        } else {
            setCurrentQuestionIndex(0);
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
        if (!currentQuestion) return;

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
        return <p className="text-center text-white">Waiting for questions...</p>;
    }

    const currentQuestion = questions[currentQuestionIndex] || {};

    return (
        <div className="min-h-screen flex items-center justify-center  p-4">
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg text-gray-900">
                <h1 className="text-3xl font-bold text-center mb-4 text-orange-600">
                    Room Code: {roomCode}
                </h1>
                <h2 className="text-xl text-center mb-4">{nickname}</h2>

                {currentQuestion.text ? (
                    <h2 className="text-2xl font-semibold text-center mb-4">{currentQuestion.text}</h2>
                ) : (
                    <p className="text-lg text-center">Loading question...</p>
                )}

                <h3 className="text-lg font-semibold text-center mb-4 text-red-500">
                    Time Left: {timeLeft} seconds
                </h3>

                <div className="flex flex-col space-y-3">
                    {currentQuestion.options &&
                        currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedOption(index)}
                                className={`px-6 py-3 rounded-lg text-lg font-medium transition ${
                                    selectedOption === index
                                        ? "bg-green-600 text-white"
                                        : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                </div>

                <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedOption === null}
                    className={`mt-6 w-full px-6 py-3 rounded-lg text-lg font-medium transition ${
                        selectedOption !== null
                            ? "bg-blue-500 text-white hover:bg-blue-400"
                            : "bg-gray-400 text-gray-700 cursor-not-allowed"
                    }`}
                >
                    Submit Answer
                </button>

                {showResult && (
                    <p
                        className={`mt-4 text-xl font-bold text-center ${
                            currentQuestion.correctIndex === selectedOption
                                ? "text-green-600"
                                : "text-red-500"
                        }`}
                    >
                        {currentQuestion.correctIndex === selectedOption ? "Correct!" : "Wrong Answer"}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Room;
