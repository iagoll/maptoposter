const posterService = require('../services/posterService');

/**
 * Generate a new poster
 */
const generatePoster = (req, res) => {
  const {
    city,
    country,
    theme = 'feature_based',
    distance = 29000,
    orientation = 'vertical',
    coords,
    title,
    titlePos = 'bottom-center',
    fullBorders = false
  } = req.body;

  // Validate required fields
  if (coords) {
    if (!country) {
      return res.status(400).json({ error: '--country is required when using --coords' });
    }
  } else {
    if (!city || !country) {
      return res.status(400).json({ error: '--city and --country are required' });
    }
  }

  try {
    const { jobId } = posterService.startGeneration({
      city,
      country,
      theme,
      distance,
      orientation,
      coords,
      title,
      titlePos,
      fullBorders
    });

    res.json({
      jobId,
      message: 'Map generation started',
      logsUrl: `/api/logs/${jobId}`
    });
  } catch (error) {
    console.error('Error starting generation:', error);
    res.status(500).json({ error: 'Failed to start generation', message: error.message });
  }
};

/**
 * Get job status
 */
const getJobStatus = (req, res) => {
  const { jobId } = req.params;
  const processData = posterService.getJob(jobId);

  if (!processData) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({
    jobId,
    status: processData.status,
    exitCode: processData.exitCode,
    result: processData.result,
    error: processData.error,
    logCount: processData.logs.length
  });
};

/**
 * Stream logs via Server-Sent Events
 */
const streamLogs = (req, res) => {
  const { jobId } = req.params;
  const processData = posterService.getJob(jobId);

  if (!processData) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', jobId })}\n\n`);

  // Send all previous logs
  processData.logs.forEach(log => {
    res.write(`data: ${JSON.stringify({ type: log.type, message: log.message })}\n\n`);
  });

  // If process already completed, send completion event
  if (processData.status !== 'running') {
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      status: processData.status,
      exitCode: processData.exitCode,
      result: processData.result
    })}\n\n`);
    return res.end();
  }

  // Add this client to the list of active clients for this job
  processData.clients.push(res);

  // Remove client when connection closes
  req.on('close', () => {
    const index = processData.clients.indexOf(res);
    if (index !== -1) {
      processData.clients.splice(index, 1);
    }
  });
};

/**
 * Get all jobs
 */
const getAllJobs = (req, res) => {
  const jobs = posterService.getAllJobs();
  res.json(jobs);
};

module.exports = {
  generatePoster,
  getJobStatus,
  streamLogs,
  getAllJobs
};
