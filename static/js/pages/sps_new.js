// sps_new.js - Refactored SPs page using component architecture
import { DataTable } from '../components/tableCore.js';
import { ColumnResizer } from '../components/columnResizer.js';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Elements specific to the SPs page
  const noResults = document.getElementById('noResults');
  
  // Initialize column resizer
  const columnResizer = new ColumnResizer('.test-cases-table');
  
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
        render: (value, row) => value 
          ? `<img src="/static/ASC/${value.replace('./', '')}" alt="${row.name || 'Icon'}" class="icon-img">`
          : 'No Icon'
      }
    ]
  });
  
  // Disable the Add SP button
  const addSpButton = document.getElementById('addSpButton');
  if (addSpButton) {
    addSpButton.disabled = true;
  }
});
