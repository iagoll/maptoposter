/**
 * Theme Service
 *
 * Source-of-truth for theme display data lives in the frontend:
 *   client/src/data/themes.js
 *
 * This service keeps a mirror of that list (id only) so the backend can
 * validate a requested theme ID before spawning the Python script — without
 * reading the filesystem on every request.
 *
 * Full render configuration (colors, per-road-type settings) is read directly
 * from python_logic/themes/<id>.json by the Python script at render time.
 * No need to parse those files here.
 */

const fs   = require('fs');
const path = require('path');

// ── Valid theme IDs ────────────────────────────────────────────────────────────
// Keep in sync with client/src/data/themes.js (id column only).
const VALID_THEME_IDS = new Set([
  'aurora', 'autumn', 'blueprint', 'contrast_zones', 'copper_patina',
  'feature_based', 'forest', 'ghost', 'gradient_roads', 'japanese_ink',
  'lava', 'midnight_blue', 'monochrome_blue', 'neon_cyberpunk', 'noir',
  'ocean', 'papyro', 'pastel_dream', 'rose_gold', 'sunset',
  'terracotta', 'warm_beige',
]);

const themesPath = process.env.THEMES_PATH ||
  path.join(__dirname, '../../../python_logic/themes');

/**
 * Returns true when the given theme id is recognised.
 * Used by posterService / renderController before spawning Python.
 */
const themeExists = (themeId) => VALID_THEME_IDS.has(themeId);

/**
 * Returns the full render-config JSON for a single theme.
 * Used only when the server needs to inspect render settings directly
 * (e.g. future server-side colour validation). The Python script reads
 * this file independently — you do not need to call this for normal rendering.
 */
const getThemeById = (themeId) => {
  if (!themeExists(themeId)) throw new Error('Theme not found');
  const filePath = path.join(themesPath, `${themeId}.json`);
  try {
    return { id: themeId, ...JSON.parse(fs.readFileSync(filePath, 'utf8')) };
  } catch {
    throw new Error(`Could not read theme file for "${themeId}"`);
  }
};

module.exports = { themeExists, getThemeById };
