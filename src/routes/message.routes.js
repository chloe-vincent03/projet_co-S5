import express from "express";
import db from "../config/database.js";
import { authenticateSession } from "../middleware/auth.js";

const router = express.Router();
const DB = db.getDB();

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
