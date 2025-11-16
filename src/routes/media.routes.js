import express from 'express';
import sqlite3 from 'sqlite3';
const router = express.Router();
const db = new sqlite3.Database('./database.db'); // Assure-toi que le chemin est correct

// Récupérer tous les médias (pour la galerie)
router.get('/', (req, res) => {
  db.all('SELECT * FROM media', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Récupérer un média avec ses tags
router.get('/:id', (req, res) => {
  const id = req.params.id;

  db.get(`
    SELECT m.id, m.title, m.description, m.image_url, m.created_at,
           GROUP_CONCAT(t.name) AS tags
    FROM media m
    LEFT JOIN media_tags mt ON m.id = mt.media_id
    LEFT JOIN tags t ON mt.tag_id = t.id
    WHERE m.id = ?
    GROUP BY m.id
  `, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Oeuvre non trouvée" });

    // Transformer la chaîne de tags en tableau
    const media = {
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    };

    res.json(media);
  });
});

export default router;
