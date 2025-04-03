// gps_new.js - Generic Products page with CRUD functionality
import { DataTable } from '../components/tableCore.js';
import { ColumnResizer } from '../components/columnResizer.js';
import { DialogManager } from '../components/dialogManager.js';
import { GPForm } from '../components/gpForm.js';

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
  
  // Add row click handler for editing
  const tableBody = document.getElementById('gpsTableBody');
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      // Find the closest row element
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
