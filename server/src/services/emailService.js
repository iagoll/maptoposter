const resend = require('../config/resend');
const path = require('path');
const fs = require('fs');

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com';

/**
 * Send high-res poster via email
 */
const sendPosterEmail = async (toEmail, posterFilename, posterPath, mapDetails) => {
  if (!resend) {
    throw new Error('Resend not configured');
  }

  try {
    // Read the file
    const fileBuffer = fs.readFileSync(posterPath);
    const fileBase64 = fileBuffer.toString('base64');

    const { city, country, theme } = mapDetails;
    const displayLocation = city || 'Custom Location';

    const emailResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Your High-Resolution Map Poster - ${displayLocation}, ${country}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #667eea; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🗺️ Your Map Poster is Ready!</h1>
              <p>High-Resolution (300 DPI) - Print Quality</p>
            </div>
            <div class="content">
              <p>Hello!</p>
              <p>Thank you for your purchase. Your custom map poster has been generated and is attached to this email.</p>
              
              <div class="details">
                <h3>Poster Details</h3>
                <div class="detail-row">
                  <span class="label">Location:</span>
                  <span>${displayLocation}, ${country}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Theme:</span>
                  <span>${theme}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Resolution:</span>
                  <span>300 DPI (Print Quality)</span>
                </div>
                <div class="detail-row">
                  <span class="label">File Name:</span>
                  <span>${posterFilename}</span>
                </div>
              </div>

              <h3>📐 Printing Recommendations</h3>
              <ul>
                <li><strong>Paper:</strong> Use high-quality matte or glossy photo paper</li>
                <li><strong>Size:</strong> Recommended 12" x 16" (portrait) or 16" x 12" (landscape)</li>
                <li><strong>Printer Settings:</strong> Ensure "Best Quality" or "Photo Quality" is selected</li>
                <li><strong>Color Profile:</strong> Use sRGB or Adobe RGB for best color accuracy</li>
              </ul>

              <p style="margin-top: 30px;">
                <strong>Need help?</strong> Contact us at support@yourdomain.com
              </p>
            </div>
            <div class="footer">
              <p>© 2026 Map Poster Generator. All rights reserved.</p>
              <p>Map data © OpenStreetMap contributors</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: posterFilename,
          content: fileBase64
        }
      ]
    });

    return {
      emailId: emailResult.id,
      status: 'sent'
    };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send preview email (without attachment)
 */
const sendPreviewReadyEmail = async (toEmail, previewUrl, mapDetails) => {
  if (!resend) {
    throw new Error('Resend not configured');
  }

  try {
    const { city, country, theme } = mapDetails;
    const displayLocation = city || 'Custom Location';

    const emailResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Your Map Preview is Ready - ${displayLocation}, ${country}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Preview is Ready!</h1>
            </div>
            <div class="content">
              <p>Hello!</p>
              <p>Your map preview for <strong>${displayLocation}, ${country}</strong> is ready to view.</p>
              <p>This is a low-resolution preview. To get the high-resolution (300 DPI) print-quality version, please complete your purchase.</p>
              <p style="text-align: center;">
                <a href="${previewUrl}" class="button">View Preview</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    return {
      emailId: emailResult.id,
      status: 'sent'
    };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

module.exports = {
  sendPosterEmail,
  sendPreviewReadyEmail
};
