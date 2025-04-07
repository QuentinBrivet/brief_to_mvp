import { useState } from 'react';
import PropTypes from 'prop-types';
import './ApiRequestViewer.css';

/**
 * Component for displaying API request data
 */
function ApiRequestViewer({ requestData }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!requestData || !requestData.data) {
    return (
      <div className="api-request-viewer">
        <p className="no-requests">No API requests recorded yet.</p>
      </div>
    );
  }
  
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };
  
  return (
    <div className="api-request-viewer">
      <div className="request-header">
        <h3>API Request Data</h3>
        <button 
          className="toggle-button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Hide' : 'Show'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="request-details">
          <div className="request-meta">
            <p><strong>Endpoint:</strong> {requestData.endpoint}</p>
            {requestData.timestamp && (
              <p><strong>Time:</strong> {formatDate(requestData.timestamp)}</p>
            )}
          </div>
          
          <div className="request-content">
            <h4>Request Body:</h4>
            <pre>{JSON.stringify(requestData.data, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

ApiRequestViewer.propTypes = {
  requestData: PropTypes.shape({
    endpoint: PropTypes.string,
    data: PropTypes.object,
    timestamp: PropTypes.string
  })
};

export default ApiRequestViewer; 