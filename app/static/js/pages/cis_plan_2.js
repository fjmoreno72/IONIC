/**
 * CIS Plan 2.0 - Main Application
 * 
 * Coordinates the CIS Plan 2.0 UI components and manages the overall application state.
 * Handles panel resizing, data loading, and event coordination between components.
 */

// Main CIS Plan Application
const CISPlan2 = {
    // State
    cisPlanData: null,
    
    /**
     * Initialize the CIS Plan application
     */
    init: function() {
        console.log('Initializing CIS Plan 2.0 application');
        
        // Store component references
        this.CISTree2 = CISTree2;
        
        // Initialize components
        CISTree2.init();
        CISElements2.init();
        CISDetails2.init();
        
        // Set up panel resizing
        this.setupPanelResizing();
        
        // Set up modal close handlers
        this.setupModalHandlers();
        
        // Set up global event listeners
        this.setupEventListeners();
        
        // Add refresh button handler
        document.getElementById('refreshButton').addEventListener('click', () => {
            console.log('Refresh button clicked');
            this.loadCISPlanData();
        });
        
        // Load initial data
        this.loadCISPlanData();
    },
    
    /**
     * Set up panel resizing functionality
     */
    setupPanelResizing: function() {
        const treePanel = document.getElementById('tree-panel');
        const elementsPanel = document.getElementById('elements-panel');
        const detailsPanel = document.getElementById('details-panel');
        const treeResizer = document.getElementById('tree-resizer');
        const elementsResizer = document.getElementById('elements-resizer');
        
        if (!treePanel || !elementsPanel || !detailsPanel || !treeResizer || !elementsResizer) {
            console.error('Resizer or panel elements not found');
            return;
        }
        
        // Tree panel resizer
        treeResizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            
            const startX = e.clientX;
            const startTreeWidth = treePanel.offsetWidth;
            const startElementsWidth = elementsPanel.offsetWidth;
            
            const onMouseMove = (moveEvent) => {
                moveEvent.preventDefault();
                
                const deltaX = moveEvent.clientX - startX;
                
                // Calculate new widths ensuring minimum size
                const newTreeWidth = Math.max(150, startTreeWidth + deltaX);
                const newElementsWidth = Math.max(150, startElementsWidth - deltaX);
                
                // Set new widths
                treePanel.style.width = newTreeWidth + 'px';
                elementsPanel.style.width = newElementsWidth + 'px';
            };
            
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
        
        // Elements panel resizer
        elementsResizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            
            const startX = e.clientX;
            const startElementsWidth = elementsPanel.offsetWidth;
            const startDetailsWidth = detailsPanel.offsetWidth;
            
            const onMouseMove = (moveEvent) => {
                moveEvent.preventDefault();
                
                const deltaX = moveEvent.clientX - startX;
                
                // Calculate new widths ensuring minimum size
                const newElementsWidth = Math.max(150, startElementsWidth + deltaX);
                const newDetailsWidth = Math.max(150, startDetailsWidth - deltaX);
                
                // Set new widths
                elementsPanel.style.width = newElementsWidth + 'px';
                detailsPanel.style.width = newDetailsWidth + 'px';
            };
            
            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
            };
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    },
    
    /**
     * Set up modal close handlers
     */
    setupModalHandlers: function() {
        // Add modal close handlers
        document.getElementById('close-add-modal').addEventListener('click', () => {
            document.getElementById('add-modal').style.display = 'none';
        });
        
        document.getElementById('cancel-add-btn').addEventListener('click', () => {
            document.getElementById('add-modal').style.display = 'none';
        });
        
        // Edit modal close handlers
        document.getElementById('close-edit-modal').addEventListener('click', () => {
            document.getElementById('edit-modal').style.display = 'none';
        });
    },
    
    /**
     * Set up global event listeners for component communication
     */
    setupEventListeners: function() {
        // Listen for node selection in the tree
        document.addEventListener('cis:node-selected', (event) => {
            const detail = event.detail;
            console.log('Node selected event:', detail);
            
            // Render child elements in the elements panel
            if (detail.type === 'cisplan') {
                // For the root node, pass the full CIS Plan data
                this.renderElements(detail.type, this.cisPlanData, detail.guid);
            } else if (detail.data) {
                // For other nodes, pass the node's data
                this.renderElements(detail.type, detail.data, detail.guid);
                
                // Also update the details panel with the selected node
                CISUtil2.selectElement(detail.data, detail.type);
            } else {
                console.error('Node selected event missing data:', detail);
            }
        });
        
        // Listen for node selection in the elements panel
        document.addEventListener('cis:select-tree-node', (event) => {
            const detail = event.detail;
            
            // Select the node in the tree
            if (detail.guid) {
                CISTree2.selectNodeByGuid(detail.guid);
            } else if (detail.type && detail.id) {
                CISTree2.selectNodeByTypeAndId(detail.type, detail.id);
            }
        });
        
        // Listen for navigate up events
        document.addEventListener('cis:navigate-up', () => {
            CISTree2.navigateUp();
        });
        
        // Listen for refresh UI events
        document.addEventListener('cis:refresh-ui', () => {
            this.loadCISPlanData();
        });
        
        // Listen for node expand/refresh children events
        document.addEventListener('cis:refresh-children', (event) => {
            console.log('Refresh children event:', event.detail);
            // For now, we don't need to do anything - the tree already has all data
        });
    },
    
    /**
     * Load the CIS Plan data from the API
     */
    loadCISPlanData: function() {
        console.log('Loading CIS Plan data...');
        CISApi2.fetchCISPlanData()
            .then(response => {
                console.log('CIS Plan data loaded:', response);
                
                // Store the complete API response first
                this.apiResponse = response;
                
                if (response && response.status === 'success') {
                    console.log('API response successful, extracting data');
                    
                    // Extract the data from the response
                    if (response.data) {
                        // Update with the actual data structure
                        this.cisPlanData = response.data;
                        console.log('Extracted CIS Plan data:', this.cisPlanData);
                        
                        // Check how to access mission networks based on the API response format
                        if (this.cisPlanData.missionNetworks && Array.isArray(this.cisPlanData.missionNetworks)) {
                            console.log(`Found ${this.cisPlanData.missionNetworks.length} mission networks directly in data`);
                        } else if (this.cisPlanData.data && this.cisPlanData.data.missionNetworks) {
                            // Handle nested response format
                            console.log(`Found ${this.cisPlanData.data.missionNetworks.length} mission networks in nested data`);
                            this.cisPlanData = this.cisPlanData.data;
                        } else {
                            console.warn('No mission networks found in data');
                        }
                        
                        // Refresh the UI with the new data
                        this.refreshUI();
                    } else {
                        console.error('API response successful but no data found');
                        this.showError('API response successful but no data found');
                    }
                } else {
                    console.error('API response indicates an error');
                    this.showError('API request failed: ' + (response.message || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error loading CIS Plan data:', error);
                this.showError('Failed to load CIS Plan data');
                // Display error in the tree panel
                const treeContent = document.getElementById('tree-content');
                if (treeContent) {
                    treeContent.innerHTML = `<div class="p-3 text-danger">Error loading data: ${error.message}</div>`;
                }
            });
    },
    
    /**
     * Refresh the UI with the CIS Plan data
     */
    refreshUI: function() {
        console.log('Refreshing UI with CIS Plan data');
        
        // Set the CIS Plan data reference in the elements component
        CISElements2.setCISPlanData(this.cisPlanData);
        
        // Ensure we have the CISTree2 reference
        if (!this.CISTree2) {
            console.log('Setting CISTree2 reference');
            this.CISTree2 = CISTree2;
        }
        
        // Render in the tree
        if (this.CISTree2) {
            this.CISTree2.renderTree(this.cisPlanData);
            
            // Tree expansion is now handled directly in the CISTree2 component
        } else {
            console.error('CISTree2 reference is missing');
        }
        
        // Reset the elements panel with mission networks
        if (this.cisPlanData && this.cisPlanData.missionNetworks) {
            this.renderElements('mission_network', this.cisPlanData.missionNetworks);
        }
        
        // Clear the details panel
        CISDetails2.clearDetails();
    },
    

    
    /**
     * Render data in the elements panel
     * @param {string} type - Type of data to render ('mission_network', etc.)
     * @param {Object|Array} data - Data to render
     * @param {string} guid - GUID of the selected entity (optional)
     */
    renderElements: function(type, data, guid) {
        // Make sure CISElements2 has the reference to the full CIS Plan data
        if (this.cisPlanData && !CISElements2.cisPlanData) {
            CISElements2.setCISPlanData(this.cisPlanData);
        }
        
        // Delegate to the CISElements2 component with correct parameter order
        CISElements2.renderElements(type, data, guid);
    },
    
    /**
     * Show the children of an entity in the elements panel
     * @param {Object} entity - The parent entity
     * @param {string} entityType - The type of the parent entity
     */
    showEntityChildren: function(entity, entityType) {
        console.log(`Showing children of entity type: ${entityType}`);
        
        // Determine child entity type based on parent type
        let children = [];
        let childType = '';
        
        switch (entityType) {
            case 'mission_network':
                children = entity.networkSegments || [];
                childType = 'network_segment';
                break;
            case 'network_segment':
                children = entity.securityDomains || [];
                childType = 'security_domain';
                break;
            case 'security_domain':
                children = entity.hwStacks || [];
                childType = 'hw_stack';
                break;
            case 'hw_stack':
                children = entity.assets || [];
                childType = 'asset';
                break;
            case 'asset':
                // Assets can have both network interfaces and GP instances
                if (entity.networkInterfaces && entity.networkInterfaces.length > 0) {
                    children = entity.networkInterfaces;
                    childType = 'network_interface';
                } else if (entity.gpInstances && entity.gpInstances.length > 0) {
                    children = entity.gpInstances;
                    childType = 'gp_instance';
                }
                break;
            case 'gp_instance':
                children = entity.spInstances || [];
                childType = 'sp_instance';
                break;
            default:
                console.warn(`Unknown entity type: ${entityType}`);
                break;
        }
        
        if (children.length > 0) {
            this.renderElements(childType, children);
        } else {
            CISElements2.showEmptyState(`No children found for this ${entityType}`);
        }
    },
    
    /**
     * Show an error message to the user
     * @param {string} message - The error message to display
     */
    showError: function(message) {
        console.error('Error:', message);
        // This is a placeholder - in a real application, this would show a popup or toast message
        alert('Error: ' + message);
    }
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    CISPlan2.init();
});
