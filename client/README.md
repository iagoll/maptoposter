# Map Poster Generator - Frontend

Vue 3 + Vuetify 3 frontend for the Map Poster Generator application.

## Features

- 🎨 **17+ Themes**: Choose from a variety of professionally designed themes
- 📐 **Flexible Layouts**: Vertical or horizontal orientations
- 🌍 **Global Coverage**: Generate posters for any city worldwide
- 🎯 **Direct Coordinates**: Use exact lat/lng coordinates
- 📡 **Real-time Logs**: Live Server-Sent Events (SSE) streaming
- 🖼️ **Beautiful Mockups**: Gallery-style presentation of generated posters
- 📱 **Fully Responsive**: Works perfectly on mobile, tablet, and desktop
- 🎭 **Dark Theme**: Modern dark-themed UI with Vuetify

## Tech Stack

- **Vue 3** - Progressive JavaScript Framework
- **Vuetify 3** - Material Design Component Framework
- **Axios** - HTTP client for API calls
- **Vite** - Next Generation Frontend Tooling
- **Material Design Icons** - Icon set

## Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:3000`

## Installation

```bash
cd client
npm install
```

## Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build for Production

```bash
npm run build
```

Production files will be in the `dist/` directory.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
client/
├── src/
│   ├── App.vue           # Main application component
│   ├── main.js           # Application entry point with Vuetify setup
│   ├── style.css         # Global styles
│   └── assets/           # Static assets
├── public/               # Public static files
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
└── package.json          # Dependencies and scripts
```

## Configuration

The API base URL is configured in `App.vue`:

```javascript
const API_BASE_URL = 'http://localhost:3000'
```

For production, you may want to use environment variables:

1. Create a `.env` file:
```env
VITE_API_BASE_URL=https://your-api-domain.com
```

2. Update `App.vue`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
```

## Features Breakdown

### 1. Configuration Form

**Input Fields:**
- City/Country or Direct Coordinates
- Custom title override
- Theme selection (with descriptions)
- Distance slider (4-50km)
- Orientation toggle (Vertical/Horizontal)
- Title position selector
- Advanced options (Full borders)

**Quick Actions:**
- Load random example
- Reset form
- Form validation

### 2. Real-time Terminal

**Features:**
- Live log streaming via SSE
- Colored output (stdout/stderr)
- Timestamps for each log entry
- Auto-scroll to bottom
- Status indicator (running/completed/failed)
- Collapsible terminal window

**Terminal Output:**
```
12:34:56 Looking up coordinates...
12:34:57 ✓ Found: Paris, France
12:34:58 Generating map for Paris, France...
12:35:00 Fetching map data: 100%
12:35:02 ✓ Done! Poster saved as paris_noir_20260118_123502.png
```

### 3. Poster Display

**Mockup Frame:**
- Beautiful gradient background
- White mat border effect
- Shadow depth for 3D appearance
- Responsive sizing
- Download button
- Proper aspect ratio handling

### 4. Recent Posters Gallery

**Features:**
- List of last 5 generated posters
- Thumbnail previews
- Click to view full size
- Creation timestamps
- Refresh button
- Auto-update after generation

### 5. Responsive Design

**Breakpoints:**
- **Desktop** (>960px): Side-by-side layout
- **Tablet** (600-960px): Stacked with optimized spacing
- **Mobile** (<600px): Full-width with compact controls

## Component Details

### App.vue Structure

```vue
<template>
  <v-app>
    <v-app-bar> <!-- Header --> </v-app-bar>
    <v-main>
      <v-row>
        <v-col> <!-- Left: Form --> </v-col>
        <v-col> <!-- Right: Output --> </v-col>
      </v-row>
    </v-main>
  </v-app>
</template>
```

### State Management

```javascript
// Form State
const formData = reactive({
  city, country, coords, title, theme,
  distance, orientation, titlePos, fullBorders
})

// Generation State
const generating = ref(false)
const jobId = ref(null)
const logs = ref([])

// Results
const generatedPoster = ref(null)
const posters = ref([])
```

### API Integration

**1. Generate Poster:**
```javascript
POST /api/generate
Body: { city, country, theme, ... }
Response: { jobId, logsUrl }
```

**2. Stream Logs (SSE):**
```javascript
EventSource(`/api/logs/${jobId}`)
Events:
  - connected: Initial connection
  - stdout: Python output
  - stderr: Python errors
  - complete: Generation finished
```

**3. List Themes:**
```javascript
GET /api/themes
Response: [{ id, name, description }, ...]
```

**4. List Posters:**
```javascript
GET /api/posters
Response: [{ filename, url, size, created }, ...]
```

## Customization

### Themes

The Vuetify theme can be customized in `main.js`:

```javascript
const vuetify = createVuetify({
  theme: {
    themes: {
      dark: {
        colors: {
          primary: '#1976D2',    // Change primary color
          secondary: '#424242',
          accent: '#82B1FF',
          // ... more colors
        },
      },
    },
  },
})
```

### Styling

Custom styles are in the `<style scoped>` section of `App.vue`:

- `.terminal-container` - Terminal/console styles
- `.mockup-frame` - Poster frame styles
- Responsive breakpoints
- Utility classes

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### CORS Issues

If you see CORS errors, ensure the backend server has CORS enabled for your frontend origin:

```javascript
// server/app.js
app.use(cors({
  origin: 'http://localhost:5173'
}))
```

### SSE Connection Issues

If real-time logs don't appear:

1. Check browser console for errors
2. Verify backend server is running
3. Check network tab for SSE connection
4. Ensure no proxy is blocking SSE

### Images Not Loading

If poster images don't display:

1. Verify backend static file serving is working: `http://localhost:3000/posters/`
2. Check browser console for 404 errors
3. Ensure `posters/` directory exists in `python_logic/`

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## Performance Optimization

### Production Build

The production build is optimized with:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

### Lazy Loading

For larger applications, consider lazy loading routes:

```javascript
const routes = [
  {
    path: '/',
    component: () => import('./views/Home.vue')
  }
]
```

## Accessibility

The application includes:
- Semantic HTML
- ARIA labels (via Vuetify)
- Keyboard navigation
- Screen reader support
- Focus management

## Future Enhancements

Potential improvements:

- [ ] User accounts and saved posters
- [ ] Batch generation
- [ ] Advanced customization (fonts, colors)
- [ ] Social sharing
- [ ] Print-ready PDF export
- [ ] Map preview before generation
- [ ] Favorites/collections

## License

See the root LICENSE file.

## Support

For issues or questions:
1. Check this README
2. Review backend API documentation
3. Check browser console for errors
4. Verify backend server is running

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant HMR. Changes to Vue components will be reflected immediately without full page reload.

### Vue DevTools

Install Vue DevTools browser extension for better debugging:
- Component inspection
- State management
- Performance profiling
- Event tracking

### Debugging SSE

Use browser DevTools Network tab:
1. Filter by "EventStream"
2. Click on the SSE connection
3. View "Messages" tab for real-time events

### Component Structure

Keep components focused:
- Separate concerns (form, terminal, mockup)
- Extract reusable components
- Use composition API for logic reuse
