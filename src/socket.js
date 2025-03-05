// socket.js
import { io } from "socket.io-client";

const backendLink = import.meta.env.VITE_BACKEND_LINK;
export const socket = io(backendLink, { autoConnect: true }); 
