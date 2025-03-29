document.addEventListener('DOMContentLoaded', function() {
    const gpsTableBody = document.getElementById('gpsTableBody');
    const searchInput = document.getElementById('searchInput');
    let allGps = []; // To store all fetched gps data

    // Function to render the table rows
    function renderTable(gpsData) {
        gpsTableBody.innerHTML = ''; // Clear existing rows
        if (!gpsData || gpsData.length === 0) {
            gpsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No GPs found.</td></tr>';
            return;
        }
        gpsData.forEach(gp => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${gp.id || ''}</td>
                <td>${gp.name || ''}</td>
                <td>${gp.description || ''}</td>
                <td>${gp.iconPath ? `<img src="/static/ASC/${gp.iconPath.replace('./', '')}" alt="${gp.name || 'Icon'}" class="icon-img">` : ''}</td>
            `;
            gpsTableBody.appendChild(row);
        });
        // Setup resizing after table is potentially re-rendered
        setupColumnResizing();
    }

    // Function to filter data based on search input
    function filterData() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredGps = allGps.filter(gp => {
            return (gp.id?.toLowerCase() || '').includes(searchTerm) ||
                   (gp.name?.toLowerCase() || '').includes(searchTerm) ||
                   (gp.description?.toLowerCase() || '').includes(searchTerm);
        });
        renderTable(filteredGps);
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
            renderTable(allGps); // Initial render calls renderTable which calls setupColumnResizing
        })
        .catch(error => {
            console.error('Error fetching GP data:', error);
            gpsTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading data.</td></tr>';
        });

    // Add event listener for the search input
    searchInput.addEventListener('input', filterData);

    // --- Dark Mode Handling (from affiliates.js/services.js pattern) ---
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

    // Ensure the Add GP button remains disabled (already set in HTML, but good practice)
    const addGpButton = document.getElementById('addGpButton');
    if (addGpButton) {
        addGpButton.disabled = true;
    }

    // Initial call for resizing setup (in case fetch fails or is empty)
    setupColumnResizing();
});

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
