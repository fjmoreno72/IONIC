/**
 * AffiliateForm - A component for capturing and validating affiliate data
 * 
 * This component creates a form specific to affiliate data, with fields for
 * name, type, environments, and flag image upload. It includes validation and
 * handles both creation and editing scenarios.
 */
import { FileUploader } from './fileUploader.js';
import { MultiSelectDropdown } from './multiSelectDropdown.js';

export class AffiliateForm {
  /**
   * Create a new affiliate form
   * @param {Object} config - Configuration options
   * @param {Object} [config.data] - Initial data for editing (null for new affiliate)
   * @param {Function} [config.onSubmit] - Callback when form is submitted
   * @param {Function} [config.onCancel] - Callback when form is cancelled
   */
  constructor(config = {}) {
    this.data = config.data || null;
    this.onSubmit = config.onSubmit || null;
    this.onCancel = config.onCancel || null;
    this.onDelete = config.onDelete || null;
    this.element = null;
    this.formElement = null;
    this.fileUploader = null;
    this.environmentsDropdown = null;
    this.isEditMode = !!this.data;
    
    this.createForm();
  }
  
  /**
   * Create the form structure
   * @private
   */
  createForm() {
    // Create form container
    this.element = document.createElement('div');
    this.element.className = 'affiliate-form-container';
    
    // Create form element
    this.formElement = document.createElement('form');
    this.formElement.id = 'affiliateForm';
    this.formElement.className = 'needs-validation';
    this.formElement.noValidate = true;
    
    // Add form fields
    this.formElement.innerHTML = `
      <!-- Name field -->
      <div class="mb-3">
        <label for="affiliateName" class="form-label">Name *</label>
        <input type="text" class="form-control" id="affiliateName" name="name" required>
        <div class="invalid-feedback">Please enter a name.</div>
      </div>
      
      <!-- Type field -->
      <div class="mb-3">
        <label for="affiliateType" class="form-label">Type *</label>
        <select class="form-select" id="affiliateType" name="type" required>
          <option value="">Select type...</option>
          <option value="A">Type A</option>
          <option value="B">Type B</option>
          <option value="C">Type C</option>
        </select>
        <div class="invalid-feedback">Please select a type.</div>
      </div>
      
      <!-- Environments field -->
      <div class="mb-3">
        <label class="form-label">Environments</label>
        <div id="environmentsContainer"></div>
        <small class="text-muted">Select environments or add custom ones. Use the dropdown or type to search.</small>
      </div>
      
      <!-- Flag image field -->
      <div class="mb-3">
        <label class="form-label">Flag</label>
        <div id="flagUploader"></div>
        <small class="text-muted">Upload a flag image for this affiliate. PNG format recommended.</small>
      </div>
    `;
    
    // Add the form to the container
    this.element.appendChild(this.formElement);
    
    // Add delete button if in edit mode
    if (this.isEditMode && this.data && this.data.id) {
      const deleteButtonContainer = document.createElement('div');
      deleteButtonContainer.className = 'delete-button-container mt-4 pt-3 border-top text-center';
      
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'btn btn-danger';
      deleteButton.innerHTML = '<i class="fas fa-trash me-2"></i>Delete Affiliate';
      deleteButton.onclick = this.handleDelete.bind(this);
      
      deleteButtonContainer.appendChild(deleteButton);
      this.element.appendChild(deleteButtonContainer);
    }
    
    // Initialize the components
    this.initFileUploader();
    this.initEnvironmentsDropdown();
    
    // Add form event listener
    this.formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // Set initial values if in edit mode
    if (this.isEditMode && this.data) {
      this.setValues(this.data);
    }
  }
  
  /**
   * Initialize the file uploader component
   * @private
   */
  initFileUploader() {
    const uploaderContainer = this.formElement.querySelector('#flagUploader');
    if (!uploaderContainer) return;
    
    this.fileUploader = new FileUploader({
      id: 'affiliateFlagUploader',
      accept: 'image/*',
      label: 'Select Flag Image',
      maxSize: 2 * 1024 * 1024, // 2MB
      onSelect: (file) => {
        console.log('Flag file selected:', file.name);
      }
    });
    
    uploaderContainer.appendChild(this.fileUploader.getElement());
  }
  
  /**
   * Initialize the environments multiselect dropdown
   * @private
   */
  initEnvironmentsDropdown() {
    const container = this.formElement.querySelector('#environmentsContainer');
    if (!container) return;
    
    // Create the multiselect dropdown for environments
    this.environmentsDropdown = new MultiSelectDropdown({
      id: 'environmentsDropdown',
      placeholder: 'Select or add environments...',
      options: ['Static', 'Deployable', 'Army', 'Navy', 'Joint'],
      initialValues: this.data?.environments || [],
      addNewText: 'Add new environment',
      onChange: (values) => {
        console.log('Selected environments:', values);
      }
    });
    
    // Add to form
    container.appendChild(this.environmentsDropdown.element);
  }
  
  /**
   * Set form values for editing an existing affiliate
   * @param {Object} data - The affiliate data
   */
  setValues(data) {
    if (!data || !this.formElement) return;
    
    // Set text fields
    const nameInput = this.formElement.querySelector('#affiliateName');
    if (nameInput && data.name) {
      nameInput.value = data.name;
    }
    
    // Set select fields
    const typeSelect = this.formElement.querySelector('#affiliateType');
    if (typeSelect && data.type) {
      typeSelect.value = data.type;
    }
    
    // Set environments in the dropdown
    if (this.environmentsDropdown && data.environments && Array.isArray(data.environments)) {
      this.environmentsDropdown.setValues(data.environments);
    }
    
    // If there's an existing flag, show it in the preview
    if (data.flagPath && this.fileUploader) {
      const flagUrl = `/static/ASC/${data.flagPath.replace('./', '')}`;
      const previewElement = this.fileUploader.previewElement;
      
      if (previewElement) {
        previewElement.innerHTML = '';
        
        const img = document.createElement('img');
        img.className = 'preview-image';
        img.alt = 'Current Flag';
        img.src = flagUrl;
        
        previewElement.appendChild(img);
        
        // Show remove button
        const removeButton = this.fileUploader.containerElement.querySelector('.remove-file');
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
      name: this.formElement.querySelector('#affiliateName')?.value || '',
      type: this.formElement.querySelector('#affiliateType')?.value || '',
      environments: [],
    };
    
    // Get environments from the dropdown
    if (this.environmentsDropdown) {
      formData.environments = this.environmentsDropdown.getValues();
    }
    
    // Get flag file if available
    if (this.fileUploader && this.fileUploader.hasFile()) {
      formData.flagFile = this.fileUploader.getFile();
    }
    
    // Add existing flag path when editing
    if (this.isEditMode && this.data && this.data.flagPath) {
      // Only use the existing path if no new file is uploaded
      if (!formData.flagFile) {
        formData.flagPath = this.data.flagPath;
      }
    }
    
    // Add ID when editing
    if (this.isEditMode && this.data && this.data.id) {
      formData.id = this.data.id;
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
    
    // Check validity
    const nameValid = this.formElement.querySelector('#affiliateName').checkValidity();
    const typeValid = this.formElement.querySelector('#affiliateType').checkValidity();
    
    return nameValid && typeValid;
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
    
    // Call onSubmit callback if provided
    if (this.onSubmit && typeof this.onSubmit === 'function') {
      this.onSubmit(formData);
    }
  }
  
  /**
   * Handle delete button click
   * @private
   */
  handleDelete() {
    if (!this.isEditMode || !this.data || !this.data.id) return;
    
    // Show confirmation dialog
    if (window.confirm(`Are you sure you want to delete ${this.data.name}? This action cannot be undone.`)) {
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
    
    // Remove validation classes
    this.formElement.classList.remove('was-validated');
    
    // Clear file uploader
    if (this.fileUploader) {
      this.fileUploader.clearFile();
    }
    
    // Clear environments dropdown
    if (this.environmentsDropdown) {
      this.environmentsDropdown.clear();
    }
  }
}
