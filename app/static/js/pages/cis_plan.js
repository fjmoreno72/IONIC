/**
 * CIS Plan JavaScript file
 * 
 * This file handles the functionality for the CIS Plan view
 */

// Initialize variables for state management
let currentTreeNode = null;
let currentElement = null;
let cisPlanData = null;

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('CIS Plan JS loaded');
    
    // Get references to DOM elements
    const treeSearchInput = document.getElementById('treeSearchInput');
    const elementsSearchInput = document.getElementById('elementsSearchInput');
    const cisTree = document.getElementById('cisTree');
    const elementsContainer = document.getElementById('elementsContainer') || document.createElement('div');
    const elementsTitle = document.getElementById('elementsTitle') || document.createElement('h4');
    const detailsContainer = document.getElementById('detailsContainer') || document.createElement('div');
    const detailsTitle = document.getElementById('detailsTitle') || document.createElement('h4');
    const refreshButton = document.getElementById('refreshButton');
    const addElementButton = document.getElementById('addElementButton');
    const editDetailButton = document.getElementById('editDetailButton');
    const deleteDetailButton = document.getElementById('deleteDetailButton');
    
    // Add event listeners for search inputs
    treeSearchInput.addEventListener('input', handleTreeSearch);
    elementsSearchInput.addEventListener('input', handleElementsSearch);
    
    // Add event listeners for buttons
    if (refreshButton) {
        refreshButton.addEventListener('click', fetchCISPlanData);
    }
    
    // Initial data load
    fetchCISPlanData();
    
    // Fetch CIS Plan data from the API
    async function fetchCISPlanData() {
        try {
            // Show loading indicator in the tree
            cisTree.innerHTML = `
                <div class="d-flex justify-content-center p-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;
            
            // API endpoint is registered at this path in the api blueprint
            const response = await fetch('/api/cis_plan/tree');
            if (!response.ok) {
                throw new Error('Failed to fetch CIS Plan data');
            }
            
            const data = await response.json();
            console.log('API response:', data);
            if (data.status === 'success') {
                cisPlanData = data.data;
                console.log('CIS Plan data:', cisPlanData);
                renderTree(cisPlanData);
            } else {
                cisTree.innerHTML = `
                    <div class="alert alert-danger m-3">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Error fetching CIS Plan data: ${data.message || 'Unknown error'}
                    </div>
                `;
                console.error('Error fetching CIS Plan data:', data.message);
            }
        } catch (error) {
            cisTree.innerHTML = `
                <div class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error fetching CIS Plan data: ${error.message || 'Unknown error'}
                </div>
            `;
            console.error('Error fetching CIS Plan data:', error);
        }
    }
    
    // Render the tree based on CIS Plan data
    function renderTree(data) {
        // Clear the tree container
        cisTree.innerHTML = '';
        
        // Check if there's data to display
        if (!data || data.length === 0) {
            cisTree.innerHTML = `
                <div class="alert alert-info m-3">
                    <i class="fas fa-info-circle me-2"></i>
                    No CIS Plan data available
                </div>
            `;
            return;
        }
        
        // Create a container for the tree
        const treeContainer = document.createElement('div');
        treeContainer.className = 'tree-list p-2';
        cisTree.appendChild(treeContainer);

        // Create a root "CIS Plan" node
        const rootNode = createTreeNode(
            'cisplan',
            'CIS Plan',
            'root-cisplan',
            'root-guid',
            'cisplan'
        );
        treeContainer.appendChild(rootNode);
        
        // Create a container for mission networks under the root node
        const missionNetworksContainer = document.createElement('div');
        missionNetworksContainer.className = 'tree-node-children ms-4';
        missionNetworksContainer.style.display = 'none'; // Initially collapsed
        missionNetworksContainer.setAttribute('data-parent', 'root-cisplan');
        treeContainer.appendChild(missionNetworksContainer);
        
        // Add click event to toggle mission networks visibility
        rootNode.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = this.classList.contains('active');
            
            // Toggle active class
            document.querySelectorAll('.tree-node.active').forEach(node => {
                node.classList.remove('active');
            });
            
            if (!isActive) {
                this.classList.add('active');
                currentTreeNode = this;
            }
            
            // Toggle children container
            // Use nextElementSibling instead of global query to avoid affecting other branches
            const childrenContainer = this.nextElementSibling;
            if (childrenContainer) {
                const isExpanded = childrenContainer.style.display !== 'none';
                childrenContainer.style.display = isExpanded ? 'none' : 'block';
                
                // Toggle icon
                const icon = this.querySelector('.tree-toggle');
                if (icon) {
                    icon.innerHTML = isExpanded ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-down"></i>';
                }
            }
        });
        
        // Render mission networks under the root node
        data.forEach(missionNetwork => {
            const missionNetworkNode = createTreeNode(
                'missionNetworks', 
                missionNetwork.name, 
                missionNetwork.id, 
                missionNetwork.guid,
                'fa-project-diagram'
            );
            missionNetworksContainer.appendChild(missionNetworkNode);
            
            // Create a container for the children (network segments)
            const segmentsContainer = document.createElement('div');
            segmentsContainer.className = 'tree-node-children ms-4';
            segmentsContainer.style.display = 'none'; // Initially collapsed
            segmentsContainer.setAttribute('data-parent', missionNetwork.id);
            missionNetworksContainer.appendChild(segmentsContainer);
            
            // Add click event to mission network node to toggle children
            missionNetworkNode.addEventListener('click', function(e) {
                e.stopPropagation();
                const isActive = this.classList.contains('active');
                
                // Remove active class from all nodes
                document.querySelectorAll('.tree-node.active').forEach(node => {
                    node.classList.remove('active');
                });
                
                // Toggle active class for this node
                if (!isActive) {
                    this.classList.add('active');
                    currentTreeNode = this;
                    loadSelectedNodeChildren(missionNetwork, 'missionNetworks');
                }
                
                // Toggle children container
                // Use nextElementSibling instead of global query to avoid affecting other branches
                const childrenContainer = this.nextElementSibling;
                if (childrenContainer) {
                    const isExpanded = childrenContainer.style.display !== 'none';
                    childrenContainer.style.display = isExpanded ? 'none' : 'block';
                    
                    // Toggle the icon for expand/collapse
                    const icon = this.querySelector('.tree-toggle');
                    if (icon) {
                        icon.innerHTML = isExpanded ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-down"></i>';
                    }
                    
                    // If expanding and no children yet, render them
                    if (!isExpanded && childrenContainer.children.length === 0 && missionNetwork.networkSegments) {
                        renderNetworkSegments(childrenContainer, missionNetwork.networkSegments, missionNetwork);
                    }
                }
            });
        });
    }
    
    // Render network segments under a mission network
    function renderNetworkSegments(container, segments, parentMissionNetwork) {
        segments.forEach(segment => {
            const segmentNode = createTreeNode(
                'networkSegments', 
                segment.name, 
                segment.id, 
                segment.guid,
                'fa-network-wired'
            );
            container.appendChild(segmentNode);
            
            // Create a container for the children (security domains)
            const domainsContainer = document.createElement('div');
            domainsContainer.className = 'tree-node-children ms-4';
            domainsContainer.style.display = 'none'; // Initially collapsed
            domainsContainer.setAttribute('data-parent', segment.id);
            container.appendChild(domainsContainer);
            
            // Add click event to segment node to toggle children
            segmentNode.addEventListener('click', function(e) {
                e.stopPropagation();
                const isActive = this.classList.contains('active');
                
                // Remove active class from all nodes
                document.querySelectorAll('.tree-node.active').forEach(node => {
                    node.classList.remove('active');
                });
                
                // Toggle active class for this node
                if (!isActive) {
                    this.classList.add('active');
                    currentTreeNode = this;
                    loadSelectedNodeChildren(segment, 'networkSegments', parentMissionNetwork);
                }
                
                // Toggle children container
                // Use nextElementSibling instead of global query to avoid affecting other branches
                const childrenContainer = this.nextElementSibling;
                if (childrenContainer) {
                    const isExpanded = childrenContainer.style.display !== 'none';
                    childrenContainer.style.display = isExpanded ? 'none' : 'block';
                    
                    // Toggle the icon for expand/collapse
                    const icon = this.querySelector('.tree-toggle');
                    if (icon) {
                        icon.innerHTML = isExpanded ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-down"></i>';
                    }
                    
                    // If expanding and no children yet, render them
                    if (!isExpanded && childrenContainer.children.length === 0 && segment.securityDomains) {
                        renderSecurityDomains(childrenContainer, segment.securityDomains, segment, parentMissionNetwork);
                    }
                }
            });
        });
    }
    
    // Render security domains under a network segment
    function renderSecurityDomains(container, domains, parentSegment, parentMissionNetwork) {
        domains.forEach(domain => {
            const domainNode = createTreeNode(
                'securityDomains', 
                domain.name, 
                domain.id, 
                domain.guid,
                'fa-shield-alt'
            );
            container.appendChild(domainNode);
            
            // Create a container for the children (hw stacks)
            const stacksContainer = document.createElement('div');
            stacksContainer.className = 'tree-node-children ms-4';
            stacksContainer.style.display = 'none'; // Initially collapsed
            stacksContainer.setAttribute('data-parent', domain.id);
            container.appendChild(stacksContainer);
            
            // Add click event to domain node to toggle children
            domainNode.addEventListener('click', function(e) {
                e.stopPropagation();
                const isActive = this.classList.contains('active');
                
                // Remove active class from all nodes
                document.querySelectorAll('.tree-node.active').forEach(node => {
                    node.classList.remove('active');
                });
                
                // Toggle active class for this node
                if (!isActive) {
                    this.classList.add('active');
                    currentTreeNode = this;
                    loadSelectedNodeChildren(domain, 'securityDomains', parentSegment, parentMissionNetwork);
                }
                
                // Toggle children container
                // Use nextElementSibling instead of global query to avoid affecting other branches
                const childrenContainer = this.nextElementSibling;
                if (childrenContainer) {
                    const isExpanded = childrenContainer.style.display !== 'none';
                    childrenContainer.style.display = isExpanded ? 'none' : 'block';
                    
                    // Toggle the icon for expand/collapse
                    const icon = this.querySelector('.tree-toggle');
                    if (icon) {
                        icon.innerHTML = isExpanded ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-down"></i>';
                    }
                    
                    // If expanding and no children yet, render them
                    if (!isExpanded && childrenContainer.children.length === 0 && domain.hwStacks) {
                        renderHWStacks(childrenContainer, domain.hwStacks, domain, parentSegment, parentMissionNetwork);
                    }
                }
            });
        });
    }
    
    // Render hardware stacks under a security domain
    function renderHWStacks(container, stacks, parentDomain, parentSegment, parentMissionNetwork) {
        stacks.forEach(stack => {
            const stackNode = createTreeNode(
                'hwStacks', 
                stack.name, 
                stack.id, 
                stack.guid,
                'fa-server'
            );
            container.appendChild(stackNode);
            
            // Create a container for the children (assets)
            const assetsContainer = document.createElement('div');
            assetsContainer.className = 'tree-node-children ms-4';
            assetsContainer.style.display = 'none'; // Initially collapsed
            assetsContainer.setAttribute('data-parent', stack.id);
            container.appendChild(assetsContainer);
            
            // Add click event to stack node to toggle children
            stackNode.addEventListener('click', function(e) {
                e.stopPropagation();
                const isActive = this.classList.contains('active');
                
                // Remove active class from all nodes
                document.querySelectorAll('.tree-node.active').forEach(node => {
                    node.classList.remove('active');
                });
                
                // Toggle active class for this node
                if (!isActive) {
                    this.classList.add('active');
                    currentTreeNode = this;
                    loadSelectedNodeChildren(stack, 'hwStacks', parentDomain, parentSegment, parentMissionNetwork);
                }
                
                // Toggle children container
                // Use nextElementSibling instead of global query to avoid affecting other branches
                const childrenContainer = this.nextElementSibling;
                if (childrenContainer) {
                    const isExpanded = childrenContainer.style.display !== 'none';
                    childrenContainer.style.display = isExpanded ? 'none' : 'block';
                    
                    // Toggle the icon for expand/collapse
                    const icon = this.querySelector('.tree-toggle');
                    if (icon) {
                        icon.innerHTML = isExpanded ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-down"></i>';
                    }
                    
                    // If expanding and no children yet, render them
                    if (!isExpanded && childrenContainer.children.length === 0 && stack.assets) {
                        renderAssets(childrenContainer, stack.assets, stack, parentDomain, parentSegment, parentMissionNetwork);
                    }
                }
            });
        });
    }
    
    // Render assets under a hardware stack
    function renderAssets(container, assets, parentStack, parentDomain, parentSegment, parentMissionNetwork) {
        assets.forEach(asset => {
            const assetNode = createTreeNode(
                'assets', 
                asset.name, 
                asset.id, 
                asset.guid,
                'fa-desktop'
            );
            container.appendChild(assetNode);
            
            // Create a container for the children (networkInterfaces and gpInstances)
            const assetChildrenContainer = document.createElement('div');
            assetChildrenContainer.className = 'tree-node-children ms-4';
            assetChildrenContainer.style.display = 'none'; // Initially collapsed
            assetChildrenContainer.setAttribute('data-parent', asset.id);
            container.appendChild(assetChildrenContainer);
            
            // Add click event to asset node to toggle children
            assetNode.addEventListener('click', function(e) {
                e.stopPropagation();
                const isActive = this.classList.contains('active');
                
                // Remove active class from all nodes
                document.querySelectorAll('.tree-node.active').forEach(node => {
                    node.classList.remove('active');
                });
                
                // Toggle active class for this node
                if (!isActive) {
                    this.classList.add('active');
                    currentTreeNode = this;
                    loadSelectedNodeChildren(asset, 'assets', parentStack, parentDomain, parentSegment, parentMissionNetwork);
                }
                
                // Toggle children container
                // Use nextElementSibling instead of global query to avoid affecting other branches
                const childrenContainer = this.nextElementSibling;
                if (childrenContainer) {
                    const isExpanded = childrenContainer.style.display !== 'none';
                    childrenContainer.style.display = isExpanded ? 'none' : 'block';
                    
                    // Toggle the icon for expand/collapse
                    const icon = this.querySelector('.tree-toggle');
                    if (icon) {
                        icon.innerHTML = isExpanded ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-down"></i>';
                    }
                    
                    // If expanding and no children yet, render networkInterfaces and gpInstances
                    if (!isExpanded && childrenContainer.children.length === 0) {
                        // Render network interfaces if they exist
                        if (asset.networkInterfaces && asset.networkInterfaces.length > 0) {
                            renderNetworkInterfaces(childrenContainer, asset.networkInterfaces, asset, parentStack, parentDomain, parentSegment, parentMissionNetwork);
                        }
                        
                        // Render GP instances if they exist
                        if (asset.gpInstances && asset.gpInstances.length > 0) {
                            renderGPInstances(childrenContainer, asset.gpInstances, asset, parentStack, parentDomain, parentSegment, parentMissionNetwork);
                        }
                    }
                }
            });
        });
    }
    
    // Render network interfaces under an asset
    function renderNetworkInterfaces(container, networkInterfaces, parentAsset, parentStack, parentDomain, parentSegment, parentMissionNetwork) {
        networkInterfaces.forEach(networkInterface => {
            const networkInterfaceNode = createTreeNode(
                'networkInterfaces', 
                networkInterface.name, 
                networkInterface.id, 
                networkInterface.guid,
                'fa-network-wired'
            );
            container.appendChild(networkInterfaceNode);
            
            // Add click event to network interface node
            networkInterfaceNode.addEventListener('click', function(e) {
                e.stopPropagation();
                const isActive = this.classList.contains('active');
                
                // Remove active class from all nodes
                document.querySelectorAll('.tree-node.active').forEach(node => {
                    node.classList.remove('active');
                });
                
                // Toggle active class for this node
                if (!isActive) {
                    this.classList.add('active');
                    currentTreeNode = this;
                    loadSelectedNodeChildren(networkInterface, 'networkInterfaces', parentAsset, parentStack, parentDomain, parentSegment, parentMissionNetwork);
                }
            });
        });
    }
    
    // Render GP instances under an asset
    function renderGPInstances(container, gpInstances, parentAsset, parentStack, parentDomain, parentSegment, parentMissionNetwork) {
        gpInstances.forEach(gpInstance => {
            const gpInstanceNode = createTreeNode(
                'gpInstances', 
                gpInstance.name || gpInstance.instanceLabel || `GP Instance ${gpInstance.id}`, 
                gpInstance.id, 
                gpInstance.guid,
                'fa-cogs'
            );
            container.appendChild(gpInstanceNode);
            
            // Add click event to GP instance node
            gpInstanceNode.addEventListener('click', function(e) {
                e.stopPropagation();
                const isActive = this.classList.contains('active');
                
                // Remove active class from all nodes
                document.querySelectorAll('.tree-node.active').forEach(node => {
                    node.classList.remove('active');
                });
                
                // Toggle active class for this node
                if (!isActive) {
                    this.classList.add('active');
                    currentTreeNode = this;
                    loadSelectedNodeChildren(gpInstance, 'gpInstances', parentAsset, parentStack, parentDomain, parentSegment, parentMissionNetwork);
                }
            });
        });
    }

    // Create a tree node element
    function createTreeNode(type, name, id, guid, iconClass) {
        const node = document.createElement('div');
        node.className = 'tree-node d-flex align-items-center p-2 mb-1 rounded';
        node.setAttribute('data-type', type);
        node.setAttribute('data-id', id);
        node.setAttribute('data-guid', guid);
        
        // Create the toggle button for expandable nodes
        const toggleSpan = document.createElement('span');
        toggleSpan.className = 'tree-toggle me-2';
        toggleSpan.innerHTML = '<i class="fas fa-chevron-right"></i>';
        node.appendChild(toggleSpan);
        
        // Create the icon - use SVG icons from getElementIcon function
        const iconSpan = document.createElement('span');
        iconSpan.className = 'me-2';
        
        // Get the appropriate SVG icon for this element type
        const iconPath = getElementIcon(type);
        iconSpan.innerHTML = `<img src="${iconPath}" width="18" height="18" alt="${type} icon">`;
        node.appendChild(iconSpan);
        
        // Create the text
        const textSpan = document.createElement('span');
        textSpan.className = 'node-text';
        textSpan.textContent = name;
        node.appendChild(textSpan);
        
        return node;
    }
    
    // Load and display children of the selected node in the elements panel
    function loadSelectedNodeChildren(nodeData, nodeType, parentData) {
        // Update the elements panel title
        if (elementsTitle) {
            elementsTitle.textContent = `${nodeData.name} - ${formatNodeTypeName(nodeType)}`;
        }
        
        // Clear the elements container
        if (elementsContainer) {
            elementsContainer.innerHTML = '';
        }
        
        // Determine which children to display based on node type
        if (nodeType === 'missionNetworks' && nodeData.networkSegments) {
            // Display network segments
            renderElementCards(elementsContainer, nodeData.networkSegments, 'networkSegments');
        } else if (nodeType === 'networkSegments' && nodeData.securityDomains) {
            // Display security domains
            renderElementCards(elementsContainer, nodeData.securityDomains, 'securityDomains');
        } else if (nodeType === 'securityDomains' && nodeData.hwStacks) {
            // Display hardware stacks
            renderElementCards(elementsContainer, nodeData.hwStacks, 'hwStacks');
        } else if (nodeType === 'hwStacks' && nodeData.assets) {
            // Display assets
            renderElementCards(elementsContainer, nodeData.assets, 'assets');
        } else if (nodeType === 'assets') {
            // Display both network interfaces and GP instances if available
            const hasNetworkInterfaces = nodeData.networkInterfaces && nodeData.networkInterfaces.length > 0;
            const hasGPInstances = nodeData.gpInstances && nodeData.gpInstances.length > 0;
            
            if (hasNetworkInterfaces) {
                renderElementCards(elementsContainer, nodeData.networkInterfaces, 'networkInterfaces');
            }
            
            if (hasGPInstances) {
                renderElementCards(elementsContainer, nodeData.gpInstances, 'gpInstances');
            }
            
            if (!hasNetworkInterfaces && !hasGPInstances) {
                showNoElementsMessage(elementsContainer);
            }
            
            // Update detail panel with asset information
            updateDetailPanel(nodeData, nodeType);
        } else if (nodeType === 'networkInterfaces') {
            // Network interface selected - no child elements in panel
            // Just update detail panel with network interface information
            updateDetailPanel(nodeData, nodeType);
            showNoElementsMessage(elementsContainer);
        } else if (nodeType === 'gpInstances') {
            // GP Instance selected - show details including spInstances and configurationItems
            const hasSpInstances = nodeData.spInstances && nodeData.spInstances.length > 0;
            const hasConfigItems = nodeData.configurationItems && nodeData.configurationItems.length > 0;
            
            // Don't show these in tree, but show in elements panel
            if (hasSpInstances) {
                renderElementCards(elementsContainer, nodeData.spInstances, 'spInstances');
            }
            
            if (hasConfigItems) {
                renderElementCards(elementsContainer, nodeData.configurationItems, 'configurationItems');
            }
            
            if (!hasSpInstances && !hasConfigItems) {
                showNoElementsMessage(elementsContainer);
            }
            
            // Update detail panel with GP Instance information
            updateDetailPanel(nodeData, nodeType);
        } else {
            // No children to display
            showNoElementsMessage(elementsContainer);
        }
        
        // Enable the add button if appropriate
        if (addElementButton) {
            addElementButton.disabled = false;
        }
    }
    
    // Render element cards in the elements panel
    function renderElementCards(container, elements, type) {
        // Create a container for the cards if it doesn't exist
        let cardsContainer = container.querySelector('.element-cards-container');
        if (!cardsContainer) {
            cardsContainer = document.createElement('div');
            cardsContainer.className = 'element-cards-container row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 m-1';
            container.appendChild(cardsContainer);
        }
        
        // Render each element as a card
        elements.forEach(element => {
            const cardCol = document.createElement('div');
            cardCol.className = 'col';
            
            const card = document.createElement('div');
            card.className = 'card element-card h-100';
            card.setAttribute('data-type', type);
            card.setAttribute('data-id', element.id);
            card.setAttribute('data-guid', element.guid);
            
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            
            // Get the SVG icon for this element type
            const iconPath = getElementIcon(type);
            
            // Create a header with icon and title
            const cardHeader = document.createElement('div');
            cardHeader.className = 'd-flex align-items-center mb-2';
            
            // Add icon
            const iconSpan = document.createElement('span');
            iconSpan.className = 'me-2';
            iconSpan.innerHTML = `<img src="${iconPath}" width="26" height="26" alt="${type} icon">`;
            cardHeader.appendChild(iconSpan);
            
            // Create title with the icon
            const cardTitle = document.createElement('h5');
            cardTitle.className = 'card-title mb-0';
            cardTitle.textContent = element.name;
            cardHeader.appendChild(cardTitle);
            
            // Add the header to the card body
            cardBody.appendChild(cardHeader);
            
            // Add subtitle (ID)
            const cardSubtitle = document.createElement('h6');
            cardSubtitle.className = 'card-subtitle mb-2 text-muted';
            cardSubtitle.textContent = element.id || '';  
            cardBody.appendChild(cardSubtitle);
            card.appendChild(cardBody);
            cardCol.appendChild(card);
            cardsContainer.appendChild(cardCol);
            
            // Add click event to the card
            card.addEventListener('click', function() {
                // Remove active class from all cards
                document.querySelectorAll('.element-card.active').forEach(card => {
                    card.classList.remove('active');
                });
                
                // Add active class to this card
                this.classList.add('active');
                
                // Store the selected element
                currentElement = element;
                
                // Update the details panel
                updateDetailsPanel(element, type);
                
                // Enable edit and delete buttons
                if (editDetailButton) editDetailButton.disabled = false;
                if (deleteDetailButton) deleteDetailButton.disabled = false;
            });
        });
    }
    
    // Update the details panel with the selected element's data
    function updateDetailPanel(element, type) {
        // Clear the details container
        if (detailsContainer) {
            detailsContainer.innerHTML = '';
        }
        
        // Update the details title
        if (detailsTitle) {
            detailsTitle.textContent = `${element.name} Details`;
        }
        
        // Create a card to display the details
        const detailCard = document.createElement('div');
        detailCard.className = 'card m-3';
        
        // Create the card header
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header d-flex align-items-center';
        cardHeader.innerHTML = `
            <i class="fas ${getTypeIcon(type)} me-2"></i>
            <h5 class="mb-0">${element.name}</h5>
        `;
        detailCard.appendChild(cardHeader);
        
        // Create the card body
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        // Create a table for the details
        const table = document.createElement('table');
        table.className = 'table table-bordered';
        
        // Add the basic details rows
        table.innerHTML = `
            <tbody>
                <tr>
                    <th scope="row">Name</th>
                    <td>${element.name}</td>
                </tr>
                <tr>
                    <th scope="row">ID</th>
                    <td>${element.id || 'N/A'}</td>
                </tr>
                <tr>
                    <th scope="row">GUID</th>
                    <td>${element.guid || 'N/A'}</td>
                </tr>
            </tbody>
        `;
        
        // Add type-specific details
        // This can be expanded based on the different element types
        if (type === 'hwStacks' && element.cisParticipantID) {
            table.querySelector('tbody').innerHTML += `
                <tr>
                    <th scope="row">CIS Participant ID</th>
                    <td>${element.cisParticipantID}</td>
                </tr>
            `;
        }
        
        // Add the table to the card body
        cardBody.appendChild(table);
        detailCard.appendChild(cardBody);
        
        // Add the detail card to the container
        if (detailsContainer) {
            detailsContainer.appendChild(detailCard);
        }
    }
    
    // Show a message when there are no elements to display
    function showNoElementsMessage(container) {
        container.innerHTML = `
            <div class="alert alert-info m-3">
                <i class="fas fa-info-circle me-2"></i>
                No elements available
            </div>
        `;
    }
    
    // Search functionality for the tree
    function handleTreeSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const treeNodes = document.querySelectorAll('.tree-node');
        
        treeNodes.forEach(node => {
            const nodeText = node.textContent.toLowerCase();
            if (nodeText.includes(searchTerm) || searchTerm === '') {
                node.style.display = 'flex';
            } else {
                node.style.display = 'none';
            }
        });
    }
    
    // Search functionality for the elements panel
    function handleElementsSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const elementCards = document.querySelectorAll('.element-card');
        
        elementCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            if (cardText.includes(searchTerm) || searchTerm === '') {
                card.closest('.col').style.display = 'block';
            } else {
                card.closest('.col').style.display = 'none';
            }
        });
    }
});

// Utility functions

// Format node type name for display
function formatNodeTypeName(type) {
    // Convert camelCase to Title Case with spaces
    return type
        .replace(/([A-Z])/g, ' $1') // Insert space before uppercase letters
        .replace(/^./, function(str) { return str.toUpperCase(); }) // Capitalize first letter
        .trim(); // Remove leading/trailing spaces
}

// Get icon class for a specific element type
function getTypeIcon(type) {
    const iconMap = {
        'missionNetworks': 'fa-project-diagram',
        'networkSegments': 'fa-network-wired',
        'securityDomains': 'fa-shield-alt',
        'hwStacks': 'fa-server',
        'assets': 'fa-desktop',
        'networkInterfaces': 'fa-ethernet',
        'gpInstances': 'fa-cogs',
        'configurationItems': 'fa-wrench',
        'spInstances': 'fa-puzzle-piece'
    };
    
    return iconMap[type] || 'fa-file';
}

// Get SVG icon path for a specific element type
function getElementIcon(type) {
    // This will return the appropriate icon for the element type
    const iconMap = {
        'cisplan': '/static/img/CIS-PLAN.svg',
        'missionNetworks': '/static/img/missionNetworks.svg',
        'networkSegments': '/static/img/networkSegments.svg',
        'securityDomains': '/static/img/securityDomains.svg',
        'hwStacks': '/static/img/hwStacks.svg',
        'assets': '/static/img/assets.svg',
        'networkInterfaces': '/static/img/networkInterfaces.svg',
        'gpInstances': '/static/img/gpInstances.svg',
        'configurationItems': '/static/img/configurationItems.svg',
        'spInstances': '/static/img/spInstances.svg'
    };
    
    return iconMap[type] || '/static/img/default.svg';
}
