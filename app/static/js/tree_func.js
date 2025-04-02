// Header toggling
function toggleHeader() {
    const header = document.querySelector('.header');
    const toggle = document.querySelector('.header-toggle');
    header.classList.toggle('collapsed');
    toggle.classList.toggle('collapsed');
    
    // Store the state in localStorage to remember user preference
    localStorage.setItem('searchPanelCollapsed', header.classList.contains('collapsed'));
    
    // Update the toggle icon based on state
    const icon = toggle.querySelector('i');
    if (header.classList.contains('collapsed')) {
        icon.className = 'fas fa-search-plus';
    } else {
        icon.className = 'fas fa-search';
    }
}

// Theme toggling
function toggleTheme() {
    document.documentElement.setAttribute('data-theme', 
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    );
}

// Tree toggling
document.addEventListener('DOMContentLoaded', function() {
    const toggles = document.querySelectorAll('.tree-toggle');
    toggles.forEach(function(toggle) {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggle.classList.toggle('collapsed');
        });
    });

    // Check for preferred color scheme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Check if panel was previously collapsed
    if (localStorage.getItem('searchPanelCollapsed') === 'true') {
        const header = document.querySelector('.header');
        const toggle = document.querySelector('.header-toggle');
        header.classList.add('collapsed');
        toggle.classList.add('collapsed');
        toggle.querySelector('i').className = 'fas fa-search-plus';
    }

    // Initialize tree view
    expandInitialLevels();

    // Set up search input event listeners
    const searchInput = document.getElementById('searchInput');
    const tcaSearchInput = document.getElementById('tcaSearchInput');
    const actorSearchInput = document.getElementById('actorSearchInput');
    const functionSearchInput = document.getElementById('functionSearchInput');

    searchInput.addEventListener('input', debounce(function(e) {
        performSearch(e.target.value.toLowerCase(), 'sreq');
    }, 300));

    tcaSearchInput.addEventListener('input', debounce(function(e) {
        performSearch(e.target.value.toLowerCase(), 'tca');
    }, 300));

    actorSearchInput.addEventListener('input', debounce(function(e) {
        performSearch(e.target.value.toLowerCase(), 'actor');
    }, 300));

    functionSearchInput.addEventListener('input', debounce(function(e) {
        performSearch(e.target.value.toLowerCase(), 'function');
    }, 300));
});

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
        // If search is empty, restore initial state and remove all highlights
        expandInitialLevels();
        document.querySelectorAll('.highlight-match').forEach(el => {
            const parent = el.parentNode;
            if (parent) {
                parent.textContent = parent.textContent; // This removes the highlight span while preserving the text
            }
        });
        return;
    }

    const allItems = document.querySelectorAll('.tree-item');
    const matchedItems = new Set();
    
    // Remove all highlights before new search
    document.querySelectorAll('.highlight-match').forEach(el => {
        el.classList.remove('highlight-match');
    });

    if (searchType === 'sreq') {
        // For SREQ search, match level-3 items (SREQs)
        document.querySelectorAll('.level-3').forEach(sreqItem => {
            const sreqDiv = sreqItem.querySelector('.tree-item');
            const sreqText = sreqDiv.textContent.toLowerCase();
            if (sreqText.includes(searchTerm)) {
                // Add the matched SREQ
                matchedItems.add(sreqDiv);
                
                // Get the tooltip attribute
                const tooltipAttr = sreqDiv.getAttribute('data-tooltip');
                
                // Get the text content
                const text = sreqDiv.textContent;
                
                // Create a temporary div to build the highlighted content
                const tempDiv = document.createElement('div');
                tempDiv.className = 'tree-item tooltip';
                tempDiv.setAttribute('data-tooltip', tooltipAttr);
                
                // Split text and wrap matches with highlight span
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                const parts = text.split(regex);
                parts.forEach((part, i) => {
                    if (i % 2 === 0) {
                        // Regular text
                        tempDiv.appendChild(document.createTextNode(part));
                    } else {
                        // Matched text
                        const span = document.createElement('span');
                        span.className = 'highlight-match';
                        span.textContent = part;
                        tempDiv.appendChild(span);
                    }
                });
                
                // Update the SREQ div with the highlighted content
                sreqDiv.innerHTML = tempDiv.innerHTML;
                
                // Add all test cases and their actors under this SREQ
                const testCases = sreqItem.querySelectorAll('.level-4');
                testCases.forEach(testCase => {
                    matchedItems.add(testCase.querySelector('.tree-item'));
                    // Add all actors for this test case
                    const actors = testCase.querySelectorAll('.level-5');
                    actors.forEach(actor => {
                        matchedItems.add(actor.querySelector('.tree-item'));
                    });
                    // Ensure test case is expanded to show actors
                    testCase.classList.remove('collapsed');
                });
                
                // Add parent items (SI and Function) to keep hierarchy and ensure they're expanded
                let parent = sreqItem.parentElement;
                while (parent && parent.id !== 'sreqRoot') {
                    const parentLi = parent.closest('li');
                    if (parentLi) {
                        matchedItems.add(parentLi.querySelector('.tree-item'));
                        parentLi.classList.remove('collapsed'); // Ensure parent is expanded
                    }
                    parent = parent.closest('li')?.parentElement;
                }
                
                // Ensure the SREQ itself is expanded
                sreqItem.classList.remove('collapsed');
            }
        });
    } else if (searchType === 'tca') {
        // For TCA search, match level-4 items (test cases)
        document.querySelectorAll('.level-4').forEach(li => {
            const tcaDiv = li.querySelector('.tree-item');
            const tcaText = tcaDiv.textContent.toLowerCase();
            if (tcaText.includes(searchTerm)) {
                matchedItems.add(tcaDiv);
                
                // Get the link and text content
                const link = tcaDiv.querySelector('a');
                const linkHtml = link ? link.outerHTML : '';
                const [_, textContent] = tcaText.split('->');
                
                if (textContent) {
                    // Split and highlight the matching text
                    const regex = new RegExp(`(${searchTerm})`, 'gi');
                    const parts = textContent.trim().split(regex);
                    let highlightedText = '';
                    parts.forEach((part, i) => {
                        if (i % 2 === 0) {
                            highlightedText += part;
                        } else {
                            highlightedText += `<span class="highlight-match">${part}</span>`;
                        }
                    });
                    
                    // Update the content while preserving the node and its event listeners
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = linkHtml + ' -> ' + highlightedText;
                    
                    // Preserve the tree-toggle functionality
                    tcaDiv.innerHTML = tempDiv.innerHTML;
                    
                    // Add all child actors to matches
                    const actorItems = li.querySelectorAll('.level-5');
                    actorItems.forEach(actorLi => {
                        matchedItems.add(actorLi.querySelector('.tree-item'));
                    });
                    
                    // Ensure the parent li still has the click event and is expanded
                    if (!li._hasClickListener) {
                        li.addEventListener('click', function(e) {
                            e.stopPropagation();
                            this.classList.toggle('collapsed');
                        });
                        li._hasClickListener = true;
                    }
                    li.classList.remove('collapsed'); // Ensure the actors are visible
                }
                
                // Add parent items to matches
                let parent = li.parentElement;
                while (parent && parent.id !== 'sreqRoot') {
                    const parentLi = parent.closest('li');
                    if (parentLi) {
                        matchedItems.add(parentLi.querySelector('.tree-item'));
                        parentLi.classList.remove('collapsed'); // Ensure the hierarchy is expanded
                    }
                    parent = parent.closest('li')?.parentElement;
                }
            }
        });
    } else if (searchType === 'function') {
        // For function search, match level-2 items (functions)
        document.querySelectorAll('.level-2').forEach(functionItem => {
            const functionDiv = functionItem.querySelector('.tree-item');
            const functionText = functionDiv.textContent.toLowerCase();
            if (functionText.includes(searchTerm)) {
                // Add the matched function
                matchedItems.add(functionDiv);
                
                // Highlight the function name
                const text = functionDiv.textContent;
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                const parts = text.split(regex);
                functionDiv.innerHTML = parts.map((part, i) => 
                    i % 2 === 0 ? part : `<span class="highlight-match">${part}</span>`
                ).join('');
                
                // Add all SREQs under this function
                const sreqs = functionItem.querySelectorAll('.level-3');
                sreqs.forEach(sreq => {
                    matchedItems.add(sreq.querySelector('.tree-item'));
                    // Add all test cases for this SREQ
                    const testCases = sreq.querySelectorAll('.level-4');
                    testCases.forEach(testCase => {
                        matchedItems.add(testCase.querySelector('.tree-item'));
                        // Add all actors for this test case
                        const actors = testCase.querySelectorAll('.level-5');
                        actors.forEach(actor => {
                            matchedItems.add(actor.querySelector('.tree-item'));
                        });
                        testCase.classList.remove('collapsed');
                    });
                    sreq.classList.remove('collapsed');
                });
                
                // Add parent SI to keep hierarchy
                const parentSI = functionItem.closest('.level-1');
                if (parentSI) {
                    matchedItems.add(parentSI.querySelector('.tree-item'));
                    parentSI.classList.remove('collapsed');
                }
                
                // Ensure the function itself is expanded
                functionItem.classList.remove('collapsed');
            }
        });
    } else if (searchType === 'actor') {
        // For actor search, match level-5 items (actors)
        document.querySelectorAll('.level-4').forEach(testCase => {
            const actorItems = testCase.querySelectorAll('.level-5');
            let hasMatch = false;
            
            // First pass: check if any actor matches
            actorItems.forEach(li => {
                if (li.textContent.toLowerCase().includes(searchTerm)) {
                    hasMatch = true;
                }
            });

            // If we found a match, show all actors but highlight the matching ones
            if (hasMatch) {
                // Add the test case and all its actors
                matchedItems.add(testCase.querySelector('.tree-item'));
                actorItems.forEach(li => {
                    matchedItems.add(li.querySelector('.tree-item'));
                    // Highlight matching actors
                    const actorText = li.querySelector('.tree-item span');
                    if (actorText.textContent.toLowerCase().includes(searchTerm)) {
                        actorText.classList.add('highlight-match');
                    } else {
                        actorText.classList.remove('highlight-match');
                    }
                });

                // Add parent items to maintain hierarchy
                let parent = testCase.parentElement;
                while (parent && parent.id !== 'sreqRoot') {
                    const parentItem = parent.closest('li')?.querySelector('.tree-item');
                    if (parentItem) {
                        matchedItems.add(parentItem);
                    }
                    parent = parent.closest('li')?.parentElement;
                }
            }
        });

        // Remove highlight when search is cleared
        if (searchTerm === '') {
            document.querySelectorAll('.highlight-match').forEach(el => {
                const parent = el.parentNode;
                if (parent) {
                    parent.textContent = parent.textContent; // This removes the highlight span while preserving the text
                }
            });
        }
    }
    
    // Hide/show items based on matches
    allItems.forEach(item => {
        const li = item.closest('li');
        if (!matchedItems.has(item)) {
            li.style.display = 'none';
        } else {
            li.style.display = '';
            // Keep tree-toggle functionality
            if (li.classList.contains('tree-toggle')) {
                // Only auto-expand if it's part of a search match path
                const isMatchPath = Array.from(matchedItems).some(matchedItem => 
                    matchedItem.closest('li').contains(li) || li.contains(matchedItem.closest('li'))
                );
                if (isMatchPath) {
                    li.classList.remove('collapsed');
                }
            }
        }
    });
}

// Debounce function to prevent too many rapid searches
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize
function expandInitialLevels() {
    document.querySelectorAll('.level-1').forEach(element => {
        element.classList.remove('collapsed');
    });
    document.querySelectorAll('.level-2').forEach(element => {
        element.classList.add('collapsed');
    });
}

// Loading state
function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loading';
    loader.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.querySelector('.loading');
    if (loader) {
        loader.remove();
    }
}

// Function to toggle uncovered SREQs visibility
let uncoveredSreqsVisible = false;
function toggleUncoveredSreqs(button) {
    uncoveredSreqsVisible = !uncoveredSreqsVisible;
    
    if (uncoveredSreqsVisible) {
        // Show only uncovered SREQs
        document.querySelectorAll('.level-3:not(.no-children)').forEach(item => {
            item.style.display = 'none';
        });
        document.querySelectorAll('.level-4').forEach(item => {
            item.style.display = 'none';
        });
        // Show all level-1, level-2 items and uncovered level-3 items
        document.querySelectorAll('.level-1, .level-2, .level-3.no-children').forEach(item => {
            item.style.display = '';
        });
        // Expand level-1 items
        document.querySelectorAll('.level-1').forEach(item => {
            item.classList.remove('collapsed');
        });
        button.textContent = 'Show All SREQs';
    } else {
        // Show all items
        document.querySelectorAll('.tree-item').forEach(item => {
            item.closest('li').style.display = '';
        });
        button.textContent = 'Show Uncovered SREQs';
        // Restore initial state
        expandInitialLevels();
    }
}
