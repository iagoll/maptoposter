# Map Poster — Python Worker

Generates high-quality, print-ready city map posters from OpenStreetMap data. Used as a subprocess by the Express server, or run directly from the CLI.

## How It Works

```
CLI / Server
     │
     ▼
Geocoding (Nominatim)       ← city + country → lat/lon
     │
     ▼
Data Fetching (OSMnx)       ← street network + water + parks from OSM
     │
     ▼
Rendering (matplotlib)      ← layers: background → water → parks → roads → gradients → text
     │
     ▼
PNG output (posters/)
```

## Setup

```bash
/opt/homebrew/bin/python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Usage

```bash
python create_map_poster.py --city <city> --country <country> [options]
```

### Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--city` | `-c` | City name | required |
| `--country` | `-C` | Country name | required |
| `--theme` | `-t` | Theme name | `feature_based` |
| `--distance` | `-d` | Map radius in meters | `29000` |
| `--orientation` | `-o` | `vertical` or `horizontal` | `vertical` |
| `--coords` | | `"lat,lon"` — skips geocoding | — |
| `--title` | | Custom title instead of city name | — |
| `--title-pos` | | Title position (see below) | `bottom-center` |
| `--full-borders` | | Disable gradient fade on edges | — |
| `--dpi` | | Output resolution: `72`, `150`, `300` | `300` |
| `--list-themes` | | Print all available themes | — |

**Title positions:** `top-left` · `top-center` · `top-right` · `bottom-left` · `bottom-center` · `bottom-right`

### Distance Guide

| Distance | Best for |
|----------|----------|
| 4,000–6,000 m | Small/dense cities (Venice, Amsterdam) |
| 8,000–12,000 m | Medium cities (Paris, Barcelona) |
| 15,000–20,000 m | Large metros (Tokyo, Mumbai) |

## Examples

```bash
# List available themes
python create_map_poster.py --list-themes

# Classic grid
python create_map_poster.py -c "New York" -C "USA" -t noir -d 12000

# Canals
python create_map_poster.py -c "Venice" -C "Italy" -t blueprint -d 4000
python create_map_poster.py -c "Amsterdam" -C "Netherlands" -t ocean -d 6000

# Radial layouts
python create_map_poster.py -c "Paris" -C "France" -t pastel_dream -d 10000

# Large metros
python create_map_poster.py -c "Tokyo" -C "Japan" -t japanese_ink -d 15000
python create_map_poster.py -c "Mumbai" -C "India" -t contrast_zones -d 18000

# Direct coordinates (skips geocoding)
python create_map_poster.py --coords "40.7128,-74.0060" -C "USA" --title "NYC" -t noir

# Custom title position + no gradient
python create_map_poster.py -c "Paris" -C "France" --title-pos top-center --full-borders -t pastel_dream

# Horizontal orientation
python create_map_poster.py -c "San Francisco" -C "USA" -o horizontal -d 15000
```

## Themes

17 themes in the `themes/` directory:

| Theme | Style |
|-------|-------|
| `feature_based` | Classic black & white with road hierarchy |
| `noir` | Pure black background, white roads |
| `midnight_blue` | Navy background with gold roads |
| `blueprint` | Architectural blueprint aesthetic |
| `neon_cyberpunk` | Dark with electric pink/cyan |
| `warm_beige` | Vintage sepia tones |
| `pastel_dream` | Soft muted pastels |
| `japanese_ink` | Minimalist ink wash |
| `forest` | Deep greens and sage |
| `ocean` | Blues and teals |
| `terracotta` | Mediterranean warmth |
| `sunset` | Warm oranges and pinks |
| `autumn` | Burnt oranges and reds |
| `copper_patina` | Oxidized copper aesthetic |
| `monochrome_blue` | Single blue color family |
| `gradient_roads` | Smooth gradient shading |
| `contrast_zones` | High contrast urban density |

### Adding a Custom Theme

Create a JSON file in `themes/my_theme.json`:

```json
{
  "name": "My Theme",
  "description": "Brief description",
  "bg": "#FFFFFF",
  "text": "#000000",
  "gradient_color": "#FFFFFF",
  "water": "#C0C0C0",
  "parks": "#F0F0F0",
  "road_motorway": "#0A0A0A",
  "road_primary": "#1A1A1A",
  "road_secondary": "#2A2A2A",
  "road_tertiary": "#3A3A3A",
  "road_residential": "#4A4A4A",
  "road_default": "#3A3A3A"
}
```

The script picks it up automatically — no code changes needed.

## Output

Posters are saved to `posters/` with the format:
```
{city}_{theme}_{YYYYMMDD_HHMMSS}.png
```

## Project Structure

```
python_logic/
├── create_map_poster.py   # Main script
├── themes/                # Theme JSON files
├── fonts/                 # Roboto font files (Bold, Regular, Light)
├── posters/               # Generated poster output
└── requirements.txt
```

## Rendering Layers

Layers are drawn in this z-order (bottom to top):

```
z=11  Text labels (city, country, coordinates, attribution)
z=10  Gradient fades (top & bottom edges)
z=3   Roads (colored and weighted by type)
z=2   Parks (green polygons)
z=1   Water (blue polygons)
z=0   Background color
```

## Road Hierarchy

Both color and line width scale with road importance:

| OSM Type | Width | Color key |
|----------|-------|-----------|
| motorway, motorway_link | 1.2 | `road_motorway` |
| trunk, primary | 1.0 | `road_primary` |
| secondary | 0.8 | `road_secondary` |
| tertiary | 0.6 | `road_tertiary` |
| residential, living_street | 0.4 | `road_residential` |

## Key Functions

| Function | Purpose |
|----------|---------|
| `get_coordinates()` | City/country → lat/lon via Nominatim |
| `create_poster()` | Main rendering pipeline |
| `get_edge_colors_by_type()` | Road color by OSM highway tag |
| `get_edge_widths_by_type()` | Road width by importance |
| `create_gradient_fade()` | Top/bottom fade overlay |
| `load_theme()` | JSON theme file → dict |

## Performance Notes

- `dist > 20km` = slow Overpass API queries + high memory usage
- Use `--dpi 150` for quick previews, `--dpi 300` for print-ready output
- Add a 1-second delay between requests to respect Nominatim's usage policy (already handled in code)
