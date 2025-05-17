/**
 * CIS Plan 2.0 - Element Moving Functionality
 * 
 * Manages the process of moving elements between parents in the CIS tree structure.
 */

class CISMoveDialog {
    constructor() {
        // DOM elements
        this.moveModal = document.getElementById('move-modal');
        this.moveTreeContainer = document.getElementById('move-tree-container');
        this.cancelMoveBtn = document.getElementById('cancel-move-btn');
        this.confirmMoveBtn = document.getElementById('confirm-move-btn');
        this.closeMoveModalBtn = document.getElementById('close-move-modal');
        this.moveElementBtn = document.getElementById('move-element-btn');
        
        // State variables
        this.selectedElement = null;
        this.selectedElementType = null;
        this.selectedNewParent = null;
        this.treeData = null;
        
        // Log initialization to help with debugging
        console.log('CISMoveDialog initialized with button:', this.moveElementBtn);
        
        // Bind event handlers
        this.initEventHandlers();
    }
    
    initEventHandlers() {
        // Move button click
        this.moveElementBtn.addEventListener('click', () => {
            console.log('Move button clicked');
            this.openMoveDialog();
        });
        
        // Close modal
        this.closeMoveModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelMoveBtn.addEventListener('click', () => this.closeModal());
        
        // Confirm move
        this.confirmMoveBtn.addEventListener('click', () => this.moveElement());
        
        // Listen for update-details event instead of element-selected
        document.addEventListener('cis:update-details', (event) => {
            console.log('Element selected event received:', event.detail);
            this.selectedElement = event.detail.element;
            this.selectedElementType = event.detail.type;
            this.moveElementBtn.disabled = !this.selectedElement;
        });
        
        // Listen for node selection in the tree
        document.addEventListener('cis:node-selected', (event) => {
            console.log('Node selected event received:', event.detail);
            // Store the selected node data
            if (event.detail && event.detail.data) {
                this.selectedElement = event.detail.data;
                this.selectedElementType = event.detail.type;
                this.moveElementBtn.disabled = !this.selectedElement;
            }
        });
    }
    
    openMoveDialog() {
        if (!this.selectedElement) {
            console.log('No element selected for move operation');
            return;
        }
        
        console.log('Opening move dialog for element:', this.selectedElement);
        console.log('Selected element type:', this.selectedElementType);
        
        // Fetch the current tree structure
        CISApi2.getTreeData()
            .then(response => {
                if (response && response.status === 'success' && response.data) {
                    this.treeData = response.data;
                    this.renderMoveTree(this.treeData);
                    this.moveModal.style.display = 'block';
                } else {
                    console.error('Invalid tree data response:', response);
                    CISUtil2.showNotification('Failed to load tree structure', 'error');
                }
            })
            .catch(error => {
                console.error('Error fetching tree data for move:', error);
                CISUtil2.showNotification('Failed to load tree structure', 'error');
            });
    }
    
    renderMoveTree(treeData) {
        // Clear container
        this.moveTreeContainer.innerHTML = '';
        
        // Create filtered tree data that only shows valid parents
        const filteredTreeData = this.filterTreeForValidParents(treeData);
        
        // Render the tree
        const treeElement = document.createElement('div');
        treeElement.className = 'move-tree';
        
        this.buildTreeUI(treeElement, filteredTreeData);
        this.moveTreeContainer.appendChild(treeElement);
    }
    
    filterTreeForValidParents(treeData) {
        // Deep clone the tree data to avoid modifying the original
        const clonedTree = JSON.parse(JSON.stringify(treeData));
        
        // Get current element type
        const elementType = this.selectedElementType;
        
        // Determine what parent type can accept this element
        const validParentTypes = this.getValidParentTypes(elementType);
        console.log('Valid parent types for', elementType, ':', validParentTypes);
        
        // Get current parent info from the element
        const currentParentGuid = this.getCurrentParentGuid();
        console.log('Current parent GUID:', currentParentGuid);

        // Filter function to process the tree nodes
        const filterNode = (node) => {
            // Skip only THIS element and its direct descendants,
            // don't skip other branches even in the same mission
            if (node.id === this.selectedElement.guid) {
                return null;
            }
            
            // Check if this node is a valid parent type for our element
            const nodeType = node.type;
            const isValidParentType = validParentTypes.includes(nodeType);
            const isCurrentParent = node.id === currentParentGuid;
            
            // Make current parent non-selectable (no point moving to current parent)
            if (isCurrentParent) {
                node.nonSelectable = true;
            } 
            // Make valid parent types selectable
            else if (isValidParentType) {
                node.nonSelectable = false;
                console.log('Found valid parent:', node.name, 'of type', nodeType);
            } 
            // Make other types non-selectable but still visible for navigation
            else {
                node.nonSelectable = true;
            }
            
            // Always process children to allow navigation to valid parents deeper in the tree
            if (node.children && node.children.length) {
                const filteredChildren = node.children
                    .map(filterNode)
                    .filter(child => child !== null);
                
                // Keep this node if it's a valid parent type or has children
                node.children = filteredChildren;
            }
            
            // Return the node if it's a valid parent type or has children
            // This ensures we show the path to all valid parents
            return (isValidParentType && !isCurrentParent) || 
                   (node.children && node.children.length > 0) ? 
                   node : 
                   null;
        };
        
        // Apply the filter
        return clonedTree.map(filterNode).filter(node => node !== null);
    }
    
    getValidParentTypes(elementType) {
        // Define parent-child relationships (which parent types can accept which child types)
        const parentChildRelationships = {
            'network_segment': ['mission_network'],
            'security_domain': ['network_segment'],
            'hw_stack': ['security_domain'],
            'asset': ['hw_stack'],
            'network_interface': ['asset'],
            'gp_instance': ['asset'],
            'sp_instance': ['gp_instance']
        };
        
        // Return the valid parent types for this element type
        return parentChildRelationships[elementType] || [];
    }
    
    isElementOrDescendant(node, elementGuid) {
        // Check if this is the element
        if (node.id === elementGuid) return true;
        
        // Check children recursively
        if (node.children && node.children.length) {
            return node.children.some(child => this.isElementOrDescendant(child, elementGuid));
        }
        
        return false;
    }
    
    buildTreeUI(container, nodes) {
        const ul = document.createElement('ul');
        ul.className = 'move-tree-list';
        
        nodes.forEach(node => {
            const li = document.createElement('li');
            li.className = 'move-tree-item';
            
            const nodeSpan = document.createElement('span');
            nodeSpan.className = 'move-tree-node';
            nodeSpan.textContent = node.name || node.label || node.id;
            
            if (node.nonSelectable) {
                nodeSpan.classList.add('non-selectable');
            } else {
                nodeSpan.classList.add('selectable');
                nodeSpan.addEventListener('click', () => this.selectParent(node));
            }
            
            li.appendChild(nodeSpan);
            
            // Add children recursively if any
            if (node.children && node.children.length) {
                this.buildTreeUI(li, node.children);
            }
            
            ul.appendChild(li);
        });
        
        container.appendChild(ul);
    }
    
    selectParent(node) {
        // Deselect previously selected parent
        const prevSelected = this.moveTreeContainer.querySelector('.selected-parent');
        if (prevSelected) {
            prevSelected.classList.remove('selected-parent');
        }
        
        // Find and mark the newly selected node
        const nodeElements = this.moveTreeContainer.querySelectorAll('.move-tree-node');
        for (const elem of nodeElements) {
            if (elem.textContent === (node.name || node.label || node.id)) {
                elem.classList.add('selected-parent');
                break;
            }
        }
        
        // Update state and enable confirm button
        this.selectedNewParent = node;
        this.confirmMoveBtn.disabled = false;
        
        console.log('Selected new parent:', this.selectedNewParent);
    }
    
    moveElement() {
        if (!this.selectedElement || !this.selectedNewParent) {
            console.error('Cannot move: Missing element or new parent');
            return;
        }
        
        // Prepare data for the API call
        const moveData = {
            elementId: this.selectedElement.guid,
            newParentId: this.selectedNewParent.id
        };
        
        console.log('Moving element with data:', moveData);
        console.log('Element type:', this.selectedElementType);
        console.log('New parent type:', this.selectedNewParent.type);
        
        // Call API to update the parent reference
        CISApi2.moveElement(moveData)
            .then(response => {
                console.log('Move response:', response);
                if (response && response.status === 'success') {
                    CISUtil2.showNotification('Element moved successfully', 'success');
                    this.closeModal();
                    
                    // Trigger refresh of the tree and panels
                    document.dispatchEvent(new CustomEvent('cis:refresh-ui'));
                } else {
                    const errorMsg = response && response.message ? response.message : 'Failed to move element';
                    console.error('Move element response error:', response);
                    CISUtil2.showNotification(errorMsg, 'error');
                }
            })
            .catch(error => {
                console.error('Error moving element:', error);
                
                // Extract a meaningful error message
                let errorMessage = 'Failed to move element. Please try again.';
                
                if (error.message) {
                    // Format user-friendly error message
                    if (error.message.includes('Invalid parent-child relationship')) {
                        errorMessage = error.message
                            .replace(/Invalid parent-child relationship:/, 'Cannot move:')
                            .replace(/\. Valid parent type is:/, '.\n\nPlease select a valid parent of type:');
                    } else {
                        errorMessage = error.message;
                    }
                }
                
                CISUtil2.showNotification(errorMessage, 'error');
            });
    }
    
    closeModal() {
        this.moveModal.style.display = 'none';
        this.selectedNewParent = null;
        this.confirmMoveBtn.disabled = true;
    }
    
    /**
     * Get the current parent GUID of the selected element
     * @returns {string|null} The GUID of the current parent or null if not found
     */
    getCurrentParentGuid() {
        if (!this.selectedElement) return null;
        
        // Try to get parent info from metadata if it exists
        if (this.selectedElement.parentGuid) {
            return this.selectedElement.parentGuid;
        }
        
        // Otherwise, we need to search for the parent in the tree data
        if (!this.treeData) return null;
        
        const findParent = (nodes, targetGuid) => {
            for (const node of nodes) {
                // Check if any of this node's children match the target
                if (node.children) {
                    const childMatch = node.children.find(child => child.id === targetGuid);
                    if (childMatch) return node.id;
                    
                    // Recursively search deeper
                    const deeperMatch = findParent(node.children, targetGuid);
                    if (deeperMatch) return deeperMatch;
                }
            }
            return null;
        };
        
        return findParent(this.treeData, this.selectedElement.guid);
    }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cisMoveDialog = new CISMoveDialog();
}); 