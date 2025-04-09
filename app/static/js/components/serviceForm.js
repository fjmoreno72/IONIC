/**
 * ServiceForm - A component for capturing and validating service data
 * 
 * This component creates a form specific to service data, with fields for
 * name, model, GPs, icon path, etc. It includes validation and handles 
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
    this.modelMap = new Map(); // Maps Model names to IDs
    this.modelNameMap = new Map(); // Maps Model IDs to names
    this.selectedModels = []; // Array to store selected model IDs
    
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
      
      <!-- Models field -->
      <div class="mb-3">
        <label class="form-label">Models *</label>
        <div id="modelsContainer">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <small class="text-muted">Select at least one model for this service.</small>
        <div class="invalid-feedback">Please select at least one model.</div>
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
      
      <!-- GP Model Implementation section -->
      <div class="mb-3" id="gpModelImplementationContainer" style="display: none;">
        <label class="form-label">GP Model Implementation</label>
        <div id="gpModelTable" class="table-responsive">
          <!-- Table will be inserted here -->
        </div>
        <small class="text-muted">Select which models each Generic Product implements.</small>
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
    this.initModelDropdown(); // Initialize the model dropdown
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
   * Initialize the Model selector with MultiSelectDropdown
   * @private
   */
  initModelDropdown() {
    const container = this.formElement.querySelector('#modelsContainer');
    if (!container) {
      console.error('Model container not found');
      return;
    }
    
    console.log('Initializing model selector with MultiSelectDropdown');
    
    // Clear the container
    container.innerHTML = '';
    
    // Create the dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.className = 'form-control p-0 border-0';
    container.appendChild(dropdownContainer);
    
    console.log('Fetching model data from JSON file');
    fetch('/static/ASC/data/_models.json')
      .then(response => {
        if (!response.ok) {
          console.error('Failed to load Model data, status:', response.status);
          throw new Error('Failed to load Model data');
        }
        return response.json();
      })
      .then(modelData => {
        console.log('Model data loaded:', modelData.length, 'models');
        
        // Store model mappings
        modelData.forEach(model => {
          this.modelMap.set(model.name, model.id);
          this.modelNameMap.set(model.id, model.name);
        });
        
        // Create options array for MultiSelectDropdown
        const options = modelData.map(model => ({
          value: model.id,
          text: model.name
        }));
        
        // Initialize MultiSelectDropdown
        this.modelDropdown = new MultiSelectDropdown({
          id: 'model-select',
          options: options,
          placeholder: 'Select models...',
          allowAddNew: false,
          onChange: () => {
            // Update validation state
            const isValid = this.modelDropdown.getValues().length > 0;
            container.classList.toggle('is-invalid', !isValid);
            
            // Update the GP Model Implementation table
            this.updateGPModelTable();
          }
        });
        
        // Add the dropdown to the container
        dropdownContainer.appendChild(this.modelDropdown.element);
        
        // If we have pending values to set, set them now
        if (this.pendingModelValues && this.pendingModelValues.length > 0) {
          console.log('Setting pending model values:', this.pendingModelValues);
          this.setModelValues(this.pendingModelValues);
          this.pendingModelValues = null; // Clear pending values after setting
        }
        // Or set initial values if in edit mode
        else if (this.isEditMode && this.data && this.data.models && Array.isArray(this.data.models) && this.selectedModels.length === 0) {
          console.log('Setting initial models from data:', this.data.models);
          this.setModelValues(this.data.models);
        }
      })
      .catch(error => {
        console.error('Error loading Model data:', error);
        // Show error in the container
        container.innerHTML = '<div class="alert alert-danger">Error loading Models data.</div>';
      });
  }
  
  /**
   * Convert initial Model IDs to names for the dropdown
   * @returns {Array} Array of Model names
   * @private
   */
  getInitialModelNames() {
    if (!this.data || !this.data.models || !Array.isArray(this.data.models)) {
      return [];
    }
    
    // Return empty array initially, will be set properly after Model data is loaded
    return [];
  }
  
  /**
   * Set Model values in the form from IDs array
   * @param {Array} modelIds - Array of Model IDs
   * @private
   */
  setModelValues(modelIds) {
    if (!Array.isArray(modelIds)) {
      console.error('Cannot set model values: modelIds not an array', { modelIds });
      return;
    }
    
    console.log('Setting model values from IDs:', modelIds);
    
    if (!this.modelDropdown) {
      console.log('Model dropdown not initialized yet, storing pending values');
      this.pendingModelValues = modelIds;
      return;
    }
    
    // Convert IDs to values that MultiSelectDropdown expects
    const values = modelIds
      .filter(id => this.modelNameMap.has(id))
      .map(id => ({
        value: id,
        text: this.modelNameMap.get(id)
      }));
    
    console.log('Setting model dropdown values:', values);
    this.modelDropdown.setValues(values);
  }

  /**
   * Get selected model IDs
   * @returns {Array} Array of selected model IDs
   * @private
   */
  getSelectedModelIds() {
    if (!this.modelDropdown) {
      console.warn('Model dropdown not initialized yet');
      return [];
    }
    
    // Get the selected values from the dropdown
    const selectedValues = this.modelDropdown.getValues();
    
    // Extract the model IDs from the selected values
    // The values could be objects with value property or simple strings
    return selectedValues.map(item => {
      if (typeof item === 'object' && item !== null && 'value' in item) {
        return item.value;
      }
      return item;
    });
  }

  /**
   * Initialize the GP multiselect dropdown
   * @private
   */
  initGPDropdown() {
    const container = this.formElement.querySelector('#gpContainer');
    if (!container) return;
    
    // First, fetch the GP data from the API to get the options
    fetch('/api/gps') // Use the API endpoint
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
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
          allowAddNew: false, // Disable adding new GPs from this form
          onChange: () => {
            // Update the GP Model Implementation table
            this.updateGPModelTable();
          }
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
   * Create and update the GP Model Implementation table
   * @private
   */
  updateGPModelTable() {
    const container = this.formElement.querySelector('#gpModelImplementationContainer');
    const tableContainer = this.formElement.querySelector('#gpModelTable');
    
    if (!container || !tableContainer) {
      console.error('GP Model Implementation container not found');
      return;
    }
    
    // Get selected GPs and models
    const selectedGPs = this.gpDropdown ? this.gpDropdown.getValues() : [];
    const selectedModelIds = this.getSelectedModelIds();
    
    // Hide the container if no GPs or models are selected
    if (selectedGPs.length === 0 || selectedModelIds.length === 0) {
      container.style.display = 'none';
      return;
    }
    
    // Show the container
    container.style.display = 'block';
    
    // Create the table
    let tableHTML = `
      <table class="table table-bordered table-hover">
        <thead class="table-light">
          <tr>
            <th>Generic Product</th>
            ${selectedModelIds.map(modelId => `<th>${this.modelNameMap.get(modelId) || modelId}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;
    
    // Add a row for each selected GP
    selectedGPs.forEach(gpName => {
      const gpId = this.gpMap.get(gpName) || gpName;
      
      tableHTML += `<tr>
        <td>${gpName}</td>
        ${selectedModelIds.map(modelId => {
          // Check if this GP has this model in the original data
          const isChecked = this.isGPModelChecked(gpId, modelId);
          return `<td class="text-center">
            <div class="form-check d-flex justify-content-center">
              <input class="form-check-input gp-model-checkbox" type="checkbox" 
                     data-gp-id="${gpId}" data-model-id="${modelId}" 
                     id="gp-${gpId}-model-${modelId}" ${isChecked ? 'checked' : ''}>
            </div>
          </td>`;
        }).join('')}
      </tr>`;
    });
    
    tableHTML += `
        </tbody>
      </table>
    `;
    
    // Set the table HTML
    tableContainer.innerHTML = tableHTML;
  }
  
  /**
   * Check if a GP has a specific model in the original data
   * @param {string} gpId - The GP ID
   * @param {string} modelId - The model ID
   * @returns {boolean} Whether the GP has the model
   * @private
   */
  isGPModelChecked(gpId, modelId) {
    // If we're in edit mode and have original data, check if this GP has this model
    if (this.isEditMode && this.data && this.data.gps && Array.isArray(this.data.gps)) {
      // Find the GP in the original data
      const gp = this.data.gps.find(g => typeof g === 'object' && g.id === gpId);
      
      // If the GP exists and has models, check if it includes this model
      if (gp && gp.models && Array.isArray(gp.models)) {
        return gp.models.includes(modelId);
      }
    }
    
    // Default to checked for new GPs
    return true;
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
    
    // Extract GP IDs from the new data structure
    const gpIds = this.data.gps.map(gp => {
      // Handle both string format (old data) and object format (new data)
      return typeof gp === 'string' ? gp : gp.id;
    });
    
    // Return empty array initially, will be set properly after GP data is loaded
    return [];
  }
  
  /**
   * Set GP values in the dropdown from IDs array
   * @param {Array} gpData - Array of GP IDs or GP objects
   * @private
   */
  setGPValues(gpData) {
    if (!this.gpDropdown || !Array.isArray(gpData)) return;
    
    // Extract GP IDs from the new data structure
    const gpIds = gpData.map(gp => {
      // Handle both string format (old data) and object format (new data)
      return typeof gp === 'string' ? gp : gp.id;
    });
    
    // Convert IDs to names using the mapping
    const gpNames = gpIds.map(id => this.gpNameMap.get(id) || id);
    
    // Set the values in the dropdown
    this.gpDropdown.setValues(gpNames);
    
    // Update the GP Model Implementation table
    this.updateGPModelTable();
  }
  
  /**
   * Set form values for editing an existing service
   * @param {Object} data - The service data
   */
  setValues(data) {
    if (!data || !this.formElement) return;
    
    // Set basic fields
    const fields = [
      { id: 'serviceName', key: 'name' }
    ];
    
    fields.forEach(field => {
      const element = this.formElement.querySelector(`#${field.id}`);
      if (element && data[field.key] !== undefined) {
        element.value = data[field.key];
      }
    });
    
    // Store the original data for debugging
    this.originalData = data;
    
    // Set models if they exist
    if (data.models && Array.isArray(data.models)) {
      console.log('Models found in data:', data.models);
      // We're now using a tag-based approach instead of a dropdown
      // Just store the models to be set when the model selector is initialized
      this.pendingModelValues = data.models;
      console.log('Stored pending model values for later initialization');
    } else {
      console.log('No models found in data or not an array:', data.models);
    }
    
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
      models: this.getSelectedModelIds() || [],
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
   * Get selected GP IDs from the dropdown and their model associations from the table
   * @returns {Array} Array of selected GP IDs with their model associations
   * @private
   */
  getSelectedGPIds() {
    if (!this.gpDropdown) return [];
    
    const selectedGPNames = this.gpDropdown.getValues();
    const tableContainer = this.formElement.querySelector('#gpModelTable');
    
    // Convert names to IDs and format as objects with model associations
    return selectedGPNames.map(name => {
      const gpId = this.gpMap.get(name) || name;
      
      // Get the selected models for this GP from the checkboxes
      const selectedModels = [];
      
      // If the table exists, get the selected models from the checkboxes
      if (tableContainer) {
        const checkboxes = tableContainer.querySelectorAll(`input[data-gp-id="${gpId}"]`);
        checkboxes.forEach(checkbox => {
          if (checkbox.checked) {
            const modelId = checkbox.getAttribute('data-model-id');
            if (modelId) {
              selectedModels.push(modelId);
            }
          }
        });
      }
      
      // If no models are selected from the table, use all service models
      // This can happen if the table hasn't been rendered yet
      if (selectedModels.length === 0) {
        const allServiceModels = this.getSelectedModelIds() || [];
        return {
          id: gpId,
          models: allServiceModels
        };
      }
      
      // Return the GP with its selected models
      return {
        id: gpId,
        models: selectedModels
      };
    });
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
    
    // Check if at least one model is selected using the MultiSelectDropdown
    const modelsValid = this.modelDropdown && this.modelDropdown.getValues().length > 0;
    const modelsContainer = this.formElement.querySelector('#modelsContainer');
    
    if (!modelsValid) {
      if (modelsContainer) {
        modelsContainer.classList.add('is-invalid');
      }
      console.log('Validation failed: No models selected');
    } else {
      if (modelsContainer) {
        modelsContainer.classList.remove('is-invalid');
      }
    }
    
    return nameValid && modelsValid;
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
