/**
 * Application configuration
 */
const config = {
  /**
   * API configuration
   */
  api: {
    briefSetup: {
      url: 'ag:e90bcddf:20250326:brief-setup:602d5c60'
    },
    mvpMaker: {
      url: 'ag:e90bcddf:20250327:mvp-maker:3a34d762'
    },
    mistral: {
      baseUrl: 'https://api.mistral.ai/v1'
    }
  },
  
  /**
   * Application settings
   */
  app: {
    name: 'Brief to MVP'
  }
};

// Export constants for direct use in the application
export const MISTRAL_API_BASE_URL = config.api.mistral.baseUrl;
export const BRIEF_AGENT_ID = config.api.briefSetup.url;
export const MVP_MAKER_AGENT_ID = config.api.mvpMaker.url;

export default config; 