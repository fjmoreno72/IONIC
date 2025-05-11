/**
 * CIS Plan Dialogs Component 2.0
 * 
 * Manages modal dialogs for the CIS Plan 2.0 components.
 */

const CISDialogs2 = {
    // DOM element references
    addModal: null,
    closeAddModalBtn: null,
    cancelAddBtn: null,
    confirmAddBtn: null,
    addModalBody: null,
    
    // Type selection state
    typeSelectionState: {
        parentType: null,
        parentId: null,
        parentName: null,
        childTypes: [],
        selectedType: null
    },
    
    /**
     * Initialize the dialogs component
     */
    init: function() {
        // Initialize DOM references
        this.addModal = document.getElementById('add-modal');
        this.closeAddModalBtn = document.getElementById('close-add-modal');
        this.cancelAddBtn = document.getElementById('cancel-add-btn');
        this.confirmAddBtn = document.getElementById('confirm-add-btn');
        this.addModalBody = document.getElementById('add-modal-body');
        
        if (!this.addModal || !this.closeAddModalBtn || !this.cancelAddBtn || 
            !this.confirmAddBtn || !this.addModalBody) {
            console.error('Add modal DOM elements not found');
            return;
        }
        
        // Set up event listeners for the add modal
        this.closeAddModalBtn.addEventListener('click', () => {
            this.hideAddModal();
        });
        
        this.cancelAddBtn.addEventListener('click', () => {
            this.hideAddModal();
        });
        
        this.confirmAddBtn.addEventListener('click', () => {
            this.handleAddElementConfirm();
        });
    },
    
    // Current element data for the add dialog
    currentAddData: {
        elementType: null,
        parentType: null,
        parentId: null,
        parentName: null
    },
    
    /**
     * Show a dialog to select the type of element to add
     * @param {Array} childTypes - Array of possible child types
     * @param {string} parentType - Type of parent element
     * @param {string} parentId - ID of parent element
     * @param {string} parentName - Name of parent element
     */
    showTypeSelectionDialog: function(childTypes, parentType, parentId, parentName) {
        // Store the selection state
        this.typeSelectionState = {
            parentType,
            parentId,
            parentName,
            childTypes,
            selectedType: null
        };
        
        // Update the modal title
        const modalTitle = document.querySelector('#add-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Select Element Type to Add';
        }
        
        // Create the dialog content
        this.addModalBody.innerHTML = '';
        
        // Add parent information
        const parentInfo = document.createElement('div');
        parentInfo.className = 'mb-3';
        parentInfo.innerHTML = `<p>Select the type of element to add to ${CISUtil2.getEntityTypeName(parentType)}: <strong>${parentName}</strong></p>`;
        this.addModalBody.appendChild(parentInfo);
        
        // Create type selection container
        const typeSelectionContainer = document.createElement('div');
        typeSelectionContainer.className = 'type-selection-container d-flex justify-content-around mb-4';
        
        // Add each child type as a selectable option with icon
        childTypes.forEach(type => {
            const typeOption = document.createElement('div');
            typeOption.className = 'type-option text-center p-3 border rounded';
            typeOption.style.cursor = 'pointer';
            typeOption.style.width = '150px';
            typeOption.style.transition = 'all 0.2s';
            
            // Get the icon for this type
            const iconUrl = CISUtil2.getEntityIcon(type);
            
            typeOption.innerHTML = `
                <img src="${iconUrl}" alt="${type}" class="mb-2" style="width: 48px; height: 48px;">
                <div>${CISUtil2.getEntityTypeName(type)}</div>
            `;
            
            // Add hover effect
            typeOption.addEventListener('mouseover', () => {
                typeOption.style.backgroundColor = 'rgba(var(--primary-color-rgb), 0.1)';
                typeOption.style.transform = 'translateY(-5px)';
            });
            
            typeOption.addEventListener('mouseout', () => {
                typeOption.style.backgroundColor = '';
                typeOption.style.transform = '';
            });
            
            // Add click handler
            typeOption.addEventListener('click', () => {
                // Set the selected type
                this.typeSelectionState.selectedType = type;
                
                // Close this dialog and open the add element dialog
                this.showAddElementDialog(
                    type,
                    this.typeSelectionState.parentType,
                    this.typeSelectionState.parentId,
                    this.typeSelectionState.parentName
                );
            });
            
            typeSelectionContainer.appendChild(typeOption);
        });
        
        this.addModalBody.appendChild(typeSelectionContainer);
        
        // Show the modal
        this.addModal.style.display = 'block';
    },
    
    /**
     * Show the add element dialog
     * @param {string} elementType - Type of element to add
     * @param {string} parentType - Type of parent element
     * @param {string} parentId - ID of parent element
     * @param {string} parentName - Name of parent element
     */
    showAddElementDialog: function(elementType, parentType, parentId, parentName) {
        // Validate inputs
        if (!elementType) {
            console.error('No element type specified for add dialog');
            return;
        }
        
        // For assets, which can have multiple child types, show the type selection dialog first
        if (parentType === 'asset' && !this.typeSelectionState.selectedType) {
            const childTypes = CISUtil2.getChildEntityTypes(parentType);
            if (childTypes.length > 1) {
                this.showTypeSelectionDialog(childTypes, parentType, parentId, parentName);
                return;
            }
        }
        
        // Store the current data
        this.currentAddData = {
            elementType,
            parentType,
            parentId,
            parentName
        };
        
        // Reset type selection state if we're showing the actual add dialog
        this.typeSelectionState.selectedType = null;
        
        // Update the modal title
        const modalTitle = document.querySelector('#add-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = `Add New ${CISUtil2.getEntityTypeName(elementType)}`;
        }
        
        // Create the dialog content
        this.addModalBody.innerHTML = '';
        
        // Add parent information
        const parentInfo = document.createElement('div');
        parentInfo.className = 'mb-3';
        
        // Create formatted HTML with proper validation
        let infoHTML = `<p><strong>Adding a new ${CISUtil2.getEntityTypeName(elementType)}</strong></p>`;
        
        if (parentType) {
            infoHTML += `<p>Parent Type: ${CISUtil2.getEntityTypeName(parentType)}</p>`;
        }
        
        if (parentId) {
            infoHTML += `<p>Parent ID: ${parentId}</p>`;
        }
        
        if (parentName) {
            infoHTML += `<p>Parent Name: ${parentName}</p>`;
        }
        
        parentInfo.innerHTML = infoHTML;
        this.addModalBody.appendChild(parentInfo);
        
        // Show the modal
        this.addModal.style.display = 'block';
    },
    
    /**
     * Hide the add element dialog
     */
    hideAddModal: function() {
        if (this.addModal) {
            this.addModal.style.display = 'none';
        }
    },
    
    /**
     * Handle the add element confirmation
     */
    handleAddElementConfirm: function() {
        const { elementType, parentType, parentId, parentName } = this.currentAddData;
        
        // In a real implementation, this would make an API call to add the element
        // For now, we'll just simulate success and refresh the UI
        
        // Show success message
        this.showSuccessToast(`Success on creating a new ${CISUtil2.getEntityTypeName(elementType)} on parent type ${CISUtil2.getEntityTypeName(parentType)}, ID ${parentId} and name ${parentName}`);
        
        // Hide the modal
        this.hideAddModal();
        
        // Refresh the UI while maintaining the current position
        this.refreshAfterAdd(parentType, parentId);
    },
    
    /**
     * Refresh the UI after adding an element
     * @param {string} parentType - Type of the parent element
     * @param {string} parentId - ID of the parent element
     */
    refreshAfterAdd: function(parentType, parentId) {
        // Log what we're doing
        console.log('Refreshing after adding element to', parentType, parentId);
        
        // Use the refresh button approach for tree expansion
        if (CISTree2) {
            // Reset the tree's expanded nodes state to force auto-expansion during initialization
            CISTree2.expandedNodes = new Set();
            CISTree2._expandedInitialized = false;
        }
        
        // Reload the CIS Plan data
        CISApi2.fetchCISPlanData()
            .then(response => {
                if (response && response.status === 'success' && response.data) {
                    // Update the CIS Plan data
                    CISPlan2.cisPlanData = response.data;
                    
                    // Update the elements component data reference
                    CISElements2.setCISPlanData(response.data);
                    
                    // Render the tree with the new data
                    // It will auto-expand because we set _expandedInitialized = false
                    CISTree2.renderTree(response.data);
                    
                    // After the tree has rendered and auto-expanded, select the parent node
                    setTimeout(() => {
                        this.selectNodeAfterRefresh(parentType, parentId);
                    }, 300); // Wait for tree to fully render
                } else {
                    console.error('Failed to refresh CIS Plan data');
                    this.showErrorToast('Failed to refresh data after adding element');
                }
            })
            .catch(error => {
                console.error('Error refreshing CIS Plan data:', error);
                this.showErrorToast('Error refreshing data: ' + error.message);
            });
    },
    
    /**
     * Select a node in the tree after refresh
     * @param {string} nodeType - Type of the node to select
     * @param {string} nodeId - ID of the node to select
     */
    selectNodeAfterRefresh: function(nodeType, nodeId) {
        // Log the current expanded nodes state
        if (CISTree2 && CISTree2.expandedNodes) {
            console.log('Current expanded nodes before selection:', CISTree2.expandedNodes.size);
        }
        
        // Find the node by type and ID
        let nodeToSelect = null;
        
        if (nodeType === 'cisplan') {
            // For CIS Plan root, select the root node
            nodeToSelect = document.querySelector('.tree-node[data-type="cisplan"]');
        } else {
            // Try to find the node by type and ID
            const treeNodes = document.querySelectorAll(`.tree-node[data-type="${nodeType}"]`);
            for (const node of treeNodes) {
                if (node.getAttribute('data-id') === nodeId) {
                    nodeToSelect = node;
                    break;
                }
            }
        }
        
        // If we found the node, select it
        if (nodeToSelect) {
            console.log('Selecting node after refresh:', nodeToSelect);
            
            // Make sure all parent nodes are expanded
            this.expandParentNodes(nodeToSelect);
            
            // Instead of triggering a click which might collapse other nodes,
            // we'll manually select the node and dispatch the event
            if (CISTree2) {
                // Use the utility function to select the node visually
                CISUtil2.selectTreeNode(nodeToSelect);
                
                // Store the current node reference in the tree
                CISTree2.currentTreeNode = nodeToSelect;
                
                // Get node data for the event
                const type = nodeToSelect.getAttribute('data-type');
                const id = nodeToSelect.getAttribute('data-id');
                const guid = nodeToSelect.getAttribute('data-guid');
                
                // Find the node data in the tree data structure
                let nodeData = null;
                if (type === 'cisplan') {
                    nodeData = CISTree2.fullTreeData;
                } else {
                    // Find the node data based on type and guid
                    nodeData = this.findNodeDataInTree(CISTree2.fullTreeData, type, guid);
                }
                
                // Dispatch node selected event manually
                const event = new CustomEvent('cis:node-selected', {
                    detail: {
                        type: type,
                        id: id,
                        guid: guid,
                        data: nodeData
                    }
                });
                document.dispatchEvent(event);
                
                // Log the expanded nodes state after selection
                console.log('Expanded nodes after selection:', CISTree2.expandedNodes.size);
            } else {
                // Fall back to click if CISTree2 is not available
                console.warn('CISTree2 not available, falling back to click method');
                nodeToSelect.click();
            }
        } else {
            console.warn(`Could not find node to select: ${nodeType} ${nodeId}`);
        }
    },
    
    /**
     * Find node data in the CIS Plan tree structure by type and guid
     * @param {Object} treeData - The CIS Plan tree data
     * @param {string} nodeType - The type of node to find
     * @param {string} nodeGuid - The GUID of the node to find
     * @returns {Object|null} - The node data or null if not found
     */
    findNodeDataInTree: function(treeData, nodeType, nodeGuid) {
        if (!treeData || !nodeType || !nodeGuid) {
            return null;
        }
        
        // For mission networks
        if (nodeType === 'mission_network' && treeData.missionNetworks) {
            for (const network of treeData.missionNetworks) {
                if (network.guid === nodeGuid) {
                    return network;
                }
            }
        }
        
        // For network segments
        if (nodeType === 'network_segment' && treeData.missionNetworks) {
            for (const network of treeData.missionNetworks) {
                if (network.networkSegments) {
                    for (const segment of network.networkSegments) {
                        if (segment.guid === nodeGuid) {
                            return segment;
                        }
                    }
                }
            }
        }
        
        // For security domains
        if (nodeType === 'security_domain' && treeData.missionNetworks) {
            for (const network of treeData.missionNetworks) {
                if (network.networkSegments) {
                    for (const segment of network.networkSegments) {
                        if (segment.securityDomains) {
                            for (const domain of segment.securityDomains) {
                                if (domain.guid === nodeGuid) {
                                    return domain;
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // For HW stacks
        if (nodeType === 'hw_stack' && treeData.missionNetworks) {
            for (const network of treeData.missionNetworks) {
                if (network.networkSegments) {
                    for (const segment of network.networkSegments) {
                        if (segment.securityDomains) {
                            for (const domain of segment.securityDomains) {
                                if (domain.hwStacks) {
                                    for (const stack of domain.hwStacks) {
                                        if (stack.guid === nodeGuid) {
                                            return stack;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // For assets
        if (nodeType === 'asset' && treeData.missionNetworks) {
            for (const network of treeData.missionNetworks) {
                if (network.networkSegments) {
                    for (const segment of network.networkSegments) {
                        if (segment.securityDomains) {
                            for (const domain of segment.securityDomains) {
                                if (domain.hwStacks) {
                                    for (const stack of domain.hwStacks) {
                                        if (stack.assets) {
                                            for (const asset of stack.assets) {
                                                if (asset.guid === nodeGuid) {
                                                    return asset;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // For network interfaces
        if (nodeType === 'network_interface' && treeData.missionNetworks) {
            for (const network of treeData.missionNetworks) {
                if (network.networkSegments) {
                    for (const segment of network.networkSegments) {
                        if (segment.securityDomains) {
                            for (const domain of segment.securityDomains) {
                                if (domain.hwStacks) {
                                    for (const stack of domain.hwStacks) {
                                        if (stack.assets) {
                                            for (const asset of stack.assets) {
                                                if (asset.networkInterfaces) {
                                                    for (const iface of asset.networkInterfaces) {
                                                        if (iface.guid === nodeGuid) {
                                                            return iface;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // For GP instances
        if (nodeType === 'gp_instance' && treeData.missionNetworks) {
            for (const network of treeData.missionNetworks) {
                if (network.networkSegments) {
                    for (const segment of network.networkSegments) {
                        if (segment.securityDomains) {
                            for (const domain of segment.securityDomains) {
                                if (domain.hwStacks) {
                                    for (const stack of domain.hwStacks) {
                                        if (stack.assets) {
                                            for (const asset of stack.assets) {
                                                if (asset.gpInstances) {
                                                    for (const gp of asset.gpInstances) {
                                                        if (gp.guid === nodeGuid) {
                                                            return gp;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // For SP instances
        if (nodeType === 'sp_instance' && treeData.missionNetworks) {
            for (const network of treeData.missionNetworks) {
                if (network.networkSegments) {
                    for (const segment of network.networkSegments) {
                        if (segment.securityDomains) {
                            for (const domain of segment.securityDomains) {
                                if (domain.hwStacks) {
                                    for (const stack of domain.hwStacks) {
                                        if (stack.assets) {
                                            for (const asset of stack.assets) {
                                                if (asset.spInstances) {
                                                    for (const sp of asset.spInstances) {
                                                        if (sp.guid === nodeGuid) {
                                                            return sp;
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Node not found
        console.warn(`Could not find node data for type ${nodeType} with GUID ${nodeGuid}`);
        return null;
    },
    
    /**
     * Get the path from a node to the root of the tree
     * @param {HTMLElement} node - The tree node
     * @returns {Array} - Array of node identifiers (type and id pairs)
     */
    getNodePathToRoot: function(node) {
        const path = [];
        
        // Start with the current node
        let currentNode = node;
        
        // Traverse up the tree until we reach the root
        while (currentNode) {
            const nodeType = currentNode.getAttribute('data-type');
            const nodeId = currentNode.getAttribute('data-id');
            
            if (nodeType) {
                path.push({ type: nodeType, id: nodeId });
            }
            
            // Move to parent tree node (not DOM parent)
            const parentNode = currentNode.parentElement?.parentElement;
            if (parentNode && parentNode.classList.contains('tree-node')) {
                currentNode = parentNode;
            } else {
                break;
            }
        }
        
        return path;
    },
    
    /**
     * Restore the UI state after refreshing
     * @param {Object} state - The state to restore
     */
    restoreStateAfterRefresh: function(state) {
        // Wait a short time for the tree to finish rendering and restoring expanded nodes
        setTimeout(() => {
            // Find the tree node again after refresh
            let nodeToSelect = null;
            
            if (state.parentType === 'cisplan') {
                // For CIS Plan root, select the root node
                nodeToSelect = document.querySelector('.tree-node[data-type="cisplan"]');
            } else {
                // Try to find the node by type and ID
                const treeNodes = document.querySelectorAll(`.tree-node[data-type="${state.parentType}"]`);
                for (const node of treeNodes) {
                    if (node.getAttribute('data-id') === state.parentId) {
                        nodeToSelect = node;
                        break;
                    }
                }
            }
            
            // If we found the node, select it
            if (nodeToSelect) {
                console.log('Restoring selection to node:', nodeToSelect);
                
                // Make sure this node and all its parents are expanded
                this.expandParentNodes(nodeToSelect);
                
                // Trigger a click on the node to select it
                nodeToSelect.click();
            } else {
                console.warn('Could not find node to restore selection after refresh');
                
                // Fall back to showing mission networks
                if (CISPlan2.cisPlanData && CISPlan2.cisPlanData.missionNetworks) {
                    CISElements2.renderElements('cisplan', CISPlan2.cisPlanData);
                }
            }
        }, 300); // Wait for tree to finish rendering
    },
    
    /**
     * Find a node by following a path from the root
     * @param {Array} path - Array of node identifiers (type and id pairs)
     * @returns {HTMLElement|null} - The found node or null
     */
    findNodeByPath: function(path) {
        if (!path || path.length === 0) return null;
        
        // Start with the target node (first in the path, which is the deepest node)
        const targetNode = path[0];
        
        // Find all nodes of the target type
        const candidateNodes = document.querySelectorAll(`.tree-node[data-type="${targetNode.type}"]`);
        
        // Find the one with the matching ID
        for (const node of candidateNodes) {
            if (node.getAttribute('data-id') === targetNode.id) {
                return node;
            }
        }
        
        // If we couldn't find the exact node, try finding its parent
        if (path.length > 1) {
            // Try to find the parent node
            const parentNode = this.findNodeByPath(path.slice(1));
            if (parentNode) {
                // If we found the parent, try to find the child with the target type and ID
                const childContainer = parentNode.querySelector('.tree-children');
                if (childContainer) {
                    const childNodes = childContainer.querySelectorAll(`.tree-node[data-type="${targetNode.type}"]`);
                    for (const childNode of childNodes) {
                        if (childNode.getAttribute('data-id') === targetNode.id) {
                            return childNode;
                        }
                    }
                }
            }
        }
        
        return null;
    },
    
    /**
     * Expand all parent nodes of a given tree node
     * @param {HTMLElement} node - The tree node
     */
    expandParentNodes: function(node) {
        // Log the starting state
        console.log('Starting to expand parent nodes for:', node.getAttribute('data-type'), node.getAttribute('data-id'));
        
        // Count how many nodes we expand
        let expandedCount = 0;
        
        // Get the parent tree node
        let parent = node.parentElement;
        while (parent) {
            // If this is a tree-children container, get its parent (the actual tree node)
            if (parent.classList.contains('tree-children')) {
                const parentNode = parent.parentElement;
                if (parentNode && parentNode.classList.contains('tree-node')) {
                    // Get the parent node's GUID
                    const guid = parentNode.getAttribute('data-guid');
                    
                    // Directly set the display style instead of clicking (which can cause side effects)
                    parent.style.display = 'block';
                    
                    // Update the expand icon
                    const expandIcon = parentNode.querySelector('.expand-icon');
                    if (expandIcon) {
                        expandIcon.innerHTML = '&#9660;'; // Down arrow
                    }
                    
                    // Add expanded class
                    parentNode.classList.add('expanded');
                    
                    // Add to the tree's expanded nodes set
                    if (guid && CISTree2 && CISTree2.expandedNodes) {
                        CISTree2.expandedNodes.add(guid);
                        expandedCount++;
                    }
                    
                    console.log('Expanded parent node:', parentNode.getAttribute('data-type'), parentNode.getAttribute('data-id'));
                }
            }
            parent = parent.parentElement;
        }
        
        console.log(`Expanded ${expandedCount} parent nodes`);
    },
    
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - The type of notification: 'success', 'warning', or 'error'
     */
    showToast: function(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        // Set background color based on type
        let headerClass = '';
        let headerText = '';
        let backgroundColor = '';
        let textColor = 'black';
        
        switch (type) {
            case 'success':
                headerClass = 'bg-success text-white';
                headerText = 'Success';
                backgroundColor = 'rgba(25, 135, 84, 0.1)'; // Light green
                break;
            case 'warning':
                headerClass = 'bg-warning text-dark';
                headerText = 'Warning';
                backgroundColor = 'rgba(255, 193, 7, 0.1)'; // Light yellow
                break;
            case 'error':
                headerClass = 'bg-danger text-white';
                headerText = 'Error';
                backgroundColor = 'rgba(220, 53, 69, 0.1)'; // Light red
                textColor = '#dc3545';
                break;
            default:
                headerClass = 'bg-primary text-white';
                headerText = 'Information';
                backgroundColor = 'rgba(13, 110, 253, 0.1)'; // Light blue
        }
        
        toast.innerHTML = `
            <div class="toast-header ${headerClass}">
                <strong class="me-auto">${headerText}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body" style="background-color: ${backgroundColor}; color: ${textColor};">
                ${message}
            </div>
        `;
        
        // Add close button functionality
        const closeBtn = toast.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toastContainer.contains(toast)) {
                        toastContainer.removeChild(toast);
                    }
                }, 500);
            });
        }
        
        toastContainer.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.classList.contains('show')) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toastContainer.contains(toast)) {
                        toastContainer.removeChild(toast);
                    }
                }, 500);
            }
        }, 5000);
    },
    
    /**
     * Show a success toast notification
     * @param {string} message - The message to display
     */
    showSuccessToast: function(message) {
        this.showToast(message, 'success');
    },
    
    /**
     * Show a warning toast notification
     * @param {string} message - The message to display
     */
    showWarningToast: function(message) {
        this.showToast(message, 'warning');
    },
    
    /**
     * Show an error toast notification
     * @param {string} message - The message to display
     */
    showErrorToast: function(message) {
        this.showToast(message, 'error');
    }
};
