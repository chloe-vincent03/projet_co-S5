require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const sqlite3 = require('sqlite3').verbose();

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const BUCKET = process.env.R2_BUCKET;
const ENDPOINT = process.env.R2_ENDPOINT; // ex: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
const PUBLIC_BASE = process.env.R2_PUBLIC_BASE; // optionnel: ex: https://pub-xxxx.r2.dev

const s3 = new S3Client({
  region: 'auto', // R2 ignores region but some SDKs require a value
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  },
  forcePathStyle: false // true = path-style (bucket in path), false = virtual-hosted
});

const db = new sqlite3.Database('./database.db');

async function uploadFile(localPath, key) {
  const body = fs.createReadStream(localPath);
  const contentType = mime.lookup(localPath) || 'application/octet-stream';

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType
  });

  await s3.send(cmd);
  // construis l'URL publique : choix 1 (virtual-hosted)
/*   const urlVirtual = `https://${BUCKET}.${ACCOUNT_ID}.r2.cloudflarestorage.com/${encodeURIComponent(key)}`; */
  // choix 2 si tu utilises r2.dev public url (si activé)
  const urlPublicDev = PUBLIC_BASE ? `${PUBLIC_BASE}/${encodeURIComponent(key)}` : null;

  return urlPublicDev || urlVirtual;
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walkDir(full, callback);
    else callback(full);
  });
}

(async () => {
  const srcDir = path.join(__dirname, '..', 'src'); // adapte si nécessaire
  const uploads = [];

  walkDir(srcDir, (filePath) => {
    // crée une key relative (ex: images/foo.jpg)
    const rel = path.relative(srcDir, filePath).replace(/\\/g, '/');
    const key = rel;
    uploads.push({ filePath, key });
  });

  for (const u of uploads) {
    console.log('Uploading', u.key);
    try {
      const url = await uploadFile(u.filePath, u.key);
      console.log('Uploaded ->', url);
      // Insère en base (adaptation à ton schema)
      const title = path.basename(u.key);
      const type = (mime.lookup(u.filePath)||'').split('/')[0] || 'image';
      const stmt = db.prepare(`INSERT INTO media (title, description, type, url, content, user_id) VALUES (?, ?, ?, ?, ?, ?)`);
      stmt.run(title, null, type, url, null, null);
      stmt.finalize();
    } catch (err) {
      console.error('Upload failed for', u.key, err);
    }
  }

  db.close();
  console.log('Done.');
})();
