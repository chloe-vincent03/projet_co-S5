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

router.get('/threads', optionalAuth, (req, res) => {
  console.log("⚡ FETCHING THREADS...");
  const sql = `
    SELECT 
      m.id, m.title, m.description, m.type, m.url, m.created_at, m.user_id,
      u.username,
      (SELECT COUNT(*) FROM media WHERE parent_id = m.id) as children_count
    FROM media m
    LEFT JOIN users u ON m.user_id = u.user_id
    WHERE m.id IN (SELECT DISTINCT parent_id FROM media WHERE parent_id IS NOT NULL)
    ORDER BY m.created_at DESC
  `;

  db.all(sql, [], async (err, parents) => {
    if (err) {
      console.error("SQL ERROR in threads:", err);
      return res.status(500).json({ error: err.message });
    }
    console.log("Parents found:", parents ? parents.length : 0);

    // Pour chaque parent, on va chercher ses enfants
    // (Note: ce n'est pas le plus performant pour des milliers de lignes, mais ok pour commencer)
    const threads = [];

    for (const parent of parents) {
      const childrenSql = `
        SELECT id, title, type, url, created_at 
        FROM media 
        WHERE parent_id = ?
        ORDER BY created_at ASC
      `;

      const children = await new Promise((resolve, reject) => {
        db.all(childrenSql, [parent.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      threads.push({
        ...parent,
        children
      });
    }

    res.json(threads);
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

    // Récupérer les collaborations (enfants)
    const collabsSql = `
      SELECT id, title, type, url, created_at, user_id 
      FROM media 
      WHERE parent_id = ? 
      ORDER BY created_at ASC
    `;

    db.all(collabsSql, [id], (err, children) => {
      if (err) console.error("Erreur récup collabs:", err);

      // On ajoute la liste des collaborations à l'objet retourné
      media.collaborations = children || [];
      res.json(media);
    });
  });
});




// -----------------------------
// Ajouter un nouveau média avec tags
// -----------------------------
import multer from 'multer';
import mime from 'mime-types';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

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
    INSERT INTO media (title, description, type, url, content, user_id, parent_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  // Note: on utilise 'url' qui a été potentiellement mis à jour
  // parent_id peut être null ou un ID
  const parentId = req.body.parent_id || null;

  db.run(insertMediaSql, [title, description, type, url, content, userId, parentId], function (err) {
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

    // Suppression sur R2 si une URL existe
    if (row.url) {
      try {
        // On essaie d'extraire la clé "src/..." de l'URL
        // L'URL est souvent encodée (src%2F...), donc on decode d'abord
        const decodedUrl = decodeURIComponent(row.url);
        // On cherche la partie qui commence par 'src/'
        const match = decodedUrl.match(/(src\/.*)$/);

        if (match && match[1]) {
          const key = match[1];
          console.log("Suppression R2 pour la clé :", key);

          s3.send(new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: key
          })).catch(err => console.error("Erreur suppression R2 (async) :", err));
        }
      } catch (e) {
        console.error("Erreur extraction clé R2 :", e);
      }
    }

    db.run(`DELETE FROM media WHERE id = ?`, [mediaId], (err) => {
      if (err) return res.status(500).json({ error: "Erreur lors de la suppression" });
      res.json({ message: "Œuvre et fichier supprimés avec succès" });
    });
  });
});


// -----------------------------
// Modifier une œuvre
// -----------------------------

router.put('/:id', authenticateSession, upload.single('file'), async (req, res) => {
  const mediaId = req.params.id;
  const userId = req.user.user_id; // L'utilisateur connecté
  const { title, description, content, tags } = req.body;
  let url = req.body.url;
  let type = req.body.type; // On peut récupérer le type si envoyé, sinon on le déduit du fichier

  // 1. Vérifier si l'œuvre existe et appartient à l'utilisateur
  const checkSql = `SELECT user_id, url, type FROM media WHERE id = ?`;

  db.get(checkSql, [mediaId], async (err, row) => {
    if (err) return res.status(500).json({ error: "Erreur base de données" });
    if (!row) return res.status(404).json({ error: "Œuvre introuvable" });

    // Vérification droits (Propriétaire uniquement pour l'édition)
    if (row.user_id !== userId) {
      return res.status(403).json({ error: "Action non autorisée" });
    }

    // Gestion de l'upload si nouveau fichier
    if (req.file) {
      try {
        const originalName = req.file.originalname;
        const key = `src/${Date.now()}-${originalName.replace(/\s/g, '_')}`;
        const contentType = req.file.mimetype || mime.lookup(originalName) || 'application/octet-stream';

        await s3.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: req.file.buffer,
          ContentType: contentType
        }));

        // Nouvelle URL
        url = PUBLIC_BASE
          ? `${PUBLIC_BASE}/${encodeURIComponent(key)}`
          : `https://${BUCKET}.${ACCOUNT_ID}.r2.cloudflarestorage.com/${encodeURIComponent(key)}`;

        // Mise à jour du type en fonction du nouveau fichier
        // Simple détection basée sur le mimetype (image/png -> image)
        const mimeType = req.file.mimetype || '';
        if (mimeType.startsWith('image/')) type = 'image';
        else if (mimeType.startsWith('video/')) type = 'video';
        else if (mimeType.startsWith('audio/')) type = 'audio';
        else type = 'text'; // Fallback

      } catch (err) {
        console.error("Erreur R2:", err);
        return res.status(500).json({ error: "Erreur upload R2: " + err.message });
      }
    } else {
      // Si pas de fichier, on garde l'URL et le type existants s'ils ne sont pas fournis
      if (!url) url = row.url;
      if (!type) type = row.type;
    }

    // 2. Mise à jour de la table media
    const updateSql = `
      UPDATE media 
      SET title = ?, description = ?, content = ?, url = ?, type = ?
      WHERE id = ?
    `;

    db.run(updateSql, [title, description, content, url, type, mediaId], function (err) {
      if (err) return res.status(500).json({ error: "Erreur lors de la mise à jour" });

      // 3. Mise à jour des tags (Suppression des anciens -> Ajout des nouveaux)
      // On le fait dans une transaction implicite ou juste séquentiellement
      db.run(`DELETE FROM media_tags WHERE media_id = ?`, [mediaId], (err) => {
        if (err) console.error("Erreur suppression tags:", err);

        // Si pas de nouveaux tags, on s'arrête là
        let tagsArray = [];
        if (tags) {
          tagsArray = Array.isArray(tags) ? tags : tags.split(',');
        }
        const cleanedTags = tagsArray.map(t => t.trim()).filter(t => t.length > 0);

        if (cleanedTags.length === 0) {
          return res.json({ message: "Œuvre modifiée avec succès" });
        }

        let completed = 0;
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
            res.json({ message: "Œuvre modifiée avec succès" });
          }
        }
      });
    });
  });
});


export default router;
