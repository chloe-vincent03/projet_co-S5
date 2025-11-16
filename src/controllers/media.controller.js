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

export async function getOneMedia(req, res) {
  try {
    const db = await dbPromise;
    const id = req.params.id;

    const media = await db.get('SELECT * FROM media WHERE id = ?', [id]);

    if (!media) {
      return res.status(404).json({ error: "Média non trouvé" });
    }

    res.json(media);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
