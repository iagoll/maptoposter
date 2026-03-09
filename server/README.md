# Map Poster — Server

Express.js backend that manages Python script execution, real-time log streaming via Server-Sent Events (SSE), theme management, and serving of generated poster images.

## Tech Stack

- **Express 5.x** — web framework
- **child_process.spawn** — Python process execution
- **Server-Sent Events (SSE)** — real-time log streaming
- **better-sqlite3** — local database
- **Firebase Admin** — authentication
- **Stripe** — payments
- **Resend** — transactional email

## Directory Structure

```
server/
├── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── services/
├── package.json
├── test-api.js
└── .env
```

---

## Setup

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Configure environment

Create a `.env` file (see full reference below). Minimum required for local dev:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PYTHON_PATH=/absolute/path/to/python_logic/venv/bin/python3
PYTHON_SCRIPT_PATH=/absolute/path/to/python_logic/create_map_poster.py
PYTHON_CWD=/absolute/path/to/python_logic
POSTERS_PATH=/absolute/path/to/python_logic/posters
THEMES_PATH=/absolute/path/to/python_logic/themes
```

> All Python paths fall back to relative paths if left blank, but absolute paths are recommended to avoid breakage when the folder structure changes.

### 3. Set up the Python worker

```bash
cd ../python_logic
/opt/homebrew/bin/python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:3000`.

---

## API Reference

### Endpoints at a glance

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | Start a poster generation job |
| GET | `/api/logs/:jobId` | Stream real-time logs (SSE) |
| GET | `/api/jobs/:jobId` | Get job status |
| GET | `/api/themes` | List available themes |
| GET | `/api/posters` | List generated posters |
| GET | `/posters/:filename` | Download a poster image |
| GET | `/health` | Health check |

---

### POST `/api/generate`

Starts a new poster generation job and returns a `jobId` for tracking.

**Request body:**
```json
{
  "city": "Tokyo",
  "country": "Japan",
  "theme": "japanese_ink",
  "distance": 45000,
  "orientation": "horizontal",
  "coords": "35.6762,139.6503",
  "title": "Custom Title",
  "titlePos": "bottom-center",
  "fullBorders": false
}
```

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `city` | string | — | City name (optional if `coords` provided) |
| `country` | string | required | Country name |
| `theme` | string | `feature_based` | Theme name |
| `distance` | number | `29000` | Map radius in meters |
| `orientation` | string | `vertical` | `vertical` or `horizontal` |
| `coords` | string | — | `"lat,lon"` — skips geocoding |
| `title` | string | — | Custom title override |
| `titlePos` | string | `bottom-center` | `top/bottom` + `-left/center/right` |
| `fullBorders` | boolean | `false` | Disable gradient fade on borders |

**Response:**
```json
{
  "jobId": "1705580123456-abc123",
  "message": "Map generation started",
  "logsUrl": "/api/logs/1705580123456-abc123"
}
```

---

### GET `/api/logs/:jobId`

SSE stream of real-time stdout/stderr from the Python process.

**Event types:**

| Type | Description |
|------|-------------|
| `connected` | Initial connection established |
| `stdout` | Standard output from Python |
| `stderr` | Error output from Python |
| `complete` | Process finished (includes result) |
| `error` | Process error |

**Example stream:**
```
data: {"type":"connected","jobId":"1705580123456-abc123"}
data: {"type":"stdout","message":"Looking up coordinates...\n"}
data: {"type":"complete","status":"completed","exitCode":0,"result":{"filename":"tokyo_japanese_ink_20260118_123456.png","url":"/posters/tokyo_japanese_ink_20260118_123456.png"}}
```

---

### GET `/api/jobs/:jobId`

Returns current status and metadata for a job.

**Response:**
```json
{
  "jobId": "1705580123456-abc123",
  "status": "completed",
  "exitCode": 0,
  "result": {
    "filename": "tokyo_japanese_ink_20260118_123456.png",
    "url": "/posters/tokyo_japanese_ink_20260118_123456.png"
  },
  "logCount": 42
}
```

Status values: `running` · `completed` · `failed` · `error`

---

### GET `/api/themes`

Lists all available themes from the `python_logic/themes/` directory.

```json
[
  { "id": "japanese_ink", "name": "Japanese Ink", "description": "..." },
  { "id": "noir", "name": "Noir", "description": "..." }
]
```

---

### GET `/api/posters`

Lists all generated poster files, sorted newest first.

```json
[
  {
    "filename": "tokyo_japanese_ink_20260118_123456.png",
    "url": "/posters/tokyo_japanese_ink_20260118_123456.png",
    "size": 2456789,
    "created": "2026-01-18T12:34:56.789Z"
  }
]
```

---

### GET `/health`

```json
{ "status": "ok", "activeJobs": 2, "timestamp": "2026-01-18T12:34:56.789Z" }
```

---

## Usage Examples

### cURL

```bash
# Start generation
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"city":"Paris","country":"France","theme":"pastel_dream","distance":15000}'

# Stream logs
curl -N http://localhost:3000/api/logs/1705580123456-abc123

# Check job status
curl http://localhost:3000/api/jobs/1705580123456-abc123

# List themes
curl http://localhost:3000/api/themes
```

### JavaScript (EventSource)

```javascript
const { jobId, logsUrl } = await fetch('http://localhost:3000/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ city: 'Tokyo', country: 'Japan', theme: 'japanese_ink' })
}).then(r => r.json());

const es = new EventSource(`http://localhost:3000${logsUrl}`);
es.onmessage = ({ data }) => {
  const event = JSON.parse(data);
  if (event.type === 'complete') { console.log(event.result); es.close(); }
  if (event.type === 'error')    { console.error(event.message); es.close(); }
};
```

---

## Environment Variables

Full `.env` reference:

```env
# Server
PORT=3000
NODE_ENV=development                        # development | production
FRONTEND_URL=http://localhost:5173          # Allowed CORS origin

# Database
DB_PATH=                                    # Leave blank → uses ./data/

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=./config/firebase-service-account.json

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

# Python worker (use absolute paths; relative fallbacks used if blank)
PYTHON_PATH=/path/to/python_logic/venv/bin/python3
PYTHON_SCRIPT_PATH=/path/to/python_logic/create_map_poster.py
PYTHON_CWD=/path/to/python_logic
POSTERS_PATH=/path/to/python_logic/posters
THEMES_PATH=/path/to/python_logic/themes

# App
BASE_URL=http://localhost:3000
```

> In production, replace all `/path/to/` values with absolute paths on your server (e.g. `/home/youruser/projects/maptoposter/python_logic`).

---

## Architecture

```
┌──────────┐   POST /api/generate   ┌───────────────┐
│  Client  │ ────────────────────>  │  Express API  │
│          │                        └───────────────┘
│          │   SSE /api/logs/:id           │ spawn()
│          │ <──────────────────────       ▼
│          │                        ┌───────────────┐
│          │                        │ Python Worker │
│          │                        │  (venv)       │
│          │                        └───────────────┘
│          │                               │ OSMnx / Nominatim
│          │   GET /posters/:file          ▼
│          │ <──────────────────────  PNG saved to disk
└──────────┘
```

**Job lifecycle:** Jobs are held in memory with unique IDs. Completed jobs are cleaned up after 5 minutes. Multiple concurrent jobs and multiple SSE clients per job are supported.

---

## PM2 (Production)

```bash
pm2 start npm --name "maptoposter-api" -- start
pm2 save
pm2 logs maptoposter-api
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 3000 in use | `lsof -i :3000` to find the process, or `PORT=4000 npm start` |
| Python venv not found | `cd ../python_logic && /opt/homebrew/bin/python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt` |
| Posters not accessible | `ls $POSTERS_PATH` and `chmod 755 $POSTERS_PATH` |
| SSE stream not arriving | Check for proxy buffering; ensure `FRONTEND_URL` is set correctly for CORS |
