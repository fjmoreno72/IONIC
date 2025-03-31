// CI_new.js - Configuration Items page using component architecture
import { DataTable } from '../components/tableCore.js';
import { ColumnResizer } from '../components/columnResizer.js';

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
  
  // First load the GP data to build the mapping and populate the filter dropdown
  fetch('/static/ASC/data/gps.json')
    .then(response => response.json())
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
      dataUrl: '/static/ASC/data/configItem.json',
      searchInputId: 'searchInput',
      itemsPerPageSelectId: 'itemsPerPageSelect',
      pageInfoId: 'pageInfo',
      prevButtonId: 'prevPageButton',
      nextButtonId: 'nextPageButton',
      defaultSortField: 'Name',
      noResultsMessage: 'No Configuration Items found matching your criteria.',
      
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
    
    // Disable the Add CI button
    const addCIButton = document.getElementById('addCIButton');
    if (addCIButton) {
      addCIButton.disabled = true;
    }
  }
});
