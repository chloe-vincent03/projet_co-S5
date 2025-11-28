import express from 'express';
import sqlite3 from 'sqlite3';

const router = express.Router();
const db = new sqlite3.Database('./database.db'); // Vérifie le chemin

// -----------------------------
// Récupérer tous les médias
// -----------------------------
router.get('/', (req, res) => {
  const sql = `
    SELECT m.id, m.title, m.description, m.type, m.url, m.content, m.created_at,
           GROUP_CONCAT(t.name) AS tags
    FROM media m
    LEFT JOIN media_tags mt ON m.id = mt.media_id
    LEFT JOIN tags t ON mt.tag_id = t.id
    GROUP BY m.id
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    const medias = rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    }));
    res.json(medias);
  });
});

// -----------------------------
// Ajouter un nouveau média avec tags
// -----------------------------
router.post('/', (req, res) => {
  const { title, description, type, url, content, tags } = req.body;

  if (!title || !type) {
    return res.status(400).json({ error: "Titre et type obligatoires" });
  }

  const insertMediaSql = `
    INSERT INTO media (title, description, type, url, content)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(insertMediaSql, [title, description, type, url, content], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const mediaId = this.lastID;

    // Ajouter les tags comme avant...
    if (!tags || tags.length === 0) {
      return res.json({ message: "Œuvre ajoutée", id: mediaId });
    }

    let completed = 0;
    tags.forEach(tag => {
      if (!tag) return checkDone();
      db.run(`INSERT OR IGNORE INTO tags (name) VALUES (?)`, [tag], (err) => {
        if (err) console.error(err);
        db.get(`SELECT id FROM tags WHERE name = ?`, [tag], (err, row) => {
          if (!err && row) {
            db.run(`INSERT INTO media_tags (media_id, tag_id) VALUES (?, ?)`, [mediaId, row.id], checkDone);
          } else {
            checkDone();
          }
        });
      });
    });

    function checkDone() {
      completed++;
      if (completed === tags.length) {
        res.json({ message: "Œuvre ajoutée", id: mediaId });
      }
    }
  });
});


export default router;
