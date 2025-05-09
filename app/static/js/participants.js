// Participants data management
let allParticipants = [];
let filteredParticipants = [];
let currentPage = 1;
let currentSortField = 'name'; // Default sort by name
let sortDirection = 'asc';
let statusChoices = null; // Choices.js instance for status filter

// --- Filter Elements ---
const nationFilter = document.getElementById('nationFilter');
const statusFilter = document.getElementById('statusFilter');
const searchInput = document.getElementById('searchInput');

// --- Pagination Elements ---
const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
const pageInfo = document.getElementById('pageInfo');
const prevPageButton = document.getElementById('prevPageButton');
const nextPageButton = document.getElementById('nextPageButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const noResults = document.getElementById('noResults');
const tableBody = document.getElementById('participantsTableBody'); // Updated ID

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


// Fetch participants data and populate filters
// NOTE: This assumes the backend provides the data directly, not via a separate API call like test_results.
// If an API call is needed later, this function will need to be updated similar to test_results.js fetchData.
function initializeParticipantData() {
    // Try to get data embedded by Jinja (if applicable) or assume it's available globally
    // For this implementation, we assume the data is rendered directly into the table by Jinja.
    // We just need to read the initial state from the table for filtering/sorting/pagination.

    if (!tableBody) return;

    const rows = tableBody.querySelectorAll('tr');
    allParticipants = Array.from(rows).map(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 8) return null; // Updated validation to expect 8 columns

        // Check for the 'no participants' row
        if (cells.length === 1 && cells[0].getAttribute('colspan') === '8') { // Updated colspan check
            return null;
        }

        const testCountCell = cells[4];
        const testCount = parseInt(testCountCell.textContent, 10);
        const isIssue = testCountCell.classList.contains('test-count-issue'); // Check if the issue class is present
        
        // Get the new role-specific counts
        const coordinatorCount = parseInt(cells[5].textContent, 10) || 0;
        const partnerCount = parseInt(cells[6].textContent, 10) || 0;
        const observerCount = parseInt(cells[7].textContent, 10) || 0;

        return {
            name: cells[0].textContent,
            description: cells[1].innerHTML, // Get innerHTML to preserve potential links/formatting
            nation: cells[2].textContent,
            status: cells[3].textContent,
            test_count: testCount,
            coordinator_count: coordinatorCount,
            partner_count: partnerCount,
            observer_count: observerCount,
            // We need the original status to correctly re-apply the issue class logic if needed
            // The class logic is already handled by Jinja, but good practice for JS-driven tables
        };
    }).filter(p => p !== null); // Filter out null entries (e.g., the 'no participants' row)

    filteredParticipants = [...allParticipants]; // Start with all participants

    // Initialize Choices instance for status filter BEFORE populating
    if (!statusChoices) {
        statusChoices = initializeChoices('statusFilter', 'Select Statuses...');
    }

    // Populate filter dropdowns based on the loaded data
    populateFiltersFromData();

    // Add event listener for Choices.js filter
    statusFilter?.addEventListener('change', applyFilters, false);

    // Apply initial sort and render
    itemsPerPage = parseInt(itemsPerPageSelect?.value, 10) || 25;
    applyFilters(); // This will call updateTable

}

// Populate filter dropdowns from the available data
function populateFiltersFromData() {
    const nations = new Set();
    const statuses = new Set();

    allParticipants.forEach(p => {
        if (p.nation && p.nation !== 'N/A') nations.add(p.nation);
        if (p.status && p.status !== 'N/A') statuses.add(p.status);
    });

    populateFilterDropdown(nationFilter, Array.from(nations).sort()); // Standard select
    populateFilterDropdown(statusChoices, Array.from(statuses).sort()); // Choices instance
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
        // It's a standard select element
        // Clear existing options except the first one ("All...")
        while (elementOrChoicesInstance.options.length > 1) {
            elementOrChoicesInstance.remove(1);
        }
        // Add new options
        options.forEach(optionValue => {
            if (optionValue) { // Avoid adding null/empty options if they exist
                const option = document.createElement('option');
                option.value = optionValue;
                option.textContent = optionValue;
                elementOrChoicesInstance.appendChild(option);
            }
        });
    }
}

// --- Function to update pagination controls ---
function updatePaginationControls() {
    if (!pageInfo || !prevPageButton || !nextPageButton) return;

    const totalItems = filteredParticipants.length;
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
    const totalItems = filteredParticipants.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredParticipants.slice(startIndex, endIndex);

    tableBody.innerHTML = ''; // Clear existing rows
    if (loadingIndicator) loadingIndicator.classList.add('d-none'); // Hide loading indicator

    if (paginatedItems.length === 0) {
        if (noResults) noResults.classList.remove('d-none');
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center">No participants found matching your criteria.</td></tr>`; // Updated colspan to 8
    } else {
        if (noResults) noResults.classList.add('d-none');
        paginatedItems.forEach(participant => {
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

            addCell(participant.name);
            addCell(participant.description, true); // Allow HTML in description
            addCell(participant.nation);
            addCell(participant.status);
            const countCell = addCell(participant.test_count);

            // Apply conditional class for test count issue
            if (participant.test_count === 0 && participant.status !== 'Withdraw') {
                countCell.classList.add('test-count-issue');
            }
            
            // Add the new role-specific counts
            addCell(participant.coordinator_count);
            addCell(participant.partner_count);
            addCell(participant.observer_count);

            tableBody.appendChild(row);
        });
    }

    updatePaginationControls(); // Update pagination display
    setupColumnResizing(); // Re-apply column resizing
}

// Apply filters and search
function applyFilters() {
    // Get selected values from Choices.js instance (returns array of values)
    const selectedStatuses = statusChoices ? statusChoices.getValue(true) : [];

    // Get values from standard dropdowns
    const nationFilterValue = nationFilter ? nationFilter.value : '';
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    filteredParticipants = allParticipants.filter(participant => {
        // Multi-select check for status: Check if array is empty OR if the result's value is included
        const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(participant.status);

        // Standard dropdown check for nation
        const matchesNation = nationFilterValue === '' || participant.nation === nationFilterValue;

        // Search term check
        const matchesSearch = searchTerm === '' ||
            (participant.name && participant.name.toLowerCase().includes(searchTerm)) ||
            (participant.description && participant.description.toLowerCase().includes(searchTerm)) || // Search in HTML content might be basic
            (participant.nation && participant.nation.toLowerCase().includes(searchTerm)) ||
            (participant.status && participant.status.toLowerCase().includes(searchTerm));
            // Not searching test_count directly, but could be added if needed

        return matchesNation && matchesStatus && matchesSearch;
    });

    sortParticipants(); // Sort the newly filtered list
    currentPage = 1; // Reset to first page after filtering
    updateTable(); // Update table display
}

// Sort participants
function sortParticipants() {
    filteredParticipants.sort((a, b) => {
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
    initializeParticipantData(); // Initialize data from rendered table

    // Filter listeners
    if (nationFilter) nationFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
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
            const totalPages = Math.ceil(filteredParticipants.length / itemsPerPage);
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

            sortParticipants();
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
    console.log("Exporting to Excel..."); // Log start

    // 1. Prepare data for SheetJS
    const dataToExport = [
        // Headers
        ["Name", "Description", "Nation", "Status", "Total Tests", "As Coordinator", "As Partner", "As Observer"]
    ];

    // Add filtered data rows
    filteredParticipants.forEach(p => {
        // Basic HTML stripping for description (replace <br> with newline, remove other tags)
        let cleanDescription = p.description || '';
        cleanDescription = cleanDescription.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, '');

        dataToExport.push([
            p.name,
            cleanDescription,
            p.nation,
            p.status,
            p.test_count,
            p.coordinator_count || 0,
            p.partner_count || 0,
            p.observer_count || 0
        ]);
    });

    console.log(`Prepared ${dataToExport.length - 1} rows for export.`); // Log row count

    try {
        // 2. Create a workbook and worksheet
        const ws = XLSX.utils.aoa_to_sheet(dataToExport);

        // Optional: Set column widths (example: set first column width)
        // ws['!cols'] = [{ wch: 30 }, { wch: 50 }, { wch: 15 }, { wch: 20 }, { wch: 15 }]; // Adjust widths as needed

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Participants"); // Name the sheet

        // 3. Generate Excel file and trigger download
        const filename = `participants_export_${new Date().toISOString().slice(0,10)}.xlsx`;
        XLSX.writeFile(wb, filename);
        console.log(`Successfully triggered download for ${filename}`); // Log success

    } catch (error) {
        console.error("Error exporting to Excel:", error);
        // Optionally show an error message to the user
        alert("An error occurred while exporting the data to Excel.");
    }
}
