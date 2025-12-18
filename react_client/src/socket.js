import { io } from "socket.io-client";

// Replace this with your Render backend URL:
export const socket = io("https://react-collab-in-class-p062.onrender.com", {
  transports: ["websocket"],
});
