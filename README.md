# MapToPoster

Full-stack app that generates print-quality city map posters from OpenStreetMap data.

**Stack:** Vue 3 + Vuetify 3 (Vercel) → Node.js/Express (Digital Ocean) → Python/OSMnx (subprocess)

---

## Architecture

```
Frontend (Vue 3)          →  HTTPS/CORS  →  Backend (Express)  →  spawn()  →  Python Worker
Vercel                                       Digital Ocean                      OSMnx + Matplotlib
Firebase Auth (client)                       Firebase Admin (verify)
Stripe.js (checkout)                         Stripe API + Webhooks
                                             Resend (email delivery)
                                             SQLite (better-sqlite3)
```

---

## Repo Structure

```
maptoposter/
├── client/            # Vue 3 frontend → deploys to Vercel
│   ├── src/
│   │   ├── components/        # PosterForm, TerminalLogs, RecentPosters, WelcomeCard, LanguageSelector
│   │   ├── views/             # GalleryView, HistoryView, AboutView
│   │   ├── store/             # settingsStore (Pinia), authStore
│   │   ├── locales/           # en, es (default), pt, fr, de
│   │   └── i18n.js
│   └── vite.config.js
│
├── server/            # Express backend → runs on Digital Ocean via PM2
│   └── src/
│       ├── config/            # firebase.js, stripe.js, resend.js
│       ├── controllers/
│       ├── middleware/        # authMiddleware, paymentMiddleware
│       ├── models/            # User, MapRequest, Payment
│       ├── routes/
│       ├── services/          # posterService, themeService, posterGalleryService,
│       │                      # paymentService, emailService, userHistoryService
│       └── app.js
│
├── python_logic/      # Python map generator → called as subprocess by server
│   ├── create_map_poster.py
│   ├── themes/                # 17 theme JSON files
│   ├── fonts/                 # Roboto Bold/Regular/Light
│   └── posters/               # PNG output directory
│
└── README.md
```

---

## Local Dev Setup

**1. Python worker**
```bash
cd python_logic
/opt/homebrew/bin/python3 -m venv venv   # use full path to avoid broken venv
source venv/bin/activate
pip install -r requirements.txt
```

**2. Backend**
```bash
cd server
npm install
# fill in server/.env (see Environment Variables below)
npm run dev
```

**3. Frontend**
```bash
cd client
npm install
# fill in client/.env (see Environment Variables below)
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

---

## Environment Variables

### `server/.env`

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:3000

# SQLite — leave blank to use ./data/ locally
DB_PATH=

# Firebase Admin (Option A: file path)
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json
# Firebase Admin (Option B: env vars — recommended for production)
# FIREBASE_PROJECT_ID=
# FIREBASE_CLIENT_EMAIL=
# FIREBASE_PRIVATE_KEY=

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com          # use onboarding@resend.dev for dev

# Python paths — use absolute paths; relative fallback used if blank
PYTHON_PATH=/absolute/path/to/python_logic/venv/bin/python3
PYTHON_SCRIPT_PATH=/absolute/path/to/python_logic/create_map_poster.py
PYTHON_CWD=/absolute/path/to/python_logic
POSTERS_PATH=/absolute/path/to/python_logic/posters
THEMES_PATH=/absolute/path/to/python_logic/themes
```

### `client/.env`

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Firebase Web SDK
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

> All frontend env vars **must** have the `VITE_` prefix.  
> In production, replace all `localhost` values and use `sk_live_` / `pk_live_` Stripe keys.

---

## Business Model & Payment Flow

| Tier | Price | DPI | Notes |
|------|-------|-----|-------|
| Preview | Free (login required) | 72 | Watermarked, cached by request hash |
| High-res download | $9.99 | 300 | Print quality, email delivery option |

**Flow:**
1. User logs in via Google (Firebase)
2. Submits form → `POST /api/preview/generate` → 72 DPI PNG cached
3. Clicks "Buy High-Res" → `POST /api/payment/create-checkout-session/:requestId`
4. Stripe hosted checkout → payment completes
5. Stripe fires `checkout.session.completed` webhook → backend updates DB
6. `POST /api/fulfill/generate/:requestId` (requires auth + payment middleware) → 300 DPI PNG
7. User downloads or receives by email via Resend

**Price config:** change `PRICE_IN_CENTS` in `server/src/services/paymentService.js` (999 = $9.99).

**Stripe test cards:**
- `4242 4242 4242 4242` — success
- `4000 0000 0000 0002` — declined
- `4000 0025 0000 3155` — requires 3D Secure

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/themes` | — | List available themes |
| GET | `/api/posters` | — | Gallery posters |
| POST | `/api/generate` | Firebase token | Start generation job |
| GET | `/api/logs/:jobId` | — | SSE real-time logs |
| GET | `/api/jobs/:jobId` | — | Job status |
| POST | `/api/preview/generate` | ✓ | 72 DPI preview (cached) |
| POST | `/api/payment/create-checkout-session/:id` | ✓ | Create Stripe session |
| POST | `/api/payment/webhook` | Stripe sig | Webhook handler |
| POST | `/api/fulfill/generate/:id` | ✓ + paid | 300 DPI generation |
| GET | `/api/fulfill/download/:id` | ✓ + paid | Download high-res |
| POST | `/api/fulfill/send-email/:id` | ✓ + paid | Email delivery |
| GET | `/api/history/*` | ✓ | User purchase/preview history |
| GET | `/health` | — | Health check |

---

## Implementation Status

- ✅ Python worker (DPI flag, 17 themes, road hierarchy, gradients)
- ✅ Express server (job queue, SSE logs, static file serving)
- ✅ SQLite schema (users, map_requests, payments, email_deliveries)
- ✅ Firebase auth middleware
- ✅ Payment middleware (verify paid before high-res)
- ✅ Stripe payment service + webhook handler
- ✅ Resend email service
- ✅ User history (service + controller + routes)
- ✅ i18n (5 languages: ES default, EN, PT, FR, DE)
- ⏳ Preview service (72 DPI + cache by hash)
- ⏳ Fulfillment service (300 DPI generation)
- ⏳ Auth, preview, payment, fulfillment controllers + routes
- ⏳ Frontend: Firebase auth store, login page, payment UI

---

## Deployment

### Frontend → Vercel
- Root directory: `client`
- Add all `VITE_*` env vars in Vercel project settings
- `VITE_API_BASE_URL` = your Digital Ocean API URL

### Backend → Digital Ocean (Ubuntu 22.04)

```bash
# Install
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs python3 python3-venv git nginx certbot python3-certbot-nginx
npm install -g pm2

# Clone + setup
git clone https://github.com/youruser/maptoposter.git
cd maptoposter/python_logic && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
cd ../server && npm install && nano .env   # fill in production values

# Run
pm2 start npm --name "maptoposter-api" -- start
pm2 save && pm2 startup
```

**Nginx config** (`/etc/nginx/sites-available/maptoposter`):
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/maptoposter /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## Common Bugs & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| `bad interpreter: ...venv/bin/python3.13: no such file or directory` | venv created from a parent venv, not system Python | `rm -rf python_logic/venv` then recreate with `/opt/homebrew/bin/python3 -m venv venv` |
| CORS errors in browser | `FRONTEND_URL` mismatch | Set `FRONTEND_URL` in `server/.env` to exact frontend origin (no trailing slash) |
| SSE logs never arrive | Nginx proxy buffering SSE stream | Add `proxy_buffering off; proxy_cache off;` to Nginx location block |
| Python paths break after restructuring | Hardcoded relative `__dirname` paths | Use `PYTHON_PATH`, `PYTHON_SCRIPT_PATH`, `PYTHON_CWD` env vars (already wired in services) |
| Stripe payment stays `pending` | Webhook not received or signature mismatch | Run `stripe listen --forward-to localhost:3000/api/payment/webhook` locally; check `STRIPE_WEBHOOK_SECRET` |
| Firebase token invalid | Expired token or wrong project | Call `user.getIdToken(true)` to force refresh; verify `FIREBASE_PROJECT_ID` matches both envs |
| Images 404 after generation | `POSTERS_PATH` not set or wrong | Set absolute `POSTERS_PATH` in `server/.env`; check `chmod 755` on the directory |
| Resend emails not delivered | Domain not verified in production | Use `onboarding@resend.dev` for dev; verify domain DNS in Resend dashboard for prod |
| `dist > 20km` generation very slow | OSMnx fetches huge graph from Overpass API | Warn user; consider a max distance cap in the API |
| SQLite write errors on Digital Ocean | Wrong `DB_PATH` or missing directory | `mkdir -p /var/data/maptoposter && chown youruser /var/data/maptoposter`; set `DB_PATH` in `.env` |

---

## Security Notes

- Firebase tokens verified server-side on every protected request — user ID never taken from URL params
- Stripe webhook signature validated with `stripe.webhooks.constructEvent` before processing
- All secrets in `.env` files, never committed (`.gitignore` covers both)
- CORS restricted to `FRONTEND_URL` only
- `paymentMiddleware` blocks high-res access until `payments.status = 'completed'`

---

## Detailed Docs

- `server/README.md` — full API reference, all env vars, PM2 setup
- `client/README.md` — component map, i18n usage, adding languages
- `python_logic/README.md` — CLI usage, themes, road hierarchy, rendering layers
