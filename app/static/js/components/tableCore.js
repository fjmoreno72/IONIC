// tableCore.js - Core data table management
export class DataTable {
  constructor(config) {
    // Required configuration
    this.tableId = config.tableId || 'dataTable';
    this.tableBodyId = config.tableBodyId || 'dataTableBody';
    this.dataUrl = config.dataUrl;
    this.columns = config.columns || [];
    
    // Optional configuration with defaults
    this.searchInputId = config.searchInputId;
    this.itemsPerPageSelectId = config.itemsPerPageSelectId || 'itemsPerPageSelect';
    this.pageInfoId = config.pageInfoId || 'pageInfo';
    this.prevButtonId = config.prevButtonId || 'prevPageButton';
    this.nextButtonId = config.nextButtonId || 'nextPageButton';
    this.defaultSortField = config.defaultSortField || this.columns[0]?.key || 'id';
    this.filterFunction = config.filterFunction || this.defaultFilterFunction;
    this.noResultsMessage = config.noResultsMessage || 'No items found matching your criteria.';
    
    // Store callbacks passed in config
    this.onFetchStart = config.onFetchStart;
    this.onDataFetched = config.onDataFetched; // Store the callback
    this.onFetchComplete = config.onFetchComplete;
    this.onFetchError = config.onFetchError;
    this.onRenderComplete = config.onRenderComplete;
    this.customSort = config.customSort; // Store custom sort

    // Internal state
    this.allItems = [];
    this.filteredItems = [];
    this.currentPage = 1;
    this.itemsPerPage = 25;
    this.currentSortField = this.defaultSortField;
    this.sortDirection = 'asc';
    
    // DOM elements (populated in init)
    this.tableBody = null;
    this.searchInput = null;
    this.itemsPerPageSelect = null;
    this.pageInfo = null;
    this.prevButton = null;
    this.nextButton = null;
    
    // Initialize after DOM is ready
    this.init();
  }
  
  init() {
    // Get DOM elements
    this.tableBody = document.getElementById(this.tableBodyId);
    if (this.searchInputId) {
      this.searchInput = document.getElementById(this.searchInputId);
    }
    this.itemsPerPageSelect = document.getElementById(this.itemsPerPageSelectId);
    this.pageInfo = document.getElementById(this.pageInfoId);
    this.prevButton = document.getElementById(this.prevButtonId);
    this.nextButton = document.getElementById(this.nextButtonId);
    
    // Bail if required elements are missing
    if (!this.tableBody) {
      console.error(`Table body with ID '${this.tableBodyId}' not found`);
      return;
    }
    
    // Initialize pagination
    if (this.itemsPerPageSelect) {
      this.itemsPerPage = parseInt(this.itemsPerPageSelect.value, 10);
    }
    
    // Fetch data
    this.fetchData();
    
    // Set up event listeners
    this.setupEventListeners();
  }
  
  fetchData() {
    // Call onFetchStart if provided
    if (typeof this.onFetchStart === 'function') {
      this.onFetchStart();
    }
    
    fetch(this.dataUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Process data through onDataFetched callback if provided
        if (typeof this.onDataFetched === 'function') {
          data = this.onDataFetched(data) || data;
        }
        
        this.allItems = data;
        
        // Call onFetchComplete if provided
        if (typeof this.onFetchComplete === 'function') {
          this.onFetchComplete(data);
        }
        
        this.filterAndRender();
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        this.tableBody.innerHTML = `<tr><td colspan="${this.columns.length}" class="text-center text-danger">Error loading data.</td></tr>`;
        
        // Call onFetchError if provided
        if (typeof this.onFetchError === 'function') {
          this.onFetchError(error);
        }
      });
  }
  
  filterAndRender() {
    const searchTerm = this.searchInput ? this.searchInput.value.toLowerCase() : '';
    
    // Always apply the filter function, even when searchTerm is empty
    // This ensures dropdown filters work independently of search
    this.filteredItems = this.allItems.filter(item => this.filterFunction(item, searchTerm));
    
    // Apply sort
    this.sortData();
    
    // Reset to first page when filter changes
    this.currentPage = 1;
    
    // Render table with current settings
    this.renderTable();
  }
  
  defaultFilterFunction(item, searchTerm) {
    // Default implementation searches all string properties
    return Object.values(item).some(value => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm);
      }
      return false;
    });
  }
  
  renderTable() {
    if (!this.tableBody) return;
    
    this.tableBody.innerHTML = ''; // Clear existing rows
    
    if (this.filteredItems.length === 0) {
      this.tableBody.innerHTML = `<tr><td colspan="${this.columns.length}" class="text-center">${this.noResultsMessage}</td></tr>`;
      this.updatePaginationControls();
      
      // Call onRenderComplete if provided
      if (typeof this.onRenderComplete === 'function') {
        this.onRenderComplete(0);
      }
      
      return;
    }
    
    // Calculate items for the current page
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedItems = this.filteredItems.slice(startIndex, endIndex);
    
    // Render each item
    paginatedItems.forEach(item => {
      const row = document.createElement('tr');
      
      this.columns.forEach(column => {
        const cell = document.createElement('td');
        
        // Apply custom classes if specified
        if (column.cellClass) {
          cell.className = column.cellClass;
        }
        
        // Get value for this cell
        const value = item[column.key];
        
        // Use custom render function if provided, otherwise use value directly
        if (column.render && typeof column.render === 'function') {
          cell.innerHTML = column.render(value, item);
        } else {
          cell.textContent = value || '';
        }
        
        row.appendChild(cell);
      });
      
      this.tableBody.appendChild(row);
    });
    
    // Update pagination after rendering
    this.updatePaginationControls();
    
    // Call onRenderComplete if provided
    if (typeof this.onRenderComplete === 'function') {
      this.onRenderComplete(this.filteredItems.length);
    }
  }
  
  sortData() {
    this.filteredItems.sort((a, b) => {
      // Check if we have a custom sort function for this field
      if (typeof this.customSort === 'function') {
        const result = this.customSort(this.currentSortField, a, b, this.sortDirection);
        // If custom sort returns a valid result, use it
        if (result !== null && result !== undefined) {
          return result;
        }
      }
      
      // Default sorting logic
      let valA = a[this.currentSortField];
      let valB = b[this.currentSortField];
      
      // Handle arrays (like versions)
      if (Array.isArray(valA)) valA = valA.join(', ');
      if (Array.isArray(valB)) valB = valB.join(', ');
      
      // Convert to strings for consistent comparison
      valA = valA === null || valA === undefined ? '' : String(valA).toLowerCase();
      valB = valB === null || valB === undefined ? '' : String(valB).toLowerCase();
      
      // Compare based on current sort direction
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  updatePaginationControls() {
    if (!this.pageInfo) return;
    
    const totalItems = this.filteredItems.length;
    let totalPages = Math.ceil(totalItems / this.itemsPerPage);
    totalPages = totalPages === 0 ? 1 : totalPages; // Ensure at least 1 page
    
    // Update current page if it's out of bounds
    this.currentPage = Math.min(this.currentPage, totalPages);
    
    // Update page info text
    this.pageInfo.textContent = `Page ${this.currentPage} of ${totalPages} (${totalItems} items total)`;
    
    // Update button states
    if (this.prevButton) {
      this.prevButton.disabled = this.currentPage === 1;
    }
    if (this.nextButton) {
      this.nextButton.disabled = this.currentPage === totalPages;
    }
    
    // Hide/show pagination controls based on page count
    const paginationControls = document.getElementById('paginationControls');
    if (paginationControls) {
      paginationControls.style.display = totalItems <= this.itemsPerPage && totalPages <= 1 ? 'none' : 'flex';
    }
  }
  
  setupEventListeners() {
    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', () => {
        this.filterAndRender();
      });
    }
    
    // Items per page select
    if (this.itemsPerPageSelect) {
      this.itemsPerPageSelect.addEventListener('change', () => {
        this.itemsPerPage = parseInt(this.itemsPerPageSelect.value, 10);
        this.currentPage = 1; // Reset to first page
        this.renderTable();
      });
    }
    
    // Pagination buttons
    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.renderTable();
        }
      });
    }
    
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => {
        const totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
          this.currentPage++;
          this.renderTable();
        }
      });
    }
    
    // Setup sorting
    this.setupSortingListeners();
  }
  
  setupSortingListeners() {
    const table = document.getElementById(this.tableId);
    if (!table) return;
    
    const sortableHeaders = table.querySelectorAll('th.sortable');
    sortableHeaders.forEach(th => {
      th.addEventListener('click', () => {
        const field = th.dataset.sort;
        if (!field) return;
        
        // Update sort direction
        if (field === this.currentSortField) {
          this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
          this.currentSortField = field;
          this.sortDirection = 'asc';
        }
        
        // Update sort icons
        sortableHeaders.forEach(header => {
          const icon = header.querySelector('i');
          if (icon) icon.className = 'fas fa-sort';
        });
        
        // Update the clicked header's icon
        const icon = th.querySelector('i');
        if (icon) {
          icon.className = `fas fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'}`;
        }
        
        // Re-sort and render
        this.sortData();
        this.renderTable();
      });
    });
  }
}
