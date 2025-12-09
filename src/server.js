import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mediaRoutes from "./routes/media.routes.js";
import authRoutes from "./routes/auth.routes.js";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import cookieParser from "cookie-parser";


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

// -----------------------------
// STATIC FILES
// -----------------------------
app.use(express.static(path.join(dirname, "public")));

// -----------------------------
// START SERVER
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
