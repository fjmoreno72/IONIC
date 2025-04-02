// Header toggling
function toggleHeader() {
    const header = document.querySelector('.header');
    const toggle = document.querySelector('.header-toggle');
    header.classList.toggle('collapsed');
    toggle.classList.toggle('collapsed');
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
    
    if (searchType === 'sreq') {
        // For SREQ search, match level-3 items (SREQs)
        document.querySelectorAll('.level-3').forEach(li => {
            const item = li.querySelector('.tree-item');
            if (item && item.textContent.toLowerCase().includes(searchTerm)) {
                matchedItems.add(item);
                // Add parent items to matches
                let parent = li.parentElement;
                while (parent && parent.id !== 'sreqRoot') {
                    const parentItem = parent.closest('li')?.querySelector('.tree-item');
                    if (parentItem) {
                        matchedItems.add(parentItem);
                    }
                    parent = parent.closest('li')?.parentElement;
                }
                // Also show test cases for matched SREQ
                li.querySelectorAll('.level-4 .tree-item').forEach(testItem => {
                    matchedItems.add(testItem);
                });
            }
        });
    } else if (searchType === 'tca') {
        // For TCA search, match level-4 items (test cases)
        document.querySelectorAll('.level-4').forEach(li => {
            if (li.textContent.toLowerCase().includes(searchTerm)) {
                matchedItems.add(li.querySelector('.tree-item'));
                // Add parent items to matches
                let parent = li.parentElement;
                while (parent && parent.id !== 'sreqRoot') {
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
        
        if (!isMatched) {
            // Don't hide level-4 items if their parent level-3 is matched
            const parentLevel3 = li.parentElement?.closest('.level-3');
            const parentLevel3Matched = parentLevel3 && 
                matchedItems.has(parentLevel3.querySelector('.tree-item'));
            
            if (!parentLevel3Matched) {
                li.style.display = 'none';
            }
        } else {
            li.style.display = '';
            if (li.classList.contains('tree-toggle')) {
                li.classList.remove('collapsed');
            }
        }

        // Ensure parent containers are visible and expanded
        let parent = li.parentElement;
        while (parent && parent.id !== 'sreqRoot') {
            if (parent.classList.contains('nested')) {
                parent.style.display = '';
                const parentLi = parent.closest('li');
                if (parentLi) {
                    parentLi.classList.remove('collapsed');
                }
            }
            parent = parent.parentElement;
        }
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

// Function to expand first two levels on load
function expandInitialLevels() {
    document.querySelectorAll('.level-1').forEach(element => {
        element.classList.remove('collapsed');
    });
    // Ensure level 2-3 starts collapsed
    document.querySelectorAll('.level-2, .level-3').forEach(element => {
        element.classList.add('collapsed');
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Set up tree toggle functionality
    const toggles = document.querySelectorAll('.tree-toggle');
    toggles.forEach(function(toggle) {
        const nestedUl = toggle.querySelector('.nested');

        if (!nestedUl) {
            toggle.classList.add('leaf');
            return;
        }

        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggle.classList.toggle('collapsed');
        });
    });

    // Set up search input event listeners
    const searchInput = document.getElementById('searchInput');
    const tcaSearchInput = document.getElementById('tcaSearchInput');

    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            performSearch(e.target.value.toLowerCase(), 'sreq');
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
