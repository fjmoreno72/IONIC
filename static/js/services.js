// Service and GP data management
let allServices = [];
let allGps = {}; // Store GPs by ID for easy lookup
let filteredServices = [];
let currentPage = 1;
let itemsPerPage = 25; // Default items per page (can be adjusted if needed)
let currentSortField = 'id'; // Default sort field
let sortDirection = 'asc'; // Default sort direction

// Fetch services and GPs data
async function fetchData() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResultsDiv = document.getElementById('noResults');
    loadingIndicator.style.display = 'block'; // Show loading indicator
    noResultsDiv.classList.add('d-none'); // Hide no results message

    try {
        // Fetch both services and GPs data concurrently
        const [servicesResponse, gpsResponse] = await Promise.all([
            fetch('/api/asc_services'), // Endpoint for services
            fetch('/api/asc_gps')      // Endpoint for GPs
        ]);

        if (!servicesResponse.ok) {
            throw new Error(`Failed to fetch services data: ${servicesResponse.statusText}`);
        }
        if (!gpsResponse.ok) {
            throw new Error(`Failed to fetch GPs data: ${gpsResponse.statusText}`);
        }

        const servicesData = await servicesResponse.json();
        const gpsData = await gpsResponse.json();

        // Process GPs into a lookup object
        allGps = gpsData.reduce((acc, gp) => {
            acc[gp.id] = gp;
            return acc;
        }, {});

        // Process services data, mapping GP names
        allServices = servicesData.map(service => ({
            ...service,
            // Ensure gps is always an array
            gps: Array.isArray(service.gps) ? service.gps : [],
            // Map GP IDs to names for display and sorting
            gpsNames: (Array.isArray(service.gps) ? service.gps : [])
                        .map(gpId => allGps[gpId]?.name || gpId) // Get name or use ID if not found
                        .join(', ') // Join names for display/sorting
        }));

        applyFilters(); // Apply initial filters and display data

    } catch (error) {
        console.error('Error fetching ASC data:', error);
        loadingIndicator.style.display = 'none';
        noResultsDiv.classList.remove('d-none');
        noResultsDiv.textContent = 'Error loading services data. Please try again later.';
    } finally {
         loadingIndicator.style.display = 'none'; // Ensure loading indicator is hidden
    }
}

// Update table with filtered and paginated data
function updateTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredServices.length);
    const tableBody = document.getElementById('servicesTableBody');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const noResultsDiv = document.getElementById('noResults');

    // Clear existing rows
    tableBody.innerHTML = '';

    // Hide loading indicator
    loadingIndicator.style.display = 'none';

    // Show no results message if needed
    if (filteredServices.length === 0) {
        noResultsDiv.classList.remove('d-none');
        noResultsDiv.textContent = 'No services found matching your criteria.';
    } else {
        noResultsDiv.classList.add('d-none');

        // Add rows for current page
        for (let i = startIndex; i < endIndex; i++) {
            const service = filteredServices[i];
            const row = document.createElement('tr');

            // ID Column
            const idCell = document.createElement('td');
            idCell.className = 'id-column';
            idCell.textContent = service.id || 'N/A';

            // Name Column
            const nameCell = document.createElement('td');
            nameCell.textContent = service.name || 'N/A';

            // Spiral Column
            const spiralCell = document.createElement('td');
            spiralCell.className = 'spiral-column';
            spiralCell.textContent = service.spiral || 'N/A';

            // Icon Column
            const iconCell = document.createElement('td');
            iconCell.className = 'icon-column icon-cell'; // Added icon-cell for styling
            if (service.iconPath) {
                const iconImg = document.createElement('img');
                // Assuming icon paths are relative to the static/ASC directory
                iconImg.src = `/static/ASC/${service.iconPath.replace('./', '')}`;
                iconImg.alt = `${service.name} Icon`;
                // iconImg.className = 'service-icon'; // Add class if specific styling needed
                iconCell.appendChild(iconImg);
            } else {
                iconCell.textContent = 'No Icon';
            }

            // GPs Column
            const gpsCell = document.createElement('td');
            gpsCell.className = 'gps-column';
            gpsCell.textContent = service.gpsNames || 'No GPs'; // Use pre-formatted names

            // Add cells to row
            row.appendChild(idCell);
            row.appendChild(nameCell);
            row.appendChild(spiralCell);
            row.appendChild(iconCell);
            row.appendChild(gpsCell);

            // Add row to table
            tableBody.appendChild(row);
        }
    }

    // Update pagination info
    document.getElementById('currentRangeStart').textContent = filteredServices.length > 0 ? startIndex + 1 : 0;
    document.getElementById('currentRangeEnd').textContent = endIndex;
    document.getElementById('totalItems').textContent = filteredServices.length;

    // Update pagination controls
    updatePagination();
}

// Apply filters and search
function applyFilters() {
    const nameSearchTerm = document.getElementById('nameSearchInput').value.toLowerCase();

    filteredServices = allServices.filter(service => {
        const matchesName = nameSearchTerm === '' ||
            (service.name && service.name.toLowerCase().includes(nameSearchTerm)) ||
            (service.id && service.id.toLowerCase().includes(nameSearchTerm)); // Also search by ID

        // Add other filters here if needed in the future
        // const matchesSpiral = spiralFilterValue === '' || service.spiral === spiralFilterValue;

        return matchesName; // && matchesSpiral etc.
    });

    // Sort filtered data
    sortData();

    // Reset to first page
    currentPage = 1;
    updateTable();
}

// Sort service data
function sortData() {
    filteredServices.sort((a, b) => {
        let valA = a[currentSortField];
        let valB = b[currentSortField];

        // Use pre-formatted gpsNames for sorting GPs column
        if (currentSortField === 'gps') {
            valA = a.gpsNames || '';
            valB = b.gpsNames || '';
        }

        // General string comparison
        if (typeof valA === 'string') {
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

// Update pagination controls (mostly unchanged from affiliates)
function updatePagination() {
    const maxPage = Math.ceil(filteredServices.length / itemsPerPage);
    const paginationContainer = document.getElementById('paginationContainer');
    // Remove old page number buttons before adding new ones
    const existingPageButtons = paginationContainer.querySelectorAll('.page-number');
    existingPageButtons.forEach(button => button.remove());


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
            pageItem.className = 'page-item page-number'; // Added page-number class
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

// Theme toggling functions (unchanged)
const THEME_KEY = 'themePreference';

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
}

function loadThemePreference() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light'; // Default to light
    document.documentElement.setAttribute('data-theme', savedTheme);
}


// Set up event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Load theme preference
    loadThemePreference();

    // Fetch initial data
    fetchData();

    // Set up filter handlers
    document.getElementById('nameSearchInput').addEventListener('input', applyFilters);
    // Removed listeners for type/environment filters

    // Set up page size selector if it exists (currently commented out in HTML)
    const pageSizeSelector = document.getElementById('pageSizeSelector');
    if (pageSizeSelector) {
        pageSizeSelector.addEventListener('change', (e) => {
            itemsPerPage = parseInt(e.target.value);
            currentPage = 1; // Reset to first page
            updateTable();
        });
        // Set initial value from selector if needed
        // itemsPerPage = parseInt(pageSizeSelector.value);
    } else {
        itemsPerPage = 25; // Default if selector not present
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
        const maxPage = Math.ceil(filteredServices.length / itemsPerPage);
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

     // Add Service button listener (currently disabled)
    const addServiceButton = document.getElementById('addServiceButton');
    if (addServiceButton) {
        addServiceButton.addEventListener('click', () => {
            console.log('Add Service button clicked (currently disabled)');
            // Logic to open a modal or navigate to a create page would go here
        });
    }

});
