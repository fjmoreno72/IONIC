/**
 * CIS Plan Details Component 2.0
 * 
 * Manages the details panel showing properties of the selected element.
 * Handles edit and delete operations for the selected element.
 */

const CISDetails2 = {
    // DOM element references
    detailsContent: null,
    detailsTitle: null,
    editElementBtn: null,
    deleteElementBtn: null,
    copyElementBtn: null,
    
    // State management
    currentElement: null,
    currentElementType: null,
    currentElementId: null,
    currentElementGuid: null,
    currentParentPath: null,
    
    /**
     * Initialize the details component
     */
    init: function() {
        // Get DOM elements
        this.detailsContent = document.getElementById('details-content');
        this.detailsTitle = document.getElementById('details-title');
        this.editElementBtn = document.getElementById('edit-element-btn');
        this.deleteElementBtn = document.getElementById('delete-element-btn');
        this.copyElementBtn = document.getElementById('copy-element-btn');
        
        if (!this.detailsContent || !this.editElementBtn || !this.deleteElementBtn || !this.copyElementBtn) {
            console.error('Details panel DOM elements not found');
            return;
        }
        
        // Set up edit button
        this.editElementBtn.addEventListener('click', () => {
            this.showEditDialog();
        });
        
        // Set up delete button
        this.deleteElementBtn.addEventListener('click', () => {
            this.showDeleteDialog();
        });
        
        // Set up copy button
        this.copyElementBtn.addEventListener('click', () => {
            this.copyElement();
        });
        
        // Set up event listener for details update
        document.addEventListener('cis:update-details', (event) => {
            const detail = event.detail;
            this.updateDetails(detail.element, detail.type);
        });
        
        // Set up event listener for node selection
        document.addEventListener('cis:node-selected', (event) => {
            const detail = event.detail;
            // Store parent path for edit/delete operations
            this.currentParentPath = this.extractParentPath(detail);
        });
    },
    
    /**
     * Extract the parent path from event detail
     * @param {Object} detail - The event detail object
     * @returns {Object} The parent path object
     */
    extractParentPath: function(detail) {
        if (!detail) return {};
        
        // Create a copy of the detail object without 'type', 'id', 'guid', and 'data'
        const parentPath = {};
        Object.keys(detail).forEach(key => {
            if (key !== 'type' && key !== 'id' && key !== 'guid' && key !== 'data') {
                parentPath[key] = detail[key];
            }
        });
        
        return parentPath;
    },
    
    /**
     * Clear the details panel content
     */
    clearDetails: function() {
        // Clear content
        if (this.detailsContent) {
            this.detailsContent.innerHTML = '';
        }
        
        // Clear title
        if (this.detailsTitle) {
            this.detailsTitle.textContent = 'Details';
        }
        
        // Reset state
        this.currentElement = null;
        this.currentElementType = null;
        this.currentElementId = null;
        this.currentElementGuid = null;
        this.currentParentPath = null;
        
        // Disable action buttons
        if (this.editElementBtn) {
            this.editElementBtn.disabled = true;
        }
        if (this.deleteElementBtn) {
            this.deleteElementBtn.disabled = true;
        }
    },
    
    /**
     * Update the details panel with element data
     * @param {Object} element - The element to display details for
     * @param {string} type - Type of the element
     */
    updateDetails: function(element, type) {
        // Clear current content
        this.detailsContent.innerHTML = '';
        
        // Update state
        this.currentElement = element;
        this.currentElementType = type;
        this.currentElementId = element ? (element.id || element.gpid || element.spId) : null;
        this.currentElementGuid = element ? element.guid : null;
        
        // If no element provided, show empty state
        if (!element) {
            this.showEmptyState();
            return;
        }
        
        // Update title
        if (this.detailsTitle) {
            this.detailsTitle.textContent = element.name || element.id || 'Details';
        }
        
        // Enable/disable buttons based on element type
        const isRoot = type === 'cisplan';
        const canCopy = ['mission_network', 'network_segment', 'security_domain', 'hw_stack', 'asset'].includes(type);
        
        if (this.editElementBtn) {
            this.editElementBtn.disabled = isRoot;
        }
        if (this.deleteElementBtn) {
            this.deleteElementBtn.disabled = isRoot;
        }
        if (this.copyElementBtn) {
            this.copyElementBtn.disabled = isRoot || !canCopy;
        }
        
        // Render appropriate details based on type
        this.renderElementDetails(element, type);
    },
    
    /**
     * Render element details in the panel
     * @param {Object} element - The element to display
     * @param {string} type - Type of the element
     */
    renderElementDetails: function(element, type) {
        if (!element) {
            return;
        }
        
        // Clear existing content first
        this.detailsContent.innerHTML = '';
        
        // Get the appropriate renderer for this element type
        const renderer = CISDetailRenderers2.getRenderer(type);
        
        // Use the renderer to display the element details
        renderer.call(CISDetailRenderers2, element, type, this.detailsContent);
    },
    
    /**
     * Show loading indicator in the details panel
     */
    showLoading: function() {
        this.detailsContent.innerHTML = `
            <div class="loading-indicator text-center p-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <div class="mt-2">Loading details...</div>
            </div>
        `;
    },
    
    /**
     * Show error message in the details panel
     * @param {string} message - Error message to display
     */
    showError: function(message) {
        this.detailsContent.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                ${message || 'An error occurred'}
            </div>
        `;
    },
    
    /**
     * Show empty state message when no element is selected
     */
    showEmptyState: function() {
        this.detailsContent.innerHTML = `
            <div class="empty-state text-center p-4 text-secondary">
                <i class="fas fa-info-circle mb-3"></i>
                <p>Select an element to view details</p>
            </div>
        `;
    },
    
    /**
     * Format element type for display
     * @param {string} type - Element type
     * @returns {string} Formatted element type
     */
    formatElementType: function(type) {
        if (!type) {
            return 'Unknown Type';
        }
        
        // Mapping of type codes to readable names
        const typeMappings = {
            'cisplan': 'CIS Plan',
            'mission_network': 'Mission Network',
            'network_segment': 'Network Segment',
            'security_domain': 'Security Domain',
            'hw_stack': 'Hardware Stack',
            'asset': 'Asset',
            'network_interface': 'Network Interface',
            'gp_instance': 'Generic Product Instance',
            'sp_instance': 'Specific Product Instance'
        };
        
        return typeMappings[type] || type.split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    },
    
    /**
     * Show edit dialog for the selected element
     */
    showEditDialog: function() {
        if (!this.currentElement) {
            return;
        }
        
        // Check if the CISEditDialogs2 component is available
        if (typeof CISEditDialogs2 !== 'undefined' && CISEditDialogs2.showEditDialog) {
            // Use the new edit dialog component
            CISEditDialogs2.showEditDialog(
                this.currentElement,
                this.currentElementType,
                this.currentElementId,
                this.currentElementGuid,
                this.currentParentPath
            );
        } else {
            // Fallback to alert if edit dialog component not available
            alert(`Edit functionality not implemented yet for ${this.formatElementType(this.currentElementType)}: ${this.currentElement.name || this.currentElement.id || 'Unnamed'}`);
        }
    },
    
    /**
     * Show delete confirmation dialog for the selected element
     */
    showDeleteDialog: function() {
        // Check if we have the current element selected
        if (!this.currentElement || !this.currentElementGuid) {
            console.error('No element selected for deletion', {
                currentElement: this.currentElement,
                currentElementGuid: this.currentElementGuid,
                currentElementType: this.currentElementType,
                currentElementId: this.currentElementId
            });
            return;
        }
        
        // Ensure we have a valid element type string
        let elementTypeStr = this.currentElementType;
        if (typeof elementTypeStr === 'object') {
            console.warn('Element type is an object, extracting type property:', elementTypeStr);
            elementTypeStr = elementTypeStr.type || 'unknown';
        }
        elementTypeStr = String(elementTypeStr);
        
        console.log('Preparing to delete element:', {
            type: elementTypeStr,
            id: this.currentElementId,
            guid: this.currentElementGuid,
            name: this.currentElement.name || this.currentElementId
        });

        // Use CISEditDialogs2 for deletion - this is the correct component
        if (typeof CISEditDialogs2 !== 'undefined' && typeof CISEditDialogs2.showDeleteDialog === 'function') {
            console.log('Using CISEditDialogs2 for deletion with correct parameter order...');
            
            // FIXED: Pass parameters in the correct order
            // Parameter order should be: elementType, elementId, elementName, elementGuid, parentPath
            CISEditDialogs2.showDeleteDialog(
                elementTypeStr,                                      // Element type (as string)
                this.currentElementId,                               // Element ID
                this.currentElement.name || this.currentElementId,   // Element name
                this.currentElementGuid,                             // Element GUID
                this.currentParentPath                               // Parent path
            );
        } else {
            console.error('CISEditDialogs2 component not found or showDeleteDialog method not available');
            this.fallbackDeleteConfirmation();
        }
    },
    
    /**
     * Fallback delete confirmation if modal is not available
     */
    fallbackDeleteConfirmation: function() {
        // Fallback implementation if CISEditDialogs2 is not available
        const confirmDelete = confirm(`Are you sure you want to delete this ${this.formatElementType(this.currentElementType)}?\n\nName: ${this.currentElement.name || this.currentElementId}\nThis action cannot be undone.`);
        
        if (confirmDelete) {
            // Show loading indicator
            if (typeof CISUtil2 !== 'undefined' && CISUtil2.showLoading) {
                CISUtil2.showLoading("Deleting element...");
            }
            
            // Call the API to delete the element
            fetch(`/api/v2/cis_plan/entity/${this.currentElementGuid}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(response => {
                // Hide loading indicator
                if (typeof CISUtil2 !== 'undefined' && CISUtil2.hideLoading) {
                    CISUtil2.hideLoading();
                }
                
                if (response.status === 'success') {
                    // Show success message
                    if (typeof CISUtil2 !== 'undefined' && CISUtil2.showNotification) {
                        CISUtil2.showNotification("Element deleted successfully", "success");
                    } else {
                        alert("Element deleted successfully");
                    }
                    
                    // Refresh the UI
                    const refreshEvent = new CustomEvent('cis:refresh-ui');
                    document.dispatchEvent(refreshEvent);
                } else {
                    // Show error message
                    const errorMsg = response.message || "Failed to delete element";
                    if (typeof CISUtil2 !== 'undefined' && CISUtil2.showNotification) {
                        CISUtil2.showNotification(errorMsg, "error");
                    } else {
                        alert(errorMsg);
                    }
                }
            })
            .catch(error => {
                // Hide loading indicator
                if (typeof CISUtil2 !== 'undefined' && CISUtil2.hideLoading) {
                    CISUtil2.hideLoading();
                }
                
                // Show error message
                console.error("Error deleting element:", error);
                if (typeof CISUtil2 !== 'undefined' && CISUtil2.showNotification) {
                    CISUtil2.showNotification(`Error deleting element: ${error.message}`, "error");
                } else {
                    alert(`Error deleting element: ${error.message}`);
                }
            });
        }
    },
    
    /**
     * Copy the currently selected element
     */
    copyElement: function() {
        if (!this.currentElementGuid || !this.currentElement) {
            console.error('No element selected for copying');
            return;
        }
        
        const elementName = this.currentElement.name || this.currentElementId || 'this element';
        
        // Show confirmation dialog
        const confirmCopy = confirm(`Do you want to create a copy of "${elementName}"?`);
        if (!confirmCopy) return;
        
        // Show loading indicator
        CISUtil2.showLoading("Creating copy...");
        
        // Call the API to copy the element
        fetch(`/api/v2/cis_plan/entity/${this.currentElementGuid}/copy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                new_name: `${elementName}_Copy`
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(response => {
            // Hide loading indicator
            CISUtil2.hideLoading();
            
            if (response.status === 'success') {
                // Show success message
                CISUtil2.showNotification("Element copied successfully", "success");
                
                // Refresh the CIS Plan tree view
                const refreshEvent = new CustomEvent('cis:refresh-ui');
                document.dispatchEvent(refreshEvent);
                
                // Select the new element if we have its GUID
                if (response.data && response.data.newEntityGuid) {
                    setTimeout(() => {
                        // Create and dispatch event to select the new node
                        const selectNodeEvent = new CustomEvent('cis:select-tree-node', {
                            detail: {
                                guid: response.data.newEntityGuid
                            }
                        });
                        document.dispatchEvent(selectNodeEvent);
                    }, 500); // Give the tree time to render
                }
            } else {
                // Show error message
                const errorMsg = response.message || "Failed to copy element";
                CISUtil2.showNotification(errorMsg, "error");
                console.error("Copy failed:", response);
            }
        })
        .catch(error => {
            // Hide loading indicator
            CISUtil2.hideLoading();
            
            // Show error message
            console.error("Error copying element:", error);
            CISUtil2.showNotification(`Error copying element: ${error.message}`, "error");
        });
    }
};