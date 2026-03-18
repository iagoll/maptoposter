const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  createCheckoutSession,
  handleWebhook,
  getPaymentStatus,
  sendPosterByEmail,
  initiateCheckout
} = require('../controllers/paymentController');

// Stripe webhook needs the raw request body for signature verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// All routes below require authentication
router.post('/initiate', authMiddleware, initiateCheckout);
router.post('/create-checkout-session/:requestId', authMiddleware, createCheckoutSession);
router.get('/status/:requestId', authMiddleware, getPaymentStatus);
router.post('/send-email/:requestId', authMiddleware, sendPosterByEmail);

module.exports = router;
