import express from 'express';
import { getAllMedia } from '../controllers/media.controller.js';

const router = express.Router();

router.get('/', getAllMedia);

export default router;
