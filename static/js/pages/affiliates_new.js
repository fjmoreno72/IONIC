// affiliates_new.js - Refactored Affiliates page using component architecture
import { DataTable } from '../components/tableCore.js';
import { ColumnResizer } from '../components/columnResizer.js';
import { DialogManager } from '../components/dialogManager.js';
import { AffiliateForm } from '../components/affiliateForm.js';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Environment management for tracking all unique environments
  let allEnvironments = new Set(['Static', 'Deployable', 'Army', 'Navy', 'Joint']);
  
  // Function to update environment filter with all unique environments
  function updateEnvironmentFilter() {
    const environmentFilter = document.getElementById('environmentFilter');
    if (!environmentFilter) return;
    
    // Store current selection to restore it after updating options
    const currentSelection = environmentFilter.value;
    
    // Clear existing options (except the "All Environments" option)
    while (environmentFilter.options.length > 1) {
      environmentFilter.remove(1);
    }
    
    // Sort environments alphabetically
    const sortedEnvironments = Array.from(allEnvironments).sort();
    
    // Add options for each environment
    sortedEnvironments.forEach(env => {
      const option = document.createElement('option');
      option.value = env;
      option.textContent = env;
      environmentFilter.appendChild(option);
    });
    
    // Restore previous selection if it still exists
    if (currentSelection) {
      // Check if the option still exists before setting it
      for (let i = 0; i < environmentFilter.options.length; i++) {
        if (environmentFilter.options[i].value === currentSelection) {
          environmentFilter.value = currentSelection;
          break;
        }
      }
    }
  }
  
  // Function to extract and track all environments from affiliate data
  function extractEnvironments(affiliates) {
    if (!Array.isArray(affiliates)) return;
    
    affiliates.forEach(affiliate => {
      if (affiliate.environments && Array.isArray(affiliate.environments)) {
        affiliate.environments.forEach(env => {
          if (env) allEnvironments.add(env);
        });
      }
    });
    
    // Update the filter dropdown with all environments
    updateEnvironmentFilter();
  }
  
  // Elements specific to the Affiliates page
  const noResults = document.getElementById('noResults');
  const typeFilter = document.getElementById('typeFilter');
  const environmentFilter = document.getElementById('environmentFilter');
  
  // Initialize column resizer
  const columnResizer = new ColumnResizer('.test-cases-table');
  
  // Configure and initialize the data table
  const affiliatesTable = new DataTable({
    tableId: 'affiliatesTable',
    tableBodyId: 'affiliatesTableBody',
    dataUrl: '/static/ASC/data/affiliates.json',
    searchInputId: 'nameSearchInput',
    itemsPerPageSelectId: 'itemsPerPageSelect',
    pageInfoId: 'pageInfo',
    prevButtonId: 'prevPageButton',
    nextButtonId: 'nextPageButton',
    defaultSortField: 'id',
    noResultsMessage: 'No affiliates found matching your criteria.',
    
    // Custom data handler to extract environments after data is fetched
    onDataFetched: (data) => {
      // Initialize environment list from the data
      extractEnvironments(data);
      return data; // Return the original data
    },
    
    // Error handling
    onFetchStart: () => {
      if (noResults) noResults.classList.add('d-none');
    },
    
    onFetchError: (error) => {
      console.error('Error fetching affiliates:', error);
      if (noResults) {
        noResults.classList.remove('d-none');
        noResults.querySelector('p').textContent = 'Error loading affiliate data.';
      }
    },
    
    onRenderComplete: (itemCount) => {
      if (itemCount === 0 && noResults) {
        noResults.classList.remove('d-none');
      } else if (noResults) {
        noResults.classList.add('d-none');
      }
    },
    
    // Custom filter function that includes the dropdown filters
    filterFunction: (item, searchTerm) => {
      // Get the current filter values
      const selectedType = typeFilter ? typeFilter.value : '';
      const selectedEnvironment = environmentFilter ? environmentFilter.value : '';
      
      console.log('Filtering item:', item);
      console.log('Filter values - Type:', selectedType, 'Environment:', selectedEnvironment);
      console.log('Item type:', item.type);
      
      // Check name and ID match for the search term - ensure searchTerm is handled correctly
      let nameMatch = true;
      if (searchTerm && searchTerm.length > 0) {
        nameMatch = (item.name?.toLowerCase() || '').includes(searchTerm) || 
                   (item.id?.toLowerCase() || '').includes(searchTerm);
      }
      
      // Check type filter match
      const typeMatch = selectedType === '' || item.type === selectedType;
      
      // Check environment filter match (environments is an array)
      const environmentMatch = selectedEnvironment === '' || 
                              (item.environments && 
                               Array.isArray(item.environments) && 
                               item.environments.includes(selectedEnvironment));
      
      console.log('Match results:', {
        nameMatch,
        typeMatch,
        environmentMatch
      });
      
      // All conditions must match
      return nameMatch && typeMatch && environmentMatch;
    },
    
    // Custom sort for array fields
    customSort: (field, a, b, direction) => {
      if (field === 'environments') {
        // Convert environment arrays to strings for comparison
        const envsA = Array.isArray(a.environments) ? a.environments.join(', ') : '';
        const envsB = Array.isArray(b.environments) ? b.environments.join(', ') : '';
        
        if (envsA < envsB) return direction === 'asc' ? -1 : 1;
        if (envsA > envsB) return direction === 'asc' ? 1 : -1;
        return 0;
      }
      // Default sort for other fields
      return null;
    },
    
    columns: [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { 
        key: 'environments', 
        label: 'Environments', 
        sortable: true,
        render: (value) => Array.isArray(value) ? value.join(', ') : ''
      },
      { 
        key: 'type', 
        label: 'Type', 
        sortable: true,
        cellClass: 'text-center'
      },
      { 
        key: 'flagPath', 
        label: 'Flag', 
        sortable: false,
        cellClass: 'text-center',
        render: (value, row) => value 
          ? `<img src="/static/ASC/${value.replace('./', '')}" alt="${row.name || 'Flag'}" class="flag-icon">`
          : ''
      }
    ]
  });
  
  // Add event listeners for the additional filters
  if (typeFilter) {
    typeFilter.addEventListener('change', () => {
      affiliatesTable.filterAndRender();
    });
  }
  
  if (environmentFilter) {
    environmentFilter.addEventListener('change', () => {
      affiliatesTable.filterAndRender();
    });
  }

  // Initialize dialog manager for affiliate operations
  const affiliateDialog = new DialogManager({
    id: 'affiliateDialog',
    title: 'Add Affiliate',
    size: 'medium',
    onSave: () => {
      // This is called when the Save button is clicked in the dialog
      // The form element inside the dialog handles the actual submission
      const form = document.getElementById('affiliateForm');
      if (form) {
        form.dispatchEvent(new Event('submit'));
      }
      return false; // Prevent dialog from closing automatically (we'll close it after successful save)
    }
  });
  
  // Function to open dialog in add or edit mode
  function openAffiliateDialog(data = null) {
    // Update dialog title based on mode
    affiliateDialog.setTitle(data ? 'Edit Affiliate' : 'Add Affiliate');
    
    // Create form instance
    const affiliateForm = new AffiliateForm({
      data: data,
      onSubmit: (formData) => {
        // Handle form submission
        saveAffiliate(formData);
      },
      onDelete: (affiliateId) => {
        // Handle affiliate deletion
        deleteAffiliate(affiliateId);
      }
    });
    
    // Set dialog content to the form
    affiliateDialog.setContent(affiliateForm.element);
    
    // Open dialog, optionally passing data for edit mode
    affiliateDialog.open(data);
  }
  
  // Function to delete an affiliate
  async function deleteAffiliate(affiliateId) {
    try {
      // Show loading state in dialog
      const deleteButton = document.querySelector('.delete-button-container .btn-danger');
      if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...';
      }
      
      // Send DELETE request to API
      const response = await fetch(`/api/affiliates?id=${affiliateId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error deleting affiliate');
      }
      
      // Close dialog
      affiliateDialog.close();
      
      // Refresh table data
      affiliatesTable.fetchData();
      
      // Show success message
      showNotification('Affiliate deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting affiliate:', error);
      showNotification(error.message || 'Error deleting affiliate', 'danger');
      
      // Reset button state on error
      const deleteButton = document.querySelector('.delete-button-container .btn-danger');
      if (deleteButton) {
        deleteButton.disabled = false;
        deleteButton.innerHTML = '<i class="fas fa-trash me-2"></i>Delete Affiliate';
      }
    }
  }
  
  // Function to save affiliate data
  async function saveAffiliate(formData) {
    try {
      // Show loading state
      const saveButton = document.querySelector('#affiliateDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
      }
      
      // 1. Handle flag image upload if present
      if (formData.flagFile) {
        const flagFormData = new FormData();
        flagFormData.append('file', formData.flagFile);
        flagFormData.append('affiliateName', formData.name);
        
        const uploadResponse = await fetch('/api/affiliates/upload-flag', {
          method: 'POST',
          body: flagFormData
        });
        
        if (!uploadResponse.ok) {
          const error = await uploadResponse.json();
          throw new Error(error.error || 'Error uploading flag image');
        }
        
        const uploadResult = await uploadResponse.json();
        
        // Add the flag path to form data
        formData.flagPath = uploadResult.path;
      }
      
      // Remove the file object as it can't be serialized
      delete formData.flagFile;
      
      // 2. Save affiliate data
      const method = formData.id ? 'PUT' : 'POST'; // PUT for update, POST for create
      
      const saveResponse = await fetch('/api/affiliates', {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!saveResponse.ok) {
        const error = await saveResponse.json();
        throw new Error(error.error || 'Error saving affiliate');
      }
      
      // 3. Add any new environments to the list and update filter
      if (formData.environments && Array.isArray(formData.environments)) {
        // Update the environment filter with any new environments
        const newEnvironmentsAdded = formData.environments.filter(env => !allEnvironments.has(env));
        if (newEnvironmentsAdded.length > 0) {
          newEnvironmentsAdded.forEach(env => allEnvironments.add(env));
          updateEnvironmentFilter();
        }
      }
      
      // 4. Close dialog
      affiliateDialog.close();
      
      // 5. Refresh table data
      affiliatesTable.fetchData();
      
      // Show success message
      showNotification('Affiliate saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving affiliate:', error);
      showNotification(error.message || 'Error saving affiliate', 'danger');
    } finally {
      // Reset button state
      const saveButton = document.querySelector('#affiliateDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save';
      }
    }
  }
  
  // Enable the Add Affiliate button and add click event
  const addAffiliateButton = document.getElementById('addAffiliateButton');
  if (addAffiliateButton) {
    addAffiliateButton.disabled = false;
    addAffiliateButton.addEventListener('click', () => {
      openAffiliateDialog();
    });
  }
  
  // Add row click handler for editing
  const tableBody = document.getElementById('affiliatesTableBody');
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      // Find the closest row element
      const row = e.target.closest('tr');
      if (!row) return;
      
      // Get the row index
      const rowIndex = Array.from(row.parentNode.children).indexOf(row);
      
      // Get the data for this row
      const affiliate = affiliatesTable.filteredItems[rowIndex + (affiliatesTable.currentPage - 1) * affiliatesTable.itemsPerPage];
      
      if (affiliate) {
        // Open edit dialog with this data
        openAffiliateDialog(affiliate);
      }
    });
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
