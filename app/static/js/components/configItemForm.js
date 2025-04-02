/**
 * ConfigItemForm - A component for capturing and validating configuration item data
 * 
 * This component creates a form specific to configuration item data, with fields for
 * name, generic products, default value, help text, and other properties. It includes 
 * validation and handles both creation and editing scenarios.
 */
import { MultiSelectDropdown } from './multiSelectDropdown.js';

export class ConfigItemForm {
  /**
   * Create a new configuration item form
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
    this.gpDropdown = null;
    this.isEditMode = !!this.data;
    this.originalName = this.data?.Name || null; // Store original name for uniqueness check
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
    this.element.className = 'config-item-form-container';
    
    // Generate a random suffix to make field names unpredictable for form-filling extensions
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    this.randomSuffix = randomSuffix; // Store for later reference
    
    // Create form element
    this.formElement = document.createElement('form');
    this.formElement.id = 'configItemForm';
    this.formElement.className = 'needs-validation';
    this.formElement.noValidate = true;
    this.formElement.setAttribute('autocomplete', 'off'); // Prevent browser autocomplete
    
    // Add form fields
    this.formElement.innerHTML = `
      <!-- Name field -->
      <div class="mb-3">
        <label for="ciName" class="form-label">Name *</label>
        <input type="text" class="form-control" id="ciName" name="Name_${randomSuffix}" required autocomplete="new-password">
        <div class="invalid-feedback">Please enter a name. Names must be unique.</div>
      </div>
      
      <!-- Generic Products field -->
      <div class="mb-3">
        <label class="form-label">Generic Products *</label>
        <div id="gpContainer">
          <!-- GP multiselect will be inserted here -->
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <small class="text-muted">Search and select Generic Products. Type to filter options.</small>
        <div class="invalid-feedback">Please select at least one Generic Product.</div>
      </div>
      
      <!-- Default Value field -->
      <div class="mb-3">
        <label for="ciDefaultValue" class="form-label">Default Value</label>
        <input type="text" class="form-control" id="ciDefaultValue" name="DefaultValue_${randomSuffix}" autocomplete="new-password">
      </div>
      
      <!-- Help Text field -->
      <div class="mb-3">
        <label for="ciHelpText" class="form-label">Help Text</label>
        <textarea class="form-control" id="ciHelpText" name="HelpText_${randomSuffix}" rows="2" autocomplete="new-password"></textarea>
      </div>
      
      <!-- Answer Type field -->
      <div class="mb-3">
        <label for="ciAnswerType" class="form-label">Configuration Answer Type *</label>
        <select class="form-select" id="ciAnswerType" name="ConfigAnswerType_${randomSuffix}" required autocomplete="new-password">
          <option value="">Select answer type...</option>
          <option value="Text Field (Single Line)">Text Field (Single Line)</option>
          <option value="Text Field (Multi Line)">Text Field (Multi Line)</option>
          <option value="Static Drop Down">Static Drop Down</option>
          <option value="Port">Port</option>
          <option value="IP Address">IP Address</option>
          <option value="Email Address">Email Address</option>
          <option value="URL">URL</option>
        </select>
        <div class="invalid-feedback">Please select an answer type.</div>
      </div>
      
      <!-- Answer Content field -->
      <div class="mb-3">
        <label for="ciAnswerContent" class="form-label">Answer Content</label>
        <textarea class="form-control" id="ciAnswerContent" name="AnswerContent_${randomSuffix}" rows="2" autocomplete="new-password"></textarea>
        <small class="text-muted">For dropdown types, enter comma-separated values.</small>
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
      deleteButton.innerHTML = '<i class="fas fa-trash me-2"></i>Delete Configuration Item';
      deleteButton.onclick = this.handleDelete.bind(this);
      
      deleteButtonContainer.appendChild(deleteButton);
      this.element.appendChild(deleteButtonContainer);
    }
    
    // Initialize the GP dropdown
    this.initGPDropdown();
    
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
          initialValues: this.getInitialGPNames(),
          addNewText: 'Add custom GP',
          onChange: (values) => {
            // Validate GP selection when it changes
            const gpContainer = this.formElement.querySelector('#gpContainer');
            if (gpContainer) {
              if (values.length === 0) {
                gpContainer.classList.add('is-invalid');
              } else {
                gpContainer.classList.remove('is-invalid');
              }
            }
          }
        });
        
        // Add to form
        container.appendChild(this.gpDropdown.element);
        
        // If in edit mode, re-set the values now that we have the dropdown
        if (this.isEditMode && this.data && this.data.GenericProducts) {
          this.setGPValues(this.data.GenericProducts);
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
    if (!this.data || !this.data.GenericProducts || !Array.isArray(this.data.GenericProducts)) {
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
   * Set form values for editing an existing configuration item
   * @param {Object} data - The configuration item data
   */
  setValues(data) {
    if (!data || !this.formElement) return;
    
    // Set basic fields
    const fields = ['Name', 'DefaultValue', 'HelpText', 'ConfigurationAnswerType', 'AnswerContent'];
    fields.forEach(field => {
      const element = this.formElement.querySelector(`#ci${field}`);
      if (element && data[field] !== undefined) {
        element.value = data[field];
      }
    });
    
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
      Name: this.formElement.querySelector('#ciName')?.value || '',
      DefaultValue: this.formElement.querySelector('#ciDefaultValue')?.value || '',
      HelpText: this.formElement.querySelector('#ciHelpText')?.value || '',
      ConfigurationAnswerType: this.formElement.querySelector('#ciAnswerType')?.value || '',
      AnswerContent: this.formElement.querySelector('#ciAnswerContent')?.value || '',
      GenericProducts: this.getSelectedGPIds()
    };
    
    // Add the original name for uniqueness checking in edit mode
    if (this.isEditMode && this.originalName) {
      formData.originalName = this.originalName;
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
    
    // Check basic field validity
    const nameValid = this.formElement.querySelector('#ciName').checkValidity();
    const answerTypeValid = this.formElement.querySelector('#ciAnswerType').checkValidity();
    
    // Check that at least one GP is selected
    const gpSelected = this.gpDropdown && this.gpDropdown.getValues().length > 0;
    const gpContainer = this.formElement.querySelector('#gpContainer');
    
    if (!gpSelected && gpContainer) {
      gpContainer.classList.add('is-invalid');
    } else if (gpContainer) {
      gpContainer.classList.remove('is-invalid');
    }
    
    return nameValid && answerTypeValid && gpSelected;
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
    if (!this.isEditMode || !this.data || !this.data.Name) return;
    
    // Show confirmation dialog
    if (window.confirm(`Are you sure you want to delete the "${this.data.Name}" configuration item? This action cannot be undone.`)) {
      // Call onDelete callback if provided
      if (this.onDelete && typeof this.onDelete === 'function') {
        this.onDelete(this.data.Name);
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
  }
}
