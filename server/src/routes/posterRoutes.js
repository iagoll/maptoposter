const express = require('express');
const router = express.Router();
const posterController = require('../controllers/posterController');

// Generate a new poster
router.post('/generate', posterController.generatePoster);

// Get job status
router.get('/jobs/:jobId', posterController.getJobStatus);

// Stream logs via SSE
router.get('/logs/:jobId', posterController.streamLogs);

// Get all jobs
router.get('/jobs', posterController.getAllJobs);

module.exports = router;
