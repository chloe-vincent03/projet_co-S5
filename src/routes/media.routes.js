const express = require("express");
const router = express.Router();
const mediaController = require("../controllers/media.controller");

// Exemple : GET /api/media
router.get("/", mediaController.getAllMedia);

module.exports = router;
