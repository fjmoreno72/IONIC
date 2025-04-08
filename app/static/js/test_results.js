// Test results data management
let allTestResults = [];
let filteredTestResults = [];
let currentPage = 1;
let currentSortField = 'objectiveKey'; // Default sort
let sortDirection = 'asc';
let objectiveChoices = null; // Choices.js instances
let participantChoices = null;

// --- Filter Elements ---
const objectiveFilter = document.getElementById('objectiveFilter');
const statusFilter = document.getElementById('statusFilter');
const overallResultFilter = document.getElementById('overallResultFilter');
const participantFilter = document.getElementById('participantFilter');
const searchInput = document.getElementById('searchInput');

// --- Pagination Elements ---
const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
const pageInfo = document.getElementById('pageInfo');
const prevPageButton = document.getElementById('prevPageButton');
const nextPageButton = document.getElementById('nextPageButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const noResults = document.getElementById('noResults');
const tableBody = document.getElementById('testResultsTableBody');

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

// Fetch test results data and populate filters
async function fetchData() {
    if (loadingIndicator) loadingIndicator.classList.remove('d-none');
    if (tableBody) tableBody.innerHTML = ''; // Clear table while loading
    if (noResults) noResults.classList.add('d-none');

    try {
        const response = await fetch('/api/test_results_data'); // Fetch from the new endpoint
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Failed to fetch test results data' }));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const apiResponse = await response.json();

        allTestResults = apiResponse.data || []; // Store the results data
        const filters = apiResponse.filters || {}; // Store the filter options

        // Initialize Choices instances before populating
        if (!objectiveChoices) {
            objectiveChoices = initializeChoices('objectiveFilter', 'Select Objectives...');
        }
        if (!participantChoices) {
            participantChoices = initializeChoices('participantFilter', 'Select Participants...');
        }

        // Populate filter dropdowns
        populateFilterDropdown(objectiveChoices, filters.objectives || [], 'objective'); // Pass Choices instance
        populateFilterDropdown(statusFilter, filters.statuses || [], 'status'); // Standard select
        populateFilterDropdown(overallResultFilter, filters.overallResults || [], 'overallResult'); // Standard select
        populateFilterDropdown(participantChoices, filters.participants || [], 'participant'); // Pass Choices instance

        // Add event listeners for Choices.js filters
        objectiveFilter?.addEventListener('change', applyFilters, false);
        participantFilter?.addEventListener('change', applyFilters, false);


        // Apply initial filters and render
        itemsPerPage = parseInt(itemsPerPageSelect?.value, 10) || 25;
        applyFilters(); // This will call updateTable

    } catch (error) {
        console.error('Error fetching data:', error);
        if (loadingIndicator) loadingIndicator.classList.add('d-none');
        if (noResults) {
            noResults.classList.remove('d-none');
            noResults.textContent = `Error loading data: ${error.message}`;
        }
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error loading data: ${error.message}</td></tr>`; // Show error in table
        updatePaginationControls(); // Update controls even on error
    } finally {
         if (loadingIndicator) loadingIndicator.classList.add('d-none');
    }
}

// Helper function to populate a filter dropdown (handles both standard select and Choices.js)
function populateFilterDropdown(elementOrChoicesInstance, options, filterType) {
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

    const totalItems = filteredTestResults.length;
    let totalPages = Math.ceil(totalItems / itemsPerPage);
    totalPages = totalPages === 0 ? 1 : totalPages;

    // Adjust currentPage if it's out of bounds
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalItems} items total)`;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;

    const paginationControls = document.getElementById('paginationControls');
    if (paginationControls) {
        // Show controls only if there's more than one page OR if there are items but fewer than itemsPerPage
        paginationControls.style.display = totalItems > itemsPerPage || (totalItems > 0 && totalPages > 1) ? 'flex' : 'none';
    }
}

// Update table with filtered and paginated data
function updateTable() {
    if (!tableBody || !loadingIndicator || !noResults) return;

    // Ensure currentPage is valid before slicing
    const totalItems = filteredTestResults.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredTestResults.slice(startIndex, endIndex);

    tableBody.innerHTML = ''; // Clear existing rows
    loadingIndicator.classList.add('d-none'); // Hide loading indicator

    if (paginatedItems.length === 0) {
        noResults.classList.remove('d-none');
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No test results found matching your criteria.</td></tr>`; // Adjusted colspan
    } else {
        noResults.classList.add('d-none');
        paginatedItems.forEach(result => {
            const row = document.createElement('tr');

            // Helper function to create and append cell
            const addCell = (content) => {
                const cell = document.createElement('td');
                cell.textContent = content ?? ''; // Use nullish coalescing for default empty string
                row.appendChild(cell);
                return cell;
            };

            addCell(result.objectiveKey);
            addCell(result.testPlanKey);
            addCell(result.testName);
            addCell(result.status);
            addCell(result.coordinator);
            addCell(result.partners?.join(', ')); // Display partners array as string
            addCell(result.overallResult);

            tableBody.appendChild(row);
        });
    }

    updatePaginationControls(); // Update pagination display
    setupColumnResizing(); // Re-apply column resizing
}

// Apply filters and search
function applyFilters() {
    // Get selected values from Choices.js instances (returns array of values)
    const selectedObjectives = objectiveChoices ? objectiveChoices.getValue(true) : [];
    const selectedParticipants = participantChoices ? participantChoices.getValue(true) : [];

    // Get values from standard dropdowns
    const statusFilterValue = statusFilter ? statusFilter.value : '';
    const overallResultFilterValue = overallResultFilter ? overallResultFilter.value : '';
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    filteredTestResults = allTestResults.filter(result => {
        // Multi-select checks: Check if array is empty OR if the result's value is included
        const matchesObjective = selectedObjectives.length === 0 || selectedObjectives.includes(result.objectiveKey);
        const matchesParticipant = selectedParticipants.length === 0 ||
            selectedParticipants.includes(result.coordinator) ||
            (result.partners && result.partners.some(p => selectedParticipants.includes(p)));

        // Standard dropdown checks
        const matchesStatus = statusFilterValue === '' || result.status === statusFilterValue;
        const matchesOverallResult = overallResultFilterValue === '' || result.overallResult === overallResultFilterValue;

        // Search term check (remains the same)
        const matchesSearch = searchTerm === '' ||
            (result.objectiveKey && result.objectiveKey.toLowerCase().includes(searchTerm)) ||
            (result.testPlanKey && result.testPlanKey.toLowerCase().includes(searchTerm)) ||
            (result.testName && result.testName.toLowerCase().includes(searchTerm)) ||
            (result.status && result.status.toLowerCase().includes(searchTerm)) ||
            (result.coordinator && result.coordinator.toLowerCase().includes(searchTerm)) ||
            (result.partners && result.partners.some(p => p.toLowerCase().includes(searchTerm))) ||
            (result.overallResult && result.overallResult.toLowerCase().includes(searchTerm));

        return matchesObjective && matchesStatus && matchesOverallResult && matchesParticipant && matchesSearch;
    });

    sortTestResults(); // Sort the newly filtered list
    currentPage = 1; // Reset to first page after filtering
    updateTable(); // Update table display
}

// Sort test results
function sortTestResults() {
    filteredTestResults.sort((a, b) => {
        // Handle null/undefined values gracefully for sorting
        let valA = a[currentSortField] ?? '';
        let valB = b[currentSortField] ?? '';

        // Convert to lowercase for case-insensitive string comparison
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

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

// Column resizing functionality (Keep as is, but ensure it works with new table)
function setupColumnResizing() {
    const table = document.querySelector('.test-cases-table'); // Keep class or update if changed
    if (!table) return;
    const headers = table.querySelectorAll('th');

    headers.forEach(header => {
        // Check if resize handle already exists
        if (header.querySelector('.resize-handle')) {
             // Remove existing handle before adding a new one to prevent duplicates
             header.querySelector('.resize-handle').remove();
        }
        // Don't add handle to non-sortable columns if desired (e.g., Partners)
        // if (!header.classList.contains('sortable')) return;

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
    fetchData(); // Initial data load and render

    // Filter listeners
    if (objectiveFilter) objectiveFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (overallResultFilter) overallResultFilter.addEventListener('change', applyFilters);
    if (participantFilter) participantFilter.addEventListener('change', applyFilters);
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
            const totalPages = Math.ceil(filteredTestResults.length / itemsPerPage);
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

            sortTestResults();
            updateTable();
        });
    });

    // No modal listeners needed
});
