/**
 * Authentication middleware using sessions
 * Checks if user is logged in via session
 */
export function authenticateSession(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Please login to continue.",
    });
  }

  req.user = req.session.user;
  next();
}

/**
 * Optional authentication middleware
 */
export function optionalAuth(req, res, next) {
  if (req.session && req.session.user) {
    req.user = req.session.user;
  } else {
    req.user = null;
  }

  next();
}

/**
 * Middleware to check if user owns a recipe
 */
export function checkRecipeOwnership(req, res, next) {
  const db = require("../config/database.js").default.getDB();
  const recipeId = req.params.id || req.params.recipeId;
  const userId = req.user.user_id;
  const isAdmin = req.user.is_admin;

  if (isAdmin) return next();

  const sql = "SELECT user_id FROM Recipes WHERE recipe_id = ?";

  db.get(sql, [recipeId], (err, row) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: err.message,
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    if (row.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only modify your own recipes",
      });
    }

    next();
  });
}

/**
 * Generic ownership checker factory
 */
export function checkOwnership(tableName, idColumn, paramName = "id") {
  return (req, res, next) => {
    const db = require("../config/database.js").default.getDB();
    const resourceId = req.params[paramName];
    const userId = req.user.user_id;
    const isAdmin = req.user.is_admin;

    if (isAdmin) return next();

    const sql = `SELECT user_id FROM ${tableName} WHERE ${idColumn} = ?`;

    db.get(sql, [resourceId], (err, row) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: err.message,
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: `${tableName.slice(0, -1)} not found`,
        });
      }

      if (row.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: You can only modify your own ${tableName.toLowerCase()}`,
        });
      }

      next();
    });
  };
}

/**
 * Admin-only middleware
 */
export function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Please login to continue.",
    });
  }

  if (!req.user) {
    req.user = req.session.user;
  }

  if (!req.user.is_admin) {
    return res.status(403).json({
      success: false,
      message: "Forbidden. Admin access required.",
    });
  }

  next();
}
