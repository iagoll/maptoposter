# Map Poster — Frontend

Vue 3 + Vuetify 3 frontend for the Map Poster Generator. Communicates with the Express backend to generate city map posters, stream real-time progress, and display results.

## Tech Stack

- **Vue 3** — Composition API
- **Vuetify 3** — Material Design component framework
- **vue-i18n 9** — Internationalization
- **Pinia** — State management (settings store)
- **Axios** — HTTP client
- **Vite** — Dev server and build tool

## Project Structure

```
client/
├── src/
│   ├── App.vue                  # Root component, navigation, layout
│   ├── main.js                  # App entry point (Vue + Vuetify + i18n)
│   ├── i18n.js                  # vue-i18n configuration
│   ├── style.css                # Global styles
│   ├── components/
│   │   ├── PosterForm.vue       # Generation form (city, theme, options)
│   │   ├── TerminalLogs.vue     # Real-time SSE log viewer
│   │   ├── RecentPosters.vue    # Last generated posters
│   │   ├── WelcomeCard.vue      # Home page welcome panel
│   │   └── LanguageSelector.vue # Language switcher dropdown
│   ├── views/
│   │   ├── GalleryView.vue      # Browse all generated posters
│   │   ├── HistoryView.vue      # User history and statistics
│   │   └── AboutView.vue        # About page
│   ├── store/
│   │   └── settingsStore.js     # Language + theme preferences (Pinia)
│   └── locales/
│       ├── en.json              # English
│       ├── es.json              # Spanish (default)
│       ├── pt.json              # Portuguese
│       ├── fr.json              # French
│       └── de.json              # German
├── public/
├── index.html
├── vite.config.js
└── package.json
```

---

## Setup

### Prerequisites

- Node.js 18+
- Backend server running at `http://localhost:3000` (see `server/README.md`)

### Install & run

```bash
cd client
npm install
npm run dev
```

Frontend available at `http://localhost:5173`.

### Other scripts

```bash
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

---

## Configuration

The API base URL defaults to `http://localhost:3000`. To override it, create a `.env` file:

```env
VITE_API_BASE_URL=https://your-api-domain.com
```

Then update `App.vue`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
```

---

## Features

### Poster Generation Form

- City/country input or direct lat/lon coordinates
- Custom title override
- Theme selector (17 themes with descriptions)
- Distance slider (4–50 km)
- Orientation toggle (vertical / horizontal)
- Title position (6 positions: top/bottom × left/center/right)
- Advanced: full borders (disables gradient fade)
- Load random example / reset form buttons

### Real-time Terminal

Live log streaming via Server-Sent Events (SSE):

```
12:34:56  Looking up coordinates...
12:34:57  ✓ Found: Paris, France
12:34:58  Generating map for Paris, France...
12:35:00  Fetching map data: 100%
12:35:02  ✓ Done! Poster saved as paris_noir_20260118_123502.png
```

- Colored stdout / stderr output
- Timestamps per line
- Auto-scroll to bottom
- Status indicator (running / completed / failed)
- Collapsible window

### Poster Display

- Gallery-style mockup frame with mat border and shadow
- Responsive sizing and aspect ratio handling
- Download button

### Recent Posters

- Last 5 generated posters with thumbnails
- Click to view full size
- Auto-updates after each generation

### Responsive Layout

| Breakpoint | Layout |
|------------|--------|
| Desktop >960px | Side-by-side form + output |
| Tablet 600–960px | Stacked with optimized spacing |
| Mobile <600px | Full-width compact controls |

---

## Internationalization (i18n)

The app supports 5 languages. **Spanish is the default.**

| Code | Language |
|------|----------|
| `es` | Español (default) |
| `en` | English |
| `pt` | Português |
| `fr` | Français |
| `de` | Deutsch |

### How it works

- On first visit, the app checks `localStorage` for a saved language; falls back to Spanish
- User selects a language via the `LanguageSelector` dropdown in the nav bar
- Preference is saved to `localStorage` and persists across sessions
- `document.documentElement.lang` is updated for SEO and accessibility

### Using translations in components

```vue
<template>
  <!-- Simple key -->
  <h1>{{ $t('home.title') }}</h1>

  <!-- With parameter -->
  <span>{{ $t('form.distanceKm', { distance: 15 }) }}</span>

  <!-- In attribute -->
  <v-text-field :label="$t('form.city')" />

  <!-- In validation rule -->
  :rules="[v => !!v || $t('errors.required')]"
</template>

<script setup>
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()

// Programmatic translation
const message = t('common.loading')

// Change language
locale.value = 'fr'
</script>
```

### Using the settings store

```javascript
import { useSettingsStore } from '@/store/settingsStore'
const settingsStore = useSettingsStore()

settingsStore.setLanguage('fr')           // Change language
settingsStore.language                    // Current code
settingsStore.getLanguageName('es')       // → "Español"
```

### Translation key structure

```
nav.*           Navigation items
home.*          Home page text
form.*          Form labels, placeholders, validation
form.titlePos.* Title position option labels
terminal.*      Terminal header and states
recentPosters.* Recent posters section
welcome.*       Welcome card content
gallery.*       Gallery view
history.*       History view (tabs, stats)
about.*         About page
common.*        Shared UI elements
errors.*        Validation and error messages
```

### Adding a new translation key

1. Add the key to all 5 locale files in `src/locales/`
2. Use `$t('section.key')` in the template

### Adding a new language

1. Create `src/locales/[code].json` with all keys
2. Import it in `src/i18n.js` and add to the `messages` object
3. Add `{ code, name, flag }` to `availableLanguages` in `src/store/settingsStore.js`

---

## API Integration

| Call | How |
|------|-----|
| `POST /api/generate` | Start a generation job → returns `{ jobId, logsUrl }` |
| `EventSource /api/logs/:jobId` | SSE stream of stdout/stderr/complete events |
| `GET /api/themes` | Fetch theme list for the selector |
| `GET /api/posters` | Fetch recent posters list |

SSE event types: `connected` · `stdout` · `stderr` · `complete` · `error`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| App won't load | Ensure backend is running on port 3000: `cd server && npm start` |
| CORS errors | Set `FRONTEND_URL=http://localhost:5173` in `server/.env` |
| SSE logs don't stream | Check browser support (Chrome/Firefox); look for proxy buffering |
| Images don't display | Verify `http://localhost:3000/posters/` is accessible; check `POSTERS_PATH` in server `.env` |
| Build errors | `rm -rf node_modules package-lock.json && npm install` |
| Vite cache issues | `rm -rf node_modules/.vite && npm run dev` |
| Language not persisting | Check `localStorage.getItem('userLanguage')` in DevTools console |

**Debug language state in browser console:**
```javascript
localStorage.getItem('userLanguage')      // Current saved language
localStorage.removeItem('userLanguage')   // Reset to default (Spanish)
document.documentElement.lang            // Active lang attribute
```

**Debug SSE in DevTools:**  
Network tab → filter by "EventStream" → click the connection → "Messages" tab.
