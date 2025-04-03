// sps_new.js - Specific Products page with CRUD functionality
import { DataTable } from '../components/tableCore.js';
import { ColumnResizer } from '../components/columnResizer.js';
import { DialogManager } from '../components/dialogManager.js';
import { SPForm } from '../components/spForm.js';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Elements specific to the SPs page
  const noResults = document.getElementById('noResults');
  
  // Initialize column resizer
  const columnResizer = new ColumnResizer('.test-cases-table');
  
  // All specific products data (to check for name uniqueness)
  let allSPs = [];
  
  // Initialize dialog for adding/editing specific products
  const spDialog = new DialogManager({
    id: 'spDialog',
    title: 'Add Specific Product',
    size: 'medium',
    onSave: () => {
      // Trigger form submission
      const form = document.getElementById('spForm');
      if (form) {
        form.dispatchEvent(new Event('submit'));
      }
      return false; // Prevent dialog from closing automatically
    }
  });
  
  // Configure and initialize the data table
  const spsTable = new DataTable({
    tableId: 'spsTable',
    tableBodyId: 'spsTableBody',
    dataUrl: '/static/ASC/data/sps.json',
    searchInputId: 'searchInput',
    itemsPerPageSelectId: 'itemsPerPageSelect',
    pageInfoId: 'pageInfo',
    prevButtonId: 'prevPageButton',
    nextButtonId: 'nextPageButton',
    defaultSortField: 'id',
    noResultsMessage: 'No SPs found matching your criteria.',
    
    // Store all SPs for name uniqueness checking
    onDataFetched: (data) => {
      allSPs = [...data];
      return data;
    },
    
    // Special handling for errors
    onFetchStart: () => {
      if (noResults) noResults.classList.add('d-none');
    },
    
    onFetchError: (error) => {
      console.error('Error fetching SPs:', error);
      if (noResults) {
        noResults.classList.remove('d-none');
        noResults.querySelector('p').textContent = 'Error loading SP data.';
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
      
      // Versions field (array)
      let versionsMatch = false;
      if (item.versions && Array.isArray(item.versions)) {
        const versionsString = item.versions.join(', ').toLowerCase();
        versionsMatch = versionsString.includes(searchTerm);
      }
      
      return basicMatch || versionsMatch;
    },
    
    // Custom sort for array fields
    customSort: (field, a, b, direction) => {
      if (field === 'versions') {
        // Convert version arrays to strings for comparison
        const versionsA = Array.isArray(a.versions) ? a.versions.join(', ') : '';
        const versionsB = Array.isArray(b.versions) ? b.versions.join(', ') : '';
        
        if (versionsA < versionsB) return direction === 'asc' ? -1 : 1;
        if (versionsA > versionsB) return direction === 'asc' ? 1 : -1;
        return 0;
      }
      // Return null to use default sort logic for other fields
      return null;
    },
    
    // Keep track of image update timestamps to prevent caching
    imageUpdateTimestamps: {},
    
    columns: [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'description', label: 'Description', sortable: true },
      { 
        key: 'versions', 
        label: 'Versions', 
        sortable: true,
        render: (value) => Array.isArray(value) ? value.join(', ') : ''
      },
      { 
        key: 'iconPath', 
        label: 'Icon', 
        sortable: false,
        cellClass: 'text-center',
        render: (value, row) => {
          if (!value) return 'No Icon';
          
          // Add cache-busting timestamp parameter if available
          const cacheBuster = (row && row.id && spsTable.imageUpdateTimestamps && spsTable.imageUpdateTimestamps[row.id]) 
            ? `?v=${spsTable.imageUpdateTimestamps[row.id]}` 
            : '';
            
          return `<img src="/static/ASC/${value.replace('./', '')}${cacheBuster}" alt="${row.name || 'Icon'}" class="icon-img" style="max-height: 40px; max-width: 40px;">`;
        }
      }
    ]
  });
  
  // Enable the Add SP button
  const addSpButton = document.getElementById('addSpButton');
  if (addSpButton) {
    addSpButton.disabled = false;
    addSpButton.addEventListener('click', () => {
      openSpDialog();
    });
  }
  
  // Add row click handler for editing
  const tableBody = document.getElementById('spsTableBody');
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      // Find the closest row element
      const row = e.target.closest('tr');
      if (!row) return;
      
      // Get the row index
      const rowIndex = Array.from(row.parentNode.children).indexOf(row);
      
      // Get the data for this row
      const sp = spsTable.filteredItems[rowIndex + (spsTable.currentPage - 1) * spsTable.itemsPerPage];
      
      if (sp) {
        // Open edit dialog with this data
        openSpDialog(sp);
      }
    });
  }
  
  // Function to open dialog for adding/editing specific products
  function openSpDialog(data = null) {
    // Update dialog title based on mode
    spDialog.setTitle(data ? 'Edit Specific Product' : 'Add Specific Product');
    
    // Create form instance
    const spForm = new SPForm({
      data: data,
      onSubmit: (formData, iconFile) => {
        // Check for name uniqueness
        if (isNameUnique(formData)) {
          // Handle form submission with icon upload if needed
          if (iconFile) {
            uploadSpIcon(iconFile, formData.name).then(iconPath => {
              // Add icon path to form data
              formData.iconPath = iconPath;
              saveSP(formData);
            }).catch(error => {
              showNotification(error.message || 'Error uploading icon', 'danger');
            });
          } else {
            // Save without icon upload
            saveSP(formData);
          }
        } else {
          showNotification('A specific product with this name already exists.', 'danger');
          // Focus on the name field
          const nameInput = document.getElementById('spName');
          if (nameInput) {
            nameInput.classList.add('is-invalid');
            nameInput.focus();
          }
        }
      },
      onDelete: (id) => {
        // Handle specific product deletion
        deleteSP(id);
      }
    });
    
    // Set dialog content to the form
    spDialog.setContent(spForm.element);
    
    // Open dialog
    spDialog.open();
  }
  
  // Check if a specific product name is unique
  function isNameUnique(formData) {
    // If in edit mode and keeping the same name, it's OK
    if (formData.originalName && formData.originalName === formData.name) {
      return true;
    }
    
    // Check all existing items for name uniqueness
    return !allSPs.some(item => item.name === formData.name);
  }
  
  // Function to upload a specific product icon
  async function uploadSpIcon(file, spName) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('spName', spName);
      
      const response = await fetch('/api/sps/upload-icon', {
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
  
  // Function to save specific product
  async function saveSP(formData) {
    try {
      // Show loading state
      const saveButton = document.querySelector('#spDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
      }
      
      // Determine if this is an edit or create
      const isEditing = !!formData.id;
      const method = isEditing ? 'PUT' : 'POST';
      
      // Send request to API
      const response = await fetch('/api/sps', {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      // Parse the response once
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Error saving specific product');
      }
      
      // Add timestamp to cache-bust the icon if it's a new icon or update
      if (formData.iconPath) {
        const spId = responseData.sp?.id || formData.id;
        if (spId) {
          // Ensure imageUpdateTimestamps is initialized
          if (!spsTable.imageUpdateTimestamps) {
            spsTable.imageUpdateTimestamps = {};
          }
          // Set timestamp for this SP's icon to force cache refresh
          spsTable.imageUpdateTimestamps[spId] = Date.now();
        }
      }
      
      // Close dialog
      spDialog.close();
      
      // Refresh table
      spsTable.fetchData();
      
      // Show success message
      showNotification('Specific product saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving specific product:', error);
      showNotification(error.message || 'Error saving specific product', 'danger');
    } finally {
      // Reset button state
      const saveButton = document.querySelector('#spDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save';
      }
    }
  }
  
  // Function to delete specific product
  async function deleteSP(id) {
    try {
      // Show loading state
      const deleteButton = document.querySelector('.delete-button-container .btn-danger');
      if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Deleting...';
      }
      
      // Send DELETE request to API
      const response = await fetch(`/api/sps?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error deleting specific product');
      }
      
      // Close dialog
      spDialog.close();
      
      // Refresh table
      spsTable.fetchData();
      
      // Show success message
      showNotification('Specific product deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting specific product:', error);
      showNotification(error.message || 'Error deleting specific product', 'danger');
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
