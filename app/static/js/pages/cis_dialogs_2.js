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
    
    // Random suffix for form field names to prevent autocomplete
    currentRandomSuffix: null,
    
    /**
     * Generate a random suffix for form field names to prevent browser autocomplete
     * @returns {string} Random suffix string
     */
    generateRandomSuffix: function() {
        this.currentRandomSuffix = Math.random().toString(36).substring(2, 8);
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
        parentName: null,
        parentGuid: null
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
                this.showErrorToast(`Error: Could not find parent element for adding a new ${CISUtil2.getEntityTypeName(elementType)}`);
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
        
        // Add parent information in a clean, minimalistic style
        const parentInfo = document.createElement('div');
        parentInfo.className = 'alert alert-info mb-4';
        parentInfo.style.backgroundColor = '#e3f2fd';
        parentInfo.style.border = '1px solid #90caf9';
        parentInfo.style.borderRadius = '4px';
        parentInfo.style.padding = '15px';
        
        // Create formatted HTML with proper validation - Clean, minimalistic format
        let infoHTML = `
            <h6 style="font-weight: 500; margin-bottom: 12px;">Adding a new ${CISUtil2.getEntityTypeName(elementType)} to:</h6>
            <div style="margin-left: 10px;">
                <p style="margin-bottom: 4px;"><strong>Parent Type:</strong> ${CISUtil2.getEntityTypeName(parentType)}</p>
                <p style="margin-bottom: 4px;"><strong>Parent ID:</strong> ${parentId}</p>`;
        
        // Display the parent GUID as a smaller text only for debugging purposes
        if (this.currentAddData.parentGuid) {
            infoHTML += `<p style="margin-bottom: 0; font-size: 0.8rem; color: #666;"><strong>Parent GUID:</strong> ${this.currentAddData.parentGuid}</p>`;
        }
        
        infoHTML += `</div>`;
        
        parentInfo.innerHTML = infoHTML;
        this.addModalBody.appendChild(parentInfo);
        
        // Create a form for the new element's properties
        const form = document.createElement('form');
        form.id = 'add-entity-form';
        form.className = 'needs-validation';
        form.setAttribute('autocomplete', 'off'); // Disable autocomplete at the form level
        
        // Create form fields based on entity type
        switch(elementType) {
            case 'mission_network':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="name_${randomSuffix}">Name</label>
                        <input type="text" class="form-control" id="name_${randomSuffix}" name="name" 
                            placeholder="Enter mission network name" required autocomplete="new-password">
                    </div>
                `;
                break;
            
            case 'network_segment':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="name_${randomSuffix}">Name</label>
                        <input type="text" class="form-control" id="name_${randomSuffix}" name="name" 
                            placeholder="Enter network segment name" required autocomplete="new-password">
                    </div>
                `;
                break;
            
            case 'security_domain':
                // For security domains, we need to fetch available classifications
                form.innerHTML = `
                    <div class="form-group">
                        <label for="id_${randomSuffix}">Security Classification</label>
                        <select class="form-control" id="id_${randomSuffix}" name="id" required autocomplete="new-password">
                            <option value="">Select a classification...</option>
                            <option value="CL-UNCLASS">Unclassified</option>
                            <option value="CL-RESTRICTED">Restricted</option>
                            <option value="CL-SECRET">Secret</option>
                        </select>
                        <div class="mt-2 text-center">
                            <div class="spinner-border spinner-border-sm text-primary" role="status">
                                <span class="sr-only">Loading classifications...</span>
                            </div>
                            <span class="ml-2">Loading security classifications...</span>
                        </div>
                    </div>
                `;
                
                // Load actual classifications from the API
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
                break;
                
            case 'hw_stack':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="name_${randomSuffix}">Name</label>
                        <input type="text" class="form-control" id="name_${randomSuffix}" name="name" 
                            placeholder="Enter hardware stack name" required autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label for="cisParticipantID_${randomSuffix}">CIS Participant</label>
                        <select class="form-control" id="cisParticipantID_${randomSuffix}" name="cisParticipantID" autocomplete="new-password">
                            <option value="">-- Select Participant --</option>
                        </select>
                        <div class="loading-indicator mt-2" id="participant-loading">
                            <div class="spinner-border spinner-border-sm text-primary" role="status">
                                <span class="sr-only">Loading participants...</span>
                            </div>
                            <small class="text-muted ml-2">Loading participants...</small>
                        </div>
                    </div>
                `;
                
                // After form is appended to the DOM, initialize Select2
                setTimeout(() => {
                    const participantSelect = document.getElementById(`cisParticipantID_${randomSuffix}`);
                    if (participantSelect && typeof jQuery !== 'undefined') {
                        try {
                            // Initialize Select2
                            jQuery(participantSelect).select2({
                                placeholder: 'Search for a participant...',
                                allowClear: true,
                                width: '100%'
                            });
                            
                            // Make sure the search field inside Select2 also has autocomplete off
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
                                const loadingIndicator = document.getElementById('participant-loading');
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
                                const loadingIndicator = document.getElementById('participant-loading');
                                if (loadingIndicator) {
                                    loadingIndicator.innerHTML = '<div class="text-danger">Error loading participants</div>';
                                }
                            });
                        } catch (e) {
                            console.error('Error initializing Select2:', e);
                            // Fallback to regular select if Select2 fails
                            const loadingIndicator = document.getElementById('participant-loading');
                            if (loadingIndicator) {
                                loadingIndicator.innerHTML = '<div class="text-warning">Using standard dropdown (Select2 failed to load)</div>';
                            }
                        }
                    } else if (participantSelect) {
                        // jQuery not available, use regular select
                        console.warn('jQuery not available, using regular select');
                        const loadingIndicator = document.getElementById('participant-loading');
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
                }, 100); // Short delay to ensure DOM is ready
                break;
                
            case 'asset':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="name_${randomSuffix}">Name</label>
                        <input type="text" class="form-control" id="name_${randomSuffix}" name="name" 
                            placeholder="Enter asset name" required autocomplete="new-password">
                    </div>
                `;
                break;
                
            case 'network_interface':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="name_${randomSuffix}">Name</label>
                        <input type="text" class="form-control" id="name_${randomSuffix}" name="name" 
                            placeholder="Enter network interface name" required autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label for="ip_address_${randomSuffix}">IP Address</label>
                        <input type="text" class="form-control" id="ip_address_${randomSuffix}" name="ip_address" 
                            placeholder="E.g., 192.168.1.1" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label for="subnet_${randomSuffix}">Subnet Mask</label>
                        <input type="text" class="form-control" id="subnet_${randomSuffix}" name="subnet" 
                            placeholder="E.g., 255.255.255.0" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label for="fqdn_${randomSuffix}">FQDN</label>
                        <input type="text" class="form-control" id="fqdn_${randomSuffix}" name="fqdn" 
                            placeholder="E.g., server.domain.com" autocomplete="new-password">
                    </div>
                `;
                break;
                
            case 'gp_instance':
                form.innerHTML = `
                    <div class="form-group mb-4">
                        <label for="serviceId_${randomSuffix}" class="form-label d-block mb-2">Service ID</label>
                        <select class="form-control" id="serviceId_${randomSuffix}" name="serviceId" autocomplete="new-password">
                            <option value="">-- Select Service --</option>
                        </select>
                        <div class="loading-indicator mt-2" id="service-loading-${randomSuffix}">
                            <div class="spinner-border spinner-border-sm text-primary" role="status">
                                <span class="sr-only">Loading services...</span>
                            </div>
                            <small class="text-muted ml-2">Loading services...</small>
                        </div>
                    </div>
                    <div class="form-group mb-4">
                        <label for="gpid_${randomSuffix}" class="form-label d-block mb-2">GP ID</label>
                        <select class="form-control" id="gpid_${randomSuffix}" name="gpid" required autocomplete="new-password">
                            <option value="">-- Select GP --</option>
                        </select>
                        <div class="loading-indicator mt-2" id="gp-loading-${randomSuffix}">
                            <div class="spinner-border spinner-border-sm text-primary" role="status">
                                <span class="sr-only">Loading GPs...</span>
                            </div>
                            <small class="text-muted ml-2">Select a Service to load GPs...</small>
                        </div>
                    </div>
                    <div class="form-group mb-4">
                        <label for="instanceLabel_${randomSuffix}" class="form-label d-block mb-2">Instance Label</label>
                        <input type="text" class="form-control" id="instanceLabel_${randomSuffix}" name="instanceLabel" 
                            placeholder="Optional label" autocomplete="new-password">
                    </div>
                `;
                
                // After form is appended to the DOM, add custom styling
                setTimeout(() => {
                    // Add custom styling to Select2 dropdowns when initialized
                    const styleSelect2 = () => {
                        // Add custom CSS to the document to style Select2 dropdowns
                        const styleElement = document.createElement('style');
                        styleElement.textContent = `
                            .select2-container {
                                width: 100% !important;
                                margin-bottom: 10px;
                            }
                            .select2-selection {
                                height: auto !important;
                                min-height: 38px !important;
                                padding: 0.375rem 0 !important;
                            }
                            .select2-selection__rendered {
                                line-height: 1.5 !important;
                                padding-left: 12px !important;
                                display: flex !important;
                                flex-direction: column !important;
                            }
                            .select2-selection__arrow {
                                height: 36px !important;
                            }
                            .select2-selection--single {
                                border: 1px solid #ced4da !important;
                                border-radius: 4px !important;
                            }
                            .select2-search__field {
                                padding: 8px 12px !important;
                            }
                            /* Ensure dropdown is on top of other elements */
                            .select2-dropdown {
                                z-index: 9999 !important;
                            }
                            /* Fix spacing between Select2 elements */
                            .form-group + .form-group {
                                margin-top: 20px;
                            }
                            /* Improved clear button (x) styling */
                            .select2-selection__clear {
                                display: block !important;
                                float: right !important;
                                margin-right: 20px !important;
                                font-size: 1.2em !important;
                                font-weight: bold !important;
                                color: #6c757d !important;
                                margin-top: -15px !important;
                                cursor: pointer !important;
                            }
                            /* Format selected items more cleanly */
                            .select2-selection__choice__display {
                                padding: 0 5px !important;
                            }
                            /* Improve dropdown item appearance */
                            .select2-results__option {
                                padding: 8px 12px !important;
                            }
                            .select2-results__option--highlighted {
                                background-color: rgba(var(--primary-color-rgb), 0.8) !important;
                            }
                        `;
                        document.head.appendChild(styleElement);
                    };
                    
                    const serviceSelect = document.getElementById(`serviceId_${randomSuffix}`);
                    const gpSelect = document.getElementById(`gpid_${randomSuffix}`);
                    const serviceLoadingIndicator = document.getElementById(`service-loading-${randomSuffix}`);
                    const gpLoadingIndicator = document.getElementById(`gp-loading-${randomSuffix}`);
                    
                    if (serviceSelect && gpSelect && typeof jQuery !== 'undefined') {
                        try {
                            // Add the custom styling for Select2
                            styleSelect2();
                            
                            // Initialize Select2 for service dropdown with improved formatting
                            jQuery(serviceSelect).select2({
                                placeholder: 'Search for a service...',
                                allowClear: true,
                                width: '100%',
                                dropdownParent: jQuery(serviceSelect).parent(), // Ensure proper positioning
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
                            });
                            
                            // Initialize Select2 for GP dropdown with the same improved formatting
                            jQuery(gpSelect).select2({
                                placeholder: 'Search for a GP...',
                                allowClear: true,
                                width: '100%',
                                dropdownParent: jQuery(gpSelect).parent(), // Ensure proper positioning
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
                            });
                            
                            // Make sure the search fields inside Select2 also have autocomplete off
                            jQuery(serviceSelect).on('select2:open', function() {
                                setTimeout(function() {
                                    const searchField = document.querySelector('.select2-search__field');
                                    if (searchField) {
                                        searchField.setAttribute('autocomplete', 'new-password');
                                    }
                                }, 100);
                            });
                            
                            jQuery(gpSelect).on('select2:open', function() {
                                setTimeout(function() {
                                    const searchField = document.querySelector('.select2-search__field');
                                    if (searchField) {
                                        searchField.setAttribute('autocomplete', 'new-password');
                                    }
                                }, 100);
                            });
                            
                            // Load all services
                            this.loadAllServices().then(services => {
                                if (serviceLoadingIndicator) {
                                    serviceLoadingIndicator.style.display = 'none';
                                }
                                
                                // Add options to service select
                                services.forEach(service => {
                                    const option = new Option(service.text, service.id, false, false);
                                    jQuery(serviceSelect).append(option);
                                });
                                
                                // Handle service selection change
                                jQuery(serviceSelect).on('change', (e) => {
                                    const selectedServiceId = e.target.value;
                                    
                                    // Clear GP dropdown
                                    jQuery(gpSelect).empty().append(new Option('-- Select GP --', '', true, true));
                                    
                                    if (selectedServiceId) {
                                        // Show loading for GPs
                                        if (gpLoadingIndicator) {
                                            gpLoadingIndicator.style.display = 'block';
                                            gpLoadingIndicator.innerHTML = `
                                                <div class="spinner-border spinner-border-sm text-primary" role="status">
                                                    <span class="sr-only">Loading GPs...</span>
                                                </div>
                                                <small class="text-muted ml-2">Loading GPs for service ${selectedServiceId}...</small>
                                            `;
                                        }
                                        
                                        // Load GPs for the selected service
                                        this.loadServiceGPs(selectedServiceId).then(gps => {
                                            if (gpLoadingIndicator) {
                                                gpLoadingIndicator.style.display = 'none';
                                            }
                                            
                                            // Add options to GP select
                                            const gpPromises = gps.map(gp => {
                                                return this.getGPName(gp).then(gpName => {
                                                    return {
                                                        id: gp,
                                                        text: `${gpName} (${gp})`
                                                    };
                                                }).catch(() => {
                                                    return {
                                                        id: gp,
                                                        text: gp
                                                    };
                                                });
                                            });
                                            
                                            Promise.all(gpPromises).then(gpOptions => {
                                                gpOptions.forEach(gp => {
                                                    const option = new Option(gp.text, gp.id, false, false);
                                                    jQuery(gpSelect).append(option);
                                                });
                                            });
                                        }).catch(error => {
                                            console.error('Error loading GPs for service:', error);
                                            if (gpLoadingIndicator) {
                                                gpLoadingIndicator.innerHTML = '<div class="text-danger">Error loading GPs</div>';
                                            }
                                        });
                                    } else {
                                        // No service selected, show placeholder
                                        if (gpLoadingIndicator) {
                                            gpLoadingIndicator.innerHTML = '<small class="text-muted">Select a Service to load GPs...</small>';
                                        }
                                    }
                                });
                            }).catch(error => {
                                console.error('Error loading services:', error);
                                if (serviceLoadingIndicator) {
                                    serviceLoadingIndicator.innerHTML = '<div class="text-danger">Error loading services</div>';
                                }
                                
                                // FALLBACK: Convert selects to text inputs if API fails
                                this.convertSelectToTextInput(serviceSelect, 'Service ID', 'serviceId', true);
                                this.convertSelectToTextInput(gpSelect, 'GP ID', 'gpid', true);
                                
                                // Hide the GP loading indicator
                                if (gpLoadingIndicator) {
                                    gpLoadingIndicator.style.display = 'none';
                                }
                            });
                        } catch (e) {
                            console.error('Error initializing Select2 for service/GP selection:', e);
                            // Fallback if Select2 fails
                            if (serviceLoadingIndicator) {
                                serviceLoadingIndicator.innerHTML = '<div class="text-warning">Using standard dropdown (Select2 failed)</div>';
                            }
                        }
                    }
                }, 100); // Short delay to ensure DOM is ready
                break;
                
            case 'sp_instance':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="spId_${randomSuffix}">SP ID</label>
                        <input type="text" class="form-control" id="spId_${randomSuffix}" name="spId" required
                            placeholder="E.g., SP-0267" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label for="spVersion_${randomSuffix}">SP Version</label>
                        <input type="text" class="form-control" id="spVersion_${randomSuffix}" name="spVersion" 
                            placeholder="E.g., 1.0" autocomplete="new-password">
                    </div>
                `;
                break;
                
            default:
                form.innerHTML = `
                    <div class="alert alert-warning">
                        <p>Add form not implemented for entity type: ${elementType}</p>
                    </div>
                `;
                break;
        }
        
        this.addModalBody.appendChild(form);
        
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
     * Collect form data from the add entity form
     * @returns {Object} Form data as an object
     */
    collectAddFormData: function() {
        const form = document.getElementById('add-entity-form');
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
        
        // Show loading indicator
        this.showLoadingOverlay('Creating new element...');
        
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
                
                // Show success message
                this.showSuccessToast(`Successfully created new ${CISUtil2.getEntityTypeName(elementType)}`);
                
                // Refresh the UI while maintaining the current position
                this.refreshAfterAdd(parentType, parentId);
            } else {
                throw new Error(data.message || 'Failed to create element');
            }
        })
        .catch(error => {
            console.error('Error creating element:', error);
            this.showErrorToast(`Failed to create element: ${error.message}`);
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
    },
    
    /**
     * Get participant name by ID
     * This is a helper function to get the name of a participant when only the ID is known
     * @param {string} participantId - The participant ID to look up
     * @returns {Promise<string>} - The participant name or the original ID if not found
     */
    getParticipantNameById: async function(participantId) {
        if (!participantId) return 'Unknown';
        
        try {
            // First try the key_to_name endpoint which is faster
            const response = await fetch(`/api/participants/key_to_name?key=${encodeURIComponent(participantId)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success' && data.name) {
                    return data.name;
                }
            }
            
            // If that fails, load all participants and search for the ID
            const participants = await this.loadParticipants();
            const participant = participants.find(p => p.id === participantId);
            if (participant && participant.text) {
                return participant.text;
            }
            
            // If still not found, just return the ID
            return participantId;
        } catch (error) {
            console.error('Error getting participant name:', error);
            return participantId; // Return the ID as fallback
        }
    },
    
    /**
     * Load participants for dropdown
     * @returns {Promise<Array>} Array of participant objects with id and name
     */
    loadParticipants: async function() {
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
     * Find the direct parent node of a tree node in the DOM
     * @param {HTMLElement} node - The tree node
     * @returns {HTMLElement|null} - The parent node or null if not found
     */
    findDirectParent: function(node) {
        if (!node) return null;
        
        // Walk up the DOM to find the parent tree node
        let current = node.parentElement;
        while (current) {
            // If this is a tree-children container, its parent should be the parent tree node
            if (current.classList.contains('tree-children')) {
                // Get the parent of the tree-children, which should be a tree-node
                const parentNode = current.parentElement;
                if (parentNode && parentNode.classList.contains('tree-node')) {
                    return parentNode;
                }
            }
            current = current.parentElement;
        }
        
        return null;
    },
    
    /**
     * Load all available services
     * @returns {Promise<Array>} Array of service objects with id and name
     */
    loadAllServices: async function() {
        try {
            console.log('Loading all services for dropdown...');
            // Try the API endpoint for all services
            const response = await fetch('/api/services/all');
            
            if (!response.ok) {
                // If that fails, try another common endpoint format
                console.log('First services endpoint failed, trying alternative...');
                const altResponse = await fetch('/api/services');
                if (!altResponse.ok) {
                    throw new Error(`Failed to fetch services: ${response.statusText}`);
                }
                return this.processServicesResponse(await altResponse.json());
            }
            
            return this.processServicesResponse(await response.json());
        } catch (error) {
            console.error('Error loading services:', error);
            // Return an empty array as fallback
            return [];
        }
    },
    
    /**
     * Process the services API response with different possible formats
     * @param {Object} result - The API response data
     * @returns {Array} Formatted array of service objects
     */
    processServicesResponse: function(result) {
        let services = [];
        
        // Handle different API response formats
        if (result.success && result.services) {
            // Format: {success: true, services: [...]}
            services = result.services;
        } else if (result.status === 'success' && result.data) {
            // Format: {status: 'success', data: [...]}
            services = result.data;
        } else if (Array.isArray(result)) {
            // Format: Direct array of services
            services = result;
        } else if (result.services && Array.isArray(result.services)) {
            // Format: {services: [...]}
            services = result.services;
        } else {
            console.warn('Unexpected service API response format:', result);
            return [];
        }
        
        // Transform the data into the format needed for Select2
        const formattedServices = services.map(service => {
            // Handle various service data formats
            const id = service.id || service.serviceId || service.service_id;
            const name = service.name || service.serviceName || service.service_name || 'Unknown';
            
            return {
                id: id,
                text: `${name} (${id})`,
                description: service.description
            };
        });
        
        console.log(`Loaded ${formattedServices.length} services for dropdown`);
        return formattedServices;
    },
    
    /**
     * Load GPs for a specific service
     * @param {string} serviceId - Service ID to get GPs for
     * @returns {Promise<Array>} Array of GP IDs
     */
    loadServiceGPs: async function(serviceId) {
        try {
            console.log(`Loading GPs for service ${serviceId}...`);
            // Try the endpoint specified by the user
            const response = await fetch(`/api/services/${serviceId}/all_gps`);
            
            if (!response.ok) {
                // If that fails, try alternative endpoints
                console.log('First GP endpoint failed, trying alternatives...');
                
                // Try other potential endpoint formats
                const alternatives = [
                    `/api/services/${serviceId}/gps/all`,
                    `/api/services/${serviceId}/gps`,
                    `/api/services/${serviceId}/gp_ids`
                ];
                
                for (const alt of alternatives) {
                    try {
                        console.log(`Trying alternative endpoint: ${alt}`);
                        const altResponse = await fetch(alt);
                        if (altResponse.ok) {
                            console.log(`Alternative endpoint ${alt} succeeded`);
                            return this.processGPsResponse(await altResponse.json());
                        }
                    } catch (e) {
                        console.warn(`Failed to fetch from ${alt}:`, e);
                    }
                }
                
                throw new Error(`Failed to fetch GPs: ${response.statusText}`);
            }
            
            return this.processGPsResponse(await response.json());
        } catch (error) {
            console.error(`Error loading GPs for service ${serviceId}:`, error);
            return [];
        }
    },
    
    /**
     * Process the GPs API response with different possible formats
     * @param {Object} result - The API response data
     * @returns {Array} Array of GP IDs
     */
    processGPsResponse: function(result) {
        let gpIds = [];
        
        console.log('Processing GP response:', result);
        
        // Handle different API response formats
        if (result.success && result.gp_ids) {
            // Format from manually added selection: {success: true, gp_ids: [...]}
            gpIds = result.gp_ids;
            console.log('Found GP IDs in success/gp_ids format');
        } else if (result.status === 'success' && result.data) {
            // Common format: {status: 'success', data: [...]}
            console.log('Found GP IDs in status/data format');
            if (Array.isArray(result.data)) {
                gpIds = result.data.map(gp => gp.id || gp.gpId || gp);
            } else {
                gpIds = Object.keys(result.data);
            }
        } else if (Array.isArray(result)) {
            // Format: Direct array of GP IDs or objects
            console.log('Found GP IDs in direct array format');
            gpIds = result.map(gp => typeof gp === 'object' ? (gp.id || gp.gpId) : gp);
        } else if (result.gps && Array.isArray(result.gps)) {
            // Format: {gps: [...]}
            console.log('Found GP IDs in gps array format');
            gpIds = result.gps.map(gp => typeof gp === 'object' ? (gp.id || gp.gpId) : gp);
        } else {
            // Try to find any array property that might contain GP IDs
            const arrayProps = Object.keys(result).filter(key => Array.isArray(result[key]));
            if (arrayProps.length > 0) {
                console.log(`Found potential GP arrays in properties: ${arrayProps.join(', ')}`);
                // Try the first array property
                const firstArrayProp = arrayProps[0];
                gpIds = result[firstArrayProp].map(gp => 
                    typeof gp === 'object' ? (gp.id || gp.gpId || gp.gp_id || Object.values(gp)[0]) : gp
                );
            } else {
                console.warn('Unexpected GP API response format:', result);
                return [];
            }
        }
        
        console.log(`Successfully processed ${gpIds.length} GPs:`, gpIds.slice(0, 5));
        return gpIds;
    },
    
    /**
     * Get GP name by ID
     * @param {string} gpId - GP ID to get name for
     * @returns {Promise<string>} GP name
     */
    getGPName: async function(gpId) {
        try {
            console.log(`Getting name for GP ${gpId}...`);
            const response = await fetch(`/api/gps/${gpId}/name`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch GP name: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Handle different API response formats
            if (result.error) {
                throw new Error(result.error);
            } else if (result.name) {
                // Format from manually added selection: {id: '...', name: '...'}
                return result.name;
            } else if (result.status === 'success' && result.data) {
                // Common format: {status: 'success', data: {name: '...'}}
                return result.data.name || result.data.gpName || gpId;
            } else {
                // If we can't determine the format, just return the GP ID
                return gpId;
            }
        } catch (error) {
            console.error(`Error getting name for GP ${gpId}:`, error);
            return gpId; // Fall back to using the ID as the name
        }
    },
    
    /**
     * Convert a select element to text input
     * @param {HTMLElement} selectElement - The select element to convert
     * @param {string} placeholder - The placeholder text for the input
     * @param {string} name - The name attribute for the input
     * @param {boolean} required - Whether the input is required
     * @param {string} initialValue - The initial value for the input (optional)
     */
    convertSelectToTextInput: function(selectElement, placeholder, name, required = false, initialValue = '') {
        if (!selectElement) {
            console.error('Cannot convert null select element to text input');
            return;
        }
        
        // Get the parent form group
        const formGroup = selectElement.closest('.form-group');
        if (!formGroup) {
            console.error('Cannot find parent form group for select element');
            return;
        }
        
        // Create a new input element
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control';
        input.id = selectElement.id;
        input.placeholder = `Enter ${placeholder}`;
        input.name = name;
        input.value = initialValue || selectElement.value; // Use initialValue if provided, otherwise use select value
        input.setAttribute('autocomplete', 'new-password');
        
        if (required) {
            input.required = true;
        }
        
        // Replace the select with the input in the same form group
        selectElement.parentNode.replaceChild(input, selectElement);
        
        // Update the label
        const label = formGroup.querySelector('label');
        if (label) {
            label.setAttribute('for', input.id);
            label.textContent = placeholder;
        }
        
        // Hide the loading indicator if it exists
        const loadingIndicator = formGroup.querySelector('.loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        return input;
    }
};
