import db from "../config/database.js";

export function getWorksByIds(ids) {
  return new Promise((resolve, reject) => {
    if (!ids.length) return resolve([]);

    const placeholders = ids.map(() => "?").join(",");

    const query = `
      SELECT id, title, content, type
      FROM Media
      WHERE id IN (${placeholders})
    `;

    db.getDB().all(query, ids, (err, rows) => {
      if (err) {
        console.error("❌ SQLite error:", err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}
