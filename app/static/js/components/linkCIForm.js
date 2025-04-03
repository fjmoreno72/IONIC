// linkCIForm.js - Component for managing Link Configuration Items
export class LinkCIForm {
  constructor(options) {
    // Options from caller
    this.data = options.data || {};
    this.onSubmit = options.onSubmit || function() {};
    this.onDelete = options.onDelete || function() {};
    this.linkId = options.linkId || '';
    this.linkName = options.linkName || '';
    this.link = options.link || {}; // Add link data to access GP information
    this.gpNames = options.gpNames || {}; // GP names lookup function
    
    // Create the form element
    this.element = document.createElement('div');
    this.element.className = 'link-ci-form';
    
    // Render the form
    this.renderForm();
    
    // Bind event listeners
    this.bindEventListeners();
  }
  
  /**
   * Render the form content
   */
  renderForm() {
    // Determine if this is an edit or create
    const isEditing = !!this.data.Name;
    
    // Get GP information for display - with GP names only
    const getGPNameById = id => {
      const gp = window.allGPs?.find(g => g.id === id);
      return gp ? gp.name : id;
    };
    
    const gpSideA = Array.isArray(this.link.gps_side_a) && this.link.gps_side_a.length > 0 
      ? this.link.gps_side_a.map(id => getGPNameById(id)).join(', ')
      : 'None';
      
    const gpSideB = Array.isArray(this.link.gps_side_b) && this.link.gps_side_b.length > 0
      ? this.link.gps_side_b.map(id => getGPNameById(id)).join(', ')
      : 'None';
    
    // Create form content
    this.element.innerHTML = `
      <form id="linkCIForm" class="needs-validation" novalidate>
        <div class="d-flex align-items-center mb-3">
          <div class="alert alert-secondary p-2 flex-grow-1 mb-0 me-2">
            <strong>Side A:</strong> ${gpSideA}
          </div>
          <div class="d-flex align-items-center mx-2" style="font-size: 1.5rem;">
            <i class="fas fa-arrow-right"></i>
          </div>
          <div class="alert alert-secondary p-2 flex-grow-1 mb-0 ms-2">
            <strong>Side B:</strong> ${gpSideB}
          </div>
        </div>
        <div class="mb-3">
          <label for="ciName" class="form-label">Name<span class="text-danger">*</span></label>
          <input type="text" class="form-control" id="ciName" name="Name" 
                 autocomplete="off" required
                 value="${this.data.Name || ''}">
          <div class="invalid-feedback">Please enter a name for this Configuration Item.</div>
        </div>
        
        <div class="mb-3">
          <label for="ciHelpText" class="form-label">Help Text</label>
          <input type="text" class="form-control" id="ciHelpText" name="Help Text"
                 autocomplete="off"
                 value="${this.data['Help Text'] || ''}">
        </div>
        
        <div class="mb-3">
          <label for="ciDefaultValue" class="form-label">Default Value</label>
          <input type="text" class="form-control" id="ciDefaultValue" name="Default Value"
                 autocomplete="off"
                 value="${this.data['Default Value'] || ''}">
        </div>
        
        <div class="mb-3">
          <label for="ciAnswerType" class="form-label">Answer Type<span class="text-danger">*</span></label>
          <select class="form-select" id="ciAnswerType" name="Answer Type" required>
            <option value="" ${!this.data['Answer Type'] ? 'selected' : ''} disabled>Select an answer type</option>
            <option value="Text Field (Single Line)" ${this.data['Answer Type'] === 'Text Field (Single Line)' ? 'selected' : ''}>Text Field (Single Line)</option>
            <option value="Text Field (Multi Line)" ${this.data['Answer Type'] === 'Text Field (Multi Line)' ? 'selected' : ''}>Text Field (Multi Line)</option>
            <option value="Static Drop Down" ${this.data['Answer Type'] === 'Static Drop Down' ? 'selected' : ''}>Static Drop Down</option>
            <option value="Email Address" ${this.data['Answer Type'] === 'Email Address' ? 'selected' : ''}>Email Address</option>
            <option value="IP Address" ${this.data['Answer Type'] === 'IP Address' ? 'selected' : ''}>IP Address</option>
            <option value="Port" ${this.data['Answer Type'] === 'Port' ? 'selected' : ''}>Port</option>
          </select>
          <div class="invalid-feedback">Please select an answer type.</div>
        </div>
        
        <div class="mb-3">
          <label for="ciAnswerContent" class="form-label">Answer Content</label>
          <input type="text" class="form-control" id="ciAnswerContent" name="Answer Content"
                 autocomplete="off" placeholder="For dropdown options, separate with commas"
                 value="${this.data['Answer Content'] || ''}">
          <div class="form-text">For dropdown options, separate with commas (e.g. "Option 1,Option 2,Option 3")</div>
        </div>
        
        <div class="mb-3">
          <label for="ciApplyAB" class="form-label">Apply A/B<span class="text-danger">*</span></label>
          <select class="form-select" id="ciApplyAB" name="Apply A/B" required>
            <option value="" ${!this.data['Apply A/B'] ? 'selected' : ''} disabled>Select application</option>
            <option value="Both" ${this.data['Apply A/B'] === 'Both' ? 'selected' : ''}>Both</option>
            <option value="Side A" ${this.data['Apply A/B'] === 'Side A' ? 'selected' : ''}>Side A</option>
            <option value="Side B" ${this.data['Apply A/B'] === 'Side B' ? 'selected' : ''}>Side B</option>
          </select>
          <div class="invalid-feedback">Please select where this Configuration Item applies.</div>
        </div>
        
        ${isEditing ? `
          <div class="mb-3 delete-button-container text-end">
            <button type="button" class="btn btn-danger btn-sm" id="deleteCI">
              <i class="fas fa-trash me-1"></i> Delete Configuration Item
            </button>
          </div>
        ` : ''}
      </form>
    `;
  }
  
  /**
   * Bind event listeners to form elements
   */
  bindEventListeners() {
    const form = this.element.querySelector('#linkCIForm');
    if (!form) return;
    
    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Validate form
      if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        return;
      }
      
      // Gather form data
      const formData = {
        Name: form.querySelector('#ciName').value,
        'Help Text': form.querySelector('#ciHelpText').value,
        'Default Value': form.querySelector('#ciDefaultValue').value,
        'Answer Type': form.querySelector('#ciAnswerType').value,
        'Answer Content': form.querySelector('#ciAnswerContent').value,
        'Apply A/B': form.querySelector('#ciApplyAB').value
      };
      
      // Submit form data
      this.onSubmit(formData, this.linkId);
    });
    
    // Delete button (if editing)
    const deleteButton = this.element.querySelector('#deleteCI');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        // Confirm deletion
        if (confirm(`Are you sure you want to delete the configuration item "${this.data.Name}"?`)) {
          this.onDelete(this.data.Name, this.linkId);
        }
      });
    }
  }
}
