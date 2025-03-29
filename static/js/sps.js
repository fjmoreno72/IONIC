document.addEventListener('DOMContentLoaded', function() {
    const spsTableBody = document.getElementById('spsTableBody');
    const searchInput = document.getElementById('searchInput');
    let allSps = []; // To store all fetched sps data
    let filteredSps = []; // To store filtered data
    let currentSortField = 'id'; // Default sort field
    let sortDirection = 'asc'; // Default sort direction

    // Function to render the table rows
    function renderTable() { // Removed spsData parameter, uses filteredSps
        spsTableBody.innerHTML = ''; // Clear existing rows
        if (!filteredSps || filteredSps.length === 0) { // Use filteredSps
            spsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No SPs found matching your criteria.</td></tr>'; // Updated colspan and message
            return;
        }
        filteredSps.forEach(sp => { // Use filteredSps
            const row = document.createElement('tr');
            const versions = sp.versions ? sp.versions.join(', ') : ''; // Join versions array
            const iconHtml = sp.iconPath
                ? `<img src="/static/ASC/${sp.iconPath.replace('./', '')}" alt="${sp.name || 'Icon'}" class="icon-img">`
                : 'No Icon'; // Display 'No Icon' if path is missing

            // New column order: ID, Name, Description, Versions, Icon
            row.innerHTML = `
                <td>${sp.id || ''}</td>
                <td>${sp.name || ''}</td>
                <td>${sp.description || ''}</td>
                <td>${versions}</td>
                <td class="text-center">${iconHtml}</td>
            `;
            spsTableBody.appendChild(row);
        });
        // Setup resizing after table is potentially re-rendered
        setupColumnResizing();
    }

    // Function to sort data (similar to gps.js)
    function sortData() {
        filteredSps.sort((a, b) => {
            let valA = a[currentSortField];
            let valB = b[currentSortField];

            // Handle array fields like 'versions'
            if (Array.isArray(valA)) valA = valA.join(', ');
            if (Array.isArray(valB)) valB = valB.join(', ');

            // Ensure consistent type for comparison
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
        // Update the global filteredSps array
        filteredSps = allSps.filter(sp => {
            const versionsString = sp.versions ? sp.versions.join(', ').toLowerCase() : '';
            return (sp.id?.toLowerCase() || '').includes(searchTerm) ||
                   (sp.name?.toLowerCase() || '').includes(searchTerm) ||
                   (sp.description?.toLowerCase() || '').includes(searchTerm) ||
                   versionsString.includes(searchTerm); // Include versions in search
        });
        sortData(); // Apply current sort order
        renderTable(); // Render the sorted and filtered data
    }

    // Fetch SP data from the JSON file
    fetch('/static/ASC/data/sps.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            allSps = data; // Store the full dataset
            filterData(); // Initial filter and sort
        })
        .catch(error => {
            console.error('Error fetching SP data:', error);
            spsTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading data.</td></tr>'; // Updated colspan
        });

    // Add event listener for the search input
    searchInput.addEventListener('input', filterData);

    // Add sorting event listeners (similar to gps.js)
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

            filterData(); // Re-filter and re-render with new sort
        });
    });

    // --- Dark Mode Handling ---
    const applyDarkMode = (isDark) => {
        document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
    };

    // Apply initial dark mode state based on localStorage
    const storedDarkMode = localStorage.getItem('darkMode');
    applyDarkMode(storedDarkMode === 'true');

    // Listen for dark mode changes from nav_menu.js
    window.addEventListener('darkModeChanged', (event) => {
        applyDarkMode(event.detail.isDark);
    });

    // Ensure the Add SP button remains disabled
    const addSpButton = document.getElementById('addSpButton');
    if (addSpButton) {
        addSpButton.disabled = true;
    }

    // Initial call for resizing setup
    setupColumnResizing();
});

// --- Column Resizing Functionality (from test_case.js) ---
function setupColumnResizing() {
    // Use the specific table selector for this page
    const table = document.querySelector('.table'); // Generic selector for this page
    if (!table) return; // Exit if table not found

    const headers = table.querySelectorAll('th');

    headers.forEach(header => {
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
