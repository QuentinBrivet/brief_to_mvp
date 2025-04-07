import PropTypes from 'prop-types';
import { useState } from 'react';
import './ErrorMessage.css';

/**
 * Component for displaying error messages with optional technical details
 */
function ErrorMessage({ message, technicalDetails }) {
  const [showDetails, setShowDetails] = useState(false);
  
  if (!message) return null;
  
  return (
    <section className="error-section">
      <div className="error-container">
        <p className="error-message">{message}</p>
        
        {technicalDetails && (
          <div className="error-details">
            <button 
              className="details-toggle" 
              onClick={() => setShowDetails(!showDetails)}
              aria-expanded={showDetails}
            >
              {showDetails ? 'Hide Technical Details' : 'Show Technical Details'}
            </button>
            
            {showDetails && (
              <pre className="technical-details">
                {technicalDetails}
              </pre>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.string,
  technicalDetails: PropTypes.string
};

export default ErrorMessage; 