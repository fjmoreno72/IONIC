/**
 * CIS Plan Edit Dialogs Component 2.0
 * 
 * Manages edit and delete modal dialogs for CIS Plan elements.
 * Phase 2: Implements actual API calls to edit and delete CIS Plan elements.
 */

const CISEditDialogs2 = {
    // DOM element references
    editModal: null,
    closeEditModalBtn: null,
    cancelEditBtn: null,
    confirmEditBtn: null,
    editModalBody: null,
    
    deleteModal: null,
    closeDeleteModalBtn: null,
    cancelDeleteBtn: null,
    confirmDeleteBtn: null,
    deleteModalBody: null,
    
    // Current element state
    currentElement: {
        type: null,
        id: null,
        guid: null,
        name: null,
        data: null,
        parentPath: null
    },
    
    // Form elements for edit dialog
    editForm: null,
    
    /**
     * Initialize the edit dialogs component
     */
    init: function() {
        // Initialize edit modal DOM references
        this.editModal = document.getElementById('edit-modal');
        this.closeEditModalBtn = document.getElementById('close-edit-modal');
        this.cancelEditBtn = document.getElementById('cancel-edit-btn');
        this.confirmEditBtn = document.getElementById('confirm-edit-btn');
        this.editModalBody = document.getElementById('edit-modal-body');
        
        // Initialize delete modal DOM references
        this.deleteModal = document.getElementById('delete-modal');
        this.closeDeleteModalBtn = document.getElementById('close-delete-modal');
        this.cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        this.confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        this.deleteModalBody = document.getElementById('delete-modal-body');
        
        // Verify DOM elements exist
        if (!this.editModal || !this.closeEditModalBtn || !this.cancelEditBtn || 
            !this.confirmEditBtn || !this.editModalBody) {
            console.error('Edit modal DOM elements not found');
            return;
        }
        
        if (!this.deleteModal || !this.closeDeleteModalBtn || !this.cancelDeleteBtn || 
            !this.confirmDeleteBtn || !this.deleteModalBody) {
            console.error('Delete modal DOM elements not found');
            return;
        }
        
        // Set up event listeners for the edit modal
        this.closeEditModalBtn.addEventListener('click', () => {
            this.hideEditModal();
        });
        
        this.cancelEditBtn.addEventListener('click', () => {
            this.hideEditModal();
        });
        
        this.confirmEditBtn.addEventListener('click', () => {
            this.handleEditConfirm();
        });
        
        // Set up event listeners for the delete modal
        this.closeDeleteModalBtn.addEventListener('click', () => {
            this.hideDeleteModal();
        });
        
        this.cancelDeleteBtn.addEventListener('click', () => {
            this.hideDeleteModal();
        });
        
        this.confirmDeleteBtn.addEventListener('click', () => {
            this.handleDeleteConfirm();
        });
    },
    
    /**
     * Generate an edit form for the specified entity type
     * @param {string} entityType - The entity type
     * @param {Object} entityData - The entity data
     * @returns {HTMLFormElement} - The form element
     */
    generateEditForm: function(entityType, entityData) {
        const form = document.createElement('form');
        form.id = 'entity-edit-form';
        form.className = 'needs-validation';
        
        // Create different form fields based on entity type
        switch(entityType) {
            case 'mission_network':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" class="form-control" id="name" name="name" 
                            value="${entityData.name || ''}" required>
                    </div>
                `;
                break;
            
            case 'network_segment':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" class="form-control" id="name" name="name" 
                            value="${entityData.name || ''}" required>
                    </div>
                `;
                break;
            
            case 'security_domain':
                // Security domains are special - we can't edit the ID
                form.innerHTML = `
                    <div class="form-group">
                        <label for="id">Security Classification</label>
                        <input type="text" class="form-control" id="id" name="id" 
                            value="${entityData.id || ''}" readonly>
                        <small class="form-text text-muted">Security domain classification cannot be changed</small>
                    </div>
                `;
                break;
                
            case 'hw_stack':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" class="form-control" id="name" name="name" 
                            value="${entityData.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="cisParticipantID">CIS Participant ID</label>
                        <input type="text" class="form-control" id="cisParticipantID" name="cisParticipantID" 
                            value="${entityData.cisParticipantID || ''}">
                    </div>
                `;
                break;
                
            case 'asset':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" class="form-control" id="name" name="name" 
                            value="${entityData.name || ''}" required>
                    </div>
                `;
                break;
                
            case 'network_interface':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" class="form-control" id="name" name="name" 
                            value="${entityData.name || ''}" required>
                    </div>
                `;
                
                // Add config items if they exist
                if (entityData.configurationItems && entityData.configurationItems.length > 0) {
                    const configSection = document.createElement('div');
                    configSection.innerHTML = `
                        <h5 class="mt-4 mb-3">Configuration Items</h5>
                    `;
                    
                    // Create a container for the two-column layout
                    const rowContainer = document.createElement('div');
                    rowContainer.className = 'row';
                    configSection.appendChild(rowContainer);
                    
                    // Create left and right columns
                    const leftCol = document.createElement('div');
                    leftCol.className = 'col-md-6';
                    rowContainer.appendChild(leftCol);
                    
                    const rightCol = document.createElement('div');
                    rightCol.className = 'col-md-6';
                    rowContainer.appendChild(rightCol);
                    
                    // Split items between the two columns
                    const midPoint = Math.ceil(entityData.configurationItems.length / 2);
                    
                    // Add items to left column
                    entityData.configurationItems.slice(0, midPoint).forEach((item, index) => {
                        const configItem = document.createElement('div');
                        configItem.className = 'form-group';
                        configItem.innerHTML = `
                            <label for="config_${index}">${item.Name}</label>
                            <input type="text" class="form-control config-item" id="config_${index}" 
                                data-name="${item.Name}" data-guid="${item.guid}"
                                value="${item.AnswerContent || ''}">
                            <small class="form-text text-muted">${item.HelpText || ''}</small>
                        `;
                        leftCol.appendChild(configItem);
                    });
                    
                    // Add items to right column
                    entityData.configurationItems.slice(midPoint).forEach((item, index) => {
                        const configItem = document.createElement('div');
                        configItem.className = 'form-group';
                        configItem.innerHTML = `
                            <label for="config_${midPoint + index}">${item.Name}</label>
                            <input type="text" class="form-control config-item" id="config_${midPoint + index}" 
                                data-name="${item.Name}" data-guid="${item.guid}"
                                value="${item.AnswerContent || ''}">
                            <small class="form-text text-muted">${item.HelpText || ''}</small>
                        `;
                        rightCol.appendChild(configItem);
                    });
                    
                    // Add a scrollable container if there are many items
                    if (entityData.configurationItems.length > 15) {
                        const scrollContainer = document.createElement('div');
                        scrollContainer.style.maxHeight = '400px';
                        scrollContainer.style.overflowY = 'auto';
                        scrollContainer.style.border = '1px solid #dee2e6';
                        scrollContainer.style.borderRadius = '4px';
                        scrollContainer.style.padding = '10px';
                        
                        // Move the row into the scroll container
                        scrollContainer.appendChild(rowContainer);
                        configSection.appendChild(scrollContainer);
                        
                        // Add item count indicator
                        const countIndicator = document.createElement('div');
                        countIndicator.className = 'text-muted small mt-1';
                        countIndicator.textContent = `Showing all ${entityData.configurationItems.length} configuration items (scroll to view more)`;
                        configSection.appendChild(countIndicator);
                    }
                    
                    form.appendChild(configSection);
                }
                break;
                
            case 'gp_instance':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="gpid">GP ID</label>
                        <input type="text" class="form-control" id="gpid" name="gpid" 
                            value="${entityData.gpid || ''}" readonly>
                        <small class="form-text text-muted">GP ID cannot be changed</small>
                    </div>
                    <div class="form-group">
                        <label for="instanceLabel">Instance Label</label>
                        <input type="text" class="form-control" id="instanceLabel" name="instanceLabel" 
                            value="${entityData.instanceLabel || ''}">
                    </div>
                    <div class="form-group">
                        <label for="serviceId">Service ID</label>
                        <input type="text" class="form-control" id="serviceId" name="serviceId" 
                            value="${entityData.serviceId || ''}">
                    </div>
                `;
                
                // Add config items if they exist
                if (entityData.configurationItems && entityData.configurationItems.length > 0) {
                    const configSection = document.createElement('div');
                    configSection.innerHTML = `
                        <h5 class="mt-4 mb-3">Configuration Items</h5>
                    `;
                    
                    // Create a container for the two-column layout
                    const rowContainer = document.createElement('div');
                    rowContainer.className = 'row';
                    configSection.appendChild(rowContainer);
                    
                    // Create left and right columns
                    const leftCol = document.createElement('div');
                    leftCol.className = 'col-md-6';
                    rowContainer.appendChild(leftCol);
                    
                    const rightCol = document.createElement('div');
                    rightCol.className = 'col-md-6';
                    rowContainer.appendChild(rightCol);
                    
                    // Split items between the two columns
                    const midPoint = Math.ceil(entityData.configurationItems.length / 2);
                    
                    // Add items to left column
                    entityData.configurationItems.slice(0, midPoint).forEach((item, index) => {
                        const configItem = document.createElement('div');
                        configItem.className = 'form-group';
                        configItem.innerHTML = `
                            <label for="config_${index}">${item.Name}</label>
                            <input type="text" class="form-control config-item" id="config_${index}" 
                                data-name="${item.Name}" data-guid="${item.guid}"
                                value="${item.AnswerContent || ''}">
                            <small class="form-text text-muted">${item.HelpText || ''}</small>
                        `;
                        leftCol.appendChild(configItem);
                    });
                    
                    // Add items to right column
                    entityData.configurationItems.slice(midPoint).forEach((item, index) => {
                        const configItem = document.createElement('div');
                        configItem.className = 'form-group';
                        configItem.innerHTML = `
                            <label for="config_${midPoint + index}">${item.Name}</label>
                            <input type="text" class="form-control config-item" id="config_${midPoint + index}" 
                                data-name="${item.Name}" data-guid="${item.guid}"
                                value="${item.AnswerContent || ''}">
                            <small class="form-text text-muted">${item.HelpText || ''}</small>
                        `;
                        rightCol.appendChild(configItem);
                    });
                    
                    // Add a scrollable container if there are many items
                    if (entityData.configurationItems.length > 15) {
                        const scrollContainer = document.createElement('div');
                        scrollContainer.style.maxHeight = '400px';
                        scrollContainer.style.overflowY = 'auto';
                        scrollContainer.style.border = '1px solid #dee2e6';
                        scrollContainer.style.borderRadius = '4px';
                        scrollContainer.style.padding = '10px';
                        
                        // Move the row into the scroll container
                        scrollContainer.appendChild(rowContainer);
                        configSection.appendChild(scrollContainer);
                        
                        // Add item count indicator
                        const countIndicator = document.createElement('div');
                        countIndicator.className = 'text-muted small mt-1';
                        countIndicator.textContent = `Showing all ${entityData.configurationItems.length} configuration items (scroll to view more)`;
                        configSection.appendChild(countIndicator);
                    }
                    
                    form.appendChild(configSection);
                }
                break;
                
            case 'sp_instance':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="spId">SP ID</label>
                        <input type="text" class="form-control" id="spId" name="spId" 
                            value="${entityData.spId || ''}" readonly>
                        <small class="form-text text-muted">SP ID cannot be changed</small>
                    </div>
                    <div class="form-group">
                        <label for="spVersion">SP Version</label>
                        <input type="text" class="form-control" id="spVersion" name="spVersion" 
                            value="${entityData.spVersion || ''}">
                    </div>
                `;
                break;
                
            default:
                form.innerHTML = `
                    <div class="alert alert-warning">
                        <p>Edit form not implemented for entity type: ${entityType}</p>
                    </div>
                `;
                break;
        }
        
        return form;
    },
    
    /**
     * Show the edit dialog for the specified element
     * @param {Object} elementData - The element data
     * @param {string} elementType - The element type
     * @param {string} elementId - The element ID
     * @param {string} elementGuid - The element GUID
     * @param {Object} parentPath - Parent path references
     */
    showEditDialog: function(elementData, elementType, elementId, elementGuid, parentPath = {}) {
        // Store the current element information
        this.currentElement = {
            type: elementType,
            id: elementId,
            guid: elementGuid,
            name: elementData.name || elementId,
            data: elementData,
            parentPath: parentPath
        };
        
        // Update the modal title
        const modalTitle = document.querySelector('#edit-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = `Edit ${CISUtil2.getEntityTypeName(elementType)}`;
        }
        
        // Create the dialog content with an actual form
        this.editModalBody.innerHTML = '';
        
        // Generate the edit form
        this.editForm = this.generateEditForm(elementType, elementData);
        this.editModalBody.appendChild(this.editForm);
        
        // Set modal width based on element type
        const modalContent = document.querySelector('#edit-modal .modal-content');
        if (modalContent) {
            // Reset any previous custom styling
            modalContent.style.width = '';
            modalContent.style.maxWidth = '';
            modalContent.style.margin = '';
            modalContent.style.maxHeight = '';
            modalContent.style.display = '';
            modalContent.style.flexDirection = '';
            
            // Reset body styling
            if (this.editModalBody) {
                this.editModalBody.style.maxHeight = '';
                this.editModalBody.style.overflowY = '';
            }
            
            // Apply custom styling for GP instance and Network Interface dialogs
            if (elementType === 'gp_instance' || 
                (elementType === 'network_interface' && 
                 elementData.configurationItems && 
                 elementData.configurationItems.length > 8)) {
                
                // Check screen width to apply responsive sizing
                const screenWidth = window.innerWidth;
                
                if (screenWidth < 768) {
                    // Small screens: use almost full width
                    modalContent.style.width = '90%';
                    modalContent.style.maxWidth = '90%';
                } else if (screenWidth < 1200) {
                    // Medium screens: use 70% width
                    modalContent.style.width = '70%';
                    modalContent.style.maxWidth = '900px';
                } else {
                    // Large screens: use 50% width
                    modalContent.style.width = '50%';
                    modalContent.style.maxWidth = '1000px';
                }
                
                // Set max height based on viewport height
                const viewportHeight = window.innerHeight;
                modalContent.style.maxHeight = `${Math.max(500, viewportHeight * 0.8)}px`;
                modalContent.style.display = 'flex';
                modalContent.style.flexDirection = 'column';
                
                // Make the modal body scrollable
                if (this.editModalBody) {
                    this.editModalBody.style.maxHeight = `${Math.max(400, viewportHeight * 0.6)}px`;
                    this.editModalBody.style.overflowY = 'auto';
                }
                
                // Center the modal
                modalContent.style.margin = '50px auto';
            }
        }
        
        // Show the modal
        this.editModal.style.display = 'block';
    },
    
    /**
     * Hide the edit modal
     */
    hideEditModal: function() {
        if (this.editModal) {
            this.editModal.style.display = 'none';
        }
    },
    
    /**
     * Show the delete confirmation dialog
     * @param {Object} elementData - The element data
     * @param {string} elementType - The element type
     * @param {string} elementId - The element ID
     * @param {string} elementGuid - The element GUID
     * @param {Object} parentPath - Parent path references
     */
    showDeleteDialog: function(elementData, elementType, elementId, elementGuid, parentPath = {}) {
        // Store the current element information
        this.currentElement = {
            type: elementType,
            id: elementId,
            guid: elementGuid,
            name: elementData.name || elementId,
            data: elementData,
            parentPath: parentPath
        };
        
        // Update the modal title
        const modalTitle = document.querySelector('#delete-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = `Delete ${CISUtil2.getEntityTypeName(elementType)}`;
        }
        
        // Create the dialog content
        this.deleteModalBody.innerHTML = '';
        
        // Add warning message
        const warningMessage = document.createElement('div');
        warningMessage.className = 'alert alert-danger mb-4';
        warningMessage.innerHTML = `
            <p><strong>Warning:</strong> Are you sure you want to delete the following element?</p>
            <p>This action cannot be undone.</p>
        `;
        this.deleteModalBody.appendChild(warningMessage);
        
        // Add element information
        const elementInfo = document.createElement('div');
        elementInfo.className = 'card mb-3';
        elementInfo.innerHTML = `
            <div class="card-header bg-light">
                <strong>Element to Delete</strong>
            </div>
            <div class="card-body">
                <table class="table table-sm">
                    <tr>
                        <th>Type:</th>
                        <td>${CISUtil2.getEntityTypeName(elementType)}</td>
                    </tr>
                    <tr>
                        <th>ID:</th>
                        <td>${elementId || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>GUID:</th>
                        <td>${elementGuid || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th>Name:</th>
                        <td>${elementData.name || 'Unnamed'}</td>
                    </tr>
                </table>
            </div>
        `;
        this.deleteModalBody.appendChild(elementInfo);
        
        // Show the modal
        this.deleteModal.style.display = 'block';
    },
    
    /**
     * Hide the delete modal
     */
    hideDeleteModal: function() {
        if (this.deleteModal) {
            this.deleteModal.style.display = 'none';
        }
    },
    
    /**
     * Collect form data from the edit form
     * @returns {Object} Form data as an object
     */
    collectFormData: function() {
        const formData = {};
        
        // Get all input fields
        const inputs = this.editForm.querySelectorAll('input:not(.config-item), select:not(.config-item), textarea:not(.config-item)');
        inputs.forEach(input => {
            if (input.name && !input.readOnly) {
                formData[input.name] = input.value;
            }
        });
        
        return formData;
    },
    
    /**
     * Collect configuration item changes
     * @returns {Array} Array of configuration item changes
     */
    collectConfigItemChanges: function() {
        const changes = [];
        
        // Get all config item inputs
        const configInputs = this.editForm.querySelectorAll('input.config-item');
        configInputs.forEach(input => {
            const name = input.getAttribute('data-name');
            const guid = input.getAttribute('data-guid');
            const value = input.value;
            
            if (name && guid) {
                changes.push({
                    name,
                    guid,
                    value
                });
            }
        });
        
        return changes;
    },
    
    /**
     * Handle the edit confirmation
     */
    handleEditConfirm: function() {
        const { type, id, guid, parentPath } = this.currentElement;
        
        // Show loading indicator
        this.showLoadingOverlay('Saving changes...');
        
        // Collect form data
        const formData = this.collectFormData();
        
        // Collect config item changes if applicable
        const configChanges = this.collectConfigItemChanges();
        
        // Update the entity using the API
        CISApi2.updateEntity(guid, formData)
            .then(response => {
                if (!response || response.status !== 'success') {
                    throw new Error('Failed to update entity');
                }
                
                // Process configuration item changes if any
                const configPromises = [];
                
                if (configChanges.length > 0) {
                    // First approach: Get the entity data again to get updated configuration items
                    // This ensures we have the latest state of the entity
                    configPromises.push(
                        fetch(`/api/v2/cis_plan/entity/${guid}`)
                            .then(resp => resp.json())
                            .then(entityData => {
                                if (entityData.status !== 'success' || !entityData.data) {
                                    throw new Error('Failed to get latest entity data');
                                }
                                
                                // Store the updated entity data
                                const updatedEntity = entityData.data;
                                
                                // Get the configuration items array
                                const configItems = updatedEntity.configurationItems || [];
                                
                                // Create a mapping of config item name to index for easy lookup
                                const configItemMap = {};
                                configItems.forEach((item, index) => {
                                    configItemMap[item.Name] = index;
                                });
                                
                                // Now, for each config change, apply it directly to the entity
                                // This avoids making separate API calls for each config item
                                const changedItems = [];
                                
                                for (const change of configChanges) {
                                    if (!change.name) continue;
                                    
                                    // Find the config item in the entity
                                    const index = configItemMap[change.name];
                                    
                                    if (index !== undefined) {
                                        // Update the value
                                        const oldValue = configItems[index].AnswerContent;
                                        configItems[index].AnswerContent = change.value;
                                        
                                        changedItems.push({
                                            name: change.name,
                                            oldValue,
                                            newValue: change.value
                                        });
                                    } else {
                                        // Config item not found, create a new one
                                        const newItem = {
                                            Name: change.name,
                                            ConfigurationAnswerType: "Text Field (Single Line)",
                                            AnswerContent: change.value,
                                            guid: change.guid || String(Math.random()).substring(2)
                                        };
                                        
                                        configItems.push(newItem);
                                        changedItems.push({
                                            name: change.name,
                                            oldValue: '',
                                            newValue: change.value,
                                            isNew: true
                                        });
                                    }
                                }
                                
                                // If we have changes, update the entire entity
                                if (changedItems.length > 0) {
                                    // Update the configurationItems field in the entity
                                    updatedEntity.configurationItems = configItems;
                                    
                                    // Update the entire entity to save all config changes at once
                                    return fetch(`/api/v2/cis_plan/entity/${guid}`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify(updatedEntity)
                                    })
                                    .then(resp => resp.json())
                                    .then(result => {
                                        if (result.status !== 'success') {
                                            throw new Error('Failed to update configuration items');
                                        }
                                        
                                        console.log('Updated multiple configuration items:', changedItems.length);
                                        changedItems.forEach(item => {
                                            console.log(`- ${item.name}: ${item.oldValue} → ${item.newValue}`);
                                        });
                                        
                                        return result;
                                    });
                                }
                                
                                return { status: 'success', message: 'No configuration changes needed' };
                            })
                    );
                }
                
                // Wait for all updates to complete
                return Promise.all([response, ...configPromises]);
            })
            .then(results => {
                // Hide the modal
                this.hideEditModal();
                
                // Show success message
                this.showSuccessToast(`Successfully updated ${CISUtil2.getEntityTypeName(type)}`);
                
                // Refresh the UI while maintaining the current selection
                this.refreshAfterEdit(type, id, guid);
            })
            .catch(error => {
                console.error('Error updating entity:', error);
                this.showErrorToast(`Failed to update: ${error.message}`);
                // Hide loading overlay
                this.hideLoadingOverlay();
            });
    },
    
    /**
     * Handle the delete confirmation
     */
    handleDeleteConfirm: function() {
        const { type, id, guid, name, parentPath } = this.currentElement;
        
        // Show loading indicator
        this.showLoadingOverlay('Deleting...');
        
        // For delete, we need to determine the parent to select after deletion
        let parentType = null;
        let parentId = null;
        let parentGuid = null;
        
        // Determine the parent to select after deletion
        if (parentPath) {
            // Find the immediate parent type
            const parentTypes = Object.keys(parentPath).filter(key => key !== type);
            if (parentTypes.length > 0) {
                // Get the last parent in the hierarchy
                const immediateParentType = parentTypes[parentTypes.length - 1];
                const immediateParent = parentPath[immediateParentType];
                
                if (immediateParent) {
                    parentType = immediateParentType;
                    parentId = immediateParent.id || immediateParent.gpid || immediateParent.spId;
                    parentGuid = immediateParent.guid;
                }
            }
        }
        
        // If no parent found, default to CIS Plan root
        if (!parentType) {
            parentType = 'cisplan';
            parentId = null;
            parentGuid = null;
        }
        
        // Call the API to delete the entity
        CISApi2.deleteEntity(guid)
            .then(success => {
                if (!success) {
                    throw new Error('Failed to delete entity');
                }
                
                // Hide the modal
                this.hideDeleteModal();
                
                // Show success message
                this.showSuccessToast(`Successfully deleted ${CISUtil2.getEntityTypeName(type)}: ${name}`);
                
                // Refresh the UI and select the parent
                this.refreshAfterDelete(parentType, parentId, parentGuid);
            })
            .catch(error => {
                console.error('Error deleting entity:', error);
                this.showErrorToast(`Failed to delete: ${error.message}`);
                // Hide loading overlay
                this.hideLoadingOverlay();
            });
    },
    
    /**
     * Show a loading overlay
     * @param {string} message - Message to display
     */
    showLoadingOverlay: function(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'modal-backdrop fade show d-flex align-items-center justify-content-center';
        overlay.innerHTML = `
            <div class="text-center text-white">
                <div class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <div class="mt-2">${message}</div>
            </div>
        `;
        document.body.appendChild(overlay);
    },
    
    /**
     * Hide the loading overlay
     */
    hideLoadingOverlay: function() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    },
    
    /**
     * Refresh the UI after editing an element
     * @param {string} elementType - Type of the edited element
     * @param {string} elementId - ID of the edited element
     * @param {string} elementGuid - GUID of the edited element
     */
    refreshAfterEdit: function(elementType, elementId, elementGuid) {
        // Use the same approach as CISDialogs2.refreshAfterAdd
        console.log('Refreshing after editing element:', elementType, elementId);
        
        // Reset tree expansion state
        if (CISTree2) {
            // We want to maintain expanded nodes state during refresh
            const expandedNodesState = new Set(CISTree2.expandedNodes);
            
            // Reload the CIS Plan data
            CISApi2.fetchCISPlanData()
                .then(response => {
                    if (response && response.status === 'success' && response.data) {
                        // Update the CIS Plan data
                        CISPlan2.cisPlanData = response.data;
                        
                        // Update the elements component data reference
                        CISElements2.setCISPlanData(response.data);
                        
                        // Render the tree with the new data, preserving expanded state
                        CISTree2._previouslyExpandedNodes = expandedNodesState;
                        CISTree2.renderTree(response.data);
                        
                        // After the tree has rendered, select the edited node
                        setTimeout(() => {
                            this.selectNodeAfterRefresh(elementType, elementId, elementGuid);
                            this.hideLoadingOverlay();
                        }, 300); // Wait for tree to fully render
                    } else {
                        console.error('Failed to refresh CIS Plan data');
                        this.showErrorToast('Failed to refresh data after editing element');
                        this.hideLoadingOverlay();
                    }
                })
                .catch(error => {
                    console.error('Error refreshing CIS Plan data:', error);
                    this.showErrorToast('Error refreshing data: ' + error.message);
                    this.hideLoadingOverlay();
                });
        } else {
            this.hideLoadingOverlay();
        }
    },
    
    /**
     * Refresh the UI after deleting an element
     * @param {string} parentType - Type of the parent element to select
     * @param {string} parentId - ID of the parent element to select
     * @param {string} parentGuid - GUID of the parent element to select
     */
    refreshAfterDelete: function(parentType, parentId, parentGuid) {
        console.log('Refreshing after deleting element, will select parent:', parentType, parentId);
        
        // Use similar approach to refreshAfterEdit but select the parent
        if (CISTree2) {
            // We want to maintain expanded nodes state during refresh
            const expandedNodesState = new Set(CISTree2.expandedNodes);
            
            // Reload the CIS Plan data
            CISApi2.fetchCISPlanData()
                .then(response => {
                    if (response && response.status === 'success' && response.data) {
                        // Update the CIS Plan data
                        CISPlan2.cisPlanData = response.data;
                        
                        // Update the elements component data reference
                        CISElements2.setCISPlanData(response.data);
                        
                        // Render the tree with the new data, preserving expanded state
                        CISTree2._previouslyExpandedNodes = expandedNodesState;
                        CISTree2.renderTree(response.data);
                        
                        // After the tree has rendered, select the parent node
                        setTimeout(() => {
                            this.selectNodeAfterRefresh(parentType, parentId, parentGuid);
                            this.hideLoadingOverlay();
                            
                            // IMPROVEMENT: After a delete operation, we should check if we need to render elements explicitly
                            // This is necessary when deleting the last child element in a branch
                            setTimeout(() => {
                                // If no elements are being displayed (e.g., after deleting the last child element),
                                // explicitly trigger a rendering of the parent's elements
                                const detailsContainer = document.querySelector('#cis-details-container');
                                if (detailsContainer && 
                                    (!detailsContainer.children || detailsContainer.children.length === 0 || 
                                     detailsContainer.style.display === 'none' || 
                                     detailsContainer.innerHTML.trim() === '')) {
                                    
                                    console.log('No elements shown after delete, rendering parent elements explicitly');
                                    
                                    // Find the parent entity in the data
                                    if (parentType && parentId && CISElements2) {
                                        let parentData = null;
                                        
                                        if (parentGuid) {
                                            // Try to get the parent data from the CIS Plan data
                                            const parentEntity = CISApi2.findEntityInCISPlan(CISPlan2.cisPlanData, parentType, parentGuid);
                                            if (parentEntity) {
                                                parentData = parentEntity;
                                            }
                                        }
                                        
                                        // If we have the parent data, render its elements
                                        if (parentData) {
                                            CISElements2.renderElements(parentType, parentData);
                                        } else if (parentType === 'cisplan') {
                                            // If the parent is the CIS Plan root, render mission networks
                                            CISElements2.renderElements('cisplan', CISPlan2.cisPlanData);
                                        }
                                    }
                                }
                            }, 300); // Extra delay to ensure the tree has fully rendered and events have been processed
                        }, 300); // Wait for tree to fully render
                    } else {
                        console.error('Failed to refresh CIS Plan data');
                        this.showErrorToast('Failed to refresh data after deleting element');
                        this.hideLoadingOverlay();
                    }
                })
                .catch(error => {
                    console.error('Error refreshing CIS Plan data:', error);
                    this.showErrorToast('Error refreshing data: ' + error.message);
                    this.hideLoadingOverlay();
                });
        } else {
            this.hideLoadingOverlay();
        }
    },
    
    /**
     * Select a node in the tree after refresh
     * @param {string} nodeType - Type of the node to select
     * @param {string} nodeId - ID of the node to select
     * @param {string} nodeGuid - GUID of the node to select
     */
    selectNodeAfterRefresh: function(nodeType, nodeId, nodeGuid) {
        // Log the current expanded nodes state
        if (CISTree2 && CISTree2.expandedNodes) {
            console.log('Current expanded nodes before selection:', CISTree2.expandedNodes.size);
        }
        
        // Try to select node by GUID first (most reliable)
        if (nodeGuid && CISTree2.selectNodeByGuid(nodeGuid)) {
            console.log('Selected node by GUID:', nodeGuid);
            return;
        }
        
        // Then try by type and ID
        if (nodeType && nodeId && CISTree2.selectNodeByTypeAndId(nodeType, nodeId)) {
            console.log('Selected node by type and ID:', nodeType, nodeId);
            return;
        }
        
        // If all else fails, just select the root
        if (nodeType === 'cisplan' || !nodeType) {
            const rootNode = document.querySelector('.tree-node[data-type="cisplan"]');
            if (rootNode) {
                console.log('Selecting root node as fallback');
                CISTree2.selectTreeNode(rootNode);
                rootNode.click();
            }
        }
    },
    
    /**
     * Show a success toast notification
     * @param {string} message - The message to display
     */
    showSuccessToast: function(message) {
        // Rely on the CISDialogs2 toast implementation if available
        if (typeof CISDialogs2 !== 'undefined' && CISDialogs2.showSuccessToast) {
            CISDialogs2.showSuccessToast(message);
        } else {
            // Fallback to alert if toast functionality not available
            alert('Success: ' + message);
        }
    },
    
    /**
     * Show an error toast notification
     * @param {string} message - The message to display
     */
    showErrorToast: function(message) {
        // Rely on the CISDialogs2 toast implementation if available
        if (typeof CISDialogs2 !== 'undefined' && CISDialogs2.showErrorToast) {
            CISDialogs2.showErrorToast(message);
        } else {
            // Fallback to alert if toast functionality not available
            alert('Error: ' + message);
        }
    }
};

// Initialize the component when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    CISEditDialogs2.init();
}); 