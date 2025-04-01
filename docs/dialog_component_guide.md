# Component-Based Dialog & CRUD Operations Guide

This guide explains how to implement dialog-based CRUD (Create, Read, Update, Delete) operations and dynamic filters in the application. It covers the components, architecture, and patterns used for the affiliate management system, which can be applied to other similar features.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Components](#components)
3. [How to Implement a New CRUD Dialog](#how-to-implement-a-new-crud-dialog)
4. [Dynamic Filter Management](#dynamic-filter-management)
5. [Backend Integration](#backend-integration)
6. [Best Practices](#best-practices)

## Architecture Overview

The system is built around these key concepts:

- **Component-based structure**: Reusable UI components for dialogs, forms, and other elements
- **Data flow**: Consistent patterns for data retrieval, modification, and refresh
- **Event handling**: Well-defined callbacks for user interactions
- **Dynamic updates**: Mechanisms to synchronize UI state with data changes

The typical flow for managing entities is:
1. Data loads into a main table view
2. User clicks a button to add a new item or clicks on a row to edit
3. Dialog opens with a form for adding/editing
4. On submit, data is sent to the backend
5. On success, the table refreshes, and filters are updated

## Components

### Core Components

1. **DialogManager** (`static/js/components/dialogManager.js`)
   - Handles modal dialog creation, opening, closing
   - Manages dialog content, title, and size
   - Provides save/cancel actions

2. **DataTable** (`static/js/components/tableCore.js`)
   - Displays tabular data with sorting, filtering, pagination
   - Supports custom rendering for cell content
   - Provides hooks for data loading and processing

3. **Form Components** (e.g., `static/js/components/affiliateForm.js`)
   - Entity-specific forms for data entry
   - Field validation and data processing
   - Support for file uploads and complex inputs

### Specialized Components

1. **MultiSelectDropdown** (`static/js/components/multiSelectDropdown.js`)
   - Enhanced dropdown for selecting multiple options
   - Supports adding custom options on-the-fly
   - Manages selected items as tags/chips

2. **FileUploader** (`static/js/components/fileUploader.js`)
   - Handles file selection and preview
   - Validates file types and sizes
   - Integrates with form submission

## How to Implement a New CRUD Dialog

### Step 1: Create a Form Component

Create a new form component for your entity (e.g., `myEntityForm.js`):

```javascript
import { FileUploader } from './fileUploader.js';
import { MultiSelectDropdown } from './multiSelectDropdown.js';

export class MyEntityForm {
  constructor(config = {}) {
    this.data = config.data || null;
    this.onSubmit = config.onSubmit || null;
    this.onCancel = config.onCancel || null;
    this.onDelete = config.onDelete || null;
    this.element = null;
    this.formElement = null;
    this.isEditMode = !!this.data;
    
    this.createForm();
  }
  
  createForm() {
    // Create container and form elements
    this.element = document.createElement('div');
    this.formElement = document.createElement('form');
    this.formElement.noValidate = true;
    
    // Add form fields HTML
    this.formElement.innerHTML = `
      <!-- Form fields go here -->
      <div class="mb-3">
        <label for="entityName" class="form-label">Name *</label>
        <input type="text" class="form-control" id="entityName" required>
      </div>
      <!-- More fields... -->
    `;
    
    // Add to container
    this.element.appendChild(this.formElement);
    
    // Add delete button if in edit mode
    if (this.isEditMode && this.data?.id) {
      this.addDeleteButton();
    }
    
    // Add event listeners
    this.setupEventListeners();
    
    // Set initial values if editing
    if (this.isEditMode) {
      this.setValues(this.data);
    }
  }
  
  addDeleteButton() {
    const deleteContainer = document.createElement('div');
    deleteContainer.className = 'delete-button-container mt-4 pt-3 border-top text-center';
    
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-danger';
    deleteButton.innerHTML = '<i class="fas fa-trash me-2"></i>Delete Item';
    deleteButton.onclick = this.handleDelete.bind(this);
    
    deleteContainer.appendChild(deleteButton);
    this.element.appendChild(deleteContainer);
  }
  
  setupEventListeners() {
    this.formElement.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // Add more event listeners as needed
  }
  
  setValues(data) {
    // Set initial values for editing
    document.getElementById('entityName').value = data.name || '';
    // Set other field values...
  }
  
  getValues() {
    const formData = {
      name: document.getElementById('entityName').value,
      // Get other field values...
    };
    
    // Add ID if in edit mode
    if (this.isEditMode && this.data?.id) {
      formData.id = this.data.id;
    }
    
    return formData;
  }
  
  validate() {
    // Add validation logic
    this.formElement.classList.add('was-validated');
    return this.formElement.checkValidity();
  }
  
  handleSubmit() {
    if (!this.validate()) return;
    
    const formData = this.getValues();
    
    if (this.onSubmit) {
      this.onSubmit(formData);
    }
  }
  
  handleDelete() {
    if (confirm(`Are you sure you want to delete this item?`)) {
      if (this.onDelete) {
        this.onDelete(this.data.id);
      }
    }
  }
}
```

### Step 2: Create Page JS File

Create a page controller that uses the DataTable and DialogManager:

```javascript
import { DataTable } from '../components/tableCore.js';
import { DialogManager } from '../components/dialogManager.js';
import { MyEntityForm } from '../components/myEntityForm.js';

document.addEventListener('DOMContentLoaded', function() {
  // Initialize data tracking for dynamic filters
  let allCategories = new Set(['Category1', 'Category2', 'Category3']);
  
  // Function to update filter dropdown
  function updateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (!categoryFilter) return;
    
    // Save current selection
    const currentSelection = categoryFilter.value;
    
    // Clear existing options (except first one)
    while (categoryFilter.options.length > 1) {
      categoryFilter.remove(1);
    }
    
    // Add sorted options
    Array.from(allCategories).sort().forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
    
    // Restore selection if possible
    if (currentSelection) {
      for (let i = 0; i < categoryFilter.options.length; i++) {
        if (categoryFilter.options[i].value === currentSelection) {
          categoryFilter.value = currentSelection;
          break;
        }
      }
    }
  }
  
  // Extract filter values from data
  function extractCategories(entities) {
    if (!Array.isArray(entities)) return;
    
    entities.forEach(entity => {
      if (entity.category) {
        allCategories.add(entity.category);
      }
    });
    
    updateCategoryFilter();
  }
  
  // Initialize DataTable
  const entitiesTable = new DataTable({
    tableId: 'entitiesTable',
    tableBodyId: 'entitiesTableBody',
    dataUrl: '/api/entities',
    // Other configuration...
    
    onDataFetched: (data) => {
      extractCategories(data);
      return data;
    }
  });
  
  // Initialize dialog
  const entityDialog = new DialogManager({
    id: 'entityDialog',
    title: 'Add Entity',
    size: 'medium',
    onSave: () => {
      const form = document.getElementById('entityForm');
      if (form) {
        form.dispatchEvent(new Event('submit'));
      }
      return false; // Prevent auto-close
    }
  });
  
  // Function to open dialog
  function openEntityDialog(data = null) {
    entityDialog.setTitle(data ? 'Edit Entity' : 'Add Entity');
    
    const entityForm = new MyEntityForm({
      data: data,
      onSubmit: (formData) => {
        saveEntity(formData);
      },
      onDelete: (entityId) => {
        deleteEntity(entityId);
      }
    });
    
    entityDialog.setContent(entityForm.element);
    entityDialog.open();
  }
  
  // Function to save entity
  async function saveEntity(formData) {
    try {
      // Show loading state
      const saveButton = document.querySelector('#entityDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
      }
      
      // Save data to API
      const method = formData.id ? 'PUT' : 'POST';
      const response = await fetch('/api/entities', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Error saving entity');
      }
      
      // Update filters with new values if needed
      if (formData.category) {
        allCategories.add(formData.category);
        updateCategoryFilter();
      }
      
      // Close dialog and refresh
      entityDialog.close();
      entitiesTable.fetchData();
      
      showNotification('Entity saved successfully!', 'success');
    } catch (error) {
      showNotification(error.message, 'danger');
    } finally {
      // Reset button state
      const saveButton = document.querySelector('#entityDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save';
      }
    }
  }
  
  // Function to delete entity
  async function deleteEntity(entityId) {
    try {
      // Show loading state
      const deleteButton = document.querySelector('.delete-button-container .btn-danger');
      if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Deleting...';
      }
      
      // Delete via API
      const response = await fetch(`/api/entities?id=${entityId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Error deleting entity');
      }
      
      // Close dialog and refresh
      entityDialog.close();
      entitiesTable.fetchData();
      
      showNotification('Entity deleted successfully!', 'success');
    } catch (error) {
      showNotification(error.message, 'danger');
    }
  }
  
  // Add event listeners
  document.getElementById('addEntityButton').addEventListener('click', () => {
    openEntityDialog();
  });
  
  // Add row click for editing
  document.getElementById('entitiesTableBody').addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (!row) return;
    
    const rowIndex = Array.from(row.parentNode.children).indexOf(row);
    const entity = entitiesTable.filteredItems[rowIndex + (entitiesTable.currentPage - 1) * entitiesTable.itemsPerPage];
    
    if (entity) {
      openEntityDialog(entity);
    }
  });
});
```

### Step 3: Create HTML Template

Add the corresponding HTML:

```html
<div class="container-fluid">
  <div class="controls-container">
    <div class="filters-container">
      <div class="filter-item">
        <input type="text" id="nameSearchInput" placeholder="Filter by name..." class="form-control">
      </div>
      <div class="filter-item">
        <select id="categoryFilter" class="form-select">
          <option value="">All Categories</option>
          <!-- Options will be added dynamically -->
        </select>
      </div>
    </div>
    <div class="actions-container">
      <button id="addEntityButton" class="btn btn-primary btn-sm">
        <i class="fas fa-plus me-1"></i> Add Entity
      </button>
    </div>
  </div>
  
  <!-- Data Table -->
  <table id="entitiesTable" class="table">
    <thead>
      <tr>
        <th data-sort="id" class="sortable">ID <i class="fas fa-sort"></i></th>
        <th data-sort="name" class="sortable">Name <i class="fas fa-sort"></i></th>
        <th data-sort="category" class="sortable">Category <i class="fas fa-sort"></i></th>
      </tr>
    </thead>
    <tbody id="entitiesTableBody">
      <!-- Table content will be added dynamically -->
    </tbody>
  </table>
  
  <div id="paginationControls" class="pagination-controls">
    <button id="prevPageButton" class="btn btn-sm btn-outline-secondary">&laquo; Previous</button>
    <span id="pageInfo">Page 1 of 1</span>
    <button id="nextPageButton" class="btn btn-sm btn-outline-secondary">Next &raquo;</button>
  </div>
</div>
```

### Step 4: Add Backend API Endpoint

Add a route in your backend (e.g., in `views.py`):

```python
@views_bp.route('/api/entities', methods=['GET', 'POST', 'PUT', 'DELETE'])
@login_required
def manage_entities():
    entities_path = Path(settings.STATIC_DIR) / "data" / "entities.json"
    
    try:
        # GET: Return all entities
        if request.method == 'GET':
            if not entities_path.exists():
                return jsonify([])
                
            with open(entities_path, 'r') as f:
                entities = json.load(f)
                
            return jsonify(entities)
            
        # POST: Add a new entity
        elif request.method == 'POST':
            # Load existing data
            if entities_path.exists():
                with open(entities_path, 'r') as f:
                    entities = json.load(f)
            else:
                entities = []
                
            new_entity = request.json
            
            # Generate a new ID
            last_id = 0
            if entities:
                try:
                    last_id = int(entities[-1]['id'].split('-')[1])
                except (IndexError, ValueError):
                    pass
                    
            new_id = f"ENT-{str(last_id + 1).zfill(4)}"
            new_entity['id'] = new_id
            
            # Add to list
            entities.append(new_entity)
            
            # Save back to file
            with open(entities_path, 'w') as f:
                json.dump(entities, f, indent=2)
                
            return jsonify({
                'success': True,
                'entity': new_entity,
                'message': 'Entity added successfully'
            })
            
        # PUT: Update an existing entity
        elif request.method == 'PUT':
            # Implementation similar to POST but find and update by ID
            pass
            
        # DELETE: Delete an entity
        elif request.method == 'DELETE':
            # Implementation to find and remove by ID
            pass
            
    except Exception as e:
        logging.exception(f"Error managing entities: {str(e)}")
        return jsonify({'error': f'Error: {str(e)}'}), 500
```

## Dynamic Filter Management

To maintain dynamic filter dropdowns:

1. **Track all filter values** 
   - Use a `Set` to store unique values
   - Initialize with default values
   - Update when new data is loaded or added

2. **Update filter dropdowns**
   - Create a function to rebuild dropdown options
   - Preserve current selection when updating
   - Sort values for consistent presentation

3. **Extract values from data**
   - Process loaded data to find all unique values
   - Update when new items are added/edited

4. **Hook into data operations**
   - Update filters after saving new/edited items
   - Use the `onDataFetched` callback in DataTable
   - Consider changes when deleting items

## Backend Integration

The application uses REST-style endpoints for CRUD operations:

- **GET** - Retrieve all entities
- **POST** - Create a new entity
- **PUT** - Update an existing entity
- **DELETE** - Remove an entity

File-based storage pattern:
1. Read the current JSON data file
2. Modify the data (add/update/delete)
3. Write back the entire file

For file uploads:
1. Use a separate endpoint for file upload
2. Return the file path for storage in the entity data
3. Save entity data after successful file upload

## Best Practices

1. **Component Reusability**
   - Design components for reuse across different entity types
   - Use consistent interfaces and callback patterns
   - Separate presentation from business logic

2. **Error Handling**
   - Implement consistent error handling in both UI and API
   - Provide meaningful error messages
   - Reset UI state on error

3. **Loading States**
   - Show loading indicators during operations
   - Disable buttons to prevent double-submission
   - Reset UI state after operation completes

4. **Validation**
   - Validate data on both client and server
   - Provide clear feedback for validation errors
   - Use HTML5 validation attributes where possible

5. **Filtering Patterns**
   - Keep filter state separate from data
   - Update filters dynamically based on data changes
   - Preserve filter selections when possible

6. **Preventing Unwanted Form Autocomplete**
   - Apply multiple layers of autocomplete prevention:
     - Add `autocomplete="off"` to the form element
     - Use randomized field names with runtime-generated suffixes
     - Apply `autocomplete="new-password"` to all input fields
   - Implement a random suffix generator in the form constructor:
     ```javascript
     // Generate a random suffix to make field names unpredictable
     const randomSuffix = Math.random().toString(36).substring(2, 8);
     this.randomSuffix = randomSuffix; // Store for reference
     ```
   - Apply the random suffix to field names:
     ```html
     <input type="text" class="form-control" id="fieldId" 
            name="fieldName_${randomSuffix}" autocomplete="new-password">
     ```
   - Use these techniques for all form types (regular inputs, selects, file uploads)
   - For multiselect components, ensure their internal input fields also have autocomplete disabled

7. **Code Organization**
   - Follow a consistent module pattern
   - Use ES modules for better organization
   - Document component interfaces
