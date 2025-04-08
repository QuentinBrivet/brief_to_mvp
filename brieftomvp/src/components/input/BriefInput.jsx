import { useState } from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from '../common/LoadingSpinner';
import MistralService from '../../services/MistralService';
import { BRIEF_TEMPLATE } from '../../constants/templates';
import './BriefInput.css';

/**
 * Component for the brief input form
 */
function BriefInput({ onSubmit, isLoading, disabled }) {
  const [brief, setBrief] = useState('');
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfInfo, setPdfInfo] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!brief.trim()) return;
    onSubmit(brief);
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') return;
    
    try {
      setIsPdfLoading(true);
      setPdfInfo(null);
      const extractedText = await MistralService.extractTextFromPDF(file);
      setBrief(extractedText);
      setPdfInfo({
        name: file.name,
        size: Math.round(file.size / 1024)
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Failed to process PDF. Please try again or use text input instead.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <section className="input-section">
      <form onSubmit={handleSubmit} className="card-shadow">
        <label htmlFor="brief-input" className="input-label">What's your project about?</label>
        <textarea 
          id="brief-input"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Enter the details of your project brief here..."
          rows={12}
          required
          disabled={isLoading || isPdfLoading || disabled}
          className="modern-input"
        />
        
        {pdfInfo && (
          <div className="pdf-info">
            <p>
              <span className="pdf-icon">📄</span>
              <strong>{pdfInfo.name}</strong> ({pdfInfo.size} KB)
            </p>
            <p className="pdf-tip">
              <strong>Pro tip:</strong> Review the extracted content before generating your PRD.
            </p>
          </div>
        )}

        <div className="submit-container">
          <label htmlFor="pdf-upload" className={`pdf-upload-label button-like ${disabled ? 'disabled' : ''}`}>
            {isPdfLoading ? (
              <LoadingSpinner size="small" text="Processing..." />
            ) : (
              <>
                <span className="upload-icon">📄</span>
                <span>Add File</span>
              </>
            )}
          </label>
          <input
            type="file"
            id="pdf-upload"
            accept="application/pdf"
            onChange={handlePdfUpload}
            disabled={isLoading || isPdfLoading || disabled}
            style={{ display: 'none' }}
          />
          
          {isLoading && !isPdfLoading ? (
            <LoadingSpinner size="small" text="Generating PRD..." />
          ) : (
            <button 
              type="submit" 
              className="submit-button"
              disabled={!brief.trim() || isPdfLoading || isLoading || disabled}
            >
              <span>Generate my PRD</span>
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

BriefInput.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  disabled: PropTypes.bool
};

BriefInput.defaultProps = {
  disabled: false
};

export default BriefInput; 