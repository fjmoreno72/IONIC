// gps_new.js - Refactored GPs page using component architecture
import { DataTable } from '../components/tableCore.js';
import { ThemeManager } from '../components/themeManager.js';
import { ColumnResizer } from '../components/columnResizer.js';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize column resizer after table is loaded
  const columnResizer = new ColumnResizer('.test-cases-table');
  
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
    columns: [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'description', label: 'Description', sortable: true },
      { 
        key: 'iconPath', 
        label: 'Icon', 
        sortable: false,
        cellClass: 'text-center',
        render: (value, row) => value 
          ? `<img src="/static/ASC/${value.replace('./', '')}" alt="${row.name || 'Icon'}" class="icon-img">`
          : ''
      }
    ],
    // Custom filter function
    filterFunction: (item, searchTerm) => {
      return (item.id?.toLowerCase() || '').includes(searchTerm) ||
             (item.name?.toLowerCase() || '').includes(searchTerm) ||
             (item.description?.toLowerCase() || '').includes(searchTerm);
    }
  });
  
  // Disable the Add GP button (matches original behavior)
  const addGpButton = document.getElementById('addGpButton');
  if (addGpButton) {
    addGpButton.disabled = true;
  }
});
