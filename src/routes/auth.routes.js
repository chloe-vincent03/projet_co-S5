import express from "express";
import bcrypt from "bcryptjs";
import db from "../config/database.js";
import { authenticateSession } from "../middleware/auth.js";
import multer from 'multer';
import mime from 'mime-types';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const router = express.Router();

// Configuration Multer & S3 (Cloudflare R2) - COPIED FROM MEDIA ROUTES
const upload = multer({ storage: multer.memoryStorage() });

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

const BUCKET = process.env.R2_BUCKET;
const PUBLIC_BASE = process.env.R2_PUBLIC_BASE;

router.get("/users", (req, res) => {
  const sql = "SELECT user_id, username, email, first_name, last_name, bio, is_admin FROM Users";

  db.getDB().all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json(rows);
  });
});


// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password, first_name, last_name, bio, is_private } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({
      success: false,
      message: "Missing fields",
    });

  try {
    const hashed = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO Users (username, email, password_hash, first_name, last_name, bio, is_private)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.getDB().run(
      sql,
      [username, email, hashed, first_name, last_name, bio || "", is_private ? 1 : 0],
      function (err) {
        if (err)
          return res
            .status(500)
            .json({ success: false, message: err.message });

        // 🔥 ICI : on crée la session comme dans /login
        const userSession = {
          user_id: this.lastID,
          username,
          email,
          bio: bio || "",
          is_admin: 0, // par défaut
          is_private: is_private ? 1 : 0,
        };

        req.session.user = userSession;

        return res.json({
          success: true,
          message: "User registered & logged in",
          user: userSession,
        });
      }
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// UPDATE PROFILE
router.put("/update-profile", authenticateSession, upload.single('avatar'), async (req, res) => {
  const { username, email, bio, first_name, last_name, is_private } = req.body;
  console.log("🔐 Backend received is_private:", is_private, "Type:", typeof is_private);

  // Convertir is_private en entier (gérer les strings "true"/"false" et les booléens)
  const isPrivateValue = (is_private === true || is_private === 'true' || is_private === '1' || is_private === 1) ? 1 : 0;
  console.log("🔐 Converted to:", isPrivateValue);

  let avatarUrl = null;

  // Gestion de l'upload de l'avatar
  if (req.file) {
    try {
      const originalName = req.file.originalname;
      const key = `profil/${Date.now()}-${originalName.replace(/\s/g, '_')}`;
      const contentType = req.file.mimetype || mime.lookup(originalName) || 'application/octet-stream';

      await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: contentType
      }));

      avatarUrl = PUBLIC_BASE
        ? `${PUBLIC_BASE}/${encodeURIComponent(key)}`
        : `https://${BUCKET}.${ACCOUNT_ID}.r2.cloudflarestorage.com/${encodeURIComponent(key)}`;

    } catch (err) {
      console.error("Erreur R2 Avatar:", err);
      return res.status(500).json({ error: "Erreur upload avatar: " + err.message });
    }
  }

  // Construction de la requête SQL dynamique
  let sql = `UPDATE Users SET username = ?, email = ?, bio = ?, first_name = ?, last_name = ?, is_private = ?`;
  const params = [username, email, bio, first_name, last_name, isPrivateValue];

  if (avatarUrl) {
    sql += `, avatar = ?`;
    params.push(avatarUrl);
  }

  sql += ` WHERE user_id = ?`;
  params.push(req.session.user.user_id);

  db.getDB().run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la mise à jour du profil",
        error: err.message,
      });
    }

    // Si le compte devient privé, rendre toutes les œuvres privées automatiquement
    if (isPrivateValue === 1) {
      const updateMediaSql = `
        UPDATE media 
        SET is_public = 0, allow_collaboration = 0 
        WHERE user_id = ?
      `;

      db.getDB().run(updateMediaSql, [req.session.user.user_id], (mediaErr) => {
        if (mediaErr) {
          console.error("⚠️ Erreur mise à jour médias:", mediaErr);
        } else {
          console.log("✅ Toutes les œuvres de l'utilisateur", req.session.user.user_id, "sont maintenant privées");
        }

        // On répond même en cas d'erreur sur les médias
        res.json({
          success: true,
          message: "Profil mis à jour",
          avatar: avatarUrl
        });
      });
    } else {
      res.json({
        success: true,
        message: "Profil mis à jour",
        avatar: avatarUrl
      });
    }
  }
  );
});


// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM Users WHERE email = ?";

  db.getDB().get(sql, [email], async (err, user) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
      is_private: user.is_private,
    };

    return res.json({
      success: true,
      message: "Logged in",
      user: req.session.user,
    });
  });
});

// CURRENT USER
router.get("/me", authenticateSession, (req, res) => {
  const sql = `
    SELECT user_id, username, email, first_name, last_name, is_admin, is_private, bio, avatar, created_at
    FROM Users
    WHERE user_id = ?
  `;

  db.getDB().get(sql, [req.user.user_id], (err, user) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });

    res.json({
      success: true,
      user,
    });
  });
});


// LOGOUT
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({
    success: true,
    message: "Logged out",
  });
});

// DELETE ACCOUNT
router.delete("/delete-account", authenticateSession, (req, res) => {
  const userId = req.session.user.user_id;

  const sql = "DELETE FROM Users WHERE user_id = ?";

  db.getDB().run(sql, [userId], function (err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression du compte",
      });
    }

    req.session.destroy(() => {
      res.json({
        success: true,
        message: "Compte supprimé",
      });
    });
  });
});

// DELETE USER (Admin only)
router.delete("/admin/users/:id", authenticateSession, (req, res) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ success: false, message: "Accès refusé" });
  }

  const userIdToDelete = req.params.id;

  // Empêcher de se supprimer soi-même via cette route (sécurité)
  if (parseInt(userIdToDelete) === req.user.user_id) {
    return res.status(400).json({ success: false, message: "Utilisez la suppression de compte standard pour votre propre compte." });
  }

  const sql = "DELETE FROM Users WHERE user_id = ?";

  db.getDB().run(sql, [userIdToDelete], function (err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de l'utilisateur",
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: "Utilisateur introuvable" });
    }

    res.json({
      success: true,
      message: "Utilisateur supprimé avec succès par l'administrateur",
    });
  });
});

// GET USER BY ID (profil public)
router.get("/users/:id", (req, res) => {
  const userId = req.params.id;

  const sql = `
    SELECT user_id, username, first_name, last_name, bio, avatar, created_at
    FROM Users
    WHERE user_id = ?
  `;

  db.getDB().get(sql, [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json(user);
  });
});

export default router;
