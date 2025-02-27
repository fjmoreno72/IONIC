// Header toggling
function toggleHeader() {
    const header = document.querySelector('.header');
    const toggle = document.querySelector('.header-toggle');
    header.classList.toggle('collapsed');
    toggle.classList.toggle('collapsed');
}

// Tree toggling
function setupTreeToggles() {
    const toggles = document.querySelectorAll('.tree-toggle');
    toggles.forEach(function(toggle) {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggle.classList.toggle('collapsed');
        });
    });
}

function toggleLevel(level, expand) {
    const elements = document.querySelectorAll(`.level-${level}`);
    elements.forEach(element => {
        if (expand) {
            element.classList.remove('collapsed');
        } else {
            element.classList.add('collapsed');
        }
    });
}

// Enhanced Search functionality
function performSearch(searchTerm, searchType) {
    // Reset all items visibility first
    document.querySelectorAll('.tree-item').forEach(item => {
        item.closest('li').style.display = '';
    });
    
    if (searchTerm === '') {
        // If search is empty, restore initial state
        expandInitialLevels();
        return;
    }

    const allItems = document.querySelectorAll('.tree-item');
    const matchedItems = new Set();
    
    if (searchType === 'ier') {
        // For IER search, match level-1 and level-2 items
        allItems.forEach(item => {
            const li = item.closest('li');
            if (li.classList.contains('level-1') || li.classList.contains('level-2')) {
                if (item.textContent.toLowerCase().includes(searchTerm)) {
                    matchedItems.add(item);
                    // Add all parent items to matches
                    let parent = li.parentElement;
                    while (parent && parent.id !== 'ierRoot') {
                        const parentItem = parent.closest('li')?.querySelector('.tree-item');
                        if (parentItem) {
                            matchedItems.add(parentItem);
                        }
                        parent = parent.closest('li')?.parentElement;
                    }
                    // Add all child items (IDP and Test Cases) to matches
                    if (li.classList.contains('level-2')) {
                        li.querySelectorAll('.level-3, .level-4').forEach(child => {
                            const childItem = child.querySelector('.tree-item');
                            if (childItem) {
                                matchedItems.add(childItem);
                            }
                        });
                    }
                }
            }
        });
    } else if (searchType === 'tca') {
        // For TCA search, match level-4 items (test cases)
        document.querySelectorAll('.level-4').forEach(li => {
            if (li.textContent.toLowerCase().includes(searchTerm)) {
                // Add parent items to matches
                let parent = li.parentElement;
                while (parent && parent.id !== 'ierRoot') {
                    const parentItem = parent.closest('li')?.querySelector('.tree-item');
                    if (parentItem) {
                        matchedItems.add(parentItem);
                    }
                    parent = parent.closest('li')?.parentElement;
                }
            }
        });
    }
    
    // Hide/show items based on matches
    allItems.forEach(item => {
        const li = item.closest('li');
        const isMatched = matchedItems.has(item);
        
        if (searchType === 'tca') {
            // For TCA search, also check if this item has any visible level-4 children
            const hasVisibleTestCase = li.querySelectorAll('.level-4').length > 0 &&
                Array.from(li.querySelectorAll('.level-4')).some(testCase => 
                    testCase.textContent.toLowerCase().includes(searchTerm)
                );
            
            if (!isMatched && !hasVisibleTestCase) {
                li.style.display = 'none';
            } else {
                li.style.display = '';
                if (li.classList.contains('tree-toggle')) {
                    li.classList.remove('collapsed');
                }
            }
        } else {
            // For IER search
            if (!isMatched) {
                li.style.display = 'none';
            } else {
                li.style.display = '';
                if (li.classList.contains('tree-toggle')) {
                    li.classList.remove('collapsed');
                    // When an IER is matched, expand all its child levels
                    if (li.classList.contains('level-2')) {
                        li.querySelectorAll('.level-3').forEach(child => {
                            child.classList.remove('collapsed');
                        });
                    }
                }
            }
        }

        // Ensure parent containers are visible and expanded
        let parent = li.parentElement;
        while (parent && parent.id !== 'ierRoot') {
            if (parent.classList.contains('nested')) {
                parent.style.display = '';
                parent.parentElement.classList.remove('collapsed');
            }
            parent = parent.parentElement;
        }
    });

    // For TCA search, handle level-4 items separately
    if (searchType === 'tca') {
        document.querySelectorAll('.level-4').forEach(li => {
            if (!li.textContent.toLowerCase().includes(searchTerm)) {
                li.style.display = 'none';
            } else {
                li.style.display = '';
            }
        });
    }
}

// Initialize
function expandInitialLevels() {
    document.querySelectorAll('.level-1').forEach(element => {
        element.classList.remove('collapsed');
    });
    document.querySelectorAll('.level-2, .level-3').forEach(element => {
        element.classList.add('collapsed');
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Set up tree toggle functionality
    setupTreeToggles();

    // Add search event listeners if elements exist
    const ierSearchInput = document.getElementById('ierSearchInput');
    const tcaSearchInput = document.getElementById('tcaSearchInput');

    if (ierSearchInput) {
        ierSearchInput.addEventListener('input', function(e) {
            performSearch(e.target.value.toLowerCase(), 'ier');
        });
    }

    if (tcaSearchInput) {
        tcaSearchInput.addEventListener('input', function(e) {
            performSearch(e.target.value.toLowerCase(), 'tca');
        });
    }

    // Initialize tree view
    expandInitialLevels();
});
