// services_new.js - Refactored Services page using component architecture
import { DataTable } from '../components/tableCore.js';
import { ColumnResizer } from '../components/columnResizer.js';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Elements specific to the services page
  const noResults = document.getElementById('noResults');
  
  // Initialize column resizer
  const columnResizer = new ColumnResizer('.test-cases-table');
  
  // Create a mapping from GP IDs to names (will be populated later)
  let gpIdToNameMap = {};
  
  // First fetch the GPs data to build the ID to name mapping
  fetch('/static/ASC/data/gps.json')
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
  
  function initServicesTable() {
    // Configure and initialize the data table
    const servicesTable = new DataTable({
      tableId: 'servicesTable',
      tableBodyId: 'servicesTableBody',
      dataUrl: '/static/ASC/data/services.json',
      searchInputId: 'nameSearchInput',
      itemsPerPageSelectId: 'itemsPerPageSelect',
      pageInfoId: 'pageInfo',
      prevButtonId: 'prevPageButton',
      nextButtonId: 'nextPageButton',
      defaultSortField: 'id',
      noResultsMessage: 'No services found matching your criteria.',
      
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
        // Service name and ID matching
        const nameMatch = item.name?.toLowerCase().includes(searchTerm) || 
                         item.id?.toLowerCase().includes(searchTerm);
        
        // Spiral matching
        const spiralMatch = String(item.spiral || '').toLowerCase().includes(searchTerm);
        
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
          // Convert to numbers for numeric sorting
          const numA = parseFloat(a.spiral) || 0;
          const numB = parseFloat(b.spiral) || 0;
          
          if (numA < numB) return direction === 'asc' ? -1 : 1;
          if (numA > numB) return direction === 'asc' ? 1 : -1;
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
            if (!value || !Array.isArray(value)) return '';
            
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
    
    // Disable the Add Service button
    const addServiceButton = document.getElementById('addServiceButton');
    if (addServiceButton) {
      addServiceButton.disabled = true;
    }
  }
});
