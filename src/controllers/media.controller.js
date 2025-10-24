import { dbPromise } from '../config/database.js';

export async function getAllMedia(req, res) {
  try {
    const db = await dbPromise;
    const media = await db.all('SELECT * FROM media ORDER BY id DESC');
    res.json(media);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
