import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { marked } from 'marked';
import { motion } from 'framer-motion';
import './ResultView.css';

/**
 * Component for displaying the raw markdown MVP flow result
 */
function ResultView({ result }) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [sections, setSections] = useState([]);
  
  useEffect(() => {
    // Create timestamp
    const now = new Date();
    setTimestamp(now.toLocaleString());
    
    // Calculate word count
    const words = result.trim().split(/\s+/).length;
    setWordCount(words);

    // Process markdown into sections
    const processedSections = processMarkdown(result);
    setSections(processedSections);
  }, [result]);

  // Function to process markdown into sections
  const processMarkdown = (markdownText) => {
    // Split the markdown by main headers (H1)
    const mainSections = markdownText.split(/(?=^# )/gm);
    
    return mainSections.map(section => {
      const lines = section.trim().split('\n');
      const mainHeader = lines[0];
      const content = lines.slice(1).join('\n');
      
      // Split content by H3 headers
      const h3Sections = content.split(/(?=^### )/gm).map(h3Section => {
        const h3Lines = h3Section.trim().split('\n');
        const h3Header = h3Lines[0].startsWith('### ') ? h3Lines[0] : '';
        const h3Content = h3Header ? h3Lines.slice(1).join('\n').trim() : h3Section.trim();
        
        return {
          header: h3Header,
          content: h3Content
        };
      });

      return {
        header: mainHeader,
        h3Sections: h3Sections
      };
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12
      }
    }
  };

  // Function to copy markdown to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(result)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <motion.section 
      className="result-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="result-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2>Your MVP Flow</h2>
        <motion.button 
          className="copy-button" 
          onClick={copyToClipboard}
          title="Copy to clipboard"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          {copySuccess ? 'Copied!' : 'Copy'}
        </motion.button>
      </motion.div>
      
      <motion.div 
        className="result-meta"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <span className="result-timestamp">Generated: {timestamp}</span>
        <span className="result-wordcount">{wordCount} words</span>
      </motion.div>
      
      <motion.div 
        className="result-content"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div className="markdown-container">
          {sections.map((section, index) => (
            <motion.div 
              key={index} 
              className="section-block"
              variants={itemVariants}
            >
              <div dangerouslySetInnerHTML={{ __html: marked(section.header) }} />
              {section.h3Sections.map((h3Section, h3Index) => (
                <motion.div 
                  key={h3Index} 
                  className="h3-section"
                  variants={itemVariants}
                >
                  {h3Section.header && (
                    <div dangerouslySetInnerHTML={{ __html: marked(h3Section.header) }} />
                  )}
                  {h3Section.content && (
                    <div className="h3-content" dangerouslySetInnerHTML={{ __html: marked(h3Section.content) }} />
                  )}
                </motion.div>
              ))}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
}

ResultView.propTypes = {
  result: PropTypes.string.isRequired
};

export default ResultView; 