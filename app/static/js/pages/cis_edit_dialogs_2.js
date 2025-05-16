/**
 * CIS Plan Edit Dialogs Component 2.0
 * 
 * Manages edit and delete modal dialogs for CIS Plan elements.
 * Phase 2: Implements actual API calls to edit and delete CIS Plan elements.
 */

// Test function to verify file structure
function testFileStructure() {
    console.log('CIS Edit Dialogs 2.0 file structure verified');
}

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
    
    // Flag to track if already initialized
    initialized: false,
    
    /**
     * Initialize the edit dialogs component
     */
    init: function() {
        // Prevent multiple initializations
        if (this.initialized) {
            // console.log('CISEditDialogs2 already initialized, skipping');
            return;
        }
        
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
        
        // Remove any existing event listeners if possible
        this.removeExistingEventListeners();
        
        // Set up event listeners for the edit modal
        this.closeEditModalBtn.addEventListener('click', this.hideEditModal.bind(this));
        this.cancelEditBtn.addEventListener('click', this.hideEditModal.bind(this));
        this.confirmEditBtn.addEventListener('click', this.handleEditConfirm.bind(this));
        
        // Set up event listeners for the delete modal
        this.closeDeleteModalBtn.addEventListener('click', this.hideDeleteModal.bind(this));
        this.cancelDeleteBtn.addEventListener('click', this.hideDeleteModal.bind(this));
        
        // For the confirmDeleteBtn, use a named function for easier debugging
        // and to allow removal of the listener if needed
        this._handleDeleteConfirmBound = this.handleDeleteConfirm.bind(this);
        this.confirmDeleteBtn.addEventListener('click', this._handleDeleteConfirmBound);
        
        // Mark as initialized
        this.initialized = true;
        // console.log('CISEditDialogs2 initialized with bound event handlers');
    },
    
    /**
     * Remove existing event listeners if possible
     * This helps prevent duplicate handlers
     */
    removeExistingEventListeners: function() {
        // For edit modal buttons
        if (this.closeEditModalBtn) {
            this.closeEditModalBtn.replaceWith(this.closeEditModalBtn.cloneNode(true));
            this.closeEditModalBtn = document.getElementById('close-edit-modal');
        }
        
        if (this.cancelEditBtn) {
            this.cancelEditBtn.replaceWith(this.cancelEditBtn.cloneNode(true));
            this.cancelEditBtn = document.getElementById('cancel-edit-btn');
        }
        
        if (this.confirmEditBtn) {
            this.confirmEditBtn.replaceWith(this.confirmEditBtn.cloneNode(true));
            this.confirmEditBtn = document.getElementById('confirm-edit-btn');
        }
        
        // For delete modal buttons
        if (this.closeDeleteModalBtn) {
            this.closeDeleteModalBtn.replaceWith(this.closeDeleteModalBtn.cloneNode(true));
            this.closeDeleteModalBtn = document.getElementById('close-delete-modal');
        }
        
        if (this.cancelDeleteBtn) {
            this.cancelDeleteBtn.replaceWith(this.cancelDeleteBtn.cloneNode(true));
            this.cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        }
        
        if (this.confirmDeleteBtn) {
            this.confirmDeleteBtn.replaceWith(this.confirmDeleteBtn.cloneNode(true));
            this.confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        }
    },
    
    /**
     * Generate an edit form for the specified entity type
     * @param {string} entityType - The entity type
     * @param {Object} entityData - The entity data
     * @returns {HTMLFormElement} - The form element
     */
    generateEditForm: function(entityType, entityData) {
        // Generate a random suffix to prevent form autocomplete
        const randomSuffix = this.generateRandomSuffix();
        // console.log(`Using random form field suffix for edit form: ${randomSuffix}`);
        
        const form = document.createElement('form');
        form.id = 'entity-edit-form';
        form.className = 'needs-validation';
        form.setAttribute('autocomplete', 'off'); // Disable autocomplete at the form level
        
        // Create different form fields based on entity type
        switch(entityType) {
            case 'mission_network':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="name_${randomSuffix}">Name</label>
                        <input type="text" class="form-control" id="name_${randomSuffix}" name="name" 
                            value="${entityData.name || ''}" required autocomplete="new-password">
                    </div>
                `;
                break;
            
            case 'network_segment':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="name_${randomSuffix}">Name</label>
                        <input type="text" class="form-control" id="name_${randomSuffix}" name="name" 
                            value="${entityData.name || ''}" required autocomplete="new-password">
                    </div>
                `;
                break;
            
            case 'security_domain':
                // Security domains are special - we can't edit the ID
                form.innerHTML = `
                    <div class="form-group">
                        <label for="id_${randomSuffix}">Security Classification</label>
                        <input type="text" class="form-control" id="id_${randomSuffix}" name="id" 
                            value="${entityData.id || ''}" readonly autocomplete="new-password">
                        <small class="form-text text-muted">Security domain classification cannot be changed</small>
                    </div>
                `;
                break;
                
            case 'hw_stack':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="name_${randomSuffix}">Name</label>
                        <input type="text" class="form-control" id="name_${randomSuffix}" name="name" 
                            value="${entityData.name || ''}" required autocomplete="new-password">
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
                
                // After appending the form to the DOM, initialize Select2
                setTimeout(() => {
                    const participantSelect = document.getElementById(`cisParticipantID_${randomSuffix}`);
                    const loadingIndicator = document.getElementById('participant-loading');
                    
                    // Debug info to help us understand what's happening
                    /*
                    console.log('Edit mode participant data:', {
                        selectExists: !!participantSelect,
                        loadingExists: !!loadingIndicator,
                        jQueryExists: typeof jQuery !== 'undefined',
                        currentParticipantID: entityData.cisParticipantID
                    });
                    */
                    
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
                                // console.log('Loaded participants:', participants.length);
                                
                                // Remove loading indicator
                                if (loadingIndicator) {
                                    loadingIndicator.style.display = 'none';
                                }
                                
                                // Add options to select
                                participants.forEach(participant => {
                                    const option = new Option(participant.text, participant.id, false, false);
                                    jQuery(participantSelect).append(option);
                                });
                                
                                // Set the current value if it exists - ensuring this happens AFTER options are added
                                if (entityData.cisParticipantID) {
                                    // console.log('Setting current participant to:', entityData.cisParticipantID);
                                    // First try to find if this participant ID exists in the options
                                    let participantExists = false;
                                    for (const participant of participants) {
                                        if (participant.id === entityData.cisParticipantID) {
                                            participantExists = true;
                                            break;
                                        }
                                    }
                                    
                                    if (!participantExists) {
                                        // If not found, add it as an option
                                        // console.log('Adding current participant as option as it wasn\'t in the list');
                                        const option = new Option(entityData.cisParticipantID, entityData.cisParticipantID, false, false);
                                        jQuery(participantSelect).append(option);
                                    }
                                    
                                    // Now set it as selected and trigger change
                                    jQuery(participantSelect).val(entityData.cisParticipantID).trigger('change');
                                }
                            }).catch(error => {
                                console.error('Error loading participants for dropdown:', error);
                                if (loadingIndicator) {
                                    loadingIndicator.innerHTML = '<div class="text-danger">Error loading participants</div>';
                                }
                                
                                // Even if API fails, still try to set the current participant
                                if (entityData.cisParticipantID && participantSelect) {
                                    // Add current participant as an option
                                    const option = new Option(entityData.cisParticipantID, entityData.cisParticipantID, true, true);
                                    jQuery(participantSelect).append(option);
                                    jQuery(participantSelect).val(entityData.cisParticipantID).trigger('change');
                                }
                            });
                        } catch (e) {
                            console.error('Error initializing Select2:', e);
                            // Fallback to regular select if Select2 fails
                            if (loadingIndicator) {
                                loadingIndicator.innerHTML = '<div class="text-warning">Using standard dropdown (Select2 failed to load)</div>';
                            }
                            
                            // Still load participants for standard select
                            this.loadParticipants().then(participants => {
                                if (loadingIndicator) loadingIndicator.style.display = 'none';
                                
                                // Add options to standard select
                                participants.forEach(participant => {
                                    const option = document.createElement('option');
                                    option.value = participant.id;
                                    option.textContent = participant.text;
                                    participantSelect.appendChild(option);
                                });
                                
                                // Set current value
                                if (entityData.cisParticipantID) {
                                    participantSelect.value = entityData.cisParticipantID;
                                }
                            }).catch(error => {
                                console.error('Error loading participants for standard dropdown:', error);
                                if (loadingIndicator) {
                                    loadingIndicator.innerHTML = '<div class="text-danger">Error loading participants</div>';
                                }
                            });
                        }
                    } else if (participantSelect) {
                        // jQuery not available, use regular select
                        console.warn('jQuery not available, using regular select for edit mode');
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
                                
                                // Set the current value if it exists
                                if (entityData.cisParticipantID) {
                                    participantSelect.value = entityData.cisParticipantID;
                                }
                            }).catch(error => {
                                console.error('Error loading participants for dropdown:', error);
                                loadingIndicator.innerHTML = '<div class="text-danger">Error loading participants</div>';
                                
                                // Even if API fails, still add current participant if available
                                if (entityData.cisParticipantID) {
                                    const option = document.createElement('option');
                                    option.value = entityData.cisParticipantID;
                                    option.textContent = entityData.cisParticipantID;
                                    option.selected = true;
                                    participantSelect.appendChild(option);
                                }
                            });
                        }
                    } else {
                        console.error('Participant select element not found in edit form');
                        if (loadingIndicator) {
                            loadingIndicator.innerHTML = '<div class="text-danger">Error: Dropdown element not found</div>';
                        }
                    }
                }, 100); // Short delay to ensure DOM is ready
                break;
                
            case 'asset':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="name_${randomSuffix}">Name</label>
                        <input type="text" class="form-control" id="name_${randomSuffix}" name="name" 
                            value="${entityData.name || ''}" required autocomplete="new-password">
                    </div>
                `;
                break;
                
            case 'network_interface':
                form.innerHTML = `
                    <div class="form-group">
                        <label for="name_${randomSuffix}">Name</label>
                        <input type="text" class="form-control" id="name_${randomSuffix}" name="name" 
                            value="${entityData.name || ''}" required autocomplete="new-password">
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
                            <label for="config_${index}_${randomSuffix}">${item.Name}</label>
                            <input type="text" class="form-control config-item" id="config_${index}_${randomSuffix}" 
                                data-name="${item.Name}" data-guid="${item.guid}"
                                value="${item.AnswerContent || ''}" autocomplete="new-password">
                            <small class="form-text text-muted">${item.HelpText || ''}</small>
                        `;
                        leftCol.appendChild(configItem);
                    });
                    
                    // Add items to right column
                    entityData.configurationItems.slice(midPoint).forEach((item, index) => {
                        const configItem = document.createElement('div');
                        configItem.className = 'form-group';
                        configItem.innerHTML = `
                            <label for="config_${midPoint + index}_${randomSuffix}">${item.Name}</label>
                            <input type="text" class="form-control config-item" id="config_${midPoint + index}_${randomSuffix}" 
                                data-name="${item.Name}" data-guid="${item.guid}"
                                value="${item.AnswerContent || ''}" autocomplete="new-password">
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
                            value="${entityData.instanceLabel || ''}" autocomplete="new-password">
                    </div>
                    <div id="config-items-warning-${randomSuffix}" class="alert alert-warning" style="display: none;">
                        <p><strong>Warning:</strong> Changing the GP ID will replace all configuration items with the default ones for the new GP.</p>
                        <p>Any existing configuration data will be lost.</p>
                    </div>
                `;
                
                // After form is appended to DOM, initialize Select2 for service dropdown
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
                    const configItemsWarning = document.getElementById(`config-items-warning-${randomSuffix}`);
                    
                    // Store the original GP ID to detect changes
                    const originalGpId = entityData.gpid || '';
                    
                    if (serviceSelect && gpSelect && typeof jQuery !== 'undefined') {
                        try {
                            // Add the custom styling for Select2
                            styleSelect2();
                            
                            // Initialize Select2 for service dropdown
                            jQuery(serviceSelect).select2({
                                placeholder: 'Search for a service...',
                                allowClear: true,
                                width: '100%',
                                dropdownParent: jQuery(serviceSelect).parent(),
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
                                dropdownParent: jQuery(gpSelect).parent(),
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
                            
                            // Store current GP ID for later use (needed when loading GPs)
                            const currentGpId = entityData.gpid || '';
                            
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
                                                
                                                // If this is the service that the current GP belongs to,
                                                // select the current GP in the dropdown
                                                if (selectedServiceId === entityData.serviceId && currentGpId) {
                                                    jQuery(gpSelect).val(currentGpId).trigger('change');
                                                }
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
                                
                                // Add GP selection change handler to show warning when GP is changed
                                jQuery(gpSelect).on('change', (e) => {
                                    const selectedGpId = e.target.value;
                                    
                                    // Show/hide warning based on whether GP ID changed from original
                                    if (configItemsWarning) {
                                        if (selectedGpId && selectedGpId !== originalGpId) {
                                            configItemsWarning.style.display = 'block';
                                        } else {
                                            configItemsWarning.style.display = 'none';
                                        }
                                    }
                                });
                                
                                // Set the current service ID if it exists
                                if (entityData.serviceId) {
                                    jQuery(serviceSelect).val(entityData.serviceId).trigger('change');
                                }
                            }).catch(error => {
                                console.error('Error loading services:', error);
                                if (serviceLoadingIndicator) {
                                    serviceLoadingIndicator.innerHTML = '<div class="text-danger">Error loading services</div>';
                                }
                                
                                // FALLBACK: Convert selects to text inputs if API calls fail
                                this.convertSelectToTextInput(
                                    serviceSelect, 
                                    'Service ID', 
                                    'serviceId', 
                                    true, 
                                    entityData.serviceId || ''
                                );
                                
                                this.convertSelectToTextInput(
                                    gpSelect, 
                                    'GP ID', 
                                    'gpid', 
                                    true, 
                                    entityData.gpid || ''
                                );
                                
                                // Hide the GP loading indicator
                                if (gpLoadingIndicator) {
                                    gpLoadingIndicator.style.display = 'none';
                                }
                            });
                        } catch (e) {
                            console.error('Error initializing Select2:', e);
                            if (serviceLoadingIndicator) {
                                serviceLoadingIndicator.innerHTML = '<div class="text-warning">Using standard input (Select2 failed)</div>';
                            }
                            
                            // Fallback to regular input
                            this.convertSelectToTextInput(
                                serviceSelect, 
                                'Service ID', 
                                'serviceId', 
                                true, 
                                entityData.serviceId || ''
                            );
                            
                            this.convertSelectToTextInput(
                                gpSelect, 
                                'GP ID', 
                                'gpid', 
                                true, 
                                entityData.gpid || ''
                            );
                            
                            // Hide the GP loading indicator
                            if (gpLoadingIndicator) {
                                gpLoadingIndicator.style.display = 'none';
                            }
                        }
                    }
                }, 100);
                
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
                            <label for="config_${index}_${randomSuffix}">${item.Name}</label>
                            <input type="text" class="form-control config-item" id="config_${index}_${randomSuffix}" 
                                data-name="${item.Name}" data-guid="${item.guid}"
                                value="${item.AnswerContent || ''}" autocomplete="new-password">
                            <small class="form-text text-muted">${item.HelpText || ''}</small>
                        `;
                        leftCol.appendChild(configItem);
                    });
                    
                    // Add items to right column
                    entityData.configurationItems.slice(midPoint).forEach((item, index) => {
                        const configItem = document.createElement('div');
                        configItem.className = 'form-group';
                        configItem.innerHTML = `
                            <label for="config_${midPoint + index}_${randomSuffix}">${item.Name}</label>
                            <input type="text" class="form-control config-item" id="config_${midPoint + index}_${randomSuffix}" 
                                data-name="${item.Name}" data-guid="${item.guid}"
                                value="${item.AnswerContent || ''}" autocomplete="new-password">
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
                        <label for="spId_${randomSuffix}">Specific Product</label>
                        <div class="loading-indicator mb-2">
                            <small class="text-muted">Loading specific products...</small>
                            <div class="spinner-border spinner-border-sm text-primary" role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                        </div>
                        <select class="form-control" id="spId_${randomSuffix}" name="spId" required>
                            <option value="">Select a Specific Product</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="spVersion_${randomSuffix}">SP Version</label>
                        <div class="loading-indicator mb-2">
                            <small class="text-muted">Loading versions...</small>
                            <div class="spinner-border spinner-border-sm text-primary" role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                        </div>
                        <select class="form-control" id="spVersion_${randomSuffix}" name="spVersion">
                            <option value="">First select a Specific Product</option>
                        </select>
                        <small class="form-text text-muted">Leave empty if no specific version is required</small>
                    </div>
                `;
                
                // After form is added to DOM, initialize the dropdowns
                if (typeof CISDropdownUtils !== 'undefined') {
                    setTimeout(async () => {
                        try {
                            const spIdSelect = document.getElementById(`spId_${randomSuffix}`);
                            const spVersionSelect = document.getElementById(`spVersion_${randomSuffix}`);
                            const spLoadingIndicator = spIdSelect.closest('.form-group').querySelector('.loading-indicator');
                            const versionLoadingIndicator = spVersionSelect.closest('.form-group').querySelector('.loading-indicator');
                            
                            if (!spIdSelect || !spVersionSelect) {
                                console.error('SP form fields not found');
                                return;
                            }
                            
                            // Current SP ID for later selection
                            const currentSpId = entityData.spId || '';
                            const currentVersion = entityData.spVersion || '';
                            
                            // Initialize SP dropdown with Select2
                            const select2Options = {
                                placeholder: 'Select a Specific Product',
                                allowClear: true,
                                width: '100%',
                                dropdownParent: spIdSelect.closest('.modal-body'),
                                templateResult: (sp) => {
                                    if (!sp.id) return sp.text;
                                    return $(`<div>
                                        <div style="font-weight: normal;">${sp.text}</div>
                                        ${sp.description ? `<small>${sp.description}</small>` : ''}
                                    </div>`);
                                }
                            };
                            
                            // Load SP data and initialize dropdown
                            await CISDropdownUtils.initSelect2WithFallback(
                                spIdSelect,
                                select2Options,
                                CISDropdownUtils.loadAllSPs,
                                currentSpId, // Select the current SP by default
                                // On change handler for SP selection
                                function(e) {
                                    const selectedSpId = e.target.value;
                                    // console.log(`Selected SP ID: ${selectedSpId}`);
                                    
                                    // Reset version dropdown
                                    if (typeof jQuery !== 'undefined') {
                                        $(spVersionSelect).empty();
                                        $(spVersionSelect).append('<option value="">Select Version (Optional)</option>');
                                    } else {
                                        spVersionSelect.innerHTML = '<option value="">Select Version (Optional)</option>';
                                    }
                                    
                                    if (!selectedSpId) {
                                        spVersionSelect.disabled = true;
                                        return;
                                    }
                                    
                                    // Show loading indicator for versions
                                    if (versionLoadingIndicator) {
                                        versionLoadingIndicator.style.display = 'block';
                                    }
                                    
                                    // Load versions for selected SP
                                    CISDropdownUtils.loadSPVersions(selectedSpId)
                                        .then(versions => {
                                            // Hide loading indicator
                                            if (versionLoadingIndicator) {
                                                versionLoadingIndicator.style.display = 'none';
                                            }
                                            
                                            // Enable version dropdown
                                            spVersionSelect.disabled = false;
                                            
                                            // Add "No Version" option
                                            if (typeof jQuery !== 'undefined') {
                                                $(spVersionSelect).append('<option value="">No Version (Optional)</option>');
                                            } else {
                                                let noVersionOption = document.createElement('option');
                                                noVersionOption.value = "";
                                                noVersionOption.textContent = "No Version (Optional)";
                                                spVersionSelect.appendChild(noVersionOption);
                                            }
                                            
                                            // Add versions to dropdown
                                            versions.forEach(version => {
                                                if (typeof jQuery !== 'undefined') {
                                                    $(spVersionSelect).append(new Option(version.text, version.id));
                                                } else {
                                                    let option = document.createElement('option');
                                                    option.value = version.id;
                                                    option.textContent = version.text;
                                                    spVersionSelect.appendChild(option);
                                                }
                                            });
                                            
                                            // Select current version if exists
                                            if (currentVersion) {
                                                if (typeof jQuery !== 'undefined') {
                                                    $(spVersionSelect).val(currentVersion).trigger('change');
                                                } else {
                                                    spVersionSelect.value = currentVersion;
                                                }
                                            }
                                            
                                            // Initialize select2 if available
                                            if (typeof jQuery !== 'undefined') {
                                                try {
                                                    $(spVersionSelect).select2({
                                                        placeholder: 'Select Version (Optional)',
                                                        allowClear: true,
                                                        width: '100%',
                                                        dropdownParent: spVersionSelect.closest('.modal-body')
                                                    });
                                                } catch (e) {
                                                    console.error('Error initializing select2 for version dropdown:', e);
                                                }
                                            }
                                        })
                                        .catch(error => {
                                            console.error(`Error loading versions for SP ${selectedSpId}:`, error);
                                            if (versionLoadingIndicator) {
                                                versionLoadingIndicator.innerHTML = '<div class="text-danger">Error loading versions</div>';
                                            }
                                            
                                            // Still enable the dropdown for manual entry
                                            spVersionSelect.disabled = false;
                                            if (typeof jQuery !== 'undefined') {
                                                $(spVersionSelect).append('<option value="">Enter version manually</option>');
                                            } else {
                                                spVersionSelect.innerHTML = '<option value="">Enter version manually</option>';
                                            }
                                        });
                                }
                            );
                            
                            // If we have a current SP ID, trigger loading of versions
                            if (currentSpId) {
                                // This will automatically trigger the loading of versions via the onChange handler
                                if (typeof jQuery !== 'undefined') {
                                    setTimeout(() => {
                                        $(spIdSelect).trigger('change');
                                    }, 200);
                                } else {
                                    // Manual trigger for non-jQuery
                                    const event = new Event('change');
                                    spIdSelect.dispatchEvent(event);
                                }
                            }
                            
                        } catch (error) {
                            console.error('Error initializing SP dropdowns:', error);
                            
                            // Fallback to simple text inputs
                            const spGroup = form.querySelector('.form-group:first-child');
                            const versionGroup = form.querySelector('.form-group:nth-child(2)');
                            
                            if (spGroup) {
                                spGroup.innerHTML = `
                                    <label for="spId_${randomSuffix}">SP ID</label>
                                    <input type="text" class="form-control" id="spId_${randomSuffix}" name="spId" 
                                        value="${entityData.spId || ''}" required autocomplete="new-password">
                                    <div class="mt-2 text-danger">
                                        <small>Dropdown utility not available</small>
                                    </div>
                                `;
                            }
                            
                            if (versionGroup) {
                                versionGroup.innerHTML = `
                                    <label for="spVersion_${randomSuffix}">SP Version</label>
                                    <input type="text" class="form-control" id="spVersion_${randomSuffix}" name="spVersion" 
                                        value="${entityData.spVersion || ''}" autocomplete="new-password">
                                    <small class="form-text text-muted">Leave empty if no specific version is required</small>
                                `;
                            }
                        }
                    }, 100);
                } else {
                    // CISDropdownUtils not available - fallback to text inputs
                    console.error('CISDropdownUtils not available for SP instance form initialization');
                    
                    const spGroup = form.querySelector('.form-group:first-child');
                    const versionGroup = form.querySelector('.form-group:nth-child(2)');
                    
                    if (spGroup) {
                        spGroup.innerHTML = `
                            <label for="spId_${randomSuffix}">SP ID</label>
                            <input type="text" class="form-control" id="spId_${randomSuffix}" name="spId" 
                                value="${entityData.spId || ''}" required autocomplete="new-password">
                            <div class="mt-2 text-danger">
                                <small>Dropdown utility not available</small>
                            </div>
                        `;
                    }
                    
                    if (versionGroup) {
                        versionGroup.innerHTML = `
                            <label for="spVersion_${randomSuffix}">SP Version</label>
                            <input type="text" class="form-control" id="spVersion_${randomSuffix}" name="spVersion" 
                                value="${entityData.spVersion || ''}" autocomplete="new-password">
                            <small class="form-text text-muted">Leave empty if no specific version is required</small>
                        `;
                    }
                }
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
     * Show the delete confirmation dialog for an entity
     * @param {string|Object} entityType - The entity type or element data object (for backwards compatibility)
     * @param {string} entityId - The entity ID or element type (for backwards compatibility)
     * @param {string} entityName - The entity name or element ID (for backwards compatibility)
     * @param {string} entityGuid - The entity GUID
     * @param {Object} parentPath - Path to parent entities
     */
    showDeleteDialog: function(entityType, entityId, entityName, entityGuid, parentPath) {
        // Prevent showing the dialog if already in progress
        if (this.refreshInProgress) {
            console.warn("Refresh in progress, ignoring delete dialog request");
            return;
        }
        
        // Check if using old parameter format (backward compatibility)
        let typeStr, idStr, nameStr, elementData;
        
        if (typeof entityType === 'object') {
            // Old format: (elementData, elementType, elementId, elementGuid, parentPath)
            elementData = entityType;
            typeStr = String(entityId); // elementType was in the second parameter
            idStr = entityName;         // elementId was in the third parameter
            nameStr = elementData.name || idStr;
            console.log("Using legacy parameter format for showDeleteDialog");
        } else {
            // New format: (entityType, entityId, entityName, entityGuid, parentPath)
            // Ensure entityType is a string, extract from object if needed
            typeStr = String(entityType);
            idStr = entityId;
            nameStr = entityName;
            elementData = { name: nameStr };
        }
        
        // Store the current element
        this.currentElement = {
            type: typeStr,
            id: idStr,
            guid: entityGuid,
            name: nameStr,
            data: elementData,
            parentPath: parentPath
        };
        
        // Update the delete modal body
        this.deleteModalBody.innerHTML = `
            <p>Are you sure you want to delete this ${CISUtil2.getEntityTypeName(typeStr)}?</p>
            <p><strong>Name:</strong> ${nameStr}</p>
            <p class="text-danger">This action cannot be undone!</p>
        `;
        
        // Show the delete modal
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
     * Collect form data from the edit entity form
     * @param {HTMLFormElement} form - The form element to collect data from
     * @returns {Object} Object containing the form data
     */
    collectFormData: function(form) {
        if (!form) {
            form = document.getElementById('entity-edit-form');
        }
        
        if (!form) {
            console.error('Cannot collect data from missing form');
            return {};
        }
        
        const formData = {};
        
        // Get all input fields excluding config items
        const inputs = form.querySelectorAll('input:not(.config-item):not([readonly]), select:not([readonly]), textarea:not([readonly])');
        
        inputs.forEach(input => {
            if (input.name) {
                formData[input.name] = input.value;
            }
        });
        
        return formData;
    },
    
    /**
     * Collect configuration item changes from the edit form
     * @param {HTMLFormElement} form - The form containing config items
     * @returns {Array} Array of configuration item changes
     */
    collectConfigItemChanges: function(form) {
        if (!form) {
            form = document.getElementById('entity-edit-form');
        }
        
        if (!form) {
            console.error('Cannot collect config items from missing form');
            return [];
        }
        
        // If we're resetting config items due to GP change, return empty array
        if (form.getAttribute('data-reset-config') === 'true') {
            // console.log('GP changed - skipping config item collection as they will be reset');
            return [];
        }
        
        const changes = [];
        
        // Get all config item inputs
        const configInputs = form.querySelectorAll('input.config-item');
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
        if (!this.currentElement.type || !this.currentElement.id || !this.currentElement.guid) {
            console.error('Missing required element information for edit');
            return;
        }
        
        // Show loading overlay
        if (typeof CISUIUtils !== 'undefined' && CISUIUtils.showLoadingOverlay) {
            CISUIUtils.showLoadingOverlay('Saving changes...');
        } else {
            this.showLoadingOverlay('Saving changes...');
        }
        
        // Check if this is a GP instance and GP type changed
        const form = document.getElementById('entity-edit-form');
        const isGpInstance = this.currentElement.type === 'gp_instance';
        let gpChanged = false;
        
        if (isGpInstance) {
            const originalGpId = this.currentElement.data.gpid || '';
            const newGpId = form.querySelector('select[name="gpid"]')?.value || 
                          form.querySelector('input[name="gpid"]')?.value || '';
            
            // Check if GP ID changed
            gpChanged = (newGpId && newGpId !== originalGpId);
            
            // If GP changed, we need to mark configuration items for removal
            if (gpChanged) {
                // console.log(`GP instance changed from ${originalGpId} to ${newGpId} - configuration items will be reset`);
                form.setAttribute('data-reset-config', 'true');
            }
        }
        
        // Collect form data
        const attributes = this.collectFormData(form);
        // If GP changed, don't include config item changes
        const configChanges = gpChanged ? [] : this.collectConfigItemChanges(form);
        
        // Make API call to update element
        const apiRequest = {
            entity_type: this.currentElement.type,
            guid: this.currentElement.guid,
            attributes: attributes,
            config_changes: configChanges
        };
        
        // Add option to reset config items if GP changed
        if (gpChanged) {
            apiRequest.reset_config_items = true;
        }
        
        // Log details of the update for debugging
        // console.log('Updating element with data:', apiRequest);
        
        // Make API call to update
        fetch(`/api/v2/cis_plan/entity/${this.currentElement.guid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiRequest)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status !== 'success') {
                    throw new Error(data.message || 'Failed to update entity');
                }
                
                // For GP Instances with changed GP ID, refresh config items
                if (isGpInstance && gpChanged) {
                    // After successful update, call the refresh endpoint to get the new configuration items
                    return fetch(`/api/v2/cis_plan/gp_instance/${this.currentElement.guid}/refresh_config`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })
                    .then(resp => resp.json())
                    .then(refreshResult => {
                        if (refreshResult.status !== 'success') {
                            console.warn('Configuration items refresh partial failure:', refreshResult.message);
                        }
                        return data; // Continue with the original response
                    })
                    .catch(error => {
                        console.warn('Configuration items refresh failed:', error);
                        return data; // Continue with the original response despite config refresh failure
                    });
                }
                
                // Process configuration item changes if GP ID hasn't changed
                const configPromises = [];
                if (!gpChanged && configChanges.length > 0) {
                    // First approach: Get the entity data again to get updated configuration items
                    // This ensures we have the latest state of the entity
                    configPromises.push(
                        fetch(`/api/v2/cis_plan/entity/${this.currentElement.guid}`)
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
                                    return fetch(`/api/v2/cis_plan/entity/${this.currentElement.guid}`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            entity_type: this.currentElement.type,
                                            attributes: {
                                                configurationItems: updatedEntity.configurationItems
                                            }
                                        })
                                    })
                                    .then(resp => resp.json())
                                    .then(result => {
                                        if (result.status !== 'success') {
                                            throw new Error('Failed to update configuration items');
                                        }
                                        
                                        // console.log('Updated multiple configuration items:', changedItems.length);
                                        changedItems.forEach(item => {
                                            // console.log(`- ${item.name}: ${item.oldValue} → ${item.newValue}`);
                                        });
                                        
                                        return result;
                                    });
                                }
                                
                                return { status: 'success', message: 'No configuration changes needed' };
                            })
                    );
                }
                
                // Wait for all updates to complete
                return Promise.all([data, ...configPromises]);
            })
            .then(results => {
                // Hide the modal
                this.hideEditModal();
                
                // Show success message
                this.showSuccessToast(`Successfully updated ${CISUtil2.getEntityTypeName(this.currentElement.type)}`);
                
                // Refresh the UI while maintaining the current selection
                this.refreshAfterEdit(this.currentElement.type, this.currentElement.id, this.currentElement.guid);
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
        
        // Ensure we have a clean type string for logging
        const typeStr = typeof type === 'object' ? (type.type || 'unknown') : String(type);
        
        // Show loading indicator
        this.showLoadingOverlay('Deleting...');
        
        // Add a safety timeout to prevent infinite loading state
        const loadingTimeout = setTimeout(() => {
            console.warn('Delete operation timed out after 20 seconds');
            this.hideLoadingOverlay();
            this.hideDeleteModal();
            this.refreshInProgress = false;
        }, 20000); // 20 second timeout
        
        // For delete, we need to determine the parent to select after deletion
        let parentType = null;
        let parentId = null;
        let parentGuid = null;
        
        // Track if we found a valid parent
        let foundValidParent = false;
        
        // Determine the parent to select after deletion
        if (parentPath) {
            // Find the immediate parent type
            const parentTypes = Object.keys(parentPath).filter(key => key !== typeStr);
            if (parentTypes.length > 0) {
                // Get the last parent in the hierarchy
                const immediateParentType = parentTypes[parentTypes.length - 1];
                const immediateParent = parentPath[immediateParentType];
                
                if (immediateParent) {
                    // IMPORTANT: Make sure the parent isn't the same as the node being deleted
                    // This can happen when copying and deleting elements
                    const possibleParentGuid = immediateParent.guid;
                    
                    if (possibleParentGuid && possibleParentGuid !== guid) {
                        parentType = immediateParentType;
                        parentId = immediateParent.id || immediateParent.gpid || immediateParent.spId;
                        parentGuid = possibleParentGuid;
                        foundValidParent = true;
                    } else {
                        // If parent is same as element being deleted, try to find a grandparent
                        if (parentTypes.length > 1) {
                            const grandparentType = parentTypes[parentTypes.length - 2];
                            const grandparent = parentPath[grandparentType];
                            
                            if (grandparent && grandparent.guid !== guid) {
                                parentType = grandparentType;
                                parentId = grandparent.id || grandparent.gpid || grandparent.spId;
                                parentGuid = grandparent.guid;
                                foundValidParent = true;
                            }
                        }
                    }
                }
            }
        }
        
        // If no parent found or parent is invalid, default to CIS Plan root
        if (!foundValidParent) {
            parentType = 'cisplan';
            parentId = null;
            parentGuid = null;
        }
        
        // Log what we're doing for debugging
        // console.log(`Deleting element: type=${typeStr}, id=${id}, guid=${guid}, name=${name}`);
        // console.log(`Will select parent after deletion: type=${parentType}, id=${parentId}, guid=${parentGuid}`);
        
        // Call the API to delete the entity
        CISApi2.deleteEntity(guid)
            .then(success => {
                // Clear the safety timeout since operation completed
                clearTimeout(loadingTimeout);
                
                if (!success) {
                    throw new Error('Failed to delete entity');
                }
                
                // Hide the modal
                this.hideDeleteModal();
                
                // Show success message
                this.showSuccessToast(`Successfully deleted ${CISUtil2.getEntityTypeName(typeStr)}: ${name}`);
                
                // Refresh the UI and select the parent
                this.refreshAfterDelete(parentType, parentId, parentGuid);
            })
            .catch(error => {
                // Clear the safety timeout since operation completed
                clearTimeout(loadingTimeout);
                
                console.error('Error deleting entity:', error);
                this.showErrorToast(`Failed to delete: ${error.message}`);
                
                // Hide loading overlay and modal
                this.hideLoadingOverlay();
                this.hideDeleteModal();
                
                // Reset any flags
                this.refreshInProgress = false;
            });
    },
    
    /**
     * Force reset any loading state and modals
     * This is a safety measure to ensure the UI isn't left in a loading state
     */
    forceResetUIState: function() {
        // console.log('Force resetting UI state to ensure clean state');
        
        // Hide all modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        
        // Remove any loading overlays
        const overlays = document.querySelectorAll('#loading-overlay, .modal-backdrop, .loading-overlay');
        overlays.forEach(overlay => {
            overlay.remove();
        });
        
        // Reset state flags
        this.refreshInProgress = false;
        
        // Clear any pending timeout
        if (this._pendingTimeouts) {
            this._pendingTimeouts.forEach(timeout => clearTimeout(timeout));
            this._pendingTimeouts = [];
        }
    },
    
    // Track pending timeouts
    _pendingTimeouts: [],
    
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
        
        // Set a backup timeout to clear loading overlay after 15 seconds
        // This prevents UI from being permanently stuck in loading state
        if (!this._pendingTimeouts) this._pendingTimeouts = [];
        const timeout = setTimeout(() => {
            console.warn('Loading overlay timeout triggered after 15 seconds');
            this.hideLoadingOverlay();
            this.forceResetUIState();
        }, 15000);
        
        this._pendingTimeouts.push(timeout);
    },
    
    /**
     * Hide the loading overlay
     */
    hideLoadingOverlay: function() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
        
        // Also remove any modal backdrops that might be lingering
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.remove();
        });
    },
    
    /**
     * Refresh the UI after editing an element
     * @param {string} elementType - Type of the edited element
     * @param {string} elementId - ID of the edited element
     * @param {string} elementGuid - GUID of the edited element
     */
    refreshAfterEdit: function(elementType, elementId, elementGuid) {
        // Guard against multiple refresh calls
        if (this.refreshInProgress) {
            console.warn("Refresh already in progress, ignoring additional refresh request");
            return;
        }
        
        this.refreshInProgress = true;
        // console.log(`Starting UI refresh after editing element: type=${elementType}, id=${elementId}, guid=${elementGuid}`);
        
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
                            // console.log(`Tree rendered, now selecting edited node: ${elementType}/${elementId}`);
                            this.selectNodeAfterRefresh(elementType, elementId, elementGuid);
                            this.hideLoadingOverlay();
                            
                            // Reset refresh flag
                            setTimeout(() => {
                                this.refreshInProgress = false;
                            }, 300);
                        }, 300); // Wait for tree to fully render
                    } else {
                        console.error('Failed to refresh CIS Plan data');
                        this.showErrorToast('Failed to refresh data after editing element');
                        this.hideLoadingOverlay();
                        this.refreshInProgress = false;
                    }
                })
                .catch(error => {
                    console.error('Error refreshing CIS Plan data:', error);
                    this.showErrorToast('Error refreshing data: ' + error.message);
                    this.hideLoadingOverlay();
                    this.refreshInProgress = false;
                });
        } else {
            this.hideLoadingOverlay();
            this.refreshInProgress = false;
        }
    },
    
    // Flag to track refresh operations in progress
    refreshInProgress: false,
    
    /**
     * Refresh the UI after deleting an element
     * @param {string} parentType - Type of the parent element to select
     * @param {string} parentId - ID of the parent element to select
     * @param {string} parentGuid - GUID of the parent element to select
     */
    refreshAfterDelete: function(parentType, parentId, parentGuid) {
        // Guard against multiple refresh calls
        if (this.refreshInProgress) {
            console.warn("Refresh already in progress, ignoring additional refresh request");
            return;
        }
        
        this.refreshInProgress = true;
        // console.log(`Starting UI refresh after deletion. Will select parent: type=${parentType}, id=${parentId}, guid=${parentGuid}`);
        
        // Add a safety timeout to ensure refreshInProgress is eventually reset
        const refreshTimeout = setTimeout(() => {
            console.warn('Refresh operation timed out after 30 seconds');
            this.hideLoadingOverlay();
            this.refreshInProgress = false;
            this.forceResetUIState();
        }, 30000); // 30 second timeout
        
        // Use similar approach to refreshAfterEdit but select the parent
        if (CISTree2) {
            // We want to maintain expanded nodes state during refresh
            const expandedNodesState = new Set(CISTree2.expandedNodes);
            
            // Log the number of expanded nodes (not the entire array which may be causing loops)
            // console.log(`Preserving ${expandedNodesState.size} expanded nodes during refresh`);
            
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
                            clearTimeout(refreshTimeout); // Clear the safety timeout
                            
                            // console.log(`Tree rendered, now selecting parent node: ${parentType}/${parentId}`);
                            
                            // Attempt to select the parent node
                            const nodeSelected = this.selectNodeAfterRefresh(parentType, parentId, parentGuid);
                            
                            // If node selection failed, select root node as fallback
                            if (!nodeSelected && parentType !== 'cisplan') {
                                // console.log("Failed to select parent node, falling back to root");
                                this.selectNodeAfterRefresh('cisplan', null, null);
                            }
                            
                            this.hideLoadingOverlay();
                            
                            // Make absolutely sure all loading states are cleared
                            setTimeout(() => {
                                this.forceResetUIState();
                            }, 500);
                            
                            // IMPROVEMENT: After a delete operation, we should check if we need to render elements explicitly
                            // This is necessary when deleting the last child element in a branch
                            setTimeout(() => {
                                // Reset the refresh in progress flag
                                this.refreshInProgress = false;
                                
                                // If no elements are being displayed (e.g., after deleting the last child element),
                                // explicitly trigger a rendering of the parent's elements
                                const detailsContainer = document.querySelector('#cis-details-container');
                                if (detailsContainer && 
                                    (!detailsContainer.children || detailsContainer.children.length === 0 || 
                                     detailsContainer.style.display === 'none' || 
                                     detailsContainer.innerHTML.trim() === '')) {
                                    
                                    // console.log('No elements shown after delete, rendering parent elements explicitly');
                                    
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
                                        }
                                    }
                                }
                            }, 300);
                        }, 300); // Wait for tree to fully render
                    } else {
                        console.error('Failed to refresh CIS Plan data');
                        this.showErrorToast('Failed to refresh data after deleting element');
                        this.hideLoadingOverlay();
                        clearTimeout(refreshTimeout);
                        this.refreshInProgress = false;
                        this.forceResetUIState();
                    }
                })
                .catch(error => {
                    clearTimeout(refreshTimeout);
                    console.error('Error refreshing CIS Plan data:', error);
                    this.showErrorToast('Error refreshing data: ' + error.message);
                    this.hideLoadingOverlay();
                    this.refreshInProgress = false;
                    this.forceResetUIState();
                });
        } else {
            clearTimeout(refreshTimeout);
            this.hideLoadingOverlay();
            this.refreshInProgress = false;
            this.forceResetUIState();
        }
    },
    
    /**
     * Select a node in the tree after refresh
     * @param {string} nodeType - Type of the node to select
     * @param {string} nodeId - ID of the node to select
     * @param {string} nodeGuid - GUID of the node to select
     * @returns {boolean} Whether selection was successful
     */
    selectNodeAfterRefresh: function(nodeType, nodeId, nodeGuid) {
        // console.log(`Attempting to select node after refresh: type=${nodeType}, id=${nodeId}, guid=${nodeGuid}`);
        
        // Simple guard to prevent excessive logging
        if (!nodeType && !nodeId && !nodeGuid) {
            console.warn('No node identifiers provided for selection');
            return false;
        }
        
        // Log the current expanded nodes state - but only the count, not the full set
        if (CISTree2 && CISTree2.expandedNodes) {
            // console.log(`Current expanded nodes count: ${CISTree2.expandedNodes.size}`);
        }
        
        try {
            // Try to select node by GUID first (most reliable)
            if (nodeGuid && CISTree2 && CISTree2.selectNodeByGuid) {
                const selected = CISTree2.selectNodeByGuid(nodeGuid);
                if (selected) {
                    // console.log(`Successfully selected node by GUID: ${nodeGuid}`);
                    return true;
                } else {
                    console.warn(`Failed to select node by GUID: ${nodeGuid}`);
                }
            }
            
            // Then try by type and ID
            if (nodeType && nodeId && CISTree2 && CISTree2.selectNodeByTypeAndId) {
                const selected = CISTree2.selectNodeByTypeAndId(nodeType, nodeId);
                if (selected) {
                    // console.log(`Successfully selected node by type and ID: ${nodeType}/${nodeId}`);
                    return true;
                } else {
                    console.warn(`Failed to select node by type and ID: ${nodeType}/${nodeId}`);
                }
            }
            
            // If all else fails, just select the root
            if (nodeType === 'cisplan' || !nodeType) {
                const rootNode = document.querySelector('.tree-node[data-type="cisplan"]');
                if (rootNode && CISTree2 && CISTree2.selectTreeNode) {
                    // console.log('Selecting root node as fallback');
                    CISTree2.selectTreeNode(rootNode);
                    
                    // Use a custom event rather than click which might cause side effects
                    const detail = { type: 'cisplan', id: null, guid: null, data: CISPlan2.cisPlanData };
                    const event = new CustomEvent('cis:node-selected', { detail });
                    document.dispatchEvent(event);
                    return true;
                } else {
                    console.warn('Root node not found for fallback selection');
                }
            }
        } catch (error) {
            console.error('Error in selectNodeAfterRefresh:', error);
        }
        
        return false;
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
    },
    
    /**
     * Load participants for dropdown
     * @returns {Promise<Array>} Array of participant objects with id and name
     */
    loadParticipants: async function() {
        try {
            // console.log('Loading participants for dropdown...');
            const response = await fetch('/api/participants');
            if (!response.ok) {
                console.error(`Failed to fetch participants: ${response.status} ${response.statusText}`);
                throw new Error(`Failed to fetch participants: ${response.statusText}`);
            }
            
            const result = await response.json();
            // console.log('Participants API response status:', result.status);
            
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
                
                // console.log(`Processed ${participants.length} participants for dropdown`);
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
     * Load all available services
     * @returns {Promise<Array>} Array of service objects with id and name
     */
    loadAllServices: async function() {
        try {
            // console.log('Loading all services for dropdown...');
            // Try the API endpoint for all services
            const response = await fetch('/api/services/all');
            
            if (!response.ok) {
                // If that fails, try another common endpoint format
                // console.log('First services endpoint failed, trying alternative...');
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
        
        // console.log(`Loaded ${formattedServices.length} services for dropdown`);
        return formattedServices;
    },
    
    /**
     * Load GPs for a specific service
     * @param {string} serviceId - Service ID to get GPs for
     * @returns {Promise<Array>} Array of GP IDs
     */
    loadServiceGPs: async function(serviceId) {
        try {
            // console.log(`Loading GPs for service ${serviceId}...`);
            // Try the endpoint specified by the user
            const response = await fetch(`/api/services/${serviceId}/all_gps`);
            
            if (!response.ok) {
                // If that fails, try alternative endpoints
                // console.log('First GP endpoint failed, trying alternatives...');
                
                // Try other potential endpoint formats
                const alternatives = [
                    `/api/services/${serviceId}/gps/all`,
                    `/api/services/${serviceId}/gps`,
                    `/api/services/${serviceId}/gp_ids`
                ];
                
                for (const alt of alternatives) {
                    try {
                        // console.log(`Trying alternative endpoint: ${alt}`);
                        const altResponse = await fetch(alt);
                        if (altResponse.ok) {
                            // console.log(`Alternative endpoint ${alt} succeeded`);
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
        
        // console.log('Processing GP response:', result);
        
        // Handle different API response formats
        if (result.success && result.gp_ids) {
            // Format from manually added selection: {success: true, gp_ids: [...]}
            gpIds = result.gp_ids;
            // console.log('Found GP IDs in success/gp_ids format');
        } else if (result.status === 'success' && result.data) {
            // Common format: {status: 'success', data: [...]}
            // console.log('Found GP IDs in status/data format');
            if (Array.isArray(result.data)) {
                gpIds = result.data.map(gp => gp.id || gp.gpId || gp);
            } else {
                gpIds = Object.keys(result.data);
            }
        } else if (Array.isArray(result)) {
            // Format: Direct array of GP IDs or objects
            // console.log('Found GP IDs in direct array format');
            gpIds = result.map(gp => typeof gp === 'object' ? (gp.id || gp.gpId) : gp);
        } else if (result.gps && Array.isArray(result.gps)) {
            // Format: {gps: [...]}
            // console.log('Found GP IDs in gps array format');
            gpIds = result.gps.map(gp => typeof gp === 'object' ? (gp.id || gp.gpId) : gp);
        } else {
            // Try to find any array property that might contain GP IDs
            const arrayProps = Object.keys(result).filter(key => Array.isArray(result[key]));
            if (arrayProps.length > 0) {
                // console.log(`Found potential GP arrays in properties: ${arrayProps.join(', ')}`);
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
        
        // console.log(`Successfully processed ${gpIds.length} GPs:`, gpIds.slice(0, 5));
        return gpIds;
    },
    
    /**
     * Get GP name by ID
     * @param {string} gpId - GP ID to get name for
     * @returns {Promise<string>} GP name
     */
    getGPName: async function(gpId) {
        try {
            // console.log(`Getting name for GP ${gpId}...`);
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

// Initialize the component when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    CISEditDialogs2.init();
}); 