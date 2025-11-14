import express from 'express';
import dotenv from 'dotenv';
import mediaRoutes from './routes/media.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDb } from './config/initDB.js';

dotenv.config();

const app = express();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

app.use(express.static(path.join(dirname, 'public')));
app.use('/api/media', mediaRoutes);

// Initialisation BDD
await initDb();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));