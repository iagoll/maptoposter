const fs = require('fs');
const path = require('path');

const themesPath = path.join(__dirname, '../../../python_logic/themes');

/**
 * Get all available themes
 * @returns {Promise<Array>} Array of theme objects
 */
const getAllThemes = async () => {
  return new Promise((resolve, reject) => {
    fs.readdir(themesPath, (err, files) => {
      if (err) {
        return reject(new Error('Failed to read themes directory'));
      }
      
      const themes = files
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const themePath = path.join(themesPath, file);
          try {
            const themeData = JSON.parse(fs.readFileSync(themePath, 'utf8'));
            return {
              id: file.replace('.json', ''),
              name: themeData.name || file.replace('.json', ''),
              description: themeData.description || ''
            };
          } catch (e) {
            return {
              id: file.replace('.json', ''),
              name: file.replace('.json', ''),
              description: ''
            };
          }
        });
      
      resolve(themes);
    });
  });
};

/**
 * Get a specific theme by ID
 * @param {string} themeId - Theme identifier
 * @returns {Promise<Object>} Theme object
 */
const getThemeById = async (themeId) => {
  const themePath = path.join(themesPath, `${themeId}.json`);
  
  return new Promise((resolve, reject) => {
    fs.readFile(themePath, 'utf8', (err, data) => {
      if (err) {
        return reject(new Error('Theme not found'));
      }
      
      try {
        const themeData = JSON.parse(data);
        resolve({
          id: themeId,
          ...themeData
        });
      } catch (e) {
        reject(new Error('Invalid theme file'));
      }
    });
  });
};

/**
 * Check if theme exists
 * @param {string} themeId - Theme identifier
 * @returns {boolean} True if theme exists
 */
const themeExists = (themeId) => {
  const themePath = path.join(themesPath, `${themeId}.json`);
  return fs.existsSync(themePath);
};

module.exports = {
  getAllThemes,
  getThemeById,
  themeExists
};
