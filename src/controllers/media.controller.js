// import { db } from "../config/database.js";

// export async function getAllMedia(req, res) {
//   try {
//     const media = await db.all('SELECT * FROM media ORDER BY id DESC');
//     res.json(media);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// }


import db from "../config/database.js";

export function getAllMedia(req, res) {
  const database = db.getDB();

  database.all("SELECT * FROM media ORDER BY id DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
}
