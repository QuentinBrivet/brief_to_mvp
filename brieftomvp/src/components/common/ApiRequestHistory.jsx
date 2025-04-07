import { useState } from 'react';
import PropTypes from 'prop-types';
import './ApiRequestHistory.css';

/**
 * Component for displaying the history of API requests
 */
function ApiRequestHistory({ requestHistory }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedRequestIndex, setSelectedRequestIndex] = useState(null);
  
  if (!requestHistory || requestHistory.length === 0) {
    return (
      <div className="api-history-container">
        <p className="no-history">No API request history available.</p>
      </div>
    );
  }
  
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };
  
  const getShortDescription = (request) => {
    if (!request) return '';
    
    const { endpoint, data } = request;
    
    // For chat completions
    if (endpoint === '/chat/completions' && data.agent_id) {
      // Get first few characters of the content for display
      const firstMessage = data.messages && data.messages[0]?.content;
      const shortContent = firstMessage 
        ? (firstMessage.length > 30 ? firstMessage.substring(0, 30) + '...' : firstMessage)
        : '[Empty content]';
      
      return `Agent: ${data.agent_id.substring(0, 15)}... - "${shortContent}"`;
    }
    
    // Default display
    return `${endpoint}`;
  };
  
  const selectedRequest = selectedRequestIndex !== null ? requestHistory[selectedRequestIndex] : null;
  
  return (
    <div className="api-history-container">
      <div className="history-header">
        <h3>API Request History</h3>
        <button 
          className="toggle-button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Hide' : 'Show'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="history-content">
          <div className="request-list">
            <h4>Recent Requests ({requestHistory.length})</h4>
            <ul>
              {requestHistory.map((request, index) => (
                <li 
                  key={index} 
                  className={selectedRequestIndex === index ? 'selected' : ''}
                  onClick={() => setSelectedRequestIndex(index)}
                >
                  <span className="request-time">{formatDate(request.timestamp)}</span>
                  <span className="request-endpoint">{request.endpoint}</span>
                  <span className="request-description">{getShortDescription(request)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {selectedRequest && (
            <div className="selected-request">
              <h4>Request Details</h4>
              <div className="request-meta">
                <p><strong>Endpoint:</strong> {selectedRequest.endpoint}</p>
                <p><strong>Time:</strong> {formatDate(selectedRequest.timestamp)}</p>
              </div>
              
              <div className="request-body">
                <h5>Request Body:</h5>
                <pre>{JSON.stringify(selectedRequest.data, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

ApiRequestHistory.propTypes = {
  requestHistory: PropTypes.arrayOf(
    PropTypes.shape({
      endpoint: PropTypes.string,
      data: PropTypes.object,
      timestamp: PropTypes.string
    })
  )
};

export default ApiRequestHistory; 