document.addEventListener('DOMContentLoaded', function() {
    const servicesTableBody = document.getElementById('servicesTableBody');
    const searchInput = document.getElementById('nameSearchInput'); // Assuming ID from HTML
    const paginationContainer = document.getElementById('paginationContainer');
    const prevPageButton = document.getElementById('prevPageButton');
    const nextPageButton = document.getElementById('nextPageButton');
    const currentRangeStart = document.getElementById('currentRangeStart');
    const currentRangeEnd = document.getElementById('currentRangeEnd');
    const totalItems = document.getElementById('totalItems');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResults = document.getElementById('noResults');

    let allServices = [];
    let filteredServices = [];
    let currentPage = 1;
    let itemsPerPage = 25; // Default, assuming similar pagination setup
    let currentSortField = 'id'; // Default sort field
    let sortDirection = 'asc'; // Default sort direction

    // Function to render the table rows
    function renderTable() {
        if (loadingIndicator) loadingIndicator.style.display = 'block';
        if (noResults) noResults.classList.add('d-none');
        servicesTableBody.innerHTML = '';

        setTimeout(() => { // Simulate async loading if needed
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, filteredServices.length);

            if (filteredServices.length === 0) {
                if (noResults) noResults.classList.remove('d-none');
            } else {
                for (let i = startIndex; i < endIndex; i++) {
                    const service = filteredServices[i];
                    const row = document.createElement('tr');
                    const iconHtml = service.iconPath
                        ? `<img src="/static/ASC/${service.iconPath.replace('./', '')}" alt="${service.name || 'Icon'}" class="icon-cell">` // Use icon-cell class if defined
                        : 'No Icon';
                    const gpsList = service.gps ? service.gps.join(', ') : ''; // Join GPs array

                    row.innerHTML = `
                        <td>${service.id || ''}</td>
                        <td>${service.name || ''}</td>
                        <td class="spiral-column">${service.spiral || ''}</td>
                        <td>${gpsList}</td>
                        <td class="icon-column text-center">${iconHtml}</td>
                    `;
                    servicesTableBody.appendChild(row);
                }
            }

            if (loadingIndicator) loadingIndicator.style.display = 'none';
            if (currentRangeStart) updatePaginationInfo(startIndex, endIndex, filteredServices.length);
            if (paginationContainer) updatePaginationControls(filteredServices.length);
             // Setup resizing after table is potentially re-rendered
            setupColumnResizing();
        }, 10);
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

    // Function to update pagination info text
    function updatePaginationInfo(startIndex, endIndex, total) {
        if (!currentRangeStart || !currentRangeEnd || !totalItems) return;
        currentRangeStart.textContent = total > 0 ? startIndex + 1 : 0;
        currentRangeEnd.textContent = endIndex;
        totalItems.textContent = total;
    }

    // Function to update pagination controls
    function updatePaginationControls(total) {
        if (!paginationContainer || !prevPageButton || !nextPageButton) return;
        const maxPage = Math.ceil(total / itemsPerPage);
        paginationContainer.querySelectorAll('.page-number').forEach(btn => btn.remove());

        if (maxPage > 1) {
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(maxPage, startPage + 4);
            if (endPage === maxPage) startPage = Math.max(1, endPage - 4);

            for (let i = startPage; i <= endPage; i++) {
                const pageItem = document.createElement('li');
                pageItem.className = `page-item page-number ${i === currentPage ? 'active' : ''}`;
                const pageLink = document.createElement('a');
                pageLink.className = 'page-link';
                pageLink.href = '#';
                pageLink.textContent = i;
                pageLink.dataset.page = i;
                pageLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentPage = parseInt(e.target.dataset.page);
                    renderTable();
                });
                pageItem.appendChild(pageLink);
                paginationContainer.insertBefore(pageItem, nextPageButton);
            }
        }

        prevPageButton.classList.toggle('disabled', currentPage === 1);
        nextPageButton.classList.toggle('disabled', currentPage >= maxPage);
    }

    // Fetch service data
    fetch('/static/ASC/data/services.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            allServices = data;
            applyFiltersAndSearch(); // Initial filter, sort, and render
        })
        .catch(error => {
            console.error('Error fetching service data:', error);
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            if (noResults) {
                noResults.classList.remove('d-none');
                 noResults.textContent = 'Error loading data.';
             }
              servicesTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading data.</td></tr>'; // Colspan 5 (still 5 columns)
         });

     // Add event listeners
    searchInput.addEventListener('input', applyFiltersAndSearch);

    if (prevPageButton) {
        prevPageButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });
    }

    if (nextPageButton) {
        nextPageButton.addEventListener('click', (e) => {
            e.preventDefault();
            const maxPage = Math.ceil(filteredServices.length / itemsPerPage);
            if (currentPage < maxPage) {
                currentPage++;
                renderTable();
            }
        });
    }

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
