import { io, Socket } from "socket.io-client";

let socketInstance: Socket | null = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

export function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
      timeout: 10000,
    });

    socketInstance.on("connect", () => {
      console.log("⚡ [Socket Client] Connected to real-time chat server.");
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("⚠️ [Socket Client] Connection warning:", err.message);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("🔌 [Socket Client] Disconnected:", reason);
    });
  }

  return socketInstance;
}
