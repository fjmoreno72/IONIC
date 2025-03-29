document.addEventListener('DOMContentLoaded', function() {
    const affiliatesTableBody = document.getElementById('affiliatesTableBody');
    const nameSearchInput = document.getElementById('nameSearchInput');
    const typeFilter = document.getElementById('typeFilter');
    const environmentFilter = document.getElementById('environmentFilter');
    // New pagination elements
    const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
    const pageInfo = document.getElementById('pageInfo');
    const prevPageButton = document.getElementById('prevPageButton'); // Reusing ID
    const nextPageButton = document.getElementById('nextPageButton'); // Reusing ID
    // Old elements no longer needed: paginationContainer, currentRangeStart, currentRangeEnd, totalItems
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResults = document.getElementById('noResults');

    let allAffiliates = [];
    let filteredAffiliates = [];
    let currentPage = 1;
    let itemsPerPage = parseInt(itemsPerPageSelect.value, 10); // Read from new select
    let currentSortField = 'id'; // Default sort field
    let sortDirection = 'asc'; // Default sort direction

    // Function to render the table rows
    function renderTable() {
        loadingIndicator.style.display = 'block'; // Show loading
        noResults.classList.add('d-none'); // Hide no results
        affiliatesTableBody.innerHTML = ''; // Clear existing rows

        // No need for setTimeout simulation anymore
        // const startIndex = (currentPage - 1) * itemsPerPage;
        // const endIndex = Math.min(startIndex + itemsPerPage, filteredAffiliates.length);

        if (filteredAffiliates.length === 0) {
            noResults.classList.remove('d-none');
            affiliatesTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No affiliates found matching your criteria.</td></tr>'; // Colspan is 5
        } else {
            noResults.classList.add('d-none');
            // Calculate items for the current page
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedItems = filteredAffiliates.slice(startIndex, endIndex);

            paginatedItems.forEach(affiliate => { // Use forEach on paginated items
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${affiliate.id || ''}</td>
                    <td>${affiliate.name || ''}</td>
                    <td>${affiliate.environments ? affiliate.environments.join(', ') : ''}</td>
                    <td class="type-column">${affiliate.type || ''}</td>
                    <td class="flag-column">${affiliate.flagPath ? `<img src="/static/ASC/${affiliate.flagPath.replace('./', '')}" alt="${affiliate.name || 'Flag'}" class="flag-icon">` : ''}</td>
                `; // Removed duplicated environment and type TDs
                affiliatesTableBody.appendChild(row);
            });
        }

        loadingIndicator.style.display = 'none'; // Hide loading
        // updatePaginationInfo(startIndex, endIndex, filteredAffiliates.length); // Remove old call
        updatePaginationControls(); // Call new function
        // Setup resizing after table is potentially re-rendered
        setupColumnResizing();
    }

    // Function to apply filters and search
    function applyFiltersAndSearch() {
        const searchTerm = nameSearchInput.value.toLowerCase();
        const selectedType = typeFilter.value;
        const selectedEnvironment = environmentFilter.value;

        filteredAffiliates = allAffiliates.filter(affiliate => {
            const nameMatch = affiliate.name?.toLowerCase().includes(searchTerm) || affiliate.id?.toLowerCase().includes(searchTerm);
            const typeMatch = selectedType === '' || affiliate.type === selectedType;
            const environmentMatch = selectedEnvironment === '' || (affiliate.environments && affiliate.environments.includes(selectedEnvironment));
            return nameMatch && typeMatch && environmentMatch;
        });

        sortData(); // Apply current sort order
        currentPage = 1; // Reset to first page
        renderTable();
    }

    // Function to sort data (remains the same)
    function sortData() {
        filteredAffiliates.sort((a, b) => {
            let valA = a[currentSortField];
            let valB = b[currentSortField];

            // Handle array fields like 'environments'
            if (Array.isArray(valA)) valA = valA.join(', ');
            if (Array.isArray(valB)) valB = valB.join(', ');

            // Ensure consistent type for comparison (treat null/undefined as empty string)
            valA = valA === null || valA === undefined ? '' : String(valA).toLowerCase();
            valB = valB === null || valB === undefined ? '' : String(valB).toLowerCase();


            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // New updatePaginationControls function (from gps.js)
    function updatePaginationControls() {
        const totalItems = filteredAffiliates.length;
        let totalPages = Math.ceil(totalItems / itemsPerPage);
        totalPages = totalPages === 0 ? 1 : totalPages; // Ensure at least 1 page

        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;

        // Hide controls if only one page and few items (optional)
        const paginationControls = document.getElementById('paginationControls');
        if (paginationControls) {
            paginationControls.style.display = totalItems <= itemsPerPage && totalPages <= 1 ? 'none' : 'flex';
        }
    }

    // Fetch affiliate data
    fetch('/static/ASC/data/affiliates.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            allAffiliates = data;
            itemsPerPage = parseInt(itemsPerPageSelect.value, 10); // Ensure itemsPerPage is current
            applyFiltersAndSearch(); // Initial filter, sort, and render
        })
        .catch(error => {
            console.error('Error fetching affiliate data:', error);
            loadingIndicator.style.display = 'none';
            noResults.classList.remove('d-none');
            noResults.textContent = 'Error loading data.';
        });

    // Add event listeners for controls
    nameSearchInput.addEventListener('input', applyFiltersAndSearch);
    typeFilter.addEventListener('change', applyFiltersAndSearch);
    environmentFilter.addEventListener('change', applyFiltersAndSearch);

    // New event listeners for pagination controls
    itemsPerPageSelect.addEventListener('change', () => {
        itemsPerPage = parseInt(itemsPerPageSelect.value, 10);
        currentPage = 1; // Reset to first page
        renderTable(); // Re-render with new items per page
    });

    prevPageButton.addEventListener('click', () => { // No need for e.preventDefault() on button
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextPageButton.addEventListener('click', () => { // No need for e.preventDefault() on button
        const totalPages = Math.ceil(filteredAffiliates.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });
    // Remove old pagination number link listeners (handled by removing the elements)

    // Add sorting event listeners
    document.querySelectorAll('.affiliates-table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (!field) return; // Ignore if data-sort is missing

            if (field === currentSortField) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortField = field;
                sortDirection = 'asc';
            }

            // Update sort icons
            document.querySelectorAll('.affiliates-table th.sortable i').forEach(icon => icon.className = 'fas fa-sort');
            const icon = th.querySelector('i');
            if (icon) icon.className = `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;

            applyFiltersAndSearch(); // Re-filter and re-render with new sort
        });
    });

    // --- Dark Mode Handling ---
    const applyDarkMode = (isDark) => {
        document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    };
    const storedDarkMode = localStorage.getItem('darkMode');
    applyDarkMode(storedDarkMode === 'true');
    window.addEventListener('darkModeChanged', (event) => {
        applyDarkMode(event.detail.isDark);
    });

    // Initial call for resizing setup
    setupColumnResizing();
});

// --- Column Resizing Functionality (from test_case.js) ---
function setupColumnResizing() {
    // Use the specific table selector for this page
    const table = document.querySelector('.affiliates-table'); // Target the affiliates table
    if (!table) return; // Exit if table not found

    const headers = table.querySelectorAll('th');

    headers.forEach(header => {
        // Skip flag column or others if needed
        if (header.classList.contains('flag-column')) {
             // return; // Optionally skip resizing for specific columns
        }
        // Check if handle already exists
        if (header.querySelector('.resize-handle')) {
            return;
        }

        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        header.appendChild(resizeHandle);

        let startX, startWidth;

        const mouseMoveHandler = (e) => {
            // Calculate new width, ensuring it doesn't go below a minimum (e.g., 10px) - LOWERED MINIMUM
            const width = Math.max(10, startWidth + (e.pageX - startX));
            header.style.width = `${width}px`;
            header.style.minWidth = `${width}px`;
        };

        const mouseUpHandler = () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            document.body.style.userSelect = '';
        };

        resizeHandle.addEventListener('mousedown', function(e) {
            startX = e.pageX;
            startWidth = header.offsetWidth;
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });
    });
}
