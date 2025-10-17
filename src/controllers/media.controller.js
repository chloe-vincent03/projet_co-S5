const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../../database.db");

function getAllMedia(req, res) {
  const db = new sqlite3.Database(dbPath);
  db.all("SELECT * FROM media", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
    db.close();
  });
}

module.exports = { getAllMedia };
