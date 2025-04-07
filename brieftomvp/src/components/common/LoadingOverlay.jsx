import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import './LoadingOverlay.css';
import LoadingSpinner from './LoadingSpinner';

const LoadingOverlay = ({ isLoading, message = "Crafting your MVP..." }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div 
          className="loading-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="loading-overlay-content">
            <motion.div 
              className="loading-spinner-container"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                transition: { delay: 0.2, duration: 0.4 }
              }}
            >
              <LoadingSpinner size="large" />
            </motion.div>
            
            <motion.div
              className="loading-message"
              initial={{ y: 20, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
                transition: { delay: 0.3, duration: 0.4 }
              }}
            >
              <h3>{message}</h3>
              <motion.div 
                className="loading-dots"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5, 
                  ease: "easeInOut"
                }}
              >
                <span>•</span>
                <span>•</span>
                <span>•</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

LoadingOverlay.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  message: PropTypes.string
};

export default LoadingOverlay; 