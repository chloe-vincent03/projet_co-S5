import express from "express";
import { authenticateSession } from "../middleware/auth.js";
import db from "../config/database.js";

const router = express.Router();
const DB = db.getDB();

/**
 * 🔔 Notifications de likes
 */
router.get("/likes", authenticateSession, (req, res) => {
  const userId = req.user.user_id;

  const sql = `
    SELECT
      l.id AS like_id,
      l.created_at,
      u.user_id AS from_user_id,
      u.username,
      u.avatar,
      m.id AS media_id,
      m.title,
      m.type
    FROM likes l
    JOIN media m ON m.id = l.media_id
    JOIN users u ON u.user_id = l.user_id
    WHERE m.user_id = ?
      AND l.user_id != ?
    ORDER BY datetime(l.created_at) DESC
  `;

  DB.all(sql, [userId, userId], (err, rows) => {
    if (err) {
      console.error("Erreur notifications likes:", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    res.json(rows);
  });
});

/**
 * 🔴 Nombre de notifications non lues
 */
router.get("/unread-count", authenticateSession, (req, res) => {
  const userId = req.user.user_id;

  DB.get(
    `
    SELECT COUNT(*) as count
    FROM notifications
    WHERE user_id = ? AND is_read = 0
    `,
    [userId],
    (err, row) => {
      if (err) {
        console.error("Erreur unread notifications:", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      res.json({ count: row.count });
    }
  );
});

/**
 * ✅ Marquer toutes les notifications comme lues
 */
router.post("/mark-read", authenticateSession, (req, res) => {
  const userId = req.user.user_id;

  DB.run(
    `
    UPDATE notifications
    SET is_read = 1
    WHERE user_id = ?
    `,
    [userId],
    (err) => {
      if (err) {
        console.error("Erreur mark-read:", err);
        return res.status(500).json({ error: "Erreur serveur" });
      }

      res.json({ success: true });
    }
  );
});

export default router;
