/**
 * SSE Service for handling Server-Sent Events
 * Manages EventSource connections for real-time log streaming
 */
export class SSEService {
  constructor() {
    this.eventSource = null
    this.callbacks = {
      onMessage: null,
      onError: null,
      onComplete: null
    }
  }

  /**
   * Connect to SSE endpoint
   * @param {string} url - SSE endpoint URL
   * @param {Object} callbacks - Event callbacks
   */
  connect(url, callbacks = {}) {
    // Close existing connection if any
    this.disconnect()

    // Store callbacks
    this.callbacks = {
      onMessage: callbacks.onMessage || (() => {}),
      onError: callbacks.onError || (() => {}),
      onComplete: callbacks.onComplete || (() => {})
    }

    // Create new EventSource
    this.eventSource = new EventSource(url)

    // Handle messages
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'stdout' || data.type === 'stderr') {
          this.callbacks.onMessage({
            type: data.type,
            message: data.message,
            timestamp: Date.now()
          })
        } else if (data.type === 'complete') {
          this.callbacks.onComplete(data)
          this.disconnect()
        } else if (data.type === 'error') {
          this.callbacks.onError(data)
          this.disconnect()
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error)
        this.callbacks.onError({ message: 'Error parsing server response' })
      }
    }

    // Handle errors
    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error)
      this.callbacks.onError({ message: 'Connection lost' })
      this.disconnect()
    }
  }

  /**
   * Disconnect from SSE endpoint
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
  }

  /**
   * Check if connected
   * @returns {boolean} Connection status
   */
  isConnected() {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN
  }
}

export default new SSEService()
