// Test case data management
let allTestCases = [];
let filteredTestCases = [];
let currentPage = 1;
let currentSortField = 'key';
let sortDirection = 'asc';
let latestVersionsByKey = {}; // Store the latest version number for each test case key
let patternMap = {}; // Map pattern ID to pattern name
let fullPatternData = []; // Store full pattern data for role lookup

// --- Pagination Elements ---
const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
const pageInfo = document.getElementById('pageInfo');
const prevPageButton = document.getElementById('prevPageButton');
const nextPageButton = document.getElementById('nextPageButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const noResults = document.getElementById('noResults');
const tableBody = document.getElementById('testCasesTableBody');

// Initialize itemsPerPage from the select element, default to 25
let itemsPerPage = parseInt(itemsPerPageSelect?.value, 10) || 25;

// Function to determine if a test case is the latest version
function isLatestTestCaseVersion(testCase) {
    if (!latestVersionsByKey[testCase.key]) {
        return true; // Consider it latest if no version info tracked
    }
    return parseInt(testCase.version) === latestVersionsByKey[testCase.key];
}

// Fetch test cases and patterns data
async function fetchData() {
    try {
        // Fetch patterns first
        const patternResponse = await fetch('/static/pattern.json');
        if (!patternResponse.ok) throw new Error('Failed to fetch patterns data');
        const patternData = await patternResponse.json();
        fullPatternData = patternData;
        patternData.forEach(pattern => { patternMap[pattern.id] = pattern.name; });

        // Populate pattern filter dropdown
        const patternFilter = document.getElementById('patternFilter');
        if (patternFilter) {
            const uniquePatterns = [...new Set(patternData.map(p => p.name))].sort();
            // Clear existing options except the first one
             while (patternFilter.options.length > 1) {
                 patternFilter.remove(1);
             }
            uniquePatterns.forEach(patternName => {
                const option = document.createElement('option');
                option.value = patternName;
                option.textContent = patternName;
                patternFilter.appendChild(option);
            });
        }

        // Fetch test cases
        const testCaseResponse = await fetch('/static/test_cases.json');
        if (!testCaseResponse.ok) throw new Error('Failed to fetch test cases data');
        const testCaseData = await testCaseResponse.json();

        // Process test case data
        allTestCases = testCaseData.map(testCase => {
            const key = testCase.key || '';
            const patternId = testCase.patternId || null;
            const patternName = patternId ? (patternMap[patternId] || 'Unknown Pattern') : '';
            let versionNumber = '0';
            let createdOn = '';
            if (testCase.version && typeof testCase.version === 'object') {
                versionNumber = testCase.version.number || '1';
                createdOn = testCase.version.createdOn || '';
                if (createdOn) {
                    try {
                        const date = new Date(createdOn);
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        createdOn = `${year}-${month}-${day}`;
                    } catch (e) { createdOn = ''; }
                }
            }
            return { key, name: testCase.name || '', patternName, state: testCase.state || 'ReadyForEvent', version: versionNumber, createdOn, raw: testCase };
        });

        // Identify latest versions
        const testCasesByKey = {};
        allTestCases.forEach(tc => {
            if (!testCasesByKey[tc.key] || parseInt(tc.version) > parseInt(testCasesByKey[tc.key].version)) {
                testCasesByKey[tc.key] = tc;
            }
        });
        latestVersionsByKey = {};
        Object.values(testCasesByKey).forEach(tc => {
            latestVersionsByKey[tc.key] = parseInt(tc.version);
        });


        // Apply initial filters and render
        itemsPerPage = parseInt(itemsPerPageSelect?.value, 10) || 25;
        applyFilters();
    } catch (error) {
        console.error('Error fetching data:', error);
        if (loadingIndicator) loadingIndicator.classList.add('d-none');
        if (noResults) {
            noResults.classList.remove('d-none');
            noResults.textContent = 'Error loading data.';
        }
    }
}

// --- Function to update pagination controls ---
function updatePaginationControls() {
    if (!pageInfo || !prevPageButton || !nextPageButton) return;

    const totalItems = filteredTestCases.length;
    let totalPages = Math.ceil(totalItems / itemsPerPage);
    totalPages = totalPages === 0 ? 1 : totalPages;

    // Adjust currentPage if it's out of bounds
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    pageInfo.textContent = `Page ${currentPage} of ${totalPages} (${totalItems} items total)`;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;

    const paginationControls = document.getElementById('paginationControls');
    if (paginationControls) {
        paginationControls.style.display = totalItems <= itemsPerPage && totalPages <= 1 ? 'none' : 'flex';
    }
}

// Update table with filtered and paginated data
function updateTable() {
    if (!tableBody || !loadingIndicator || !noResults) return;

    // Ensure currentPage is valid before slicing
    const totalItems = filteredTestCases.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    currentPage = Math.max(1, Math.min(currentPage, totalPages));

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = filteredTestCases.slice(startIndex, endIndex);

    tableBody.innerHTML = ''; // Clear existing rows
    loadingIndicator.classList.add('d-none');

    if (paginatedItems.length === 0 && totalItems === 0) {
        noResults.classList.remove('d-none');
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No test cases found matching your criteria.</td></tr>';
    } else {
        noResults.classList.add('d-none');
        paginatedItems.forEach(testCase => {
            const row = document.createElement('tr');
            // ... (rest of row creation logic remains the same) ...
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

            tableBody.appendChild(row);
        });
    }

    updatePaginationControls(); // Update pagination display
    setupColumnResizing(); // Re-apply column resizing
}

// Apply filters and search
function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const stateFilter = document.getElementById('stateFilter');
    const patternFilter = document.getElementById('patternFilter');
    const versionFilter = document.getElementById('versionFilter');

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const stateFilterValue = stateFilter ? stateFilter.value : '';
    const patternFilterValue = patternFilter ? patternFilter.value : '';
    const versionFilterValue = versionFilter ? versionFilter.value : 'latest';

    filteredTestCases = allTestCases.filter(testCase => {
        let displayState = testCase.state;
        if (displayState === 'ReadyForEvent') displayState = 'Ready for Event';
        if (displayState === 'ReadyForReview') displayState = 'Ready for Review';

        const matchesSearch = searchTerm === '' ||
            testCase.key.toLowerCase().includes(searchTerm) ||
            testCase.name.toLowerCase().includes(searchTerm) ||
            testCase.patternName.toLowerCase().includes(searchTerm);
        const matchesState = stateFilterValue === '' || displayState === stateFilterValue;
        const matchesPattern = patternFilterValue === '' || testCase.patternName === patternFilterValue;
        let matchesVersion = true;
        if (versionFilterValue === 'latest') {
            matchesVersion = isLatestTestCaseVersion(testCase);
        }

        return matchesSearch && matchesState && matchesPattern && matchesVersion;
    });

    sortTestCases(); // Sort the newly filtered list
    currentPage = 1; // Reset to first page after filtering
    updateTable(); // Update table display
}

// Sort test cases
function sortTestCases() {
    filteredTestCases.sort((a, b) => {
        let valA = a[currentSortField];
        let valB = b[currentSortField];

        // Handle numeric sort for version and potentially others later
        if (currentSortField === 'version') {
            valA = parseInt(valA) || 0;
            valB = parseInt(valB) || 0;
        } else if (typeof valA === 'string') {
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

// Theme toggling
function toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? '' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Column resizing functionality
function setupColumnResizing() {
    const table = document.querySelector('.test-cases-table');
    if (!table) return;
    const headers = table.querySelectorAll('th');

    headers.forEach(header => {
        if (header.classList.contains('checkbox-column') || header.querySelector('.resize-handle')) {
            return; // Skip checkbox or if handle exists
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
            e.preventDefault();
        });
        function resize(e) {
            const width = Math.max(50, startWidth + (e.pageX - startX)); // Ensure min width
            header.style.width = `${width}px`;
            header.style.minWidth = `${width}px`;
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
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// Set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference();
    fetchData(); // Initial data load and render

    // Filter listeners
    const searchInput = document.getElementById('searchInput');
    const stateFilter = document.getElementById('stateFilter');
    const patternFilter = document.getElementById('patternFilter');
    const versionFilter = document.getElementById('versionFilter');
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (stateFilter) stateFilter.addEventListener('change', applyFilters);
    if (patternFilter) patternFilter.addEventListener('change', applyFilters);
    if (versionFilter) versionFilter.addEventListener('change', applyFilters);

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
            const totalPages = Math.ceil(filteredTestCases.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                updateTable();
            }
        });
    }

    // Sorting listeners
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.dataset.sort;
            if (!field) return;
            if (field === currentSortField) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortField = field;
                sortDirection = 'asc';
            }
            document.querySelectorAll('th.sortable i').forEach(icon => icon.className = 'fas fa-sort');
            const icon = th.querySelector('i');
            if (icon) icon.className = `fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`;
            sortTestCases();
            updateTable();
        });
    });

    // Select all checkbox listener
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const checked = e.target.checked;
            document.querySelectorAll('.row-checkbox').forEach(checkbox => {
                checkbox.checked = checked;
            });
        });
    }
});

// Simple markdown to HTML converter (remains the same)
function simpleMarkdownToHtml(text) {
    if (!text) return 'N/A';
    let html = text;
    const boldItalicMap = {}; let biIndex = 0;
    html = html.replace(/\*\*_([\s\S]*?)_\*\*/g, (match, p1) => { const placeholder = `__BOLDITALIC_${biIndex++}__`; boldItalicMap[placeholder] = `<b><i>${p1}</i></b>`; return placeholder; });
    const boldMap = {}; let boldIndex = 0;
    html = html.replace(/\*\*(.*?)\*\*/g, (match, p1) => { if (p1.startsWith('__') && p1.endsWith('__')) return match; const placeholder = `__BOLD_${boldIndex++}__`; boldMap[placeholder] = `<b>${p1}</b>`; return placeholder; });
    const lines = html.split('\n'); let inList = false; let processedHtml = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]; const trimmedLine = line.trimStart();
        const isListItem = trimmedLine.startsWith('- '); const isEscapedListItem = trimmedLine.startsWith('\\- ');
        if (isListItem || isEscapedListItem) {
            let itemContent = isEscapedListItem ? line.substring(line.indexOf('\\- ') + 3) : line.substring(line.indexOf('- ') + 2);
            if (!inList) { processedHtml += '<ul>'; inList = true; }
            processedHtml += `<li>${itemContent}</li>`;
        } else {
            if (inList) { processedHtml += '</ul>'; inList = false; }
            if (line.trim().length > 0 || (i > 0 && lines[i-1].trim().length > 0 && !inList)) { processedHtml += line + '\n'; }
        }
    }
    if (inList) { processedHtml += '</ul>'; }
    for (const placeholder in boldItalicMap) { processedHtml = processedHtml.replaceAll(placeholder, boldItalicMap[placeholder]); }
    for (const placeholder in boldMap) { processedHtml = processedHtml.replaceAll(placeholder, boldMap[placeholder]); }
    return processedHtml.trim();
}

// Function to show test case details in a modal (remains the same)
function showTestCaseModal(testCaseData) {
    const modalTitle = document.getElementById('testCaseModalLabel');
    const modalBody = document.getElementById('testCaseModalBody');
    if (!modalTitle || !modalBody) return;
    const patternName = testCaseData.patternId ? (patternMap[testCaseData.patternId] || 'Unknown Pattern') : 'N/A';
    let displayState = testCaseData.state || 'N/A';
     if (displayState === 'ReadyForEvent') displayState = 'Ready for Event';
     if (displayState === 'ReadyForReview') displayState = 'Ready for Review';
    modalTitle.textContent = `Test Case Details: ${testCaseData.key || 'N/A'}`;
    const name = simpleMarkdownToHtml(testCaseData.name);
    const purpose = simpleMarkdownToHtml(testCaseData.purpose);
    const precondition = simpleMarkdownToHtml(testCaseData.precondition);
    const execution = simpleMarkdownToHtml(testCaseData.execution);
    const validationCriteria = simpleMarkdownToHtml(testCaseData.validationCriteria);
    let modalHtml = `<h5>Name</h5><p>${name}</p><h5>State</h5><p>${displayState}</p><h5>Purpose</h5><div class="detail-field-content">${purpose}</div><h5>Precondition</h5><div class="detail-field-content">${precondition}</div><h5>Execution</h5><div class="detail-field-content">${execution}</div><h5>Validation Criteria</h5><div class="detail-field-content">${validationCriteria}</div><h5>Pattern</h5><p>${patternName}</p>`;
    modalHtml += `<h5>Actor Roles</h5><div id="actorRolesTableContainer"><p><i>Loading actor roles...</i></p><table class="table table-sm table-bordered" style="font-size: 0.85rem;"><thead><tr><th>Role</th><th>Actor</th><th>Coordinator</th><th>Multiplicity</th></tr></thead><tbody id="actorRolesTableBody"></tbody></table></div>`;
    modalHtml += `<h5>Test Steps</h5><div id="testStepsTableContainer"><p><i>Loading test steps...</i></p><table class="table table-sm table-bordered" style="font-size: 0.85rem;"><thead><tr><th>Step</th><th>Initiator</th><th>Partner</th><th>Action</th><th>Outcome</th><th>Evidence</th></tr></thead><tbody id="testStepsTableBody"></tbody></table></div>`;
    modalBody.innerHTML = modalHtml;
    populateActorRolesTable(testCaseData);
    populateTestStepsTable(testCaseData);
    const testCaseModalEl = document.getElementById('testCaseModal');
    if (testCaseModalEl) { const testCaseModal = new bootstrap.Modal(testCaseModalEl); testCaseModal.show(); }
}

// Function to fetch actor names and populate the table in the modal (remains the same)
async function populateActorRolesTable(testCaseData) {
    const tableBody = document.getElementById('actorRolesTableBody');
    const container = document.getElementById('actorRolesTableContainer');
    if (!tableBody || !container) return;
    tableBody.innerHTML = '';
    if (!testCaseData.testCaseActorRoles || testCaseData.testCaseActorRoles.length === 0) { container.innerHTML = '<p>No actor roles defined for this test case.</p>'; return; }
    try {
        const rolePromises = testCaseData.testCaseActorRoles.map(async (actorRole) => {
            const patternRoleId = actorRole.patternRoleId; const actorId = actorRole.actorId;
            let roleName = 'Unknown Role';
            const pattern = fullPatternData.find(p => p.id === testCaseData.patternId);
            if (pattern && pattern.patternRoles) { const role = pattern.patternRoles.find(r => r.id === patternRoleId); if (role) { roleName = role.name || 'Unnamed Role'; } }
            let actorName = 'Loading...';
            if (actorId) { try { const response = await fetch(`/api/actor/${actorId}`); if (response.ok) { const data = await response.json(); actorName = data.name || 'Unknown Actor'; } else if (response.status === 404) { actorName = 'Actor Not Found'; } else { actorName = 'Error Loading Actor'; console.error(`Error fetching actor ${actorId}: ${response.statusText}`); } } catch (error) { actorName = 'Error Loading Actor'; console.error(`Network error fetching actor ${actorId}:`, error); } } else { actorName = 'N/A'; }
            return { roleName, actorName, isCoordinator: actorRole.isCoordinator ? 'Yes' : 'No', multiplicity: actorRole.multiplicity ? 'Yes' : 'No' };
        });
        const rolesData = await Promise.all(rolePromises);
        rolesData.forEach(data => { const row = tableBody.insertRow(); row.insertCell().textContent = data.roleName; row.insertCell().textContent = data.actorName; row.insertCell().textContent = data.isCoordinator; row.insertCell().textContent = data.multiplicity; });
        const loadingIndicator = container.querySelector('p'); if (loadingIndicator && loadingIndicator.textContent.includes('Loading')) { loadingIndicator.remove(); }
    } catch (error) { console.error("Error populating actor roles table:", error); container.innerHTML = '<p>Error loading actor roles.</p>'; }
}

// Function to fetch actor names and populate the test steps table (remains the same)
async function populateTestStepsTable(testCaseData) {
    const tableBody = document.getElementById('testStepsTableBody');
    const container = document.getElementById('testStepsTableContainer');
     if (!tableBody || !container) return;
    tableBody.innerHTML = '';
    if (!testCaseData.steps || testCaseData.steps.length === 0) { container.innerHTML = '<p>No test steps defined for this test case.</p>'; return; }
    const sortedSteps = [...testCaseData.steps].sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0));
    try {
        const fetchedActorNames = {};
        const fetchActorName = async (actorId) => {
            if (!actorId) return 'N/A'; if (fetchedActorNames[actorId]) return fetchedActorNames[actorId];
            try { const response = await fetch(`/api/actor/${actorId}`); if (response.ok) { const data = await response.json(); const name = data.name || 'Unknown Actor'; fetchedActorNames[actorId] = name; return name; } else if (response.status === 404) { fetchedActorNames[actorId] = 'Actor Not Found'; return 'Actor Not Found'; } else { fetchedActorNames[actorId] = 'Error'; console.error(`Error fetching actor ${actorId}: ${response.statusText}`); return 'Error'; } } catch (error) { fetchedActorNames[actorId] = 'Error'; console.error(`Network error fetching actor ${actorId}:`, error); return 'Error'; }
        };
        const actorFetchPromises = [];
        sortedSteps.forEach(step => { if (step.initiatorActorId && !fetchedActorNames[step.initiatorActorId]) { actorFetchPromises.push(fetchActorName(step.initiatorActorId)); } if (step.partnerActorId && !fetchedActorNames[step.partnerActorId]) { actorFetchPromises.push(fetchActorName(step.partnerActorId)); } });
        await Promise.all(actorFetchPromises);
        sortedSteps.forEach(step => {
            const initiatorName = fetchedActorNames[step.initiatorActorId] || 'N/A'; const partnerName = fetchedActorNames[step.partnerActorId] || 'N/A';
            const actionHtml = simpleMarkdownToHtml(step.action); const outcomeHtml = simpleMarkdownToHtml(step.expectedOutcome);
            const evidence = step.evidenceRequired ? 'Yes' : 'No'; const responsible = step.responsibleForResult || '';
            const row = tableBody.insertRow(); row.insertCell().textContent = step.stepNumber || '-';
            const initiatorCell = row.insertCell(); initiatorCell.innerHTML = responsible === 'initiator' ? `<b>${initiatorName}</b>` : initiatorName;
            const partnerCell = row.insertCell(); partnerCell.innerHTML = responsible === 'partner' ? `<b>${partnerName}</b>` : partnerName;
            row.insertCell().innerHTML = actionHtml; row.insertCell().innerHTML = outcomeHtml; row.insertCell().textContent = evidence;
        });
        const loadingIndicator = container.querySelector('p'); if (loadingIndicator && loadingIndicator.textContent.includes('Loading')) { loadingIndicator.remove(); }
    } catch (error) { console.error("Error populating test steps table:", error); container.innerHTML = '<p>Error loading test steps.</p>'; }
}


// Function to print modal content
function printModalContent() {
    window.print();
}
