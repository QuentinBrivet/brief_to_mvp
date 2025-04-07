import axios from 'axios';
import { 
  BRIEF_AGENT_ID,
  MVP_MAKER_AGENT_ID
} from '../config/config.js';
import ErrorManager from './ErrorManager.js';

class MistralService {
  constructor() {
    // The API key is now included in the proxy configuration in vite.config.js
    // We'll just store the agent IDs
    this.briefAgentId = BRIEF_AGENT_ID;
    this.mvpMakerAgentId = MVP_MAKER_AGENT_ID;
    
    // Create an axios instance with the proxy URL
    this.client = axios.create({
      baseURL: '/api/mistral',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Store last request data for debugging
    this.lastRequestData = null;
    this.lastEndpoint = null;
    this.requestHistory = [];
  }

  // Helper to store request data
  _trackRequest(endpoint, data) {
    this.lastRequestData = data;
    this.lastEndpoint = endpoint;
    
    // Add to history with timestamp
    this.requestHistory.push({
      timestamp: new Date().toISOString(),
      endpoint,
      data
    });
    
    // Keep history limited to last 10 requests
    if (this.requestHistory.length > 10) {
      this.requestHistory.shift();
    }
    
    console.log(`Request to ${endpoint}:`, data);
    return data;
  }
  
  // Get request history
  getRequestHistory() {
    return this.requestHistory;
  }
  
  // Get last request data
  getLastRequest() {
    return {
      endpoint: this.lastEndpoint,
      data: this.lastRequestData
    };
  }

  async processBrief(rawBriefText) {
    try {
      console.log('Brief Agent ID:', this.briefAgentId);
      
      const conversationId = `brief-${Date.now()}`;
      
      // Request data - Using agents/completions endpoint and valid fields only
      const requestData = {
        agent_id: this.briefAgentId,
        messages: [
          { role: 'user', content: rawBriefText }
        ]
      };

      // Track the request
      this._trackRequest('/agents/completions', requestData);

      // Correct endpoint for agents completions
      const response = await this.client.post('/agents/completions', requestData);

      return { 
        conversationId, 
        content: response.data.choices[0].message.content 
      };
    } catch (error) {
      // Use the error manager to process the error
      const processedError = ErrorManager.processError(error, 'processBrief');
      console.error('Error calling Brief Setup agent:', processedError);
      throw processedError;
    }
  }

  async generateMVPFlow(processedBrief, conversationId) {
    try {
      console.log('MVP Maker Agent ID:', this.mvpMakerAgentId);
      
      // Request data - Using agents/completions endpoint and valid fields only
      const requestData = {
        agent_id: this.mvpMakerAgentId,
        messages: [
          { role: 'user', content: processedBrief }
        ]
      };
      
      // Track the request
      this._trackRequest('/agents/completions', requestData);

      // Correct endpoint for agents completions
      const response = await this.client.post('/agents/completions', requestData);

      return { 
        conversationId, 
        content: response.data.choices[0].message.content 
      };
    } catch (error) {
      // Use the error manager to process the error
      const processedError = ErrorManager.processError(error, 'generateMVPFlow');
      console.error('Error calling MVP Maker agent:', processedError);
      throw processedError;
    }
  }

  async processAndGenerateMVP(rawBriefText) {
    try {
      // Step 1: Process the brief with the first agent
      const processedBrief = await this.processBrief(rawBriefText);
      console.log('Brief processed successfully');
      
      // Step 2: Generate MVP flow with the second agent using the output from the first
      const mvpResult = await this.generateMVPFlow(processedBrief.content, processedBrief.conversationId);
      console.log('MVP flow generated successfully');
      
      return mvpResult.content;
    } catch (error) {
      // If it's already a processed error, just re-throw it
      if (error.type && error.source) {
        throw error;
      }
      
      // Otherwise process it
      const processedError = ErrorManager.processError(error, 'processAndGenerateMVP');
      console.error('Error in processing chain:', processedError);
      throw processedError;
    }
  }
  
  // For testing the API key without the agents
  async testConnection() {
    try {
      console.log('Testing connection with API...');
      
      // Track the request
      this._trackRequest('/models', {});
      
      // Use the proxy URL for testing connection too
      const response = await this.client.get('/models');
      
      console.log('Connection successful:', response.data);
      return true;
    } catch (error) {
      const processedError = ErrorManager.processError(error, 'testConnection');
      console.error('Connection test failed:', processedError);
      return false;
    }
  }
  
  async extractTextFromPDF(file) {
    // This would be implemented if we had a PDF extraction service
    // For now, we'll return a placeholder message
    return `Extracted text from PDF: ${file.name}. 
    
    Please replace this with the actual content of your brief.`;
  }
}

export default new MistralService();