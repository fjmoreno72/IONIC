/**
 * FileUploader - A reusable component for handling file uploads with preview
 * 
 * This component creates a file input with preview capabilities, specifically
 * designed for image uploads but can be configured for other file types.
 */
export class FileUploader {
  /**
   * Create a new file uploader
   * @param {Object} config - Configuration options
   * @param {string} [config.id] - Unique ID for the uploader (defaults to a generated ID)
   * @param {string} [config.accept] - File types to accept (e.g. 'image/*')
   * @param {boolean} [config.multiple] - Whether to allow multiple file selection
   * @param {Function} [config.onSelect] - Callback when files are selected
   * @param {string} [config.label] - Label text for the upload button
   * @param {number} [config.maxSize] - Maximum file size in bytes
   */
  constructor(config = {}) {
    this.id = config.id || `uploader-${Date.now()}`;
    this.accept = config.accept || 'image/*';
    this.multiple = config.multiple || false;
    this.onSelect = config.onSelect || null;
    this.label = config.label || 'Select file';
    this.maxSize = config.maxSize || 5 * 1024 * 1024; // 5MB default
    
    this.containerElement = null;
    this.inputElement = null;
    this.previewElement = null;
    this.selectedFile = null;
    
    this.init();
  }
  
  /**
   * Initialize the file uploader
   * @private
   */
  init() {
    // Create container
    this.containerElement = document.createElement('div');
    this.containerElement.className = 'file-uploader';
    this.containerElement.id = this.id;
    
    // Generate a random suffix to make field names unpredictable
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    // Create file input
    this.inputElement = document.createElement('input');
    this.inputElement.type = 'file';
    this.inputElement.accept = this.accept;
    this.inputElement.multiple = this.multiple;
    this.inputElement.className = 'file-input';
    this.inputElement.id = `${this.id}-input`;
    this.inputElement.name = `file_${randomSuffix}`;
    this.inputElement.setAttribute('autocomplete', 'off');
    this.inputElement.style.display = 'none';
    
    // Create upload button
    const uploadButton = document.createElement('button');
    uploadButton.type = 'button';
    uploadButton.className = 'btn btn-outline-secondary';
    uploadButton.innerHTML = `<i class="fas fa-upload"></i> ${this.label}`;
    uploadButton.onclick = () => this.inputElement.click();
    
    // Create preview area
    this.previewElement = document.createElement('div');
    this.previewElement.className = 'file-preview';
    this.previewElement.id = `${this.id}-preview`;
    
    // Create remove button (initially hidden)
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'btn btn-sm btn-danger remove-file';
    removeButton.innerHTML = '<i class="fas fa-times"></i>';
    removeButton.style.display = 'none';
    removeButton.onclick = () => this.clearFile();
    
    // Add event listener for file selection
    this.inputElement.addEventListener('change', (e) => this.handleFileSelect(e));
    
    // Assemble uploader
    this.containerElement.appendChild(this.inputElement);
    this.containerElement.appendChild(uploadButton);
    this.containerElement.appendChild(this.previewElement);
    this.containerElement.appendChild(removeButton);
    
    // Add styles if not already in document
    this.addUploaderStyles();
  }
  
  /**
   * Add uploader CSS styles to the document if they don't exist
   * @private
   */
  addUploaderStyles() {
    if (!document.getElementById('uploader-styles')) {
      const style = document.createElement('style');
      style.id = 'uploader-styles';
      style.textContent = `
        .file-uploader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border: 2px dashed var(--bs-border-color, #dee2e6);
          border-radius: 4px;
          position: relative;
        }
        
        .file-preview {
          width: 100%;
          min-height: 100px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 0.5rem;
        }
        
        .file-preview img {
          max-width: 100%;
          max-height: 200px;
          object-fit: contain;
          border-radius: 4px;
        }
        
        .file-preview .preview-text {
          color: var(--bs-secondary, #6c757d);
          font-style: italic;
        }
        
        .remove-file {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .file-error {
          color: var(--bs-danger, #dc3545);
          font-size: 0.875rem;
          margin-top: 0.25rem;
          width: 100%;
          text-align: center;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Handle file selection from input
   * @param {Event} event - The change event from the file input
   * @private
   */
  handleFileSelect(event) {
    // Clear any previous errors
    this.clearError();
    
    // Get selected file
    const files = event.target.files;
    if (!files || files.length === 0) {
      this.clearFile();
      return;
    }
    
    const file = files[0]; // Get first file (we ignore multiple for now)
    
    // Validate file size
    if (file.size > this.maxSize) {
      this.showError(`File too large. Maximum size is ${this.formatFileSize(this.maxSize)}.`);
      this.clearFile();
      return;
    }
    
    // Store the selected file
    this.selectedFile = file;
    
    // Show preview
    this.showPreview(file);
    
    // Show remove button
    const removeButton = this.containerElement.querySelector('.remove-file');
    if (removeButton) {
      removeButton.style.display = 'flex';
    }
    
    // Call onSelect callback if provided
    if (this.onSelect && typeof this.onSelect === 'function') {
      this.onSelect(file);
    }
  }
  
  /**
   * Show preview for the selected file
   * @param {File} file - The selected file
   * @private
   */
  showPreview(file) {
    if (!this.previewElement) return;
    
    this.previewElement.innerHTML = '';
    
    // Handle different file types
    if (file.type.startsWith('image/')) {
      // Create image preview
      const img = document.createElement('img');
      img.className = 'preview-image';
      img.alt = 'Preview';
      
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      
      // Clean up object URL after loading
      img.onload = () => URL.revokeObjectURL(objectUrl);
      
      this.previewElement.appendChild(img);
    } else {
      // For non-image files, just show filename
      const fileInfo = document.createElement('div');
      fileInfo.className = 'preview-text';
      fileInfo.textContent = `${file.name} (${this.formatFileSize(file.size)})`;
      this.previewElement.appendChild(fileInfo);
    }
  }
  
  /**
   * Format file size into human-readable string
   * @param {number} bytes - File size in bytes
   * @return {string} Human-readable file size
   * @private
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Show an error message
   * @param {string} message - Error message to display
   * @private
   */
  showError(message) {
    // Remove any existing error
    this.clearError();
    
    // Create error element
    const errorElement = document.createElement('div');
    errorElement.className = 'file-error';
    errorElement.textContent = message;
    
    // Add to container
    this.containerElement.appendChild(errorElement);
  }
  
  /**
   * Clear any displayed error message
   * @private
   */
  clearError() {
    const errorElement = this.containerElement.querySelector('.file-error');
    if (errorElement) {
      errorElement.remove();
    }
  }
  
  /**
   * Clear the selected file and preview
   */
  clearFile() {
    // Reset input value
    if (this.inputElement) {
      this.inputElement.value = '';
    }
    
    // Clear preview
    if (this.previewElement) {
      this.previewElement.innerHTML = '';
    }
    
    // Hide remove button
    const removeButton = this.containerElement.querySelector('.remove-file');
    if (removeButton) {
      removeButton.style.display = 'none';
    }
    
    // Reset selected file
    this.selectedFile = null;
  }
  
  /**
   * Get the selected file
   * @return {File|null} The selected file or null
   */
  getFile() {
    return this.selectedFile;
  }
  
  /**
   * Check if a file is selected
   * @return {boolean} True if a file is selected
   */
  hasFile() {
    return this.selectedFile !== null;
  }
  
  /**
   * Get the DOM element for the file uploader
   * @return {HTMLElement} The uploader container element
   */
  getElement() {
    return this.containerElement;
  }
}
