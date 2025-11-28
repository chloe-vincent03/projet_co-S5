import express from 'express';
import sqlite3 from 'sqlite3';

const router = express.Router();
const db = new sqlite3.Database('./database.db'); // Vérifie le chemin


// -----------------------------
// Récupérer tous les médias (pour la galerie) avec tags + utilisateur
// -----------------------------
router.get('/', (req, res) => {
  const sql = `
    SELECT m.id, m.title, m.description, m.type, m.url, m.content, m.created_at,
           GROUP_CONCAT(t.name) AS tags,
           u.username, u.first_name, u.last_name
    FROM media m
    LEFT JOIN media_tags mt ON m.id = mt.media_id
    LEFT JOIN tags t ON mt.tag_id = t.id
    LEFT JOIN Users u ON m.user_id = u.user_id
    GROUP BY m.id
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    const medias = rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    }));

    res.json(medias);
  });
});


// -----------------------------
// Récupérer un média avec tags + utilisateur
// -----------------------------
router.get('/:id', (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT m.id, m.title, m.description, m.type, m.url, m.content, m.created_at,
           GROUP_CONCAT(t.name) AS tags,
           u.username, u.first_name, u.last_name
    FROM media m
    LEFT JOIN media_tags mt ON m.id = mt.media_id
    LEFT JOIN tags t ON mt.tag_id = t.id
    LEFT JOIN Users u ON m.user_id = u.user_id
    WHERE m.id = ?
    GROUP BY m.id
  `;

  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (!row) return res.status(404).json({ error: 'Œuvre non trouvée' });

    const media = {
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    };

    res.json(media);
  });
});


// -----------------------------
// Ajouter un nouveau média avec tags et user_id
// -----------------------------
router.post('/', (req, res) => {
  const { title, description, type, url, content, tags, user_id } = req.body;

  if (!title || !type || !user_id) {
    return res.status(400).json({ error: "Titre, type et user_id obligatoires" });
  }

  const sql = `
    INSERT INTO media (title, description, type, url, content, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [title, description, type, url, content, user_id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const mediaId = this.lastID;

    // Ajout des tags
    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        // 1 : insérer le tag s’il n'existe pas
        db.run(`INSERT OR IGNORE INTO tags (name) VALUES (?)`, [tag]);
        
        // 2 : lier le tag à l’œuvre
        db.get(`SELECT id FROM tags WHERE name = ?`, [tag], (err, row) => {
          if (!err && row) {
            db.run(
              `INSERT INTO media_tags (media_id, tag_id) VALUES (?, ?)`,
              [mediaId, row.id]
            );
          }
        });
      });
    }

    res.json({ message: "Œuvre ajoutée", id: mediaId });
  });
});


export default router;
