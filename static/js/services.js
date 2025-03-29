document.addEventListener('DOMContentLoaded', function() {
    const servicesTableBody = document.getElementById('servicesTableBody');
    const searchInput = document.getElementById('nameSearchInput'); // Assuming ID from HTML
    // New pagination elements
    const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
    const pageInfo = document.getElementById('pageInfo');
    const prevPageButton = document.getElementById('prevPageButton'); // Reusing ID
    const nextPageButton = document.getElementById('nextPageButton'); // Reusing ID
    // Old elements no longer needed: paginationContainer, currentRangeStart, currentRangeEnd, totalItems
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResults = document.getElementById('noResults');

    let allServices = [];
    let allGps = []; // To store GP data
    let gpIdToNameMap = {}; // To store ID -> Name mapping
    let filteredServices = [];
    let currentPage = 1;
    let itemsPerPage = parseInt(itemsPerPageSelect.value, 10); // Read from new select
    let currentSortField = 'id'; // Default sort field
    let sortDirection = 'asc'; // Default sort direction

    // Function to render the table rows
    function renderTable() {
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (noResults) noResults.classList.add('d-none');
        servicesTableBody.innerHTML = '';

        // Remove setTimeout simulation
        // const startIndex = (currentPage - 1) * itemsPerPage;
        // const endIndex = Math.min(startIndex + itemsPerPage, filteredServices.length);

        if (filteredServices.length === 0) {
            if (noResults) noResults.classList.remove('d-none');
            servicesTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No services found matching your criteria.</td></tr>'; // Colspan is 5
        } else {
            if (noResults) noResults.classList.add('d-none');
            // Calculate items for the current page
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedItems = filteredServices.slice(startIndex, endIndex);

            paginatedItems.forEach(service => { // Use forEach on paginated items
                const row = document.createElement('tr');
                const iconHtml = service.iconPath
                        ? `<img src="/static/ASC/${service.iconPath.replace('./', '')}" alt="${service.name || 'Icon'}" class="icon-cell">` // Use icon-cell class if defined
                        : 'No Icon';

                    // --- GP Name Lookup ---
                    let gpNames = [];
                    if (service.gps && Array.isArray(service.gps)) {
                        gpNames = service.gps
                            .map(gpId => gpIdToNameMap[gpId]) // Get name from map
                            .filter(name => name); // Filter out undefined/null names (IDs not found)
                    }
                    const gpsList = gpNames.join(', '); // Join the found names
                    // --- End GP Name Lookup ---

                    row.innerHTML = `
                        <td>${service.id || ''}</td>
                        <td>${service.name || ''}</td>
                        <td class="spiral-column">${service.spiral || ''}</td>
                        <td>${gpsList}</td>
                        <td class="icon-column text-center">${iconHtml}</td>
                `; // Removed duplicated gpsList TD
                servicesTableBody.appendChild(row);
            });
        }

        if (loadingIndicator) loadingIndicator.style.display = 'none';
        // Remove old pagination calls
        // if (currentRangeStart) updatePaginationInfo(startIndex, endIndex, filteredServices.length);
        // if (paginationContainer) updatePaginationControls(filteredServices.length);
        updatePaginationControls(); // Call new function
         // Setup resizing after table is potentially re-rendered
        setupColumnResizing();
    }

    // Function to apply filters and search
    function applyFiltersAndSearch() {
        const searchTerm = searchInput.value.toLowerCase();

        filteredServices = allServices.filter(service => {
            const nameMatch = service.name?.toLowerCase().includes(searchTerm) || service.id?.toLowerCase().includes(searchTerm);
            const gpsMatch = service.gps ? service.gps.join(', ').toLowerCase().includes(searchTerm) : false;
            const spiralMatch = String(service.spiral || '').toLowerCase().includes(searchTerm);
            return nameMatch || gpsMatch || spiralMatch;
        });

        sortData(); // Apply current sort order
        currentPage = 1;
        renderTable();
    }

     // Function to sort data
    function sortData() {
        filteredServices.sort((a, b) => {
            let valA = a[currentSortField];
            let valB = b[currentSortField];

            // Handle array fields like 'gps'
            if (Array.isArray(valA)) valA = valA.join(', ');
            if (Array.isArray(valB)) valB = valB.join(', ');

            // Ensure consistent type for comparison
            valA = valA === null || valA === undefined ? '' : String(valA).toLowerCase();
            valB = valB === null || valB === undefined ? '' : String(valB).toLowerCase();

            // Special handling for numeric sort if needed (e.g., spiral)
            if (currentSortField === 'spiral') {
                 valA = parseFloat(valA) || 0;
                 valB = parseFloat(valB) || 0;
            }


            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // New updatePaginationControls function (from gps.js/affiliates.js)
    function updatePaginationControls() {
        const totalItems = filteredServices.length;
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

    // Fetch service and GP data
    Promise.all([
        fetch('/static/ASC/data/services.json').then(res => {
            if (!res.ok) throw new Error(`HTTP error fetching services! status: ${res.status}`);
            return res.json();
        }),
        fetch('/static/ASC/data/gps.json').then(res => {
            if (!res.ok) throw new Error(`HTTP error fetching GPs! status: ${res.status}`);
            return res.json();
        })
    ])
    .then(([servicesData, gpsData]) => {
        allServices = servicesData;
        allGps = gpsData;

        // Create the GP ID to Name map
        gpIdToNameMap = allGps.reduce((map, gp) => {
            if (gp.id && gp.name) {
                map[gp.id] = gp.name;
            }
            return map;
        }, {});

        itemsPerPage = parseInt(itemsPerPageSelect.value, 10); // Ensure itemsPerPage is current
        applyFiltersAndSearch(); // Initial filter, sort, and render
    })
    .catch(error => {
        console.error('Error fetching data:', error);
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            if (noResults) {
                noResults.classList.remove('d-none');
                noResults.textContent = 'Error loading data.';
            }
            servicesTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading data. Please check console.</td></tr>'; // Colspan 5
    });

     // Add event listeners
    searchInput.addEventListener('input', applyFiltersAndSearch);

    // New event listeners for pagination controls
    itemsPerPageSelect.addEventListener('change', () => {
        itemsPerPage = parseInt(itemsPerPageSelect.value, 10);
        currentPage = 1; // Reset to first page
        renderTable(); // Re-render with new items per page
    });

    prevPageButton.addEventListener('click', () => { // No need for e.preventDefault()
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextPageButton.addEventListener('click', () => { // No need for e.preventDefault()
        const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });
    // Remove old pagination number link listeners

     // Add sorting event listeners
    document.querySelectorAll('.services-table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (!field) return;

            if (field === currentSortField) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortField = field;
                sortDirection = 'asc';
            }

            // Update sort icons
            document.querySelectorAll('.services-table th.sortable i').forEach(icon => icon.className = 'fas fa-sort');
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
    const table = document.querySelector('.services-table'); // Target the services table
    if (!table) return; // Exit if table not found

    const headers = table.querySelectorAll('th');

    headers.forEach(header => {
        // Skip icon column if needed
        if (header.classList.contains('icon-column')) {
            // return;
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
