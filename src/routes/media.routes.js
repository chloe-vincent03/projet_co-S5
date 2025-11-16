import express from 'express';
import { getAllMedia, getOneMedia } from '../controllers/media.controller.js';

const router = express.Router();

router.get('/', getAllMedia);
router.get('/:id', getOneMedia);

export default router;
