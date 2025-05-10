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
        
        document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            document.getElementById('edit-modal').style.display = 'none';
        });
        
        // Delete modal close handlers
        document.getElementById('close-delete-modal').addEventListener('click', () => {
            document.getElementById('delete-modal').style.display = 'none';
        });
        
        document.getElementById('cancel-delete-btn').addEventListener('click', () => {
            document.getElementById('delete-modal').style.display = 'none';
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    },
    
    /**
     * Set up global event listeners for component communication
     */
    setupEventListeners: function() {
        // Listen for node selection in the tree
        document.addEventListener('cis:node-selected', (event) => {
            const detail = event.detail;
            
            // Render child elements in the elements panel
            CISElements2.renderElements(this.cisPlanData, detail.type, detail.guid);
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
            // In a complete implementation, this would fetch data for the specific node
            // For now, just refresh the entire tree
            this.refreshTree();
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
                
                // Extract the actual CIS Plan data from the response
                if (response && response.status === 'success' && response.data) {
                    console.log('API response successful, extracting data');
                    this.cisPlanData = response.data;
                } else {
                    console.warn('API response missing data property');
                    this.cisPlanData = response; // Try using the response directly
                }
                
                console.log('Extracted CIS Plan data:', this.cisPlanData);
                
                // Check if we have mission networks directly or nested
                let hasMissionNetworks = false;
                
                if (this.cisPlanData.missionNetworks && Array.isArray(this.cisPlanData.missionNetworks)) {
                    console.log(`Found ${this.cisPlanData.missionNetworks.length} mission networks directly in data`);
                    hasMissionNetworks = this.cisPlanData.missionNetworks.length > 0;
                } else if (response.data && response.data.missionNetworks && Array.isArray(response.data.missionNetworks)) {
                    console.log(`Found ${response.data.missionNetworks.length} mission networks in response.data`);
                    // Update cisPlanData to point to the correct structure
                    this.cisPlanData = response.data;
                    hasMissionNetworks = this.cisPlanData.missionNetworks.length > 0;
                }
                
                if (hasMissionNetworks) {
                    this.refreshUI();
                } else {
                    console.warn('No mission networks found in any data structure');
                    // Display a message in the tree panel
                    const treeContent = document.getElementById('tree-content');
                    if (treeContent) {
                        treeContent.innerHTML = '<div class="p-3 text-center">No Mission Networks available</div>';
                    }
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
     * Refresh the entire UI
     */
    refreshUI: function() {
        console.log('Refreshing UI with CIS Plan data');
        
        try {
            // Render tree directly with the data
            CISTree2.renderTree(this.cisPlanData);
            
            // Clear other panels
            CISElements2.clearElements();
            CISDetails2.clearDetails();
            
            // Show the root node elements (mission networks)
            if (this.cisPlanData && this.cisPlanData.missionNetworks) {
                console.log('Displaying mission networks in elements panel');
                // Pass just the mission networks array to the elements panel
                CISElements2.renderElements(this.cisPlanData.missionNetworks, 'mission_network');
            } else {
                console.warn('No mission networks to display in elements panel');
            }
            
            // Set up all event listeners
            this.setupListeners();
        } catch (error) {
            console.error('Error refreshing UI:', error);
            this.showError('Error refreshing UI: ' + error.message);
        }
    },
    
    /**
     * Set up event listeners for tree node selection and other events
     */
    setupListeners: function() {
        console.log('Setting up event listeners');
        
        // Tree node selection
        document.removeEventListener('cis:node-selected', this.handleNodeSelection);
        document.addEventListener('cis:node-selected', (event) => {
            console.log('Node selected event:', event.detail);
            const detail = event.detail;
            
            // Find the entity in the data structure
            if (detail.type === 'cisplan') {
                // Root node - show mission networks
                if (this.cisPlanData && this.cisPlanData.missionNetworks) {
                    CISElements2.renderElements(this.cisPlanData.missionNetworks, 'mission_network');
                }
            } else {
                // Find entity by guid
                const entity = this.findEntityByGuid(detail.guid, detail.type);
                if (entity) {
                    // Show entity's children in elements panel
                    this.showEntityChildren(entity, detail.type);
                    
                    // Show entity details in details panel
                    CISDetails2.updateDetails(detail.guid, detail.type, detail.parentGuid, null);
                }
            }
        });
        
        // Tree navigation
        document.removeEventListener('cis:node-navigate', this.handleNodeNavigation);
        document.addEventListener('cis:node-navigate', (event) => {
            console.log('Node navigate event:', event.detail);
            // Handle navigation within the tree
        });
        
        // Refresh children request
        document.removeEventListener('cis:refresh-children', this.handleRefreshChildren);
        document.addEventListener('cis:refresh-children', (event) => {
            console.log('Refresh children event:', event.detail);
            // Handle refreshing a node's children
        });
    },
    
    /**
     * Find an entity by its GUID in the CIS Plan data
     * @param {string} guid - The GUID to search for
     * @param {string} type - The type of entity to search for
     * @returns {Object|null} The found entity or null
     */
    findEntityByGuid: function(guid, type) {
        console.log(`Finding entity by GUID: ${guid}, type: ${type}`);
        
        if (!guid || !this.cisPlanData) return null;
        
        // Simple implementation for now - in a real app, this would be more sophisticated
        // with a recursive search through the entire hierarchy
        return null;
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
                // Assets have two child types: network interfaces and GP instances
                const networkInterfaces = entity.networkInterfaces || [];
                const gpInstances = entity.gpInstances || [];
                
                // Create a container for each type if they exist
                if (networkInterfaces.length > 0 || gpInstances.length > 0) {
                    CISElements2.renderMixedAssetChildren(networkInterfaces, gpInstances, entity);
                    return;
                }
                break;
            case 'gp_instance':
                children = entity.spInstances || [];
                childType = 'sp_instance';
                break;
        }
        
        // Render the children in the elements panel
        if (children.length > 0) {
            CISElements2.renderElements(children, childType, entity.guid);
        } else {
            CISElements2.showEmptyState(`No ${this.formatEntityTypeName(childType)} found`);
        }
    },
    
    /**
     * Format an entity type name for display
     * @param {string} type - The entity type
     * @returns {string} The formatted entity type name
     */
    formatEntityTypeName: function(type) {
        const typeNames = {
            'mission_network': 'Mission Networks',
            'network_segment': 'Network Segments',
            'security_domain': 'Security Domains',
            'hw_stack': 'HW Stacks',
            'asset': 'Assets',
            'network_interface': 'Network Interfaces',
            'gp_instance': 'GP Instances',
            'sp_instance': 'SP Instances'
        };
        
        return typeNames[type] || type;
    },
    
    /**
     * Show an error message to the user
     * @param {string} message - Error message to display
     */
    showError: function(message) {
        // Use toast notification if available, otherwise alert
        if (typeof showToast === 'function') {
            showToast(message, 'error');
        } else {
            alert(message);
        }
    }
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    CISPlan2.init();
});
