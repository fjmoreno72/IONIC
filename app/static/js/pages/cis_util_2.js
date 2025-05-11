/**
 * CIS Plan Utilities 2.0
 * 
 * Common utility functions for the CIS Plan 2.0 components.
 */

const CISUtil2 = {
    /**
     * Get the appropriate icon for an entity type
     * @param {string} type - Entity type
     * @returns {string} URL of the icon
     */
    getEntityIcon: function(type) {
        // Use the exact names from the data structure for icons
        const iconMap = {
            'cisplan': '/static/img/cisPlan.svg',
            'mission_network': '/static/img/missionNetworks.svg',
            'network_segment': '/static/img/networkSegments.svg',
            'security_domain': '/static/img/securityDomains.svg',
            'hw_stack': '/static/img/hwStacks.svg',
            'asset': '/static/img/assets.svg',
            'network_interface': '/static/img/networkInterfaces.svg',
            'gp_instance': '/static/img/gpInstances.svg',
            'sp_instance': '/static/img/spInstances.svg'
        };
        
        return iconMap[type] || '/static/img/default.svg';
    },
    
    /**
     * Get a human-readable name for an entity type
     * @param {string} type - The entity type
     * @returns {string} Human-readable type name
     */
    getEntityTypeName: function(type) {
        const typeNames = {
            'cisplan': 'CIS Plan',
            'mission_network': 'Mission Network',
            'network_segment': 'Network Segment',
            'security_domain': 'Security Domain',
            'hw_stack': 'HW Stack',
            'asset': 'Asset',
            'network_interface': 'Network Interface',
            'gp_instance': 'GP Instance',
            'sp_instance': 'SP Instance'
        };
        
        return typeNames[type] || type;
    },
    
    /**
     * Create a DOM element with specified attributes and styles
     * @param {string} tagName - The HTML tag name
     * @param {Object} attributes - Key-value pairs of attributes to set
     * @param {Object} styles - Key-value pairs of styles to set
     * @param {string} textContent - Text content for the element
     * @returns {HTMLElement} The created element
     */
    createElement: function(tagName, attributes = {}, styles = {}, textContent = '') {
        const element = document.createElement(tagName);
        
        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                element.setAttribute(key, value);
            }
        });
        
        // Set styles
        Object.entries(styles).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                element.style[key] = value;
            }
        });
        
        // Set text content if provided
        if (textContent) {
            element.textContent = textContent;
        }
        
        return element;
    },
    
    /**
     * Find an entity by its GUID in the CIS Plan data
     * @param {Object} data - The CIS Plan data to search
     * @param {string} guid - The GUID to find
     * @returns {Object|null} The found entity or null
     */
    findEntityByGuid: function(data, guid) {
        if (!data || !guid) return null;
        
        let foundEntity = null;
        
        function searchEntity(entity) {
            if (!entity || typeof entity !== 'object') return;
            
            // Check if this entity has the GUID we're looking for
            if (entity.guid === guid) {
                foundEntity = entity;
                return;
            }
            
            // Process all possible child collections
            const childCollections = [
                'missionNetworks',
                'networkSegments',
                'securityDomains',
                'hwStacks',
                'assets',
                'networkInterfaces',
                'gpInstances',
                'spInstances'
            ];
            
            // Recursively search all children
            for (const collection of childCollections) {
                if (foundEntity) break; // Stop if entity is found
                
                if (Array.isArray(entity[collection])) {
                    for (const child of entity[collection]) {
                        if (foundEntity) break; // Stop if entity is found
                        searchEntity(child);
                    }
                }
            }
        }
        
        searchEntity(data);
        return foundEntity;
    },
    
    /**
     * Create a custom event for node selection
     * @param {string} type - Entity type
     * @param {string} id - Entity ID
     * @param {string} guid - Entity GUID
     * @param {Object} data - Entity data
     * @param {Object} parentInfo - Parent entity information
     * @returns {CustomEvent} The created event
     */
    createNodeSelectedEvent: function(type, id, guid, data, parentInfo = {}) {
        const detail = {
            type: type,
            id: id,
            guid: guid,
            data: data,
            ...parentInfo
        };
        
        return new CustomEvent('cis:node-selected', { detail });
    },
    
    /**
     * Apply consistent styling to a tree node element
     * @param {HTMLElement} element - The element to style
     * @param {Object} styles - Additional styles to apply (optional)
     */
    applyTreeNodeStyles: function(element, styles = {}) {
        const defaultStyles = {
            display: 'block',
            marginBottom: '5px'
        };
        
        // Apply default styles
        Object.entries(defaultStyles).forEach(([key, value]) => {
            element.style[key] = value;
        });
        
        // Apply additional styles
        Object.entries(styles).forEach(([key, value]) => {
            element.style[key] = value;
        });
    },
    
    /**
     * Apply consistent styling to a tree node content element
     * @param {HTMLElement} element - The element to style
     * @param {Object} styles - Additional styles to apply (optional)
     */
    applyTreeNodeContentStyles: function(element, styles = {}) {
        const defaultStyles = {
            display: 'flex',
            alignItems: 'center',
            padding: '4px 6px',
            borderRadius: '3px',
            cursor: 'pointer'
        };
        
        // Apply default styles
        Object.entries(defaultStyles).forEach(([key, value]) => {
            element.style[key] = value;
        });
        
        // Apply additional styles
        Object.entries(styles).forEach(([key, value]) => {
            element.style[key] = value;
        });
    },
    
    /**
     * Apply consistent styling to a tree children container
     * @param {HTMLElement} element - The element to style
     * @param {Object} styles - Additional styles to apply (optional)
     */
    applyTreeChildrenStyles: function(element, styles = {}) {
        const defaultStyles = {
            display: 'block',
            marginLeft: '20px',
            paddingLeft: '10px',
            borderLeft: '1px dotted #ccc'
        };
        
        // Apply default styles
        Object.entries(defaultStyles).forEach(([key, value]) => {
            element.style[key] = value;
        });
        
        // Apply additional styles
        Object.entries(styles).forEach(([key, value]) => {
            element.style[key] = value;
        });
    },
    
    /**
     * Get all child entity types for a given entity type
     * @param {string} type - The entity type
     * @returns {Array} Array of child entity types
     */
    getChildEntityTypes: function(type) {
        const childMap = {
            'cisplan': ['mission_network'],
            'mission_network': ['network_segment'],
            'network_segment': ['security_domain'],
            'security_domain': ['hw_stack'],
            'hw_stack': ['asset'],
            'asset': ['network_interface', 'gp_instance'],
            'gp_instance': ['sp_instance'],
            'network_interface': [],
            'sp_instance': []
        };
        
        return childMap[type] || [];
    },
    
    /**
     * Get the property name for child entities of a given type
     * @param {string} type - The entity type
     * @returns {string} The property name for child entities
     */
    getChildPropertyName: function(type) {
        const propertyMap = {
            'cisplan': 'missionNetworks',
            'mission_network': 'networkSegments',
            'network_segment': 'securityDomains',
            'security_domain': 'hwStacks',
            'hw_stack': 'assets',
            'asset': 'networkInterfaces', // Note: assets also have gpInstances
            'gp_instance': 'spInstances',
            'network_interface': '',
            'sp_instance': ''
        };
        
        return propertyMap[type] || '';
    },
    
    /**
     * Create a tree node element with consistent styling
     * @param {string} type - Type of node
     * @param {string} name - Display name
     * @param {string} id - ID of the entity
     * @param {string} guid - GUID of the entity
     * @returns {HTMLElement} The created tree node
     */
    createTreeNode: function(type, name, id, guid) {
        // Create node container with vertical layout
        const node = document.createElement('div');
        node.className = 'tree-node';
        node.setAttribute('data-type', type);
        if (id) node.setAttribute('data-id', id);
        if (guid) node.setAttribute('data-guid', guid);
        
        // Apply vertical styling
        node.style.display = 'block';
        node.style.marginBottom = '5px';
        
        // Create node content container
        const nodeContent = document.createElement('div');
        nodeContent.className = 'tree-node-content';
        nodeContent.style.display = 'flex';
        nodeContent.style.alignItems = 'center';
        nodeContent.style.padding = '4px 6px';
        nodeContent.style.borderRadius = '3px';
        nodeContent.style.cursor = 'pointer';
        node.appendChild(nodeContent);
        
        // Create expand icon (hidden by default)
        const expandIcon = document.createElement('span');
        expandIcon.className = 'expand-icon';
        expandIcon.style.visibility = 'hidden';
        expandIcon.style.width = '12px';
        expandIcon.style.textAlign = 'center';
        expandIcon.style.marginRight = '4px';
        expandIcon.style.fontSize = '10px';
        nodeContent.appendChild(expandIcon);
        
        // Create node icon
        const iconUrl = this.getEntityIcon(type);
        const iconImg = document.createElement('img');
        iconImg.className = 'node-icon';
        iconImg.src = iconUrl;
        iconImg.alt = type;
        iconImg.style.width = '18px';
        iconImg.style.height = '18px';
        iconImg.style.marginRight = '8px';
        nodeContent.appendChild(iconImg);
        
        // Create node label
        const nodeLabel = document.createElement('span');
        nodeLabel.className = 'node-label';
        nodeLabel.textContent = name || 'Unnamed';
        nodeLabel.style.fontSize = '14px';
        nodeContent.appendChild(nodeLabel);
        
        return node;
    },
    
    /**
     * Apply consistent styling to a tree children container
     * @param {HTMLElement} container - The container to style
     */
    styleChildContainer: function(container) {
        // Apply core styles to this container
        container.style.display = 'block';
        container.style.marginLeft = '20px';
        container.style.paddingLeft = '10px';
        container.style.borderLeft = '2px solid #ccc';
        
        // Make sure the container has the tree-children class for CSS targeting
        if (!container.classList.contains('tree-children')) {
            container.classList.add('tree-children');
        }
        
        // Apply the same styling to all direct child containers
        const directChildContainers = Array.from(container.children)
            .filter(el => el.classList.contains('tree-node'))
            .map(node => node.querySelector('.tree-children'))
            .filter(el => el !== null);
            
        directChildContainers.forEach(childContainer => {
            childContainer.style.display = childContainer.style.display; // Preserve display state
            childContainer.style.marginLeft = '20px';
            childContainer.style.paddingLeft = '10px';
            childContainer.style.borderLeft = '2px solid #ccc';
        });
    },
    
    /**
     * Select a tree node and deselect others
     * @param {HTMLElement} node - The node to select
     */
    selectTreeNode: function(node) {
        if (!node) return;
        
        // Remove active class from all node contents
        document.querySelectorAll('.tree-node-content.active').forEach(content => {
            content.classList.remove('active');
            content.style.backgroundColor = '';
            content.style.color = '';
        });
        
        // Add active class to this node's content only
        const nodeContent = node.querySelector('.tree-node-content');
        if (nodeContent) {
            nodeContent.classList.add('active');
            nodeContent.style.backgroundColor = '#e3f0ff';
            nodeContent.style.color = '#222';
        }
    },
    
    /**
     * Toggle the expanded state of a node
     * @param {HTMLElement} node - The node to toggle
     * @returns {boolean} Whether the node is expanded after toggling
     */
    toggleNodeExpanded: function(node) {
        if (!node) return false;
        
        const childContainer = node.querySelector('.tree-children');
        const expandIcon = node.querySelector('.expand-icon');
        
        if (!childContainer || !expandIcon) return false;
        
        const isExpanded = childContainer.style.display === 'block';
        
        if (isExpanded) {
            // Collapse node
            childContainer.style.display = 'none';
            expandIcon.innerHTML = '&#9658;'; // Right-pointing triangle
            return false;
        } else {
            // Expand node
            childContainer.style.display = 'block';
            expandIcon.innerHTML = '&#9660;'; // Down-pointing triangle
            return true;
        }
    },
    
    /**
     * Select an element and update the details panel
     * @param {Object} element - The selected element
     * @param {string} type - Type of the selected element
     */
    selectElement: function(element, type) {
        if (!element) return;
        
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
     * Get the appropriate display name for an entity based on its type
     * @param {Object} element - The element data
     * @param {string} type - Type of element
     * @returns {string} The display name
     */
    getEntityDisplayName: function(element, type) {
        if (!element) return 'Unnamed';
        
        switch (type) {
            case 'mission_network':
            case 'network_segment':
            case 'hw_stack':
            case 'asset':
                return element.name || 'Unnamed';
                
            case 'security_domain':
                return element.id || 'Unnamed';
                
            case 'network_interface':
                // Special case for network interfaces - show IP address if available
                if (element.ipAddress) {
                    return `${element.name || element.id || 'Unnamed'} - ${element.ipAddress}`;
                }
                return element.name || element.id || 'Unnamed';
                
            case 'gp_instance':
                return element.name || element.gpid || 'Unnamed';
                
            case 'sp_instance':
                return element.name || element.spId || 'Unnamed';
                
            default:
                return element.name || element.id || 'Unnamed';
        }
    },
    
    /**
     * Create an element card for a single element
     * @param {Object} element - The element data
     * @param {string} type - Type of element
     * @param {Function} onSelectCallback - Callback function when element is selected
     * @returns {HTMLElement} The created card element
     */
    createElementCard: function(element, type, onSelectCallback) {
        const card = document.createElement('div');
        card.className = 'element-card';
        card.setAttribute('data-type', type);
        card.setAttribute('data-guid', element.guid || '');
        
        // Get the appropriate display name based on entity type
        const displayName = this.getEntityDisplayName(element, type);
        
        // Get the entity icon
        const iconUrl = this.getEntityIcon(type);
        
        // Create a simple rectangular card with the entity name and icon
        card.innerHTML = `
            <div class="card mb-2">
                <div class="card-body d-flex align-items-center p-3">
                    <img src="${iconUrl}" alt="${type}" style="width: 24px; height: 24px; margin-right: 15px;">
                    <span style="font-size: 15px;">${displayName}</span>
                </div>
            </div>
        `;
        
        // Add hover effect with CSS
        card.style.cursor = 'pointer';
        card.style.transition = 'all 0.2s ease';
        
        // Add click handler to select the element
        card.addEventListener('click', () => {
            // Highlight the selected card
            document.querySelectorAll('.element-card .card').forEach(c => {
                c.style.backgroundColor = '';
            });
            card.querySelector('.card').style.backgroundColor = '#e3f0ff';
            
            // Call the select callback if provided
            if (typeof onSelectCallback === 'function') {
                onSelectCallback(element, type);
            }
        });
        
        return card;
    }
};
