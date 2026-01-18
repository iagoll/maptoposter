const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY not set in environment variables');
}

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

if (resend) {
  console.log('✓ Resend initialized');
}

module.exports = resend;
