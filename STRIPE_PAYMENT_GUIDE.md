# 💳 Stripe Payment Integration Guide

Complete guide for implementing payment-gated poster generation with Stripe, Firebase Auth, and Resend email delivery.

## 📋 Table of Contents

- [Overview](#overview)
- [Implementation Status](#implementation-status)
- [Architecture](#architecture)
- [Setup Instructions](#setup-instructions)
- [Backend Implementation](#backend-implementation)
- [Frontend Implementation](#frontend-implementation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### Business Model

- **Preview Generation:** FREE (requires login)
  - 72 DPI resolution
  - Watermarked
  - Fast generation (~30 seconds)
  - Cached for repeat views

- **High-Resolution Download:** $9.99 (one-time payment)
  - 300 DPI resolution
  - No watermark
  - Print quality
  - Slower generation (~90 seconds)
  - Email delivery option

### User Flow

```
1. Home Page (Public)
   └─> View example gallery
   └─> Click "Create Your Own"
       └─> Redirect to Login

2. Google Login (Firebase)
   └─> Get Firebase ID Token
   └─> User created in database

3. Preview Generation (FREE, Auth Required)
   └─> Submit form
   └─> Check cache by hash
   └─> Generate 72 DPI preview
   └─> Show watermarked preview

4. Payment ($9.99, Auth Required)
   └─> Click "Buy High-Res"
   └─> Create Stripe checkout session
   └─> Redirect to Stripe
   └─> Complete payment
   └─> Webhook updates database

5. Fulfillment (Auth + Payment Required)
   └─> Verify payment
   └─> Generate 300 DPI poster
   └─> Download or Email
```

---

## ✅ Implementation Status

### Completed

#### Phase 1: Python Script ✓
- [x] Added `--dpi` flag (72, 150, 300)
- [x] Updated `create_poster()` function
- [x] Modified `plt.savefig()` for dynamic DPI

#### Phase 2: Backend Infrastructure ✓
- [x] Installed dependencies (better-sqlite3, firebase-admin, stripe, resend)
- [x] Created database schema (users, map_requests, payments, email_deliveries)
- [x] Created models (User.js, MapRequest.js, Payment.js)
- [x] Created middleware (authMiddleware.js, paymentMiddleware.js)
- [x] Created config files (firebase.js, stripe.js, resend.js)
- [x] Created services (paymentService.js, emailService.js)
- [x] Created user history feature (service, controller, routes)

### Remaining

#### Phase 3: Preview & Cache Service
- [ ] Create `previewService.js` (72 DPI generation with caching)
- [ ] Create `fulfillmentService.js` (300 DPI generation)

#### Phase 4: Controllers
- [ ] Create `authController.js` (login/logout)
- [ ] Create `previewController.js` (preview generation)
- [ ] Create `paymentController.js` (Stripe checkout & webhooks)
- [ ] Create `fulfillmentController.js` (high-res generation & email)

#### Phase 5: Routes
- [ ] Create `authRoutes.js`
- [ ] Create `previewRoutes.js`
- [ ] Create `paymentRoutes.js`
- [ ] Create `fulfillmentRoutes.js`
- [ ] Update `routes/index.js` to mount new routes

#### Phase 6: Frontend
- [ ] Install Firebase SDK (`npm install firebase`)
- [ ] Create `authStore.js` (Pinia store for auth)
- [ ] Update `api.js` with auth interceptor
- [ ] Create login page/component
- [ ] Create preview flow UI
- [ ] Create payment button component
- [ ] Create download/email forms

---

## 🏗️ Architecture

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USER ACTIONS                         │
└─────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. LOGIN                                                    │
│    Firebase Auth (Google) → Get Token → Store in DB        │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PREVIEW (FREE)                                           │
│    POST /api/preview/generate                               │
│    ├─> authMiddleware (verify token)                        │
│    ├─> Check cache (by hash)                                │
│    │   └─> If found: return cached preview                  │
│    └─> Generate 72 DPI (~30s)                               │
│        └─> Save to cache/                                    │
│        └─> Save to database                                  │
│        └─> Return preview URL                                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. PAYMENT ($9.99)                                          │
│    POST /api/payment/create-checkout-session/:requestId     │
│    ├─> authMiddleware                                       │
│    ├─> Create Stripe Checkout Session                       │
│    │   ├─> Amount: $9.99 (999 cents)                        │
│    │   ├─> Success URL: /success?session_id={SESSION_ID}    │
│    │   └─> Cancel URL: /cancel                              │
│    ├─> Save payment record (status: pending)                │
│    └─> Return checkout URL                                   │
│                                                              │
│    User redirected to Stripe Hosted Checkout                │
│    User completes payment with card                         │
│                                                              │
│    POST /api/payment/webhook (Stripe webhook)               │
│    ├─> Verify webhook signature                             │
│    ├─> Handle checkout.session.completed event              │
│    ├─> Update payment status: completed                     │
│    └─> Update map_request record                            │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. FULFILLMENT (300 DPI)                                    │
│    POST /api/fulfill/generate/:requestId                    │
│    ├─> authMiddleware (verify token)                        │
│    ├─> paymentCheckMiddleware (verify payment)              │
│    ├─> Generate 300 DPI (~90s)                              │
│    ├─> Save to posters/                                      │
│    ├─> Update database                                       │
│    └─> Return download URL                                   │
│                                                              │
│    Option A: Direct Download                                │
│    GET /api/fulfill/download/:requestId                     │
│                                                              │
│    Option B: Email Delivery                                 │
│    POST /api/fulfill/send-email/:requestId                  │
│    ├─> authMiddleware + paymentCheckMiddleware              │
│    ├─> Read file from disk                                  │
│    ├─> Send via Resend (with attachment)                    │
│    └─> Log to email_deliveries table                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Setup Instructions

### 1. Firebase Setup

#### Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Add Project"
3. Enter project name
4. Enable Google Analytics (optional)
5. Click "Create Project"

#### Enable Google Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Google**
3. Toggle **Enable**
4. Set support email
5. Click **Save**

#### Get Firebase Credentials

**For Backend (Admin SDK):**

1. Go to **Project Settings** (gear icon) → **Service Accounts**
2. Click **Generate new private key**
3. Download JSON file
4. **Option A:** Save to `server/config/firebase-service-account.json`
   ```bash
   FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
   ```
5. **Option B (Recommended for production):** Extract values and add to `.env`:
   ```bash
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key\n-----END PRIVATE KEY-----\n"
   ```

**For Frontend (Web SDK):**

1. Go to **Project Settings** → **General**
2. Under **Your apps**, click **Web** icon (</>)
3. Register app with a nickname
4. Copy the configuration values to `client/.env`:
   ```bash
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

### 2. Stripe Setup

#### Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Sign up for an account
3. Complete verification (for production)

#### Get API Keys

1. Go to [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
2. Copy keys to `.env`:
   
   **Backend:**
   ```bash
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Use sk_live_ for production
   ```
   
   **Frontend:**
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # Use pk_live_ for production
   ```

#### Setup Webhook (Development)

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Windows (using Scoop)
   scoop install stripe
   
   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
   sudo mv stripe /usr/local/bin/
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Start webhook forwarding:
   ```bash
   stripe listen --forward-to http://localhost:3000/api/payment/webhook
   ```

4. Copy the webhook signing secret to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

#### Setup Webhook (Production)

1. Go to [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter URL: `https://api.yourdomain.com/api/payment/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
5. Click **Add endpoint**
6. Copy the **Signing secret** to production `.env`

#### Test Cards

Use these test cards in development mode:

| Card Number          | Result  | Description              |
|---------------------|---------|--------------------------|
| 4242 4242 4242 4242 | Success | Standard test card       |
| 4000 0000 0000 0002 | Decline | Card declined            |
| 4000 0000 0000 9995 | Decline | Insufficient funds       |
| 4000 0025 0000 3155 | Success | Requires authentication  |

### 3. Resend Setup

#### Create Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for an account
3. Free tier: 100 emails/day, 3,000/month

#### Get API Key

1. Go to [resend.com/api-keys](https://resend.com/api-keys)
2. Click **Create API Key**
3. Give it a name (e.g., "MapToPoster Production")
4. Copy key to `.env`:
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

#### Verify Domain

**Option A: Use Resend's Test Domain (Development)**
```bash
EMAIL_FROM=onboarding@resend.dev
```

**Option B: Verify Your Domain (Production)**

1. Go to **Domains** → **Add Domain**
2. Enter your domain (e.g., `yourdomain.com`)
3. Add DNS records (TXT, CNAME, MX)
4. Wait for verification
5. Use verified email:
   ```bash
   EMAIL_FROM=noreply@yourdomain.com
   ```

---

## 💻 Backend Implementation

### Database Schema

Already implemented in `server/database/db.js`:

```sql
-- Users (from Firebase Auth)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Map Requests (with caching)
CREATE TABLE map_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  city TEXT,
  country TEXT,
  coords TEXT,
  theme TEXT NOT NULL,
  distance INTEGER,
  orientation TEXT DEFAULT 'vertical',
  title TEXT,
  title_pos TEXT DEFAULT 'bottom-center',
  full_borders INTEGER DEFAULT 0,
  request_hash TEXT UNIQUE,
  preview_filename TEXT,
  highres_filename TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Payments (Stripe)
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  map_request_id INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  paid_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (map_request_id) REFERENCES map_requests(id)
);

-- Email Deliveries
CREATE TABLE email_deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  map_request_id INTEGER NOT NULL,
  email_address TEXT NOT NULL,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (map_request_id) REFERENCES map_requests(id)
);
```

### Middleware

#### authMiddleware.js (Completed)

Located at `server/middleware/authMiddleware.js`:

```javascript
const admin = require('../config/firebase');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find or create user in database
    const user = await User.findOrCreate({
      firebase_uid: decodedToken.uid,
      email: decodedToken.email,
      display_name: decodedToken.name,
      photo_url: decodedToken.picture
    });

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authMiddleware };
```

#### paymentMiddleware.js (Completed)

Located at `server/middleware/paymentMiddleware.js`:

```javascript
const Payment = require('../models/Payment');

const paymentCheckMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const requestId = parseInt(req.params.requestId);

    // Check if user has paid for this request
    const hasPaid = await Payment.isCompleted(userId, requestId);

    if (!hasPaid) {
      return res.status(402).json({
        error: 'Payment required',
        message: 'You must purchase this poster before accessing high-resolution version'
      });
    }

    next();
  } catch (error) {
    console.error('Payment check error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

module.exports = { paymentCheckMiddleware };
```

### Services

#### paymentService.js (Completed)

Located at `server/services/paymentService.js`:

```javascript
const stripe = require('../config/stripe');
const Payment = require('../models/Payment');

const PRICE_IN_CENTS = 999; // $9.99

class PaymentService {
  static async createCheckoutSession(userId, mapRequestId, successUrl, cancelUrl) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'High-Resolution Map Poster',
            description: '300 DPI print-quality poster',
          },
          unit_amount: PRICE_IN_CENTS,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId.toString(),
        map_request_id: mapRequestId.toString()
      }
    });

    // Create payment record
    Payment.create({
      user_id: userId,
      map_request_id: mapRequestId,
      stripe_session_id: session.id,
      amount: PRICE_IN_CENTS,
      currency: 'usd',
      status: 'pending'
    });

    return session;
  }

  static async handleWebhookEvent(event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Update payment status
      await Payment.updateBySessionId(session.id, {
        status: 'completed',
        stripe_payment_intent_id: session.payment_intent,
        paid_at: new Date()
      });
    }
  }

  static verifyWebhookSignature(payload, signature, secret) {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  }
}

module.exports = PaymentService;
```

#### emailService.js (Completed)

Located at `server/services/emailService.js` - handles sending high-res posters via email.

---

## 🎨 Frontend Implementation

### 1. Install Firebase SDK

```bash
cd client
npm install firebase
```

### 2. Create Firebase Config

Create `client/src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
```

### 3. Create Auth Store

Create `client/src/store/authStore.js`:

```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth'
import { auth } from '@/config/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)

  const provider = new GoogleAuthProvider()

  const loginWithGoogle = async () => {
    loading.value = true
    try {
      const result = await signInWithPopup(auth, provider)
      user.value = result.user
      token.value = await result.user.getIdToken()
      
      // Store token for API calls
      localStorage.setItem('firebaseToken', token.value)
      
      return user.value
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    await signOut(auth)
    user.value = null
    token.value = null
    localStorage.removeItem('firebaseToken')
  }

  const refreshToken = async () => {
    if (user.value) {
      token.value = await user.value.getIdToken(true)
      localStorage.setItem('firebaseToken', token.value)
    }
  }

  return {
    user,
    token,
    loading,
    loginWithGoogle,
    logout,
    refreshToken
  }
})
```

### 4. Update API Service

Update `client/src/services/api.js`:

```javascript
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add auth token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('firebaseToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const apiService = {
  // ... existing methods

  // Preview
  async generatePreview(data) {
    const response = await apiClient.post('/api/preview/generate', data)
    return response.data
  },

  // Payment
  async createCheckoutSession(mapRequestId) {
    const response = await apiClient.post(
      `/api/payment/create-checkout-session/${mapRequestId}`,
      {
        success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/cancel`
      }
    )
    return response.data
  },

  // Fulfillment
  async generateHighRes(mapRequestId) {
    const response = await apiClient.post(`/api/fulfill/generate/${mapRequestId}`)
    return response.data
  },

  async sendEmail(mapRequestId, email) {
    const response = await apiClient.post(`/api/fulfill/send-email/${mapRequestId}`, {
      email
    })
    return response.data
  }
}

export default apiService
```

---

## 🧪 Testing

### Test Stripe Webhook (Local Development)

**Terminal 1: Start Backend**
```bash
cd server
npm start
```

**Terminal 2: Forward Webhooks**
```bash
stripe listen --forward-to http://localhost:3000/api/payment/webhook
```

**Terminal 3: Trigger Test Event**
```bash
stripe trigger checkout.session.completed
```

Check backend logs for webhook processing.

### Test Full Payment Flow

1. Start backend and frontend
2. Login with Google
3. Generate a preview
4. Click "Buy High-Res" button
5. Use test card: `4242 4242 4242 4242`
6. Complete checkout
7. Verify webhook updates database
8. Check that high-res generation is now available

### Test Email Delivery

```bash
curl -X POST http://localhost:3000/api/fulfill/send-email/1 \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## 🐛 Troubleshooting

### Stripe Webhook Not Working

**Problem:** Webhook events not received

**Solutions:**
- Ensure Stripe CLI is running: `stripe listen --forward-to ...`
- Check webhook signing secret in `.env`
- Verify endpoint URL is correct
- Check backend logs for errors

### Firebase Authentication Fails

**Problem:** "Invalid or expired token"

**Solutions:**
- Verify Firebase credentials in `.env`
- Check token is being sent: `Authorization: Bearer <token>`
- Token may have expired, refresh it
- Ensure Firebase project ID matches

### Payment Not Completing

**Problem:** Payment status stays "pending"

**Solutions:**
- Check webhook is being received
- Verify webhook signature validation
- Check Stripe dashboard for payment status
- Look for errors in backend logs

### Email Not Sending

**Problem:** Emails not being delivered

**Solutions:**
- Verify Resend API key in `.env`
- Check email domain is verified (production)
- Use `onboarding@resend.dev` for testing
- Check Resend dashboard for logs
- Verify file attachments are under 40MB

---

## 💰 Pricing Configuration

To change the price, edit `server/services/paymentService.js`:

```javascript
const PRICE_IN_CENTS = 999; // Change this (999 = $9.99)
```

Stripe uses cents for amounts:
- $9.99 = 999 cents
- $14.99 = 1499 cents
- $19.99 = 1999 cents

---

## 📊 Next Steps

1. ✅ **Backend Infrastructure** - Complete
2. ✅ **Database Schema** - Complete
3. ✅ **Authentication Middleware** - Complete
4. ✅ **Payment Middleware** - Complete
5. ✅ **Payment Service** - Complete
6. ✅ **Email Service** - Complete
7. ⏳ **Preview Service** - In Progress
8. ⏳ **Controllers** - In Progress
9. ⏳ **Routes** - In Progress
10. ⏳ **Frontend Auth** - Pending
11. ⏳ **Frontend Payment UI** - Pending

---

## 📚 Resources

- **Stripe Documentation:** [stripe.com/docs](https://stripe.com/docs)
- **Firebase Auth:** [firebase.google.com/docs/auth](https://firebase.google.com/docs/auth)
- **Resend Docs:** [resend.com/docs](https://resend.com/docs)
- **Stripe Testing:** [stripe.com/docs/testing](https://stripe.com/docs/testing)

---

**Need help?** Open an issue on GitHub or check the main [README.md](README.md) for general setup instructions.
