import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mediaRoutes from "./routes/media.routes.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import bookRoutes from "./routes/book.routes.js";
import notificationsRouter from "./routes/notification.routes.js";

import db from "./config/database.js"; // pour enregistrer les messages

dotenv.config();

const app = express();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// -----------------------------
// CORS
// -----------------------------
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());


// -----------------------------
// JSON PARSING
// -----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// 🔥 SESSION — doit être AVANT les routes
// -----------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // mettre true en prod (HTTPS)
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// -----------------------------
// ROUTES API
// -----------------------------
app.use("/api/media", mediaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/notification", notificationsRouter);


// -----------------------------
// STATIC FILES
// -----------------------------
app.use(express.static(path.join(dirname, "public")));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});


io.on("connection", (socket) => {
  console.log("🟢 Client connecté :", socket.id);

  //  Le client envoie son user_id pour rejoindre sa "room"
  socket.on("register", (userId) => {
    socket.join(`user:${userId}`);
  });

  //  Le client envoie un message
socket.on("message", (msg) => {
  this.lastMessage = msg;

  const userStore = useUserStore();
  const myId = userStore.user?.user_id;

  // ✅ SI JE REÇOIS UN MESSAGE
  if (msg.receiver_id === myId) {
    // 🔴 incrément badge messages DIRECTEMENT
    userStore.unreadMessagesCount++;
  }

  // ✅ afficher dans le chat actif
  if (
    msg.sender_id === this.receiverId ||
    msg.receiver_id === this.receiverId
  ) {
    this.messages.push(msg);
  }
});

  socket.on("disconnect", () => {
    console.log("client déconnecté :", socket.id);
  });
});



// -----------------------------
// START SERVER
// -----------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur + Socket.io sur http://localhost:${PORT}`);
});
