/**
 * ServiceForm - A component for capturing and validating service data
 * 
 * This component creates a form specific to service data, with fields for
 * name, spiral, GPs, icon path, etc. It includes validation and handles 
 * both creation and editing scenarios.
 */
import { MultiSelectDropdown } from './multiSelectDropdown.js';
import { FileUploader } from './fileUploader.js';

export class ServiceForm {
  /**
   * Create a new service form
   * @param {Object} config - Configuration options
   * @param {Object} [config.data] - Initial data for editing (null for new service)
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
    this.gpDropdown = null;
    this.iconUploader = null;
    this.diagramUploader = null;
    this.isEditMode = !!this.data;
    this.originalId = this.data?.id || null;
    this.gpMap = new Map(); // Maps GP names to IDs
    this.gpNameMap = new Map(); // Maps GP IDs to names
    
    this.createForm();
  }
  
  /**
   * Create the form structure
   * @private
   */
  createForm() {
    // Create form container
    this.element = document.createElement('div');
    this.element.className = 'service-form-container';
    
    // Generate a random suffix to make field names unpredictable for form-filling extensions
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    this.randomSuffix = randomSuffix; // Store for later reference
    
    // Create form element
    this.formElement = document.createElement('form');
    this.formElement.id = 'serviceForm';
    this.formElement.className = 'needs-validation';
    this.formElement.noValidate = true;
    this.formElement.setAttribute('autocomplete', 'off'); // Prevent browser autocomplete
    
    // Add form fields
    this.formElement.innerHTML = `
      <!-- ID field (displayed when editing) -->
      ${this.isEditMode ? `
      <div class="mb-3">
        <label for="serviceId" class="form-label">ID</label>
        <input type="text" class="form-control" id="serviceId" name="id_${randomSuffix}" 
               value="${this.data?.id || ''}" readonly autocomplete="new-password">
        <div class="form-text">Auto-generated ID (format: SRV-XXXX)</div>
      </div>
      ` : ''}
      
      <!-- Name field -->
      <div class="mb-3">
        <label for="serviceName" class="form-label">Name *</label>
        <input type="text" class="form-control" id="serviceName" name="name_${randomSuffix}" required autocomplete="new-password">
        <div class="invalid-feedback">Please enter a service name.</div>
      </div>
      
      <!-- Spiral field -->
      <div class="mb-3">
        <label for="serviceSpiral" class="form-label">Spiral *</label>
        <input type="text" class="form-control" id="serviceSpiral" name="spiral_${randomSuffix}" required autocomplete="new-password">
        <div class="invalid-feedback">Please enter a spiral (e.g., SP5).</div>
      </div>
      
      <!-- Generic Products field -->
      <div class="mb-3">
        <label class="form-label">Generic Products</label>
        <div id="gpContainer">
          <!-- GP multiselect will be inserted here -->
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <small class="text-muted">Search and select Generic Products. Type to filter options.</small>
      </div>
      
      <!-- Icon Image field -->
      <div class="mb-3">
        <label class="form-label">Service Icon</label>
        <div id="iconUploader"></div>
        <small class="text-muted">Upload an icon image for this service. PNG format recommended.</small>
      </div>
      
      <!-- Functional Diagram Image field -->
      <div class="mb-3">
        <label class="form-label">Functional Diagram</label>
        <div id="diagramUploader"></div>
        <small class="text-muted">Upload a functional diagram image. PNG or JPG format recommended.</small>
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
      deleteButton.innerHTML = '<i class="fas fa-trash me-2"></i>Delete Service';
      deleteButton.onclick = this.handleDelete.bind(this);
      
      deleteButtonContainer.appendChild(deleteButton);
      this.element.appendChild(deleteButtonContainer);
    }
    
    // Initialize components
    this.initGPDropdown();
    this.initFileUploaders();
    
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
   * Initialize the file uploaders for icon and diagram
   * @private
   */
  initFileUploaders() {
    // Initialize icon uploader
    const iconContainer = this.formElement.querySelector('#iconUploader');
    if (iconContainer) {
      this.iconUploader = new FileUploader({
        id: 'serviceIconUploader',
        accept: 'image/*',
        label: 'Select Icon Image',
        maxSize: 2 * 1024 * 1024, // 2MB
        onSelect: (file) => {
          console.log('Icon file selected:', file.name);
        }
      });
      
      iconContainer.appendChild(this.iconUploader.getElement());
    }
    
    // Initialize diagram uploader
    const diagramContainer = this.formElement.querySelector('#diagramUploader');
    if (diagramContainer) {
      this.diagramUploader = new FileUploader({
        id: 'serviceDiagramUploader',
        accept: 'image/*',
        label: 'Select Diagram Image',
        maxSize: 5 * 1024 * 1024, // 5MB
        onSelect: (file) => {
          console.log('Diagram file selected:', file.name);
        }
      });
      
      diagramContainer.appendChild(this.diagramUploader.getElement());
    }
  }
  
  /**
   * Initialize the GP multiselect dropdown
   * @private
   */
  initGPDropdown() {
    const container = this.formElement.querySelector('#gpContainer');
    if (!container) return;
    
    // First, fetch the GP data to get the options
    fetch('/static/ASC/data/gps.json')
      .then(response => response.json())
      .then(gpData => {
        // Clear the loading spinner
        container.innerHTML = '';
        
        // Create options array with GP names and store ID mapping
        const gpOptions = gpData.map(gp => {
          // Store mappings of name to ID and vice versa
          this.gpMap.set(gp.name, gp.id);
          this.gpNameMap.set(gp.id, gp.name);
          return gp.name;
        }).sort((a, b) => a.localeCompare(b));
        
        // Create the multiselect dropdown with GP options
        this.gpDropdown = new MultiSelectDropdown({
          id: 'gpMultiselect',
          placeholder: 'Search and select Generic Products...',
          options: gpOptions,
          initialValues: this.getInitialGPNames()
        });
        
        // Add to form
        container.appendChild(this.gpDropdown.element);
        
        // If in edit mode, re-set the values now that we have the dropdown
        if (this.isEditMode && this.data && this.data.gps) {
          this.setGPValues(this.data.gps);
        }
      })
      .catch(error => {
        console.error('Error loading GP data:', error);
        // Show error in the container
        container.innerHTML = '<div class="alert alert-danger">Error loading Generic Products data.</div>';
      });
  }
  
  /**
   * Convert initial GP IDs to names for the dropdown
   * @returns {Array} Array of GP names
   * @private
   */
  getInitialGPNames() {
    if (!this.data || !this.data.gps || !Array.isArray(this.data.gps)) {
      return [];
    }
    
    // Return empty array initially, will be set properly after GP data is loaded
    return [];
  }
  
  /**
   * Set GP values in the dropdown from IDs array
   * @param {Array} gpIds - Array of GP IDs
   * @private
   */
  setGPValues(gpIds) {
    if (!this.gpDropdown || !Array.isArray(gpIds)) return;
    
    // Convert IDs to names using the mapping
    const gpNames = gpIds.map(id => this.gpNameMap.get(id) || id);
    
    // Set the values in the dropdown
    this.gpDropdown.setValues(gpNames);
  }
  
  /**
   * Set form values for editing an existing service
   * @param {Object} data - The service data
   */
  setValues(data) {
    if (!data || !this.formElement) return;
    
    // Set basic fields
    const fields = [
      { id: 'serviceName', key: 'name' },
      { id: 'serviceSpiral', key: 'spiral' }
    ];
    
    fields.forEach(field => {
      const element = this.formElement.querySelector(`#${field.id}`);
      if (element && data[field.key] !== undefined) {
        element.value = data[field.key];
      }
    });
    
    // Set icon preview if exists
    if (data.iconPath && this.iconUploader) {
      const iconUrl = `/static/ASC/${data.iconPath.replace('./', '')}`;
      const previewElement = this.iconUploader.previewElement;
      
      if (previewElement) {
        previewElement.innerHTML = '';
        
        const img = document.createElement('img');
        img.className = 'preview-image';
        img.alt = 'Service Icon';
        img.src = iconUrl;
        
        previewElement.appendChild(img);
        
        // Show remove button
        const removeButton = this.iconUploader.containerElement.querySelector('.remove-file');
        if (removeButton) {
          removeButton.style.display = 'flex';
        }
      }
    }
    
    // Set diagram preview if exists
    if (data.functionalDiagramPath && this.diagramUploader) {
      const diagramUrl = `/static/ASC/${data.functionalDiagramPath.replace('./', '')}`;
      const previewElement = this.diagramUploader.previewElement;
      
      if (previewElement) {
        previewElement.innerHTML = '';
        
        const img = document.createElement('img');
        img.className = 'preview-image';
        img.alt = 'Functional Diagram';
        img.src = diagramUrl;
        
        previewElement.appendChild(img);
        
        // Show remove button
        const removeButton = this.diagramUploader.containerElement.querySelector('.remove-file');
        if (removeButton) {
          removeButton.style.display = 'flex';
        }
      }
    }
    
    // GP values are set in initGPDropdown after the data is loaded
  }
  
  /**
   * Get all form values as an object
   * @return {Object} Form data object
   */
  getValues() {
    if (!this.formElement) return {};
    
    // Get basic form data
    const formData = {
      name: this.formElement.querySelector('#serviceName')?.value || '',
      spiral: this.formElement.querySelector('#serviceSpiral')?.value || '',
      gps: this.getSelectedGPIds()
    };
    
    // Add ID if in edit mode
    if (this.isEditMode && this.data && this.data.id) {
      formData.id = this.data.id;
    }
    
    // Get icon file if available
    if (this.iconUploader && this.iconUploader.hasFile()) {
      formData.iconFile = this.iconUploader.getFile();
    }
    
    // Get diagram file if available
    if (this.diagramUploader && this.diagramUploader.hasFile()) {
      formData.diagramFile = this.diagramUploader.getFile();
    }
    
    // Add existing paths when editing if no new files are uploaded
    if (this.isEditMode && this.data) {
      // Only use existing icon path if no new file is uploaded
      if (!formData.iconFile && this.data.iconPath) {
        formData.iconPath = this.data.iconPath;
      }
      
      // Only use existing diagram path if no new file is uploaded
      if (!formData.diagramFile && this.data.functionalDiagramPath) {
        formData.functionalDiagramPath = this.data.functionalDiagramPath;
      }
    }
    
    // Add the original ID for uniqueness checking in edit mode
    if (this.isEditMode && this.originalId) {
      formData.originalId = this.originalId;
    }
    
    return formData;
  }
  
  /**
   * Get selected GP IDs from the dropdown
   * @returns {Array} Array of selected GP IDs
   * @private
   */
  getSelectedGPIds() {
    if (!this.gpDropdown) return [];
    
    const selectedGPNames = this.gpDropdown.getValues();
    return selectedGPNames.map(name => this.gpMap.get(name) || name);
  }
  
  /**
   * Validate the form
   * @return {boolean} Whether the form is valid
   */
  validate() {
    if (!this.formElement) return false;
    
    // Add validation classes
    this.formElement.classList.add('was-validated');
    
    // Check field validity - ID field is not required as it's auto-generated or read-only
    const nameValid = this.formElement.querySelector('#serviceName').checkValidity();
    const spiralValid = this.formElement.querySelector('#serviceSpiral').checkValidity();
    
    return nameValid && spiralValid;
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
    if (window.confirm(`Are you sure you want to delete the "${this.data.name}" service? This action cannot be undone.`)) {
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
    
    // Clear GP dropdown
    if (this.gpDropdown) {
      this.gpDropdown.clear();
    }
    
    // Clear file uploaders
    if (this.iconUploader) {
      this.iconUploader.clearFile();
    }
    
    if (this.diagramUploader) {
      this.diagramUploader.clearFile();
    }
  }
}
