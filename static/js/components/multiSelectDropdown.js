/**
 * MultiSelectDropdown - A component for selecting multiple options with the ability to add custom options
 * 
 * This component provides a dropdown interface that allows users to:
 * 1. Select from predefined options
 * 2. Add custom options on the fly
 * 3. See and remove selected options as tags/chips
 */
export class MultiSelectDropdown {
  /**
   * Create a new multi-select dropdown
   * @param {Object} config - Configuration options
   * @param {string} [config.id] - Unique ID for the component
   * @param {Array} [config.initialValues] - Initial selected values
   * @param {Array} [config.options] - Predefined options to choose from
   * @param {string} [config.placeholder] - Placeholder text for the input
   * @param {Function} [config.onChange] - Callback when selected values change
   * @param {string} [config.addNewText] - Text for the "Add new" option
   */
  constructor(config = {}) {
    this.id = config.id || `multiselect-${Date.now()}`;
    this.selectedValues = Array.isArray(config.initialValues) ? [...config.initialValues] : [];
    this.predefinedOptions = Array.isArray(config.options) ? [...config.options] : [];
    this.placeholder = config.placeholder || 'Select or add options...';
    this.onChange = config.onChange || null;
    this.addNewText = config.addNewText || 'Add new option';
    
    // Main element container
    this.element = null;
    
    // Sub-elements that we'll need to reference
    this.selectedArea = null;
    this.dropdownMenu = null;
    this.input = null;
    this.addNewOption = null;
    this.isDropdownOpen = false;
    this.isAddingNew = false;
    
    // Create the component structure
    this.createComponent();
  }
  
  /**
   * Create the dropdown component structure
   * @private
   */
  createComponent() {
    // Create the main container
    this.element = document.createElement('div');
    this.element.className = 'multiselect-dropdown-container';
    this.element.id = this.id;
    
    // Create the selected options display area (tags)
    this.selectedArea = document.createElement('div');
    this.selectedArea.className = 'selected-options';
    
    // Create the input/dropdown area
    const inputContainer = document.createElement('div');
    inputContainer.className = 'dropdown-input-container';
    
    // Create the input field
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'form-control dropdown-input';
    this.input.placeholder = this.selectedValues.length === 0 ? this.placeholder : '';
    this.input.setAttribute('aria-label', 'Search or add options');
    this.input.setAttribute('autocomplete', 'off'); // Prevent browser autocomplete
    
    // Create the dropdown toggle button
    const dropdownToggle = document.createElement('button');
    dropdownToggle.type = 'button';
    dropdownToggle.className = 'dropdown-toggle-btn';
    dropdownToggle.innerHTML = '<i class="fas fa-chevron-down"></i>';
    dropdownToggle.setAttribute('aria-label', 'Toggle dropdown');
    
    // Create the input wrapper
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'input-wrapper';
    inputWrapper.appendChild(this.input);
    inputWrapper.appendChild(dropdownToggle);
    
    // Create the dropdown menu
    this.dropdownMenu = document.createElement('div');
    this.dropdownMenu.className = 'dropdown-menu w-100';
    this.dropdownMenu.setAttribute('aria-labelledby', this.id);
    
    // Populate with predefined options
    this.populateOptions();
    
    // Add "Add new" option
    this.addNewOption = document.createElement('div');
    this.addNewOption.className = 'dropdown-item add-new-option';
    this.addNewOption.innerHTML = `<i class="fas fa-plus me-2"></i><span class="add-text">${this.addNewText}</span>`;
    this.dropdownMenu.appendChild(this.addNewOption);
    
    // Assemble the component
    inputContainer.appendChild(inputWrapper);
    inputContainer.appendChild(this.dropdownMenu);
    this.element.appendChild(this.selectedArea);
    this.element.appendChild(inputContainer);
    
    // Add event listeners
    this.setupEventListeners();
    
    // Render any initial values
    this.renderSelectedOptions();
    
    // Add CSS if not already in the document
    this.addDropdownStyles();
  }
  
  /**
   * Add custom CSS styles if not already present
   * @private
   */
  addDropdownStyles() {
    if (!document.getElementById('multiselect-dropdown-styles')) {
      const style = document.createElement('style');
      style.id = 'multiselect-dropdown-styles';
      style.textContent = `
        .multiselect-dropdown-container {
          position: relative;
          width: 100%;
        }
        
        .selected-options {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          min-height: 30px;
        }
        
        .selected-option {
          display: inline-flex;
          align-items: center;
          background-color: #f0f0f0;
          border-radius: 2rem;
          padding: 0.25rem 0.75rem;
          margin-bottom: 0.25rem;
          user-select: none;
        }
        
        .selected-option .remove-option {
          margin-left: 0.5rem;
          cursor: pointer;
          opacity: 0.7;
          font-size: 0.875rem;
        }
        
        .selected-option .remove-option:hover {
          opacity: 1;
        }
        
        .dropdown-input-container {
          position: relative;
        }
        
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .dropdown-toggle-btn {
          position: absolute;
          right: 8px;
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .dropdown-toggle-btn:hover {
          color: #495057;
        }
        
        .dropdown-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
          padding: 0.5rem 0;
          background-color: #fff;
          border: 1px solid rgba(0, 0, 0, 0.15);
          border-radius: 0.25rem;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
        }
        
        .dropdown-menu.show {
          display: block;
        }
        
        .dropdown-item {
          cursor: pointer;
          padding: 0.5rem 1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .dropdown-item:hover, .dropdown-item:focus {
          background-color: rgba(13, 110, 253, 0.1);
          text-decoration: none;
        }
        
        .dropdown-item.selected {
          background-color: rgba(13, 110, 253, 0.2);
          font-weight: 500;
        }
        
        .add-new-option {
          border-top: 1px solid #dee2e6;
          margin-top: 0.5rem;
          color: #0d6efd;
        }
        
        .add-new-field {
          display: flex;
          padding: 0.5rem;
        }
        
        .add-new-field input {
          flex: 1;
          margin-right: 0.5rem;
        }
        
        .no-results {
          padding: 0.5rem 1rem;
          color: #6c757d;
          font-style: italic;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Populate the dropdown with predefined options
   * @private
   */
  populateOptions() {
    // Safety check for dropdownMenu
    if (!this.dropdownMenu) return;
    
    // Remove existing options but keep "add new" option if it exists
    const existingOptions = this.dropdownMenu.querySelectorAll('.dropdown-item:not(.add-new-option)');
    existingOptions.forEach(item => item.remove());
    
    // Remove any "no results" messages
    const noResultsElements = this.dropdownMenu.querySelectorAll('.no-results');
    noResultsElements.forEach(item => item.remove());
    
    const filterText = this.input ? this.input.value.trim().toLowerCase() : '';
    let hasVisibleOptions = false;
    
    // Filter predefined options
    const filteredOptions = filterText ? 
      this.predefinedOptions.filter(option => 
        option.toLowerCase().includes(filterText) && 
        !this.selectedValues.includes(option)
      ) :
      this.predefinedOptions.filter(option => !this.selectedValues.includes(option));
    
    // Add filtered options to dropdown
    if (filteredOptions.length > 0) {
      hasVisibleOptions = true;
      
      // Insert before the "add new" option if it exists, otherwise just append
      const referenceNode = this.addNewOption || null;
      
      filteredOptions.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'dropdown-item';
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => this.addValue(option));
        
        if (referenceNode) {
          this.dropdownMenu.insertBefore(optionElement, referenceNode);
        } else {
          this.dropdownMenu.appendChild(optionElement);
        }
      });
    }
    
    // Handle the "Add New" option
    if (this.addNewOption) {
      // If we're filtering and no predefined options match, update text to add current input
      if (filterText && !filteredOptions.some(opt => opt.toLowerCase() === filterText.toLowerCase())) {
        this.addNewOption.innerHTML = `<i class="fas fa-plus me-2"></i>Add "${filterText}"`;
      } else {
        this.addNewOption.innerHTML = `<i class="fas fa-plus me-2"></i>${this.addNewText}`;
      }
      
      // Make sure it's visible
      this.addNewOption.style.display = 'block';
    } else {
      // If addNewOption doesn't exist yet, create it
      this.addNewOption = document.createElement('div');
      this.addNewOption.className = 'dropdown-item add-new-option';
      this.addNewOption.innerHTML = `<i class="fas fa-plus me-2"></i>${this.addNewText}`;
      this.addNewOption.addEventListener('click', () => {
        const value = this.input.value.trim();
        if (value) {
          this.addValueFromInput();
        } else {
          this.startAddingNew();
        }
      });
      this.dropdownMenu.appendChild(this.addNewOption);
    }
    
    // If no options are showing, display a message
    if (!hasVisibleOptions && !this.isAddingNew) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = 'No matching options';
      
      if (this.addNewOption) {
        this.dropdownMenu.insertBefore(noResults, this.addNewOption);
      } else {
        this.dropdownMenu.appendChild(noResults);
      }
    }
  }
  
  /**
   * Render the currently selected options as tags
   * @private
   */
  renderSelectedOptions() {
    if (!this.selectedArea) return;
    
    // Clear existing tags
    this.selectedArea.innerHTML = '';
    
    // Create tag for each selected value
    this.selectedValues.forEach(value => {
      const tag = document.createElement('div');
      tag.className = 'selected-option';
      
      const text = document.createElement('span');
      text.className = 'option-text';
      text.textContent = value;
      
      const removeBtn = document.createElement('span');
      removeBtn.className = 'remove-option';
      removeBtn.innerHTML = '&times;';
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeValue(value);
      });
      
      tag.appendChild(text);
      tag.appendChild(removeBtn);
      this.selectedArea.appendChild(tag);
    });
    
    // Update placeholder based on whether we have selected values
    if (this.input) {
      this.input.placeholder = this.selectedValues.length === 0 ? this.placeholder : '';
    }
  }
  
  /**
   * Add event listeners for the dropdown and input
   * @private
   */
  setupEventListeners() {
    // Input focus shows dropdown
    this.input.addEventListener('focus', () => {
      this.openDropdown();
    });
    
    // Input keyup for filtering
    this.input.addEventListener('input', () => {
      this.populateOptions();
    });
    
    // Dropdown toggle button
    const toggleBtn = this.element.querySelector('.dropdown-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleDropdown();
      });
    }
    
    // Keyboard navigation
    this.input.addEventListener('keydown', (e) => {
      // Enter key to add new option
      if (e.key === 'Enter' && this.isDropdownOpen) {
        e.preventDefault();
        
        const value = this.input.value.trim();
        if (value) {
          // If we're in the "adding new" state, add the current input value
          if (this.isAddingNew) {
            this.finishAddingNew();
          } else {
            this.addValueFromInput();
          }
        }
      }
      
      // Escape key to close dropdown
      if (e.key === 'Escape') {
        this.closeDropdown();
      }
    });
    
    // Add new option click (with null check)
    if (this.addNewOption) {
      this.addNewOption.addEventListener('click', () => {
        const value = this.input.value.trim();
        if (value) {
          this.addValueFromInput();
        } else {
          this.startAddingNew();
        }
      });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (this.element && !this.element.contains(e.target) && this.isDropdownOpen) {
        this.closeDropdown();
      }
    });
  }
  
  /**
   * Toggle the dropdown open/closed state
   * @private
   */
  toggleDropdown() {
    if (this.isDropdownOpen) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }
  
  /**
   * Open the dropdown menu
   * @private
   */
  openDropdown() {
    if (!this.isDropdownOpen) {
      this.dropdownMenu.classList.add('show');
      this.isDropdownOpen = true;
      this.populateOptions();
    }
  }
  
  /**
   * Close the dropdown menu
   * @private
   */
  closeDropdown() {
    if (this.isDropdownOpen) {
      this.dropdownMenu.classList.remove('show');
      this.isDropdownOpen = false;
      
      // Reset adding new state
      if (this.isAddingNew) {
        this.isAddingNew = false;
        this.populateOptions();
      }
      
      // Clear input
      this.input.value = '';
    }
  }
  
  /**
   * Start adding a new custom option
   * @private
   */
  startAddingNew() {
    this.isAddingNew = true;
    
    // Clear dropdown and add input field
    this.dropdownMenu.innerHTML = '';
    
    const addNewField = document.createElement('div');
    addNewField.className = 'add-new-field';
    
    const newInput = document.createElement('input');
    newInput.type = 'text';
    newInput.className = 'form-control form-control-sm';
    newInput.placeholder = 'Enter new option...';
    newInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.finishAddingNew();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.cancelAddingNew();
      }
    });
    
    const addButton = document.createElement('button');
    addButton.className = 'btn btn-sm btn-primary';
    addButton.textContent = 'Add';
    addButton.addEventListener('click', () => this.finishAddingNew());
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-sm btn-secondary ms-1';
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', () => this.cancelAddingNew());
    
    addNewField.appendChild(newInput);
    addNewField.appendChild(addButton);
    addNewField.appendChild(cancelButton);
    
    this.dropdownMenu.appendChild(addNewField);
    
    // Focus the new input
    setTimeout(() => newInput.focus(), 10);
  }
  
  /**
   * Finish adding a new option, adding the value to the selected list
   * @private
   */
  finishAddingNew() {
    const newInput = this.dropdownMenu.querySelector('.add-new-field input');
    if (newInput && newInput.value.trim()) {
      this.addValue(newInput.value.trim());
    }
    
    this.isAddingNew = false;
    this.populateOptions();
  }
  
  /**
   * Cancel adding a new option
   * @private
   */
  cancelAddingNew() {
    this.isAddingNew = false;
    this.populateOptions();
  }
  
  /**
   * Add value from the main input field
   * @private
   */
  addValueFromInput() {
    const value = this.input.value.trim();
    if (value) {
      this.addValue(value);
    }
  }
  
  /**
   * Add a value to the selected values
   * @param {string} value - Value to add
   * @public
   */
  addValue(value) {
    if (!value || this.selectedValues.includes(value)) return;
    
    this.selectedValues.push(value);
    this.renderSelectedOptions();
    
    // If this is a new option, add it to predefined options for future use
    if (!this.predefinedOptions.includes(value)) {
      this.predefinedOptions.push(value);
    }
    
    // Clear input and repopulate options
    this.input.value = '';
    this.populateOptions();
    
    // Focus back on main input
    this.input.focus();
    
    // Trigger change callback
    this.triggerOnChange();
  }
  
  /**
   * Remove a value from the selected values
   * @param {string} value - Value to remove
   * @public
   */
  removeValue(value) {
    const index = this.selectedValues.indexOf(value);
    if (index !== -1) {
      this.selectedValues.splice(index, 1);
      this.renderSelectedOptions();
      this.populateOptions();
      
      // Focus back on main input
      this.input.focus();
      
      // Trigger change callback
      this.triggerOnChange();
    }
  }
  
  /**
   * Get all selected values
   * @return {Array} Selected values
   * @public
   */
  getValues() {
    return [...this.selectedValues];
  }
  
  /**
   * Set selected values
   * @param {Array} values - New values to set
   * @public
   */
  setValues(values) {
    if (Array.isArray(values)) {
      this.selectedValues = [...values];
      this.renderSelectedOptions();
      this.populateOptions();
      
      // Trigger change callback
      this.triggerOnChange();
    }
  }
  
  /**
   * Clear all selected values
   * @public
   */
  clear() {
    this.selectedValues = [];
    this.renderSelectedOptions();
    this.populateOptions();
    
    // Trigger change callback
    this.triggerOnChange();
  }
  
  /**
   * Call the onChange callback if it exists
   * @private
   */
  triggerOnChange() {
    if (this.onChange && typeof this.onChange === 'function') {
      this.onChange(this.getValues());
    }
  }
}
