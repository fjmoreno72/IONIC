// models_new.js - Models page using component architecture
import { DataTable } from '../components/tableCore.js';
import { ColumnResizer } from '../components/columnResizer.js';
import { DialogManager } from '../components/dialogManager.js';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Elements specific to the Models page
  const noResults = document.getElementById('noResults');
  
  // Initialize column resizer
  const columnResizer = new ColumnResizer('.test-cases-table');
  
  // Configure and initialize the data table
  const modelsTable = new DataTable({
    tableId: 'modelsTable',
    tableBodyId: 'modelsTableBody',
    dataUrl: '/api/models', // API endpoint for models
    searchInputId: 'nameSearchInput',
    itemsPerPageSelectId: 'itemsPerPageSelect',
    pageInfoId: 'pageInfo',
    prevButtonId: 'prevPageButton',
    nextButtonId: 'nextPageButton',
    defaultSortField: 'id',
    noResultsMessage: 'No models found matching your criteria.',
    
    // Error handling
    onFetchStart: () => {
      if (noResults) noResults.classList.add('d-none');
    },
    
    onFetchError: (error) => {
      console.error('Error fetching models:', error);
      if (noResults) {
        noResults.classList.remove('d-none');
        noResults.querySelector('p').textContent = 'Error loading model data.';
      }
    },
    
    onRenderComplete: (itemCount) => {
      if (itemCount === 0 && noResults) {
        noResults.classList.remove('d-none');
      } else if (noResults) {
        noResults.classList.add('d-none');
      }
    },
    
    // Custom filter function
    filterFunction: (item, searchTerm) => {
      // Check name and ID match for the search term
      let nameMatch = true;
      if (searchTerm && searchTerm.length > 0) {
        nameMatch = (item.name?.toLowerCase() || '').includes(searchTerm) || 
                   (item.id?.toLowerCase() || '').includes(searchTerm);
      }
      
      return nameMatch;
    },
    
    columns: [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true }
    ],
    
    // Add row click handler to open edit dialog
    onRowClick: (rowData) => {
      openModelDialog(rowData);
    }
  });
  
  // Create a simple model dialog with Bootstrap
  function createModelDialog() {
    // Check if the dialog already exists
    if (document.getElementById('modelDialog')) {
      return;
    }
    
    // Create the dialog HTML
    const dialogHTML = `
      <div class="modal fade" id="modelDialog" tabindex="-1" aria-labelledby="modelDialogLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="modelDialogLabel">Add Model</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="modelForm" class="needs-validation" novalidate>
                <div class="mb-3">
                  <label for="modelId" class="form-label">ID</label>
                  <input type="text" class="form-control" id="modelId" readonly>
                  <div class="form-text">ID is auto-generated</div>
                </div>
                <div class="mb-3">
                  <label for="modelName" class="form-label">Name</label>
                  <input type="text" class="form-control" id="modelName" required>
                  <div class="invalid-feedback">Please enter a model name</div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-danger d-none" id="deleteModelButton">
                <i class="fas fa-trash-alt"></i> Delete
              </button>
              <div class="ms-auto">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="saveModelButton">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add the dialog to the document
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    
    // Initialize the Bootstrap modal
    const modalElement = document.getElementById('modelDialog');
    const modal = new bootstrap.Modal(modalElement);
    
    // Add event listener for the save button
    document.getElementById('saveModelButton').addEventListener('click', () => {
      const formData = getModelFormData();
      if (validateModelForm()) {
        saveModel(formData);
      }
    });
    
    // Add event listener for the delete button
    const deleteButton = document.getElementById('deleteModelButton');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        const modelId = currentModelId;
        if (modelId && confirm('Are you sure you want to delete this model?')) {
          // Close the modal first
          modal.hide();
          // Then delete the model
          deleteModel(modelId);
        }
      });
    }
    
    return modal;
  }
  
  // Create the model dialog
  const modelModal = createModelDialog();
  
  // Model form functions
  let currentModelId = null;
  
  function resetModelForm() {
    currentModelId = null;
    const form = document.getElementById('modelForm');
    if (form) {
      form.reset();
      form.classList.remove('was-validated');
    }
    const idInput = document.getElementById('modelId');
    if (idInput) idInput.value = 'Auto-generated';
  }
  
  function loadModelData(model) {
    if (!model) {
      resetModelForm();
      return;
    }
    
    currentModelId = model.id;
    const idInput = document.getElementById('modelId');
    const nameInput = document.getElementById('modelName');
    
    if (idInput) idInput.value = model.id || 'Auto-generated';
    if (nameInput) nameInput.value = model.name || '';
  }
  
  function getModelFormData() {
    const nameInput = document.getElementById('modelName');
    return {
      id: currentModelId,
      name: nameInput ? nameInput.value : ''
    };
  }
  
  function validateModelForm() {
    const form = document.getElementById('modelForm');
    if (!form) return false;
    
    form.classList.add('was-validated');
    return form.checkValidity();
  }
  
  // Function to open dialog in add or edit mode
  function openModelDialog(data = null) {
    const isEditMode = !!data;
    
    // Set dialog title based on mode
    const modalTitle = document.getElementById('modelDialogLabel');
    if (modalTitle) {
      modalTitle.textContent = isEditMode ? 'Edit Model' : 'Add Model';
    }
    
    // Show/hide delete button based on mode
    const deleteButton = document.getElementById('deleteModelButton');
    if (deleteButton) {
      if (isEditMode) {
        deleteButton.classList.remove('d-none');
      } else {
        deleteButton.classList.add('d-none');
      }
    }
    
    // Reset and load data if in edit mode
    resetModelForm();
    if (isEditMode) {
      loadModelData(data);
    }
    
    // Show the dialog
    if (modelModal) {
      modelModal.show();
    }
  }
  
  // Function to delete a model
  function deleteModel(modelId) {
    if (!modelId) return;
    
    fetch(`/api/models?id=${encodeURIComponent(modelId)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        showNotification('Model deleted successfully', 'success');
        
        // Manually refresh the table data instead of using refreshData
        fetch('/api/models')
          .then(response => response.json())
          .then(data => {
            // Re-initialize the table with the new data
            modelsTable.allItems = data;
            modelsTable.filterAndRender();
          })
          .catch(err => {
            console.error('Error refreshing table data:', err);
          });
      } else {
        showNotification(data.message || 'Error deleting model', 'error');
      }
    })
    .catch(error => {
      console.error('Error deleting model:', error);
      showNotification('Error deleting model', 'error');
    });
  }
  
  // Function to save model data
  function saveModel(formData) {
    // Validate form before submission
    if (!validateModelForm()) {
      return;
    }
    
    const isEditMode = !!formData.id;
    const method = isEditMode ? 'PUT' : 'POST';
    
    fetch('/api/models', {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Close the modal using Bootstrap's API
        const modalElement = document.getElementById('modelDialog');
        if (modalElement) {
          const bsModal = bootstrap.Modal.getInstance(modalElement);
          if (bsModal) {
            bsModal.hide();
          }
        }
        
        showNotification(`Model ${isEditMode ? 'updated' : 'added'} successfully`, 'success');
        
        // Manually refresh the table data instead of using refreshData
        fetch('/api/models')
          .then(response => response.json())
          .then(data => {
            // Re-initialize the table with the new data
            modelsTable.allItems = data;
            modelsTable.filterAndRender();
          })
          .catch(err => {
            console.error('Error refreshing table data:', err);
          });
      } else {
        showNotification(data.message || `Error ${isEditMode ? 'updating' : 'adding'} model`, 'error');
      }
    })
    .catch(error => {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} model:`, error);
      showNotification(`Error ${isEditMode ? 'updating' : 'adding'} model`, 'error');
    });
  }
  
  // Enable the Add Model button and add click event
  const addModelButton = document.getElementById('addModelButton');
  if (addModelButton) {
    addModelButton.disabled = false;
    addModelButton.addEventListener('click', () => {
      openModelDialog(); // Open dialog in add mode
    });
  }
  
  // Make sure Bootstrap is available
  if (typeof bootstrap === 'undefined') {
    console.error('Bootstrap JavaScript is not loaded. The modal functionality will not work.');
    showNotification('Error: Bootstrap JavaScript is not loaded. Please refresh the page.', 'error');
  }
  
  // Add row actions using event delegation instead of context menu
  document.getElementById('modelsTableBody').addEventListener('click', (event) => {
    // Find the closest row element
    const row = event.target.closest('tr');
    if (!row) return;
    
    // Get the row data from the data attribute
    let rowData;
    try {
      // First, check if the row has a data-item attribute
      if (row.dataset.item) {
        rowData = JSON.parse(row.dataset.item);
      } else {
        // If not, try to extract the data from the row cells
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          rowData = {
            id: cells[0].textContent.trim(),
            name: cells[1].textContent.trim()
          };
        }
      }
    } catch (e) {
      console.error('Error parsing row data:', e);
      return;
    }
    
    // Ensure we have valid row data
    if (!rowData || !rowData.id) {
      console.warn('No valid row data found:', row);
      return;
    }
    
    console.log('Row clicked, data:', rowData);
    
    // Handle row click to open edit dialog
    openModelDialog(rowData);
  });
  
  // Define actions that would have been in context menu
  const rowActions = [
    {
      label: 'Edit',
      icon: 'fas fa-edit',
      action: (rowData) => {
        openModelDialog(rowData);
      }
    },
    {
      label: 'Delete',
      icon: 'fas fa-trash-alt',
      action: (rowData) => {
        deleteModel(rowData.id);
      }
    }
  ];
  
  // Function to show notifications
  function showNotification(message, type = 'info') {
    const container = document.getElementById('successMessages') || document.createElement('div');
    
    if (!document.getElementById('successMessages')) {
      container.id = 'successMessages';
      container.className = 'success-messages';
      document.body.appendChild(container);
    }
    
    const notification = document.createElement('div');
    notification.className = 'success-message';
    notification.textContent = message;
    
    // Apply different styles based on type
    if (type === 'error') {
      notification.style.backgroundColor = '#dc3545';
    } else if (type === 'warning') {
      notification.style.backgroundColor = '#ffc107';
      notification.style.color = '#212529';
    } else if (type === 'success') {
      notification.style.backgroundColor = '#28a745';
    }
    
    container.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        container.removeChild(notification);
      }, 300);
    }, 5000);
  }
});
