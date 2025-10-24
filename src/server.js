import express from 'express';
import dotenv from 'dotenv';
import mediaRoutes from './routes/media.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';



dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/media', mediaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));
