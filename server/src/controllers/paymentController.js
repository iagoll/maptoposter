const path = require('path');
const paymentService = require('../services/paymentService');
const emailService = require('../services/emailService');
const Payment = require('../models/Payment');
const MapRequest = require('../models/MapRequest');
const { zoomToDistance } = require('./renderController');

const POSTERS_PATH =
  process.env.POSTERS_PATH ||
  path.join(__dirname, '../../../../python_logic/posters');

/**
 * POST /api/payment/create-checkout-session/:requestId
 * Creates a Stripe Checkout session for a map request.
 * Requires authMiddleware — req.user must be set.
 */
const createCheckoutSession = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.user_id;

    const mapRequest = await MapRequest.findById(requestId);
    if (!mapRequest) {
      return res.status(404).json({ error: 'Map request not found' });
    }
    if (mapRequest.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const alreadyPaid = await Payment.isCompleted(userId, requestId);
    if (alreadyPaid) {
      return res.json({ alreadyPaid: true, message: 'Payment already completed' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${frontendUrl}/create?payment=success&requestId=${requestId}`;
    const cancelUrl = `${frontendUrl}/create?payment=cancelled&requestId=${requestId}`;

    const { sessionId, url } = await paymentService.createCheckoutSession(
      userId,
      requestId,
      successUrl,
      cancelUrl
    );

    res.json({ sessionId, url });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ error: 'Failed to create payment session', message: error.message });
  }
};

/**
 * POST /api/payment/webhook
 * Handles Stripe webhook events.
 * Must use raw body — configured in paymentRoutes.js.
 */
const handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = paymentService.verifyWebhookSignature(req.body, signature);
  } catch (error) {
    console.error('Webhook signature error:', error.message);
    return res.status(400).json({ error: `Webhook error: ${error.message}` });
  }

  try {
    await paymentService.handleWebhookEvent(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handling error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

/**
 * GET /api/payment/status/:requestId
 * Returns whether the authenticated user has a completed payment for a request.
 */
const getPaymentStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.user_id;

    const mapRequest = await MapRequest.findById(requestId);
    if (!mapRequest) {
      return res.status(404).json({ error: 'Map request not found' });
    }
    if (mapRequest.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const paid = await Payment.isCompleted(userId, requestId);
    res.json({
      requestId,
      paid,
      highResReady: paid && !!mapRequest.highres_filename,
      highResUrl: paid && mapRequest.highres_filename
        ? `/posters/${mapRequest.highres_filename}`
        : null
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: 'Failed to check payment status', message: error.message });
  }
};

/**
 * POST /api/payment/send-email/:requestId
 * Sends the high-res poster via Resend email.
 * Requires auth + completed payment.
 */
const sendPosterByEmail = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.user_id;

    const mapRequest = await MapRequest.findById(requestId);
    if (!mapRequest) {
      return res.status(404).json({ error: 'Map request not found' });
    }
    if (mapRequest.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const paid = await Payment.isCompleted(userId, requestId);
    if (!paid) {
      return res.status(402).json({ error: 'Payment required' });
    }

    if (!mapRequest.highres_filename) {
      return res.status(404).json({ error: 'High-res poster not yet generated' });
    }

    const toEmail = req.body.email || req.user.email;
    if (!toEmail) {
      return res.status(400).json({ error: 'Email address required' });
    }

    const posterPath = path.join(POSTERS_PATH, mapRequest.highres_filename);
    const result = await emailService.sendPosterEmail(
      toEmail,
      mapRequest.highres_filename,
      posterPath,
      {
        city: mapRequest.city,
        country: mapRequest.country,
        theme: mapRequest.theme
      }
    );

    res.json({ success: true, emailId: result.emailId });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'Failed to send email', message: error.message });
  }
};

/**
 * POST /api/payment/initiate
 * One-shot: creates a MapRequest record + Stripe checkout session.
 * Returns { sessionId, url, requestId } so the frontend can redirect.
 */
const initiateCheckout = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const {
      center_lat,
      center_lng,
      zoom,
      country,
      theme = 'feature_based',
      orientation = 'vertical',
      title,
      titlePos = 'bottom-center',
      fullBorders = false,
      frameWidthPx = 600
    } = req.body;

    if (center_lat == null || center_lng == null || zoom == null || !country) {
      return res.status(400).json({ error: 'center_lat, center_lng, zoom, and country are required' });
    }

    const lat = parseFloat(center_lat);
    const lng = parseFloat(center_lng);
    const distance = zoomToDistance(parseInt(zoom, 10), lat, frameWidthPx);
    const coords = `${lat},${lng}`;

    const config = { coords, country, theme, distance, orientation, title, titlePos, fullBorders };

    // Reuse an existing identical request if it exists (deduplication via hash)
    const hash = MapRequest.generateHash(config);
    let mapRequest = await MapRequest.findByHash(hash);

    if (!mapRequest || mapRequest.user_id !== userId) {
      mapRequest = await MapRequest.create(userId, config);
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const successUrl = `${frontendUrl}/create?payment=success&requestId=${mapRequest.map_request_id}`;
    const cancelUrl  = `${frontendUrl}/create?payment=cancelled&requestId=${mapRequest.map_request_id}`;

    const { sessionId, url } = await paymentService.createCheckoutSession(
      userId,
      mapRequest.map_request_id,
      successUrl,
      cancelUrl
    );

    res.json({ sessionId, url, requestId: mapRequest.map_request_id });
  } catch (error) {
    console.error('Initiate checkout error:', error);
    res.status(500).json({ error: 'Failed to initiate checkout', message: error.message });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getPaymentStatus,
  sendPosterByEmail,
  initiateCheckout
};
