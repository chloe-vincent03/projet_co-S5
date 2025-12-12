// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // on garde en mémoire puis on push sur R2
const mime = require('mime-types');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sqlite3 = require('sqlite3').verbose();

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});
const BUCKET = process.env.R2_BUCKET;
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const PUBLIC_BASE = process.env.R2_PUBLIC_BASE;

const db = new sqlite3.Database('./database.sqlite');

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });

  const originalName = req.file.originalname;
  const key = `uploads/${Date.now()}-${originalName.replace(/\s/g,'_')}`;
  const contentType = req.file.mimetype || mime.lookup(originalName) || 'application/octet-stream';

  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: contentType
    }));

    const url = PUBLIC_BASE ? `${PUBLIC_BASE}/${encodeURIComponent(key)}` : `https://${BUCKET}.${ACCOUNT_ID}.r2.cloudflarestorage.com/${encodeURIComponent(key)}`;

    // insert into DB
    const stmt = db.prepare(`INSERT INTO media (title, description, type, url, content, user_id) VALUES (?, ?, ?, ?, ?, ?)`);
    const type = (contentType.split('/')[0] || 'image');
    stmt.run(originalName, null, type, url, null, req.user ? req.user.id : null, function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'DB error' });
      }
      res.json({ id: this.lastID, url });
    });
    stmt.finalize();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed', details: err.message });
  }
});

module.exports = router;
