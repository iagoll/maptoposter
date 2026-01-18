const fs = require('fs');
const path = require('path');

const postersPath = path.join(__dirname, '../../../python_logic/posters');

/**
 * Get all generated posters
 * @returns {Promise<Array>} Array of poster objects
 */
const getAllPosters = async () => {
  return new Promise((resolve, reject) => {
    fs.readdir(postersPath, (err, files) => {
      if (err) {
        return reject(new Error('Failed to read posters directory'));
      }
      
      const posters = files
        .filter(file => file.endsWith('.png'))
        .map(file => {
          const filePath = path.join(postersPath, file);
          try {
            const stats = fs.statSync(filePath);
            return {
              filename: file,
              url: `/posters/${file}`,
              size: stats.size,
              created: stats.birthtime
            };
          } catch (e) {
            return null;
          }
        })
        .filter(poster => poster !== null)
        .sort((a, b) => b.created - a.created);
      
      resolve(posters);
    });
  });
};

/**
 * Get a specific poster by filename
 * @param {string} filename - Poster filename
 * @returns {Promise<Object>} Poster object
 */
const getPosterByFilename = async (filename) => {
  const filePath = path.join(postersPath, filename);
  
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        return reject(new Error('Poster not found'));
      }
      
      resolve({
        filename,
        url: `/posters/${filename}`,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      });
    });
  });
};

/**
 * Check if poster exists
 * @param {string} filename - Poster filename
 * @returns {boolean} True if poster exists
 */
const posterExists = (filename) => {
  const filePath = path.join(postersPath, filename);
  return fs.existsSync(filePath);
};

/**
 * Delete a poster
 * @param {string} filename - Poster filename
 * @returns {Promise<void>}
 */
const deletePoster = async (filename) => {
  const filePath = path.join(postersPath, filename);
  
  return new Promise((resolve, reject) => {
    if (!posterExists(filename)) {
      return reject(new Error('Poster not found'));
    }
    
    fs.unlink(filePath, (err) => {
      if (err) {
        return reject(new Error('Failed to delete poster'));
      }
      resolve();
    });
  });
};

module.exports = {
  getAllPosters,
  getPosterByFilename,
  posterExists,
  deletePoster
};
