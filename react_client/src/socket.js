import { io } from "socket.io-client";

// Replace this with your Render backend URL:
export const socket = io("https://localhost:3000", {
  transports: ["websocket"],
});
