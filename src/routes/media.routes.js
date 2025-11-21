import express from 'express';
import sqlite3 from 'sqlite3';

const router = express.Router();
const db = new sqlite3.Database('./database.db'); // Assure-toi que le chemin est correct

// -----------------------------
// Récupérer tous les médias (pour la galerie)
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
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    // Transformer la chaîne de tags en tableau
    const medias = rows.map(row => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    }));

    res.json(medias);
  });
});

// -----------------------------
// Récupérer un média avec ses tags
// -----------------------------
router.get('/:id', (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT m.id, m.title, m.description, m.type, m.url, m.content, m.created_at,
           GROUP_CONCAT(t.name) AS tags
    FROM media m
    LEFT JOIN media_tags mt ON m.id = mt.media_id
    LEFT JOIN tags t ON mt.tag_id = t.id
    WHERE m.id = ?
    GROUP BY m.id
  `;

  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (!row) return res.status(404).json({ error: 'Oeuvre non trouvée' });

    const media = {
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    };

    res.json(media);
  });
});

export default router;
