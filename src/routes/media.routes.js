import 'dotenv/config';
import express from 'express';
import sqlite3 from 'sqlite3';
import { authenticateSession, optionalAuth } from "../middleware/auth.js";

const router = express.Router();
const db = new sqlite3.Database('./database.db');

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
import multer from 'multer';
import mime from 'mime-types';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configuration Multer & S3 (Cloudflare R2)
const upload = multer({ storage: multer.memoryStorage() });

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

console.log("DEBUG R2 CONFIG:");
console.log("ENDPOINT:", process.env.R2_ENDPOINT);
console.log("ACCESS_KEY:", process.env.R2_ACCESS_KEY_ID ? "****" + process.env.R2_ACCESS_KEY_ID.slice(-4) : "UNDEFINED");
console.log("SECRET_KEY:", process.env.R2_SECRET_ACCESS_KEY ? "SET" : "UNDEFINED");
console.log("BUCKET:", process.env.R2_BUCKET);

const BUCKET = process.env.R2_BUCKET;
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const PUBLIC_BASE = process.env.R2_PUBLIC_BASE;

// -----------------------------
// Ajouter un nouveau média avec tags (et upload fichier optionnel)
// -----------------------------
router.post('/', authenticateSession, upload.single('file'), async (req, res) => {
  // Extraction des données classiques
  const { title, description, type, content, tags } = req.body;
  // L'URL peut venir soit du champ texte (si pas d'upload), soit sera générée
  let url = req.body.url || '';
  const userId = req.user.user_id; // Récupéré via authenticateSession

  if (!title) {
    return res.status(400).json({ error: "Titre obligatoire" });
  }

  // Si un fichier est uploadé, on l'envoie sur R2
  if (req.file) {
    try {
      const originalName = req.file.originalname;
      // Modification du dossier de destination : uploads -> src
      const key = `src/${Date.now()}-${originalName.replace(/\s/g, '_')}`;
      const contentType = req.file.mimetype || mime.lookup(originalName) || 'application/octet-stream';

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: contentType
      }));

      // Construction de l'URL finale
      url = PUBLIC_BASE
        ? `${PUBLIC_BASE}/${encodeURIComponent(key)}`
        : `https://${BUCKET}.${ACCOUNT_ID}.r2.cloudflarestorage.com/${encodeURIComponent(key)}`;

    } catch (err) {
      console.error("Erreur R2:", err);
      // Retourne l'erreur exacte pour le débuggage
      return res.status(500).json({ error: "Erreur upload R2: " + err.message });
    }
  }

  // Insertion en base avec user_id
  const insertMediaSql = `
    INSERT INTO media (title, description, type, url, content, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  // Note: on utilise 'url' qui a été potentiellement mis à jour
  db.run(insertMediaSql, [title, description, type, url, content, userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const mediaId = this.lastID;

    // Gestion des tags
    let tagsArray = [];
    if (tags) {
      // Si tags est une chaîne "tag1, tag2", on split. Si c'est déjà un array (rare avec FormData mais possible), on garde.
      tagsArray = Array.isArray(tags) ? tags : tags.split(',');
    }

    if (!tagsArray || tagsArray.length === 0) {
      return res.json({ message: "Œuvre ajoutée", id: mediaId, url });
    }

    let completed = 0;
    // Nettoyage et filtrage des tags vides
    const cleanedTags = tagsArray.map(t => t.trim()).filter(t => t.length > 0);

    if (cleanedTags.length === 0) {
      return res.json({ message: "Œuvre ajoutée", id: mediaId, url });
    }

    cleanedTags.forEach(tag => {
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
      if (completed === cleanedTags.length) {
        res.json({ message: "Œuvre ajoutée", id: mediaId, url });
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


// -----------------------------
// Supprimer une œuvre
// -----------------------------
router.delete('/:id', authenticateSession, (req, res) => {
  const mediaId = req.params.id;
  const userId = req.user.user_id;
  const isAdmin = req.user.is_admin;

  // 1. Vérifier si l'œuvre existe et appartient à l'utilisateur
  const checkSql = `SELECT user_id, url FROM media WHERE id = ?`;

  db.get(checkSql, [mediaId], (err, row) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    if (!row) return res.status(404).json({ error: "Œuvre introuvable" });

    // Vérification droits (Propriétaire OU Admin)
    if (row.user_id !== userId && !isAdmin) {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    // 2. Supprimer de la base
    // Note: Le "ON DELETE CASCADE" dans media_tags s'occupe des liens, 
    // mais pour 'likes' il faut vérifier si on a mis une cascade ou non.
    // Supposons que SQLite gère les FK si activé, sinon on fait simple.

    // (Optionnel) Ici, on pourrait aussi supprimer le fichier sur R2 avec s3.send(new DeleteObjectCommand(...))
    // Pour l'instant on supprime juste l'entrée DB comme demandé.

    db.run(`DELETE FROM media WHERE id = ?`, [mediaId], (err) => {
      if (err) return res.status(500).json({ error: "Erreur lors de la suppression" });
      res.json({ message: "Œuvre supprimée avec succès" });
    });
  });
});


export default router;
