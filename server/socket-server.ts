import http from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";

const PORT = process.env.SOCKET_PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/job-service-bd";

// MongoDB connection
let isDbConnected = false;
async function initDB() {
  if (isDbConnected) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isDbConnected = true;
    console.log("🟢 [Socket.io] Connected to MongoDB database.");
  } catch (err) {
    console.error("🔴 [Socket.io] MongoDB connection error:", err);
  }
}

// Minimal inline schema to avoid module resolution discrepancies
const MessageSchema = new mongoose.Schema(
  {
    serviceRequest: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["customer", "provider", "admin"], required: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String, default: "" },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const MessageModel = mongoose.models.Message || mongoose.model("Message", MessageSchema);

const server = http.createServer((req, res) => {
  // Simple health check and internal broadcast bridge
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
    return;
  }

  // HTTP broadcast endpoint for REST API fallback
  if (req.url === "/broadcast" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body);
        if (payload.requestId && payload.message) {
          io.to(`room_${payload.requestId}`).emit("receive_message", payload.message);
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid broadcast payload" }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

io.on("connection", (socket) => {
  console.log(`⚡ [Socket.io] Client connected: ${socket.id}`);

  // Join private service request chat room
  socket.on("join_room", ({ requestId, userRole, userName }) => {
    if (!requestId) return;
    const roomName = `room_${requestId}`;
    socket.join(roomName);
    console.log(`👤 ${userName || "User"} (${userRole || "client"}) joined ${roomName}`);
    socket.emit("joined_room_ack", { room: roomName, status: "connected" });
  });

  // Leave room
  socket.on("leave_room", ({ requestId }) => {
    if (!requestId) return;
    const roomName = `room_${requestId}`;
    socket.leave(roomName);
  });

  // Send message
  socket.on("send_message", async (data, callback) => {
    try {
      const { requestId, senderId, senderName, senderRole, senderAvatar, content } = data;
      if (!requestId || !content?.trim() || !senderId) {
        if (callback) callback({ success: false, error: "Missing required fields" });
        return;
      }

      await initDB();

      const createdMessage = await MessageModel.create({
        serviceRequest: requestId,
        sender: senderId,
        senderRole: senderRole || "customer",
        senderName: senderName || "User",
        senderAvatar: senderAvatar || "",
        content: content.trim(),
        isRead: false,
      });

      const messagePayload = {
        _id: createdMessage._id.toString(),
        serviceRequest: requestId,
        sender: senderId,
        senderRole,
        senderName,
        senderAvatar,
        content: content.trim(),
        isRead: false,
        createdAt: createdMessage.createdAt,
      };

      // Broadcast to all participants in this service request room
      io.to(`room_${requestId}`).emit("receive_message", messagePayload);

      if (callback) callback({ success: true, message: messagePayload });
    } catch (error) {
      console.error("Socket send_message error:", error);
      if (callback) callback({ success: false, error: "Failed to send message" });
    }
  });

  // Live typing indicator
  socket.on("typing", ({ requestId, userName, userRole, isTyping }) => {
    if (!requestId) return;
    socket.to(`room_${requestId}`).emit("user_typing", {
      requestId,
      userName,
      userRole,
      isTyping,
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(`🔌 [Socket.io] Client disconnected (${socket.id}): ${reason}`);
  });
});

initDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 [Socket.io] Real-time messaging server active on http://localhost:${PORT}`);
  });
});
