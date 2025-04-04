// CI_new.js - Configuration Items page using component architecture
import { DataTable } from '../components/tableCore.js';
import { ColumnResizer } from '../components/columnResizer.js';
import { DialogManager } from '../components/dialogManager.js';
import { ConfigItemForm } from '../components/configItemForm.js';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Elements specific to the Configuration Items page
  const noResults = document.getElementById('noResults');
  const gpFilterHeader = document.getElementById('gpFilterHeader');
  const gpDropdownMenu = document.getElementById('gpDropdownMenu');
  const gpSearchInput = document.getElementById('gpSearchInput');
  const gpOptionsContainer = document.getElementById('gpOptionsContainer');
  
  // Map to store GP IDs to names for lookup
  let gpMap = new Map();
  
  // Current selected GP for filtering
  let selectedGP = '';
  
  // Initialize column resizer
  const columnResizer = new ColumnResizer('.test-cases-table');
  
  // All configuration items data (to check for name uniqueness)
  let allConfigItems = [];
  
  // Initialize dialog for adding/editing configuration items
  const configItemDialog = new DialogManager({
    id: 'configItemDialog',
    title: 'Add Configuration Item',
    size: 'medium',
    onSave: () => {
      // Trigger form submission
      const form = document.getElementById('configItemForm');
      if (form) {
        form.dispatchEvent(new Event('submit'));
      }
      return false; // Prevent dialog from closing automatically
    }
  });
  
  // First load the GP data from the API to build the mapping and populate the filter dropdown
  fetch('/api/gps') // Use the API endpoint
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error fetching GPs! status: ${response.status}`);
      }
      return response.json();
    })
    .then(gpData => {
      // Create a mapping of GP IDs to names
      gpData.forEach(gp => {
        gpMap.set(gp.id, gp.name);
      });
      
      // Create "All Generic Products" option
      const allOption = document.createElement('div');
      allOption.className = 'gp-option selected';
      allOption.textContent = 'All Generic Products';
      allOption.dataset.value = '';
      gpOptionsContainer.appendChild(allOption);
      
      // Populate the GP filter dropdown with sorted GP options
      const sortedGPs = gpData.sort((a, b) => a.name.localeCompare(b.name));
      sortedGPs.forEach(gp => {
        const option = document.createElement('div');
        option.className = 'gp-option';
        option.textContent = gp.name;
        option.dataset.value = gp.id;
        gpOptionsContainer.appendChild(option);
      });
      
      // Set up dropdown toggle
      gpFilterHeader.addEventListener('click', () => {
        gpDropdownMenu.classList.toggle('show');
        // Add Bootstrap dropdown arrow visual cue
        if (gpDropdownMenu.classList.contains('show')) {
          gpFilterHeader.style.borderBottomLeftRadius = '0';
          gpFilterHeader.style.borderBottomRightRadius = '0';
        } else {
          gpFilterHeader.style.borderBottomLeftRadius = '';
          gpFilterHeader.style.borderBottomRightRadius = '';
        }
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (event) => {
        if (!gpFilterHeader.contains(event.target) && !gpDropdownMenu.contains(event.target)) {
          gpDropdownMenu.classList.remove('show');
          gpFilterHeader.style.borderBottomLeftRadius = '';
          gpFilterHeader.style.borderBottomRightRadius = '';
        }
      });
      
      // Handle option selection
      gpOptionsContainer.addEventListener('click', (event) => {
        const option = event.target.closest('.gp-option');
        if (option) {
          // Update selected class
          document.querySelectorAll('.gp-option').forEach(opt => {
            opt.classList.remove('selected');
          });
          option.classList.add('selected');
          
          // Update header text
          gpFilterHeader.textContent = option.textContent;
          
          // Update selected GP value
          selectedGP = option.dataset.value;
          
          // Close dropdown
          gpDropdownMenu.classList.remove('show');
          
          // Filter table
          ciTable.filterAndRender();
        }
      });
      
      // Handle search input
      gpSearchInput.addEventListener('input', () => {
        const searchTerm = gpSearchInput.value.toLowerCase();
        const options = gpOptionsContainer.querySelectorAll('.gp-option');
        
        options.forEach(option => {
          const text = option.textContent.toLowerCase();
          const match = text.includes(searchTerm);
          option.style.display = match ? '' : 'none';
        });
      });
      
      // Prevent dropdown from closing when clicking search input
      gpSearchInput.addEventListener('click', (event) => {
        event.stopPropagation();
      });
      
      // After GP data is loaded, initialize the CI data table
      initConfigItemsTable();
    })
    .catch(error => {
      console.error('Error loading GP data:', error);
      // Still try to initialize the table even if GP data fails
      initConfigItemsTable();
    });
  
  // Define ciTable at a higher scope so it can be accessed from event handlers
  let ciTable;
  
  function initConfigItemsTable() {
    // Configure and initialize the data table
    ciTable = new DataTable({
      tableId: 'ciTable',
      tableBodyId: 'ciTableBody',
      dataUrl: '/api/config-items', // Changed from static file to API endpoint
      searchInputId: 'searchInput',
      itemsPerPageSelectId: 'itemsPerPageSelect',
      pageInfoId: 'pageInfo',
      prevButtonId: 'prevPageButton',
      nextButtonId: 'nextPageButton',
      defaultSortField: 'Name',
      noResultsMessage: 'No Configuration Items found matching your criteria.',
      
      // Store all configuration items for name uniqueness checking
      onDataFetched: (data) => {
        allConfigItems = [...data];
        return data;
      },
      
      // Special handling for errors
      onFetchStart: () => {
        if (noResults) noResults.classList.add('d-none');
      },
      
      onFetchError: (error) => {
        console.error('Error fetching Configuration Items:', error);
        if (noResults) {
          noResults.classList.remove('d-none');
          noResults.querySelector('p').textContent = 'Error loading Configuration Items data.';
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
      
      // Custom filter function for both search and GP filtering
      filterFunction: (item, searchTerm) => {
        // First check if the GP filter is active
        if (selectedGP && Array.isArray(item.GenericProducts)) {
          if (!item.GenericProducts.includes(selectedGP)) {
            return false;
          }
        }
        
        // Then apply text search if provided
        if (searchTerm) {
          const lowerSearchTerm = searchTerm.toLowerCase();
          
          // Basic fields: Name, DefaultValue, HelpText, ConfigurationAnswerType, AnswerContent
          const basicMatch = 
            (item.Name?.toLowerCase() || '').includes(lowerSearchTerm) ||
            (item.DefaultValue?.toLowerCase() || '').includes(lowerSearchTerm) ||
            (item.HelpText?.toLowerCase() || '').includes(lowerSearchTerm) ||
            (item.ConfigurationAnswerType?.toLowerCase() || '').includes(lowerSearchTerm) ||
            (item.AnswerContent?.toLowerCase() || '').includes(lowerSearchTerm);
          
          // GenericProducts field (array of GP IDs)
          let gpMatch = false;
          if (item.GenericProducts && Array.isArray(item.GenericProducts)) {
            // Check if any GP ID matches
            gpMatch = item.GenericProducts.some(gpId => 
              (gpId.toLowerCase() || '').includes(lowerSearchTerm)
            );
            
            // Check if any GP name matches (using the mapping)
            gpMatch = gpMatch || item.GenericProducts.some(gpId => {
              const gpName = gpMap.get(gpId);
              return gpName && gpName.toLowerCase().includes(lowerSearchTerm);
            });
          }
          
          return basicMatch || gpMatch;
        }
        
        // If no search term, but we passed the GP filter, return true
        return true;
      },
      
      // Custom sort for the GenericProducts array field
      customSort: (field, a, b, direction) => {
        if (field === 'GenericProducts') {
          // Convert GP arrays to names for comparison
          const getGPNames = (gpIds) => {
            if (!Array.isArray(gpIds)) return '';
            const names = gpIds.map(id => gpMap.get(id) || id);
            return names.join(', ');
          };
          
          const gpNamesA = getGPNames(a.GenericProducts);
          const gpNamesB = getGPNames(b.GenericProducts);
          
          if (gpNamesA < gpNamesB) return direction === 'asc' ? -1 : 1;
          if (gpNamesA > gpNamesB) return direction === 'asc' ? 1 : -1;
          return 0;
        }
        // Return null to use default sort logic for other fields
        return null;
      },
      
      columns: [
        { key: 'id', label: 'ID', sortable: true, width: '10%' }, // Add ID column
        { key: 'Name', label: 'Name', sortable: true },
        { 
          key: 'GenericProducts', 
          label: 'Generic Products', 
          sortable: true,
          render: (value) => {
            if (!Array.isArray(value) || value.length === 0) return '';
            
            // Convert GP IDs to names using the gpMap
            const gpNames = value.map(gpId => {
              const name = gpMap.get(gpId);
              return name || gpId;
            });
            
            return gpNames.join(', ');
          }
        },
        { key: 'DefaultValue', label: 'Default Value', sortable: true },
        { key: 'HelpText', label: 'Help Text', sortable: true },
        { key: 'ConfigurationAnswerType', label: 'Answer Type', sortable: true },
        { key: 'AnswerContent', label: 'Answer Content', sortable: true }
      ]
    });
    
    // Enable the Add CI button
    const addCIButton = document.getElementById('addCIButton');
    if (addCIButton) {
      addCIButton.disabled = false;
      addCIButton.addEventListener('click', () => {
        openConfigItemDialog();
      });
    }
    
    // Add row click handler for editing
    const tableBody = document.getElementById('ciTableBody');
    if (tableBody) {
      tableBody.addEventListener('click', (e) => {
        // Find the closest row element
        const row = e.target.closest('tr');
        if (!row) return;
        
        // Get the row index
        const rowIndex = Array.from(row.parentNode.children).indexOf(row);
        
        // Get the data for this row (which now includes the ID)
        const configItem = ciTable.filteredItems[rowIndex + (ciTable.currentPage - 1) * ciTable.itemsPerPage];
        
        if (configItem) {
          // Open edit dialog with this data
          openConfigItemDialog(configItem); // Pass the full item including ID
        }
      });
    }
  }
  
  // Function to open dialog for adding/editing configuration items
  function openConfigItemDialog(data = null) {
    // Update dialog title based on mode
    configItemDialog.setTitle(data ? 'Edit Configuration Item' : 'Add Configuration Item');
    
    // Create form instance
    const configItemForm = new ConfigItemForm({
      data: data,
      onSubmit: (formData) => {
        // Check for name uniqueness
        if (isNameUnique(formData)) {
          // Handle form submission
          saveConfigItem(formData);
        } else {
          showNotification('A configuration item with this name already exists.', 'danger');
          // Focus on the name field
          const nameInput = document.getElementById('ciName');
          if (nameInput) {
            nameInput.classList.add('is-invalid');
            nameInput.focus();
          }
        }
      },
      onDelete: (id) => { // Changed parameter from name to id
        // Handle configuration item deletion
        deleteConfigItem(id); // Pass ID
      }
    });
    
    // Set dialog content to the form
    configItemDialog.setContent(configItemForm.element);
    
    // Open dialog
    configItemDialog.open();
  }
  
  // Check if a configuration item name is unique
  function isNameUnique(formData) {
    const newName = formData.Name;
    const currentId = formData.id; // ID is present if editing

    // Check if the new name exists in *other* items (excluding the item being edited, identified by ID).
    return !allConfigItems.some(item => 
      item.Name === newName && // Check if any item's name matches the new name
      item.id !== currentId    // Exclude the item currently being edited
    );
  }
  
  // Function to save configuration item
  async function saveConfigItem(formData) {
    try {
      // Show loading state
      const saveButton = document.querySelector('#configItemDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
      }
      
      // Determine if this is an edit based on the presence of the ID
      const isEditing = !!formData.id; 
      const method = isEditing ? 'PUT' : 'POST';
      
      // Prepare payload (already includes ID if editing)
      const payload = { ...formData }; 
      // Remove originalName if it exists (no longer needed)
      delete payload.originalName; 

      // Send request to API
      const response = await fetch('/api/config-items', {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload) // Send the prepared payload
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error saving configuration item');
      }
      
      // Close dialog
      configItemDialog.close();
      
      // Refresh table
      ciTable.fetchData();
      
      // Show success message
      showNotification('Configuration item saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving configuration item:', error);
      showNotification(error.message || 'Error saving configuration item', 'danger');
    } finally {
      // Reset button state
      const saveButton = document.querySelector('#configItemDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save';
      }
    }
  }
  
  // Function to delete configuration item by ID
  async function deleteConfigItem(id) { // Changed parameter from name to id
    try {
      // Show loading state
      const deleteButton = document.querySelector('.delete-button-container .btn-danger');
      if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Deleting...';
      }
      
      // Send DELETE request to API using ID
      const response = await fetch(`/api/config-items?id=${encodeURIComponent(id)}`, { // Use id parameter
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error deleting configuration item');
      }
      
      // Close dialog
      configItemDialog.close();
      
      // Refresh table
      ciTable.fetchData();
      
      // Show success message
      showNotification('Configuration item deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting configuration item:', error);
      showNotification(error.message || 'Error deleting configuration item', 'danger');
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
