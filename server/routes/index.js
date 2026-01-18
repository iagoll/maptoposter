const express = require('express');
const router = express.Router();
const posterService = require('../services/posterService');

// Import route modules
const posterRoutes = require('./posterRoutes');
const themeRoutes = require('./themeRoutes');
const galleryRoutes = require('./galleryRoutes');
const userHistoryRoutes = require('./userHistoryRoutes');

// Mount routes
router.use('/api', posterRoutes);
router.use('/api/themes', themeRoutes);
router.use('/api/posters', galleryRoutes);
router.use('/api/history', userHistoryRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    activeJobs: posterService.getActiveJobCount(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
