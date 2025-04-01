/**
 * SPForm - A component for capturing and validating specific product data
 * 
 * This component creates a form specific to specific product data, with fields for
 * name, description, versions, and icon. It includes validation and handles both 
 * creation and editing scenarios, with special handling for versions management.
 */
import { FileUploader } from './fileUploader.js';

export class SPForm {
  /**
   * Create a new specific product form
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
    this.versions = this.data && this.data.versions ? [...this.data.versions] : []; // Copy to avoid reference issues
    
    this.createForm();
  }
  
  /**
   * Create the form structure
   * @private
   */
  createForm() {
    // Create form container
    this.element = document.createElement('div');
    this.element.className = 'sp-form-container';
    
    // Generate a random suffix to make field names unpredictable for form-filling extensions
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    this.randomSuffix = randomSuffix; // Store for later reference
    
    // Create form element
    this.formElement = document.createElement('form');
    this.formElement.id = 'spForm';
    this.formElement.className = 'needs-validation';
    this.formElement.noValidate = true;
    this.formElement.setAttribute('autocomplete', 'off'); // Prevent browser autocomplete
    
    // Add form fields
    this.formElement.innerHTML = `
      <!-- Name field -->
      <div class="mb-3">
        <label for="spName" class="form-label">Name *</label>
        <input type="text" class="form-control" id="spName" name="spName_${randomSuffix}" required autocomplete="new-password">
        <div class="invalid-feedback">Please enter a name. Names must be unique.</div>
      </div>
      
      <!-- Description field -->
      <div class="mb-3">
        <label for="spDescription" class="form-label">Description</label>
        <textarea class="form-control" id="spDescription" name="spDescription_${randomSuffix}" rows="3" autocomplete="new-password"></textarea>
      </div>
      
      <!-- Versions field -->
      <div class="mb-3">
        <label class="form-label">Versions</label>
        <div class="d-flex mb-2">
          <input type="text" class="form-control me-2" id="versionInput" name="versionInput_${randomSuffix}" placeholder="Enter version (ex: 1.0.0)" autocomplete="new-password">
          <button type="button" class="btn btn-primary" id="addVersionBtn">Add</button>
        </div>
        <div id="versionsContainer" class="p-2 border rounded mb-2" style="min-height: 100px; max-height: 200px; overflow-y: auto;">
          <!-- Versions will be added here dynamically -->
          <div class="text-muted small fst-italic text-center" id="noVersionsMsg">No versions added yet</div>
        </div>
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
      deleteButton.innerHTML = '<i class="fas fa-trash me-2"></i>Delete Specific Product';
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
    
    this.fileUploader = new FileUploader({
      id: 'spIconUploader',
      accept: 'image/png, image/jpeg',
      multiple: false,
      label: 'Choose Icon',
      maxSize: 1024 * 1024 // 1MB limit
    });
    
    container.appendChild(this.fileUploader.getElement());
  }
  
  /**
   * Set up event listeners for form interactions
   * @private
   */
  setupEventListeners() {
    // Add version button click
    const addVersionBtn = this.formElement.querySelector('#addVersionBtn');
    if (addVersionBtn) {
      addVersionBtn.addEventListener('click', this.addVersion.bind(this));
    }
    
    // Version input enter key
    const versionInput = this.formElement.querySelector('#versionInput');
    if (versionInput) {
      versionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault(); // Prevent form submission
          this.addVersion();
        }
      });
    }
    
    // Form submission
    this.formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }
  
  /**
   * Add a version to the list
   * @private
   */
  addVersion() {
    const versionInput = this.formElement.querySelector('#versionInput');
    const versionsContainer = this.formElement.querySelector('#versionsContainer');
    const noVersionsMsg = this.formElement.querySelector('#noVersionsMsg');
    
    if (!versionInput || !versionsContainer) return;
    
    const version = versionInput.value.trim();
    if (!version) return;
    
    // Check if version already exists
    if (this.versions.includes(version)) {
      // Show error message (could be enhanced with a proper notification)
      versionInput.classList.add('is-invalid');
      setTimeout(() => versionInput.classList.remove('is-invalid'), 2000);
      return;
    }
    
    // Add to versions array
    this.versions.push(version);
    
    // Add to UI
    this.renderVersions();
    
    // Clear input
    versionInput.value = '';
    versionInput.focus();
  }
  
  /**
   * Remove a version from the list
   * @param {string} version - The version to remove
   * @private
   */
  removeVersion(version) {
    this.versions = this.versions.filter(v => v !== version);
    this.renderVersions();
  }
  
  /**
   * Render the versions list in the UI
   * @private
   */
  renderVersions() {
    const versionsContainer = this.formElement.querySelector('#versionsContainer');
    const noVersionsMsg = this.formElement.querySelector('#noVersionsMsg');
    
    if (!versionsContainer) return;
    
    // Clear container
    versionsContainer.innerHTML = '';
    
    // Show message if no versions
    if (this.versions.length === 0) {
      versionsContainer.innerHTML = '<div class="text-muted small fst-italic text-center" id="noVersionsMsg">No versions added yet</div>';
      return;
    }
    
    // Sort versions (could be enhanced with semantic versioning)
    const sortedVersions = [...this.versions].sort();
    
    // Add each version
    sortedVersions.forEach(version => {
      const versionBadge = document.createElement('div');
      versionBadge.className = 'badge bg-secondary d-inline-flex align-items-center me-2 mb-2';
      versionBadge.style.paddingRight = '0.5rem';
      
      const versionText = document.createElement('span');
      versionText.textContent = version;
      versionText.className = 'me-1';
      
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn-close btn-close-white ms-1';
      removeBtn.style.fontSize = '0.5rem';
      removeBtn.setAttribute('aria-label', 'Remove');
      removeBtn.onclick = () => this.removeVersion(version);
      
      versionBadge.appendChild(versionText);
      versionBadge.appendChild(removeBtn);
      versionsContainer.appendChild(versionBadge);
    });
  }
  
  /**
   * Set form values for editing an existing specific product
   * @param {Object} data - The specific product data
   */
  setValues(data) {
    if (!data || !this.formElement) return;
    
    // Set basic fields
    const nameInput = this.formElement.querySelector('#spName');
    const descriptionInput = this.formElement.querySelector('#spDescription');
    
    if (nameInput && data.name !== undefined) {
      nameInput.value = data.name;
    }
    
    if (descriptionInput && data.description !== undefined) {
      descriptionInput.value = data.description;
    }
    
    // Set versions
    if (data.versions && Array.isArray(data.versions)) {
      this.versions = [...data.versions];
      this.renderVersions();
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
      name: this.formElement.querySelector('#spName')?.value || '',
      description: this.formElement.querySelector('#spDescription')?.value || '',
      versions: [...this.versions]
    };
    
    // Add the original name for uniqueness checking in edit mode
    if (this.isEditMode && this.originalName) {
      formData.originalName = this.originalName;
    }
    
    // Add the ID if in edit mode
    if (this.isEditMode && this.data && this.data.id) {
      formData.id = this.data.id;
    }
    
    // Get existing icon path if in edit mode and no new file selected
    if (this.isEditMode && this.data && this.data.iconPath && !this.fileUploader.hasFile()) {
      formData.iconPath = this.data.iconPath;
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
    const nameValid = this.formElement.querySelector('#spName').checkValidity();
    
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
    if (window.confirm(`Are you sure you want to delete the "${this.data.name}" specific product? This action cannot be undone.`)) {
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
    
    // Clear versions
    this.versions = [];
    this.renderVersions();
    
    // Clear file uploader
    if (this.fileUploader) {
      this.fileUploader.clearFile();
    }
    
    // Remove validation classes
    this.formElement.classList.remove('was-validated');
  }
}
