-- Supprime la table si elle existe déjà
DROP TABLE IF EXISTS media;

-- Crée la table avec les bonnes colonnes
CREATE TABLE media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
