// Objectives data management
let allObjectives = [];
let filteredObjectives = [];
let currentPage = 1;
let currentSortField = 'key'; // Default sort by key
let sortDirection = 'asc';
let networkChoices = null; // Choices.js instance for network filter
let focusAreaChoices = null; // Choices.js instance for focus area filter
let externalStatusChoices = null; // Choices.js instance for external status filter

// --- Filter Elements ---
const statusFilter = document.getElementById('statusFilter');
const externalStatusFilter = document.getElementById('externalStatusFilter');
const networkFilter = document.getElementById('networkFilter'); // Choices.js element
const focusAreaFilter = document.getElementById('focusAreaFilter'); // Choices.js element
const searchInput = document.getElementById('searchInput');

// --- Pagination Elements ---
const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
const pageInfo = document.getElementById('pageInfo');
const prevPageButton = document.getElementById('prevPageButton');
const nextPageButton = document.getElementById('nextPageButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const noResults = document.getElementById('noResults');
const tableBody = document.getElementById('objectivesTableBody'); // Updated ID

// Initialize itemsPerPage from the select element, default to 25
let itemsPerPage = parseInt(itemsPerPageSelect?.value, 10) || 25;

// Initialize Choices.js for multi-select dropdowns
function initializeChoices(elementId, placeholder) {
    const element = document.getElementById(elementId);
    if (element) {
        return new Choices(element, {
            removeItemButton: true,
            placeholder: true,
            placeholderValue: placeholder,
            searchPlaceholderValue: 'Search...',
            itemSelectText: '', // Remove "Press to select" text
            allowHTML: false,
        });
    }
    return null;
}

// Fetch objectives data and populate filters
function initializeObjectiveData() {
    // Read the initial state from the table rendered by Jinja.
    if (!tableBody) return;

    const rows = tableBody.querySelectorAll('tr');
    allObjectives = Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 8) return null; // Basic validation for 8 columns

        // Check for the 'no objectives' row
        if (cells.length === 1 && cells[0].getAttribute('colspan') === '8') {
            return null;
        }

        // Helper to parse comma-separated string back to array (trimming whitespace)
        const parseList = (text) => text ? text.split(',').map(s => s.trim()).filter(s => s) : [];

        return {
            key: cells[0].textContent,
            name: cells[1].textContent,
            status: cells[2].textContent,
            main_focus_area: cells[3].textContent,
            focus_areas: parseList(cells[4].textContent), // Parse from rendered string
            external_status: cells[5].textContent,
            networks: parseList(cells[6].textContent), // Parse from rendered string
            test_count: parseInt(cells[7].textContent, 10),
        };
    }).filter(o => o !== null); // Filter out null entries

    filteredObjectives = [...allObjectives]; // Start with all objectives

    // Initialize Choices instances BEFORE populating
    if (!networkChoices) {
        networkChoices = initializeChoices('networkFilter', 'Select Networks...');
    }
     if (!focusAreaChoices) {
         focusAreaChoices = initializeChoices('focusAreaFilter', 'Select Focus Areas...');
     }
     if (!externalStatusChoices) {
         externalStatusChoices = initializeChoices('externalStatusFilter', 'Select External Statuses...');
     }

     // Populate filter dropdowns based on the loaded data
     populateFiltersFromData();

     // Add event listeners for Choices.js filters
     networkFilter?.addEventListener('change', applyFilters, false);
     focusAreaFilter?.addEventListener('change', applyFilters, false);
     externalStatusFilter?.addEventListener('change', applyFilters, false); // Add listener for new Choices filter

     // Apply initial sort and render
     itemsPerPage = parseInt(itemsPerPageSelect?.value, 10) || 25;
    applyFilters(); // This will call updateTable
}

 // Populate filter dropdowns from the available data
 function populateFiltersFromData() {
     // Note: Status is populated by Jinja directly in the HTML

     const networks = new Set();
     const focusAreas = new Set();
     const externalStatuses = new Set();

    allObjectives.forEach(o => {
        o.networks.forEach(net => { if (net && net !== 'N/A') networks.add(net); });
         if (o.main_focus_area && o.main_focus_area !== 'N/A') focusAreas.add(o.main_focus_area);
         o.focus_areas.forEach(fa => { if (fa && fa !== 'N/A') focusAreas.add(fa); });
         if (o.external_status && o.external_status !== 'N/A') externalStatuses.add(o.external_status);
     });

     // Populate Choices.js dropdowns
     populateFilterDropdown(networkChoices, Array.from(networks).sort());
     populateFilterDropdown(focusAreaChoices, Array.from(focusAreas).sort());
     populateFilterDropdown(externalStatusChoices, Array.from(externalStatuses).sort());
 }

// Helper function to populate a filter dropdown (handles both standard select and Choices.js)
function populateFilterDropdown(elementOrChoicesInstance, options) {
    if (!elementOrChoicesInstance) return;

    const choicesOptions = options.map(optionValue => ({
        value: optionValue,
        label: optionValue,
        selected: false, // Default not selected
        disabled: false,
    }));

    if (elementOrChoicesInstance instanceof Choices) {
        // It's a Choices.js instance
        elementOrChoicesInstance.clearStore(); // Clear previous options
        elementOrChoicesInstance.setChoices(choicesOptions, 'value', 'label', true); // Replace choices
    } else if (elementOrChoicesInstance.tagName === 'SELECT') {
        // It's a standard select element (used for Status, ExternalStatus - populated by Jinja)
        // No action needed here as Jinja handles the initial population
    }
}

// --- Function to update pagination controls ---
function updatePaginationControls() {
    if (!pageInfo || !prevPageButton || !nextPageButton) return;

    const totalItems = filteredObjectives.length;
    let totalPages = Math.ceil(totalItems / itemsPerPage);
    totalPages = totalPages === 0 ? 1 : totalPages;

    // Adjust currentPage if it's out of bounds
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalItems} items total)`;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;

    const paginationControls = document.getElementById('paginationControls');
    if (paginationControls) {
        paginationControls.style.display = totalItems > 0 ? 'flex' : 'none'; // Show if any items
    }
}

// Update table with filtered and paginated data
function updateTable() {
    if (!tableBody || !loadingIndicator || !noResults) return;

    // Ensure currentPage is valid before slicing
    const totalItems = filteredObjectives.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredObjectives.slice(startIndex, endIndex);

    tableBody.innerHTML = ''; // Clear existing rows
    if (loadingIndicator) loadingIndicator.classList.add('d-none'); // Hide loading indicator

    if (paginatedItems.length === 0) {
        if (noResults) noResults.classList.remove('d-none');
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center">No objectives found matching your criteria.</td></tr>`; // Adjusted colspan
    } else {
        if (noResults) noResults.classList.add('d-none');
        paginatedItems.forEach(objective => {
            const row = document.createElement('tr');

            // Helper function to create and append cell
            const addCell = (content, isHtml = false) => {
                const cell = document.createElement('td');
                if (isHtml) {
                    cell.innerHTML = content ?? '';
                } else {
                    cell.textContent = content ?? '';
                }
                row.appendChild(cell);
                return cell;
            };

            addCell(objective.key);
            addCell(objective.name);
            addCell(objective.status);
            addCell(objective.main_focus_area);
            addCell(objective.focus_areas.join(', ')); // Join list for display
            addCell(objective.external_status);
            addCell(objective.networks.join(', ')); // Join list for display
            addCell(objective.test_count);

            tableBody.appendChild(row);
        });
    }

    updatePaginationControls(); // Update pagination display
    setupColumnResizing(); // Re-apply column resizing
}

// Apply filters and search
function applyFilters() {
     // Get selected values from Choices.js instances
     const selectedNetworks = networkChoices ? networkChoices.getValue(true) : [];
     const selectedFocusAreas = focusAreaChoices ? focusAreaChoices.getValue(true) : [];
     const selectedExternalStatuses = externalStatusChoices ? externalStatusChoices.getValue(true) : []; // Get values from new Choices instance

     // Get values from standard dropdowns
     const statusFilterValue = statusFilter ? statusFilter.value : '';
     // const externalStatusFilterValue = externalStatusFilter ? externalStatusFilter.value : ''; // Removed - now handled by Choices
     const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

     filteredObjectives = allObjectives.filter(objective => {
         // Standard dropdown checks
         const matchesStatus = statusFilterValue === '' || objective.status === statusFilterValue;
         // const matchesExternalStatus = externalStatusFilterValue === '' || objective.external_status === externalStatusFilterValue; // Removed

         // Multi-select check for networks: Check if selection is empty OR if any selected network is in the objective's networks
         const matchesNetwork = selectedNetworks.length === 0 || selectedNetworks.some(selNet => objective.networks.includes(selNet));

        // Multi-select check for focus areas: Check if selection is empty OR if any selected area matches main OR is in the list
        const matchesFocusArea = selectedFocusAreas.length === 0 || selectedFocusAreas.some(selFA =>
             objective.main_focus_area === selFA || objective.focus_areas.includes(selFA)
         );

         // Multi-select check for external status
         const matchesExternalStatus = selectedExternalStatuses.length === 0 || selectedExternalStatuses.includes(objective.external_status);

         // Search term check
         const matchesSearch = searchTerm === '' ||
             (objective.key && objective.key.toLowerCase().includes(searchTerm)) ||
             (objective.name && objective.name.toLowerCase().includes(searchTerm)) ||
             (objective.status && objective.status.toLowerCase().includes(searchTerm)) ||
             (objective.main_focus_area && objective.main_focus_area.toLowerCase().includes(searchTerm)) ||
             (objective.focus_areas && objective.focus_areas.join(', ').toLowerCase().includes(searchTerm)) ||
             (objective.external_status && objective.external_status.toLowerCase().includes(searchTerm)) ||
             (objective.networks && objective.networks.join(', ').toLowerCase().includes(searchTerm));

         return matchesStatus && matchesExternalStatus && matchesNetwork && matchesFocusArea && matchesSearch;
     });

    sortObjectives(); // Sort the newly filtered list
    currentPage = 1; // Reset to first page after filtering
    updateTable(); // Update table display
}

// Sort objectives
function sortObjectives() {
    filteredObjectives.sort((a, b) => {
        // Handle null/undefined values gracefully for sorting
        let valA = a[currentSortField] ?? '';
        let valB = b[currentSortField] ?? '';

        // Special handling for numeric sort (test_count)
        if (currentSortField === 'test_count') {
            valA = Number(valA);
            valB = Number(valB);
        }
        // Convert to lowercase for case-insensitive string comparison
        else if (typeof valA === 'string') {
             valA = valA.toLowerCase();
        }
        if (typeof valB === 'string') {
             valB = valB.toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

// Theme toggling (Keep as is)
function toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? '' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Column resizing functionality (Keep as is, uses '.test-cases-table')
function setupColumnResizing() {
    const table = document.querySelector('.test-cases-table');
    if (!table) return;
    const headers = table.querySelectorAll('th');

    headers.forEach(header => {
        // Check if resize handle already exists and remove if necessary
        const existingHandle = header.querySelector('.resize-handle');
        if (existingHandle) {
             existingHandle.remove();
        }

        // Only add handle to sortable columns (or all if desired)
        if (header.classList.contains('sortable') || header.hasAttribute('data-sort')) {
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'resize-handle';
            header.appendChild(resizeHandle);
            let startX, startWidth;

            resizeHandle.addEventListener('mousedown', function(e) {
                startX = e.pageX;
                startWidth = header.offsetWidth;
                document.addEventListener('mousemove', resize);
                document.addEventListener('mouseup', stopResize);
                e.preventDefault(); // Prevent text selection during drag
                e.stopPropagation(); // Prevent triggering sort
            });

            function resize(e) {
                const width = Math.max(50, startWidth + (e.pageX - startX)); // Ensure min width 50px
                header.style.width = `${width}px`;
                header.style.minWidth = `${width}px`; // Set minWidth as well
            }

            function stopResize() {
                document.removeEventListener('mousemove', resize);
                document.removeEventListener('mouseup', stopResize);
            }
        }
    });
}


// Check for saved theme preference (Keep as is)
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference();
    initializeObjectiveData(); // Initialize data from rendered table

     // Filter listeners
     if (statusFilter) statusFilter.addEventListener('change', applyFilters);
     // if (externalStatusFilter) externalStatusFilter.addEventListener('change', applyFilters); // Removed - handled by Choices listener
     // Choices.js listeners are added in initializeObjectiveData
     if (searchInput) searchInput.addEventListener('input', applyFilters);

    // Pagination listeners
    if (itemsPerPageSelect) {
        itemsPerPageSelect.addEventListener('change', () => {
            itemsPerPage = parseInt(itemsPerPageSelect.value, 10);
            currentPage = 1;
            updateTable();
        });
    }
    if (prevPageButton) {
        prevPageButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateTable();
            }
        });
    }
    if (nextPageButton) {
        nextPageButton.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredObjectives.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                updateTable();
            }
        });
    }

    // Sorting listeners
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', (e) => {
            // Prevent sorting if click was on resize handle
            if (e.target.classList.contains('resize-handle')) return;

            const field = th.dataset.sort;
            if (!field) return;

            if (field === currentSortField) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortField = field;
                sortDirection = 'asc';
            }

            // Update sort icons
            document.querySelectorAll('th.sortable i').forEach(icon => icon.className = 'fas fa-sort');
            const icon = th.querySelector('i');
            if (icon) icon.className = `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;

            sortObjectives();
            updateTable();
        });
    });

    // Initial sort icon update
    const initialSortHeader = document.querySelector(`th[data-sort="${currentSortField}"]`);
    if (initialSortHeader) {
        const icon = initialSortHeader.querySelector('i');
        if (icon) icon.className = `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;
    }

    setupColumnResizing(); // Initial setup for column resizing

    // Export to Excel listener
    const exportButton = document.getElementById('exportExcelButton');
    if (exportButton) {
        exportButton.addEventListener('click', exportTableToExcel);
    }
});

// Function to export filtered data to Excel
function exportTableToExcel() {
    console.log("Exporting Objectives to Excel..."); // Log start

    // 1. Prepare data for SheetJS
    const dataToExport = [
        // Headers
        ["Key", "Name", "Status", "Main Focus Area", "Focus Areas", "External Status", "Networks", "Test Count"]
    ];

    // Add filtered data rows
    filteredObjectives.forEach(o => {
        dataToExport.push([
            o.key,
            o.name,
            o.status,
            o.main_focus_area,
            o.focus_areas.join(', '), // Join array for Excel cell
            o.external_status,
            o.networks.join(', '), // Join array for Excel cell
            o.test_count
        ]);
    });

    console.log(`Prepared ${dataToExport.length - 1} objective rows for export.`); // Log row count

    try {
        // 2. Create a workbook and worksheet
        const ws = XLSX.utils.aoa_to_sheet(dataToExport);

        // Optional: Set column widths
        ws['!cols'] = [
            { wch: 20 }, // Key
            { wch: 50 }, // Name
            { wch: 15 }, // Status
            { wch: 25 }, // Main Focus Area
            { wch: 40 }, // Focus Areas
            { wch: 20 }, // External Status
            { wch: 40 }, // Networks
            { wch: 12 }  // Test Count
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Objectives"); // Name the sheet

        // 3. Generate Excel file and trigger download
        const filename = `objectives_export_${new Date().toISOString().slice(0,10)}.xlsx`;
        XLSX.writeFile(wb, filename);
        console.log(`Successfully triggered download for ${filename}`); // Log success

    } catch (error) {
        console.error("Error exporting objectives to Excel:", error);
        alert("An error occurred while exporting the data to Excel.");
    }
}
