const posterService = require('../services/posterService');
const MapRequest = require('../models/MapRequest');

/**
 * Convert a Leaflet/slippy-map zoom level to a radius in meters.
 *
 * Uses the standard Web Mercator formula:
 *   metersPerPixel = (earthCircumference * cos(lat)) / (256 * 2^zoom)
 * The radius is half the poster frame width expressed in meters.
 *
 * @param {number} zoom        - Leaflet zoom level (0-20)
 * @param {number} lat         - Center latitude in degrees
 * @param {number} frameWidthPx - Width of the poster frame in CSS pixels (default 600)
 * @returns {number} Radius in meters (clamped to [500, 100000])
 */
function zoomToDistance(zoom, lat, frameWidthPx = 600) {
  const EARTH_CIRCUMFERENCE = 40075016.686;
  const metersPerPixel =
    (EARTH_CIRCUMFERENCE * Math.cos((lat * Math.PI) / 180)) /
    Math.pow(2, zoom + 8);
  const radius = Math.round((metersPerPixel * frameWidthPx) / 2);
  return Math.max(500, Math.min(100000, radius));
}

/**
 * POST /api/render-preview
 * Free watermarked preview at 72 DPI — no auth required.
 *
 * Body: { center_lat, center_lng, zoom, country, theme, orientation,
 *         title, titlePos, fullBorders, frameWidthPx }
 */
const renderPreview = (req, res) => {
  const {
    center_lat,
    center_lng,
    zoom,
    country,
    theme = 'feature_based',
    orientation = 'vertical',
    title,
    titlePos = 'bottom-center',
    fullBorders = false,
    frameWidthPx = 600
  } = req.body;

  if (center_lat == null || center_lng == null || zoom == null) {
    return res.status(400).json({
      error: 'center_lat, center_lng, and zoom are required'
    });
  }
  if (!country) {
    return res.status(400).json({ error: 'country is required' });
  }

  const lat = parseFloat(center_lat);
  const lng = parseFloat(center_lng);
  const zoomLevel = parseInt(zoom, 10);
  const distance = zoomToDistance(zoomLevel, lat, frameWidthPx);

  try {
    const { jobId } = posterService.startGeneration({
      coords: `${lat},${lng}`,
      country,
      theme,
      distance,
      orientation,
      title,
      titlePos,
      fullBorders,
      dpi: 72,
      watermark: true
    });

    res.json({
      jobId,
      distance,
      message: 'Preview generation started',
      logsUrl: `/api/logs/${jobId}`
    });
  } catch (error) {
    console.error('Preview render error:', error);
    res.status(500).json({ error: 'Failed to start preview', message: error.message });
  }
};

/**
 * POST /api/render-final/:requestId
 * High-res 300 DPI render — requires auth + completed payment.
 * The paymentCheckMiddleware and authMiddleware are applied in the route.
 *
 * Body: same shape as renderPreview (coordinates pulled from stored MapRequest
 *       when requestId is present, otherwise accepts the same body params)
 */
const renderFinal = (req, res) => {
  // req.mapRequest is attached by paymentCheckMiddleware
  const mapRequest = req.mapRequest;

  const coords = mapRequest.coords ||
    (mapRequest.city
      ? null
      : `${req.body.center_lat},${req.body.center_lng}`);

  const config = {
    city: mapRequest.city || null,
    country: mapRequest.country,
    coords,
    theme: mapRequest.theme,
    distance: mapRequest.distance,
    orientation: mapRequest.orientation,
    title: mapRequest.title || null,
    titlePos: mapRequest.title_pos,
    fullBorders: !!mapRequest.full_borders,
    dpi: 300,
    watermark: false
  };

  try {
    const { jobId } = posterService.startGeneration(config);

    // Track the high-res filename once the job completes
    const job = posterService.getJob(jobId);
    if (job) {
      const originalClose = job.process.listeners('close')[0];
      job.process.once('close', async (code) => {
        if (code === 0 && job.result && job.result.filename) {
          await MapRequest.updateHighResFilename(mapRequest.map_request_id, job.result.filename);
        }
      });
    }

    res.json({
      jobId,
      message: 'High-res generation started',
      logsUrl: `/api/logs/${jobId}`
    });
  } catch (error) {
    console.error('Final render error:', error);
    res.status(500).json({ error: 'Failed to start high-res render', message: error.message });
  }
};

module.exports = { renderPreview, renderFinal, zoomToDistance };
