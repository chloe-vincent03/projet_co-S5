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
const database = db.getDB();


dotenv.config();

const app = express();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// -----------------------------
// CORS
// -----------------------------
app.use(
  cors({
    origin: true,
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
      secure: process.env.NODE_ENV === "production",
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
app.use(express.static(path.join(dirname, "../frontend/dist")));



const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});


io.on("connection", (socket) => {
  console.log("🟢 Client connecté :", socket.id);

  socket.on("register", (userId) => {
    socket.userId = userId;
    socket.join(`user:${userId}`);
  });

  socket.on("message", (msg) => {
    if (!msg.sender_id || !msg.receiver_id) return;

    // 💾 enregistrer le message en SQLite
    database.run(
      "INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, datetime('now'))",
      [msg.sender_id, msg.receiver_id, msg.content],
      (err) => {
        if (err) {
          console.error("Erreur insertion message:", err.message);
        }
      }
    );

    // 📤 envoyer au destinataire
    io.to(`user:${msg.receiver_id}`).emit("message", msg);

    // 📤 renvoyer à l'expéditeur
    io.to(`user:${msg.sender_id}`).emit("message", msg);
  });


  socket.on("disconnect", () => {
    console.log("🔴 Client déconnecté :", socket.id);
  });
});


app.get("*", (req, res) => {
  res.sendFile(
    path.join(dirname, "../frontend/dist/index.html")
  );
});

// -----------------------------
// START SERVER
// -----------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur + Socket.io sur http://localhost:${PORT}`);
  console.log("✅ Frontend served from ../frontend/dist");
});

