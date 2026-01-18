# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start the Server
```bash
npm start
```

Server will be running at `http://localhost:3000`

### 3. Test the API

#### Option A: Using the test script
```bash
node test-api.js
```

#### Option B: Using cURL
```bash
# Generate a poster
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Paris",
    "country": "France",
    "theme": "pastel_dream",
    "distance": 15000
  }'
```

## 📋 Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate` | Start poster generation |
| GET | `/api/logs/:jobId` | Stream real-time logs (SSE) |
| GET | `/api/jobs/:jobId` | Get job status |
| GET | `/api/themes` | List available themes |
| GET | `/api/posters` | List generated posters |
| GET | `/posters/:filename` | Download poster image |
| GET | `/health` | Health check |

## 🔧 Configuration

Create a `.env` file (optional):
```env
PORT=3000
NODE_ENV=development
```

## 📖 Full Documentation

See [README.md](./README.md) for complete API documentation.

## 🐛 Troubleshooting

**Server won't start?**
- Check if port 3000 is available: `lsof -i :3000`
- Try a different port: `PORT=4000 npm start`

**Python errors?**
- Ensure Python venv exists: `cd ../python_logic && python3 -m venv venv`
- Install requirements: `source venv/bin/activate && pip install -r requirements.txt`

**Can't access posters?**
- Check posters directory exists: `ls ../python_logic/posters/`
- Verify permissions: `chmod 755 ../python_logic/posters/`
