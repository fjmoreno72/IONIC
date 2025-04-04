// services_new.js - ASC Services page with CRUD operations

import { DataTable } from '../components/tableCore.js';
import { ColumnResizer } from '../components/columnResizer.js';
import { DialogManager } from '../components/dialogManager.js';
import { ServiceForm } from '../components/serviceForm.js';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Elements specific to the services page
  const noResults = document.getElementById('noResults');
  
  // Dropdown filter elements
  const spiralFilter = document.getElementById('spiralFilter');
  
  const gpFilterHeader = document.getElementById('gpFilterHeader');
  const gpDropdownMenu = document.getElementById('gpDropdownMenu');
  const gpSearchInput = document.getElementById('gpSearchInput');
  const gpOptionsContainer = document.getElementById('gpOptionsContainer');
  
  // Initialize column resizer
  const columnResizer = new ColumnResizer('.test-cases-table');
  
  // All services data
  let allServices = [];
  
  // Create a mapping from GP IDs to names
  let gpIdToNameMap = {};
  
  // Current selected filter
  let selectedGp = '';
  
  // Initialize dialog for adding/editing services
  const serviceDialog = new DialogManager({
    id: 'serviceDialog',
    title: 'Add Service',
    size: 'medium',
    onSave: () => {
      // Trigger form submission
      const form = document.getElementById('serviceForm');
      if (form) {
        form.dispatchEvent(new Event('submit'));
      }
      return false; // Prevent dialog from closing automatically
    }
  });
  
  // First fetch the GPs data from the API to build the ID to name mapping
  fetch('/api/gps') // Use the API endpoint
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error fetching GPs! status: ${response.status}`);
      }
      return response.json();
    })
    .then(gpsData => {
      // Create the GP ID to Name map
      gpIdToNameMap = gpsData.reduce((map, gp) => {
        if (gp.id && gp.name) {
          map[gp.id] = gp.name;
        }
        return map;
      }, {});
      
      // Setup GP filter dropdown
      setupGpFilter(gpsData);
      
      // Now initialize the services table
      initServicesTable();
    })
    .catch(error => {
      console.error('Error fetching GP data:', error);
      if (noResults) {
        noResults.classList.remove('d-none');
        noResults.querySelector('p').textContent = 'Error loading GP data.';
      }
    });
    
  // Set up spiral filter dropdown UI and event handlers
  function setupSpiralFilter(spirals) {
    // console.log("Setting up spiral filter with values:", Array.from(spirals)); // Removed log
    
    if (!spiralFilter) {
      console.error("Missing spiralFilter element");
      return;
    }
    
    // Store current selection to restore it after updating options
    const currentSelection = spiralFilter.value;
    
    // Clear existing options (except the "All Spirals" option)
    while (spiralFilter.options.length > 1) {
      spiralFilter.remove(1);
    }
    
    // Add spiral options sorted alphabetically
    if (spirals.size > 0) {
      Array.from(spirals).sort().forEach(spiral => {
        // console.log("Adding spiral option:", spiral); // Removed log
        const option = document.createElement('option');
        option.value = spiral;
        option.textContent = spiral;
        spiralFilter.appendChild(option);
      });
    } else {
      // If no spirals are found, add SP5 as a default
      console.log("No spirals found, adding default SP5 option");
      const option = document.createElement('option');
      option.value = 'SP5';
      option.textContent = 'SP5';
      spiralFilter.appendChild(option);
    }
    
    // Restore previous selection if it still exists
    if (currentSelection) {
      // Check if the option still exists before setting it
      for (let i = 0; i < spiralFilter.options.length; i++) {
        if (spiralFilter.options[i].value === currentSelection) {
          spiralFilter.value = currentSelection;
          break;
        }
      }
    }
    
    // Add event listener for when spiral filter changes
    if (!spiralFilter.hasEventListener) {
      spiralFilter.addEventListener('change', () => {
        servicesTable.filterAndRender();
      });
      spiralFilter.hasEventListener = true;
    }
  }
  
  // Set up GP filter dropdown UI and event handlers
  function setupGpFilter(gpsData) {
    if (!gpFilterHeader || !gpDropdownMenu || !gpOptionsContainer) {
      console.error("Missing DOM elements for GP filter:", {
        gpFilterHeader: !!gpFilterHeader,
        gpDropdownMenu: !!gpDropdownMenu,
        gpOptionsContainer: !!gpOptionsContainer
      });
      return;
    }
    
    // Clear any existing options
    gpOptionsContainer.innerHTML = '';
    
    // Create "All Generic Products" option
    const allOption = document.createElement('div');
    allOption.className = 'filter-option selected';
    allOption.textContent = 'All Generic Products';
    allOption.dataset.value = '';
    gpOptionsContainer.appendChild(allOption);
    
    // Add GP options sorted alphabetically
    const sortedGPs = gpsData.sort((a, b) => a.name.localeCompare(b.name));
    sortedGPs.forEach(gp => {
      const option = document.createElement('div');
      option.className = 'filter-option';
      option.textContent = gp.name;
      option.dataset.value = gp.id;
      gpOptionsContainer.appendChild(option);
    });
    
    // Set up dropdown toggle
    gpFilterHeader.addEventListener('click', () => {
      gpDropdownMenu.classList.toggle('show');
      
      // Add visual cue with border radius
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
      const option = event.target.closest('.filter-option');
      if (option) {
        // Update selected class
        document.querySelectorAll('#gpOptionsContainer .filter-option').forEach(opt => {
          opt.classList.remove('selected');
        });
        option.classList.add('selected');
        
        // Update header text
        gpFilterHeader.textContent = option.textContent;
        
        // Update selected GP value
        selectedGp = option.dataset.value;
        
        // Close dropdown
        gpDropdownMenu.classList.remove('show');
        
        // Filter table
        servicesTable.filterAndRender();
      }
    });
    
    // Handle search input
    if (gpSearchInput) {
      gpSearchInput.addEventListener('input', () => {
        const searchTerm = gpSearchInput.value.toLowerCase();
        const options = gpOptionsContainer.querySelectorAll('.filter-option');
        
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
    }
  }
  
  // Extract spiral values from data for the filter
  function extractSpirals(services) {
    if (!Array.isArray(services)) {
      console.error("Services data is not an array:", services);
      return;
    }
    
    // console.log("Extracting spirals from services:", services); // Removed log
    
    // Create a set of unique spirals
    const spirals = new Set();
    
    services.forEach(service => {
      if (service.spiral) {
        spirals.add(service.spiral);
        // console.log(`Added spiral: ${service.spiral}`); // Removed log
      }
    });
    
    // console.log("Extracted spirals:", Array.from(spirals)); // Removed log
    
    // Setup the spiral filter with the extracted values
    setupSpiralFilter(spirals);
  }
  
  // Define servicesTable at a higher scope so it can be accessed from event handlers
  let servicesTable;
  
  function initServicesTable() {
    // Configure and initialize the data table
    servicesTable = new DataTable({
      tableId: 'servicesTable',
      tableBodyId: 'servicesTableBody',
      dataUrl: '/api/services', // Changed to API endpoint
      searchInputId: 'nameSearchInput',
      itemsPerPageSelectId: 'itemsPerPageSelect',
      pageInfoId: 'pageInfo',
      prevButtonId: 'prevPageButton',
      nextButtonId: 'nextPageButton',
      defaultSortField: 'id',
      noResultsMessage: 'No services found matching your criteria.',
      
      // Store all services for ID uniqueness checking and extract filters
      onDataFetched: (data) => {
        allServices = [...data];
        // console.log("Fetched services:", data); // Removed log
        extractSpirals(data);
        return data;
      },
      
      // Special loading and error handling
      onFetchStart: () => {
        if (noResults) noResults.classList.add('d-none');
      },
      
      onFetchComplete: () => {
        // No additional actions needed
      },
      
      onFetchError: (error) => {
        console.error('Error fetching services:', error);
        if (noResults) {
          noResults.classList.remove('d-none');
          noResults.querySelector('p').textContent = 'Error loading service data.';
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
    // First check if the spiral filter is active
    if (spiralFilter.value && String(item.spiral || '').toLowerCase() !== String(spiralFilter.value).toLowerCase()) {
      return false;
    }
        
        // Then check if the GP filter is active
        if (selectedGp) {
          // Check if the item has this GP ID in its gps array
          if (!item.gps || !Array.isArray(item.gps) || !item.gps.includes(selectedGp)) {
            return false;
          }
        }
        
        if (!searchTerm) return true;
        
        searchTerm = searchTerm.toLowerCase();
        
        // Service name and ID matching
        const nameMatch = (item.name?.toLowerCase() || '').includes(searchTerm) || 
                         (item.id?.toLowerCase() || '').includes(searchTerm);
        
        // Spiral matching
        const spiralMatch = (String(item.spiral || '').toLowerCase()).includes(searchTerm);
        
        // GPs matching - need to convert IDs to names for search
        let gpsMatch = false;
        if (item.gps && Array.isArray(item.gps)) {
          // Get the names of GPs this service uses
          const gpNames = item.gps
            .map(gpId => gpIdToNameMap[gpId])
            .filter(name => name); // Filter out undefined/null names
          
          // Check if any GP name contains the search term
          gpsMatch = gpNames.some(name => 
            name.toLowerCase().includes(searchTerm)
          );
        }
        
        return nameMatch || spiralMatch || gpsMatch;
      },
      
      // Custom sort for 'spiral' field
      customSort: (field, a, b, direction) => {
        if (field === 'spiral') {
          // Convert to numbers for numeric sorting if they are numeric
          const spiralA = a.spiral || '';
          const spiralB = b.spiral || '';
          
          // Extract numeric parts if present
          const numA = spiralA.match(/\d+/);
          const numB = spiralB.match(/\d+/);
          
          if (numA && numB) {
            const numValueA = parseInt(numA[0], 10);
            const numValueB = parseInt(numB[0], 10);
            
            if (numValueA < numValueB) return direction === 'asc' ? -1 : 1;
            if (numValueA > numValueB) return direction === 'asc' ? 1 : -1;
          }
          
          // Default to string comparison
          if (spiralA < spiralB) return direction === 'asc' ? -1 : 1;
          if (spiralA > spiralB) return direction === 'asc' ? 1 : -1;
          return 0;
        }
        // For 'gps' array field
        if (field === 'gps') {
          // Convert GP IDs to names for sorting
          const namesA = (a.gps || [])
            .map(gpId => gpIdToNameMap[gpId])
            .filter(name => name)
            .join(', ');
          
          const namesB = (b.gps || [])
            .map(gpId => gpIdToNameMap[gpId])
            .filter(name => name)
            .join(', ');
          
          if (namesA < namesB) return direction === 'asc' ? -1 : 1;
          if (namesA > namesB) return direction === 'asc' ? 1 : -1;
          return 0;
        }
        // Return null to use default sort logic
        return null;
      },
      
      columns: [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { 
          key: 'spiral', 
          label: 'Spiral', 
          sortable: true,
          cellClass: 'spiral-column',
          render: (value) => value || ''
        },
        { 
          key: 'gps', 
          label: 'GPs', 
          sortable: true,
          render: (value) => {
            if (!value || !Array.isArray(value) || value.length === 0) return '';
            
            // Convert GP IDs to names
            const gpNames = value
              .map(gpId => gpIdToNameMap[gpId])
              .filter(name => name); // Filter out undefined/null names
            
            return gpNames.join(', ');
          }
        },
        { 
          key: 'iconPath', 
          label: 'Icon', 
          sortable: false,
          cellClass: 'icon-column',
          render: (value, row) => value 
            ? `<img src="/static/ASC/${value.replace('./', '')}" alt="${row.name || 'Icon'}" class="icon-img">`
            : 'No Icon'
        }
      ]
    });
    
    // Enable the Add Service button
    const addServiceButton = document.getElementById('addServiceButton');
    if (addServiceButton) {
      addServiceButton.addEventListener('click', () => {
        openServiceDialog();
      });
    }
    
    // Add row click handler for editing
    const tableBody = document.getElementById('servicesTableBody');
    if (tableBody) {
      tableBody.addEventListener('click', (e) => {
        // Find the closest row element
        const row = e.target.closest('tr');
        if (!row) return;
        
        // Get the row index
        const rowIndex = Array.from(row.parentNode.children).indexOf(row);
        
        // Get the data for this row
        const service = servicesTable.filteredItems[rowIndex + (servicesTable.currentPage - 1) * servicesTable.itemsPerPage];
        
        if (service) {
          // Open edit dialog with this data
          openServiceDialog(service);
        }
      });
    }
  }
  
  // Function to open dialog for adding/editing services
  function openServiceDialog(data = null) {
    // Update dialog title based on mode
    serviceDialog.setTitle(data ? 'Edit Service' : 'Add Service');
    
    // Create form instance
    const serviceForm = new ServiceForm({
      data: data,
      onSubmit: (formData) => {
        // Handle form submission
        saveService(formData);
      },
      onDelete: (id) => {
        // Handle service deletion
        deleteService(id);
      }
    });
    
    // Set dialog content to the form
    serviceDialog.setContent(serviceForm.element);
    
    // Open dialog
    serviceDialog.open();
  }
  
  // Function to save service
  async function saveService(formData) {
    try {
      // Show loading state
      const saveButton = document.querySelector('#serviceDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
      }
      
      // Determine if this is an edit or add
      const isEditing = formData.id !== undefined;
      const method = isEditing ? 'PUT' : 'POST';
      
      // Handle file uploads if present
      let iconPath = formData.iconPath;
      let diagramPath = formData.functionalDiagramPath;
      
      // Upload icon if provided
      if (formData.iconFile) {
        const iconFormData = new FormData();
        iconFormData.append('file', formData.iconFile);
        iconFormData.append('serviceName', formData.name);
        
        try {
          const uploadResponse = await fetch('/api/services/upload-icon', {
            method: 'POST',
            body: iconFormData
          });
          
          if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            if (result.success) {
              iconPath = result.path;
            }
          }
        } catch (error) {
          console.error('Error uploading icon:', error);
        }
        
        // Remove the file from the data we'll send to the services API
        delete formData.iconFile;
      }
      
      // Upload diagram if provided
      if (formData.diagramFile) {
        const diagramFormData = new FormData();
        diagramFormData.append('file', formData.diagramFile);
        diagramFormData.append('serviceName', formData.name);
        
        try {
          const uploadResponse = await fetch('/api/services/upload-diagram', {
            method: 'POST',
            body: diagramFormData
          });
          
          if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            if (result.success) {
              diagramPath = result.path;
            }
          }
        } catch (error) {
          console.error('Error uploading diagram:', error);
        }
        
        // Remove the file from the data we'll send to the services API
        delete formData.diagramFile;
      }
      
      // Update paths with upload results
      if (iconPath) formData.iconPath = iconPath;
      if (diagramPath) formData.functionalDiagramPath = diagramPath;
      
      // Send request to API
      const response = await fetch('/api/services', {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error saving service');
      }
      
      // Close dialog
      serviceDialog.close();
      
      // Refresh table
      servicesTable.fetchData();
      
      // Show success message
      showNotification('Service saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving service:', error);
      showNotification(error.message || 'Error saving service', 'danger');
    } finally {
      // Reset button state
      const saveButton = document.querySelector('#serviceDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save';
      }
    }
  }
  
  // Function to delete service
  async function deleteService(serviceId) {
    try {
      // Show loading state
      const deleteButton = document.querySelector('.delete-button-container .btn-danger');
      if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Deleting...';
      }
      
      // Send DELETE request to API
      const response = await fetch(`/api/services?id=${encodeURIComponent(serviceId)}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error deleting service');
      }
      
      // Close dialog
      serviceDialog.close();
      
      // Refresh table
      servicesTable.fetchData();
      
      // Show success message
      showNotification('Service deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting service:', error);
      showNotification(error.message || 'Error deleting service', 'danger');
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
