// Affiliate data management
let allAffiliates = [];
let filteredAffiliates = [];
let currentPage = 1;
let itemsPerPage = 25; // Default items per page
let currentSortField = 'id'; // Default sort field
let sortDirection = 'asc'; // Default sort direction

// Fetch affiliates data
async function fetchData() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResultsDiv = document.getElementById('noResults');
    loadingIndicator.style.display = 'block'; // Show loading indicator
    noResultsDiv.classList.add('d-none'); // Hide no results message

    try {
        const response = await fetch('/api/affiliates'); // Use the new API endpoint
        if (!response.ok) {
            throw new Error(`Failed to fetch affiliates data: ${response.statusText}`);
        }
        const data = await response.json();
        allAffiliates = data.map(affiliate => ({
            ...affiliate,
            // Ensure environments is always an array for consistent handling
            environments: Array.isArray(affiliate.environments) ? affiliate.environments : []
        })); // Store raw data

        applyFilters(); // Apply initial filters and display data

    } catch (error) {
        console.error('Error fetching affiliates data:', error);
        loadingIndicator.style.display = 'none';
        noResultsDiv.classList.remove('d-none');
        noResultsDiv.textContent = 'Error loading affiliates data. Please try again later.';
    } finally {
         loadingIndicator.style.display = 'none'; // Ensure loading indicator is hidden
    }
}

// Update table with filtered and paginated data
function updateTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredAffiliates.length);
    const tableBody = document.getElementById('affiliatesTableBody');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResultsDiv = document.getElementById('noResults');

    // Clear existing rows
    tableBody.innerHTML = '';

    // Hide loading indicator
    loadingIndicator.style.display = 'none';

    // Show no results message if needed
    if (filteredAffiliates.length === 0) { // Corrected variable name here
        noResultsDiv.classList.remove('d-none');
        noResultsDiv.textContent = 'No affiliates found matching your criteria.';
    } else {
        noResultsDiv.classList.add('d-none');

        // Add rows for current page
        for (let i = startIndex; i < endIndex; i++) {
            const affiliate = filteredAffiliates[i];
            const row = document.createElement('tr');

            // ID Column
            const idCell = document.createElement('td');
            idCell.className = 'id-column';
            idCell.textContent = affiliate.id || 'N/A';

            // Name Column
            const nameCell = document.createElement('td');
            nameCell.textContent = affiliate.name || 'N/A';

            // Environments Column
            const environmentsCell = document.createElement('td');
            environmentsCell.className = 'environments-column';
            // Join array elements, handle empty array
            environmentsCell.textContent = affiliate.environments.length > 0 ? affiliate.environments.join(', ') : 'None';

            // Type Column
            const typeCell = document.createElement('td');
            typeCell.className = 'type-column';
            typeCell.textContent = affiliate.type || 'N/A';

            // Flag Column
            const flagCell = document.createElement('td');
            flagCell.className = 'flag-column';
            if (affiliate.flagUrl) {
                const flagImg = document.createElement('img');
                flagImg.src = affiliate.flagUrl;
                flagImg.alt = `${affiliate.name} Flag`;
                flagImg.className = 'flag-icon';
                flagCell.appendChild(flagImg);
            } else {
                flagCell.textContent = '-'; // Placeholder if no flag
            }

            // Add cells to row
            row.appendChild(idCell);
            row.appendChild(nameCell);
            row.appendChild(environmentsCell);
            row.appendChild(typeCell);
            row.appendChild(flagCell);

            // Add row to table
            tableBody.appendChild(row);
        }
    }

    // Update pagination info
    document.getElementById('currentRangeStart').textContent = filteredAffiliates.length > 0 ? startIndex + 1 : 0;
    document.getElementById('currentRangeEnd').textContent = endIndex;
    document.getElementById('totalItems').textContent = filteredAffiliates.length;

    // Update pagination controls
    updatePagination();
}

// Apply filters and search
function applyFilters() {
    const nameSearchTerm = document.getElementById('nameSearchInput').value.toLowerCase();
    const typeFilterValue = document.getElementById('typeFilter').value;
    const environmentFilterValue = document.getElementById('environmentFilter').value;

    filteredAffiliates = allAffiliates.filter(affiliate => { // Corrected variable name here
        const matchesName = nameSearchTerm === '' ||
            (affiliate.name && affiliate.name.toLowerCase().includes(nameSearchTerm)) ||
            (affiliate.id && affiliate.id.toLowerCase().includes(nameSearchTerm)); // Also search by ID

        const matchesType = typeFilterValue === '' || affiliate.type === typeFilterValue;

        // Check if any of the affiliate's environments match the filter
        const matchesEnvironment = environmentFilterValue === '' ||
            (affiliate.environments && affiliate.environments.includes(environmentFilterValue));

        return matchesName && matchesType && matchesEnvironment;
    });

    // Sort filtered data
    sortData();

    // Reset to first page
    currentPage = 1;
    updateTable();
}

// Sort affiliate data
function sortData() {
    filteredAffiliates.sort((a, b) => { // Corrected variable name here
        let valA = a[currentSortField];
        let valB = b[currentSortField];

        // Handle environments array for sorting - join to string
        if (currentSortField === 'environments') {
            valA = Array.isArray(valA) ? valA.join(', ').toLowerCase() : '';
            valB = Array.isArray(valB) ? valB.join(', ').toLowerCase() : '';
        } else if (typeof valA === 'string') {
            valA = valA.toLowerCase();
        } else if (valA === null || valA === undefined) {
            valA = ''; // Treat null/undefined as empty string for sorting
        }

        if (typeof valB === 'string') {
            valB = valB.toLowerCase();
        } else if (valB === null || valB === undefined) {
            valB = ''; // Treat null/undefined as empty string for sorting
        }


        // Comparison logic
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

// Update pagination controls
function updatePagination() {
    const maxPage = Math.ceil(filteredAffiliates.length / itemsPerPage); // Corrected variable name here
    const paginationContainer = document.getElementById('paginationContainer');
    const pageButtons = Array.from(paginationContainer.querySelectorAll('.page-number'));

    // Remove old page number buttons
    pageButtons.forEach(button => button.remove());

    // Add page number buttons (max 5 pages showing)
    if (maxPage > 1) {
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(maxPage, startPage + 4);

        // Adjust if we're near the end
        if (endPage === maxPage) {
            startPage = Math.max(1, endPage - 4);
        }

        // Insert before the next button
        const nextButton = document.getElementById('nextPageButton');

        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = 'page-item page-number';
            if (i === currentPage) {
                pageItem.classList.add('active');
            }

            const pageLink = document.createElement('a');
            pageLink.className = 'page-link';
            pageLink.href = '#';
            pageLink.textContent = i;
            pageLink.dataset.page = i;

            pageLink.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = parseInt(e.target.dataset.page);
                updateTable();
            });

            pageItem.appendChild(pageLink);
            paginationContainer.insertBefore(pageItem, nextButton);
        }
    }

    // Update prev/next button states
    document.getElementById('prevPageButton').classList.toggle('disabled', currentPage === 1);
    document.getElementById('nextPageButton').classList.toggle('disabled', currentPage >= maxPage);
}

// Theme toggling (assuming theme toggle button exists and function is global or imported)
// function toggleTheme() { ... } - Reuse existing if available

// Load theme preference (assuming function is global or imported)
// function loadThemePreference() { ... } - Reuse existing if available


// Set up event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load theme preference if function exists
    if (typeof loadThemePreference === 'function') {
        loadThemePreference();
    }

    // Fetch initial data
    fetchData();

    // Set up filter handlers
    document.getElementById('nameSearchInput').addEventListener('input', applyFilters);
    document.getElementById('typeFilter').addEventListener('change', applyFilters);
    document.getElementById('environmentFilter').addEventListener('change', applyFilters);

    // Set up page size selector if it exists (currently commented out in HTML)
    const pageSizeSelector = document.getElementById('pageSizeSelector');
    if (pageSizeSelector) {
        pageSizeSelector.addEventListener('change', (e) => {
            itemsPerPage = parseInt(e.target.value);
            currentPage = 1; // Reset to first page
            updateTable();
        });
        // Set initial value from selector
        itemsPerPage = parseInt(pageSizeSelector.value);
    }


    // Set up pagination handlers
    document.getElementById('prevPageButton').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            updateTable();
        }
    });

    document.getElementById('nextPageButton').addEventListener('click', (e) => {
        e.preventDefault();
        const maxPage = Math.ceil(filteredAffiliates.length / itemsPerPage); // Corrected variable name here
        if (currentPage < maxPage) {
            currentPage++;
            updateTable();
        }
    });

    // Set up sorting handlers
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (!field) return; // Ignore if data-sort is missing

            // Toggle direction if same field, otherwise default to asc
            if (field === currentSortField) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortField = field;
                sortDirection = 'asc';
            }

            // Update sort icons
            document.querySelectorAll('th.sortable i').forEach(icon => {
                icon.className = 'fas fa-sort'; // Reset all icons
            });

            const icon = th.querySelector('i');
            if (icon) {
                 icon.className = `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;
            }


            // Apply sort
            sortData();
            updateTable();
        });
    });

     // Add Affiliate button listener (currently disabled, but good to have structure)
    const addAffiliateButton = document.getElementById('addAffiliateButton');
    if (addAffiliateButton) {
        addAffiliateButton.addEventListener('click', () => {
            // Logic to open a modal or navigate to a create page will go here
            console.log('Add Affiliate button clicked (currently disabled)');
            // Example: showCreateAffiliateModal();
        });
    }

});
