/**
 * CIS Plan Details Component 2.0
 * 
 * Manages the details panel showing properties of the selected element.
 * Handles edit and delete operations for the selected element.
 */

const CISDetails2 = {
    // DOM element references
    detailsContent: null,
    editElementBtn: null,
    deleteElementBtn: null,
    
    // State management
    currentEntity: null,
    currentEntityType: null,
    currentEntityGuid: null,
    
    /**
     * Initialize the details component
     */
    init: function() {
        this.detailsContent = document.getElementById('details-content');
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
            this.updateDetails(detail.guid, detail.type, detail.parentGuid, detail.parentType);
        });
    },
    
    /**
     * Clear the details panel content
     */
    clearDetails: function() {
        console.log('Clearing details panel');
        if (this.detailsContent) {
            this.detailsContent.innerHTML = '';
        }
        
        // Reset state
        this.currentEntity = null;
        this.currentEntityType = null;
        this.currentEntityGuid = null;
        
        // Disable action buttons
        if (this.editElementBtn) {
            this.editElementBtn.disabled = true;
        }
        if (this.deleteElementBtn) {
            this.deleteElementBtn.disabled = true;
        }
    },
    
    /**
     * Update the details panel with entity data
     * @param {string} guid - GUID of the entity
     * @param {string} type - Type of the entity
     * @param {string} parentGuid - GUID of the parent entity
     * @param {string} parentType - Type of the parent entity
     */
    updateDetails: function(guid, type, parentGuid, parentType) {
        // Clear current content
        this.detailsContent.innerHTML = '';
        
        // Reset state
        this.currentEntity = null;
        this.currentEntityType = type;
        this.currentEntityGuid = guid;
        
        // Enable/disable edit and delete buttons based on selection
        if (guid && type !== 'cisplan') {
            this.editElementBtn.disabled = false;
            this.deleteElementBtn.disabled = false;
        } else {
            this.editElementBtn.disabled = true;
            this.deleteElementBtn.disabled = true;
        }
        
        // If no GUID, show empty state
        if (!guid) {
            this.showEmptyState();
            return;
        }
        
        // For the root CIS Plan, show basic info
        if (type === 'cisplan') {
            this.renderCISPlanDetails();
            return;
        }
        
        // For other entities, fetch and show details
        this.fetchAndRenderEntityDetails(guid, type);
    },
    
    /**
     * Fetch entity details from the API and render them
     * @param {string} guid - GUID of the entity
     * @param {string} type - Type of the entity
     */
    fetchAndRenderEntityDetails: function(guid, type) {
        // Show loading indicator
        this.showLoading();
        
        // Fetch the entity from the API
        CISApi2.getEntity(guid)
            .then(entity => {
                if (entity) {
                    this.currentEntity = entity;
                    this.renderEntityDetails(entity, type);
                } else {
                    this.showError('Failed to load entity details');
                }
            })
            .catch(error => {
                console.error('Error fetching entity details:', error);
                this.showError('Error loading entity details');
            });
    },
    
    /**
     * Render basic CIS Plan details
     */
    renderCISPlanDetails: function() {
        const table = document.createElement('table');
        table.className = 'detail-table';
        
        table.innerHTML = `
            <tbody>
                <tr>
                    <th scope="row">Name</th>
                    <td>CIS Plan</td>
                </tr>
                <tr>
                    <th scope="row">Type</th>
                    <td>Root Container</td>
                </tr>
            </tbody>
        `;
        
        this.detailsContent.appendChild(table);
    },
    
    /**
     * Render entity details based on its type
     * @param {Object} entity - The entity to render details for
     * @param {string} type - Type of the entity
     */
    renderEntityDetails: function(entity, type) {
        if (!entity) {
            this.showEmptyState();
            return;
        }
        
        // Create table element
        const table = document.createElement('table');
        table.className = 'detail-table';
        
        // Create table content based on entity type
        let tableContent = '';
        
        // Common fields for all entity types
        tableContent += `
            <tr>
                <th scope="row">Type</th>
                <td>${this.formatEntityType(type)}</td>
            </tr>
        `;
        
        // Entity-specific fields
        switch(type) {
            case 'mission_network':
                tableContent += `
                    <tr>
                        <th scope="row">Name</th>
                        <td>${entity.name || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">ID</th>
                        <td>${entity.id || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">GUID</th>
                        <td>${entity.guid || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">Network Segments</th>
                        <td>${entity.networkSegments ? entity.networkSegments.length : 0}</td>
                    </tr>
                `;
                break;
                
            case 'network_segment':
                tableContent += `
                    <tr>
                        <th scope="row">Name</th>
                        <td>${entity.name || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">ID</th>
                        <td>${entity.id || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">GUID</th>
                        <td>${entity.guid || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">Security Domains</th>
                        <td>${entity.securityDomains ? entity.securityDomains.length : 0}</td>
                    </tr>
                `;
                break;
                
            case 'security_domain':
                tableContent += `
                    <tr>
                        <th scope="row">Name</th>
                        <td>${entity.id || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">ID</th>
                        <td>${entity.id || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">GUID</th>
                        <td>${entity.guid || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">HW Stacks</th>
                        <td>${entity.hwStacks ? entity.hwStacks.length : 0}</td>
                    </tr>
                `;
                break;
                
            case 'hw_stack':
                tableContent += `
                    <tr>
                        <th scope="row">Name</th>
                        <td>${entity.name || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">ID</th>
                        <td>${entity.id || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">GUID</th>
                        <td>${entity.guid || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">CIS Participant ID</th>
                        <td>${entity.cisParticipantID || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">Assets</th>
                        <td>${entity.assets ? entity.assets.length : 0}</td>
                    </tr>
                `;
                break;
                
            case 'asset':
                tableContent += `
                    <tr>
                        <th scope="row">Name</th>
                        <td>${entity.name || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">ID</th>
                        <td>${entity.id || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">GUID</th>
                        <td>${entity.guid || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">Network Interfaces</th>
                        <td>${entity.networkInterfaces ? entity.networkInterfaces.length : 0}</td>
                    </tr>
                    <tr>
                        <th scope="row">GP Instances</th>
                        <td>${entity.gpInstances ? entity.gpInstances.length : 0}</td>
                    </tr>
                `;
                break;
                
            case 'network_interface':
                tableContent += `
                    <tr>
                        <th scope="row">Name</th>
                        <td>${entity.name || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">ID</th>
                        <td>${entity.id || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">GUID</th>
                        <td>${entity.guid || 'N/A'}</td>
                    </tr>
                `;
                
                // Add configuration items if available
                if (entity.configurationItems && entity.configurationItems.length > 0) {
                    // Find IP Address
                    const ipItem = entity.configurationItems.find(item => item.Name === 'IP Address');
                    if (ipItem) {
                        tableContent += `
                            <tr>
                                <th scope="row">IP Address</th>
                                <td>${ipItem.AnswerContent || 'Not set'}</td>
                            </tr>
                        `;
                    }
                    
                    // Find Subnet
                    const subnetItem = entity.configurationItems.find(item => item.Name === 'Sub-Net');
                    if (subnetItem) {
                        tableContent += `
                            <tr>
                                <th scope="row">Subnet</th>
                                <td>${subnetItem.AnswerContent || 'Not set'}</td>
                            </tr>
                        `;
                    }
                    
                    // Find FQDN
                    const fqdnItem = entity.configurationItems.find(item => item.Name === 'FQDN');
                    if (fqdnItem) {
                        tableContent += `
                            <tr>
                                <th scope="row">FQDN</th>
                                <td>${fqdnItem.AnswerContent || 'Not set'}</td>
                            </tr>
                        `;
                    }
                }
                break;
                
            case 'gp_instance':
                tableContent += `
                    <tr>
                        <th scope="row">GP ID</th>
                        <td>${entity.gpid || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">GUID</th>
                        <td>${entity.guid || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">Instance Label</th>
                        <td>${entity.instanceLabel || 'Not set'}</td>
                    </tr>
                    <tr>
                        <th scope="row">Service ID</th>
                        <td>${entity.serviceId || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">SP Instances</th>
                        <td>${entity.spInstances ? entity.spInstances.length : 0}</td>
                    </tr>
                    <tr>
                        <th scope="row">Configuration Items</th>
                        <td>${entity.configurationItems ? entity.configurationItems.length : 0}</td>
                    </tr>
                `;
                break;
                
            case 'sp_instance':
                tableContent += `
                    <tr>
                        <th scope="row">SP ID</th>
                        <td>${entity.spId || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">GUID</th>
                        <td>${entity.guid || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">SP Version</th>
                        <td>${entity.spVersion || 'N/A'}</td>
                    </tr>
                `;
                break;
                
            case 'configuration_item':
                tableContent += `
                    <tr>
                        <th scope="row">Name</th>
                        <td>${entity.Name || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">GUID</th>
                        <td>${entity.guid || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">Type</th>
                        <td>${entity.ConfigurationAnswerType || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">Value</th>
                        <td>${entity.AnswerContent || 'Not set'}</td>
                    </tr>
                    <tr>
                        <th scope="row">Default Value</th>
                        <td>${entity.DefaultValue || 'None'}</td>
                    </tr>
                    <tr>
                        <th scope="row">Help Text</th>
                        <td>${entity.HelpText || 'None'}</td>
                    </tr>
                `;
                break;
                
            default:
                tableContent += `
                    <tr>
                        <th scope="row">GUID</th>
                        <td>${entity.guid || 'N/A'}</td>
                    </tr>
                `;
        }
        
        // Set table content
        table.innerHTML = `<tbody>${tableContent}</tbody>`;
        
        // Add table to details panel
        this.detailsContent.appendChild(table);
        
        // Add configuration items section for GP instances
        if (type === 'gp_instance' && entity.configurationItems && entity.configurationItems.length > 0) {
            this.renderConfigItemsSection(entity.configurationItems);
        }
    },
    
    /**
     * Render a section showing configuration items
     * @param {Array} configItems - Array of configuration items
     */
    renderConfigItemsSection: function(configItems) {
        // Create section title
        const sectionTitle = document.createElement('div');
        sectionTitle.className = 'section-title';
        sectionTitle.textContent = 'Configuration Items';
        this.detailsContent.appendChild(sectionTitle);
        
        // Create config items table
        const table = document.createElement('table');
        table.className = 'detail-table';
        
        let tableContent = '';
        configItems.forEach(item => {
            tableContent += `
                <tr>
                    <th scope="row">${item.Name}</th>
                    <td>${item.AnswerContent || 'Not set'}</td>
                </tr>
            `;
        });
        
        // Set table content
        table.innerHTML = `<tbody>${tableContent}</tbody>`;
        
        // Add table to details panel
        this.detailsContent.appendChild(table);
    },
    
    /**
     * Show loading indicator
     */
    showLoading: function() {
        this.detailsContent.innerHTML = '<div style="text-align: center; padding: 20px;">Loading...</div>';
    },
    
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError: function(message) {
        this.detailsContent.innerHTML = `<div style="text-align: center; padding: 20px; color: red;">${message}</div>`;
    },
    
    /**
     * Show empty state message
     */
    showEmptyState: function() {
        this.detailsContent.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Select an element to view details</div>';
    },
    
    /**
     * Format entity type for display
     * @param {string} type - Entity type
     * @returns {string} Formatted entity type
     */
    formatEntityType: function(type) {
        const typeMap = {
            'cisplan': 'CIS Plan',
            'mission_network': 'Mission Network',
            'network_segment': 'Network Segment',
            'security_domain': 'Security Domain',
            'hw_stack': 'HW Stack',
            'asset': 'Asset',
            'network_interface': 'Network Interface',
            'gp_instance': 'GP Instance',
            'sp_instance': 'SP Instance',
            'configuration_item': 'Configuration Item'
        };
        
        return typeMap[type] || type;
    },
    
    /**
     * Show edit dialog for the selected entity
     */
    showEditDialog: function() {
        const modalBody = document.getElementById('edit-modal-body');
        if (!modalBody) return;
        
        // Clear existing content
        modalBody.innerHTML = '';
        
        // Create message based on the entity type
        const message = `Edit ${this.formatEntityType(this.currentEntityType)} - ${this.currentEntityGuid}`;
        
        const para = document.createElement('p');
        para.textContent = message;
        modalBody.appendChild(para);
        
        // Set up confirm button
        const confirmBtn = document.getElementById('confirm-edit-btn');
        confirmBtn.onclick = () => {
            // In a real implementation, this would call the API
            alert(`Editing ${this.formatEntityType(this.currentEntityType)} with GUID ${this.currentEntityGuid}`);
            
            // Close the modal
            document.getElementById('edit-modal').style.display = 'none';
            
            // Refresh the UI
            const event = new CustomEvent('cis:refresh-ui');
            document.dispatchEvent(event);
        };
        
        // Show the modal
        document.getElementById('edit-modal').style.display = 'block';
    },
    
    /**
     * Show delete confirmation dialog for the selected entity
     */
    showDeleteDialog: function() {
        const modalBody = document.getElementById('delete-modal-body');
        if (!modalBody) return;
        
        // Set message
        modalBody.innerHTML = `Are you sure you want to delete this ${this.formatEntityType(this.currentEntityType)}?`;
        
        // Set up confirm button
        const confirmBtn = document.getElementById('confirm-delete-btn');
        confirmBtn.onclick = () => {
            // In a real implementation, this would call the API
            alert(`Deleting ${this.formatEntityType(this.currentEntityType)} with GUID ${this.currentEntityGuid}`);
            
            // Close the modal
            document.getElementById('delete-modal').style.display = 'none';
            
            // Refresh the UI
            const event = new CustomEvent('cis:refresh-ui');
            document.dispatchEvent(event);
        };
        
        // Show the modal
        document.getElementById('delete-modal').style.display = 'block';
    }
};
