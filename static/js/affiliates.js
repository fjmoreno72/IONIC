document.addEventListener('DOMContentLoaded', function() {
    const affiliatesTableBody = document.getElementById('affiliatesTableBody');
    const nameSearchInput = document.getElementById('nameSearchInput');
    const typeFilter = document.getElementById('typeFilter');
    const environmentFilter = document.getElementById('environmentFilter');
    const paginationContainer = document.getElementById('paginationContainer');
    const prevPageButton = document.getElementById('prevPageButton');
    const nextPageButton = document.getElementById('nextPageButton');
    const currentRangeStart = document.getElementById('currentRangeStart');
    const currentRangeEnd = document.getElementById('currentRangeEnd');
    const totalItems = document.getElementById('totalItems');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResults = document.getElementById('noResults');

    let allAffiliates = [];
    let filteredAffiliates = [];
    let currentPage = 1;
    let itemsPerPage = 25; // Default page size
    let currentSortField = 'id'; // Default sort field
    let sortDirection = 'asc'; // Default sort direction

    // Function to render the table rows
    function renderTable() {
        loadingIndicator.style.display = 'block'; // Show loading
        noResults.classList.add('d-none'); // Hide no results
        affiliatesTableBody.innerHTML = ''; // Clear existing rows

        // Simulate async loading if needed, otherwise proceed directly
        setTimeout(() => {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, filteredAffiliates.length);

            if (filteredAffiliates.length === 0) {
                noResults.classList.remove('d-none');
            } else {
                for (let i = startIndex; i < endIndex; i++) {
                    const affiliate = filteredAffiliates[i];
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${affiliate.id || ''}</td>
                        <td>${affiliate.name || ''}</td>
                        <td>${affiliate.environments ? affiliate.environments.join(', ') : ''}</td>
                        <td class="type-column">${affiliate.type || ''}</td>
                        <td class="flag-column">${affiliate.flagPath ? `<img src="/static/ASC/${affiliate.flagPath.replace('./', '')}" alt="${affiliate.name || 'Flag'}" class="flag-icon">` : ''}</td>
                    `;
                    affiliatesTableBody.appendChild(row);
                }
            }

            loadingIndicator.style.display = 'none'; // Hide loading
            updatePaginationInfo(startIndex, endIndex, filteredAffiliates.length);
            updatePaginationControls(filteredAffiliates.length);
            // Setup resizing after table is potentially re-rendered
            setupColumnResizing();
        }, 10); // Small delay to allow UI update
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

    // Function to sort data
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

    // Function to update pagination info text
    function updatePaginationInfo(startIndex, endIndex, total) {
        currentRangeStart.textContent = total > 0 ? startIndex + 1 : 0;
        currentRangeEnd.textContent = endIndex;
        totalItems.textContent = total;
    }

    // Function to update pagination controls (buttons and numbers)
    function updatePaginationControls(total) {
        const maxPage = Math.ceil(total / itemsPerPage);
        paginationContainer.querySelectorAll('.page-number').forEach(btn => btn.remove()); // Remove old page numbers

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

    // Fetch affiliate data
    fetch('/static/ASC/data/affiliates.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            allAffiliates = data;
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

    prevPageButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderTable();
        }
    });

    nextPageButton.addEventListener('click', (e) => {
        e.preventDefault();
        const maxPage = Math.ceil(filteredAffiliates.length / itemsPerPage);
        if (currentPage < maxPage) {
            currentPage++;
            renderTable();
        }
    });

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
