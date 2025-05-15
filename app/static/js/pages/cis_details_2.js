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
        
        if (!this.detailsContent || !this.editElementBtn || !this.deleteElementBtn) {
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
        if (this.editElementBtn) {
            this.editElementBtn.disabled = isRoot;
        }
        if (this.deleteElementBtn) {
            this.deleteElementBtn.disabled = isRoot;
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
        if (!this.currentElement) {
            return;
        }
        
        // Check if the CISEditDialogs2 component is available
        if (typeof CISEditDialogs2 !== 'undefined' && CISEditDialogs2.showDeleteDialog) {
            // Use the new delete dialog component
            CISEditDialogs2.showDeleteDialog(
                this.currentElement,
                this.currentElementType,
                this.currentElementId,
                this.currentElementGuid,
                this.currentParentPath
            );
        } else {
            // Fallback to alert if delete dialog component not available
            alert(`Delete functionality not implemented yet for ${this.formatElementType(this.currentElementType)}: ${this.currentElement.name || this.currentElement.id || 'Unnamed'}`);
        }
    }
};