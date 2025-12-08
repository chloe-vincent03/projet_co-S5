import express from 'express';
import sqlite3 from 'sqlite3';
import { authenticateSession, optionalAuth } from "../middleware/auth.js";

const router = express.Router();
const db = new sqlite3.Database('./database.db'); // Vérifie le chemin

// -----------------------------
// Récupérer tous les médias
// -----------------------------
router.get("/", optionalAuth, (req, res) => {
    console.log("🔥 req.user dans GET /api/media =", req.user);

  const sql = `
SELECT 
  m.id, m.title, m.description, m.type, m.url, m.content, m.created_at,
  GROUP_CONCAT(t.name) AS tags,
(SELECT 1 FROM likes WHERE user_id = ? AND media_id = m.id) AS is_liked,
(SELECT COUNT(*) FROM likes WHERE media_id = m.id) AS likes_count
FROM media m
LEFT JOIN media_tags mt ON m.id = mt.media_id
LEFT JOIN tags t ON mt.tag_id = t.id
GROUP BY m.id

  `;
  db.all(sql, [req.user?.user_id || null], (err, rows) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });
    const medias = rows.map((row) => ({
      ...row,
      tags: row.tags ? row.tags.split(",") : [],
      is_liked: !!row.is_liked, // <--------- IMPORTANT
      likes_count: row.likes_count ?? 0,
    }));

    res.json(medias);
  });
});

router.get('/:id', optionalAuth, (req, res) => {
  const id = req.params.id;

  const sql = `
    SELECT 
      m.id, m.title, m.description, m.type, m.url, m.content, m.created_at,
      m.user_id,
      u.username, u.first_name, u.last_name,
      GROUP_CONCAT(t.name) AS tags
    FROM media m
    LEFT JOIN users u ON m.user_id = u.user_id
    LEFT JOIN media_tags mt ON m.id = mt.media_id
    LEFT JOIN tags t ON mt.tag_id = t.id
    WHERE m.id = ?
    GROUP BY m.id
  `;

  db.get(sql, [id], (err, row) => {
    if (err) {
      console.error("SQL ERROR:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }
    if (!row) return res.status(404).json({ error: "Média introuvable" });

    const media = {
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    };

    res.json(media);
  });
});




// -----------------------------
// Ajouter un nouveau média avec tags
// -----------------------------
router.post('/', optionalAuth, (req, res) => {
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

// GET all media for a specific user
router.get("/user/:id", optionalAuth, (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT id, title, url, type, description, created_at
    FROM media
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

db.all(sql, [userId], (err, rows) => {
  if (err)
    return res.status(500).json({ success: false, message: err.message });

  res.json(rows);
});
});




// Like une œuvre
router.post("/:id/like", authenticateSession, (req, res) => {
  const mediaId = req.params.id;
  const userId = req.user.user_id;

  const sql = `
    INSERT INTO likes (user_id, media_id)
    VALUES (?, ?)
  `;

  db.run(sql, [userId, mediaId], function (err) {
    if (err) {
      return res.status(409).json({ error: "Déjà liké" });
    }

    res.json({ message: "Like ajouté" });
  });
});


// Unlike une œuvre
router.delete("/:id/like", authenticateSession, (req, res) => {
  const mediaId = req.params.id;
  const userId = req.user.user_id;

  const sql = `
    DELETE FROM likes
    WHERE user_id = ? AND media_id = ?
  `;

  db.run(sql, [userId, mediaId], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.json({ message: "Like supprimé" });
  });
});


export default router;
