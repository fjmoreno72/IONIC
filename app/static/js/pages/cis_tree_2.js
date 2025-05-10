/**
 * CIS Plan Tree Component 2.0
 * 
 * Manages the tree view for CIS Plan hierarchy visualization.
 * Provides functions for creating, selecting, and navigating tree nodes.
 */

const CISTree2 = {
    // DOM element references
    treeContent: null,
    
    // State management
    currentTreeNode: null,
    expandedNodes: new Set(),
    
    // Entity type to display name mapping
    entityTypeLabels: {
        'mission_network': 'Mission Network',
        'network_segment': 'Network Segment',
        'security_domain': 'Security Domain',
        'hw_stack': 'HW Stack',
        'asset': 'Asset',
        'network_interface': 'Network Interface',
        'gp_instance': 'GP Instance',
        'sp_instance': 'SP Instance'
    },
    
    /**
     * Initialize the tree component
     */
    init: function() {
        console.log('Initializing CIS Tree component');
        this.treeContent = document.getElementById('tree-content');
        if (!this.treeContent) {
            console.error('Tree content element not found');
            return;
        }
    },
    
    /**
     * Render the CIS Plan tree
     * @param {Object} cisPlanData - The CIS Plan data
     */
    renderTree: function(cisPlanData) {
        console.log('Rendering CIS Plan tree with data:', cisPlanData);
        if (!this.treeContent) {
            console.error('Tree content element not found for rendering');
            return;
        }
        if (!cisPlanData) {
            console.error('No CIS Plan data provided for rendering');
            return;
        }
        
        // Clear existing content
        this.treeContent.innerHTML = '';
        
        // Reset expanded nodes set
        this.expandedNodes = new Set();
        
        // Create root node
        const rootNode = this.createTreeNode('cisplan', 'CIS Plan', null, null);
        rootNode.classList.add('active');
        this.currentTreeNode = rootNode;
        this.treeContent.appendChild(rootNode);
        
        let missionNetworks = [];
        
        // Extract mission networks from the data structure
        if (cisPlanData.missionNetworks && Array.isArray(cisPlanData.missionNetworks)) {
            // Case: Direct access to missionNetworks array
            console.log('Found mission networks directly in cisPlanData');
            missionNetworks = cisPlanData.missionNetworks;
        } else if (cisPlanData.data && cisPlanData.data.missionNetworks && Array.isArray(cisPlanData.data.missionNetworks)) {
            // Case: API response with data.missionNetworks
            console.log('Found mission networks in cisPlanData.data');
            missionNetworks = cisPlanData.data.missionNetworks;
        }
        
        // Add mission networks to the root node
        if (missionNetworks.length > 0) {
            console.log(`Found ${missionNetworks.length} mission networks to render`);
            
            const childContainer = document.createElement('div');
            childContainer.className = 'tree-children';
            childContainer.style.display = 'none'; // Initially hidden
            rootNode.appendChild(childContainer);
            
            // Add expand icon to root node
            const expandIcon = rootNode.querySelector('.expand-icon');
            if (expandIcon) {
                expandIcon.style.visibility = 'visible';
                expandIcon.innerHTML = '&#9658;'; // Right-pointing triangle
            }
            
            this.renderMissionNetworks(childContainer, missionNetworks);
        } else {
            console.warn('No mission networks found in data');
        }
    },
    
    /**
     * Render mission networks
     * @param {HTMLElement} container - The container element
     * @param {Array} missionNetworks - Array of mission networks
     */
    renderMissionNetworks: function(container, missionNetworks) {
        console.log('Rendering mission networks:', missionNetworks);
        if (!missionNetworks || !missionNetworks.length) {
            console.warn('No mission networks to render');
            return;
        }
        
        missionNetworks.forEach(missionNetwork => {
            console.log('Processing mission network:', missionNetwork);
            const node = this.createTreeNode(
                'mission_network',
                missionNetwork.name, 
                missionNetwork.id, 
                missionNetwork.guid
            );
            
            container.appendChild(node);
            
            // If this mission network has segments, create a container for them
            if (missionNetwork.networkSegments && missionNetwork.networkSegments.length > 0) {
                console.log(`Mission network ${missionNetwork.name} has ${missionNetwork.networkSegments.length} segments`);
                const childContainer = document.createElement('div');
                childContainer.className = 'tree-children';
                childContainer.style.display = 'none'; // Initially hidden
                node.appendChild(childContainer);
                
                // Add expand icon to node
                const expandIcon = node.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.style.visibility = 'visible';
                    expandIcon.innerHTML = '&#9658;'; // Right-pointing triangle
                }
                
                // Only show children if this node is expanded
                if (this.expandedNodes.has(missionNetwork.guid)) {
                    childContainer.style.display = 'block';
                    this.renderNetworkSegments(childContainer, missionNetwork.networkSegments, missionNetwork);
                }
            } else {
                console.log(`Mission network ${missionNetwork.name} has no segments`);
            }
        });
    },
    
    /**
     * Render network segments in the tree
     * @param {HTMLElement} container - Container element
     * @param {Array} networkSegments - Array of network segments
     * @param {Object} parentNetwork - Parent mission network
     */
    renderNetworkSegments: function(container, networkSegments, parentNetwork) {
        networkSegments.forEach(segment => {
            const node = this.createTreeNode(
                'network_segment',
                segment.name, 
                segment.id, 
                segment.guid,
                parentNetwork.guid
            );
            
            container.appendChild(node);
            
            // If this segment has security domains, create a container for them
            if (segment.securityDomains && segment.securityDomains.length > 0) {
                const childContainer = document.createElement('div');
                childContainer.className = 'tree-children';
                childContainer.style.display = 'none'; // Initially hidden
                node.appendChild(childContainer);
                
                // Add expand icon to node
                const expandIcon = node.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.style.visibility = 'visible';
                    expandIcon.innerHTML = '&#9658;'; // Right-pointing triangle
                }
                
                // Only show children if this node is expanded
                if (this.expandedNodes.has(segment.guid)) {
                    childContainer.style.display = 'block';
                    this.renderSecurityDomains(childContainer, segment.securityDomains, segment, parentNetwork);
                }
            }
        });
    },
    
    /**
     * Render security domains in the tree
     * @param {HTMLElement} container - Container element
     * @param {Array} securityDomains - Array of security domains
     * @param {Object} parentSegment - Parent network segment
     * @param {Object} parentNetwork - Parent mission network
     */
    renderSecurityDomains: function(container, securityDomains, parentSegment, parentNetwork) {
        securityDomains.forEach(domain => {
            const node = this.createTreeNode(
                'security_domain',
                domain.id, // Security domains use ID as name
                domain.id,
                domain.guid,
                parentSegment.guid
            );
            
            container.appendChild(node);
            
            // If this domain has HW stacks, create a container for them
            if (domain.hwStacks && domain.hwStacks.length > 0) {
                const childContainer = document.createElement('div');
                childContainer.className = 'tree-children';
                childContainer.style.display = 'none'; // Initially hidden
                node.appendChild(childContainer);
                
                // Add expand icon to node
                const expandIcon = node.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.style.visibility = 'visible';
                    expandIcon.innerHTML = '&#9658;'; // Right-pointing triangle
                }
                
                // Only show children if this node is expanded
                if (this.expandedNodes.has(domain.guid)) {
                    childContainer.style.display = 'block';
                    this.renderHWStacks(childContainer, domain.hwStacks, domain, parentSegment, parentNetwork);
                }
            }
        });
    },
    
    /**
     * Render HW stacks in the tree
     * @param {HTMLElement} container - Container element
     * @param {Array} hwStacks - Array of HW stacks
     * @param {Object} parentDomain - Parent security domain
     * @param {Object} parentSegment - Parent network segment
     * @param {Object} parentNetwork - Parent mission network
     */
    renderHWStacks: function(container, hwStacks, parentDomain, parentSegment, parentNetwork) {
        hwStacks.forEach(stack => {
            const node = this.createTreeNode(
                'hw_stack',
                stack.name, 
                stack.id, 
                stack.guid,
                parentDomain.guid
            );
            
            container.appendChild(node);
            
            // If this stack has assets, create a container for them
            if (stack.assets && stack.assets.length > 0) {
                const childContainer = document.createElement('div');
                childContainer.className = 'tree-children';
                childContainer.style.display = 'none'; // Initially hidden
                node.appendChild(childContainer);
                
                // Add expand icon to node
                const expandIcon = node.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.style.visibility = 'visible';
                    expandIcon.innerHTML = '&#9658;'; // Right-pointing triangle
                }
                
                // Only show children if this node is expanded
                if (this.expandedNodes.has(stack.guid)) {
                    childContainer.style.display = 'block';
                    this.renderAssets(childContainer, stack.assets, stack, parentDomain, parentSegment, parentNetwork);
                }
            }
        });
    },
    
    /**
     * Render assets in the tree
     * @param {HTMLElement} container - Container element
     * @param {Array} assets - Array of assets
     * @param {Object} parentStack - Parent HW stack
     * @param {Object} parentDomain - Parent security domain
     * @param {Object} parentSegment - Parent network segment
     * @param {Object} parentNetwork - Parent mission network
     */
    renderAssets: function(container, assets, parentStack, parentDomain, parentSegment, parentNetwork) {
        assets.forEach(asset => {
            const node = this.createTreeNode(
                'asset',
                asset.name, 
                asset.id, 
                asset.guid,
                parentStack.guid
            );
            
            container.appendChild(node);
            
            // If this asset has network interfaces or GP instances, create containers for them
            const hasNetworkInterfaces = asset.networkInterfaces && asset.networkInterfaces.length > 0;
            const hasGpInstances = asset.gpInstances && asset.gpInstances.length > 0;
            
            if (hasNetworkInterfaces || hasGpInstances) {
                const childContainer = document.createElement('div');
                childContainer.className = 'tree-children';
                childContainer.style.display = 'none'; // Initially hidden
                node.appendChild(childContainer);
                
                // Add expand icon to node
                const expandIcon = node.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.style.visibility = 'visible';
                    expandIcon.innerHTML = '&#9658;'; // Right-pointing triangle
                }
                
                // Only show children if this node is expanded
                if (this.expandedNodes.has(asset.guid)) {
                    childContainer.style.display = 'block';
                    if (hasNetworkInterfaces) {
                        this.renderNetworkInterfaces(childContainer, asset.networkInterfaces, asset, parentStack, parentDomain, parentSegment, parentNetwork);
                    }
                    
                    if (hasGpInstances) {
                        this.renderGPInstances(childContainer, asset.gpInstances, asset, parentStack, parentDomain, parentSegment, parentNetwork);
                    }
                }
            }
        });
    },
    
    /**
     * Render network interfaces in the tree
     * @param {HTMLElement} container - Container element
     * @param {Array} interfaces - Array of network interfaces
     * @param {Object} parentAsset - Parent asset
     * @param {Object} parentStack - Parent HW stack
     * @param {Object} parentDomain - Parent security domain
     * @param {Object} parentSegment - Parent network segment
     * @param {Object} parentNetwork - Parent mission network
     */
    renderNetworkInterfaces: function(container, interfaces, parentAsset, parentStack, parentDomain, parentSegment, parentNetwork) {
        interfaces.forEach(iface => {
            const node = this.createTreeNode(
                'network_interface',
                iface.name, 
                iface.id, 
                iface.guid,
                parentAsset.guid
            );
            
            container.appendChild(node);
        });
    },
    
    /**
     * Render GP instances in the tree
     * @param {HTMLElement} container - Container element
     * @param {Array} gpInstances - Array of GP instances
     * @param {Object} parentAsset - Parent asset
     * @param {Object} parentStack - Parent HW stack
     * @param {Object} parentDomain - Parent security domain
     * @param {Object} parentSegment - Parent network segment
     * @param {Object} parentNetwork - Parent mission network
     */
    renderGPInstances: function(container, gpInstances, parentAsset, parentStack, parentDomain, parentSegment, parentNetwork) {
        gpInstances.forEach(gp => {
            // Create a display name that includes the instance label if available
            const displayName = gp.instanceLabel ? 
                `${gp.gpid} (${gp.instanceLabel})` : 
                gp.gpid;
                
            const node = this.createTreeNode(
                'gp_instance',
                displayName, 
                gp.gpid, 
                gp.guid,
                parentAsset.guid
            );
            
            container.appendChild(node);
            
            // If this GP instance has SP instances, create a container for them
            if (gp.spInstances && gp.spInstances.length > 0) {
                const childContainer = document.createElement('div');
                childContainer.className = 'tree-children';
                childContainer.style.display = 'none'; // Initially hidden
                node.appendChild(childContainer);
                
                // Add expand icon to node
                const expandIcon = node.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.style.visibility = 'visible';
                    expandIcon.innerHTML = '&#9658;'; // Right-pointing triangle
                }
                
                // Only show children if this node is expanded
                if (this.expandedNodes.has(gp.guid)) {
                    childContainer.style.display = 'block';
                    this.renderSPInstances(childContainer, gp.spInstances, gp, parentAsset, parentStack, parentDomain, parentSegment, parentNetwork);
                }
            }
        });
    },
    
    /**
     * Render SP instances in the tree
     * @param {HTMLElement} container - Container element
     * @param {Array} spInstances - Array of SP instances
     * @param {Object} parentGP - Parent GP instance
     * @param {Object} parentAsset - Parent asset
     * @param {Object} parentStack - Parent HW stack
     * @param {Object} parentDomain - Parent security domain
     * @param {Object} parentSegment - Parent network segment
     * @param {Object} parentNetwork - Parent mission network
     */
    renderSPInstances: function(container, spInstances, parentGP, parentAsset, parentStack, parentDomain, parentSegment, parentNetwork) {
        spInstances.forEach(sp => {
            // Create a display name that includes the SP version
            const displayName = sp.spVersion ? 
                `${sp.spId} (v${sp.spVersion})` : 
                sp.spId;
                
            const node = this.createTreeNode(
                'sp_instance',
                displayName, 
                sp.spId, 
                sp.guid,
                parentGP.guid
            );
            
            container.appendChild(node);
        });
    },
    
    /**
     * Create a tree node element
     * @param {string} type - Type of node
     * @param {string} name - Display name
     * @param {string} id - ID of the entity
     * @param {string} guid - GUID of the entity
     * @param {string} parentGuid - GUID of the parent entity
     * @returns {HTMLElement} The created tree node
     */
    createTreeNode: function(type, name, id, guid, parentGuid) {
        const node = document.createElement('div');
        node.className = 'tree-node';
        node.setAttribute('data-type', type);
        if (id) node.setAttribute('data-id', id);
        if (guid) node.setAttribute('data-guid', guid);
        if (parentGuid) node.setAttribute('data-parent-guid', parentGuid);
        
        // Check if this is a container node that can have children
        const isContainer = ['cisplan', 'mission_network', 'network_segment', 'security_domain', 'hw_stack', 'asset'].includes(type);
        
        // Create node content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'tree-node-content';
        
        // Add expand/collapse icon if the node can have children
        const expandIcon = document.createElement('span');
        expandIcon.className = 'expand-icon';
        expandIcon.innerHTML = isContainer ? '&#9658;' : ''; // Right-pointing triangle
        expandIcon.style.visibility = isContainer ? 'visible' : 'hidden';
        contentDiv.appendChild(expandIcon);

        // Add debug attribute to help diagnose issues
        node.setAttribute('data-debug-name', name);
        
        // Add icon
        const icon = document.createElement('img');
        icon.className = 'node-icon';
        icon.src = this.getEntityIcon(type);
        icon.alt = type;
        contentDiv.appendChild(icon);
        
        // Add label
        const label = document.createElement('span');
        label.textContent = name;
        contentDiv.appendChild(label);
        
        // Append the content div to the node
        node.appendChild(contentDiv);
        
        // Add click handler for expand/collapse and selection
        node.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`Tree node clicked: ${type} - ${name} (${guid})`);
            
            // Toggle expanded state if clicking on the expand icon
            if (isContainer && (e.target === expandIcon || e.target === expandIcon.firstChild)) {
                console.log('Expand icon clicked, toggling node expansion');
                this.toggleNodeExpanded(node);
                return;
            }
            
            // Set as active node
            this.selectTreeNode(node);
            
            // Double click expands and navigates down
            if (e.detail === 2 && isContainer) {
                console.log('Double click detected, expanding node and navigating down');
                this.expandNode(node);
                
                // Signal to navigate to this node
                const event = new CustomEvent('cis:node-navigate', {
                    detail: {
                        guid: guid,
                        type: type
                    }
                });
                document.dispatchEvent(event);
            }
        });
        
        // Explicitly add click handler to expand icon to ensure it works
        if (isContainer) {
            expandIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('Expand icon directly clicked');
                this.toggleNodeExpanded(node);
            });
        }
        
        return node;
    },
    
    /**
     * Select a tree node and deselect others
     * @param {HTMLElement} node - The node to select
     */
    selectTreeNode: function(node) {
        if (!node) return;
        
        // Remove active class from all nodes
        document.querySelectorAll('.tree-node.active').forEach(n => {
            n.classList.remove('active');
        });
        
        // Add active class to this node
        node.classList.add('active');
        this.currentTreeNode = node;
        
        // Dispatch selection event
        const event = new CustomEvent('cis:node-selected', {
            detail: {
                type: node.getAttribute('data-type'),
                id: node.getAttribute('data-id'),
                guid: node.getAttribute('data-guid'),
                parentGuid: node.getAttribute('data-parent-guid')
            }
        });
        document.dispatchEvent(event);
    },
    
    /**
     * Toggle the expanded state of a node
     * @param {HTMLElement} node - The node to toggle
     */
    toggleNodeExpanded: function(node) {
        const guid = node.getAttribute('data-guid') || node.getAttribute('data-type');
        const name = node.getAttribute('data-debug-name');
        const expandIcon = node.querySelector('.expand-icon');
        const childContainer = node.querySelector('.tree-children');
        
        console.log(`Toggling expansion for node: ${guid} (${name})`);
        
        if (this.expandedNodes.has(guid)) {
            // Collapse
            console.log(`Collapsing node: ${guid} (${name})`);
            this.expandedNodes.delete(guid);
            if (expandIcon) expandIcon.innerHTML = '&#9658;';
            
            // Hide children visually
            if (childContainer) {
                childContainer.style.display = 'none';
            }
        } else {
            // Expand
            console.log(`Expanding node: ${guid} (${name})`);
            this.expandedNodes.add(guid);
            if (expandIcon) expandIcon.innerHTML = '&#9660;';
            
            // Show children visually
            if (childContainer) {
                childContainer.style.display = 'block';
            } else {
                // Load children if not already loaded
                this.expandNode(node);
            }
        }
    },
    
    /**
     * Expand a node and ensure its children are loaded
     * @param {HTMLElement} node - The node to expand
     */
    expandNode: function(node) {
        const guid = node.getAttribute('data-guid');
        const type = node.getAttribute('data-type');
        
        // Add to expanded nodes set
        if (guid) {
            this.expandedNodes.add(guid);
        } else if (type) {
            this.expandedNodes.add(type);
        }
        
        // Update expand icon
        const expandIcon = node.querySelector('.expand-icon');
        if (expandIcon) expandIcon.innerHTML = '&#9660;';
        
        // If children container doesn't exist or is empty, we need to refresh it
        const childContainer = node.querySelector('.tree-children');
        if (!childContainer || childContainer.children.length === 0) {
            // This would trigger a data fetch and repopulation of the children
            const event = new CustomEvent('cis:refresh-children', {
                detail: {
                    guid: guid,
                    type: type,
                    node: node
                }
            });
            document.dispatchEvent(event);
        }
    },
    
    /**
     * Select a tree node by its GUID
     * @param {string} guid - GUID of the node to select
     * @returns {boolean} Whether the node was found and selected
     */
    selectNodeByGuid: function(guid) {
        if (!guid) return false;
        
        const node = document.querySelector(`.tree-node[data-guid="${guid}"]`);
        if (node) {
            this.selectTreeNode(node);
            
            // Ensure the node is visible by expanding its parents
            this.expandParents(node);
            
            return true;
        }
        
        return false;
    },
    
    /**
     * Select a tree node by its type and ID
     * @param {string} type - Type of the node
     * @param {string} id - ID of the node
     * @returns {boolean} Whether the node was found and selected
     */
    selectNodeByTypeAndId: function(type, id) {
        if (!type || !id) return false;
        
        const node = document.querySelector(`.tree-node[data-type="${type}"][data-id="${id}"]`);
        if (node) {
            this.selectTreeNode(node);
            
            // Ensure the node is visible by expanding its parents
            this.expandParents(node);
            
            return true;
        }
        
        return false;
    },
    
    /**
     * Expand all parent nodes to make a node visible
     * @param {HTMLElement} node - The node whose parents should be expanded
     */
    expandParents: function(node) {
        if (!node) return;
        
        let parent = node.parentElement;
        while (parent) {
            if (parent.classList.contains('tree-children')) {
                const parentNode = parent.parentElement;
                if (parentNode && parentNode.classList.contains('tree-node')) {
                    const guid = parentNode.getAttribute('data-guid');
                    const type = parentNode.getAttribute('data-type');
                    
                    // Add to expanded nodes set
                    if (guid) {
                        this.expandedNodes.add(guid);
                    } else if (type) {
                        this.expandedNodes.add(type);
                    }
                    
                    // Update expand icon
                    const expandIcon = parentNode.querySelector('.expand-icon');
                    if (expandIcon) expandIcon.innerHTML = '&#9660;';
                }
            }
            parent = parent.parentElement;
        }
    },
    
    /**
     * Navigate up the tree from the current node
     * @returns {boolean} Whether navigation was successful
     */
    navigateUp: function() {
        if (!this.currentTreeNode) return false;
        
        const type = this.currentTreeNode.getAttribute('data-type');
        const parentGuid = this.currentTreeNode.getAttribute('data-parent-guid');
        
        // Can't go up from root
        if (type === 'cisplan') return false;
        
        if (parentGuid) {
            return this.selectNodeByGuid(parentGuid);
        }
        
        // If no parent GUID, navigate to root
        if (type === 'mission_network') {
            const rootNode = document.querySelector('.tree-node[data-type="cisplan"]');
            if (rootNode) {
                this.selectTreeNode(rootNode);
                return true;
            }
        }
        
        return false;
    },
    
    /**
     * Get the appropriate icon for an entity type
     * @param {string} type - Entity type
     * @returns {string} URL of the icon
     */
    getEntityIcon: function(type) {
        // Map entity types to icon URLs from CISUtils.ENTITY_META
        const iconMappings = {
            'cisplan': '/static/img/CIS-PLAN.svg',
            'mission_network': '/static/img/missionNetworks.svg',
            'network_segment': '/static/img/networkSegments.svg',
            'security_domain': '/static/img/securityDomains.svg',
            'hw_stack': '/static/img/hwStacks.svg',
            'asset': '/static/img/assets.svg',
            'network_interface': '/static/img/networkInterfaces.svg',
            'gp_instance': '/static/img/gpInstances.svg',
            'sp_instance': '/static/img/spInstances.svg'
        };
        
        return iconMappings[type] || '/static/img/unknown.svg';
    }
};
