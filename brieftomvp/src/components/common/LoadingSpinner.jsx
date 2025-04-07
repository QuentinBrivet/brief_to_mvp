import PropTypes from 'prop-types';
import './LoadingSpinner.css';

/**
 * Loading spinner component
 */
function LoadingSpinner({ size = 'medium', text = 'Loading...' }) {
  const sizeClass = size === 'small' 
    ? 'spinner-small' 
    : size === 'large' 
      ? 'spinner-large' 
      : 'spinner-medium';

  return (
    <div className="spinner-container">
      <div className={`spinner ${sizeClass}`}>
        <div className="spinner-inner"></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string
};

export default LoadingSpinner; 