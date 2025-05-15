/**
 * CIS Plan Form Utilities
 * 
 * Shared utilities for form generation across CIS Plan 2.0 components.
 * This handles the generation of form fields for different entity types
 * in both add and edit modes.
 */

const CISFormUtils = {
    /**
     * Generate a form for the specified entity type
     * @param {string} entityType - The entity type
     * @param {Object} entityData - The entity data (can be empty/null for add mode)
     * @param {string} mode - The form mode ('add' or 'edit')
     * @param {string} randomSuffix - Random suffix for field IDs to prevent autocomplete
     * @returns {HTMLFormElement} The generated form element
     */
    generateEntityForm: function(entityType, entityData, mode = 'add', randomSuffix = null) {
        // Generate a random suffix if not provided
        if (!randomSuffix) {
            randomSuffix = Math.random().toString(36).substring(2, 8);
        }
        
        // Create the form element
        const form = document.createElement('form');
        form.id = mode === 'add' ? 'add-entity-form' : 'entity-edit-form';
        form.className = 'needs-validation';
        form.setAttribute('autocomplete', 'off'); // Disable autocomplete at the form level
        
        // Default values
        const values = entityData || {};
        const isEditMode = mode === 'edit';
        
        // Create different form fields based on entity type
        let formContent = '';
        
        switch(entityType) {
            case 'mission_network':
                formContent = `
                    <div class="form-group">
                        <label for="name_${randomSuffix}">Name</label>
                        <input type="text" class="form-control" id="name_${randomSuffix}" name="name" 
                            value="${values.name || ''}" 
                            placeholder="Enter mission network name" required autocomplete="new-password">
                    </div>
                `;
                break;
            
            case 'network_segment':
                formContent = `
                    <div class="form-group">
                        <label for="name_${randomSuffix}">Name</label>
                        <input type="text" class="form-control" id="name_${randomSuffix}" name="name" 
                            value="${values.name || ''}" 
                            placeholder="Enter network segment name" required autocomplete="new-password">
                    </div>
                `;
                break;
            
            case 'security_domain':
                // For security domains, we need to fetch available classifications
                if (isEditMode) {
                    // In edit mode, security domain ID is read-only
                    formContent = `
                        <div class="form-group">
                            <label for="id_${randomSuffix}">Security Classification</label>
                            <input type="text" class="form-control" id="id_${randomSuffix}" name="id" 
                                value="${values.id || ''}" readonly autocomplete="new-password">
                            <small class="form-text text-muted">Security domain classification cannot be changed</small>
                        </div>
                    `;
                } else {
                    // In add mode, show dropdown of security classifications
                    formContent = `
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
                    
                    // After form is appended to DOM, the parent component should load classifications
                }
                break;
                
            case 'hw_stack':
                formContent = `
                    <div class="form-group">
                        <label for="name_${randomSuffix}">Name</label>
                        <input type="text" class="form-control" id="name_${randomSuffix}" name="name" 
                            value="${values.name || ''}" 
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
                
                // After form is appended to DOM, the parent component should initialize Select2
                break;
                
            case 'asset':
                formContent = `
                    <div class="form-group">
                        <label for="name_${randomSuffix}">Name</label>
                        <input type="text" class="form-control" id="name_${randomSuffix}" name="name" 
                            value="${values.name || ''}" 
                            placeholder="Enter asset name" required autocomplete="new-password">
                    </div>
                `;
                break;
                
            case 'network_interface':
                formContent = `
                    <div class="form-group">
                        <label for="name_${randomSuffix}">Name</label>
                        <input type="text" class="form-control" id="name_${randomSuffix}" name="name" 
                            value="${values.name || ''}" 
                            placeholder="Enter network interface name" required autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label for="ip_address_${randomSuffix}">IP Address</label>
                        <input type="text" class="form-control" id="ip_address_${randomSuffix}" name="ip_address" 
                            value="${values.ip_address || ''}" 
                            placeholder="E.g., 192.168.1.1" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label for="subnet_${randomSuffix}">Subnet Mask</label>
                        <input type="text" class="form-control" id="subnet_${randomSuffix}" name="subnet" 
                            value="${values.subnet || ''}" 
                            placeholder="E.g., 255.255.255.0" autocomplete="new-password">
                    </div>
                    <div class="form-group">
                        <label for="fqdn_${randomSuffix}">FQDN</label>
                        <input type="text" class="form-control" id="fqdn_${randomSuffix}" name="fqdn" 
                            value="${values.fqdn || ''}" 
                            placeholder="E.g., server.domain.com" autocomplete="new-password">
                    </div>
                `;
                
                // Only add config items section if in edit mode and config items exist
                if (isEditMode && values.configurationItems && values.configurationItems.length > 0) {
                    form.innerHTML = formContent;
                    this.addConfigItemsSection(form, values.configurationItems, randomSuffix);
                    return form;
                }
                break;
                
            case 'gp_instance':
                formContent = `
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
                            value="${values.instanceLabel || ''}" 
                            placeholder="Optional label" autocomplete="new-password">
                    </div>
                `;
                
                // Add warning about changing GP ID in edit mode
                if (isEditMode) {
                    formContent += `
                        <div id="config-items-warning-${randomSuffix}" class="alert alert-warning" style="display: none;">
                            <p><strong>Warning:</strong> Changing the GP ID will replace all configuration items with the default ones for the new GP.</p>
                            <p>Any existing configuration data will be lost.</p>
                        </div>
                    `;
                }
                
                // Only add config items section if in edit mode and config items exist
                if (isEditMode && values.configurationItems && values.configurationItems.length > 0) {
                    form.innerHTML = formContent;
                    this.addConfigItemsSection(form, values.configurationItems, randomSuffix);
                    return form;
                }
                break;
                
            case 'sp_instance':
                // For SP instances, the ID is read-only in edit mode
                const spIdReadOnly = isEditMode ? 'readonly' : '';
                const spIdHelpText = isEditMode ? '<small class="form-text text-muted">SP ID cannot be changed</small>' : '';
                
                formContent = `
                    <div class="form-group">
                        ${isEditMode ? `
                            <label for="spId_${randomSuffix}">SP ID</label>
                            <input type="text" class="form-control" id="spId_${randomSuffix}" name="spId" 
                                value="${values.spId || ''}" ${spIdReadOnly} required
                                placeholder="E.g., SP-0267" autocomplete="new-password">
                            ${spIdHelpText}
                        ` : `
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
                        `}
                    </div>
                    <div class="form-group">
                        <label for="spVersion_${randomSuffix}">SP Version</label>
                        <div class="loading-indicator mb-2" style="${!isEditMode ? 'display:none;' : ''}">
                            <small class="text-muted">Loading versions...</small>
                            <div class="spinner-border spinner-border-sm text-primary" role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                        </div>
                        ${isEditMode ? `
                            <input type="text" class="form-control" id="spVersion_${randomSuffix}" name="spVersion" 
                                value="${values.spVersion || ''}" 
                                placeholder="E.g., 1.0" autocomplete="new-password">
                        ` : `
                            <select class="form-control" id="spVersion_${randomSuffix}" name="spVersion" required disabled>
                                <option value="">First select a Specific Product</option>
                            </select>
                        `}
                    </div>
                `;
                
                // After rendering, we need to initialize the dropdowns
                setTimeout(() => {
                    this.initializeSPFormFields(form, randomSuffix, isEditMode, values);
                }, 100);
                
                break;
                
            default:
                formContent = `
                    <div class="alert alert-warning">
                        <p>Form not implemented for entity type: ${entityType}</p>
                    </div>
                `;
                break;
        }
        
        form.innerHTML = formContent;
        return form;
    },
    
    /**
     * Add configuration items section to a form
     * @param {HTMLFormElement} form - The form element to add to
     * @param {Array} configItems - The array of configuration items
     * @param {string} randomSuffix - Random suffix for field IDs
     */
    addConfigItemsSection: function(form, configItems, randomSuffix) {
        if (!form || !configItems || configItems.length === 0) {
            return;
        }
        
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
        const midPoint = Math.ceil(configItems.length / 2);
        
        // Add items to left column
        configItems.slice(0, midPoint).forEach((item, index) => {
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
        configItems.slice(midPoint).forEach((item, index) => {
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
        if (configItems.length > 15) {
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
            countIndicator.textContent = `Showing all ${configItems.length} configuration items (scroll to view more)`;
            configSection.appendChild(countIndicator);
        }
        
        form.appendChild(configSection);
    },
    
    /**
     * Collect form data from a form element
     * @param {HTMLFormElement} form - The form element to collect data from
     * @param {boolean} includeReadOnly - Whether to include readonly fields
     * @returns {Object} Object containing the form data
     */
    collectFormData: function(form, includeReadOnly = false) {
        if (!form) {
            console.error('Cannot collect data from null form');
            return {};
        }
        
        const formData = {};
        
        // Get all input fields
        const selector = includeReadOnly ? 
            'input:not(.config-item), select:not(.config-item), textarea:not(.config-item)' : 
            'input:not([readonly]):not(.config-item), select:not([readonly]):not(.config-item), textarea:not([readonly]):not(.config-item)';
            
        const inputs = form.querySelectorAll(selector);
        
        inputs.forEach(input => {
            if (input.name) {
                formData[input.name] = input.value;
            }
        });
        
        return formData;
    },
    
    /**
     * Collect configuration item changes from a form
     * @param {HTMLFormElement} form - The form containing config items
     * @returns {Array} Array of configuration item changes
     */
    collectConfigItemChanges: function(form) {
        if (!form) {
            console.error('Cannot collect config items from null form');
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
     * Create a parent info box for add dialog
     * @param {string} parentType - The parent entity type
     * @param {string} parentId - The parent entity ID
     * @param {string} parentGuid - The parent entity GUID (optional)
     * @returns {HTMLElement} The parent info element
     */
    createParentInfoBox: function(parentType, parentId, parentGuid = null) {
        const parentInfo = document.createElement('div');
        parentInfo.className = 'alert alert-info mb-4';
        parentInfo.style.backgroundColor = '#e3f2fd';
        parentInfo.style.border = '1px solid #90caf9';
        parentInfo.style.borderRadius = '4px';
        parentInfo.style.padding = '15px';
        
        // Get type name if utility function is available
        const typeName = typeof CISUtil2 !== 'undefined' && CISUtil2.getEntityTypeName ? 
            CISUtil2.getEntityTypeName(parentType) : parentType;
        
        // Create formatted HTML with proper validation - Clean, minimalistic format
        let infoHTML = `
            <h6 style="font-weight: 500; margin-bottom: 12px;">Parent Information</h6>
            <div style="margin-left: 10px;">
                <p style="margin-bottom: 4px;"><strong>Type:</strong> ${typeName}</p>
                <p style="margin-bottom: 4px;"><strong>ID:</strong> ${parentId}</p>`;
        
        // Display the parent GUID as a smaller text only for debugging purposes
        if (parentGuid) {
            infoHTML += `<p style="margin-bottom: 0; font-size: 0.8rem; color: #666;"><strong>GUID:</strong> ${parentGuid}</p>`;
        }
        
        infoHTML += `</div>`;
        
        parentInfo.innerHTML = infoHTML;
        return parentInfo;
    },
    
    /**
     * Initialize SP form fields
     * @param {HTMLFormElement} form - The form element to initialize
     * @param {string} randomSuffix - Random suffix for field IDs
     * @param {boolean} isEditMode - Whether the form is in edit mode
     * @param {Object} values - The form values
     */
    initializeSPFormFields: function(form, randomSuffix, isEditMode, values) {
        if (isEditMode) {
            // In edit mode we just show the current values as text fields
            return;
        }
        
        // Initialize SP dropdown
        const spIdSelect = form.querySelector(`#spId_${randomSuffix}`);
        const spVersionSelect = form.querySelector(`#spVersion_${randomSuffix}`);
        
        if (!spIdSelect || !spVersionSelect) {
            console.error('SP form fields not found');
            return;
        }
        
        // Check if CISDropdownUtils is available
        if (typeof CISDropdownUtils === 'undefined') {
            console.error('CISDropdownUtils not available. Please include cis_dropdown_utils.js');
            
            const loadingIndicators = form.querySelectorAll('.loading-indicator');
            loadingIndicators.forEach(indicator => {
                indicator.innerHTML = '<div class="text-danger">Dropdown utility not available</div>';
            });
            return;
        }
        
        // Initialize SP dropdown with Select2
        const initializeSpDropdown = async () => {
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
                null,
                // On change handler for SP selection
                function(e) {
                    const selectedSpId = e.target.value;
                    console.log(`Selected SP ID: ${selectedSpId}`);
                    
                    // Reset version dropdown
                    spVersionSelect.innerHTML = '';
                    spVersionSelect.disabled = true;
                    
                    if (!selectedSpId) {
                        $(spVersionSelect).val(null).trigger('change');
                        spVersionSelect.innerHTML = '<option value="">First select a Specific Product</option>';
                        return;
                    }
                    
                    // Show loading indicator for versions
                    const versionLoadingIndicator = form.querySelector(`#spVersion_${randomSuffix}`).closest('.form-group').querySelector('.loading-indicator');
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
                            
                            // Initialize version dropdown
                            spVersionSelect.disabled = false;
                            spVersionSelect.innerHTML = '<option value="">Select Version</option>';
                            
                            versions.forEach(version => {
                                const option = document.createElement('option');
                                option.value = version.id;
                                option.textContent = version.text;
                                spVersionSelect.appendChild(option);
                            });
                            
                            // Use Select2 if available
                            if (typeof jQuery !== 'undefined' && jQuery(spVersionSelect).data('select2')) {
                                jQuery(spVersionSelect).trigger('change');
                            }
                        })
                        .catch(error => {
                            console.error(`Error loading versions for SP ${selectedSpId}:`, error);
                            if (versionLoadingIndicator) {
                                versionLoadingIndicator.innerHTML = '<div class="text-danger">Error loading versions</div>';
                            }
                            
                            // Still enable the dropdown for manual entry
                            spVersionSelect.disabled = false;
                            spVersionSelect.innerHTML = '<option value="">Enter version manually</option>';
                        });
                }
            );
        };
        
        // Initialize version dropdown with Select2
        const initializeVersionDropdown = () => {
            if (typeof jQuery === 'undefined') {
                // Can't use Select2, just set up a basic change event
                return;
            }
            
            const select2Options = {
                placeholder: 'Select Version',
                allowClear: true,
                width: '100%',
                dropdownParent: spVersionSelect.closest('.modal-body')
            };
            
            // Initialize Select2 for version dropdown
            $(spVersionSelect).select2(select2Options);
        };
        
        // Run the initializations
        initializeSpDropdown();
        initializeVersionDropdown();
    }
};

// Export the utilities
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CISFormUtils;
} 