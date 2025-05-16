// Variables to store data and chart instances
let allTestResults = [];
let filteredTestResults = [];
let charts = {};

// Filter elements
const objectiveStatFilter = document.getElementById('objectiveStatFilter');
const statusStatFilter = document.getElementById('statusStatFilter');
const participantStatFilter = document.getElementById('participantStatFilter');
const dateRangeStart = document.getElementById('dateRangeStart');
const dateRangeEnd = document.getElementById('dateRangeEnd');
const loadingStats = document.getElementById('loadingStats');
const noStatsData = document.getElementById('noStatsData');

// Initialize Choices.js for multi-select filters
let objectiveChoices = null;
let participantChoices = null;

// Chart colors (dark mode compatible)
const chartColors = [
    '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f',
    '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'
];

// Initialize Choices.js for multi-select dropdowns
function initializeChoices(elementId, placeholder) {
    const element = document.getElementById(elementId);
    if (element) {
        return new Choices(element, {
            removeItemButton: true,
            placeholder: true,
            placeholderValue: placeholder,
            searchPlaceholderValue: 'Search...',
            itemSelectText: '',
            allowHTML: false,
        });
    }
    return null;
}

// Fetch test results data for statistics
async function fetchStatisticsData() {
    if (loadingStats) loadingStats.classList.remove('d-none');
    if (noStatsData) noStatsData.classList.add('d-none');

    try {
        const response = await fetch('/api/test_results_data');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiResponse = await response.json();

        allTestResults = apiResponse.data || [];
        const filters = apiResponse.filters || {};

        // Initialize Choices instances if not already done
        try {
            if (!objectiveChoices) {
                objectiveChoices = initializeChoices('objectiveStatFilter', 'Select Objectives...');
            }
            if (!participantChoices) {
                participantChoices = initializeChoices('participantStatFilter', 'Select Participants...');
            }

            // Populate filter dropdowns
            populateFilterDropdown(objectiveChoices, filters.objectives || [], 'objective');
            populateFilterDropdown(statusStatFilter, filters.statuses || [], 'status');
            populateFilterDropdown(participantChoices, filters.participants || [], 'participant');

            // Apply filters and render charts
            applyStatFilters();
        } catch (initError) {
            console.error('Error initializing UI components:', initError);
            if (noStatsData) {
                noStatsData.classList.remove('d-none');
                noStatsData.querySelector('p').textContent = `Error initializing UI: ${initError.message}`;
            }
        }
        
    } catch (error) {
        console.error('Error fetching statistics data:', error);
        if (loadingStats) loadingStats.classList.add('d-none');
        if (noStatsData) {
            noStatsData.classList.remove('d-none');
            noStatsData.querySelector('p').textContent = `Error loading data: ${error.message}`;
        }
    } finally {
        if (loadingStats) loadingStats.classList.add('d-none');
    }
}

// Helper function to populate a filter dropdown (handles both standard select and Choices.js)
function populateFilterDropdown(elementOrChoicesInstance, options, filterType) {
    if (!elementOrChoicesInstance) return;

    const choicesOptions = options.map(optionValue => ({
        value: optionValue,
        label: optionValue,
        selected: false,
        disabled: false,
    }));

    if (elementOrChoicesInstance instanceof Choices) {
        // It's a Choices.js instance
        elementOrChoicesInstance.clearStore();
        elementOrChoicesInstance.setChoices(choicesOptions, 'value', 'label', true);
    } else if (elementOrChoicesInstance.tagName === 'SELECT') {
        // It's a standard select element
        // Clear existing options except the first one ("All...")
        while (elementOrChoicesInstance.options.length > 1) {
            elementOrChoicesInstance.remove(1);
        }
        // Add new options
        options.forEach(optionValue => {
            if (optionValue) {
                const option = document.createElement('option');
                option.value = optionValue;
                option.textContent = optionValue;
                elementOrChoicesInstance.appendChild(option);
            }
        });
    }
}

// Apply filters and update charts
function applyStatFilters() {
    // Get filter values
    const selectedObjectives = objectiveChoices ? objectiveChoices.getValue(true) : [];
    const selectedParticipants = participantChoices ? participantChoices.getValue(true) : [];
    const statusFilterValue = statusStatFilter ? statusStatFilter.value : '';
    
    // Get date range values
    const startDate = dateRangeStart && dateRangeStart.value ? new Date(dateRangeStart.value) : null;
    const endDate = dateRangeEnd && dateRangeEnd.value ? new Date(dateRangeEnd.value) : null;

    filteredTestResults = allTestResults.filter(result => {
        // Multi-select checks
        const matchesObjective = selectedObjectives.length === 0 || selectedObjectives.includes(result.objectiveKey);
        const matchesParticipant = selectedParticipants.length === 0 ||
            selectedParticipants.includes(result.coordinator) ||
            (result.partners && result.partners.some(p => selectedParticipants.includes(p))) ||
            (result.observers && result.observers.some(o => selectedParticipants.includes(o)));

        // Standard dropdown checks
        const matchesStatus = statusFilterValue === '' || result.status === statusFilterValue;

        // Date range check - only apply if result has a plannedDate
        let matchesDateRange = true;
        const plannedDate = result.plannedDate ? new Date(result.plannedDate) : null;
        
        // Skip date filtering if the test has no planned date
        if (plannedDate && !isNaN(plannedDate.getTime())) {
            if (startDate && !isNaN(startDate.getTime())) {
                matchesDateRange = plannedDate >= startDate;
            }
            if (endDate && !isNaN(endDate.getTime())) {
                matchesDateRange = matchesDateRange && plannedDate <= endDate;
            }
        } else if ((startDate && !isNaN(startDate.getTime())) || (endDate && !isNaN(endDate.getTime()))) {
            // If date filters are active and test has no date, exclude it
            matchesDateRange = false;
        }

        return matchesObjective && matchesStatus && matchesParticipant && matchesDateRange;
    });

    updateCharts();
}

// Get responsive font and padding sizes based on screen width
function getResponsiveSizes() {
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    
    if (width < 480) {
        return { 
            fontSize: 10, 
            titleSize: 12, 
            padding: 5,
            ticksLimit: 5
        };
    } else if (width < 768) {
        return { 
            fontSize: 11, 
            titleSize: 14,
            padding: 8,
            ticksLimit: 8
        };
    } else {
        return { 
            fontSize: 12, 
            titleSize: 16,
            padding: 10,
            ticksLimit: 10
        };
    }
}

// Update all chart visualizations
function updateCharts() {
    // Check if Chart is available
    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded properly');
        if (noStatsData) {
            noStatsData.classList.remove('d-none');
            noStatsData.querySelector('p').textContent = "Error: Chart.js library is not available. Please refresh the page.";
        }
        return;
    }

    if (filteredTestResults.length === 0) {
        if (noStatsData) {
            noStatsData.classList.remove('d-none');
            noStatsData.querySelector('p').textContent = "No test results found matching your criteria.";
        }
        // Clear existing charts
        Object.values(charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                try {
                    chart.destroy();
                } catch (e) {
                    console.error('Error destroying chart:', e);
                }
            }
        });
        charts = {};
        return;
    }

    if (noStatsData) noStatsData.classList.add('d-none');

    // Get responsive sizes for chart elements
    const sizes = getResponsiveSizes();
    
    // Force reflow of chart containers to ensure proper dimensions
    document.querySelectorAll('.chart-container').forEach(container => {
        // Trigger reflow
        void container.offsetHeight;
    });
    
    // Generate chart data
    try {
        createTestsPerDayChart(sizes);
        createTestsByStatusChart(sizes);
        createTestsByObjectiveChart(sizes);
        createTestsByParticipantChart(sizes);
    } catch (e) {
        console.error('Error creating charts:', e);
        if (noStatsData) {
            noStatsData.classList.remove('d-none');
            noStatsData.querySelector('p').textContent = `Error creating charts: ${e.message}`;
        }
    }
}

// Create the Tests Per Day Chart
function createTestsPerDayChart(sizes) {
    const ctx = document.getElementById('testsPerDayChart');
    if (!ctx) return;

    // Group tests by date - only consider tests with valid plannedDate
    const testsByDay = {};
    let testsWithoutDate = 0;
    
    filteredTestResults.forEach(result => {
        if (result.plannedDate) {
            try {
                const date = new Date(result.plannedDate);
                if (!isNaN(date.getTime())) {
                    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                    
                    if (!testsByDay[dateString]) {
                        testsByDay[dateString] = 0;
                    }
                    testsByDay[dateString]++;
                } else {
                    testsWithoutDate++;
                }
            } catch (e) {
                testsWithoutDate++;
                console.error("Error parsing date:", e);
            }
        } else {
            testsWithoutDate++;
        }
    });

    // Sort dates chronologically
    const sortedDates = Object.keys(testsByDay).sort();
    const counts = sortedDates.map(date => testsByDay[date]);
    
    // Format dates for display
    const formattedDates = sortedDates.map(dateStr => {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });

    // Safely destroy existing chart if any
    safeDestroyChart(charts.testsPerDay, ctx);
    
    // Limit number of ticks on smaller screens
    const maxTicksLimit = sizes.ticksLimit;

    // Create new chart
    try {
        charts.testsPerDay = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: formattedDates,
                datasets: [{
                    label: 'Tests Per Day',
                    data: counts,
                    backgroundColor: chartColors[0],
                    borderColor: chartColors[0],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: testsWithoutDate > 0 ? 
                            `Tests Per Day (${testsWithoutDate} tests without planned date)` : 
                            'Tests Per Day',
                        font: {
                            size: sizes.titleSize
                        },
                        padding: {
                            top: sizes.padding,
                            bottom: sizes.padding
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: maxTicksLimit,
                            maxRotation: 45,
                            minRotation: 0,
                            font: {
                                size: sizes.fontSize
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            font: {
                                size: sizes.fontSize
                            }
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error("Error creating testsPerDay chart:", e);
    }
}

// Helper function to safely destroy and prepare a chart
function safeDestroyChart(chartInstance, canvasElement) {
    if (chartInstance) {
        try {
            chartInstance.destroy();
        } catch (e) {
            console.error("Error destroying chart:", e);
        }
    }
    
    // Clear the canvas
    try {
        const ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    } catch (e) {
        console.error("Error clearing canvas:", e);
    }
}

// Create the Tests By Status Chart
function createTestsByStatusChart(sizes) {
    const ctx = document.getElementById('testsByStatusChart');
    if (!ctx) return;

    // Group tests by status
    const statusCounts = {};
    filteredTestResults.forEach(result => {
        const status = result.status || 'Unknown';
        if (!statusCounts[status]) {
            statusCounts[status] = 0;
        }
        statusCounts[status]++;
    });

    const statuses = Object.keys(statusCounts);
    const counts = statuses.map(status => statusCounts[status]);

    // Safely destroy existing chart if any
    safeDestroyChart(charts.testsByStatus, ctx);

    // Create new chart
    try {
        charts.testsByStatus = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: statuses,
                datasets: [{
                    data: counts,
                    backgroundColor: statuses.map((_, i) => chartColors[i % chartColors.length]),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tests By Status',
                        font: {
                            size: sizes.titleSize
                        },
                        padding: {
                            top: sizes.padding,
                            bottom: sizes.padding
                        }
                    },
                    legend: {
                        position: window.innerWidth < 768 ? 'bottom' : 'right',
                        labels: {
                            boxWidth: sizes.fontSize * 2,
                            font: {
                                size: sizes.fontSize
                            }
                        }
                    },
                    tooltip: {
                        bodyFont: {
                            size: sizes.fontSize
                        },
                        titleFont: {
                            size: sizes.fontSize
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error("Error creating testsByStatus chart:", e);
    }
}

// Create the Tests By Objective Chart
function createTestsByObjectiveChart(sizes) {
    const ctx = document.getElementById('testsByObjectiveChart');
    if (!ctx) return;

    // Group tests by objective
    const objectiveCounts = {};
    filteredTestResults.forEach(result => {
        const objective = result.objectiveKey || 'Unknown';
        if (!objectiveCounts[objective]) {
            objectiveCounts[objective] = 0;
        }
        objectiveCounts[objective]++;
    });

    // Sort by count (descending) and limit based on screen size
    const maxItems = window.innerWidth < 768 ? 5 : 10;
    const sortedObjectives = Object.entries(objectiveCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxItems);

    const objectives = sortedObjectives.map(entry => entry[0]);
    const counts = sortedObjectives.map(entry => entry[1]);

    // Safely destroy existing chart if any
    safeDestroyChart(charts.testsByObjective, ctx);

    // Create new chart
    try {
        charts.testsByObjective = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: objectives,
                datasets: [{
                    label: 'Test Count',
                    data: counts,
                    backgroundColor: chartColors.slice(0, counts.length),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Top ${maxItems} Objectives by Test Count`,
                        font: {
                            size: sizes.titleSize
                        },
                        padding: {
                            top: sizes.padding,
                            bottom: sizes.padding
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        bodyFont: {
                            size: sizes.fontSize
                        },
                        titleFont: {
                            size: sizes.fontSize
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            font: {
                                size: sizes.fontSize
                            }
                        }
                    },
                    y: {
                        ticks: {
                            callback: function(value) {
                                const label = this.getLabelForValue(value);
                                // Truncate long labels on small screens
                                if (window.innerWidth < 768 && label.length > 15) {
                                    return label.substr(0, 12) + '...';
                                }
                                return label;
                            },
                            font: {
                                size: sizes.fontSize
                            }
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error("Error creating testsByObjective chart:", e);
    }
}

// Create the Tests By Participant Chart
function createTestsByParticipantChart(sizes) {
    const ctx = document.getElementById('testsByParticipantChart');
    if (!ctx) return;

    // Count tests by participant (coordinator, partners, observers)
    const participantCounts = {};
    
    filteredTestResults.forEach(result => {
        // Count coordinator
        if (result.coordinator) {
            if (!participantCounts[result.coordinator]) {
                participantCounts[result.coordinator] = 0;
            }
            participantCounts[result.coordinator]++;
        }
        
        // Count partners
        if (result.partners && Array.isArray(result.partners)) {
            result.partners.forEach(partner => {
                if (partner) {
                    if (!participantCounts[partner]) {
                        participantCounts[partner] = 0;
                    }
                    participantCounts[partner]++;
                }
            });
        }
        
        // Count observers
        if (result.observers && Array.isArray(result.observers)) {
            result.observers.forEach(observer => {
                if (observer) {
                    if (!participantCounts[observer]) {
                        participantCounts[observer] = 0;
                    }
                    participantCounts[observer]++;
                }
            });
        }
    });

    // Sort by count (descending) and limit based on screen size
    const maxItems = window.innerWidth < 768 ? 5 : 10;
    const sortedParticipants = Object.entries(participantCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxItems);

    const participants = sortedParticipants.map(entry => entry[0]);
    const counts = sortedParticipants.map(entry => entry[1]);

    // Safely destroy existing chart if any
    safeDestroyChart(charts.testsByParticipant, ctx);

    // Create new chart
    try {
        charts.testsByParticipant = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: participants,
                datasets: [{
                    label: 'Test Count',
                    data: counts,
                    backgroundColor: chartColors[2],
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Top ${maxItems} Participants by Test Count`,
                        font: {
                            size: sizes.titleSize
                        },
                        padding: {
                            top: sizes.padding,
                            bottom: sizes.padding
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        bodyFont: {
                            size: sizes.fontSize
                        },
                        titleFont: {
                            size: sizes.fontSize
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0,
                            font: {
                                size: sizes.fontSize
                            }
                        }
                    },
                    y: {
                        ticks: {
                            callback: function(value) {
                                const label = this.getLabelForValue(value);
                                // Truncate long labels on small screens
                                if (window.innerWidth < 768 && label.length > 15) {
                                    return label.substr(0, 12) + '...';
                                }
                                return label;
                            },
                            font: {
                                size: sizes.fontSize
                            }
                        }
                    }
                }
            }
        });
    } catch (e) {
        console.error("Error creating testsByParticipant chart:", e);
    }
}

// Theme toggling
function toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? '' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Redraw charts if they exist
    if (Object.keys(charts).length > 0) {
        updateCharts();
    }
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
    fetchStatisticsData(); // Initial data load

    // Filter change listeners
    if (objectiveStatFilter) objectiveStatFilter.addEventListener('change', applyStatFilters);
    if (statusStatFilter) statusStatFilter.addEventListener('change', applyStatFilters);
    if (participantStatFilter) participantStatFilter.addEventListener('change', applyStatFilters);
    if (dateRangeStart) dateRangeStart.addEventListener('change', applyStatFilters);
    if (dateRangeEnd) dateRangeEnd.addEventListener('change', applyStatFilters);

    // Handle window resize to update charts
    window.addEventListener('resize', function() {
        if (Object.keys(charts).length > 0) {
            // Debounce the resize event 
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                // Force chart resize before redrawing
                Object.values(charts).forEach(chart => {
                    if (chart && chart.canvas) {
                        // Reset the chart size to its container
                        chart.resize();
                    }
                });
                updateCharts();
            }, 250);
        }
    });
}); 