const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Check if service account file is provided
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Use application default credentials or environment variables
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
    } else {
      console.warn('⚠️  Firebase not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_PROJECT_ID in .env');
    }
    
    if (admin.apps.length) {
      console.log('✓ Firebase Admin SDK initialized');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
  }
}

module.exports = admin;
