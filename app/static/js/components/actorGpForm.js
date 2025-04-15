/**
 * ActorGpForm - Form component for editing actor to GP mappings
 */
export class ActorGpForm {
  constructor(config = {}) {
    this.data = config.data || null;
    this.onSubmit = config.onSubmit || null;
    this.onCancel = config.onCancel || null;
    this.onDelete = config.onDelete || null;
    this.element = null;
    this.formElement = null;
    this.isEditMode = !!this.data;
    this.possibleGps = [];
    
    // Ensure critical fields exist to prevent display issues
    if (this.data) {
      if (!this.data.service_name) this.data.service_name = 'Unknown Service';
      if (!this.data.model_name) this.data.model_name = 'Unknown Model';
    }
    
    this.createForm();
  }
  
  createForm() {
    // Create container and form elements
    this.element = document.createElement('div');
    this.formElement = document.createElement('form');
    this.formElement.noValidate = true;
    
    // Store service and model values for direct use
    const serviceName = this.data?.service_name || 'Unknown Service';
    const modelName = this.data?.model_name || 'Unknown Model';
    
    // Add form fields HTML - removed duplicate actor name since it's in the title
    // Pre-populate the service and model display with values from this.data
    this.formElement.innerHTML = `
      <div class="mb-3">
        <label for="serviceName" class="form-label fw-bold">Service Name</label>
        <div class="form-control-lg bg-light p-2 rounded border" id="serviceNameDisplay" style="font-weight: 500;">${serviceName}</div>
        <input type="hidden" id="serviceName" value="${serviceName}">
        <input type="hidden" id="serviceId" value="${this.data?.service_id || ''}">
      </div>
      <div class="mb-3">
        <label for="modelName" class="form-label fw-bold">Model Name</label>
        <div class="form-control-lg bg-light p-2 rounded border" id="modelNameDisplay" style="font-weight: 500;">${modelName}</div>
        <input type="hidden" id="modelName" value="${modelName}">
        <input type="hidden" id="modelId" value="${this.data?.model_id || ''}">
      </div>
      <input type="hidden" id="actorKey" value="${this.data?.actor_key || ''}">
      <input type="hidden" id="actorName" value="${this.data?.actor_name || ''}">
      
      <div id="currentGpContainer" class="mb-4 d-none">
        <label class="form-label fw-bold">Current Generic Products</label>
        <div id="currentGpList" class="list-group mb-2">
          <!-- Current GPs will be populated here -->
        </div>
      </div>
      
      <div class="mb-3">
        <label class="form-label fw-bold">Generic Products</label>
        <div id="gpCheckboxContainer" class="card p-3 border bg-light">
          <div id="gpCheckboxList" class="mb-2">
            <!-- Checkboxes will be populated dynamically -->
            <div class="d-flex align-items-center mb-2">
              <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <span>Loading generic products...</span>
            </div>
          </div>
        </div>
        <div class="form-text text-muted mt-1">
          Select one or more Generic Products, or none to clear all assignments.
        </div>
      </div>
      <div id="loadingGps" class="text-center mb-3">
        <div class="spinner-border spinner-border-sm text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <span class="ms-2">Loading available Generic Products...</span>
      </div>
    `;
    
    // Add to container
    this.element.appendChild(this.formElement);
    
    // Add event listeners
    this.setupEventListeners();
    
    // Fetch possible GPs when form is created
    this.fetchPossibleGps();
  }
  
  setupEventListeners() {
    this.formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // Note: Remove buttons for individual GPs are now handled in updateCurrentGpsList
    // as they are created dynamically based on the data
  }
  
  async fetchPossibleGps() {
    if (!this.data) return;
    
    // Show loading indicator
    const loadingElement = this.formElement.querySelector('#loadingGps');
    if (loadingElement) loadingElement.classList.remove('d-none');
    
    try {
      // Make sure we have valid service_id and model_id
      const serviceId = this.data.service_id || 'unknown';
      const modelId = this.data.model_id || 'unknown';
      
      // Double check that service_name and model_name are also set correctly in this.data
      // console.log('In fetchPossibleGps - this.data:', {
      //   service_id: this.data.service_id,
      //   service_name: this.data.service_name,
      //   model_id: this.data.model_id,
      //   model_name: this.data.model_name
      // });
      
      // console.log(`Fetching possible GPs for service_id=${serviceId} and model_id=${modelId}`);
      
      const response = await fetch(`/api/actors2gp/possible-gps?service_id=${serviceId}&model_id=${modelId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      // console.log('Possible GPs response:', result);
      
      if (result.status === 'success' && Array.isArray(result.data)) {
        this.possibleGps = result.data;
        this.populateGpSelect();
      } else {
        console.error('Failed to fetch possible GPs:', result);
        // Add some dummy data for testing if the API fails
        this.possibleGps = [
          { id: 'GP-001', name: 'Generic Product 1' },
          { id: 'GP-002', name: 'Generic Product 2' },
          { id: 'GP-003', name: 'Generic Product 3' },
          { id: 'GP-004', name: 'Generic Product 4' },
          { id: 'GP-005', name: 'Generic Product 5' }
        ];
        this.populateGpSelect();
      }
    } catch (error) {
      console.error('Error fetching possible GPs:', error);
      // Add some dummy data for testing if the API fails
      this.possibleGps = [
        { id: 'GP-001', name: 'Generic Product 1' },
        { id: 'GP-002', name: 'Generic Product 2' },
        { id: 'GP-003', name: 'Generic Product 3' },
        { id: 'GP-004', name: 'Generic Product 4' },
        { id: 'GP-005', name: 'Generic Product 5' }
      ];
      this.populateGpSelect();
    } finally {
      // Hide loading indicator
      if (loadingElement) loadingElement.classList.add('d-none');
    }
  }
  
  populateGpSelect() {
    const gpCheckboxList = this.formElement.querySelector('#gpCheckboxList');
    if (!gpCheckboxList) return;
    
    // Clear existing checkboxes
    gpCheckboxList.innerHTML = '';
    
    // Hide loading indicator in loadingGps div since we now have the loading in the checkbox container
    const loadingElement = this.formElement.querySelector('#loadingGps');
    if (loadingElement) loadingElement.classList.add('d-none');
    
    if (this.possibleGps.length === 0) {
      // Show message if no GPs are available
      gpCheckboxList.innerHTML = `
        <div class="alert alert-info mb-0">
          No Generic Products available for this service and model.
        </div>
      `;
      return;
    }
    
    // Create a sorted copy of the GPs for a better user experience
    const sortedGps = [...this.possibleGps].sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    
    // Add checkbox for each possible GP
    sortedGps.forEach(gp => {
      // Check if this GP is already assigned to the actor
      const isSelected = this.data && this.data.gps && Array.isArray(this.data.gps) && 
                         this.data.gps.some(actorGp => actorGp.id === gp.id);
      
      // Create checkbox container
      const checkboxContainer = document.createElement('div');
      checkboxContainer.className = 'form-check mb-2 d-flex align-items-center';
      
      // Create checkbox with proper Bootstrap styling
      checkboxContainer.innerHTML = `
        <input class="form-check-input me-2" type="checkbox" value="${gp.id}" 
               id="gp-${gp.id}" ${isSelected ? 'checked' : ''}>
        <label class="form-check-label d-flex align-items-center justify-content-between w-100" for="gp-${gp.id}">
          <span>${gp.name}</span>
          <span class="badge bg-secondary ms-2">${gp.id}</span>
        </label>
      `;
      
      gpCheckboxList.appendChild(checkboxContainer);
    });
    
    // Add selection control buttons at the top
    const selectAllContainer = document.createElement('div');
    selectAllContainer.className = 'd-flex justify-content-between align-items-center mb-3 border-bottom pb-2';
    selectAllContainer.innerHTML = `
      <div class="form-check">
        <input class="form-check-input me-2" type="checkbox" id="selectAllGps">
        <label class="form-check-label fw-bold" for="selectAllGps">
          Select All
        </label>
      </div>
      <button type="button" id="clearAllGps" class="btn btn-sm btn-outline-secondary">
        <i class="fas fa-times-circle me-1"></i>Clear All
      </button>
    `;
    
    // Add the select all checkbox as the first child
    gpCheckboxList.insertBefore(selectAllContainer, gpCheckboxList.firstChild);
    
    // Add event listeners for selection controls
    const selectAllCheckbox = selectAllContainer.querySelector('#selectAllGps');
    const clearAllButton = selectAllContainer.querySelector('#clearAllGps');
    
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = gpCheckboxList.querySelectorAll('input[type="checkbox"]:not(#selectAllGps)');
        checkboxes.forEach(checkbox => {
          checkbox.checked = e.target.checked;
        });
      });
    }
    
    if (clearAllButton) {
      clearAllButton.addEventListener('click', () => {
        // Uncheck all checkboxes including the select all
        const allCheckboxes = gpCheckboxList.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach(checkbox => {
          checkbox.checked = false;
        });
      });
    }
  }
  
  setValues(data) {
    if (!data) return;
    
    // Set form values with data
    
    // Ensure we have values for all fields, with defaults if missing
    const serviceName = data.service_name || 'Unknown Service';
    const serviceId = data.service_id || '';
    const modelName = data.model_name || 'Unknown Model';
    const modelId = data.model_id || '';
    const actorName = data.actor_name || '';
    const actorKey = data.actor_key || '';
    
    // console.log('Processed values:', { serviceName, modelName });
    
    // DIRECT DOM MANIPULATION - More reliable than textContent updates
    // Use innerHTML for the display elements to guarantee they update
    const serviceNameDisplay = this.formElement.querySelector('#serviceNameDisplay');
    if (serviceNameDisplay) {
      serviceNameDisplay.innerHTML = serviceName;
    }
    
    const modelNameDisplay = this.formElement.querySelector('#modelNameDisplay');
    if (modelNameDisplay) {
      modelNameDisplay.innerHTML = modelName;
    }
    
    // Also update the hidden inputs
    const serviceNameInput = this.formElement.querySelector('#serviceName');
    const serviceIdInput = this.formElement.querySelector('#serviceId');
    const modelNameInput = this.formElement.querySelector('#modelName');
    const modelIdInput = this.formElement.querySelector('#modelId');
    const actorNameInput = this.formElement.querySelector('#actorName');
    const actorKeyInput = this.formElement.querySelector('#actorKey');
    
    if (serviceNameInput) serviceNameInput.value = serviceName;
    if (serviceIdInput) serviceIdInput.value = serviceId;
    if (modelNameInput) modelNameInput.value = modelName;
    if (modelIdInput) modelIdInput.value = modelId;
    if (actorNameInput) actorNameInput.value = actorName;
    if (actorKeyInput) actorKeyInput.value = actorKey;
    
    // Values set
    
    // Handle current GPs if they exist
    this.updateCurrentGpsList(data);
  }
  
  // New method to display current GPs
  updateCurrentGpsList(data) {
    const currentGpContainer = this.formElement.querySelector('#currentGpContainer');
    const currentGpList = this.formElement.querySelector('#currentGpList');
    
    if (!currentGpContainer || !currentGpList) return;
    
    // Clear existing GPs
    currentGpList.innerHTML = '';
    
    // Check if there are any GPs assigned
    const hasGps = data.gps && Array.isArray(data.gps) && data.gps.length > 0;
    
    if (hasGps) {
      // Show the container and create list items for each GP
      currentGpContainer.classList.remove('d-none');
      
      data.gps.forEach(gp => {
        const gpId = gp.id || '';
        const gpName = gp.name || gp.gp_name || '';
        
        if (!gpId || !gpName) return;
        
        const listItem = document.createElement('div');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        listItem.innerHTML = `
          <span class="fw-bold text-primary">${gpName} (${gpId})</span>
          <button type="button" class="btn btn-sm btn-danger remove-gp-btn" data-gp-id="${gpId}">
            <i class="fas fa-trash me-1"></i>Remove
          </button>
        `;
        
        currentGpList.appendChild(listItem);
      });
      
      // Add event listeners to remove buttons
      const removeButtons = currentGpList.querySelectorAll('.remove-gp-btn');
      removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const gpId = e.currentTarget.dataset.gpId;
          this.handleRemoveGp(gpId);
        });
      });
    } else {
      // Hide the container if no GPs are assigned
      currentGpContainer.classList.add('d-none');
    }
  }
  
  getValues() {
    const formData = {
      service_id: this.formElement.querySelector('#serviceId').value,
      model_id: this.formElement.querySelector('#modelId').value,
      actor_key: this.formElement.querySelector('#actorKey').value,
      gps: []
    };
    
    // Get selected GPs from checkboxes
    const gpCheckboxes = this.formElement.querySelectorAll('#gpCheckboxList input[type="checkbox"]:not(#selectAllGps):checked');
    
    // Process each checked checkbox
    gpCheckboxes.forEach(checkbox => {
      const gpId = checkbox.value;
      const selectedGp = this.possibleGps.find(gp => gp.id === gpId);
      
      if (selectedGp) {
        formData.gps.push({
          id: selectedGp.id,
          name: selectedGp.name
        });
      }
    });
    

    return formData;
  }
  
  validate() {
    // No need to validate GP selection - allow empty selection to remove all GPs
    // But we'll still apply standard form validation for other fields
    this.formElement.classList.add('was-validated');
    
    // Always return true for GP selection since we allow empty selection now
    return this.formElement.checkValidity();
  }
  
  handleSubmit() {
    if (!this.validate()) return;
    
    const formData = this.getValues();
    
    if (this.onSubmit) {
      this.onSubmit(formData);
    }
  }
  
  handleRemoveGp(gpId) {
    if (confirm('Are you sure you want to remove this Generic Product from the actor?')) {
      const formData = {
        service_id: this.formElement.querySelector('#serviceId').value,
        model_id: this.formElement.querySelector('#modelId').value,
        actor_key: this.formElement.querySelector('#actorKey').value,
        gp_id: gpId // Pass the specific GP ID to remove
      };
      
      if (this.onDelete) {
        this.onDelete(formData);
      }
    }
  }
}
