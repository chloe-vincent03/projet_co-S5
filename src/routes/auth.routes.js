import express from "express";
import bcrypt from "bcryptjs";
import db from "../config/database.js";
import { authenticateSession } from "../middleware/auth.js";

const router = express.Router();

router.get("/users", (req, res) => {
  const sql = "SELECT user_id, username, email, is_admin FROM Users";

  db.getDB().all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    res.json(rows);
  });
});

// REGISTER
router.post("/register", async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({
      success: false,
      message: "Missing fields",
    });

  try {
    const hashed = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO Users (username, email, password_hash, first_name, last_name)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.getDB().run(
      sql,
      [username, email, hashed, first_name, last_name],
      function (err) {
        if (err)
          return res.status(500).json({ success: false, message: err.message });

        return res.json({
          success: true,
          message: "User registered",
          user_id: this.lastID,
        });
      }
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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
  res.json({
    success: true,
    user: req.user,
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

router.delete("/delete-account", authenticateSession, (req, res) => {
  const userId = req.user.user_id;
  
  const sql = "DELETE FROM Users WHERE user_id = ?";

  db.getDB().run(sql, [userId], function (err) {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    req.session.destroy(() => {
      res.json({
        success: true,
        message: "Compte supprimé avec succès.",
      });
    });
  });
});

export default router;
