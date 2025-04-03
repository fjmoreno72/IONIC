// gps_new.js - Generic Products page with CRUD functionality
import { DataTable } from '../components/tableCore.js';
import { ColumnResizer } from '../components/columnResizer.js';
import { DialogManager } from '../components/dialogManager.js';
import { GPForm } from '../components/gpForm.js';
import { ConfigItemForm } from '../components/configItemForm.js';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Elements specific to the GPs page
  const noResults = document.getElementById('noResults');
  
  // Initialize column resizer
  const columnResizer = new ColumnResizer('.test-cases-table');
  
  // All generic products data (to check for name uniqueness)
  let allGPs = [];
  
  // Initialize dialog for adding/editing generic products
  const gpDialog = new DialogManager({
    id: 'gpDialog',
    title: 'Add Generic Product',
    size: 'medium',
    onSave: () => {
      // Trigger form submission
      const form = document.getElementById('gpForm');
      if (form) {
        form.dispatchEvent(new Event('submit'));
      }
      return false; // Prevent dialog from closing automatically
    }
  });
  
  // Configure and initialize the data table
  const gpsTable = new DataTable({
    tableId: 'gpsTable',
    tableBodyId: 'gpsTableBody',
    dataUrl: '/static/ASC/data/gps.json',
    searchInputId: 'searchInput',
    itemsPerPageSelectId: 'itemsPerPageSelect',
    pageInfoId: 'pageInfo',
    prevButtonId: 'prevPageButton',
    nextButtonId: 'nextPageButton',
    defaultSortField: 'id',
    noResultsMessage: 'No GPs found matching your criteria.',
    
    // Store all GPs for name uniqueness checking
    onDataFetched: (data) => {
      allGPs = [...data];
      return data;
    },
    
    // Special handling for errors
    onFetchStart: () => {
      if (noResults) noResults.classList.add('d-none');
    },
    
    onFetchError: (error) => {
      console.error('Error fetching GPs:', error);
      if (noResults) {
        noResults.classList.remove('d-none');
        noResults.querySelector('p').textContent = 'Error loading GP data.';
      }
    },
    
    onRenderComplete: (itemCount) => {
      // Show or hide the "No Results" element
      if (itemCount === 0 && noResults) {
        noResults.classList.remove('d-none');
      } else if (noResults) {
        noResults.classList.add('d-none');
      }
    },
    
    // Custom filter function
    filterFunction: (item, searchTerm) => {
      // Default fields: ID, name, description
      const basicMatch = (item.id?.toLowerCase() || '').includes(searchTerm) ||
                        (item.name?.toLowerCase() || '').includes(searchTerm) ||
                        (item.description?.toLowerCase() || '').includes(searchTerm);
      
      return basicMatch;
    },
    
    // Keep track of image update timestamps to prevent caching
    imageUpdateTimestamps: {},
    
    columns: [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'description', label: 'Description', sortable: true },
      { 
        key: 'iconPath', 
        label: 'Icon', 
        sortable: false,
        cellClass: 'text-center',
        render: (value, row) => {
          if (!value) return 'No Icon';
          
          // Add cache-busting timestamp parameter if available
          const cacheBuster = (row && row.id && gpsTable.imageUpdateTimestamps && gpsTable.imageUpdateTimestamps[row.id]) 
            ? `?v=${gpsTable.imageUpdateTimestamps[row.id]}` 
            : '';
            
          return `<img src="/static/ASC/${value.replace('./', '')}${cacheBuster}" alt="${row.name || 'Icon'}" class="icon-img" style="max-height: 40px; max-width: 40px;">`;
        }
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        cellClass: 'text-center',
        width: '5%',
        render: (value, row) => {
          if (!row || !row.id) return '';
          
          return `<button type="button" class="btn btn-sm btn-outline-primary view-ci-btn" title="Configuration Items"
                    data-gp-id="${row.id}" 
                    data-gp-name="${row.name || ''}">
                    <i class="fas fa-cogs"></i>
                  </button>`;
        }
      }
    ]
  });
  
  // Enable the Add GP button
  const addGpButton = document.getElementById('addGpButton');
  if (addGpButton) {
    addGpButton.disabled = false;
    addGpButton.addEventListener('click', () => {
      openGpDialog();
    });
  }
  
  // Initialize dialog for displaying and managing configuration items for a GP
  const ciDialog = new DialogManager({
    id: 'ciForGpDialog',
    title: 'Configuration Items',
    size: 'large',
    onSave: () => {
      // If we're showing the CI form within the dialog, trigger its submission
      const form = document.getElementById('configItemForm');
      if (form) {
        form.dispatchEvent(new Event('submit'));
      }
      return false; // Prevent dialog from closing automatically
    }
  });
  
  // Add row click handler for editing and handling CI button clicks
  const tableBody = document.getElementById('gpsTableBody');
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      // Check if the CIs button was clicked
      const ciButton = e.target.closest('.view-ci-btn');
      if (ciButton) {
        e.stopPropagation(); // Prevent opening the GP edit dialog
        
        // Get the GP ID and name from the button data attributes
        const gpId = ciButton.dataset.gpId;
        const gpName = ciButton.dataset.gpName;
        
        if (gpId) {
          // Show CIs dialog for this GP
          showCiModal(gpId, gpName);
        }
        
        return;
      }
      
      // Handle row clicks for editing the GP
      const row = e.target.closest('tr');
      if (!row) return;
      
      // Get the row index
      const rowIndex = Array.from(row.parentNode.children).indexOf(row);
      
      // Get the data for this row
      const gp = gpsTable.filteredItems[rowIndex + (gpsTable.currentPage - 1) * gpsTable.itemsPerPage];
      
      if (gp) {
        // Open edit dialog with this data
        openGpDialog(gp);
      }
    });
  }
  
  /**
   * Function to show a modal with Configuration Items for a specific GP
   * @param {string} gpId - The ID of the GP to show CIs for
   * @param {string} gpName - The name of the GP to show in the modal title
   */
  async function showCiModal(gpId, gpName) {
    try {
      // Set the dialog title
      ciDialog.setTitle(`Configuration Items for ${gpName}`);
      
      // Reset dialog buttons to default Cancel/Save
      ciDialog.setButtons([
        { text: 'Cancel', class: 'btn-secondary', action: 'cancel' },
        { text: 'Save', class: 'btn-primary', action: 'save' }
      ]);
      
      // Show loading state in the dialog content
      const loadingContent = document.createElement('div');
      loadingContent.className = 'text-center p-5';
      loadingContent.innerHTML = `
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading Configuration Items...</p>
      `;
      ciDialog.setContent(loadingContent);
      ciDialog.open();
      
      // Fetch the configuration items data
      const response = await fetch('/static/ASC/data/configItem.json');
      const ciData = await response.json();
      
      // Filter for items associated with the selected GP
      const relatedCIs = ciData.filter(ci => Array.isArray(ci.GenericProducts) && ci.GenericProducts.includes(gpId));
      
      // Create content for the modal
      const modalContent = document.createElement('div');
      modalContent.className = 'ci-modal-content';
      
      // Container for the CI list and add button
      const headerContainer = document.createElement('div');
      headerContainer.className = 'd-flex justify-content-between align-items-center mb-3';
      headerContainer.innerHTML = `
        <h5 class="mb-0">Found ${relatedCIs.length} item${relatedCIs.length !== 1 ? 's' : ''}</h5>
        <button type="button" class="btn btn-primary btn-sm" id="addCiForGpBtn">
          <i class="fas fa-plus me-1"></i> Add New Configuration Item
        </button>
      `;
      modalContent.appendChild(headerContainer);
      
      // If there are no related CIs, show a message
      if (relatedCIs.length === 0) {
        const noCIsMessage = document.createElement('div');
        noCIsMessage.className = 'alert alert-info';
        noCIsMessage.textContent = `No Configuration Items found for ${gpName}. Click the button above to add one.`;
        modalContent.appendChild(noCIsMessage);
      } else {
        // Create a table to display the CIs
        const table = document.createElement('table');
        table.className = 'table table-hover';
        table.innerHTML = `
          <thead>
            <tr>
              <th>Name</th>
              <th>Default Value</th>
              <th>Answer Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="ciModalTableBody">
            ${relatedCIs.map(ci => `
              <tr>
                <td>${ci.Name}</td>
                <td>${ci.DefaultValue || ''}</td>
                <td>${ci.ConfigurationAnswerType || ''}</td>
                <td>
                  <button type="button" class="btn btn-sm btn-outline-primary edit-ci-btn" 
                          data-ci-name="${ci.Name}">
                    <i class="fas fa-edit"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        `;
        modalContent.appendChild(table);
      }
      
      // Set the modal content
      ciDialog.setContent(modalContent);
      
      // Add event listener for the "Add New Configuration Item" button
      const addCiButton = document.getElementById('addCiForGpBtn');
      if (addCiButton) {
        addCiButton.addEventListener('click', () => {
          // Open the add CI form with the current GP pre-selected
          showAddCiForm(gpId, gpName);
        });
      }
      
      // Add event listeners for edit buttons
      const editButtons = document.querySelectorAll('.edit-ci-btn');
      editButtons.forEach(button => {
        button.addEventListener('click', () => {
          const ciName = button.dataset.ciName;
          const ci = ciData.find(item => item.Name === ciName);
          if (ci) {
            // Open the edit CI form
            showEditCiForm(ci, gpId, gpName);
          }
        });
      });
      
    } catch (error) {
      console.error('Error loading Configuration Items:', error);
      // Show error message in the dialog
      const errorContent = document.createElement('div');
      errorContent.className = 'alert alert-danger';
      errorContent.textContent = 'Error loading Configuration Items. Please try again.';
      ciDialog.setContent(errorContent);
    }
  }
  
  /**
   * Function to show the add CI form within the modal
   * @param {string} gpId - The ID of the GP to add a CI for
   * @param {string} gpName - The name of the GP
   */
  function showAddCiForm(gpId, gpName) {
    // Update the dialog title
    ciDialog.setTitle(`Add Configuration Item for ${gpName}`);
    
    // Update buttons to include Save and Back (instead of Cancel)
    ciDialog.setButtons([
      { 
        text: 'Back to List', 
        class: 'btn-secondary', 
        onClick: () => {
          // Return to CI list view instead of closing the dialog
          showCiModal(gpId, gpName);
        }
      },
      { text: 'Save', class: 'btn-primary', action: 'save' }
    ]);
    
    // Show a loading message while we prepare the form
    const loadingContent = document.createElement('div');
    loadingContent.className = 'text-center p-5';
    loadingContent.innerHTML = `
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Preparing form...</p>
    `;
    ciDialog.setContent(loadingContent);
    
    // Create and initialize the ConfigItemForm
    const configItemForm = new ConfigItemForm({
      data: null, // No initial data for a new CI
      onSubmit: async (formData) => {
        try {
          // Show loading state
          const saveButton = document.querySelector('#ciForGpDialog .btn-primary');
          if (saveButton) {
            saveButton.disabled = true;
            saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
          }
          
          try {
            // Send request to API
            const response = await fetch('/api/config-items', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Error saving configuration item');
            }
            
            // Show success notification
            showNotification('Configuration item added successfully!', 'success');
            
            // Get updated data and reopen the CI list view
            showCiModal(gpId, gpName);
          } catch (error) {
            console.error('Error saving configuration item:', error);
            showNotification(error.message || 'Error saving configuration item', 'danger');
            
            // Reset button state even on error
            if (saveButton) {
              saveButton.disabled = false;
              saveButton.innerHTML = 'Save';
            }
          }
        } catch (error) {
          console.error('Unexpected error in form submission:', error);
          showNotification('An unexpected error occurred', 'danger');
          
          // Always reset button state
          const saveButton = document.querySelector('#ciForGpDialog .btn-primary');
          if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = 'Save';
          }
        }
      }
    });
    
    // When the form is ready and rendered, update dialog content
    // This is triggered after the form's dependencies are loaded
    // We need to use a MutationObserver to detect when the form is ready
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && 
            mutation.target.querySelector('#gpMultiselect')) {
          observer.disconnect();
          
          // The form is ready, now pre-select the current GP
          const form = configItemForm;
          
          // Pre-select the current GP after a short delay to ensure the dropdown is initialized
          setTimeout(() => {
            // Find the gpDropdown within the form
            if (form.gpDropdown) {
              const gpNames = Array.from(form.gpNameMap.entries())
                .filter(([id]) => id === gpId)
                .map(([, name]) => name);
              
              if (gpNames.length > 0) {
                form.gpDropdown.setValues(gpNames);
                
                // Make the selected GP read-only in the form's context
                const gpContainer = form.element.querySelector('#gpContainer');
                if (gpContainer) {
                  const note = document.createElement('div');
                  note.className = 'text-muted small mt-1';
                  note.textContent = 'This Configuration Item is being created specifically for ' + gpName;
                  gpContainer.appendChild(note);
                }
              }
            }
          }, 300);
        }
      }
    });
    
    // Start observing the form element
    observer.observe(configItemForm.element, { childList: true, subtree: true });
    
    // Set the dialog content to the form
    ciDialog.setContent(configItemForm.element);
  }
  
  /**
   * Function to show the edit CI form within the modal
   * @param {Object} ci - The CI data to edit
   * @param {string} gpId - The ID of the GP
   * @param {string} gpName - The name of the GP
   */
  function showEditCiForm(ci, gpId, gpName) {
    // Update the dialog title
    ciDialog.setTitle(`Edit Configuration Item for ${gpName}`);
    
    // Update buttons to include Save and Back to List
    ciDialog.setButtons([
      { 
        text: 'Back to List', 
        class: 'btn-secondary', 
        onClick: () => {
          // Return to CI list view instead of closing the dialog
          showCiModal(gpId, gpName);
        }
      },
      { text: 'Save', class: 'btn-primary', action: 'save' }
    ]);
    
    // Show a loading message while we prepare the form
    const loadingContent = document.createElement('div');
    loadingContent.className = 'text-center p-5';
    loadingContent.innerHTML = `
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3">Preparing form...</p>
    `;
    ciDialog.setContent(loadingContent);
    
    // Create and initialize the ConfigItemForm
    const configItemForm = new ConfigItemForm({
      data: ci,
      onSubmit: async (formData) => {
        try {
          // Show loading state
          const saveButton = document.querySelector('#ciForGpDialog .btn-primary');
          if (saveButton) {
            saveButton.disabled = true;
            saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
          }
          
          try {
            // Send request to API
            const response = await fetch('/api/config-items', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Error updating configuration item');
            }
            
            // Show success notification
            showNotification('Configuration item updated successfully!', 'success');
            
            // Get updated data and reopen the CI list view
            showCiModal(gpId, gpName);
          } catch (error) {
            console.error('Error updating configuration item:', error);
            showNotification(error.message || 'Error updating configuration item', 'danger');
            
            // Reset button state even on error
            if (saveButton) {
              saveButton.disabled = false;
              saveButton.innerHTML = 'Save';
            }
          }
        } catch (error) {
          console.error('Unexpected error in form submission:', error);
          showNotification('An unexpected error occurred', 'danger');
          
          // Always reset button state
          const saveButton = document.querySelector('#ciForGpDialog .btn-primary');
          if (saveButton) {
            saveButton.disabled = false;
            saveButton.innerHTML = 'Save';
          }
        }
      },
      onDelete: async (name) => {
        try {
          // Show loading state
          const deleteButton = document.querySelector('.delete-button-container .btn-danger');
          if (deleteButton) {
            deleteButton.disabled = true;
            deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Deleting...';
          }
          
          // Send DELETE request to API
          const response = await fetch(`/api/config-items?name=${encodeURIComponent(name)}`, {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error deleting configuration item');
          }
          
          // Get updated data and reopen the CI list view
          showCiModal(gpId, gpName);
          
          // Show success notification
          showNotification('Configuration item deleted successfully!', 'success');
        } catch (error) {
          console.error('Error deleting configuration item:', error);
          showNotification(error.message || 'Error deleting configuration item', 'danger');
        }
      }
    });
    
    // Set the dialog content to the form
    ciDialog.setContent(configItemForm.element);
  }
  
  // Function to open dialog for adding/editing generic products
  function openGpDialog(data = null) {
    // Update dialog title based on mode
    gpDialog.setTitle(data ? 'Edit Generic Product' : 'Add Generic Product');
    
    // Create form instance
    const gpForm = new GPForm({
      data: data,
      onSubmit: (formData, iconFile) => {
        // Check for name uniqueness
        if (isNameUnique(formData)) {
          // Handle form submission with icon upload if needed
          if (iconFile) {
            uploadGpIcon(iconFile, formData.name).then(iconPath => {
              // Add icon path to form data
              formData.iconPath = iconPath;
              saveGP(formData);
            }).catch(error => {
              showNotification(error.message || 'Error uploading icon', 'danger');
            });
          } else {
            // Save without icon upload
            saveGP(formData);
          }
        } else {
          showNotification('A generic product with this name already exists.', 'danger');
          // Focus on the name field
          const nameInput = document.getElementById('gpName');
          if (nameInput) {
            nameInput.classList.add('is-invalid');
            nameInput.focus();
          }
        }
      },
      onDelete: (id) => {
        // Handle generic product deletion
        deleteGP(id);
      }
    });
    
    // Set dialog content to the form
    gpDialog.setContent(gpForm.element);
    
    // Open dialog
    gpDialog.open();
  }
  
  // Check if a generic product name is unique
  function isNameUnique(formData) {
    // If in edit mode and keeping the same name, it's OK
    if (formData.originalName && formData.originalName === formData.name) {
      return true;
    }
    
    // Check all existing items for name uniqueness
    return !allGPs.some(item => item.name === formData.name);
  }
  
  // Function to upload a generic product icon
  async function uploadGpIcon(file, gpName) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('gpName', gpName);
      
      const response = await fetch('/api/gps/upload-icon', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error uploading icon');
      }
      
      const data = await response.json();
      return data.path;
    } catch (error) {
      console.error('Error uploading icon:', error);
      throw error;
    }
  }
  
  // Function to save generic product
  async function saveGP(formData) {
    try {
      // Show loading state
      const saveButton = document.querySelector('#gpDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
      }
      
      // Determine if this is an edit or create
      const isEditing = !!formData.id;
      const method = isEditing ? 'PUT' : 'POST';
      
      // Send request to API
      const response = await fetch('/api/gps', {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      // Parse the response once
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Error saving generic product');
      }
      
      // Add timestamp to cache-bust the icon if it's a new icon or update
      if (formData.iconPath) {
        const gpId = responseData.gp?.id || formData.id;
        if (gpId) {
          // Ensure imageUpdateTimestamps is initialized
          if (!gpsTable.imageUpdateTimestamps) {
            gpsTable.imageUpdateTimestamps = {};
          }
          // Set timestamp for this GP's icon to force cache refresh
          gpsTable.imageUpdateTimestamps[gpId] = Date.now();
        }
      }
      
      // Close dialog
      gpDialog.close();
      
      // Refresh table
      gpsTable.fetchData();
      
      // Show success message
      showNotification('Generic product saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving generic product:', error);
      showNotification(error.message || 'Error saving generic product', 'danger');
    } finally {
      // Reset button state
      const saveButton = document.querySelector('#gpDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save';
      }
    }
  }
  
  // Function to delete generic product
  async function deleteGP(id) {
    try {
      // Show loading state
      const deleteButton = document.querySelector('.delete-button-container .btn-danger');
      if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Deleting...';
      }
      
      // Send DELETE request to API
      const response = await fetch(`/api/gps?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error deleting generic product');
      }
      
      // Close dialog
      gpDialog.close();
      
      // Refresh table
      gpsTable.fetchData();
      
      // Show success message
      showNotification('Generic product deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting generic product:', error);
      showNotification(error.message || 'Error deleting generic product', 'danger');
    }
  }
  
  // Function to show notifications
  function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'notification';
      notification.className = `notification alert alert-${type}`;
      notification.style.position = 'fixed';
      notification.style.top = '20px';
      notification.style.right = '20px';
      notification.style.zIndex = '9999';
      notification.style.minWidth = '300px';
      notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      notification.style.transition = 'opacity 0.3s ease-in-out';
      document.body.appendChild(notification);
    } else {
      // Update class for the type
      notification.className = `notification alert alert-${type}`;
    }
    
    // Set message
    notification.textContent = message;
    
    // Show notification
    notification.style.display = 'block';
    notification.style.opacity = '1';
    
    // Auto-hide after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.style.display = 'none';
      }, 300);
    }, 3000);
  }
});
