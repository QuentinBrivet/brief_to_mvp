import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BriefInput } from './components/input'
import { ResultView } from './components/output'
import { ErrorMessage, ApiRequestViewer, ApiRequestHistory, LoadingOverlay } from './components/common'
import MistralService from './services/MistralService'
import ErrorManager from './services/ErrorManager'
import { ERROR_MESSAGES } from './constants/templates'
import './styles/theme/theme.css'
import './styles/global.css'

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
}

/**
 * Main App component
 */
function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [technicalDetails, setTechnicalDetails] = useState(null)
  const [apiConnected, setApiConnected] = useState(true) // Default to true to avoid flashing UI
  const [apiRequestData, setApiRequestData] = useState(null)
  const [apiRequestHistory, setApiRequestHistory] = useState([])
  const [showDebug, setShowDebug] = useState(window.innerWidth > 768) // Collapse debug by default on mobile

  // Test API connection when the component mounts
  useEffect(() => {
    const testConnection = async () => {
      try {
        const connected = await MistralService.testConnection()
        setApiConnected(connected)
        
        // Set last request data
        if (MistralService.getRequestHistory().length > 0) {
          setApiRequestData(MistralService.getRequestHistory()[MistralService.getRequestHistory().length - 1]);
          setApiRequestHistory(MistralService.getRequestHistory());
        }
        
        if (!connected) {
          console.error('API connection failed. Check the API key in vite.config.js.')
          setError('Unable to connect to Mistral API. Please check your API key configuration.')
        }
      } catch (err) {
        console.error('Error testing API connection:', err)
        setApiConnected(false)
        
        // Handle test connection errors
        if (err.type && err.source) {
          setError(ErrorManager.getUserMessage(err))
          setTechnicalDetails(ErrorManager.getTechnicalDetails(err))
        } else {
          setError('Failed to connect to Mistral API.')
        }
      }
    }
    
    testConnection()
    
    // Add resize listener for responsive layout
    const handleResize = () => {
      setShowDebug(window.innerWidth > 768)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  /**
   * Handle the brief submission
   * @param {string} briefText - The brief text submitted by the user
   */
  const handleBriefSubmit = async (briefText) => {
    // Don't proceed if API isn't connected
    if (!apiConnected) {
      setError('API connection not established. Please refresh the page and try again.')
      return
    }
    
    setIsLoading(true)
    setError(null)
    setTechnicalDetails(null)
    
    try {
      // Call the Mistral API via our service using both agents in sequence
      const response = await MistralService.processAndGenerateMVP(briefText)
      setResult(response)
      
      // Update API request data display
      const history = MistralService.getRequestHistory();
      if (history.length > 0) {
        // Show the last request made
        setApiRequestData(history[history.length - 1]);
        setApiRequestHistory(history);
      }
    } catch (err) {
      console.error('Error calling Mistral API:', err)
      
      // Update request history even on error
      setApiRequestHistory(MistralService.getRequestHistory());
      
      // If it's a processed error with our enhanced format
      if (err.type && err.source) {
        setError(ErrorManager.getUserMessage(err))
        setTechnicalDetails(ErrorManager.getTechnicalDetails(err))
      } 
      // Handle legacy/unexpected errors
      else if (err.response && err.response.status === 401) {
        setError(ERROR_MESSAGES.GENERAL_ERROR)
      } else if (err.code === 'ECONNABORTED') {
        setError(ERROR_MESSAGES.API_TIMEOUT)
      } else if (err.message && err.message.includes('PDF')) {
        setError(ERROR_MESSAGES.PDF_EXTRACTION_ERROR)
      } else {
        setError(ERROR_MESSAGES.GENERAL_ERROR)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-container">
      {/* Loading Overlay */}
      <LoadingOverlay isLoading={isLoading} message="Crafting your MVP..." />
      
      <motion.header
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h1>Brief to MVP</h1>
        <p className="tagline">Transform your client brief into an MVP flow and screen design</p>
      </motion.header>
      
      <main>
        {/* Brief Input Component */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <BriefInput 
            onSubmit={handleBriefSubmit} 
            isLoading={isLoading} 
            disabled={!apiConnected}
          />
        </motion.div>
        
        {/* API Request Debugging Components */}
        {apiRequestData && (
          <motion.div 
            className="debug-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: showDebug ? 1 : 0.5, 
              height: 'auto',
              transition: { duration: 0.3 }
            }}
          >
            <div className="debug-header" onClick={() => setShowDebug(!showDebug)}>
              <h2>API Request Debugging</h2>
              <button className="toggle-button">
                {showDebug ? '▼' : '►'}
              </button>
            </div>
            
            {showDebug && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ApiRequestViewer requestData={apiRequestData} />
                <ApiRequestHistory requestHistory={apiRequestHistory} />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Error Message Component */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ErrorMessage 
                message={error} 
                technicalDetails={technicalDetails}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result View Component */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5,
                delay: 0.2
              }}
            >
              <ResultView result={result} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <p>Powered by Mistral AI</p>
      </motion.footer>
    </div>
  )
}

export default App
