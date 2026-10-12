import { io } from "socket.io-client";
import mongoose from "mongoose";

async function runTest() {
  console.log("Connecting clients to http://localhost:3001...");
  const customerSocket = io("http://localhost:3001", { reconnection: false, timeout: 5000 });
  const providerSocket = io("http://localhost:3001", { reconnection: false, timeout: 5000 });

  await new Promise<void>((resolve, reject) => {
    let connectedCount = 0;
    const check = () => {
      connectedCount++;
      if (connectedCount === 2) resolve();
    };
    customerSocket.on("connect", () => {
      console.log("Customer socket connected:", customerSocket.id);
      check();
    });
    providerSocket.on("connect", () => {
      console.log("Provider socket connected:", providerSocket.id);
      check();
    });
    setTimeout(() => reject(new Error("Connection timeout")), 4000);
  });

  const testRequestId = new mongoose.Types.ObjectId().toString();
  const testCustomerId = new mongoose.Types.ObjectId().toString();
  const testProviderId = new mongoose.Types.ObjectId().toString();

  // 1. Both join room
  customerSocket.emit("join_room", { requestId: testRequestId, userRole: "customer", userName: "Tarek (Client)" });
  providerSocket.emit("join_room", { requestId: testRequestId, userRole: "provider", userName: "Rafiqul (Provider)" });

  await new Promise((r) => setTimeout(r, 600));

  // 2. Typing test
  console.log("Testing live typing indicator...");
  const typingPromise = new Promise<void>((resolve) => {
    customerSocket.on("user_typing", (data) => {
      console.log("Customer received typing event:", data);
      if (data.isTyping && data.userName === "Rafiqul (Provider)") {
        resolve();
      }
    });
  });

  providerSocket.emit("typing", {
    requestId: testRequestId,
    userName: "Rafiqul (Provider)",
    userRole: "provider",
    isTyping: true,
  });

  await typingPromise;
  console.log("✓ Typing indicator received in real-time!");

  // 3. Client sends message -> Provider receives
  console.log("Testing Client to Provider real-time message...");
  const msgPromise = new Promise<void>((resolve) => {
    providerSocket.on("receive_message", (msg) => {
      console.log("Provider received message:", msg);
      if (msg.content === "ভাই, পৌঁছাতে কত সময় লাগবে?") {
        resolve();
      }
    });
  });

  customerSocket.emit("send_message", {
    requestId: testRequestId,
    senderId: testCustomerId,
    senderName: "Tarek (Client)",
    senderRole: "customer",
    content: "ভাই, পৌঁছাতে কত সময় লাগবে?",
  });

  await msgPromise;
  console.log("✓ Client message broadcasted and received by Provider!");

  // 4. Provider replies -> Client receives
  console.log("Testing Provider to Client real-time reply...");
  const replyPromise = new Promise<void>((resolve) => {
    customerSocket.on("receive_message", (msg) => {
      console.log("Customer received reply:", msg);
      if (msg.content === "আমি ১০ মিনিটের মধ্যে পৌঁছে যাচ্ছি ভাই।") {
        resolve();
      }
    });
  });

  providerSocket.emit("send_message", {
    requestId: testRequestId,
    senderId: testProviderId,
    senderName: "Rafiqul (Provider)",
    senderRole: "provider",
    content: "আমি ১০ মিনিটের মধ্যে পৌঁছে যাচ্ছি ভাই।",
  });

  await replyPromise;
  console.log("✓ Provider reply broadcasted and received by Client!");

  customerSocket.disconnect();
  providerSocket.disconnect();
  console.log("\n==========================================");
  console.log("🎉 ALL REAL-TIME SOCKET.IO TESTS PASSED! 🎉");
  console.log("==========================================");
  process.exit(0);
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
