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
    fullTreeData: null,
    
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
        
        // Process and store the data
        if (cisPlanData) {
            if (cisPlanData.data && cisPlanData.data.missionNetworks) {
                // API response format: {data: {missionNetworks: [...]}}
                this.fullTreeData = cisPlanData.data;
                console.log('Extracted data from API response format');
            } else if (cisPlanData.missionNetworks) {
                // Direct data format: {missionNetworks: [...]}
                this.fullTreeData = cisPlanData;
                console.log('Using direct data format');
            }
        }
        
        // Validate we have data to render
        if (!this.fullTreeData || !this.fullTreeData.missionNetworks) {
            console.error('No valid CIS Plan data to render');
            return;
        }
        
        if (!this.treeContent) {
            console.error('Tree content element not found for rendering');
            return;
        }
        
        // Apply vertical tree styling
        this.treeContent.style.display = 'block';
        this.treeContent.style.padding = '10px';
        this.treeContent.style.overflow = 'auto';
        
        // Clear existing content
        this.treeContent.innerHTML = '';
        
        // Create root node
        const rootNode = this.createTreeNode('cisplan', 'CIS Plan', null, null);
        this.treeContent.appendChild(rootNode);
        
        // Add click handler to root node
        const self = this;
        rootNode.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Select this node using the centralized function
            self.selectTreeNode(this);
            
            // Dispatch node selected event
            const event = new CustomEvent('cis:node-selected', {
                detail: {
                    type: 'cisplan',
                    id: null,
                    guid: null,
                    data: self.fullTreeData
                }
            });
            document.dispatchEvent(event);
        });
        
        // Get mission networks from the stored data
        const missionNetworks = this.fullTreeData.missionNetworks || [];
        console.log(`Found ${missionNetworks.length} mission networks to render`);
        
        // Initialize expanded nodes set if not already done
        // By default, expand all nodes to show the full hierarchy
        if (!this._expandedInitialized) {
            // Add root node to expanded set
            this.expandedNodes.add(null);
            
            // Add all entity GUIDs to expanded set
            function collectAllGuids(data) {
                const guids = new Set();
                
                function addEntityGuids(entity) {
                    if (!entity || typeof entity !== 'object') return;
                    
                    // Add this entity's GUID if it has one
                    if (entity.guid) guids.add(entity.guid);
                    
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
                    
                    // Recursively process all children
                    childCollections.forEach(collection => {
                        if (Array.isArray(entity[collection])) {
                            entity[collection].forEach(child => addEntityGuids(child));
                        }
                    });
                }
                
                // Start with the top-level entity
                addEntityGuids(data);
                return guids;
            }
            
            // Collect all GUIDs and add them to expanded nodes
            const allGuids = collectAllGuids(this.fullTreeData);
            allGuids.forEach(guid => this.expandedNodes.add(guid));
            
            console.log(`Auto-expanded ${allGuids.size} nodes in the tree`);
            this._expandedInitialized = true;
        }
        
        // Create container for mission networks
        const childContainer = document.createElement('div');
        childContainer.className = 'tree-children';
        // Set vertical styling for children container
        childContainer.style.display = 'block';
        childContainer.style.marginLeft = '20px';
        childContainer.style.paddingLeft = '10px';
        childContainer.style.borderLeft = '1px dotted #ccc';
        rootNode.appendChild(childContainer);
        
        // Set expand icon for root
        const expandIcon = rootNode.querySelector('.expand-icon');
        if (expandIcon) {
            expandIcon.style.visibility = 'visible';
            expandIcon.innerHTML = '&#9660;'; // Down-pointing triangle (expanded)
            expandIcon.onclick = (e) => {
                e.stopPropagation();
                if (childContainer.style.display === 'block') {
                    childContainer.style.display = 'none';
                    expandIcon.innerHTML = '&#9658;'; // Right-pointing triangle
                } else {
                    childContainer.style.display = 'block';
                    expandIcon.innerHTML = '&#9660;'; // Down-pointing triangle
                }
            };
        }
        
        // Render mission networks
        if (missionNetworks.length > 0) {
            this.renderMissionNetworks(childContainer, missionNetworks);
        } else {
            console.warn('No mission networks found in data');
            childContainer.innerHTML = '<div class="tree-node-empty">No mission networks found</div>';
        }
    },
    
    /**
     * Render mission networks
     * @param {HTMLElement} container - The container element
     * @param {Array} missionNetworks - Array of mission networks
     */
    renderMissionNetworks: function(container, missionNetworks) {
        console.log(`Rendering ${missionNetworks.length} mission networks`);
        if (!missionNetworks || !missionNetworks.length) {
            console.warn('No mission networks to render');
            return;
        }
        
        const self = this;
        
        // Process each mission network
        missionNetworks.forEach(network => {
            // Create mission network node
            const networkNode = this.createTreeNode(
                'mission_network',
                network.name,
                network.id,
                network.guid
            );
            container.appendChild(networkNode);
            
            // Set up click handler
            networkNode.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Select this node using the centralized function
                self.selectTreeNode(this);
                
                // Dispatch node selected event
                const event = new CustomEvent('cis:node-selected', {
                    detail: {
                        type: 'mission_network',
                        id: network.id,
                        guid: network.guid,
                        data: network
                    }
                });
                document.dispatchEvent(event);
            });
            
            // If network has segments, create child container
            if (network.networkSegments && network.networkSegments.length > 0) {
                const childContainer = document.createElement('div');
                childContainer.className = 'tree-children';
                networkNode.appendChild(childContainer);
                
                // Apply consistent styling
                this.styleChildContainer(childContainer);
                
                // Set display based on expanded state
                const isExpanded = this.expandedNodes.has(network.guid);
                childContainer.style.display = isExpanded ? 'block' : 'none';
                
                // Update expand icon
                const expandIcon = networkNode.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.style.visibility = 'visible';
                    expandIcon.innerHTML = isExpanded ? '&#9660;' : '&#9658;';
                    
                    // Add click handler for expand/collapse
                    expandIcon.onclick = (e) => {
                        e.stopPropagation();
                        this.toggleNodeExpanded(networkNode);
                    };
                }
                
                // Render network segments
                this.renderNetworkSegments(childContainer, network.networkSegments, network);
            }
        });
    },
    
    /**
     * Render network segments
     * @param {HTMLElement} container - The container element
     * @param {Array} segments - Array of network segments
     * @param {Object} parentNetwork - Parent mission network
     */
    renderNetworkSegments: function(container, segments, parentNetwork) {
        if (!segments || !segments.length) return;
        
        const self = this;
        
        segments.forEach(segment => {
            // Create segment node
            const segmentNode = this.createTreeNode(
                'network_segment',
                segment.name,
                segment.id,
                segment.guid
            );
            container.appendChild(segmentNode);
            
            // Set up click handler
            segmentNode.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Select this node using the centralized function
                self.selectTreeNode(this);
                
                // Dispatch node selected event
                const event = new CustomEvent('cis:node-selected', {
                    detail: {
                        type: 'network_segment',
                        id: segment.id,
                        guid: segment.guid,
                        data: segment,
                        parentNetwork: parentNetwork
                    }
                });
                document.dispatchEvent(event);
            });
            
            // If segment has security domains, create child container
            if (segment.securityDomains && segment.securityDomains.length > 0) {
                const childContainer = document.createElement('div');
                childContainer.className = 'tree-children';
                segmentNode.appendChild(childContainer);
                
                // Set display based on expanded state
                const isExpanded = this.expandedNodes.has(segment.guid);
                childContainer.style.display = isExpanded ? 'block' : 'none';
                
                // Update expand icon
                const expandIcon = segmentNode.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.style.visibility = 'visible';
                    expandIcon.innerHTML = isExpanded ? '&#9660;' : '&#9658;';
                    
                    // Add click handler for expand/collapse
                    expandIcon.onclick = (e) => {
                        e.stopPropagation();
                        this.toggleNodeExpanded(segmentNode);
                    };
                }
                
                // Render security domains
                this.renderSecurityDomains(childContainer, segment.securityDomains, segment, parentNetwork);
            }
        });
    },
    
    /**
     * Render security domains
     * @param {HTMLElement} container - The container element
     * @param {Array} domains - Array of security domains
     * @param {Object} parentSegment - Parent network segment
     * @param {Object} parentNetwork - Parent mission network
     */
    renderSecurityDomains: function(container, domains, parentSegment, parentNetwork) {
        if (!domains || !domains.length) return;
        
        const self = this;
        
        domains.forEach(domain => {
            // Create domain node
            const domainNode = this.createTreeNode(
                'security_domain',
                domain.id, // Using ID as name since security domains often use classification IDs
                domain.id,
                domain.guid
            );
            container.appendChild(domainNode);
            
            // Set up click handler
            domainNode.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Select this node using the centralized function
                self.selectTreeNode(this);
                
                // Dispatch node selected event
                const event = new CustomEvent('cis:node-selected', {
                    detail: {
                        type: 'security_domain',
                        id: domain.id,
                        guid: domain.guid,
                        data: domain,
                        parentSegment: parentSegment,
                        parentNetwork: parentNetwork
                    }
                });
                document.dispatchEvent(event);
            });
            
            // If domain has HW stacks, create child container
            if (domain.hwStacks && domain.hwStacks.length > 0) {
                const childContainer = document.createElement('div');
                childContainer.className = 'tree-children';
                domainNode.appendChild(childContainer);
                
                // Set display based on expanded state
                const isExpanded = this.expandedNodes.has(domain.guid);
                childContainer.style.display = isExpanded ? 'block' : 'none';
                
                // Update expand icon
                const expandIcon = domainNode.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.style.visibility = 'visible';
                    expandIcon.innerHTML = isExpanded ? '&#9660;' : '&#9658;';
                    
                    // Add click handler for expand/collapse
                    expandIcon.onclick = (e) => {
                        e.stopPropagation();
                        this.toggleNodeExpanded(domainNode);
                    };
                }
                
                // Render HW stacks
                this.renderHWStacks(childContainer, domain.hwStacks, domain, parentSegment, parentNetwork);
            }
        });
    },
    
    /**
     * Render HW stacks
     * @param {HTMLElement} container - The container element
     * @param {Array} stacks - Array of HW stacks
     * @param {Object} parentDomain - Parent security domain
     * @param {Object} parentSegment - Parent network segment
     * @param {Object} parentNetwork - Parent mission network
     */
    renderHWStacks: function(container, stacks, parentDomain, parentSegment, parentNetwork) {
        if (!stacks || !stacks.length) return;
        
        const self = this;
        
        stacks.forEach(stack => {
            // Create stack node
            const stackNode = this.createTreeNode(
                'hw_stack',
                stack.name,
                stack.id,
                stack.guid
            );
            container.appendChild(stackNode);
            
            // Set up click handler
            stackNode.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Select this node using the centralized function
                self.selectTreeNode(this);
                
                // Dispatch node selected event
                const event = new CustomEvent('cis:node-selected', {
                    detail: {
                        type: 'hw_stack',
                        id: stack.id,
                        guid: stack.guid,
                        data: stack,
                        parentDomain: parentDomain,
                        parentSegment: parentSegment,
                        parentNetwork: parentNetwork
                    }
                });
                document.dispatchEvent(event);
            });
            
            // If stack has assets, create child container
            if (stack.assets && stack.assets.length > 0) {
                const childContainer = document.createElement('div');
                childContainer.className = 'tree-children';
                stackNode.appendChild(childContainer);
                
                // Set display based on expanded state
                const isExpanded = this.expandedNodes.has(stack.guid);
                childContainer.style.display = isExpanded ? 'block' : 'none';
                
                // Update expand icon
                const expandIcon = stackNode.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.style.visibility = 'visible';
                    expandIcon.innerHTML = isExpanded ? '&#9660;' : '&#9658;';
                    
                    // Add click handler for expand/collapse
                    expandIcon.onclick = (e) => {
                        e.stopPropagation();
                        this.toggleNodeExpanded(stackNode);
                    };
                }
                
                // Render assets
                this.renderAssets(childContainer, stack.assets, stack, parentDomain, parentSegment, parentNetwork);
            }
        });
    },
    
    /**
     * Render assets
     * @param {HTMLElement} container - The container element
     * @param {Array} assets - Array of assets
     * @param {Object} parentStack - Parent HW stack
     * @param {Object} parentDomain - Parent security domain
     * @param {Object} parentSegment - Parent network segment
     * @param {Object} parentNetwork - Parent mission network
     */
    renderAssets: function(container, assets, parentStack, parentDomain, parentSegment, parentNetwork) {
        if (!assets || !assets.length) return;
        
        const self = this;
        
        assets.forEach(asset => {
            // Create asset node
            const assetNode = this.createTreeNode(
                'asset',
                asset.name,
                asset.id,
                asset.guid
            );
            container.appendChild(assetNode);
            
            // Set up click handler
            assetNode.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Select this node using the centralized function
                self.selectTreeNode(this);
                
                // Dispatch node selected event
                const event = new CustomEvent('cis:node-selected', {
                    detail: {
                        type: 'asset',
                        id: asset.id,
                        guid: asset.guid,
                        data: asset,
                        parentStack: parentStack,
                        parentDomain: parentDomain,
                        parentSegment: parentSegment,
                        parentNetwork: parentNetwork
                    }
                });
                document.dispatchEvent(event);
            });
            
            // Check if asset has network interfaces or GP instances
            const hasNetworkInterfaces = asset.networkInterfaces && asset.networkInterfaces.length > 0;
            const hasGPInstances = asset.gpInstances && asset.gpInstances.length > 0;
            
            // If asset has children, create child container
            if (hasNetworkInterfaces || hasGPInstances) {
                const childContainer = document.createElement('div');
                childContainer.className = 'tree-children';
                assetNode.appendChild(childContainer);
                
                // Set display based on expanded state
                const isExpanded = this.expandedNodes.has(asset.guid);
                childContainer.style.display = isExpanded ? 'block' : 'none';
                
                // Update expand icon
                const expandIcon = assetNode.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.style.visibility = 'visible';
                    expandIcon.innerHTML = isExpanded ? '&#9660;' : '&#9658;';
                    
                    // Add click handler for expand/collapse
                    expandIcon.onclick = (e) => {
                        e.stopPropagation();
                        this.toggleNodeExpanded(assetNode);
                    };
                }
                
                // Render network interfaces
                if (hasNetworkInterfaces) {
                    this.renderNetworkInterfaces(childContainer, asset.networkInterfaces, asset, parentStack, parentDomain, parentSegment, parentNetwork);
                }
                
                // Render GP instances
                if (hasGPInstances) {
                    this.renderGPInstances(childContainer, asset.gpInstances, asset, parentStack, parentDomain, parentSegment, parentNetwork);
                }
            }
        });
    },
    
    /**
     * Render network interfaces
     * @param {HTMLElement} container - The container element
     * @param {Array} interfaces - Array of network interfaces
     * @param {Object} parentAsset - Parent asset
     * @param {Object} parentStack - Parent HW stack
     * @param {Object} parentDomain - Parent security domain
     * @param {Object} parentSegment - Parent network segment
     * @param {Object} parentNetwork - Parent mission network
     */
    renderNetworkInterfaces: function(container, interfaces, parentAsset, parentStack, parentDomain, parentSegment, parentNetwork) {
        if (!interfaces || !interfaces.length) return;
        
        const self = this;
        
        interfaces.forEach(iface => {
            // Get IP address from configuration items if available
            let ipAddress = 'N/A';
            if (iface.configurationItems && Array.isArray(iface.configurationItems)) {
                const ipItem = iface.configurationItems.find(item => item.Name === 'IP Address');
                if (ipItem && ipItem.AnswerContent) {
                    ipAddress = ipItem.AnswerContent;
                }
            }
            
            // Create interface node with name and IP address
            const displayName = `${iface.name} - ${ipAddress}`;
            const interfaceNode = this.createTreeNode(
                'network_interface',
                displayName,
                iface.id,
                iface.guid
            );
            container.appendChild(interfaceNode);
            
            // Set up click handler
            interfaceNode.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Select this node using the centralized function
                self.selectTreeNode(this);
                
                // Dispatch node selected event
                const event = new CustomEvent('cis:node-selected', {
                    detail: {
                        type: 'network_interface',
                        id: iface.id,
                        guid: iface.guid,
                        data: iface,
                        parentAsset: parentAsset,
                        parentStack: parentStack,
                        parentDomain: parentDomain,
                        parentSegment: parentSegment,
                        parentNetwork: parentNetwork
                    }
                });
                document.dispatchEvent(event);
            });
        });
    },
    
    /**
     * Render GP instances
     * @param {HTMLElement} container - The container element
     * @param {Array} gpInstances - Array of GP instances
     * @param {Object} parentAsset - Parent asset
     * @param {Object} parentStack - Parent HW stack
     * @param {Object} parentDomain - Parent security domain
     * @param {Object} parentSegment - Parent network segment
     * @param {Object} parentNetwork - Parent mission network
     */
    renderGPInstances: function(container, gpInstances, parentAsset, parentStack, parentDomain, parentSegment, parentNetwork) {
        if (!gpInstances || !gpInstances.length) return;
        
        const self = this;
        
        gpInstances.forEach(gp => {
            // Create GP instance node
            const displayName = gp.instanceLabel ? `${gp.gpid} (${gp.instanceLabel})` : gp.gpid;
            const gpNode = this.createTreeNode(
                'gp_instance',
                displayName,
                gp.gpid,
                gp.guid
            );
            container.appendChild(gpNode);
            
            // Set up click handler
            gpNode.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Select this node using the centralized function
                self.selectTreeNode(this);
                
                // Dispatch node selected event
                const event = new CustomEvent('cis:node-selected', {
                    detail: {
                        type: 'gp_instance',
                        id: gp.gpid,
                        guid: gp.guid,
                        data: gp,
                        parentAsset: parentAsset,
                        parentStack: parentStack,
                        parentDomain: parentDomain,
                        parentSegment: parentSegment,
                        parentNetwork: parentNetwork
                    }
                });
                document.dispatchEvent(event);
            });
            
            // If GP instance has SP instances, create child container
            if (gp.spInstances && gp.spInstances.length > 0) {
                const childContainer = document.createElement('div');
                childContainer.className = 'tree-children';
                gpNode.appendChild(childContainer);
                
                // Set display based on expanded state
                const isExpanded = this.expandedNodes.has(gp.guid);
                childContainer.style.display = isExpanded ? 'block' : 'none';
                
                // Update expand icon
                const expandIcon = gpNode.querySelector('.expand-icon');
                if (expandIcon) {
                    expandIcon.style.visibility = 'visible';
                    expandIcon.innerHTML = isExpanded ? '&#9660;' : '&#9658;';
                    
                    // Add click handler for expand/collapse
                    expandIcon.onclick = (e) => {
                        e.stopPropagation();
                        this.toggleNodeExpanded(gpNode);
                    };
                }
                
                // Render SP instances
                this.renderSPInstances(childContainer, gp.spInstances, gp, parentAsset, parentStack, parentDomain, parentSegment, parentNetwork);
            }
        });
    },
    
    /**
     * Render SP instances
     * @param {HTMLElement} container - The container element
     * @param {Array} spInstances - Array of SP instances
     * @param {Object} parentGP - Parent GP instance
     * @param {Object} parentAsset - Parent asset
     * @param {Object} parentStack - Parent HW stack
     * @param {Object} parentDomain - Parent security domain
     * @param {Object} parentSegment - Parent network segment
     * @param {Object} parentNetwork - Parent mission network
     */
    renderSPInstances: function(container, spInstances, parentGP, parentAsset, parentStack, parentDomain, parentSegment, parentNetwork) {
        if (!spInstances || !spInstances.length) return;
        
        const self = this;
        
        spInstances.forEach(sp => {
            // Create SP instance node
            const displayName = sp.spVersion ? `${sp.spId} (v${sp.spVersion})` : sp.spId;
            const spNode = this.createTreeNode(
                'sp_instance',
                displayName,
                sp.spId,
                sp.guid
            );
            container.appendChild(spNode);
            
            // Set up click handler
            spNode.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Select this node using the centralized function
                self.selectTreeNode(this);
                
                // Dispatch node selected event
                const event = new CustomEvent('cis:node-selected', {
                    detail: {
                        type: 'sp_instance',
                        id: sp.spId,
                        guid: sp.guid,
                        data: sp,
                        parentGP: parentGP,
                        parentAsset: parentAsset,
                        parentStack: parentStack,
                        parentDomain: parentDomain,
                        parentSegment: parentSegment,
                        parentNetwork: parentNetwork
                    }
                });
                document.dispatchEvent(event);
            });
        });
    },
    
    /**
     * Create a tree node element
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
        container.style.display = 'block';
        container.style.marginLeft = '20px';
        container.style.paddingLeft = '10px';
        container.style.borderLeft = '1px dotted #ccc';
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
        
        this.currentTreeNode = node;
    },
    
    /**
     * Expand all parent nodes of a given node
     * @param {HTMLElement} node - The node whose parents to expand
     */
    expandParents: function(node) {
        if (!node) return;
        
        let parent = node.parentElement;
        while (parent) {
            // If parent is a tree-children container, expand it
            if (parent.classList.contains('tree-children')) {
                parent.style.display = 'block';
                
                // Update the expand icon of the parent node
                const parentNode = parent.parentElement;
                if (parentNode && parentNode.classList.contains('tree-node')) {
                    const expandIcon = parentNode.querySelector('.expand-icon');
                    if (expandIcon) {
                        expandIcon.innerHTML = '&#9660;'; // Down arrow
                    }
                    
                    // Add the parent node's GUID to expanded nodes set if available
                    const guid = parentNode.getAttribute('data-guid');
                    if (guid) {
                        this.expandedNodes.add(guid);
                    }
                }
            }
            parent = parent.parentElement;
        }
    },
    
    /**
     * Toggle the expanded state of a node
     * @param {HTMLElement} node - The node to toggle
     */
    toggleNodeExpanded: function(node) {
        if (!node) return;
        
        const guid = node.getAttribute('data-guid');
        const childContainer = node.querySelector('.tree-children');
        const expandIcon = node.querySelector('.expand-icon');
        
        if (!childContainer || !expandIcon) return;
        
        const isExpanded = childContainer.style.display === 'block';
        
        if (isExpanded) {
            // Collapse node
            childContainer.style.display = 'none';
            expandIcon.innerHTML = '&#9658;'; // Right-pointing triangle
            if (guid) this.expandedNodes.delete(guid);
        } else {
            // Expand node
            childContainer.style.display = 'block';
            expandIcon.innerHTML = '&#9660;'; // Down-pointing triangle
            if (guid) this.expandedNodes.add(guid);
        }
    },
    
    /**
     * Select a tree node by its GUID
     * @param {string} guid - GUID of the node to select
     * @returns {boolean} True if the node was found and selected, false otherwise
     */
    selectNodeByGuid: function(guid) {
        if (!guid) return false;
        
        // Find the node with the given GUID
        const node = document.querySelector(`.tree-node[data-guid="${guid}"]`);
        if (node) {
            // Select the node
            this.selectTreeNode(node);
            
            // Trigger a click on the node to dispatch the node-selected event
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            node.dispatchEvent(clickEvent);
            
            return true;
        }
        
        return false;
    },
    
    /**
     * Select a tree node by its type and ID
     * @param {string} type - Type of the node to select
     * @param {string} id - ID of the node to select
     * @returns {boolean} True if the node was found and selected, false otherwise
     */
    selectNodeByTypeAndId: function(type, id) {
        if (!type || !id) return false;
        
        // Find the node with the given type and ID
        const node = document.querySelector(`.tree-node[data-type="${type}"][data-id="${id}"]`);
        if (node) {
            // Select the node
            this.selectTreeNode(node);
            
            // Trigger a click on the node to dispatch the node-selected event
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
            });
            node.dispatchEvent(clickEvent);
            
            return true;
        }
        
        return false;
    },
    
    /**
     * Navigate up to the parent node
     */
    navigateUp: function() {
        if (!this.currentTreeNode) return;
        
        // Find the parent tree node
        let parent = this.currentTreeNode.parentElement;
        while (parent) {
            if (parent.classList.contains('tree-node')) {
                // Select the parent node
                this.selectTreeNode(parent);
                
                // Trigger a click on the parent node to dispatch the node-selected event
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                parent.dispatchEvent(clickEvent);
                
                return;
            }
            parent = parent.parentElement;
        }
    },
    
    /**
     * Get the appropriate icon for an entity type
     * @param {string} type - Entity type
     * @returns {string} URL of the icon
     */
    getEntityIcon: function(type) {
        // Use the centralized utility function
        return CISUtil2.getEntityIcon(type);
    }
}
