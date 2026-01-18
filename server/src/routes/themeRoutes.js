const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');

// Get all themes
router.get('/', themeController.getAllThemes);

// Get a specific theme
router.get('/:themeId', themeController.getThemeById);

module.exports = router;
