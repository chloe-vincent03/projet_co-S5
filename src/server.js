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

app.use(
  cors({
    origin: "http://localhost:5173", // ton frontend Vue
    credentials: true, // pour envoyer les cookies/session
  })
);
// Pour servir les fichiers HTML / JS / images
app.use(express.static(path.join(__dirname, 'public')));

// Pour lire le JSON dans les requêtes POST (si besoin plus tard)
app.use(express.json());

// Routes API
app.use('/api/media', mediaRoutes);


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// 🔥 SESSION CONFIGURATION
// -----------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super secret key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Static folder
app.use(express.static(path.join(dirname, "public")));



// Routes
app.use("/api/media", mediaRoutes);
app.use("/api/auth", authRoutes);

app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production (HTTPS)
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Serveur lancé sur http://localhost:${PORT}`)
);
