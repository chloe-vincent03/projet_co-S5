// src/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const initDB = require("./config/database");
const mediaRoutes = require("./routes/media.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Routes principales
app.use("/api/media", mediaRoutes);

// Lancement du serveur
app.listen(PORT, async () => {
  await initDB(); // Initialise ta base de données SQLite
  console.log(`Serveur en ligne sur http://localhost:${PORT}`);
});
