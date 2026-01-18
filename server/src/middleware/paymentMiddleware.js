const Payment = require('../models/Payment');
const MapRequest = require('../models/MapRequest');

/**
 * Payment verification middleware
 * Checks if user has paid for a specific map request
 */
const paymentCheckMiddleware = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    if (!requestId) {
      return res.status(400).json({ 
        error: 'Bad Request', 
        message: 'Map request ID is required' 
      });
    }

    // Check if the request exists
    const mapRequest = MapRequest.findById(requestId);
    if (!mapRequest) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Map request not found' 
      });
    }

    // Check if request belongs to user
    if (mapRequest.user_id !== userId) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'This map request does not belong to you' 
      });
    }

    // Check if payment is completed
    const hasPaid = Payment.isCompleted(userId, requestId);
    if (!hasPaid) {
      return res.status(402).json({ 
        error: 'Payment Required', 
        message: 'Payment required to access high-resolution version',
        paymentUrl: `/api/payment/create-checkout-session/${requestId}`
      });
    }

    // Attach map request to request object
    req.mapRequest = mapRequest;
    next();
  } catch (error) {
    console.error('Payment check error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
};

/**
 * Check if user owns the map request
 */
const ownershipMiddleware = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const mapRequest = MapRequest.findById(requestId);
    if (!mapRequest) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Map request not found' 
      });
    }

    if (mapRequest.user_id !== userId) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Access denied' 
      });
    }

    req.mapRequest = mapRequest;
    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
};

module.exports = {
  paymentCheckMiddleware,
  ownershipMiddleware
};
