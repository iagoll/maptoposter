import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// API Service
export const apiService = {
  /**
   * Generate a new map poster
   * @param {Object} data - Poster configuration
   * @returns {Promise} Response with jobId
   */
  async generatePoster(data) {
    const response = await apiClient.post('/api/generate', data)
    return response.data
  },

  /**
   * Get job status
   * @param {string} jobId - Job identifier
   * @returns {Promise} Job status and information
   */
  async getJobStatus(jobId) {
    const response = await apiClient.get(`/api/jobs/${jobId}`)
    return response.data
  },

  /**
   * Get all available themes
   * @returns {Promise} Array of theme objects
   */
  async getThemes() {
    const response = await apiClient.get('/api/themes')
    return response.data
  },

  /**
   * Get list of generated posters
   * @returns {Promise} Array of poster objects
   */
  async getPosters() {
    const response = await apiClient.get('/api/posters')
    return response.data
  },

  /**
   * Check server health
   * @returns {Promise} Health status
   */
  async getHealth() {
    const response = await apiClient.get('/health')
    return response.data
  },

  /**
   * Get full image URL
   * @param {string} path - Relative path to image
   * @returns {string} Full URL
   */
  getImageUrl(path) {
    return `${API_BASE_URL}${path}`
  },

  /**
   * Get SSE endpoint URL for logs
   * @param {string} jobId - Job identifier
   * @returns {string} SSE endpoint URL
   */
  getLogsUrl(jobId) {
    return `${API_BASE_URL}/api/logs/${jobId}`
  },

  // ============================================
  // User History API
  // ============================================

  /**
   * Get user's purchase history (only paid posters)
   * @param {number} limit - Number of records to return
   * @returns {Promise} Array of purchased posters
   */
  async getPurchaseHistory(limit = 50) {
    const response = await apiClient.get('/api/history/purchases', {
      params: { limit }
    })
    return response.data
  },

  /**
   * Get user's preview history (all generated previews)
   * @param {number} limit - Number of records to return
   * @returns {Promise} Array of all previews
   */
  async getPreviewHistory(limit = 50) {
    const response = await apiClient.get('/api/history/previews', {
      params: { limit }
    })
    return response.data
  },

  /**
   * Get user's complete history with payment status
   * @param {number} limit - Number of records to return
   * @returns {Promise} Array of all requests with payment info
   */
  async getCompleteHistory(limit = 50) {
    const response = await apiClient.get('/api/history/complete', {
      params: { limit }
    })
    return response.data
  },

  /**
   * Get user statistics
   * @returns {Promise} User statistics object
   */
  async getUserStats() {
    const response = await apiClient.get('/api/history/stats')
    return response.data
  },

  /**
   * Get specific request details
   * @param {number} requestId - Map request ID
   * @returns {Promise} Request details
   */
  async getRequestDetails(requestId) {
    const response = await apiClient.get(`/api/history/request/${requestId}`)
    return response.data
  },

  /**
   * Get recent purchases (for dashboard)
   * @param {number} limit - Number of records to return
   * @returns {Promise} Array of recent purchases
   */
  async getRecentPurchases(limit = 5) {
    const response = await apiClient.get('/api/history/recent', {
      params: { limit }
    })
    return response.data
  },

  /**
   * Get user's favorite themes
   * @returns {Promise} Array of themes with usage count
   */
  async getFavoriteThemes() {
    const response = await apiClient.get('/api/history/favorite-themes')
    return response.data
  },

  /**
   * Get download URLs for a request
   * @param {number} requestId - Map request ID
   * @returns {Promise} Download URLs object
   */
  async getDownloadUrls(requestId) {
    const response = await apiClient.get(`/api/history/download/${requestId}`)
    return response.data
  },

  /**
   * Check if user has purchased a specific request
   * @param {number} requestId - Map request ID
   * @returns {Promise} Purchase status
   */
  async checkPurchaseStatus(requestId) {
    const response = await apiClient.get(`/api/history/check/${requestId}`)
    return response.data
  },

  // ============================================
  // Hybrid Render API (Map Frame flow)
  // ============================================

  /**
   * Start a free watermarked 72-DPI preview from map coordinates.
   * @param {Object} data - { center_lat, center_lng, zoom, country, theme, orientation, ... }
   * @returns {Promise} { jobId, distance, logsUrl }
   */
  async renderPreview(data) {
    const response = await apiClient.post('/api/render-preview', data)
    return response.data
  },

  /**
   * Initiate checkout: creates MapRequest + Stripe session in one call.
   * @param {Object} data  - Poster config (same as renderPreview)
   * @param {string} token - Firebase ID token
   * @returns {Promise} { sessionId, url, requestId }
   */
  async initiateCheckout(data, token) {
    const response = await apiClient.post('/api/payment/initiate', data, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  /**
   * Start high-res 300-DPI render (requires completed payment).
   * @param {string|number} requestId
   * @param {string} token - Firebase ID token
   * @returns {Promise} { jobId, logsUrl }
   */
  async renderFinal(requestId, token) {
    const response = await apiClient.post(
      `/api/render-final/${requestId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  },

  /**
   * Check payment status for a map request.
   * @param {string|number} requestId
   * @param {string} token - Firebase ID token
   * @returns {Promise} { paid, highResReady, highResUrl }
   */
  async getPaymentStatus(requestId, token) {
    const response = await apiClient.get(`/api/payment/status/${requestId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return response.data
  },

  /**
   * Send the high-res poster to an email address via Resend.
   * @param {string|number} requestId
   * @param {string} email
   * @param {string} token - Firebase ID token
   * @returns {Promise} { success, emailId }
   */
  async sendPosterByEmail(requestId, email, token) {
    const response = await apiClient.post(
      `/api/payment/send-email/${requestId}`,
      { email },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return response.data
  }
}

export default apiService
