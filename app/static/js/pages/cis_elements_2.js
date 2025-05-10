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
     * Render the elements based on the selected node
     * @param {Object} data - The data to render (array of elements or CIS Plan data)
     * @param {string} selectedType - Type of the selected node
     * @param {string} selectedGuid - GUID of the selected node
     */
    renderElements: function(data, selectedType, selectedGuid) {
        console.log('Rendering elements:', selectedType, data);
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
        
        // Reset the details panel with the parent data
        const event = new CustomEvent('cis:update-details', {
            detail: {
                type: selectedType,
                guid: selectedGuid,
                element: null
            }
        });
        document.dispatchEvent(event);
        
        // Handle different data types - either the full CIS Plan data or an array of specific elements
        if (selectedType === 'cisplan') {
            console.log('Rendering for cisplan root node');
            // If we're passed the full data object with missionNetworks property
            if (data.missionNetworks && Array.isArray(data.missionNetworks)) {
                console.log('Rendering mission networks from full data object');
                this.renderMissionNetworks(data.missionNetworks);
            } 
            // If we're passed the mission networks array directly
            else if (Array.isArray(data)) {
                console.log('Rendering mission networks from direct array');
                this.renderMissionNetworks(data);
            } else {
                console.warn('No mission networks found in data');
                this.showEmptyState('No Mission Networks');
            }
            return;
        }
        
        // For non-root nodes, find the entity and render its children
        if (selectedGuid) {
            // Find the entity in the CIS Plan data
            const entityInfo = this.findEntityByGuid(cisPlanData, selectedGuid);
            if (entityInfo && entityInfo.entity) {
                this.renderEntityChildren(entityInfo.entity, selectedType);
            } else {
                this.showEmptyState('Entity not found');
            }
        }
    },
    
    /**
     * Render mission networks
     * @param {Array} missionNetworks - Array of mission networks
     */
    renderMissionNetworks: function(missionNetworks) {
        console.log('Rendering mission networks in elements panel:', missionNetworks);
        if (!missionNetworks || missionNetworks.length === 0) {
            console.warn('No mission networks to render');
            this.showEmptyState('No Mission Networks');
            return;
        }
        
        // Create element cards for each mission network
        this.renderElementCards(missionNetworks, 'mission_network');
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
        const card = document.createElement('div');
        card.className = 'element-card';
        
        // Set data attributes for the card
        card.setAttribute('data-type', type);
        card.setAttribute('data-id', element.id || '');
        card.setAttribute('data-guid', element.guid || '');
        
        // Create card content based on type
        let cardTitle = element.name || 'Unnamed';
        let cardProperties = [];
        
        switch (type) {
            case 'mission_network':
                cardProperties.push(`ID: ${element.id || 'N/A'}`);
                break;
                
            case 'network_segment':
                cardProperties.push(`ID: ${element.id || 'N/A'}`);
                break;
                
            case 'security_domain':
                cardProperties.push(`Classification: ${element.id || 'N/A'}`);
                break;
                
            case 'hw_stack':
                cardProperties.push(`ID: ${element.id || 'N/A'}`);
                break;
                
            case 'asset':
                cardProperties.push(`ID: ${element.id || 'N/A'}`);
                break;
                
            case 'network_interface':
                // User preference: Show IP address in format "Name - IP Address"
                const ipConfig = this.findConfigurationItem(element, 'IP Address');
                const ipAddress = ipConfig ? ipConfig.AnswerContent : 'N/A';
                cardTitle = `${element.name} - ${ipAddress}`;
                break;
                
            case 'gp_instance':
                cardProperties.push(`GP ID: ${element.gpid || 'N/A'}`);
                if (element.label) {
                    cardProperties.push(`Label: ${element.label}`);
                }
                break;
                
            case 'sp_instance':
                cardProperties.push(`SP ID: ${element.spId || 'N/A'}`);
                if (element.version) {
                    cardProperties.push(`Version: ${element.version}`);
                }
                break;
        }
        
        // Create card HTML with the correct image paths
        // Map entity types to the correct image filenames
        const typeToImageMapping = {
            'cisplan': 'CIS-PLAN',
            'mission_network': 'missionNetworks',
            'network_segment': 'networkSegments',
            'security_domain': 'securityDomains',
            'hw_stack': 'hwStacks',
            'asset': 'assets',
            'network_interface': 'networkInterfaces',
            'gp_instance': 'gpInstances',
            'sp_instance': 'spInstances',
            'configuration_item': 'configurationItems'
        };
        
        const imageName = typeToImageMapping[type] || 'CIS-PLAN';
        
        card.innerHTML = `
            <div class="card-header">
                <img src="/static/img/${imageName}.svg" class="card-icon" alt="${type}" onerror="this.src='/static/img/CIS-PLAN.svg'" />
                <span class="card-title">${cardTitle}</span>
            </div>
            <div class="card-body">
                ${cardProperties.map(prop => `<div class="card-property">${prop}</div>`).join('')}
            </div>
        `;
        
        // Add click event listener
        card.addEventListener('click', () => {
            this.selectElement(element, type);
        });
        
        return card;
    },
    
    /**
     * Find a configuration item by name in an element's configuration
     * @param {Object} element - The element to search in
     * @param {string} itemName - The name of the configuration item
     * @returns {Object|null} The found configuration item or null
     */
    findConfigurationItem: function(element, itemName) {
        if (!element || !element.configurationItems || !Array.isArray(element.configurationItems)) {
            return null;
        }
        
        return element.configurationItems.find(item => item.Name === itemName);
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
        
        // Update the details panel
        const event = new CustomEvent('cis:update-details', {
            detail: {
                type: type,
                guid: element.guid,
                element: element
            }
        });
        document.dispatchEvent(event);
        
        // Highlight the selected card
        document.querySelectorAll('.element-card.active').forEach(card => {
            card.classList.remove('active');
        });
        
        const selectedCard = document.querySelector(`.element-card[data-guid="${element.guid}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
        }
    },
    
    /**
     * Navigate up to the parent element
     */
    navigateUp: function() {
        // This will be implemented as needed
        console.log('Navigate up requested');
    },
    
    /**
     * Show the add element dialog
     */
    showAddElementDialog: function() {
        // This will be implemented as needed
        console.log('Add element dialog requested');
    }
};
