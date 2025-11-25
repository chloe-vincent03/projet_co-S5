import express from 'express';
import dotenv from 'dotenv';
import mediaRoutes from './routes/media.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Pour servir les fichiers HTML / JS / images
app.use(express.static(path.join(__dirname, 'public')));

// Pour lire le JSON dans les requêtes POST (si besoin plus tard)
app.use(express.json());

// Routes API
app.use('/api/media', mediaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));