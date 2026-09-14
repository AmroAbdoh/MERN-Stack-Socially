import type { Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";

let io: Server;

const allowedOrigin =
  process.env.CLIENT_URL || process.env.FRONTEND_URL || "http://localhost:5173";

const initSocket = (server: HttpServer): Server => {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: allowedOrigin,
        credentials: true,
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket: Socket) => {
      socket.on("joinNotifications", (userId: string) => {
        if (!userId) return;
        socket.join(userId.toString());
      });

      socket.on("leaveNotifications", (userId: string) => {
        if (!userId) return;
        socket.leave(userId.toString());
      });

      socket.on("joinRoom", (userId: string) => {
        if (!userId) return;
        socket.join(userId.toString());
      });

      socket.on("leaveRoom", (userId: string) => {
        if (!userId) return;
        socket.leave(userId.toString());
      });
    });
  }

  return io;
};

const getSocketIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized yet");
  }

  return io;
};

export { initSocket, getSocketIO };
