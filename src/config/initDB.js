import { dbPromise } from './database.js';

export async function initDb() {
  const db = await dbPromise;

  // 1. Création de la table si elle n'existe pas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 2. Vérify si la table est vide
  const row = await db.get("SELECT COUNT(*) AS count FROM media");

  if (row.count === 0) {
    console.log("➡️ Insertion de données initiales…");

    await db.run(`
      INSERT INTO media (title, description, image_url, created_at)
      VALUES (?, ?, ?, ?)
    `, [
      "Première œuvre",
      "Description de test",
      "https://pub-498e51fcc7ba483a8fee1aecfaa3d006.r2.dev/exemple.jpg",
      new Date().toISOString()
    ]);
  } else {
    console.log("➡️ Données déjà présentes, aucune insertion.");
  }
}