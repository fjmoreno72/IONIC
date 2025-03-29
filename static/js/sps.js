document.addEventListener('DOMContentLoaded', function() {
    const spsTableBody = document.getElementById('spsTableBody');
    const searchInput = document.getElementById('searchInput');
    let allSps = []; // To store all fetched sps data

    // Function to render the table rows
    function renderTable(spsData) {
        spsTableBody.innerHTML = ''; // Clear existing rows
        if (!spsData || spsData.length === 0) {
            spsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No SPs found.</td></tr>'; // Updated colspan
            return;
        }
        spsData.forEach(sp => {
            const row = document.createElement('tr');
            const versions = sp.versions ? sp.versions.join(', ') : ''; // Join versions array
            const iconHtml = sp.iconPath
                ? `<img src="/static/ASC/${sp.iconPath.replace('./', '')}" alt="${sp.name || 'Icon'}" class="icon-img">`
                : 'No Icon'; // Display 'No Icon' if path is missing

            row.innerHTML = `
                <td>${sp.id || ''}</td>
                <td>${sp.name || ''}</td>
                <td>${sp.description || ''}</td>
                <td class="text-center">${iconHtml}</td>
                <td>${versions}</td>
            `;
            spsTableBody.appendChild(row);
        });
        // Setup resizing after table is potentially re-rendered
        setupColumnResizing();
    }

    // Function to filter data based on search input
    function filterData() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredSps = allSps.filter(sp => {
            const versionsString = sp.versions ? sp.versions.join(', ').toLowerCase() : '';
            return (sp.id?.toLowerCase() || '').includes(searchTerm) ||
                   (sp.name?.toLowerCase() || '').includes(searchTerm) ||
                   (sp.description?.toLowerCase() || '').includes(searchTerm) ||
                   versionsString.includes(searchTerm); // Include versions in search
        });
        renderTable(filteredSps);
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
            renderTable(allSps); // Initial render calls renderTable which calls setupColumnResizing
        })
        .catch(error => {
            console.error('Error fetching SP data:', error);
            spsTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading data.</td></tr>'; // Updated colspan
        });

    // Add event listener for the search input
    searchInput.addEventListener('input', filterData);

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
