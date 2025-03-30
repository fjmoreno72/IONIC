// affiliates_new.js - Refactored Affiliates page using component architecture
import { DataTable } from '../components/tableCore.js';
import { ColumnResizer } from '../components/columnResizer.js';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
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
  
  // Disable the Add Affiliate button
  const addAffiliateButton = document.getElementById('addAffiliateButton');
  if (addAffiliateButton) {
    addAffiliateButton.disabled = true;
  }
});
