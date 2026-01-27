import { Server } from "socket.io";

let io;

export const initSocket = (httpServer, options) => {
  io = new Server(httpServer, options);
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
