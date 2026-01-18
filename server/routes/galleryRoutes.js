const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');

// Get all posters
router.get('/', galleryController.getAllPosters);

// Get a specific poster
router.get('/:filename', galleryController.getPosterByFilename);

// Delete a poster
router.delete('/:filename', galleryController.deletePoster);

module.exports = router;
