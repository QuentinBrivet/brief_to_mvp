/**
 * Error Manager Service
 * 
 * Provides centralized error handling, logging, and diagnostics
 * for API and application errors.
 */

class ErrorManager {
  constructor() {
    this.errorTypes = {
      NETWORK: 'network',
      API: 'api',
      AUTH: 'auth',
      VALIDATION: 'validation',
      AGENT: 'agent',
      SERVER: 'server',
      UNKNOWN: 'unknown'
    };
  }

  /**
   * Process an error and return a structured error object
   * @param {Error} error - The caught error
   * @param {string} source - Where the error occurred (e.g., 'processBrief', 'generateMVP')
   * @returns {Object} Structured error with type, message, details, and source
   */
  processError(error, source) {
    console.error(`Error in ${source}:`, error);
    
    let errorType = this.errorTypes.UNKNOWN;
    let message = 'An unexpected error occurred.';
    let details = {};
    
    // Network errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      errorType = this.errorTypes.NETWORK;
      message = 'The request timed out. Please try again later.';
      details = { timeout: true };
    } 
    // Axios response errors
    else if (error.response) {
      const { status, data } = error.response;
      
      // Authentication errors
      if (status === 401 || status === 403) {
        errorType = this.errorTypes.AUTH;
        message = 'Authentication failed. Please check your API key.';
        details = { status, data };
      } 
      // Agent errors
      else if (status === 404 && error.config?.url?.includes('agent_id')) {
        errorType = this.errorTypes.AGENT;
        message = 'The specified agent was not found. Please check your agent ID.';
        details = { 
          status, 
          data,
          agentId: this.extractAgentId(error.config?.data)
        };
      }
      // Rate limits
      else if (status === 429) {
        errorType = this.errorTypes.API;
        message = 'Rate limit exceeded. Please try again later.';
        details = { status, data };
      }
      // Server errors
      else if (status >= 500) {
        errorType = this.errorTypes.SERVER;
        message = 'The server encountered an error. Please try again later.';
        details = { status, data };
      }
      // Other API errors
      else {
        errorType = this.errorTypes.API;
        message = data?.error?.message || 'The API returned an error.';
        details = { status, data };
      }
    } 
    // Network errors without response
    else if (error.request) {
      errorType = this.errorTypes.NETWORK;
      message = 'Unable to connect to the API. Please check your internet connection.';
      details = { request: error.request };
    }

    return {
      type: errorType,
      message,
      details,
      source,
      raw: error,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Extract agent ID from request data
   * @param {string} data - The request data string
   * @returns {string|null} - The agent ID or null
   */
  extractAgentId(data) {
    if (!data) return null;
    
    try {
      const parsed = JSON.parse(data);
      return parsed.agent_id || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Get a user-friendly message for the error
   * @param {Object} errorObj - The processed error object
   * @returns {string} - User-friendly error message
   */
  getUserMessage(errorObj) {
    // Agent-specific detailed messages
    if (errorObj.type === this.errorTypes.AGENT) {
      return `Agent not found: ${errorObj.details.agentId || 'Unknown agent'}. Please check your agent configuration.`;
    }
    
    // Auth-specific messages
    if (errorObj.type === this.errorTypes.AUTH) {
      return 'Authentication failed. Please check your API key in vite.config.js.';
    }
    
    // Network-specific messages
    if (errorObj.type === this.errorTypes.NETWORK) {
      if (errorObj.details.timeout) {
        return 'Request timed out. The Mistral AI service may be busy. Please try again later.';
      }
      return 'Connection failed. Please check your internet connection and try again.';
    }
    
    // Server errors
    if (errorObj.type === this.errorTypes.SERVER) {
      return `Mistral AI server error (${errorObj.details.status}). Please try again later.`;
    }

    // Default to the message from the processed error
    return errorObj.message;
  }

  /**
   * Get technical details formatted for debugging
   * @param {Object} errorObj - The processed error object
   * @returns {string} - Formatted technical details
   */
  getTechnicalDetails(errorObj) {
    const details = [];
    
    details.push(`Error Type: ${errorObj.type}`);
    details.push(`Source: ${errorObj.source}`);
    details.push(`Time: ${errorObj.timestamp}`);
    
    if (errorObj.details.status) {
      details.push(`Status: ${errorObj.details.status}`);
    }
    
    if (errorObj.details.data && errorObj.details.data.error) {
      details.push(`API Error: ${JSON.stringify(errorObj.details.data.error)}`);
    }
    
    return details.join('\n');
  }
}

export default new ErrorManager(); 