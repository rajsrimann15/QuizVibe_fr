import { io } from "socket.io-client";

const backendLink = import.meta.env.VITE_BACKEND_LINK;

console.log("Attempting to connect to WebSocket server at:", backendLink);

export const socket = io(backendLink, { 
    transports: ["polling"], // Force polling to avoid WebSocket issues
    autoConnect: true 
});

socket.on("connect", () => {
    console.log("Connected to WebSocket server:", socket.id);
});

socket.on("connect_error", (error) => {
    console.error(" WebSocket connection error:", error);
});
