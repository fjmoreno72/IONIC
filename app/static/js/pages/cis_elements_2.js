/**
 * CIS Plan Elements Component 2.0
 * 
 * Manages the elements panel showing child elements of the selected node.
 */

const CISElements2 = {
    // DOM element references
    elementsContent: null,
    navigateUpBtn: null,
    addElementBtn: null,
    
    // State management
    currentElement: null,
    currentParentGuid: null,
    currentParentType: null,
    
    /**
     * Initialize the elements component
     */
    init: function() {
        this.elementsContent = document.getElementById('elements-content');
        this.navigateUpBtn = document.getElementById('navigate-up-btn');
        this.addElementBtn = document.getElementById('add-element-btn');
        
        if (!this.elementsContent || !this.navigateUpBtn || !this.addElementBtn) {
            console.error('Elements panel DOM elements not found');
            return;
        }
        
        // Set up navigate up button
        this.navigateUpBtn.addEventListener('click', () => {
            this.navigateUp();
        });
        
        // Set up add element button
        this.addElementBtn.addEventListener('click', () => {
            this.showAddElementDialog();
        });
    },

    /**
     * Clear the elements panel content
     */
    clearElements: function() {
        console.log('Clearing elements panel');
        if (this.elementsContent) {
            this.elementsContent.innerHTML = '';
        }
    },
    
    /**
     * CIS Plan data reference
     * This will be set by the parent CISPlan2 component
     */
    cisPlanData: null,

    /**
     * Set the CIS Plan data reference
     * @param {Object} data - The complete CIS Plan data
     */
    setCISPlanData: function(data) {
        console.log('Setting CIS Plan data reference in Elements component');
        this.cisPlanData = data;
    },

    /**
     * Render the elements based on the selected node
     * @param {string} selectedType - Type of the selected node
     * @param {Object} data - The data to render (entity object or CIS Plan data)
     * @param {string} selectedGuid - GUID of the selected node (optional)
     */
    renderElements: function(selectedType, data, selectedGuid) {
        console.log('Rendering elements for:', selectedType, 'GUID:', selectedGuid, 'Data:', data);
        if (!this.elementsContent) {
            console.error('Elements content element not found');
            return;
        }
        
        // Clear existing content
        this.elementsContent.innerHTML = '';
        
        // Update state
        this.currentParentType = selectedType;
        this.currentParentGuid = selectedGuid;
        this.currentElement = null;
        
        // Add a title to the elements panel with parent name if available
        const titleElement = document.createElement('div');
        titleElement.className = 'elements-title mb-3';
        
        // Get parent name if available
        let parentName = '';
        if (data) {
            if (selectedType === 'cisplan') {
                parentName = 'CIS Plan';
            } else if (selectedType === 'gp_instance') {
                // Special handling for GP instances
                parentName = data.gpid || data.id || '';
                
                // Create a unique ID for this title element to update it later
                titleElement.id = `gp-title-${parentName}`;
                
                // Fetch the GP name asynchronously
                fetch(`/api/gps/${parentName}/name`)
                    .then(response => response.json())
                    .then(gpData => {
                        if (gpData && gpData.name) {
                            // Update the title with the GP name
                            const titleEl = document.getElementById(`gp-title-${parentName}`);
                            if (titleEl) {
                                const displayName = data.instanceLabel ? 
                                    `${gpData.name} (${data.instanceLabel})` : 
                                    gpData.name;
                                titleEl.innerHTML = `<h5>${this.getEntityTypeName(selectedType)} Elements - ${displayName}</h5>`;
                            }
                        }
                    })
                    .catch(error => {
                        console.error(`Error fetching GP name for title: ${error}`);
                    });
            } else if (data.name) {
                parentName = data.name;
            } else if (data.id) {
                parentName = data.id;
            }
        }
        
        // Create title with parent name
        if (parentName) {
            titleElement.innerHTML = `<h5>${this.getEntityTypeName(selectedType)} Elements - ${parentName}</h5>`;
        } else {
            titleElement.innerHTML = `<h5>${this.getEntityTypeName(selectedType)} Elements</h5>`;
        }
        
        this.elementsContent.appendChild(titleElement);
        
        // For the root CIS Plan node
        if (selectedType === 'cisplan') {
            if (data && data.missionNetworks && Array.isArray(data.missionNetworks)) {
                this.renderElementCards(data.missionNetworks, 'mission_network');
            } else {
                this.showEmptyState('No Mission Networks');
            }
            return;
        }
        
        // For other nodes, we have two options:
        // 1. We received the entity data directly
        // 2. We need to find the entity by GUID
        
        let entityToRender = null;
        
        // Option 1: We received the entity data directly
        if (data && typeof data === 'object') {
            entityToRender = data;
        }
        // Option 2: We need to find the entity by GUID
        else if (selectedGuid && this.cisPlanData) {
            const entityInfo = this.findEntityByGuid(this.cisPlanData, selectedGuid);
            if (entityInfo && entityInfo.entity) {
                entityToRender = entityInfo.entity;
            }
        }
        
        if (entityToRender) {
            this.renderEntityChildren(entityToRender, selectedType);
        } else {
            this.showEmptyState('Entity not found or no data available');
        }
    },
    
    /**
     * Render the children of an entity based on its type
     * @param {Object} entity - The entity whose children to render
     * @param {string} entityType - The type of the entity
     */
    renderEntityChildren: function(entity, entityType) {
        console.log('Rendering children for entity type:', entityType);
        
        if (!entity) {
            this.showEmptyState('Entity data not available');
            return;
        }
        
        // Render different child types based on parent entity type
        switch (entityType) {
            case 'mission_network':
                if (entity.networkSegments && entity.networkSegments.length > 0) {
                    this.renderElementCards(entity.networkSegments, 'network_segment');
                } else {
                    this.showEmptyState('No Network Segments');
                }
                break;
                
            case 'network_segment':
                if (entity.securityDomains && entity.securityDomains.length > 0) {
                    this.renderElementCards(entity.securityDomains, 'security_domain');
                } else {
                    this.showEmptyState('No Security Domains');
                }
                break;
                
            case 'security_domain':
                if (entity.hwStacks && entity.hwStacks.length > 0) {
                    this.renderElementCards(entity.hwStacks, 'hw_stack');
                } else {
                    this.showEmptyState('No HW Stacks');
                }
                break;
                
            case 'hw_stack':
                if (entity.assets && entity.assets.length > 0) {
                    this.renderElementCards(entity.assets, 'asset');
                } else {
                    this.showEmptyState('No Assets');
                }
                break;
                
            case 'asset':
                // Assets can have both network interfaces and GP instances
                const hasNetworkInterfaces = entity.networkInterfaces && entity.networkInterfaces.length > 0;
                const hasGPInstances = entity.gpInstances && entity.gpInstances.length > 0;
                
                if (hasNetworkInterfaces || hasGPInstances) {
                    // Create section for network interfaces if they exist
                    if (hasNetworkInterfaces) {
                        const sectionTitle = document.createElement('h6');
                        sectionTitle.className = 'mt-3 mb-2';
                        sectionTitle.textContent = 'Network Interfaces';
                        this.elementsContent.appendChild(sectionTitle);
                        
                        this.renderElementCards(entity.networkInterfaces, 'network_interface');
                    }
                    
                    // Create section for GP instances if they exist
                    if (hasGPInstances) {
                        const sectionTitle = document.createElement('h6');
                        sectionTitle.className = 'mt-3 mb-2';
                        sectionTitle.textContent = 'GP Instances';
                        this.elementsContent.appendChild(sectionTitle);
                        
                        this.renderElementCards(entity.gpInstances, 'gp_instance');
                    }
                } else {
                    this.showEmptyState('No Network Interfaces or GP Instances');
                }
                break;
                
            case 'gp_instance':
                if (entity.spInstances && entity.spInstances.length > 0) {
                    this.renderElementCards(entity.spInstances, 'sp_instance');
                } else {
                    this.showEmptyState('No SP Instances');
                }
                break;
                
            default:
                this.showEmptyState(`No child elements for ${this.getEntityTypeName(entityType)}`);
                break;
        }
    },
    
    /**
     * Get a human-readable name for an entity type
     * @param {string} type - The entity type
     * @returns {string} Human-readable type name
     */
    getEntityTypeName: function(type) {
        // Use the centralized utility function
        return CISUtil2.getEntityTypeName(type);
    },
    
    /**
     * Show empty state in the elements panel
     * @param {string} message - The message to display
     */
    showEmptyState: function(message) {
        console.log('Showing empty state:', message);
        if (!this.elementsContent) return;
        
        this.elementsContent.innerHTML = `
            <div class="d-flex justify-content-center align-items-center h-100">
                <div class="text-center text-muted">
                    <i class="fas fa-info-circle fa-2x mb-3"></i>
                    <p>${message || 'No elements to display'}</p>
                </div>
            </div>
        `;
    },
    
    /**
     * Render mixed children for an asset (network interfaces and GP instances)
     * @param {Array} networkInterfaces - Network interfaces array
     * @param {Array} gpInstances - GP instances array
     * @param {Object} parentAsset - The parent asset object
     */
    renderMixedAssetChildren: function(networkInterfaces, gpInstances, parentAsset) {
        console.log('Rendering mixed asset children:', networkInterfaces.length, 'network interfaces,', gpInstances.length, 'GP instances');
        if (!this.elementsContent) return;
        
        this.elementsContent.innerHTML = '';
        
        // Add section headers and containers
        if (networkInterfaces.length > 0) {
            const header = document.createElement('h5');
            header.className = 'section-header mt-2 mb-3';
            header.innerHTML = 'Network Interfaces';
            this.elementsContent.appendChild(header);
            
            const container = document.createElement('div');
            container.className = 'element-cards network-interfaces';
            this.elementsContent.appendChild(container);
            
            this.renderElementCardsInContainer(container, networkInterfaces, 'network_interface');
        }
        
        if (gpInstances.length > 0) {
            const header = document.createElement('h5');
            header.className = 'section-header mt-4 mb-3';
            header.innerHTML = 'GP Instances';
            this.elementsContent.appendChild(header);
            
            const container = document.createElement('div');
            container.className = 'element-cards gp-instances';
            this.elementsContent.appendChild(container);
            
            this.renderElementCardsInContainer(container, gpInstances, 'gp_instance');
        }
    },
    
    /**
     * Render element cards in a specific container
     * @param {HTMLElement} container - The container element
     * @param {Array} elements - Array of elements to render
     * @param {string} type - Type of elements
     */
    renderElementCardsInContainer: function(container, elements, type) {
        elements.forEach(element => {
            const card = this.createElementCard(element, type);
            container.appendChild(card);
        });
    },
    
    /**
     * Render element cards for a list of elements
     * @param {Array} elements - Array of elements to render
     * @param {string} type - Type of elements
     */
    renderElementCards: function(elements, type) {
        console.log(`Rendering ${elements.length} ${type} cards`);
        if (!this.elementsContent || !elements) return;
        
        const container = document.createElement('div');
        container.className = 'element-cards';
        this.elementsContent.appendChild(container);
        
        elements.forEach(element => {
            const card = this.createElementCard(element, type);
            container.appendChild(card);
        });
    },
    
    /**
     * Create an element card for a single element
     * @param {Object} element - The element data
     * @param {string} type - Type of element
     * @returns {HTMLElement} The created card element
     */
    createElementCard: function(element, type) {
        // Use the utility function to create the card
        const self = this;
        const card = CISUtil2.createElementCard(element, type, function(element, type) {
            self.selectElement(element, type);
        });
        
        // Add double-click handler for navigation down
        card.addEventListener('dblclick', function() {
            self.navigateDown(element, type);
        });
        
        return card;
    },
    
    /**
     * Find an entity by its GUID in the CIS Plan data
     * @param {Object} data - The CIS Plan data to search in
     * @param {string} guid - The GUID to search for
     * @returns {Object|null} Object containing the entity and its parent path, or null if not found
     */
    findEntityByGuid: function(data, guid) {
        if (!data || !guid) return null;
        
        // Use the utility function to find the entity
        const entity = CISUtil2.findEntityByGuid(data, guid);
        
        if (!entity) return null;
        
        // For backward compatibility, return in the expected format
        return {
            entity: entity,
            parentPath: [] // Note: The utility version doesn't track parent path
        };
    },
    
    findConfigurationItem: function(element, itemName) {
        if (!element || !element.configurationItems || !Array.isArray(element.configurationItems)) {
            return null;
        }
        
        return element.configurationItems.find(item => item.Name === itemName) || null;
    },
    
    /**
     * Select an element and update the details panel
     * @param {Object} element - The selected element
     * @param {string} type - Type of the selected element
     */
    selectElement: function(element, type) {
        console.log(`Element selected: ${type} - ${element.name || element.id || 'Unnamed'}`);
        
        // Update state
        this.currentElement = element;
        
        // Use the utility function to handle the selection
        CISUtil2.selectElement(element, type);
    },
    
    /**
     * Navigate up to the parent element
     */
    navigateUp: function() {
        console.log('Navigate up requested');
        
        // Dispatch a custom event to trigger the tree's navigateUp function
        const navigateUpEvent = new CustomEvent('cis:navigate-up');
        document.dispatchEvent(navigateUpEvent);
    },
    
    /**
     * Navigate down to the selected element
     * @param {Object} element - The element to navigate to
     * @param {string} type - Type of the element
     */
    navigateDown: function(element, type) {
        console.log('Navigate down requested to:', type, element);
        
        // Dispatch a custom event to trigger the tree to select this node
        let guid = element.guid;
        let id = element.id || element.gpid; // Handle GP instances which use gpid instead of id
        
        if (!guid && !id) {
            console.error('Cannot navigate to element without guid or id');
            return;
        }
        
        // Create and dispatch the event to select the node in the tree
        const selectNodeEvent = new CustomEvent('cis:select-tree-node', {
            detail: {
                type: type,
                id: id,
                guid: guid
            }
        });
        
        document.dispatchEvent(selectNodeEvent);
    },
    
    /**
     * Show the add element dialog
     */
    showAddElementDialog: function() {
        // This will be implemented as needed
        console.log('Add element dialog requested');
    }
};
