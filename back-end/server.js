import express from "express";
import http from "http"; // ✅ ADD THIS - You were missing this import
import dotenv from "dotenv";
import cors from "cors";
import jwt from "jsonwebtoken"; // ✅ ADD THIS - For socket authentication
import connectDB from "./Database/Connetion.js";
import adminRoutes from "./Routes/AdminRoutes.js";
import studentroutes from "./Routes/StudentRoutes.js";
import mentorroutes from "./Routes/MentorRoutes.js";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());

// Connect to database
connectDB();

// ✅ CREATE HTTP SERVER FIRST (before Socket.IO)
const server = http.createServer(app);

// ✅ FIX: Initialize Socket.IO with the server, not Server class
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Make io accessible to routes
app.set('io', io);

// Routes - MUST come after app.set('io', io)
app.use("/admin", adminRoutes);
app.use("/student", studentroutes);
app.use("/mentor", mentorroutes);

// ✅ Socket.IO Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    console.log('❌ Socket connection rejected: No token');
    return next(new Error('Authentication error'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    next();
  } catch (err) {
    console.log('❌ Socket connection rejected: Invalid token');
    next(new Error('Authentication error'));
  }
});

// ✅ Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id, "- User:", socket.userId, "- Role:", socket.userRole);

  // Automatically join user to their personal room
  socket.join(socket.userId);
  console.log(`👤 ${socket.userRole} joined room: ${socket.userId}`);

  // Optional: Legacy support for manual join
  socket.on("join", ({ userId, role }) => {
    socket.join(userId);
    console.log(`👤 ${role} manually joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    port: PORT,
    socketio: 'Running'
  });
});

// ✅ FIX: Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
  console.log(`🌐 CORS enabled for: http://localhost:5173, http://localhost:5174`);
});

export default app;