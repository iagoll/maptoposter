const { spawn } = require('child_process');
const path = require('path');

// Path to Python virtual environment
const pythonPath = path.join(__dirname, '../../../python_logic/venv/bin/python3');
const scriptPath = path.join(__dirname, '../../../python_logic/create_map_poster.py');

// Store active processes and their event emitters
const activeProcesses = new Map();

/**
 * Generate a unique job ID
 * @returns {string} Unique job identifier
 */
const generateJobId = () => {
  return Date.now().toString() + '-' + Math.random().toString(36).substring(7);
};

/**
 * Build command arguments for Python script
 * @param {Object} config - Generation configuration
 * @returns {Array} Command arguments
 */
const buildCommandArgs = (config) => {
  const { city, country, theme, distance, orientation, coords, title, titlePos, fullBorders } = config;
  
  const args = [scriptPath];
  
  if (city) args.push('--city', city);
  if (country) args.push('--country', country);
  if (theme) args.push('--theme', theme);
  if (distance) args.push('--distance', distance.toString());
  if (orientation) args.push('-o', orientation);
  if (coords) args.push('--coords', coords);
  if (title) args.push('--title', title);
  if (titlePos) args.push('--title-pos', titlePos);
  if (fullBorders) args.push('--full-borders');
  
  return args;
};

/**
 * Start a new poster generation job
 * @param {Object} config - Generation configuration
 * @returns {Object} Job information with jobId
 */
const startGeneration = (config) => {
  const jobId = generateJobId();
  const args = buildCommandArgs(config);

  // Spawn Python process
  const pythonProcess = spawn(pythonPath, args, {
    cwd: path.join(__dirname, '../../../python_logic')
  });

  // Store process data
  const processData = {
    process: pythonProcess,
    logs: [],
    status: 'running',
    result: null,
    clients: [],
    config
  };

  activeProcesses.set(jobId, processData);

  // Handle stdout
  pythonProcess.stdout.on('data', (data) => {
    const message = data.toString();
    processData.logs.push({ type: 'stdout', message, timestamp: Date.now() });
    
    // Broadcast to all connected SSE clients for this job
    processData.clients.forEach(client => {
      client.write(`data: ${JSON.stringify({ type: 'stdout', message })}\n\n`);
    });
  });

  // Handle stderr
  pythonProcess.stderr.on('data', (data) => {
    const message = data.toString();
    processData.logs.push({ type: 'stderr', message, timestamp: Date.now() });
    
    // Broadcast to all connected SSE clients for this job
    processData.clients.forEach(client => {
      client.write(`data: ${JSON.stringify({ type: 'stderr', message })}\n\n`);
    });
  });

  // Handle process completion
  pythonProcess.on('close', (code) => {
    processData.status = code === 0 ? 'completed' : 'failed';
    processData.exitCode = code;

    // Extract output filename from logs if successful
    if (code === 0) {
      const lastLogs = processData.logs.slice(-10).map(l => l.message).join('');
      const match = lastLogs.match(/posters\/([^\s]+\.png)/);
      if (match) {
        processData.result = {
          filename: match[1],
          url: `/posters/${match[1]}`
        };
      }
    }

    // Notify all connected clients
    processData.clients.forEach(client => {
      client.write(`data: ${JSON.stringify({ 
        type: 'complete', 
        status: processData.status,
        exitCode: code,
        result: processData.result
      })}\n\n`);
      client.end();
    });

    // Clear clients array
    processData.clients = [];

    // Clean up after 5 minutes
    setTimeout(() => {
      activeProcesses.delete(jobId);
    }, 5 * 60 * 1000);
  });

  // Handle process errors
  pythonProcess.on('error', (error) => {
    processData.status = 'error';
    processData.error = error.message;
    
    processData.clients.forEach(client => {
      client.write(`data: ${JSON.stringify({ 
        type: 'error', 
        message: error.message 
      })}\n\n`);
      client.end();
    });

    processData.clients = [];
  });

  return { jobId, processData };
};

/**
 * Get job information
 * @param {string} jobId - Job identifier
 * @returns {Object|null} Job data or null if not found
 */
const getJob = (jobId) => {
  return activeProcesses.get(jobId) || null;
};

/**
 * Get all active jobs
 * @returns {Array} Array of job information
 */
const getAllJobs = () => {
  const jobs = [];
  activeProcesses.forEach((data, jobId) => {
    jobs.push({
      jobId,
      status: data.status,
      config: data.config,
      logCount: data.logs.length
    });
  });
  return jobs;
};

/**
 * Get active job count
 * @returns {number} Number of active jobs
 */
const getActiveJobCount = () => {
  return activeProcesses.size;
};

module.exports = {
  startGeneration,
  getJob,
  getAllJobs,
  getActiveJobCount
};
