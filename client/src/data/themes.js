/**
 * Single source of truth for theme display data used by the frontend.
 *
 * Each entry contains only what the UI needs (id, name, description, and
 * the three key colors for swatches/previews). The full per-road-type render
 * configuration lives exclusively in python_logic/themes/<id>.json, which the
 * Python script reads at render time — those files do not need to be edited
 * when making UI-only changes here.
 *
 * To add a new theme:
 *   1. Add a JSON file under python_logic/themes/<id>.json (render config)
 *   2. Add an entry in this array (UI display data)
 */
export const THEMES = [
  {
    id:          'aurora',
    name:        'Aurora',
    description: 'Dark teal with glowing cyan roads',
    bg:          '#04101c',
    road:        '#00ffb0',
    water:       '#020a14',
  },
  {
    id:          'autumn',
    name:        'Autumn',
    description: 'Warm off-white with rust/orange roads',
    bg:          '#fbf7f0',
    road:        '#b8450a',
    water:       '#d4e8f0',
  },
  {
    id:          'blueprint',
    name:        'Blueprint',
    description: 'Blueprint blue with light-blue roads',
    bg:          '#1A3A5C',
    road:        '#a8d4f5',
    water:       '#0e2a44',
  },
  {
    id:          'contrast_zones',
    name:        'Contrast Zones',
    description: 'Light grey with high-contrast black roads',
    bg:          '#f0f0f0',
    road:        '#111111',
    water:       '#cce0f0',
  },
  {
    id:          'copper_patina',
    name:        'Copper Patina',
    description: 'Dark green with teal/copper roads',
    bg:          '#1a2e28',
    road:        '#7dbfb0',
    water:       '#0f1e1a',
  },
  {
    id:          'feature_based',
    name:        'Feature Based',
    description: 'White background with color-coded road types',
    bg:          '#ffffff',
    road:        '#333333',
    water:       '#a8d8ea',
  },
  {
    id:          'forest',
    name:        'Forest',
    description: 'Dark green with leafy green roads',
    bg:          '#1a2e1a',
    road:        '#6abf69',
    water:       '#0f1e0f',
  },
  {
    id:          'ghost',
    name:        'Ghost',
    description: 'Near-white with subtle grey roads',
    bg:          '#f5f5f5',
    road:        '#4a4a4a',
    water:       '#ddeef8',
  },
  {
    id:          'gradient_roads',
    name:        'Gradient Roads',
    description: 'White with blue gradient roads',
    bg:          '#ffffff',
    road:        '#3366cc',
    water:       '#bbd4f4',
  },
  {
    id:          'japanese_ink',
    name:        'Japanese Ink',
    description: 'Cream paper with deep ink roads — woodblock print',
    bg:          '#f5f0e8',
    road:        '#1a1a1a',
    water:       '#c8dce8',
  },
  {
    id:          'lava',
    name:        'Lava',
    description: 'Pitch black with fiery orange roads',
    bg:          '#090909',
    road:        '#ff5500',
    water:       '#050505',
  },
  {
    id:          'midnight_blue',
    name:        'Midnight Blue',
    description: 'Deep navy with gold/copper roads — luxury atlas',
    bg:          '#0A1628',
    road:        '#D4AF37',
    water:       '#061020',
  },
  {
    id:          'monochrome_blue',
    name:        'Monochrome Blue',
    description: 'Ice blue with deep navy roads',
    bg:          '#e8f0f8',
    road:        '#1a4080',
    water:       '#c0d4e8',
  },
  {
    id:          'neon_cyberpunk',
    name:        'Neon Cyberpunk',
    description: 'Near-black with hot-pink neon roads',
    bg:          '#0d0d1a',
    road:        '#ff2dce',
    water:       '#07070f',
  },
  {
    id:          'noir',
    name:        'Noir',
    description: 'Pure black with white/grey roads — gallery aesthetic',
    bg:          '#000000',
    road:        '#ffffff',
    water:       '#0a0a0a',
  },
  {
    id:          'ocean',
    name:        'Ocean',
    description: 'Dark ocean blue with cyan roads',
    bg:          '#0a2a3c',
    road:        '#4dd0e1',
    water:       '#051520',
  },
  {
    id:          'papyro',
    name:        'Papyro',
    description: 'Amber parchment with deep purple roads',
    bg:          '#c8853a',
    road:        '#1a0a2e',
    water:       '#a06828',
  },
  {
    id:          'pastel_dream',
    name:        'Pastel Dream',
    description: 'Blush white with soft lilac roads',
    bg:          '#fef6f0',
    road:        '#b8a0c8',
    water:       '#ddeefa',
  },
  {
    id:          'rose_gold',
    name:        'Rose Gold',
    description: 'Soft pink with deep rose roads',
    bg:          '#f8eeea',
    road:        '#a03860',
    water:       '#e0d0d8',
  },
  {
    id:          'sunset',
    name:        'Sunset',
    description: 'Almost-black with amber sunset roads',
    bg:          '#1a0a00',
    road:        '#ff8c42',
    water:       '#0a0500',
  },
  {
    id:          'terracotta',
    name:        'Terracotta',
    description: 'Sand beige with burnt terracotta roads',
    bg:          '#f5e6d3',
    road:        '#c06030',
    water:       '#c8dce8',
  },
  {
    id:          'warm_beige',
    name:        'Warm Beige',
    description: 'Warm ivory with rich brown roads',
    bg:          '#f2e8d8',
    road:        '#8b5e3c',
    water:       '#d0e0ec',
  },
]

/** Quick lookup by id — avoids repeated .find() calls */
export const THEMES_BY_ID = Object.fromEntries(THEMES.map(t => [t.id, t]))
