import express from "express";
import db from "../config/database.js";
import { authenticateSession } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import multer from "multer";
import path from "path";



const router = express.Router();
const DB = db.getDB();

router.get("/unread-count", authenticateSession, (req, res) => {
  const userId = req.user.user_id;

  DB.get(
    `SELECT COUNT(*) as count
     FROM Messages
     WHERE receiver_id = ? AND is_read = 0`,
    [userId],
    (err, row) => {
      if (err) return res.status(500).json({ error: "Erreur serveur" });
      res.json({ count: row.count });
    }
  );
});


// ✅ 1️⃣ CONVERSATIONS EN PREMIER
router.get("/conversations", authenticateSession, (req, res) => {
  const userId = req.user.user_id;

  const sql = `
    SELECT
      u.user_id,
      u.username,
      u.avatar,
      m.content AS last_message,
      m.created_at AS last_date
    FROM Messages m
    JOIN users u
      ON u.user_id = CASE
        WHEN m.sender_id = ? THEN m.receiver_id
        ELSE m.sender_id
      END
    WHERE m.id IN (
      SELECT MAX(id)
      FROM Messages
      WHERE sender_id = ? OR receiver_id = ?
      GROUP BY
        CASE
          WHEN sender_id = ? THEN receiver_id
          ELSE sender_id
        END
    )
    ORDER BY datetime(m.created_at) DESC
  `;

  DB.all(sql, [userId, userId, userId, userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post("/mark-read/:otherUserId", authenticateSession, (req, res) => {
  const me = req.user.user_id;
  const other = req.params.otherUserId;

  const sql = `
    UPDATE Messages
    SET is_read = 1
    WHERE receiver_id = ?
      AND sender_id = ?
      AND is_read = 0
  `;

  DB.run(sql, [me, other], function (err) {
    if (err) {
      console.error("Erreur mark-read:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    res.json({ success: true });
  });
});



// ✅ 2️⃣ ENSUITE seulement la route dynamique
router.get("/:otherUserId", authenticateSession, (req, res) => {
  const me = req.user.user_id;
  const other = req.params.otherUserId;

  DB.all(
    `
    SELECT * FROM Messages
    WHERE (sender_id = ? AND receiver_id = ?)
       OR (sender_id = ? AND receiver_id = ?)
    ORDER BY datetime(created_at)
    `,
    [me, other, other, me],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});



router.post(
  "/image",
  authenticateSession,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Aucune image reçue" });
    }

    res.json({
      image_url: `/uploads/chat/${req.file.filename}`,
    });
  }
);

// ✅ Marquer les messages comme lus pour une conversation




export default router;
