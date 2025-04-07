/**
 * Template strings used throughout the application
 */
export const BRIEF_TEMPLATE = `Product Name: [Your Product Name]

Problem Statement:
[Describe the problem your product solves and why it matters]

Target Users:
[Describe who will use this product and what their needs are]

Main Features:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Business Goals:
[What you hope to achieve with this MVP]

Technical Constraints (if any):
[Any limitations or specific requirements]

Additional Context:
[Any other relevant information]`;

/**
 * Error messages used in the application
 */
export const ERROR_MESSAGES = {
  GENERAL_ERROR: 'Failed to generate MVP flow. Please try again later.',
  EMPTY_BRIEF: 'Please enter a client brief before submitting.',
  API_TIMEOUT: 'The request timed out. Please try again later.',
  PDF_EXTRACTION_ERROR: 'Failed to extract text from the PDF. Please try another file or enter text manually.',
  INVALID_PDF: 'The selected file is not a valid PDF. Please select a valid PDF file.'
}; 