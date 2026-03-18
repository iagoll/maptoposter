/**
 * Theme Controller
 *
 * The frontend no longer fetches the theme list from the API — it reads
 * client/src/data/themes.js directly. These endpoints are kept for tooling,
 * admin use, or third-party integrations.
 */

const { THEMES } = require('../data/themes');
const { getThemeById } = require('../services/themeService');

/** GET /api/themes — returns the full display catalog */
const getAllThemes = (req, res) => {
  res.json(THEMES);
};

/** GET /api/themes/:themeId — returns the full render config for one theme */
const getThemeByIdHandler = (req, res) => {
  try {
    const theme = getThemeById(req.params.themeId);
    res.json(theme);
  } catch (error) {
    res.status(404).json({ error: 'Theme not found', message: error.message });
  }
};

module.exports = { getAllThemes, getThemeById: getThemeByIdHandler };
