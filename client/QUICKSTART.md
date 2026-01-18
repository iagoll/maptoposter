# Quick Start Guide - Frontend

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Start the Backend Server
Make sure the backend server is running first:
```bash
cd ../server
npm start
```

The backend should be running on `http://localhost:3000`

### 3. Start the Frontend
```bash
cd ../client
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🎨 First Time Using the App

1. **Open your browser** to `http://localhost:5173`
2. **Fill in the form** on the left:
   - Enter a city (e.g., "Paris")
   - Enter a country (e.g., "France")
   - Select a theme (e.g., "Noir")
   - Adjust distance if needed
3. **Click "Generate Poster"**
4. **Watch the real-time logs** in the terminal
5. **View your poster** when complete!

## 💡 Try These Examples

Click the **"Example"** button to load random cities like:
- Tokyo, Japan (Japanese Ink theme)
- Paris, France (Pastel Dream theme)
- New York, USA (Noir theme)
- Venice, Italy (Blueprint theme)
- Barcelona, Spain (Warm Beige theme)

## 🎯 Advanced Features

### Use Direct Coordinates
1. Toggle **"Use Direct Coordinates"**
2. Enter coordinates: `48.8566,2.3522` (Paris)
3. Generate!

### Customize Title Position
Choose from 6 positions:
- Top: Left, Center, Right
- Bottom: Left, Center, Right

### Full Borders
Enable **"Full Borders"** in Advanced Options to remove gradient fade effects.

## 📱 Mobile Friendly

The app is fully responsive! Try it on your phone or tablet.

## 🐛 Troubleshooting

**Nothing loads?**
- Make sure the backend server is running on port 3000
- Check browser console for errors

**Logs don't stream?**
- Check if your browser supports Server-Sent Events (SSE)
- Try a different browser (Chrome/Firefox recommended)

**Images don't display?**
- Verify backend is serving static files: `http://localhost:3000/posters/`
- Check if Python posters directory exists

## 📖 Full Documentation

See [README.md](./README.md) for complete documentation.

## 🎨 Themes Available

Try all 17 themes:
- Noir, Blueprint, Japanese Ink
- Pastel Dream, Sunset, Ocean
- Terracotta, Warm Beige, Forest
- And more!

## ⚡ Development Tips

**Hot Reload**: Edit `App.vue` and see changes instantly

**Vue DevTools**: Install the browser extension for better debugging

**API Testing**: Use browser DevTools Network tab to inspect API calls
