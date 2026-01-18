const posterGalleryService = require('../services/posterGalleryService');

/**
 * Get all posters
 */
const getAllPosters = async (req, res) => {
  try {
    const posters = await posterGalleryService.getAllPosters();
    res.json(posters);
  } catch (error) {
    console.error('Error getting posters:', error);
    res.status(500).json({ error: 'Failed to load posters', message: error.message });
  }
};

/**
 * Get a specific poster
 */
const getPosterByFilename = async (req, res) => {
  const { filename } = req.params;
  
  try {
    const poster = await posterGalleryService.getPosterByFilename(filename);
    res.json(poster);
  } catch (error) {
    console.error('Error getting poster:', error);
    res.status(404).json({ error: 'Poster not found', message: error.message });
  }
};

/**
 * Delete a poster
 */
const deletePoster = async (req, res) => {
  const { filename } = req.params;
  
  try {
    await posterGalleryService.deletePoster(filename);
    res.json({ message: 'Poster deleted successfully' });
  } catch (error) {
    console.error('Error deleting poster:', error);
    res.status(404).json({ error: 'Failed to delete poster', message: error.message });
  }
};

module.exports = {
  getAllPosters,
  getPosterByFilename,
  deletePoster
};
