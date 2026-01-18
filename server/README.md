# Map Poster Server

Express.js backend server for the Map Poster Generator. Manages Python script execution, real-time log streaming via Server-Sent Events (SSE), and serves generated poster images.

## Features

- 🐍 **Python Integration**: Executes Python script using virtual environment
- 📡 **Real-time Logs**: Server-Sent Events for live stdout/stderr streaming
- 🎨 **Theme Management**: API endpoints for listing available themes
- 🖼️ **Static File Serving**: Serves generated poster images
- 📊 **Job Tracking**: Monitor generation status and results

## Installation

```bash
cd server
npm install
```

## Running the Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

Server runs on `http://localhost:3000` by default.

## API Endpoints

### 1. Generate Map Poster

**POST** `/api/generate`

Starts a new map poster generation job.

**Request Body:**
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

**Parameters:**
- `city` (string, optional if coords provided): City name
- `country` (string, required): Country name
- `theme` (string, default: "feature_based"): Theme name
- `distance` (number, default: 29000): Map radius in meters
- `orientation` (string, default: "vertical"): "vertical" or "horizontal"
- `coords` (string, optional): "latitude,longitude" format
- `title` (string, optional): Custom title override
- `titlePos` (string, default: "bottom-center"): Title position
  - Options: "top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"
- `fullBorders` (boolean, default: false): Disable gradient fade on borders

**Response:**
```json
{
  "jobId": "1705580123456-abc123",
  "message": "Map generation started",
  "logsUrl": "/api/logs/1705580123456-abc123"
}
```

### 2. Stream Real-time Logs

**GET** `/api/logs/:jobId`

Server-Sent Events (SSE) endpoint for real-time log streaming.

**Response (SSE Stream):**
```
data: {"type":"connected","jobId":"1705580123456-abc123"}

data: {"type":"stdout","message":"Looking up coordinates...\n"}

data: {"type":"stdout","message":"✓ Found: Tokyo, Japan\n"}

data: {"type":"complete","status":"completed","exitCode":0,"result":{"filename":"tokyo_japanese_ink_20260118_123456.png","url":"/posters/tokyo_japanese_ink_20260118_123456.png"}}
```

**Event Types:**
- `connected`: Initial connection established
- `stdout`: Standard output from Python script
- `stderr`: Error output from Python script
- `complete`: Process finished (includes result)
- `error`: Process error occurred

### 3. Get Job Status

**GET** `/api/jobs/:jobId`

Get current status and information about a job.

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

**Status Values:**
- `running`: Job is currently executing
- `completed`: Job finished successfully
- `failed`: Job finished with errors
- `error`: Job encountered an error

### 4. List Available Themes

**GET** `/api/themes`

Returns all available themes.

**Response:**
```json
[
  {
    "id": "japanese_ink",
    "name": "Japanese Ink",
    "description": "Black ink on cream - traditional East Asian aesthetic"
  },
  {
    "id": "noir",
    "name": "Noir",
    "description": "Pure black background with white/gray roads - modern gallery aesthetic"
  }
]
```

### 5. List Generated Posters

**GET** `/api/posters`

Returns all generated poster files.

**Response:**
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

### 6. Health Check

**GET** `/health`

Server health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "activeJobs": 2,
  "timestamp": "2026-01-18T12:34:56.789Z"
}
```

### 7. Static Files

**GET** `/posters/:filename`

Serves generated poster images.

Example: `http://localhost:3000/posters/tokyo_japanese_ink_20260118_123456.png`

## Usage Examples

### Using cURL

```bash
# Generate a poster
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Paris",
    "country": "France",
    "theme": "pastel_dream",
    "distance": 15000,
    "orientation": "vertical"
  }'

# Response: {"jobId":"1705580123456-abc123","message":"Map generation started","logsUrl":"/api/logs/1705580123456-abc123"}

# Stream logs (in another terminal)
curl -N http://localhost:3000/api/logs/1705580123456-abc123

# Check job status
curl http://localhost:3000/api/jobs/1705580123456-abc123

# List themes
curl http://localhost:3000/api/themes

# List posters
curl http://localhost:3000/api/posters
```

### Using JavaScript (Fetch API)

```javascript
// Generate poster
const response = await fetch('http://localhost:3000/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    city: 'Tokyo',
    country: 'Japan',
    theme: 'japanese_ink',
    distance: 45000,
    orientation: 'horizontal'
  })
});

const { jobId, logsUrl } = await response.json();

// Stream logs using EventSource
const eventSource = new EventSource(`http://localhost:3000${logsUrl}`);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'stdout' || data.type === 'stderr') {
    console.log(data.message);
  } else if (data.type === 'complete') {
    console.log('Generation complete!', data.result);
    eventSource.close();
  } else if (data.type === 'error') {
    console.error('Error:', data.message);
    eventSource.close();
  }
};

eventSource.onerror = (error) => {
  console.error('EventSource error:', error);
  eventSource.close();
};
```

## Architecture

```
┌─────────────┐      HTTP POST      ┌──────────────┐
│   Client    │ ─────────────────> │  Express     │
│             │                     │  Server      │
└─────────────┘                     └──────────────┘
      │                                    │
      │         SSE Stream                 │ spawn()
      │ <──────────────────────────────── │
      │                                    ▼
      │                             ┌──────────────┐
      │                             │   Python     │
      │                             │   Process    │
      │                             │  (venv)      │
      │                             └──────────────┘
      │                                    │
      │                                    │ stdout/stderr
      │                                    ▼
      │                             ┌──────────────┐
      │                             │  OSMnx API   │
      │                             │  Geocoding   │
      │                             │  Map Data    │
      │                             └──────────────┘
      │                                    │
      │         Poster Image               │
      │ <──────────────────────────────── │
      │      /posters/filename.png         │
```

## Environment Variables

Create a `.env` file in the server directory:

```env
PORT=3000
NODE_ENV=development
```

## Error Handling

The server handles various error scenarios:

- Missing required parameters → 400 Bad Request
- Job not found → 404 Not Found
- Python process errors → Streamed via SSE
- File system errors → 500 Internal Server Error

## Process Management

- Jobs are stored in memory with unique IDs
- Completed jobs are cleaned up after 5 minutes
- Multiple concurrent jobs are supported
- Each job can have multiple SSE clients connected

## CORS

CORS is enabled for all origins. For production, configure specific origins:

```javascript
app.use(cors({
  origin: 'https://your-frontend-domain.com'
}));
```

## Development

The server uses:
- **Express 5.x**: Web framework
- **child_process.spawn**: Python process execution
- **Server-Sent Events**: Real-time log streaming
- **Static file serving**: Poster image delivery

## Troubleshooting

### Python Script Not Found
Ensure the Python virtual environment exists:
```bash
cd ../python_logic
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Port Already in Use
Change the port in `.env` or:
```bash
PORT=4000 npm start
```

### SSE Connection Issues
- Check firewall settings
- Ensure no proxy is buffering the SSE stream
- Verify CORS configuration for your domain
