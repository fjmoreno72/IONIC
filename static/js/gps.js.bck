document.addEventListener('DOMContentLoaded', function() {
    const gpsTableBody = document.getElementById('gpsTableBody');
    const searchInput = document.getElementById('searchInput');
    const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
    const pageInfo = document.getElementById('pageInfo');
    const prevPageButton = document.getElementById('prevPageButton');
    const nextPageButton = document.getElementById('nextPageButton');

    let allGps = []; // To store all fetched gps data
    let filteredGps = []; // To store filtered data for rendering
    let currentSortField = 'id'; // Default sort field
    let sortDirection = 'asc'; // Default sort direction
    let currentPage = 1;
    let itemsPerPage = parseInt(itemsPerPageSelect.value, 10); // Get initial value

    // Function to update pagination controls (Copied and adapted from sps.js)
    function updatePaginationControls() {
        const totalItems = filteredGps.length;
        let totalPages = Math.ceil(totalItems / itemsPerPage); // Use let
        totalPages = totalPages === 0 ? 1 : totalPages; // Ensure at least 1 page

        pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalItems} items total)`;

        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;

        // Hide controls if only one page and few items (optional)
        const paginationControls = document.getElementById('paginationControls');
        if (paginationControls) {
            paginationControls.style.display = totalItems <= itemsPerPage && totalPages <= 1 ? 'none' : 'flex';
        }
    }

    // Function to render the table rows with pagination
    function renderTable() {
        gpsTableBody.innerHTML = ''; // Clear existing rows

        if (!filteredGps || filteredGps.length === 0) {
            gpsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No GPs found matching your criteria.</td></tr>'; // Colspan is 4
            updatePaginationControls(); // Update controls even if no data
            return;
        }

        // Calculate items for the current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = filteredGps.slice(startIndex, endIndex);

        // Loop through the paginated data
        paginatedItems.forEach(gp => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${gp.id || ''}</td>
                <td>${gp.name || ''}</td>
                <td>${gp.description || ''}</td>
                <td>${gp.iconPath ? `<img src="/static/ASC/${gp.iconPath.replace('./', '')}" alt="${gp.name || 'Icon'}" class="icon-img">` : ''}</td>
            `;
            // Removed duplicated lines below
            gpsTableBody.appendChild(row);
        });

        updatePaginationControls(); // Update page info and button states
        setupColumnResizing(); // Setup resizing after table is rendered
    }

    // Function to sort data
    function sortData() {
        filteredGps.sort((a, b) => {
            let valA = a[currentSortField];
            let valB = b[currentSortField];

            // Handle specific fields if needed (e.g., iconPath might need special handling if sorting by it)
            // For now, treat all as strings for simplicity
            valA = valA === null || valA === undefined ? '' : String(valA).toLowerCase();
            valB = valB === null || valB === undefined ? '' : String(valB).toLowerCase();

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Function to filter data based on search input AND apply sorting
    function filterData() {
        const searchTerm = searchInput.value.toLowerCase();
        // Update the global filteredGps array
        filteredGps = allGps.filter(gp => {
            return (gp.id?.toLowerCase() || '').includes(searchTerm) ||
                   (gp.name?.toLowerCase() || '').includes(searchTerm) ||
                   (gp.description?.toLowerCase() || '').includes(searchTerm);
        });
        currentPage = 1; // Reset to first page on filter change
        sortData(); // Apply current sort order
        renderTable(); // Render the sorted, filtered, and paginated data
    }

    // Fetch GP data from the JSON file
    fetch('/static/ASC/data/gps.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            allGps = data; // Store the full dataset
            itemsPerPage = parseInt(itemsPerPageSelect.value, 10); // Ensure itemsPerPage is current
            filterData(); // Initial filter, sort, and render
        })
        .catch(error => {
            console.error('Error fetching GP data:', error);
            gpsTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading data.</td></tr>';
        });

    // Add event listener for the search input
    searchInput.addEventListener('input', filterData);

    // Add sorting event listeners (similar to services.js)
    document.querySelectorAll('.table th.sortable').forEach(th => { // Target the correct table/headers
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
            document.querySelectorAll('.table th.sortable i').forEach(icon => icon.className = 'fas fa-sort'); // Use correct selector
            const icon = th.querySelector('i');
            if (icon) icon.className = `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;

            filterData(); // Re-filter, re-sort, and re-render with new sort
        });
    });

    // Add event listeners for pagination controls (Copied from sps.js)
    itemsPerPageSelect.addEventListener('change', () => {
        itemsPerPage = parseInt(itemsPerPageSelect.value, 10);
        currentPage = 1; // Reset to first page
        renderTable(); // Re-render with new items per page
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextPageButton.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredGps.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
        }
    });

    // --- Dark Mode Handling ---
    const applyDarkMode = (isDark) => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : '');
        document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    };
    const storedDarkMode = localStorage.getItem('theme') === 'dark';
    applyDarkMode(storedDarkMode);
    window.addEventListener('darkModeChanged', (event) => {
        applyDarkMode(event.detail.isDark);
    });

    // Ensure the Add GP button remains disabled (already set in HTML, but good practice)
    const addGpButton = document.getElementById('addGpButton');
    if (addGpButton) {
        addGpButton.disabled = true;
    }

    // Initial call for resizing setup (in case fetch fails or is empty)
    setupColumnResizing();
});

// Theme toggling function
function toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? '' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Also update Bootstrap theme
    document.documentElement.setAttribute('data-bs-theme', theme === 'dark' ? 'dark' : 'light');
}

// --- Column Resizing Functionality (from test_case.js) ---
function setupColumnResizing() {
    // Use the specific table selector for this page
    const table = document.querySelector('.table'); // More generic selector for this page's table
    if (!table) return; // Exit if table not found

    const headers = table.querySelectorAll('th');

    headers.forEach(header => {
        // Check if handle already exists to avoid duplicates on re-render
        if (header.querySelector('.resize-handle')) {
            return;
        }

        // Create and append resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        header.appendChild(resizeHandle);

        let startX, startWidth;

        const mouseMoveHandler = (e) => {
             // Calculate new width, ensuring it doesn't go below a minimum (e.g., 10px) - LOWERED MINIMUM
            const width = Math.max(10, startWidth + (e.pageX - startX));
            header.style.width = `${width}px`;
            // Optionally set minWidth as well to maintain size after interaction
            header.style.minWidth = `${width}px`;
        };

        const mouseUpHandler = () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
             // Optional: Re-enable text selection if disabled during drag
             document.body.style.userSelect = '';
        };

        resizeHandle.addEventListener('mousedown', function(e) {
            startX = e.pageX;
            startWidth = header.offsetWidth;

            // Add mousemove and mouseup event listeners to the document
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);

            // Optional: Disable text selection during resize for smoother experience
            document.body.style.userSelect = 'none';

            // Prevent default drag behavior
            e.preventDefault();
        });
    });
}
