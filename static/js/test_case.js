// Test case data management
let allTestCases = [];
let filteredTestCases = [];
let currentPage = 1;
let itemsPerPage = 25;
let currentSortField = 'key';
let sortDirection = 'asc';
let latestVersionsByKey = {}; // Store the latest version number for each test case key
let patternMap = {}; // Map pattern ID to pattern name
let fullPatternData = []; // Store full pattern data for role lookup

// Function to determine if a test case is the latest version
function isLatestTestCaseVersion(testCase) {
    // If we don't have any version information, consider it the latest
    if (!latestVersionsByKey[testCase.key]) {
        return true;
    }

    // Compare with stored latest version
    return parseInt(testCase.version) === latestVersionsByKey[testCase.key];
}

// Fetch test cases and patterns data
async function fetchData() {
    try {
        // Fetch patterns first to build the map
        const patternResponse = await fetch('/static/pattern.json');
        if (!patternResponse.ok) {
            throw new Error('Failed to fetch patterns data');
        }
        const patternData = await patternResponse.json();
        fullPatternData = patternData; // Store full data

        // Populate pattern map {id: name}
        patternData.forEach(pattern => {
            patternMap[pattern.id] = pattern.name;
        });

        // Populate pattern filter dropdown
        const patternFilter = document.getElementById('patternFilter');
        const uniquePatterns = new Set();

        // Add all pattern names to a set to get unique values
        patternData.forEach(pattern => {
            uniquePatterns.add(pattern.name);
        });

        // Create and append dropdown options
        uniquePatterns.forEach(patternName => {
            const option = document.createElement('option');
            option.value = patternName;
            option.textContent = patternName;
            patternFilter.appendChild(option);
        });

        // Fetch test cases
        const testCaseResponse = await fetch('/static/test_cases.json');
        if (!testCaseResponse.ok) {
            throw new Error('Failed to fetch test cases data');
        }
        const testCaseData = await testCaseResponse.json();

        // Process the test case data
        allTestCases = testCaseData.map(testCase => {
            const key = testCase.key || '';
            const patternId = testCase.patternId || null; // Extract patternId
            const patternName = patternId ? (patternMap[patternId] || 'Unknown Pattern') : ''; // Get pattern name from map

            let versionNumber = '0';
            let createdOn = '';
            if (testCase.version && typeof testCase.version === 'object') {
                versionNumber = testCase.version.number || '1';
                createdOn = testCase.version.createdOn || '';

                // Format the created date if it exists
                if (createdOn) {
                    try {
                        const date = new Date(createdOn);
                        createdOn = date.toLocaleDateString();
                    } catch (e) {
                        console.log('Invalid date format:', createdOn);
                    }
                }
            }

            return {
                key: key,
                name: testCase.name || '',
                patternName: patternName, // Add patternName
                state: testCase.state || 'ReadyForEvent',
                version: versionNumber,
                createdOn: createdOn,
                raw: testCase
            };
        });

        // Identify and track the latest version of each test case
        const testCasesByKey = {};
        allTestCases.forEach(testCase => {
            const key = testCase.key;
            if (!testCasesByKey[key]) {
                testCasesByKey[key] = [];
            }
            testCasesByKey[key].push(testCase);
        });

        // Store the latest version number for each test case key
        for (const [key, versions] of Object.entries(testCasesByKey)) {
            versions.sort((a, b) => parseInt(b.version) - parseInt(a.version));
            latestVersionsByKey[key] = parseInt(versions[0].version);
        }

        // Apply initial filters (specifically for version, since it defaults to "latest")
        applyFilters();
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('loadingIndicator').classList.add('d-none');
        document.getElementById('noResults').classList.remove('d-none');
        document.getElementById('noResults').textContent = 'Error loading data. Please try again later.';
    }
}

// Update table with filtered and paginated data
function updateTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredTestCases.length);
    const tableBody = document.getElementById('testCasesTableBody');

    // Clear existing rows
    tableBody.innerHTML = '';

    // Hide loading indicator
    document.getElementById('loadingIndicator').classList.add('d-none');

    // Show no results message if needed
    if (filteredTestCases.length === 0) {
        document.getElementById('noResults').classList.remove('d-none');
    } else {
        document.getElementById('noResults').classList.add('d-none');

        // Add rows for current page
        for (let i = startIndex; i < endIndex; i++) {
            const testCase = filteredTestCases[i];
            const row = document.createElement('tr');

            // Create checkbox column
            const checkboxCell = document.createElement('td');
            checkboxCell.className = 'checkbox-column';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'row-checkbox';
            checkbox.dataset.key = testCase.key;
            checkboxCell.appendChild(checkbox);

            // Create key column
            const keyCell = document.createElement('td');
            keyCell.className = 'key-column';
            keyCell.textContent = testCase.key;

            // Create name column
            const nameCell = document.createElement('td');
            nameCell.textContent = testCase.name;

            // Create pattern column
            const patternCell = document.createElement('td');
            patternCell.textContent = testCase.patternName;

            // Create state column
            const stateCell = document.createElement('td');
            const stateTag = document.createElement('span');
            stateTag.className = 'status-tag';

            // Format the state for display
            let displayState = testCase.state;
            if (displayState === 'ReadyForEvent') {
                displayState = 'Ready for Event';
                stateTag.classList.add('status-ready');
            } else if (displayState === 'Approved') {
                stateTag.classList.add('status-approved');
            } else if (displayState === 'Draft') {
                stateTag.classList.add('status-draft');
            } else if (displayState === 'Deprecated') {
                stateTag.classList.add('status-deprecated');
            } else if (displayState === 'ReadyForReview') { // Handle new state
                displayState = 'Ready for Review';
                stateTag.classList.add('status-ready-for-review');
            }

            stateTag.textContent = displayState;
            stateCell.appendChild(stateTag);

            // Create version column
            const versionCell = document.createElement('td');
            const versionBadge = document.createElement('span');

            // Check if this is the latest version
            const isLatestVersion = isLatestTestCaseVersion(testCase);

            versionBadge.className = isLatestVersion ? 'version-badge latest-version' : 'version-badge';
            versionBadge.textContent = testCase.version;
            versionCell.appendChild(versionBadge);

            // Create createdOn column
            const createdOnCell = document.createElement('td');
            createdOnCell.textContent = testCase.createdOn || '';

            // Add all cells to row
            row.appendChild(checkboxCell);
            row.appendChild(keyCell);
            row.appendChild(nameCell);
            row.appendChild(patternCell); // Add pattern cell
            row.appendChild(stateCell);
            row.appendChild(versionCell);
            row.appendChild(createdOnCell);

            // Add click listener to the row
            row.style.cursor = 'pointer'; // Indicate row is clickable
            row.addEventListener('click', () => {
                showTestCaseModal(testCase.raw); // Pass the raw test case data
            });

            // Add row to table
            tableBody.appendChild(row);
        }
    }

    // Update pagination info
    document.getElementById('currentRangeStart').textContent = filteredTestCases.length > 0 ? startIndex + 1 : 0;
    document.getElementById('currentRangeEnd').textContent = endIndex;
    document.getElementById('totalItems').textContent = filteredTestCases.length;

    // Update pagination controls
    updatePagination();
}

// Apply filters and search
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const stateFilter = document.getElementById('stateFilter').value;
    const patternFilter = document.getElementById('patternFilter').value;
    const versionFilter = document.getElementById('versionFilter').value;

    // Group test cases by key to identify latest versions
    const testCasesByKey = {};
    allTestCases.forEach(testCase => {
        const key = testCase.key;
        if (!testCasesByKey[key]) {
            testCasesByKey[key] = [];
        }
        testCasesByKey[key].push(testCase);
    });

    // Create a map of latest versions for each key
    const latestVersionByKey = {};
    Object.entries(testCasesByKey).forEach(([key, versions]) => {
        versions.sort((a, b) => parseInt(b.version) - parseInt(a.version));
        latestVersionByKey[key] = versions[0];
    });

    // Apply filters with proper AND logic
    let tempFiltered = allTestCases.filter(testCase => {
        // Format state for comparison
        let displayState = testCase.state;
        if (displayState === 'ReadyForEvent') {
            displayState = 'Ready for Event';
        } else if (displayState === 'ReadyForReview') { // Handle new state for filtering
            displayState = 'Ready for Review';
        }

        // Apply search term (include patternName)
        const matchesSearch = searchTerm === '' ||
            testCase.key.toLowerCase().includes(searchTerm) ||
            testCase.name.toLowerCase().includes(searchTerm) ||
            testCase.patternName.toLowerCase().includes(searchTerm);

        // Apply state filter
        const matchesState = stateFilter === '' || displayState === stateFilter;

        // Apply pattern filter
        const matchesPattern = patternFilter === '' || testCase.patternName === patternFilter;

        // Apply version filter with AND logic
        let matchesVersionFilter = true;
        if (versionFilter === 'latest') {
            // Only include if this is the latest version of this key
            const latestVersion = latestVersionByKey[testCase.key];
            matchesVersionFilter = (latestVersion && latestVersion.version === testCase.version);
        }

        // All conditions must be true (AND logic)
        return matchesSearch && matchesState && matchesPattern && matchesVersionFilter;
    });

    filteredTestCases = tempFiltered;

    // Sort filtered cases
    sortTestCases();

    // Reset to first page
    currentPage = 1;
    updateTable();
}

// Sort test cases
function sortTestCases() {
    filteredTestCases.sort((a, b) => {
        let valA = a[currentSortField];
        let valB = b[currentSortField];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

// Update pagination controls
function updatePagination() {
    const maxPage = Math.ceil(filteredTestCases.length / itemsPerPage);
    const paginationContainer = document.getElementById('paginationContainer');
    const pageButtons = Array.from(paginationContainer.querySelectorAll('.page-number'));

    // Remove old page number buttons
    pageButtons.forEach(button => button.remove());

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
            pageItem.className = 'page-item page-number';
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

// Theme toggling
function toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? '' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Column resizing functionality
function setupColumnResizing() {
    const table = document.querySelector('.test-cases-table');
    const headers = table.querySelectorAll('th');

    headers.forEach(header => {
        // Skip checkbox column for resizing
        if (header.classList.contains('checkbox-column')) {
            return;
        }

        // Create and append resize handle
        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'resize-handle';
        header.appendChild(resizeHandle);

        let startX, startWidth;

        resizeHandle.addEventListener('mousedown', function(e) {
            startX = e.pageX;
            startWidth = header.offsetWidth;

            // Add mousemove and mouseup event listeners
            document.addEventListener('mousemove', resize);
            document.addEventListener('mouseup', stopResize);

            // Prevent text selection during resize
            e.preventDefault();
        });

        function resize(e) {
            const width = startWidth + (e.pageX - startX);

            // Set a minimum width to prevent columns from becoming too narrow
            if (width > 50) {
                header.style.width = `${width}px`;
                header.style.minWidth = `${width}px`;
            }
        }

        function stopResize() {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
        }
    });
}

// Check for saved theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // If no saved preference, use system preference
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load theme preference
    loadThemePreference();

    // Fetch data (patterns and test cases)
    fetchData();

    // Set up column resizing after table is populated
    setTimeout(setupColumnResizing, 1000);

    // Set up search and filter handlers
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('stateFilter').addEventListener('change', applyFilters);
    document.getElementById('patternFilter').addEventListener('change', applyFilters);
    document.getElementById('versionFilter').addEventListener('change', applyFilters);

    // Set up page size selector
    document.getElementById('pageSizeSelector').addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1; // Reset to first page when changing page size

        // Adjust the grid height based on selected page size
        const tableContainer = document.querySelector('.test-cases-table-container');
        if (itemsPerPage === 50) {
            tableContainer.classList.add('large-grid');
        } else {
            tableContainer.classList.remove('large-grid');
        }

        updateTable();
    });

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
        const maxPage = Math.ceil(filteredTestCases.length / itemsPerPage);
        if (currentPage < maxPage) {
            currentPage++;
            updateTable();
        }
    });

    // Set up sorting
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;

            // Toggle direction if same field, otherwise default to asc
            if (field === currentSortField) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortField = field;
                sortDirection = 'asc';
            }

            // Update sort icons
            document.querySelectorAll('th.sortable i').forEach(icon => {
                icon.className = 'fas fa-sort';
            });

            const icon = th.querySelector('i');
            icon.className = `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;

            // Apply sort
            sortTestCases();
            updateTable();
        });
    });

    // Select all checkbox
    document.getElementById('selectAll').addEventListener('change', (e) => {
        const checked = e.target.checked;
        document.querySelectorAll('.row-checkbox').forEach(checkbox => {
            checkbox.checked = checked;
        });
    });
});

// Simple markdown to HTML converter (handles **bold**, **_bold-italic_**, and basic lists)
function simpleMarkdownToHtml(text) {
    if (!text) return 'N/A';

    let html = text;

    // Convert **_bold-italic_** to <b><i>bold-italic</i></b> first
    // Use placeholders to avoid conflicts
    const boldItalicMap = {};
    let biIndex = 0;
    html = html.replace(/\*\*_([\s\S]*?)_\*\*/g, (match, p1) => {
        const placeholder = `__BOLDITALIC_${biIndex++}__`;
        boldItalicMap[placeholder] = `<b><i>${p1}</i></b>`;
        return placeholder;
    });

    // Convert **bold** to <b>bold</b>
    const boldMap = {};
    let boldIndex = 0;
    html = html.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
        // Avoid matching placeholders
        if (p1.startsWith('__') && p1.endsWith('__')) return match;
        const placeholder = `__BOLD_${boldIndex++}__`;
        boldMap[placeholder] = `<b>${p1}</b>`;
        return placeholder;
    });


    // Convert lines starting with '- ' or '\\- ' to list items
    const lines = html.split('\n');
    let inList = false;
    let processedHtml = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Preserve indentation for list items, but trim for checking prefix
        const trimmedLine = line.trimStart(); // Trim only leading whitespace
        // Check for both "- " and "\\- " prefixes
        const isListItem = trimmedLine.startsWith('- ');
        const isEscapedListItem = trimmedLine.startsWith('\\- ');

        if (isListItem || isEscapedListItem) {
            let itemContent;
            if (isEscapedListItem) {
                // Get content after '\\- ', preserving original leading whitespace relative to the '\\'
                itemContent = line.substring(line.indexOf('\\- ') + 3);
            } else {
                 // Get content after '- ', preserving original leading whitespace relative to the '-'
                itemContent = line.substring(line.indexOf('- ') + 2);
            }

            if (!inList) {
                processedHtml += '<ul>'; // Start list
                inList = true;
            }
            // Add list item content (placeholders will be replaced later)
            processedHtml += `<li>${itemContent}</li>`;
        } else {
            if (inList) {
                processedHtml += '</ul>'; // End list
                inList = false;
            }
            // Add non-list line back, preserving original whitespace
            if (line.trim().length > 0 || (i > 0 && lines[i-1].trim().length > 0 && !inList)) {
                 processedHtml += line + '\n'; // Keep original line breaks for pre-wrap, preserve single empty lines
            }
        }
    }

    // Close list if the text ends with a list item
    if (inList) {
        processedHtml += '</ul>';
    }

    // Restore bold-italic tags first
    for (const placeholder in boldItalicMap) {
        processedHtml = processedHtml.replaceAll(placeholder, boldItalicMap[placeholder]);
    }
    // Restore bold tags
    for (const placeholder in boldMap) {
        processedHtml = processedHtml.replaceAll(placeholder, boldMap[placeholder]);
    }

    // Return processed HTML
    return processedHtml.trim(); // Trim final whitespace
}


// Function to show test case details in a modal
function showTestCaseModal(testCaseData) {
    const modalTitle = document.getElementById('testCaseModalLabel');
    const modalBody = document.getElementById('testCaseModalBody');

    // Get pattern name
    const patternName = testCaseData.patternId ? (patternMap[testCaseData.patternId] || 'Unknown Pattern') : 'N/A';

    // Format state
    let displayState = testCaseData.state || 'N/A';
     if (displayState === 'ReadyForEvent') displayState = 'Ready for Event';
     if (displayState === 'ReadyForReview') displayState = 'Ready for Review';


    modalTitle.textContent = `Test Case Details: ${testCaseData.key || 'N/A'}`;

    // Apply markdown conversion to relevant fields
    const name = simpleMarkdownToHtml(testCaseData.name);
    const purpose = simpleMarkdownToHtml(testCaseData.purpose);
    const precondition = simpleMarkdownToHtml(testCaseData.precondition);
    const execution = simpleMarkdownToHtml(testCaseData.execution);
    const validationCriteria = simpleMarkdownToHtml(testCaseData.validationCriteria);

    // Start building modal content
    // Use <div> for fields that might contain lists/markdown
    let modalHtml = `
        <h5>Name</h5>
        <p>${name}</p>
        <h5>State</h5>
        <p>${displayState}</p>
        <h5>Purpose</h5>
        <div class="detail-field-content">${purpose}</div>
        <h5>Precondition</h5>
        <div class="detail-field-content">${precondition}</div>
        <h5>Execution</h5>
        <div class="detail-field-content">${execution}</div>
        <h5>Validation Criteria</h5>
        <div class="detail-field-content">${validationCriteria}</div>
        <h5>Pattern</h5>
        <p>${patternName}</p>
    `;

     // --- Add Actor Roles Table ---
    modalHtml += `
        <h5>Actor Roles</h5>
        <div id="actorRolesTableContainer">
            <p><i>Loading actor roles...</i></p>
            <table class="table table-sm table-bordered" style="font-size: 0.85rem;">
                <thead>
                    <tr>
                        <th>Role</th>
                        <th>Actor</th>
                        <th>Coordinator</th>
                        <th>Multiplicity</th>
                    </tr>
                </thead>
                <tbody id="actorRolesTableBody">
                    <!-- Actor roles will be loaded here -->
                </tbody>
            </table>
        </div>
    `;

    // --- Add Test Steps Table ---
    modalHtml += `
        <h5>Test Steps</h5>
        <div id="testStepsTableContainer">
            <p><i>Loading test steps...</i></p>
            <table class="table table-sm table-bordered" style="font-size: 0.85rem;">
                <thead>
                    <tr>
                        <th>Step</th>
                        <th>Initiator</th>
                        <th>Partner</th>
                        <th>Action</th>
                        <th>Outcome</th>
                        <th>Evidence</th>
                    </tr>
                </thead>
                <tbody id="testStepsTableBody">
                    <!-- Test steps will be loaded here -->
                </tbody>
            </table>
        </div>
    `;


    modalBody.innerHTML = modalHtml; // Set initial HTML including loading states

    // Asynchronously populate the tables
    populateActorRolesTable(testCaseData);
    populateTestStepsTable(testCaseData);


    // Show the modal using Bootstrap's API
    const testCaseModal = new bootstrap.Modal(document.getElementById('testCaseModal'));
    testCaseModal.show();
}

// Function to fetch actor names and populate the table in the modal
async function populateActorRolesTable(testCaseData) {
    const tableBody = document.getElementById('actorRolesTableBody');
    const container = document.getElementById('actorRolesTableContainer');
    tableBody.innerHTML = ''; // Clear previous content

    if (!testCaseData.testCaseActorRoles || testCaseData.testCaseActorRoles.length === 0) {
        container.innerHTML = '<p>No actor roles defined for this test case.</p>';
        return;
    }

    try {
        // Create promises for fetching actor names
        const rolePromises = testCaseData.testCaseActorRoles.map(async (actorRole) => {
            const patternRoleId = actorRole.patternRoleId;
            const actorId = actorRole.actorId;

            // Find Role Name from pattern data
            let roleName = 'Unknown Role';
            const pattern = fullPatternData.find(p => p.id === testCaseData.patternId);
            if (pattern && pattern.patternRoles) {
                const role = pattern.patternRoles.find(r => r.id === patternRoleId);
                if (role) {
                    roleName = role.name || 'Unnamed Role';
                }
            }

            // Fetch Actor Name from API
            let actorName = 'Loading...';
            if (actorId) {
                try {
                    const response = await fetch(`/api/actor/${actorId}`);
                    if (response.ok) {
                        const data = await response.json();
                        actorName = data.name || 'Unknown Actor';
                    } else if (response.status === 404) {
                        actorName = 'Actor Not Found';
                    } else {
                        actorName = 'Error Loading Actor';
                        console.error(`Error fetching actor ${actorId}: ${response.statusText}`);
                    }
                } catch (error) {
                    actorName = 'Error Loading Actor';
                    console.error(`Network error fetching actor ${actorId}:`, error);
                }
            } else {
                 actorName = 'N/A';
            }


            return {
                roleName: roleName,
                actorName: actorName,
                isCoordinator: actorRole.isCoordinator ? 'Yes' : 'No',
                multiplicity: actorRole.multiplicity ? 'Yes' : 'No'
            };
        });

        // Wait for all fetches to complete
        const rolesData = await Promise.all(rolePromises);

        // Populate the table body
        rolesData.forEach(data => {
            const row = tableBody.insertRow();
            row.insertCell().textContent = data.roleName;
            row.insertCell().textContent = data.actorName;
            row.insertCell().textContent = data.isCoordinator;
            row.insertCell().textContent = data.multiplicity;
        });

         // Remove loading indicator
        const loadingIndicator = container.querySelector('p');
        if (loadingIndicator && loadingIndicator.textContent.includes('Loading')) {
            loadingIndicator.remove();
        }


    } catch (error) {
        console.error("Error populating actor roles table:", error);
        container.innerHTML = '<p>Error loading actor roles.</p>';
    }
}

// Function to fetch actor names and populate the test steps table
async function populateTestStepsTable(testCaseData) {
    const tableBody = document.getElementById('testStepsTableBody');
    const container = document.getElementById('testStepsTableContainer');
    tableBody.innerHTML = ''; // Clear previous content

    if (!testCaseData.steps || testCaseData.steps.length === 0) {
        container.innerHTML = '<p>No test steps defined for this test case.</p>';
        return;
    }

    // Sort steps by stepNumber
    const sortedSteps = [...testCaseData.steps].sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0));

    try {
         // Create a map to store fetched actor names to avoid redundant fetches
        const fetchedActorNames = {};
        const fetchActorName = async (actorId) => {
            if (!actorId) return 'N/A';
            if (fetchedActorNames[actorId]) return fetchedActorNames[actorId];

            try {
                const response = await fetch(`/api/actor/${actorId}`);
                if (response.ok) {
                    const data = await response.json();
                    const name = data.name || 'Unknown Actor';
                    fetchedActorNames[actorId] = name;
                    return name;
                } else if (response.status === 404) {
                     fetchedActorNames[actorId] = 'Actor Not Found';
                     return 'Actor Not Found';
                } else {
                     fetchedActorNames[actorId] = 'Error';
                     console.error(`Error fetching actor ${actorId}: ${response.statusText}`);
                     return 'Error';
                }
            } catch (error) {
                 fetchedActorNames[actorId] = 'Error';
                 console.error(`Network error fetching actor ${actorId}:`, error);
                 return 'Error';
            }
        };

        // Create promises for all actor lookups needed for the steps
        const actorFetchPromises = [];
        sortedSteps.forEach(step => {
            if (step.initiatorActorId && !fetchedActorNames[step.initiatorActorId]) {
                actorFetchPromises.push(fetchActorName(step.initiatorActorId));
            }
            if (step.partnerActorId && !fetchedActorNames[step.partnerActorId]) {
                actorFetchPromises.push(fetchActorName(step.partnerActorId));
            }
        });

        // Wait for all unique actor names to be fetched
        await Promise.all(actorFetchPromises);

        // Now populate the table using the cached names
        sortedSteps.forEach(step => {
            const initiatorName = fetchedActorNames[step.initiatorActorId] || 'N/A';
            const partnerName = fetchedActorNames[step.partnerActorId] || 'N/A';
            const actionHtml = simpleMarkdownToHtml(step.action);
            const outcomeHtml = simpleMarkdownToHtml(step.expectedOutcome);
            const evidence = step.evidenceRequired ? 'Yes' : 'No';
            const responsible = step.responsibleForResult || ''; // e.g., 'initiator' or 'partner'

            const row = tableBody.insertRow();
            row.insertCell().textContent = step.stepNumber || '-';

            // Add Initiator name (bold if responsible)
            const initiatorCell = row.insertCell();
            initiatorCell.innerHTML = responsible === 'initiator' ? `<b>${initiatorName}</b>` : initiatorName;

            // Add Partner name (bold if responsible)
            const partnerCell = row.insertCell();
            partnerCell.innerHTML = responsible === 'partner' ? `<b>${partnerName}</b>` : partnerName;

            // Use innerHTML for action and outcome as they might contain HTML tags from markdown
            row.insertCell().innerHTML = actionHtml;
            row.insertCell().innerHTML = outcomeHtml;
            row.insertCell().textContent = evidence;
        });

         // Remove loading indicator
        const loadingIndicator = container.querySelector('p');
        if (loadingIndicator && loadingIndicator.textContent.includes('Loading')) {
            loadingIndicator.remove();
        }

    } catch (error) {
        console.error("Error populating test steps table:", error);
        container.innerHTML = '<p>Error loading test steps.</p>';
    }
}


// Function to print modal content
function printModalContent() {
    window.print();
}
