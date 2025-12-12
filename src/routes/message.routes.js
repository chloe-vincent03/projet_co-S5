import express from "express";
import db from "../config/database.js";
import { authenticateSession } from "../middleware/auth.js";

const router = express.Router();
const DB = db.getDB();

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

export default router;
