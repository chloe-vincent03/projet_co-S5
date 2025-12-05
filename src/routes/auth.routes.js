import express from "express";
import bcrypt from "bcryptjs";
import db from "../config/database.js";
import { authenticateSession } from "../middleware/auth.js";

const router = express.Router();

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
  const { username, email, password, first_name, last_name, bio } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({
      success: false,
      message: "Missing fields",
    });

  try {
    const hashed = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO Users (username, email, password_hash, first_name, last_name, bio)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.getDB().run(
      sql,
      [username, email, hashed, first_name, last_name, bio || ""],
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
router.put("/update-profile", authenticateSession, (req, res) => {
  const { username, email, bio, first_name, last_name } = req.body;

  const sql = `
    UPDATE Users 
    SET username = ?, email = ?, bio = ?, first_name = ?, last_name = ?
    WHERE user_id = ?
  `;

  db.getDB().run(
    sql,
    [username, email, bio, first_name, last_name, req.session.user.user_id],
    function (err) {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Erreur lors de la mise à jour du profil",
          error: err.message,
        });
      }

      res.json({
        success: true,
        message: "Profil mis à jour",
      });
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
    SELECT user_id, username, email, first_name, last_name, is_admin, bio, avatar, created_at
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


export default router;
