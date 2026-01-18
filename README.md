# 🗺️ Map Poster Generator

A full-stack application for generating beautiful, customizable map posters of any city in the world using OpenStreetMap data.

![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js) ![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js) ![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python) ![Vuetify](https://img.shields.io/badge/Vuetify-3-1867C0?logo=vuetify)

## 🎯 Features

- 🎨 **17+ Beautiful Themes** - Noir, Ocean, Sunset, Japanese Ink, Cyberpunk, and more
- 🌍 **Global Coverage** - Any city worldwide using OpenStreetMap data
- ⚙️ **Fully Customizable** - Orientation, distance, title position, borders
- 🔄 **Real-time Generation** - Live terminal logs via Server-Sent Events
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔒 **Secure Authentication** - Firebase Google Login
- 💳 **Payment Integration** - Stripe checkout for high-res downloads
- 📧 **Email Delivery** - Send posters via email using Resend
- 📊 **User History** - Track previews and purchases

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND (Vue 3)                     │
│  Vercel Hosting                                        │
│  - Vuetify 3 UI │ Pinia State │ Vue Router            │
│  - Real-time SSE Logs │ Firebase Auth                 │
└──────────────────────┬─────────────────────────────────┘
                       │ HTTPS/CORS
                       ▼
┌────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)               │
│  Digital Ocean Server                                  │
│  - REST API │ MVC Architecture │ SQLite Database       │
│  - Authentication │ Payments │ Email Delivery         │
└──────────────────────┬─────────────────────────────────┘
                       │ child_process.spawn
                       ▼
┌────────────────────────────────────────────────────────┐
│             PYTHON LOGIC (OSMnx + Matplotlib)          │
│  - Map Data (OpenStreetMap) │ Image Generation        │
│  - Geocoding │ 17+ Themes │ Multi-DPI Support         │
└────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
maptoposter/
├── client/                   # Vue 3 Frontend (Vercel)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── views/           # Page-level components
│   │   ├── services/        # API client & utilities
│   │   ├── store/           # Pinia state management
│   │   ├── router/          # Vue Router configuration
│   │   ├── App.vue          # Main layout component
│   │   └── main.js          # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json          # Vercel deployment config
│
├── server/                   # Node.js Backend (Digital Ocean)
│   ├── config/              # Firebase, Stripe, Resend configs
│   ├── controllers/         # Request handlers
│   ├── database/            # SQLite database setup
│   ├── middleware/          # Auth & payment middleware
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── app.js               # Express application
│   └── package.json
│
├── python_logic/            # Python Map Generation
│   ├── create_map_poster.py # Main generation script
│   ├── themes/              # Theme JSON files
│   ├── fonts/               # Roboto fonts
│   ├── posters/             # Generated high-res images
│   ├── cache/               # Preview cache
│   ├── venv/                # Python virtual environment
│   └── requirements.txt
│
└── README.md                # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.8+
- **Git**
- **Firebase** project (for authentication)
- **Stripe** account (for payments)
- **Resend** account (for email delivery)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/maptoposter.git
cd maptoposter
```

### 2. Setup Python Environment

```bash
cd python_logic
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
deactivate
cd ..
```

### 3. Setup Backend

```bash
cd server
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add your credentials (see Environment Variables section)
nano .env
```

**Required `.env` variables:**
```bash
PORT=3000
FRONTEND_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your-project-id
STRIPE_SECRET_KEY=sk_test_xxxxx
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=noreply@yourdomain.com
```

See [Environment Variables](#-environment-variables) section for complete list.

```bash
# Start backend
npm start
```

Backend will run on `http://localhost:3000`

### 4. Setup Frontend

```bash
cd client
npm install

# Copy environment template
cp .env.example .env

# Edit .env and add your credentials
nano .env
```

**Required `.env` variables:**
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=AIzaSyXXXXX
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

```bash
# Start frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### 5. Test Generation

1. Open `http://localhost:5173`
2. Fill in the form (e.g., City: "Paris", Country: "France")
3. Select a theme
4. Click "Generate Poster"
5. Watch real-time logs
6. View your generated poster!

## 🔐 Environment Variables

### Backend (`server/.env`)

```bash
# Server
PORT=3000
FRONTEND_URL=http://localhost:5173  # Or your Vercel URL
NODE_ENV=development

# Database
DB_PATH=/var/data/maptoposter  # Production path (or leave blank for ./data/)

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# Or use service account file:
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Resend Email
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com

# Application
BASE_URL=http://localhost:3000  # Or https://api.yourdomain.com
```

**Where to get these values:**

- **Firebase:** [console.firebase.google.com](https://console.firebase.google.com) → Project Settings → Service Accounts
- **Stripe:** [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)
- **Resend:** [resend.com/api-keys](https://resend.com/api-keys)

### Frontend (`client/.env`)

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000  # Or https://api.yourdomain.com

# Firebase Client SDK
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Stripe Publishable Key (safe to expose)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Where to get these values:**

- **Firebase:** [console.firebase.google.com](https://console.firebase.google.com) → Project Settings → General → Your apps
- **Stripe:** [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)

**Important:** All frontend variables MUST have the `VITE_` prefix!

## 🎨 Available Themes

The application includes 17 professionally designed themes:

- **noir** - High contrast black and white
- **ocean** - Blue oceanic tones
- **sunset** - Warm sunset colors
- **japanese_ink** - Traditional Japanese ink painting
- **neon_cyberpunk** - Futuristic neon colors
- **blueprint** - Technical blueprint style
- **terracotta** - Warm earthy terracotta
- **forest** - Natural forest greens
- **midnight_blue** - Deep blue midnight
- **warm_beige** - Warm neutral tones
- **contrast_zones** - High contrast zones
- **autumn** - Fall colors
- **copper_patina** - Aged copper look
- **monochrome_blue** - Single-color blue
- **pastel_dream** - Soft pastel colors
- **gradient_roads** - Gradient road styles
- **feature_based** - Feature-specific coloring

Themes are stored as JSON files in `python_logic/themes/`.

## 🔧 Python Script Usage

The Python script can be used standalone:

```bash
cd python_logic
source venv/bin/activate

python create_map_poster.py \
  --city "Tokyo" \
  --country "Japan" \
  --theme "japanese_ink" \
  --distance 20000 \
  -o horizontal \
  --dpi 300
```

**Available flags:**

- `--city` - City name (e.g., "Paris")
- `--country` - Country name (e.g., "France")
- `--coords` - Coordinates (e.g., "48.8566,2.3522") - alternative to city/country
- `--theme` - Theme name (e.g., "noir")
- `--distance` - Map radius in meters (default: 15000)
- `-o, --orientation` - "vertical" or "horizontal" (default: "vertical")
- `--title` - Custom title (overrides city name)
- `--title-pos` - Title position: "top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"
- `--full-borders` - Disable gradient borders
- `--dpi` - Image resolution: 72 (preview), 150, or 300 (high-res)

## 📡 API Endpoints

### Public Endpoints

```
GET    /api/themes              Get all available themes
GET    /api/posters             Get example gallery posters
```

### Authenticated Endpoints (Require Firebase Token)

```
POST   /api/generate            Generate a new poster
GET    /api/logs/:jobId         Get real-time generation logs (SSE)
GET    /api/history/purchases   Get user's purchase history
GET    /api/history/previews    Get user's preview history
GET    /api/history/stats       Get user statistics
```

### Payment Endpoints

```
POST   /api/create-checkout-session/:requestId    Create Stripe checkout
POST   /api/webhooks/stripe                       Stripe webhook handler
```

## 🛠️ Tech Stack

### Frontend

- **Vue 3** - Progressive JavaScript framework
- **Vuetify 3** - Material Design component library
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Axios** - HTTP client
- **Vite** - Build tool and dev server
- **Firebase SDK** - Authentication (client)

### Backend

- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **better-sqlite3** - SQLite database
- **Firebase Admin** - Authentication (server)
- **Stripe** - Payment processing
- **Resend** - Email delivery
- **CORS** - Cross-origin resource sharing

### Python

- **OSMnx** - OpenStreetMap data
- **Matplotlib** - Image generation
- **Geopy** - Geocoding
- **NetworkX** - Graph processing

## 🚢 Deployment

### Frontend (Vercel)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import repository
   - Set Root Directory: `client`
   - Add environment variables (all `VITE_*` variables)
   - Deploy

3. **Set Custom Domain** (optional)
   - Go to Project Settings → Domains
   - Add your domain
   - Update DNS records

### Backend (Digital Ocean)

1. **Create Ubuntu Droplet**
   - Choose Ubuntu 22.04 LTS
   - Select appropriate size ($12/month recommended)

2. **SSH and Setup**
   ```bash
   ssh root@your-server-ip
   
   # Install dependencies
   apt update && apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   apt install -y nodejs python3 python3-pip python3-venv git nginx certbot python3-certbot-nginx
   npm install -g pm2
   
   # Create user
   adduser youruser
   su - youruser
   
   # Create data directory
   sudo mkdir -p /var/data/maptoposter
   sudo chown -R youruser:youruser /var/data/maptoposter
   
   # Clone repo
   git clone https://github.com/yourusername/maptoposter.git
   cd maptoposter
   
   # Setup Python
   cd python_logic
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   deactivate
   cd ..
   
   # Setup Backend
   cd server
   npm install
   nano .env  # Add your production environment variables
   
   # Start with PM2
   pm2 start npm --name "maptoposter-api" -- start
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/maptoposter
   ```
   
   Add configuration:
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
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **Setup SSL**
   ```bash
   sudo certbot --nginx -d api.yourdomain.com
   ```

5. **Update Backend .env**
   ```bash
   FRONTEND_URL=https://your-app.vercel.app
   ```

6. **Restart**
   ```bash
   pm2 restart maptoposter-api
   ```

## 🔒 Security

- ✅ **JWT Authentication** - Firebase tokens required for all generation endpoints
- ✅ **User ID from Token** - Never from URL params (prevents unauthorized access)
- ✅ **Database-level Filtering** - All queries filter by authenticated user ID
- ✅ **CORS Configured** - Only allows requests from frontend origin
- ✅ **Payment Verification** - Middleware checks payment before high-res access
- ✅ **Webhook Signature Verification** - Stripe webhooks validated
- ✅ **HTTPS Only** - SSL certificates on all endpoints
- ✅ **Environment Variables** - All secrets in .env files (not committed)

## 📊 Database Schema

SQLite database with 4 main tables:

```sql
users                  -- Firebase authenticated users
  ├─ id
  ├─ firebase_uid
  ├─ email
  └─ created_at

map_requests          -- All map generations
  ├─ id
  ├─ user_id
  ├─ city, country, coords
  ├─ theme, distance, orientation
  ├─ preview_filename (72 DPI)
  ├─ highres_filename (300 DPI)
  └─ created_at

payments              -- Stripe payment records
  ├─ id
  ├─ user_id
  ├─ map_request_id
  ├─ stripe_session_id
  ├─ amount, currency
  ├─ status (pending/completed)
  └─ paid_at

email_deliveries      -- Email tracking
  ├─ id
  ├─ user_id
  ├─ map_request_id
  ├─ email_address
  └─ sent_at
```

## 🧪 Testing

### Backend

```bash
cd server
npm test  # If tests are configured
```

**Manual API Testing:**

```bash
# Get themes
curl http://localhost:3000/api/themes

# Generate poster (requires auth token)
curl -X POST http://localhost:3000/api/generate \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"city": "Paris", "country": "France", "theme": "noir"}'
```

### Frontend

```bash
cd client
npm run build  # Test build
npm run preview  # Preview production build
```

### Python Script

```bash
cd python_logic
source venv/bin/activate
python create_map_poster.py --city "Test City" --country "Test Country" --theme "noir"
```

## 🐛 Troubleshooting

### Issue: CORS Errors

**Solution:** Check `FRONTEND_URL` in backend `.env` matches your frontend URL exactly.

### Issue: Python Script Fails

**Solution:** 
- Activate virtual environment: `source venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.8+)

### Issue: Database Errors

**Solution:**
- Check `DB_PATH` in `.env`
- Ensure directory exists and has write permissions
- Delete database file to reinitialize: `rm data/maptoposter.db`

### Issue: Firebase Authentication Fails

**Solution:**
- Verify Firebase credentials in both frontend and backend `.env`
- Check Firebase project settings
- Ensure service account has correct permissions

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📧 Support

- **Documentation:** This README and inline code comments
- **Payment Setup:** See [STRIPE_PAYMENT_GUIDE.md](STRIPE_PAYMENT_GUIDE.md)
- **Issues:** Open an issue on GitHub

## 🎉 Acknowledgments

- **OpenStreetMap** - Map data
- **OSMnx** - Python library for OSM
- **Vuetify** - Material Design components
- **Firebase** - Authentication
- **Stripe** - Payment processing
- **Resend** - Email delivery

---

Made with ❤️ using Vue, Node.js, and Python
