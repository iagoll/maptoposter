const themeService = require('../services/themeService');

/**
 * Get all themes
 */
const getAllThemes = async (req, res) => {
  try {
    const themes = await themeService.getAllThemes();
    res.json(themes);
  } catch (error) {
    console.error('Error getting themes:', error);
    res.status(500).json({ error: 'Failed to load themes', message: error.message });
  }
};

/**
 * Get a specific theme
 */
const getThemeById = async (req, res) => {
  const { themeId } = req.params;
  
  try {
    const theme = await themeService.getThemeById(themeId);
    res.json(theme);
  } catch (error) {
    console.error('Error getting theme:', error);
    res.status(404).json({ error: 'Theme not found', message: error.message });
  }
};

module.exports = {
  getAllThemes,
  getThemeById
};
