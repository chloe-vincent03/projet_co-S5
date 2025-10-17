// src/config/database.js
const sqlite3 = require("sqlite3");
const fs = require("fs").promises;

async function initDB() {
  const dbPath = process.env.DB_PATH || "./database.db";
  const db = new sqlite3.Database(dbPath);

  try {
    const tables = await fs.readFile("./create_tables.sql", "utf8");
    db.exec(tables, (err) => {
      if (err) console.error("Erreur création tables:", err.message);
      else console.log("Tables créées avec succès.");
    });

    const data = await fs.readFile("./insert_data.sql", "utf8");
    db.exec(data, (err) => {
      if (err) console.error("Erreur insertion données:", err.message);
      else console.log("Données insérées avec succès.");
    });
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base:", error);
  } finally {
    db.close();
  }
}

module.exports = initDB;
