const stripe = require('../config/stripe');
const Payment = require('../models/Payment');

const PRICE_IN_CENTS = 999; // $9.99 for high-res poster
const CURRENCY = 'usd';

/**
 * Create a Stripe checkout session
 */
const createCheckoutSession = async (userId, mapRequestId, successUrl, cancelUrl) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: 'High-Resolution Map Poster',
              description: 'Premium 300 DPI print-quality map poster',
              images: ['https://your-domain.com/poster-preview.jpg'] // TODO: Update with actual image
            },
            unit_amount: PRICE_IN_CENTS
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId.toString(),
        mapRequestId: mapRequestId.toString()
      },
      customer_email: null // Will be filled by Stripe
    });

    // Create payment record in database
    Payment.create({
      userId,
      mapRequestId,
      stripeSessionId: session.id,
      amount: PRICE_IN_CENTS,
      currency: CURRENCY
    });

    return {
      sessionId: session.id,
      url: session.url
    };
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    throw new Error('Failed to create payment session');
  }
};

/**
 * Handle Stripe webhook event
 */
const handleWebhookEvent = async (event) => {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Update payment status
        const payment = Payment.updateStatus(
          session.id,
          'completed',
          session.payment_intent
        );

        console.log(`✓ Payment completed for session ${session.id}`);
        return payment;

      case 'checkout.session.expired':
        const expiredSession = event.data.object;
        Payment.updateStatus(expiredSession.id, 'expired');
        console.log(`✗ Payment session expired: ${expiredSession.id}`);
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        console.log(`✗ Payment failed: ${failedIntent.id}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Webhook handling error:', error);
    throw error;
  }
};

/**
 * Get payment details
 */
const getPaymentDetails = async (sessionId) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    console.error('Error retrieving payment details:', error);
    throw new Error('Failed to retrieve payment details');
  }
};

/**
 * Verify webhook signature
 */
const verifyWebhookSignature = (payload, signature) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhookEvent,
  getPaymentDetails,
  verifyWebhookSignature,
  PRICE_IN_CENTS,
  CURRENCY
};
