const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { paymentCheckMiddleware } = require('../middleware/paymentMiddleware');
const { renderPreview, renderFinal } = require('../controllers/renderController');

// Free watermarked preview (no auth required)
router.post('/render-preview', renderPreview);

// High-res final render (requires Firebase auth + completed Stripe payment)
router.post('/render-final/:requestId', authMiddleware, paymentCheckMiddleware, renderFinal);

module.exports = router;
