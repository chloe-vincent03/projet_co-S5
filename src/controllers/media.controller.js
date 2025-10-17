// src/controllers/media.controller.js
const sqlite3 = require("sqlite3").verbose();
const dbPath = process.env.DB_PATH || "./database.db";

exports.getAllMedia = (req, res) => {
  const db = new sqlite3.Database(dbPath);
  db.all("SELECT * FROM media", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
    db.close();
  });
};
