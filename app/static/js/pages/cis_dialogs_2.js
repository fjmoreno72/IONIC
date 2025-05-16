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
    
    // Delete dialog elements
    deleteModal: null,
    closeDeleteModalBtn: null,
    cancelDeleteBtn: null,
    confirmDeleteBtn: null,
    deleteModalBody: null,
    
    // Random suffix for form field names to prevent autocomplete
    currentRandomSuffix: null,
    
    /**
     * Generate a random suffix for form field names to prevent browser autocomplete
     * @returns {string} Random suffix string
     */
    generateRandomSuffix: function() {
        // Use the utility function if available, otherwise fall back to our implementation
        if (typeof CISUIUtils !== 'undefined' && CISUIUtils.generateRandomSuffix) {
            this.currentRandomSuffix = CISUIUtils.generateRandomSuffix();
        } else {
            this.currentRandomSuffix = Math.random().toString(36).substring(2, 8);
        }
        return this.currentRandomSuffix;
    },
    
    // Type selection state
    typeSelectionState: {
        parentType: null,
        parentId: null,
        parentName: null,
        childTypes: [],
        selectedType: null
    },
    
    // Current element data for the add dialog
    currentAddData: {
        elementType: null,
        parentType: null,
        parentId: null,
        parentName: null,
        parentGuid: null
    },
    
    // Current element data for the delete dialog
    currentDeleteData: {
        elementType: null,
        elementId: null,
        elementName: null,
        elementGuid: null
    },
    
    /**
     * Initialize the dialogs component
     */
    init: function() {
        // Initialize add modal DOM references
        this.addModal = document.getElementById('add-modal');
        this.closeAddModalBtn = document.getElementById('close-add-modal');
        this.cancelAddBtn = document.getElementById('cancel-add-btn');
        this.confirmAddBtn = document.getElementById('confirm-add-btn');
        this.addModalBody = document.getElementById('add-modal-body');
        
        // Initialize delete modal DOM references - but only for reference, not for handlers
        this.deleteModal = document.getElementById('delete-modal');
        this.closeDeleteModalBtn = document.getElementById('close-delete-modal');
        this.cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        this.confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        this.deleteModalBody = document.getElementById('delete-modal-body');
        
        // Verify DOM elements exist
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
        
        // DO NOT set up event listeners for delete functionality
        // This is handled by CISEditDialogs2 component
        // Leaving the references to deleteModal elements for backward compatibility
        console.log('CISDialogs2 initialized - delete handlers are now managed by CISEditDialogs2');
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
     * @param {string} parentGuid - GUID of parent element (if available)
     */
    showAddElementDialog: function(elementType, parentType, parentId, parentName, parentGuid) {
        // Validate inputs
        if (!elementType) {
            console.error('No element type specified for add dialog');
            return;
        }
        
        // Generate a random suffix to prevent form autocomplete
        const randomSuffix = this.generateRandomSuffix();
        console.log(`Using random form field suffix: ${randomSuffix}`);
        
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
            parentName,
            parentGuid: parentGuid  // Use the provided parentGuid if available
        };
        
        // Find the parent GUID if not provided, which is needed for the API call
        if (!parentGuid && parentType !== 'cisplan') {
            console.log(`Looking for parent node: type=${parentType}, id=${parentId}`);
            
            // Try to find the exact parent node in the tree
            let parentNode = null;
            
            // First, try to find the direct match for the parent
            const allParentTypeNodes = document.querySelectorAll(`.tree-node[data-type="${parentType}"]`);
            for (const node of allParentTypeNodes) {
                if (node.getAttribute('data-id') === parentId) {
                    parentNode = node;
                    console.log(`Found direct match for parent node: ${parentType}/${parentId}`);
                    break;
                }
            }
            
            if (parentNode) {
                // Get the parent GUID from the data-guid attribute
                this.currentAddData.parentGuid = parentNode.getAttribute('data-guid');
                console.log(`Using parent ${parentType} with ID ${parentId} and GUID ${this.currentAddData.parentGuid}`);
            } else {
                console.error(`Could not find parent node for ${parentType} with ID ${parentId}`);
                
                // Use UI Utils for toast message if available
                if (typeof CISUIUtils !== 'undefined' && CISUIUtils.showErrorToast) {
                    CISUIUtils.showErrorToast(`Error: Could not find parent element for adding a new ${CISUtil2.getEntityTypeName(elementType)}`);
                } else {
                this.showErrorToast(`Error: Could not find parent element for adding a new ${CISUtil2.getEntityTypeName(elementType)}`);
                }
                return;
            }
        }
        
        // Reset type selection state if we're showing the actual add dialog
        this.typeSelectionState.selectedType = null;
        
        // Update the modal title
        const modalTitle = document.querySelector('#add-modal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = `Add New ${CISUtil2.getEntityTypeName(elementType)}`;
        }
        
        // Create the dialog content
        this.addModalBody.innerHTML = '';
        
        // Add parent information in a clean, minimalistic style using the utility function
        if (typeof CISFormUtils !== 'undefined' && CISFormUtils.createParentInfoBox) {
            const parentInfo = CISFormUtils.createParentInfoBox(
                parentType, 
                parentId, 
                this.currentAddData.parentGuid
            );
            this.addModalBody.appendChild(parentInfo);
        } else {
            // Fallback to inline creation if utility isn't available
        const parentInfo = document.createElement('div');
            parentInfo.className = 'alert alert-info mb-4';
            parentInfo.style.backgroundColor = '#e3f2fd';
            parentInfo.style.border = '1px solid #90caf9';
            parentInfo.style.borderRadius = '4px';
            parentInfo.style.padding = '15px';
            
            let infoHTML = `
                <h6 style="font-weight: 500; margin-bottom: 12px;">Adding a new ${CISUtil2.getEntityTypeName(elementType)} to:</h6>
                <div style="margin-left: 10px;">
                    <p style="margin-bottom: 4px;"><strong>Parent Type:</strong> ${CISUtil2.getEntityTypeName(parentType)}</p>
                    <p style="margin-bottom: 4px;"><strong>Parent ID:</strong> ${parentId}</p>`;
            
        if (this.currentAddData.parentGuid) {
                infoHTML += `<p style="margin-bottom: 0; font-size: 0.8rem; color: #666;"><strong>Parent GUID:</strong> ${this.currentAddData.parentGuid}</p>`;
        }
            
            infoHTML += `</div>`;
        
        parentInfo.innerHTML = infoHTML;
        this.addModalBody.appendChild(parentInfo);
        }
        
        // Create a form for the new element's properties using the form utility
        if (typeof CISFormUtils !== 'undefined' && CISFormUtils.generateEntityForm) {
            const form = CISFormUtils.generateEntityForm(elementType, null, 'add', randomSuffix);
            this.addModalBody.appendChild(form);
            
            // Initialize additional functionality based on entity type
            this.initializeFormFunctionality(form, elementType, randomSuffix);
        } else {
            // Fallback to old implementation if utility isn't available
        const form = document.createElement('form');
        form.id = 'add-entity-form';
        form.className = 'needs-validation';
            form.setAttribute('autocomplete', 'off'); // Disable autocomplete at the form level
        
            // Create form fields based on entity type - just a placeholder message in this fallback
                form.innerHTML = `
                <div class="alert alert-warning">
                    <p>Form utility not available. Please include cis_form_utils.js</p>
                    </div>
                `;
            
            this.addModalBody.appendChild(form);
        }
        
        // Show the modal - use UI utility if available
        if (typeof CISUIUtils !== 'undefined' && CISUIUtils.showModal) {
            CISUIUtils.showModal('add-modal');
        } else {
            this.addModal.style.display = 'block';
        }
    },
    
    /**
     * Initialize additional functionality for specific form types
     * @param {HTMLFormElement} form - The form element 
     * @param {string} entityType - Type of entity
     * @param {string} randomSuffix - Random suffix for field IDs
     */
    initializeFormFunctionality: function(form, entityType, randomSuffix) {
        switch(entityType) {
            case 'security_domain':
                // Load security classifications
                this.loadSecurityClassifications(form, randomSuffix);
                break;
            
            case 'hw_stack':
                // Initialize participant dropdown
                setTimeout(() => {
                    this.initializeParticipantDropdown(form, randomSuffix);
                }, 100);
                break;
            
            case 'gp_instance':
                // Initialize service and GP dropdowns
                setTimeout(() => {
                    this.initializeServiceGPDropdowns(form, randomSuffix);
                }, 100);
                break;
                
            case 'sp_instance':
                // Initialize SP form fields - use the form utility directly
                if (typeof CISFormUtils !== 'undefined' && typeof CISFormUtils.initializeSPFormFields === 'function') {
                    CISFormUtils.initializeSPFormFields(form, randomSuffix, false, null);
                } else {
                    console.error('CISFormUtils.initializeSPFormFields not available');
                    this.showErrorToast('Form utilities not available for SP instance form');
                }
                break;
        }
    },
    
    /**
     * Load security classifications for the dropdown
     * @param {HTMLFormElement} form - The form element
     * @param {string} randomSuffix - Random suffix for field IDs
     */
    loadSecurityClassifications: function(form, randomSuffix) {
                CISApi2.getSecurityClassifications()
                    .then(response => {
                        if (response && response.status === 'success' && response.data) {
                    const select = form.querySelector(`select#id_${randomSuffix}`);
                            const loadingIndicator = form.querySelector('.spinner-border').parentElement;
                            
                            if (select && loadingIndicator) {
                                // Clear loading indicator
                                loadingIndicator.style.display = 'none';
                                
                                // Clear existing options
                                select.innerHTML = '<option value="">Select a classification...</option>';
                                
                                // Add each classification
                                response.data.forEach(classification => {
                                    const option = document.createElement('option');
                                    option.value = classification.id;
                                    option.textContent = classification.name || classification.id;
                                    select.appendChild(option);
                                });
                            }
                        } else {
                            console.error('Failed to load security classifications');
                            const loadingIndicator = form.querySelector('.spinner-border').parentElement;
                            if (loadingIndicator) {
                                loadingIndicator.innerHTML = '<div class="text-danger">Failed to load classifications. Using defaults.</div>';
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error loading security classifications:', error);
                        const loadingIndicator = form.querySelector('.spinner-border').parentElement;
                        if (loadingIndicator) {
                            loadingIndicator.innerHTML = '<div class="text-danger">Error loading classifications. Using defaults.</div>';
                        }
                    });
    },
    
    /**
     * Initialize the participant dropdown for HW stack
     * @param {HTMLFormElement} form - The form element
     * @param {string} randomSuffix - Random suffix for field IDs
     */
    initializeParticipantDropdown: function(form, randomSuffix) {
        const participantSelect = form.querySelector(`#cisParticipantID_${randomSuffix}`);
        if (!participantSelect) return;
        
        if (typeof CISDropdownUtils !== 'undefined') {
            // Use dropdown utility if available
            CISDropdownUtils.initSelect2WithFallback(
                participantSelect,
                {
                    placeholder: 'Search for a participant...',
                    allowClear: true,
                    width: '100%'
                },
                CISDropdownUtils.loadParticipants
            );
        } else {
            // Fallback to old implementation
            this.oldInitializeParticipantDropdown(participantSelect, randomSuffix);
        }
    },
    
    /**
     * Old implementation of initializing participant dropdown (fallback)
     * @param {HTMLElement} participantSelect - The select element
     * @param {string} randomSuffix - Random suffix for field IDs
     */
    oldInitializeParticipantDropdown: function(participantSelect, randomSuffix) {
        const loadingIndicator = document.getElementById('participant-loading');
        
        if (participantSelect && typeof jQuery !== 'undefined') {
            try {
                // Initialize Select2
                jQuery(participantSelect).select2({
                    placeholder: 'Search for a participant...',
                    allowClear: true,
                    width: '100%'
                });
                
                // Make search field autocomplete off
                jQuery(participantSelect).on('select2:open', function() {
                    setTimeout(function() {
                        const searchField = document.querySelector('.select2-search__field');
                        if (searchField) {
                            searchField.setAttribute('autocomplete', 'new-password');
                        }
                    }, 100);
                });
                
                // Load participants from API
                this.loadParticipants().then(participants => {
                    // Remove loading indicator
                    if (loadingIndicator) {
                        loadingIndicator.style.display = 'none';
                    }
                    
                    // Add options to select
                    participants.forEach(participant => {
                        const option = new Option(participant.text, participant.id, false, false);
                        jQuery(participantSelect).append(option);
                    });
                }).catch(error => {
                    console.error('Error loading participants for dropdown:', error);
                    if (loadingIndicator) {
                        loadingIndicator.innerHTML = '<div class="text-danger">Error loading participants</div>';
                    }
                });
            } catch (e) {
                console.error('Error initializing Select2:', e);
                // Fallback to regular select if Select2 fails
                if (loadingIndicator) {
                    loadingIndicator.innerHTML = '<div class="text-warning">Using standard dropdown (Select2 failed to load)</div>';
                }
            }
        } else if (participantSelect) {
            // jQuery not available, use regular select
            console.warn('jQuery not available, using regular select');
            if (loadingIndicator) {
                // Still load participants but use regular select
                this.loadParticipants().then(participants => {
                    loadingIndicator.style.display = 'none';
                    
                    // Add options to select without jQuery
                    participants.forEach(participant => {
                        const option = document.createElement('option');
                        option.value = participant.id;
                        option.textContent = participant.text;
                        participantSelect.appendChild(option);
                    });
                }).catch(error => {
                    console.error('Error loading participants for dropdown:', error);
                    loadingIndicator.innerHTML = '<div class="text-danger">Error loading participants</div>';
                });
            }
        }
    },
    
    /**
     * Initialize service and GP dropdowns for GP instance
     * @param {HTMLFormElement} form - The form element
     * @param {string} randomSuffix - Random suffix for field IDs
     */
    initializeServiceGPDropdowns: function(form, randomSuffix) {
        const serviceSelect = form.querySelector(`#serviceId_${randomSuffix}`);
        const gpSelect = form.querySelector(`#gpid_${randomSuffix}`);
        
        if (!serviceSelect || !gpSelect) return;
        
        if (typeof CISDropdownUtils !== 'undefined') {
            // Add Select2 styling
            CISDropdownUtils.addSelect2Styling();
            
            // Initialize service dropdown
            CISDropdownUtils.initSelect2WithFallback(
                serviceSelect,
                {
                    placeholder: 'Search for a service...',
                    allowClear: true,
                    width: '100%',
                    dropdownParent: serviceSelect.parentNode,
                    templateSelection: function(data) {
                        if (!data.id) return data.text;
                        
                        // Extract ID from text if in format "Name (ID)"
                        let id = data.id;
                        let name = data.text.replace(/\s*\([^)]*\)\s*$/, ''); // Remove "(ID)" part
                        
                        return jQuery('<div>').html(`
                            <div style="font-size: 0.8em; color: #6c757d; margin-bottom: -5px;">${id}</div>
                            <div style="font-weight: 500;">${name}</div>
                        `);
                    }
                },
                CISDropdownUtils.loadAllServices,
                null,
                (e) => this.handleServiceChange(e, gpSelect, randomSuffix)
            );
            
            // Initialize GP dropdown with empty data for now
            CISDropdownUtils.initSelect2WithFallback(
                gpSelect,
                {
                    placeholder: 'Search for a GP...',
                    allowClear: true,
                    width: '100%',
                    dropdownParent: gpSelect.parentNode,
                    templateSelection: function(data) {
                        if (!data.id) return data.text;
                        
                        // Extract ID from text if in format "Name (ID)"
                        let id = data.id;
                        let nameMatch = data.text.match(/(.*?)\s*\(([^)]*)\)\s*$/);
                        let name = nameMatch ? nameMatch[1] : data.text;
                        
                        return jQuery('<div>').html(`
                            <div style="font-size: 0.8em; color: #6c757d; margin-bottom: -5px;">${id}</div>
                            <div style="font-weight: 500;">${name}</div>
                        `);
                    }
                }
            );
        } else {
            // Fallback to old implementation
            console.warn('CISDropdownUtils not available, using fallback for service/GP initialization');
            // TODO: Implement fallback or show a warning
        }
    },
    
    /**
     * Handle service dropdown change to load GP IDs
     * @param {Event} e - Change event
     * @param {HTMLElement} gpSelect - The GP select element
     * @param {string} randomSuffix - Random suffix for field IDs
     */
    handleServiceChange: function(e, gpSelect, randomSuffix) {
        const selectedServiceId = e.target.value;
        
        // Clear GP dropdown
        if (typeof jQuery !== 'undefined') {
            jQuery(gpSelect).empty().append(new Option('-- Select GP --', '', true, true));
        } else {
            gpSelect.innerHTML = '<option value="">-- Select GP --</option>';
        }
        
        if (!selectedServiceId) return;
        
        // Show loading for GPs
        const gpLoadingIndicator = document.getElementById(`gp-loading-${randomSuffix}`);
        if (gpLoadingIndicator) {
            gpLoadingIndicator.style.display = 'block';
            gpLoadingIndicator.innerHTML = `
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="sr-only">Loading GPs...</span>
                    </div>
                <small class="text-muted ml-2">Loading GPs for service ${selectedServiceId}...</small>
            `;
        }
        
        // Load GPs using dropdown utility
        if (typeof CISDropdownUtils !== 'undefined') {
            CISDropdownUtils.loadServiceGPs(selectedServiceId)
                .then(gps => {
                    if (gpLoadingIndicator) {
                        gpLoadingIndicator.style.display = 'none';
                    }
                    
                    // Process GP IDs to get names for each
                    const gpPromises = gps.map(gp => {
                        return CISDropdownUtils.getGPName(gp)
                            .then(gpName => ({
                                id: gp,
                                text: `${gpName} (${gp})`
                            }))
                            .catch(() => ({
                                id: gp,
                                text: gp
                            }));
                    });
                    
                    // Add all options to dropdown
                    Promise.all(gpPromises).then(gpOptions => {
                        gpOptions.forEach(gp => {
                            if (typeof jQuery !== 'undefined') {
                                const option = new Option(gp.text, gp.id, false, false);
                                jQuery(gpSelect).append(option);
                            } else {
                                const option = document.createElement('option');
                                option.value = gp.id;
                                option.textContent = gp.text;
                                gpSelect.appendChild(option);
                            }
                        });
                    });
                })
                .catch(error => {
                    console.error('Error loading GPs for service:', error);
                    if (gpLoadingIndicator) {
                        gpLoadingIndicator.innerHTML = '<div class="text-danger">Error loading GPs</div>';
                    }
                });
        }
    },
    
    /**
     * Hide the add element dialog
     */
    hideAddModal: function() {
        if (typeof CISUIUtils !== 'undefined' && CISUIUtils.hideModal) {
            CISUIUtils.hideModal('add-modal');
        } else {
        if (this.addModal) {
            this.addModal.style.display = 'none';
            }
        }
    },
    
    /**
     * Collect form data from the add entity form
     * @returns {Object} Form data as an object
     */
    collectAddFormData: function() {
        const form = document.getElementById('add-entity-form');
        
        // Use form utility if available
        if (typeof CISFormUtils !== 'undefined' && CISFormUtils.collectFormData) {
            return CISFormUtils.collectFormData(form);
        }
        
        // Fallback implementation
        if (!form) return {};
        
        const formData = {};
        
        // Get all input fields
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.name) {
                formData[input.name] = input.value;
            }
        });
        
        return formData;
    },
    
    /**
     * Handle the add element confirmation
     */
    handleAddElementConfirm: function() {
        const { elementType, parentType, parentId, parentName, parentGuid } = this.currentAddData;
        
        // Show loading overlay - use UI utility if available
        if (typeof CISUIUtils !== 'undefined' && CISUIUtils.showLoadingOverlay) {
            CISUIUtils.showLoadingOverlay('Creating new element...');
        } else {
        this.showLoadingOverlay('Creating new element...');
        }
        
        // Collect form data
        const formData = this.collectAddFormData();
        
        // Convert form data to API request format
        const apiRequest = {
            entity_type: elementType,
            parent_guid: parentGuid,
            attributes: formData
        };
        
        // Add debugging log to verify we're using the correct parent GUID
        console.log(`Creating new ${elementType} with parent GUID: ${parentGuid}`);
        
        // Make API call to create entity
        fetch('/api/v2/cis_plan/entity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiRequest)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Hide the modal
                this.hideAddModal();
                
                // Show success message - use UI utility if available
                if (typeof CISUIUtils !== 'undefined' && CISUIUtils.showSuccessToast) {
                    CISUIUtils.showSuccessToast(`Successfully created new ${CISUtil2.getEntityTypeName(elementType)}`);
                } else {
                this.showSuccessToast(`Successfully created new ${CISUtil2.getEntityTypeName(elementType)}`);
                }
                
                // Refresh the UI while maintaining the current position
                this.refreshAfterAdd(parentType, parentId);
            } else {
                throw new Error(data.message || 'Failed to create element');
            }
        })
        .catch(error => {
            console.error('Error creating element:', error);
            
            // Show error toast - use UI utility if available
            if (typeof CISUIUtils !== 'undefined' && CISUIUtils.showErrorToast) {
                CISUIUtils.showErrorToast(`Failed to create element: ${error.message}`);
            } else {
            this.showErrorToast(`Failed to create element: ${error.message}`);
            }
            
            // Hide loading overlay - use UI utility if available
            if (typeof CISUIUtils !== 'undefined' && CISUIUtils.hideLoadingOverlay) {
                CISUIUtils.hideLoadingOverlay();
            } else {
            this.hideLoadingOverlay();
            }
        });
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
                        this.hideLoadingOverlay();
                    }, 300); // Wait for tree to fully render
                } else {
                    console.error('Failed to refresh CIS Plan data');
                    this.showErrorToast('Failed to refresh data after adding element');
                    this.hideLoadingOverlay();
                }
            })
            .catch(error => {
                console.error('Error refreshing CIS Plan data:', error);
                this.showErrorToast('Error refreshing data: ' + error.message);
                this.hideLoadingOverlay();
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
        if (typeof CISUIUtils !== 'undefined' && CISUIUtils.showSuccessToast) {
            CISUIUtils.showSuccessToast(message);
        } else {
        this.showToast(message, 'success');
        }
    },
    
    /**
     * Show an error toast notification
     * @param {string} message - The message to display
     */
    showErrorToast: function(message) {
        if (typeof CISUIUtils !== 'undefined' && CISUIUtils.showErrorToast) {
            CISUIUtils.showErrorToast(message);
        } else {
            this.showToast(message, 'error');
        }
    },
    
    /**
     * Show a loading overlay
     * @param {string} message - Message to display
     */
    showLoadingOverlay: function(message = 'Loading...') {
        if (typeof CISUIUtils !== 'undefined' && CISUIUtils.showLoadingOverlay) {
            CISUIUtils.showLoadingOverlay(message);
        } else {
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
        }
    },
    
    /**
     * Hide the loading overlay
     */
    hideLoadingOverlay: function() {
        if (typeof CISUIUtils !== 'undefined' && CISUIUtils.hideLoadingOverlay) {
            CISUIUtils.hideLoadingOverlay();
        } else {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    },
    
    /**
     * Load participants for dropdown (fallback method if utility not available)
     * @returns {Promise<Array>} Array of participant objects with id and name
     */
    loadParticipants: async function() {
        // Use dropdown utility if available
        if (typeof CISDropdownUtils !== 'undefined' && CISDropdownUtils.loadParticipants) {
            return CISDropdownUtils.loadParticipants();
        }
        
        // Fallback implementation
        try {
            console.log('Loading participants for dropdown...');
            const response = await fetch('/api/participants');
            if (!response.ok) {
                console.error(`Failed to fetch participants: ${response.status} ${response.statusText}`);
                throw new Error(`Failed to fetch participants: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Participants API response status:', result.status);
            
            if (result.status === 'success' && Array.isArray(result.data)) {
                // Transform the data into the format needed for Select2
                const participants = result.data.map(participant => {
                    // Handle various participant data formats
                    return {
                        id: participant.key || participant.id, // Use key or fallback to id
                        text: participant.name || participant.id || 'Unknown participant', // Display name
                        // Store any other useful data
                        description: participant.description,
                        nation: participant.nation
                    };
                });
                
                console.log(`Processed ${participants.length} participants for dropdown`);
                return participants;
            } else {
                console.error("Failed to load participants:", result.message || "Unknown error");
                return [];
            }
        } catch (error) {
            console.error("Error loading participants:", error);
            return [];
        }
    },
    
    /**
     * Show delete confirmation dialog for an element
     * @param {string} elementType - Type of element to delete
     * @param {string} elementId - ID of element to delete
     * @param {string} elementName - Name of element to delete
     * @param {string} elementGuid - GUID of element to delete
     */
    showDeleteElementDialog: function(elementType, elementId, elementName, elementGuid) {
        console.warn("CISDialogs2.showDeleteElementDialog is deprecated. Use CISEditDialogs2.showDeleteDialog instead.");
        // Do nothing - all delete functionality has been moved to CISEditDialogs2
        
        // If CISEditDialogs2 is available, redirect to it
        if (typeof CISEditDialogs2 !== 'undefined' && typeof CISEditDialogs2.showDeleteDialog === 'function') {
            console.log("Redirecting to CISEditDialogs2.showDeleteDialog");
            // Find the element data if possible
            let elementData = {
                name: elementName || elementId || 'Unnamed',
                id: elementId
            };
            
            // Call the new component's method
            CISEditDialogs2.showDeleteDialog(
                elementData,
                elementType,
                elementId,
                elementGuid
            );
        }
    },
    
    /**
     * Hide the delete modal
     */
    hideDeleteModal: function() {
        console.warn("CISDialogs2.hideDeleteModal is deprecated. Use CISEditDialogs2.hideDeleteModal instead.");
        // Do nothing - all delete functionality has been moved to CISEditDialogs2
    },
    
    /**
     * Handle delete element confirmation
     */
    handleDeleteElementConfirm: function() {
        console.warn("CISDialogs2.handleDeleteElementConfirm is deprecated. Use CISEditDialogs2.handleDeleteConfirm instead.");
        // Do nothing - all delete functionality has been moved to CISEditDialogs2
    }
};
