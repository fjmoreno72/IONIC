/**
 * GPForm - A component for capturing and validating generic product data
 * 
 * This component creates a form specific to generic product data, with fields for
 * name, description, and icon. It includes validation and handles both 
 * creation and editing scenarios.
 */
import { FileUploader } from './fileUploader.js';

export class GPForm {
  /**
   * Create a new generic product form
   * @param {Object} config - Configuration options
   * @param {Object} [config.data] - Initial data for editing (null for new item)
   * @param {Function} [config.onSubmit] - Callback when form is submitted
   * @param {Function} [config.onCancel] - Callback when form is cancelled
   * @param {Function} [config.onDelete] - Callback when delete is requested
   */
  constructor(config = {}) {
    this.data = config.data || null;
    this.onSubmit = config.onSubmit || null;
    this.onCancel = config.onCancel || null;
    this.onDelete = config.onDelete || null;
    this.element = null;
    this.formElement = null;
    this.fileUploader = null;
    this.isEditMode = !!this.data;
    this.originalName = this.data?.name || null; // Store original name for uniqueness check
    
    this.createForm();
  }
  
  /**
   * Create the form structure
   * @private
   */
  createForm() {
    // Create form container
    this.element = document.createElement('div');
    this.element.className = 'gp-form-container';
    
    // Generate a random suffix to make field names unpredictable for form-filling extensions
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    this.randomSuffix = randomSuffix; // Store for later reference
    
    // Create form element
    this.formElement = document.createElement('form');
    this.formElement.id = 'gpForm';
    this.formElement.className = 'needs-validation';
    this.formElement.noValidate = true;
    this.formElement.setAttribute('autocomplete', 'off'); // Prevent browser autocomplete
    
    // Add form fields
    this.formElement.innerHTML = `
      <!-- Name field -->
      <div class="mb-3">
        <label for="gpName" class="form-label">Name *</label>
        <input type="text" class="form-control" id="gpName" name="gpName_${randomSuffix}" required autocomplete="new-password">
        <div class="invalid-feedback">Please enter a name. Names must be unique.</div>
      </div>
      
      <!-- Description field -->
      <div class="mb-3">
        <label for="gpDescription" class="form-label">Description</label>
        <textarea class="form-control" id="gpDescription" name="gpDescription_${randomSuffix}" rows="3" autocomplete="new-password"></textarea>
      </div>
      
      <!-- Icon upload field -->
      <div class="mb-3">
        <label class="form-label">Icon</label>
        <div id="iconUploaderContainer"></div>
        <small class="text-muted">Upload a square image for best results (PNG or JPG, max 1MB)</small>
      </div>
    `;
    
    // Add the form to the container
    this.element.appendChild(this.formElement);
    
    // Add delete button if in edit mode
    if (this.isEditMode && this.data) {
      const deleteButtonContainer = document.createElement('div');
      deleteButtonContainer.className = 'delete-button-container mt-4 pt-3 border-top text-center';
      
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'btn btn-danger';
      deleteButton.innerHTML = '<i class="fas fa-trash me-2"></i>Delete Generic Product';
      deleteButton.onclick = this.handleDelete.bind(this);
      
      deleteButtonContainer.appendChild(deleteButton);
      this.element.appendChild(deleteButtonContainer);
    }
    
    // Initialize the file uploader
    this.initFileUploader();
    
    // Add event listeners
    this.setupEventListeners();
    
    // Set initial values if in edit mode
    if (this.isEditMode && this.data) {
      this.setValues(this.data);
    }
  }
  
  /**
   * Initialize the file uploader for icons
   * @private
   */
  initFileUploader() {
    const container = this.formElement.querySelector('#iconUploaderContainer');
    if (!container) return;
    
    this.iconRemoved = false; // Track if icon was explicitly removed
    
    this.fileUploader = new FileUploader({
      id: 'gpIconUploader',
      accept: 'image/png, image/jpeg',
      multiple: false,
      label: 'Choose Icon',
      maxSize: 1024 * 1024 // 1MB limit
    });
    
    // Attach event listener to detect icon removal
    const removeButton = this.fileUploader.getElement().querySelector('.remove-file');
    if (removeButton) {
      removeButton.addEventListener('click', () => {
        this.iconRemoved = true; // Mark icon as explicitly removed
      });
    }
    
    container.appendChild(this.fileUploader.getElement());
  }
  
  /**
   * Set up event listeners for form interactions
   * @private
   */
  setupEventListeners() {
    // Form submission
    this.formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }
  
  /**
   * Set form values for editing an existing generic product
   * @param {Object} data - The generic product data
   */
  setValues(data) {
    if (!data || !this.formElement) return;
    
    // Set basic fields
    const nameInput = this.formElement.querySelector('#gpName');
    const descriptionInput = this.formElement.querySelector('#gpDescription');
    
    if (nameInput && data.name !== undefined) {
      nameInput.value = data.name;
    }
    
    if (descriptionInput && data.description !== undefined) {
      descriptionInput.value = data.description;
    }
    
    // Set icon preview if available
    if (data.iconPath && this.fileUploader) {
      // Create a preview image for the existing icon
      const previewElement = this.fileUploader.getElement().querySelector('.file-preview');
      if (previewElement) {
        const img = document.createElement('img');
        img.className = 'preview-image';
        img.alt = 'Current Icon';
        img.src = `/static/ASC/${data.iconPath.replace('./', '')}`;
        
        // Clear any existing preview
        previewElement.innerHTML = '';
        previewElement.appendChild(img);
        
        // Show the remove button
        const removeButton = this.fileUploader.getElement().querySelector('.remove-file');
        if (removeButton) {
          removeButton.style.display = 'flex';
        }
      }
    }
  }
  
  /**
   * Get all form values as an object
   * @return {Object} Form data object
   */
  getValues() {
    if (!this.formElement) return {};
    
    // Get basic form data
    const formData = {
      name: this.formElement.querySelector('#gpName')?.value || '',
      description: this.formElement.querySelector('#gpDescription')?.value || ''
    };
    
    // Add the original name for uniqueness checking in edit mode
    if (this.isEditMode && this.originalName) {
      formData.originalName = this.originalName;
    }
    
    // Add the ID if in edit mode
    if (this.isEditMode && this.data && this.data.id) {
      formData.id = this.data.id;
    }
    
    // Handle icon path
    // If in edit mode, we have three cases:
    // 1. User uploaded a new icon - handled by fileUploader.hasFile() in the caller
    // 2. User removed the icon - set iconPath to empty string
    // 3. User kept existing icon - keep the existing path
    if (this.isEditMode && this.data && this.data.iconPath && !this.fileUploader.hasFile()) {
      // Only keep existing icon path if it wasn't explicitly removed
      if (!this.iconRemoved) {
        formData.iconPath = this.data.iconPath;
      } else {
        // Icon was explicitly removed, set to empty string to remove it
        formData.iconPath = '';
      }
    }
    
    return formData;
  }
  
  /**
   * Validate the form
   * @return {boolean} Whether the form is valid
   */
  validate() {
    if (!this.formElement) return false;
    
    // Add validation classes
    this.formElement.classList.add('was-validated');
    
    // Check basic field validity
    const nameValid = this.formElement.querySelector('#gpName').checkValidity();
    
    return nameValid;
  }
  
  /**
   * Handle form submission
   * @private
   */
  handleSubmit() {
    // Validate form
    if (!this.validate()) {
      return;
    }
    
    // Get values
    const formData = this.getValues();
    
    // Get file if selected
    const file = this.fileUploader.getFile();
    
    // Call onSubmit callback if provided
    if (this.onSubmit && typeof this.onSubmit === 'function') {
      this.onSubmit(formData, file);
    }
  }
  
  /**
   * Handle delete button click
   * @private
   */
  handleDelete() {
    if (!this.isEditMode || !this.data || !this.data.id) return;
    
    // Show confirmation dialog
    if (window.confirm(`Are you sure you want to delete the "${this.data.name}" generic product? This action cannot be undone.`)) {
      // Call onDelete callback if provided
      if (this.onDelete && typeof this.onDelete === 'function') {
        this.onDelete(this.data.id);
      }
    }
  }
  
  /**
   * Reset the form
   */
  reset() {
    if (!this.formElement) return;
    
    // Reset form values
    this.formElement.reset();
    
    // Clear file uploader
    if (this.fileUploader) {
      this.fileUploader.clearFile();
    }
    
    // Remove validation classes
    this.formElement.classList.remove('was-validated');
  }
}
