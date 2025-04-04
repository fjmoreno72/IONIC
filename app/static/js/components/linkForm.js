/**
 * LinkForm - A component for creating and editing links
 */
import { MultiSelectDropdown } from './multiSelectDropdown.js';

export class LinkForm {
  /**
   * Create a new link form
   * @param {Object} config - Configuration options
   * @param {Object} [config.data] - Initial data for the form
   * @param {Function} [config.onSubmit] - Callback when form is submitted
   * @param {Function} [config.onDelete] - Callback when delete button is clicked
   */
  constructor(config = {}) {
    this.data = config.data || null;
    this.onSubmit = config.onSubmit || null;
    this.onDelete = config.onDelete || null;
    
    // DOM elements
    this.element = document.createElement('div');
    this.element.className = 'link-form-container';
    
    // MultiSelect dropdowns
    this.gpsSideAMultiSelect = null;
    this.gpsSideBMultiSelect = null;
    
    // Create form elements
    this.initializeForm();
    
    // Load GP data for dropdowns
    this.loadGPs();
  }
  
  /**
   * Initialize the form with all necessary elements
   * @private
   */
  initializeForm() {
    const form = document.createElement('form');
    form.id = 'linkForm';
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Create form content
    form.innerHTML = `
      <div class="mb-3">
        <label for="linkId" class="form-label">ID</label>
        <input type="text" class="form-control" id="linkId" readonly
          placeholder="Auto-generated if empty" value="${this.data?.id || ''}" autocomplete="off">
        <div class="form-text text-muted">ID format: LNK-XXXX (auto-generated if empty)</div>
      </div>
      
      <div class="mb-3">
        <label for="linkName" class="form-label">Name*</label>
        <input type="text" class="form-control" id="linkName" required
          placeholder="Link name" value="${this.data?.name || ''}" autocomplete="off">
      </div>
      
      <div class="mb-3">
        <label for="linkDescription" class="form-label">Description</label>
        <textarea class="form-control" id="linkDescription" rows="2"
          placeholder="Link description" autocomplete="off">${this.data?.description || ''}</textarea>
      </div>
      
      <div class="mb-3">
        <label for="gpsSideAMultiSelect" class="form-label">GPs on Side A*</label>
        <div id="gpsSideAContainer">
          <!-- MultiSelectDropdown will be attached here -->
        </div>
        <div class="form-text text-muted">Select one or more Generic Products</div>
      </div>
      
      <div class="mb-3">
        <label for="gpsSideBMultiSelect" class="form-label">GPs on Side B*</label>
        <div id="gpsSideBContainer">
          <!-- MultiSelectDropdown will be attached here -->
        </div>
        <div class="form-text text-muted">Select one or more Generic Products</div>
      </div>
    `;
    
    // Add form to element
    this.element.appendChild(form);
    
    // Add delete button if in edit mode and onDelete provided
    if (this.data && this.data.id && this.onDelete) {
      this.addDeleteButton();
    }
  }
  
  /**
   * Add delete button to the form
   * @private
   */
  addDeleteButton() {
    const deleteContainer = document.createElement('div');
    deleteContainer.className = 'delete-button-container text-end mt-4 pt-3 border-top';
    
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-danger';
    deleteButton.innerHTML = '<i class="fas fa-trash me-1"></i> Delete Link';
    deleteButton.onclick = () => this.handleDelete();
    
    deleteContainer.appendChild(deleteButton);
    this.element.appendChild(deleteContainer);
  }
  
  /**
   * Load Generic Products data and populate dropdowns
   * @private
   */
  async loadGPs() {
    try {
      const response = await fetch('/api/gps'); // Use the API endpoint
      if (!response.ok) {
        throw new Error('Failed to load Generic Products data');
      }
      
      const gpsData = await response.json();
      
      // Sort GPs by name
      gpsData.sort((a, b) => a.name.localeCompare(b.name));
      
      // Create a list of GP names and map from names to IDs for lookup
      const gpNames = gpsData.map(gp => gp.name);
      this.gpNameToIdMap = {};
      gpsData.forEach(gp => {
        this.gpNameToIdMap[gp.name] = gp.id;
      });
      
      // Create MultiSelectDropdown for Side A
      const gpsSideAContainer = document.getElementById('gpsSideAContainer');
      if (gpsSideAContainer) {
        gpsSideAContainer.innerHTML = ''; // Clear container
        
        // Get initially selected values if editing
        const initialSideAValues = [];
        if (this.data && Array.isArray(this.data.gps_side_a)) {
          this.data.gps_side_a.forEach(gpId => {
            const gp = gpsData.find(g => g.id === gpId);
            if (gp) initialSideAValues.push(gp.name);
          });
        }
        
        
        // Create the multiselect
        this.gpsSideAMultiSelect = new MultiSelectDropdown({
          id: 'gpsSideAMultiSelect',
          options: gpNames,
          initialValues: initialSideAValues,
          placeholder: 'Select Generic Products for Side A...',
          addNewText: 'Add custom GP'
        });
        
        gpsSideAContainer.appendChild(this.gpsSideAMultiSelect.element);
      }
      
      // Create MultiSelectDropdown for Side B
      const gpsSideBContainer = document.getElementById('gpsSideBContainer');
      if (gpsSideBContainer) {
        gpsSideBContainer.innerHTML = ''; // Clear container
        
        // Get initially selected values if editing
        const initialSideBValues = [];
        if (this.data && Array.isArray(this.data.gps_side_b)) {
          this.data.gps_side_b.forEach(gpId => {
            const gp = gpsData.find(g => g.id === gpId);
            if (gp) initialSideBValues.push(gp.name);
          });
        }
        
        // Create the multiselect
        this.gpsSideBMultiSelect = new MultiSelectDropdown({
          id: 'gpsSideBMultiSelect',
          options: gpNames,
          initialValues: initialSideBValues,
          placeholder: 'Select Generic Products for Side B...',
          addNewText: 'Add custom GP'
        });
        
        gpsSideBContainer.appendChild(this.gpsSideBMultiSelect.element);
      }
      
    } catch (error) {
      console.error('Error loading Generic Products:', error);
      
      // Show error messages in containers
      const containers = [
        document.getElementById('gpsSideAContainer'),
        document.getElementById('gpsSideBContainer')
      ];
      
      containers.forEach(container => {
        if (container) {
          container.innerHTML = `
            <div class="alert alert-danger">
              Error loading Generic Products. Please try again.
            </div>
          `;
        }
      });
    }
  }
  
  /**
   * Handle form submission
   * @param {Event} e - The submit event
   * @private
   */
  handleSubmit(e) {
    e.preventDefault();
    
    // Get basic form values
    const formData = {
      id: document.getElementById('linkId').value.trim(),
      name: document.getElementById('linkName').value.trim(),
      description: document.getElementById('linkDescription').value.trim(),
      linkCIs: this.data?.linkCIs || []
    };
    
    // Get GP values from multi-selects
    const sideANames = this.gpsSideAMultiSelect ? this.gpsSideAMultiSelect.getValues() : [];
    const sideBNames = this.gpsSideBMultiSelect ? this.gpsSideBMultiSelect.getValues() : [];
    
    // Convert GP names to IDs
    formData.gps_side_a = sideANames.map(name => {
      // If this is a new GP name not in our map, it's a custom entry
      // We'll return the name as is, and the backend can handle assigning a new ID
      return this.gpNameToIdMap[name] || name;
    });
    
    formData.gps_side_b = sideBNames.map(name => {
      return this.gpNameToIdMap[name] || name;
    });
    
    // Validate form
    if (!formData.name) {
      alert('Please enter a name for the link');
      return;
    }
    
    if (formData.gps_side_a.length === 0) {
      alert('Please select at least one Generic Product for Side A');
      return;
    }
    
    if (formData.gps_side_b.length === 0) {
      alert('Please select at least one Generic Product for Side B');
      return;
    }
    
    // If this is the original data being edited, include it
    if (this.data) {
      formData.originalName = this.data.name;
    }
    
    // Submit form data
    if (this.onSubmit) {
      this.onSubmit(formData);
    }
  }
  
  /**
   * Handle link deletion
   * @private
   */
  handleDelete() {
    if (!this.data || !this.data.id) return;
    
    // Confirm deletion
    if (confirm(`Are you sure you want to delete the link "${this.data.name}" (${this.data.id})?`)) {
      if (this.onDelete) {
        this.onDelete(this.data.id, this.data.name);
      }
    }
  }
}
