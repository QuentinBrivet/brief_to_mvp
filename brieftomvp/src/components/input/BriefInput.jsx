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
      <form onSubmit={handleSubmit}>
        <label htmlFor="brief-input">Enter your client brief</label>
        <textarea 
          id="brief-input"
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder={BRIEF_TEMPLATE}
          rows={12}
          required
          disabled={isLoading || isPdfLoading || disabled}
        />
        
        <div className="file-upload-container">
          <label htmlFor="pdf-upload" className={`pdf-upload-label ${disabled ? 'disabled' : ''}`}>
            {isPdfLoading ? (
              <LoadingSpinner size="small" text="Processing PDF..." />
            ) : (
              <>
                <span className="upload-icon">📄</span>
                Upload PDF Brief
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
          <p className="upload-hint">or upload a PDF document</p>
        </div>

        {pdfInfo && (
          <div className="pdf-info">
            <p>Loaded PDF: {pdfInfo.name} ({pdfInfo.size} KB)</p>
            <p className="pdf-tip">
              <strong>Note:</strong> PDF text extraction is limited. 
              Please review and edit the extracted content before generating the MVP flow.
            </p>
          </div>
        )}

        <div className="submit-container">
          {isLoading ? (
            <LoadingSpinner size="small" text="Processing brief and generating MVP flow..." />
          ) : (
            <button 
              type="submit" 
              className="submit-button"
              disabled={!brief.trim() || isPdfLoading || disabled}
            >
              Generate MVP Flow
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