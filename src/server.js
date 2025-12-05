import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mediaRoutes from "./routes/media.routes.js";
import authRoutes from "./routes/auth.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";

dotenv.config();

const app = express();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// -----------------------------
// Middlewares
// -----------------------------
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// Session
// -----------------------------
app.use(session({
  secret: process.env.SESSION_SECRET || "super secret key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 jour
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  }
}));

// -----------------------------
// Static folder
// -----------------------------
app.use(express.static(path.join(dirname, "public")));

// -----------------------------
// Routes
// -----------------------------
app.use("/api/media", mediaRoutes);
app.use("/api/auth", authRoutes);

// -----------------------------
// Lancement du serveur
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
