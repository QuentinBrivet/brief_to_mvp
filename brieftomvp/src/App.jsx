import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BriefInput } from './components/input'
import { ResultView } from './components/output'
import { ErrorMessage, LoadingOverlay } from './components/common'
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

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 260,
      damping: 20,
      duration: 0.5 
    }
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

  // Test API connection when the component mounts
  useEffect(() => {
    const testConnection = async () => {
      try {
        const connected = await MistralService.testConnection()
        setApiConnected(connected)
        
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
    } catch (err) {
      console.error('Error calling Mistral API:', err)
      
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
      <LoadingOverlay isLoading={isLoading} message="Crafting your PRD..." />
      
      <div className="app-background">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>
      
      <motion.header
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
        className="modern-header"
      >
        <motion.h1 variants={slideUp} className="gradient-text">Brief to PRD</motion.h1>
        <motion.p variants={slideUp} className="tagline">Transform your project brief into a stunning product requirement document</motion.p>
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
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ 
                type: "spring",
                damping: 25,
                stiffness: 200
              }}
              className="result-container"
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
        className="modern-footer"
      >
        <p>Powered by <span className="highlight">Mistral AI</span></p>
      </motion.footer>
    </div>
  )
}

export default App
