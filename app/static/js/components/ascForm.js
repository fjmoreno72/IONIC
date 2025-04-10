import { UiService } from '../services/uiService.js'; // Correct import path
import { DialogManager } from './dialogManager.js'; // Import DialogManager for sub-dialog
import { GpSpEditForm } from './gpSpEditForm.js'; // Import the new form

export class AscForm {
    constructor(config = {}) {
        this.data = config.data || null; // For edit mode later
        this.onSubmit = config.onSubmit || null;
        this.onCancel = config.onCancel || null; // Not used yet, but good practice
        this.onDelete = config.onDelete || null; // For edit mode later
        this.element = null;
        this.formElement = null;
        this.isEditMode = !!this.data;

        // Data fetched from API
        this.formData = {
            affiliates: [],
            services: []
        };

        // DOM elements for easy access
        this.affiliateSelect = null;
        this.environmentSelect = null;
        this.serviceSelect = null;
        this.modelDisplay = null; // Element to show the model
        this.gpInstancesContainer = null; // Container for GP instances list
        this.ascScoreDisplay = null; // Element to display ASC score
        this.addGpSelect = null; // Dropdown to select which GP to add
        this.addGpButton = null; // Button to trigger adding the selected GP


        // Store fetched data for lookups
        this.allServices = [];
        this.allGps = []; // Store all GPs for name lookup
        this.allSps = [];

        // Dialog manager for the GP/SP editing sub-dialog
        this.gpSpEditDialog = null; // Keep track, but create new instance each time

        this.createForm();
        this.fetchFormData(); // Fetch data after creating the basic form structure
    }

    async fetchFormData() {
        try {
            const response = await fetch('/api/asc_form_data');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const fetchedData = await response.json();
            this.formData = fetchedData; // Keep original structure for dropdowns
            this.allServices = fetchedData.services || [];
            this.allSps = fetchedData.sps || [];
            this.allGps = fetchedData.gps || []; // Store GPs

            console.log("ASC Form Data fetched:", this.formData); // Debugging

            this.populateAffiliateDropdown();
            this.populateServiceDropdown();

            // If in edit mode, set values *after* dropdowns are populated
            if (this.isEditMode && this.data) {
                 // Ensure dropdowns are ready before setting values
                await this.waitForElement(this.affiliateSelect, opt => opt.length > 1);
                await this.waitForElement(this.serviceSelect, opt => opt.length > 1);
                this.setValues(this.data);
                this.renderGpInstances(); // Render GP instances in edit mode
                this.updateAscScoreDisplay(); // Initial ASC score calculation and display
                this.populateAddGpDropdown(); // Populate the Add GP dropdown
            }
        } catch (error) {
            console.error("Error fetching ASC form data:", error);
            UiService.showNotification("Error loading form data. Please try again.", "danger"); // Use UiService
            // Optionally disable the form or show an error message within the form
        }
    }

    createForm() {
        this.element = document.createElement('div');
        this.formElement = document.createElement('form');
        this.formElement.noValidate = true;
        this.formElement.id = 'ascForm'; // Add an ID for potential targeting

        // Basic structure - with more compact layout using Bootstrap grid
        this.formElement.innerHTML = `
            ${this.isEditMode ? `
            <!-- ASC Score displayed prominently at the top in edit mode -->
            <div class="mb-3 d-flex align-items-center">
                <h5 class="mb-0 me-2">ASC Score:</h5>
                <span class="badge p-2 fs-6" style="background-color: ${this.getScoreColor(this.data?.ascScore || '0')}; color: white;" id="ascOverallScore">${this.data?.ascScore || '0%'}</span>
            </div>
            <hr class="mt-2 mb-3">
            ` : ''}
            
            
            <!-- Two-column layout for form fields -->
            <div class="row">
                <!-- First column -->
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="ascAffiliate" class="form-label">Affiliate (Nation)</label>
                        <select class="form-select" id="ascAffiliate" required ${this.isEditMode ? 'disabled' : ''}>
                            <option value="" selected disabled>Loading affiliates...</option>
                        </select>
                        <div class="invalid-feedback">Please select an affiliate.</div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="ascService" class="form-label">Service</label>
                        <select class="form-select" id="ascService" required ${this.isEditMode ? 'disabled' : ''}>
                            <option value="" selected disabled>Loading services...</option>
                        </select>
                        <div class="invalid-feedback">Please select a service.</div>
                    </div>
                </div>
                
                <!-- Second column -->
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="ascEnvironment" class="form-label">Environment</label>
                        <select class="form-select" id="ascEnvironment" required ${this.isEditMode ? 'disabled' : ''}>
                            <option value="" selected disabled>Select an affiliate first</option>
                        </select>
                        <div class="invalid-feedback">Please select an environment.</div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="ascModel" class="form-label">Model</label>
                        <select class="form-select" id="ascModel" required ${this.isEditMode ? 'disabled' : ''}>
                            <option value="" selected disabled>Select a service first</option>
                        </select>
                        <div class="invalid-feedback">Please select a model.</div>
                    </div>
                </div>
            </div>


            <!-- Section for GP Instances (only shown in edit mode) -->
            ${this.isEditMode ? `
            <hr>
            <h5>GP Instances</h5>
            <div id="gpInstancesContainer" class="mb-3">
                <!-- GP instances will be rendered here -->
                <p>Loading GP instances...</p>
            </div>
             <div class="row g-2 mb-3"> <!-- Add GP Controls -->
                 <div class="col-sm-8">
                    <label for="addGpSelect" class="visually-hidden">Select GP to Add</label>
                    <select id="addGpSelect" class="form-select form-select-sm">
                        <option value="" selected disabled>Select GP type to add...</option>
                        <!-- Options populated dynamically -->
                    </select>
                 </div>
                 <div class="col-sm-4">
                    <button type="button" id="addGpInstanceButton" class="btn btn-outline-success btn-sm w-100">
                        <i class="fas fa-plus me-1"></i> Add Selected GP
                    </button>
                 </div>
             </div>
            <hr>
            ` : ''}
        `;

        this.element.appendChild(this.formElement);

        // Store references to select elements
        this.affiliateSelect = this.formElement.querySelector('#ascAffiliate');
        this.environmentSelect = this.formElement.querySelector('#ascEnvironment');
        this.serviceSelect = this.formElement.querySelector('#ascService');
        this.modelDisplay = this.formElement.querySelector('#ascModel');
        this.gpInstancesContainer = this.formElement.querySelector('#gpInstancesContainer');
        this.ascScoreDisplay = this.formElement.querySelector('#ascOverallScore');
        this.addGpSelect = this.formElement.querySelector('#addGpSelect'); // Get Add GP dropdown
        this.addGpButton = this.formElement.querySelector('#addGpInstanceButton'); // Get Add GP button


        // Add event listeners
        this.setupEventListeners();

        // Add delete button at the bottom of form if in edit mode
        if (this.isEditMode && this.data?.id) {
            this.addDeleteButton();
        }
    }

    populateAffiliateDropdown() {
        if (!this.affiliateSelect) return;
        this.affiliateSelect.innerHTML = '<option value="" selected disabled>Select an affiliate...</option>'; // Reset

        // Sort affiliates by name
        const sortedAffiliates = [...this.formData.affiliates].sort((a, b) => a.name.localeCompare(b.name));

        sortedAffiliates.forEach(affiliate => {
            const option = document.createElement('option');
            option.value = affiliate.id;
            option.textContent = affiliate.name;
            this.affiliateSelect.appendChild(option);
        });
    }

    populateEnvironmentDropdown(selectedAffiliateId) {
        if (!this.environmentSelect || !selectedAffiliateId) return;

        const selectedAffiliate = this.formData.affiliates.find(aff => aff.id === selectedAffiliateId);
        const environments = selectedAffiliate ? selectedAffiliate.environments || [] : [];

        this.environmentSelect.innerHTML = '<option value="" selected disabled>Select an environment...</option>'; // Reset

        if (environments.length > 0) {
            environments.sort().forEach(env => {
                const option = document.createElement('option');
                option.value = env;
                option.textContent = env;
                this.environmentSelect.appendChild(option);
            });
            this.environmentSelect.disabled = false;

            // Preselect if only one environment
            if (environments.length === 1) {
                this.environmentSelect.value = environments[0];
                // Trigger change event manually if needed for validation styling
                this.environmentSelect.dispatchEvent(new Event('change'));
            }
        } else {
            this.environmentSelect.innerHTML = '<option value="" selected disabled>No environments available</option>';
            this.environmentSelect.disabled = true;
        }
    }

    populateServiceDropdown() {
        if (!this.serviceSelect) return;
        this.serviceSelect.innerHTML = '<option value="" selected disabled>Select a service...</option>'; // Reset

        // Sort services by name
        const sortedServices = [...this.formData.services].sort((a, b) => a.name.localeCompare(b.name));

        sortedServices.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            this.serviceSelect.appendChild(option);
        });
    }

    updateModelSelect(selectedServiceId) {
        const modelSelect = document.getElementById('ascModel');
        
        // If in edit mode, just display the current model name and disable the select
        if (this.isEditMode && this.data?.model) {
            // Find the model name from the model ID
            const modelName = this.formData.models?.find(m => m.id === this.data.model)?.name || this.data.model;
            
            // Create a single option with the current model
            modelSelect.innerHTML = `<option value="${this.data.model}" selected>${modelName}</option>`;
            modelSelect.disabled = true;
            return;
        }
        
        // For create mode
        if (!modelSelect || !selectedServiceId) {
            // Clear and disable the model select
            modelSelect.innerHTML = '<option value="" selected disabled>Select a service first</option>';
            modelSelect.disabled = true;
            return;
        }

        // Get the selected service
        const selectedService = this.formData.services.find(srv => srv.id === selectedServiceId);
        if (!selectedService) {
            modelSelect.innerHTML = '<option value="" selected disabled>Service not found</option>';
            modelSelect.disabled = true;
            return;
        }

        // Check if models data is loaded
        if (!this.formData.models || !Array.isArray(this.formData.models)) {
            console.log("Models data not loaded yet, attempting to load...");
            modelSelect.innerHTML = '<option value="" selected disabled>Loading models...</option>';
            modelSelect.disabled = true;
            
            // Load models data then update the dropdown
            this.loadModelsData().then(() => {
                // After models are loaded, call this method again with the same service ID
                if (this.formData.models && Array.isArray(this.formData.models)) {
                    this.updateModelSelect(selectedServiceId);
                }
            });
            return;
        }

        // Get all models associated with this service - support new structure
        let serviceModels = [];
        
        // New service model structure includes a 'models' array
        if (Array.isArray(selectedService.models) && selectedService.models.length > 0) {
            serviceModels = selectedService.models;
        } 
        // Legacy structure might have 'spiral' or 'model' property
        else if (selectedService.spiral) {
            serviceModels = [selectedService.spiral];
        } else if (selectedService.model) {
            serviceModels = [selectedService.model];
        }
        
        // Enable the select and populate options
        modelSelect.disabled = false;
        modelSelect.innerHTML = '<option value="" selected disabled>Select a model...</option>';
        
        let hasValidModels = false;
        
        serviceModels.forEach(modelId => {
            if (!modelId) return;
            const model = this.formData.models.find(m => m.id === modelId);
            if (model) {
                hasValidModels = true;
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.name;
                modelSelect.appendChild(option);
            }
        });

        // If no valid models found, show an error message
        if (!hasValidModels) {
            modelSelect.innerHTML = '<option value="" selected disabled>No models available</option>';
            modelSelect.disabled = true;
            return;
        }

        // If there's only one model, select it automatically
        if (serviceModels.length === 1) {
            modelSelect.value = serviceModels[0];
            // Dispatch change event to trigger any dependent UI updates
            modelSelect.dispatchEvent(new Event('change'));
        }
    }

    populateAddGpDropdown() {
        if (!this.isEditMode || !this.addGpSelect || !this.data?.serviceId || !this.data?.model) return;

        const serviceInfo = this.allServices.find(s => s.id === this.data.serviceId);
        if (!serviceInfo) {
            console.error('Service not found:', this.data.serviceId);
            return;
        }

        // Handle the new service structure where gps is an array of objects with id and models properties
        let allowedGpIds = [];
        
        // Check if gps is an array of objects (new structure) or simple array of strings (old structure)
        if (serviceInfo.gps && Array.isArray(serviceInfo.gps)) {
            if (serviceInfo.gps.length > 0 && typeof serviceInfo.gps[0] === 'object') {
                // New structure: filter GPs that support the selected model
                allowedGpIds = serviceInfo.gps
                    .filter(gp => gp.models && gp.models.includes(this.data.model))
                    .map(gp => gp.id);
            } else {
                // Old structure (array of strings)
                allowedGpIds = serviceInfo.gps;
            }
        }

        this.addGpSelect.innerHTML = '<option value="" selected disabled>Select GP type to add...</option>';

        if (allowedGpIds.length === 0) {
            this.addGpSelect.disabled = true;
            if (this.addGpButton) this.addGpButton.disabled = true;
            this.addGpSelect.innerHTML = '<option value="" selected disabled>No GPs defined for this service/model</option>';
            return;
        }

        // Filter allGps to get only allowed ones and sort by name
        const allowedGps = this.allGps
            .filter(gp => allowedGpIds.includes(gp.id))
            .sort((a, b) => a.name.localeCompare(b.name));

        // Create a special selectbox that shows icons - without jQuery or Select2
        // First clear any existing options
        this.addGpSelect.innerHTML = '<option value="" selected disabled>Select GP type to add...</option>';
        
        // For each allowed GP
        allowedGps.forEach(gp => {
            const option = document.createElement('option');
            option.value = gp.id;
            
            // Use a prefix to indicate GPs with icons
            // The prefix won't be visible but helps us identify options with icons in our custom rendering
            const hasIcon = gp.iconPath && gp.iconPath.trim() !== '';
            option.textContent = gp.name;
            
            // Store icon path in a data attribute for potential future use
            if (hasIcon) {
                option.dataset.iconPath = `/static/ASC/${gp.iconPath.replace('./', '')}`;
            }
            
            this.addGpSelect.appendChild(option);
        });

        this.addGpSelect.disabled = false;
        if (this.addGpButton) this.addGpButton.disabled = false;
    }


    setupEventListeners() {
        // Handle form submission within the component
        this.formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Update Environments when Affiliate changes
        this.affiliateSelect.addEventListener('change', (e) => {
            const selectedAffiliateId = e.target.value;
            this.populateEnvironmentDropdown(selectedAffiliateId);
            // Reset service/model if affiliate changes? Maybe not necessary.
        });

        // Update model display when Service changes
        this.serviceSelect.addEventListener('change', (e) => {
            const selectedServiceId = e.target.value;
            this.updateModelSelect(selectedServiceId);
            // In edit mode, changing service is disabled, but if it were enabled,
            // we'd need to repopulate the Add GP dropdown here.
            // if (this.isEditMode) this.populateAddGpDropdown();
        });
        
        // Setup listener for model selection changes (to auto-populate GPs in new mode)
        const modelSelect = document.getElementById('ascModel');
        if (modelSelect) {
            modelSelect.addEventListener('change', (e) => {
                const selectedModelId = e.target.value;
                if (selectedModelId && !this.isEditMode) {
                    // Auto-populate GP instances for new ASCs based on model
                    this.setupInitialGpInstances(selectedModelId);
                }
            });
        }

        // Add GP button listener (only exists in edit mode)
        if (this.isEditMode && this.addGpButton) {
            this.addGpButton.addEventListener('click', () => {
                this.handleAddGpInstance();
            });
        }
        
        // Delete ASC button (only in edit mode)
        if (this.isEditMode) {
            const deleteButton = this.formElement.querySelector('#deleteAscButton');
            if (deleteButton && this.onDelete) {
                deleteButton.addEventListener('click', () => {
                    // Confirm deletion with a browser dialog
                    if (confirm(`Are you sure you want to delete ASC ${this.data.id}? This action cannot be undone.`)) {
                        // Call the onDelete callback with the ASC ID
                        this.onDelete(this.data.id);
                    }
                });
            }
        }
    }

    setValues(data) {
        // Implementation for edit mode (populate fields based on existing ASC data)
        // This needs to happen *after* fetchFormData completes.
        // console.warn("setValues called - Edit mode not fully implemented yet."); // Removed warning
        if (!this.data) return; // Should not happen if called correctly

        console.log("Setting values for edit:", this.data);

        // Set Affiliate and trigger environment population
        if (this.affiliateSelect) {
            this.affiliateSelect.value = this.data.affiliateId || '';
            this.populateEnvironmentDropdown(this.data.affiliateId); // Populate environments based on loaded data
        }

        // Set Environment: Only attempt to set the value if the dropdown is enabled after population.
        if (this.environmentSelect && !this.environmentSelect.disabled) {
            // We still use waitForElement because even if synchronous, DOM updates might lag slightly.
            // The condition now only needs to ensure options are present, as we already know it's not disabled.
            this.waitForElement(this.environmentSelect, sel => sel.options.length > 1)
                .then(() => {
                    if (this.environmentSelect) { // Double-check element exists
                       this.environmentSelect.value = this.data.environment || '';
                    }
                })
                .catch(err => console.error("Error setting environment value (was enabled):", err));
        } else if (this.environmentSelect && this.environmentSelect.disabled) {
             console.log("Environment dropdown is disabled, likely no environments for this affiliate. Skipping setting value.");
        }


        // Set Service and trigger model update
        if (this.serviceSelect) {
            this.serviceSelect.value = this.data.serviceId || '';
        }
        
        // Set Model value directly for edit mode
        const modelSelect = document.getElementById('ascModel');
        if (modelSelect && this.isEditMode && this.data?.model) {
            // Get the model name and display it
            const modelName = this.getModelName(this.data.model);
            modelSelect.innerHTML = `<option value="${this.data.model}" selected>${modelName}</option>`;
            modelSelect.disabled = true;
        } else if (modelSelect && this.data?.serviceId) {
            // For create mode or if we need to populate the dropdown
            if (this.formData.models && this.formData.models.length > 0) {
                this.updateModelSelect(this.data.serviceId);
            } else {
                console.log("Models data not loaded yet, will check again shortly");
                setTimeout(() => {
                    if (this.formData.models && this.formData.models.length > 0) {
                        this.updateModelSelect(this.data.serviceId);
                    } else {
                        console.error("Models data still not available after delay");
                    }
                }, 500);
            }
        }

        // Disable fields that shouldn't be changed in edit mode
        if (this.isEditMode) {
            if (this.affiliateSelect) this.affiliateSelect.disabled = true;
            if (this.environmentSelect) this.environmentSelect.disabled = true; // Also disable environment as it depends on affiliate
            if (this.serviceSelect) this.serviceSelect.disabled = true;
            // model is already disabled

            // Set ASC Score (already added to innerHTML, just ensure value is correct if data changes later)
             this.updateAscScoreDisplay(); // Update display initially
        }
    }

     // Helper to wait for an element's condition (e.g., options loaded)
    async waitForElement(selectorOrElement, conditionFn, timeout = 3000) {
        const element = typeof selectorOrElement === 'string' ? document.querySelector(selectorOrElement) : selectorOrElement;
        if (!element) return Promise.reject("Element not found");

        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const interval = setInterval(() => {
                if (conditionFn(element)) {
                    clearInterval(interval);
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(interval);
                    reject(`Timeout waiting for condition on element ${element.id || element.tagName}`);
                }
            }, 100); // Check every 100ms
        });
    }


    renderGpInstances() {
        if (!this.isEditMode || !this.gpInstancesContainer || !this.data?.gpInstances) {
            if (this.gpInstancesContainer) this.gpInstancesContainer.innerHTML = '<p>No GP instances defined.</p>';
            return;
        }

        this.gpInstancesContainer.innerHTML = ''; // Clear loading/previous content

        if (this.data.gpInstances.length === 0) {
             this.gpInstancesContainer.innerHTML = '<p>No GP instances defined for this service.</p>';
             return;
        }

        const listGroup = document.createElement('ul');
        listGroup.className = 'list-group list-group-flush'; // Use flush for tighter spacing

        this.data.gpInstances.forEach((gpInstance, index) => {
            // Handle case where gpId might be an object instead of a string
            let gpId = gpInstance.gpId;
            
            // If gpId is an object (from the new structure), extract the id property
            if (typeof gpId === 'object' && gpId !== null) {
                console.log('GP ID is an object:', gpId);
                // If it has an id property, use that
                if (gpId.id) {
                    gpId = gpId.id;
                } else {
                    // Otherwise stringify it for display but log a warning
                    console.warn('GP ID object without id property:', gpId);
                    gpId = JSON.stringify(gpId);
                }
                // Update the instance for future reference
                gpInstance.gpId = gpId;
            }
            
            // Find GP name and icon using the stored allGps data
            const gpInfo = this.allGps.find(gp => gp.id === gpId);
            const gpName = gpInfo ? gpInfo.name : gpId; // Fallback to ID if not found
            const gpIcon = gpInfo && gpInfo.iconPath ? `/static/ASC/${gpInfo.iconPath.replace('./', '')}` : ''; // Get icon path if exists

            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.dataset.gpIndex = index; // Store index for editing

            let spDetails = 'No SPs';
            if (gpInstance.spInstances && gpInstance.spInstances.length > 0) {
                 // Look up SP names and format each on a new line with colored score indicators
                spDetails = gpInstance.spInstances.map(spInst => {
                    const spInfo = this.allSps.find(s => s.id === spInst.spId);
                    const spName = spInfo ? spInfo.name : spInst.spId; // Fallback to ID if name not found
                    const spScore = spInst.spScore || '0%';
                    // Extract numeric score value for proper class name
                    const spScoreValue = parseInt(spScore, 10) || 0;
                    
                    // Return each SP detail with a colored score indicator using the correct class name pattern
                    return `<span>${spName} (v${spInst.spVersion || 'N/A'}, <span class="badge" style="background-color: ${this.getScoreColor(spScore)}; color: white; font-size: 0.75rem;">${spScore}</span>)</span>`;
                }).join('<br>'); // Join with line breaks
            }

            // Include GP Score with colored indicator using the correct class naming pattern 
            const gpScore = gpInstance.gpScore || '0%';
            const gpScoreValue = parseInt(gpScore, 10) || 0;

            listItem.innerHTML = `
                <div style="flex-grow: 1; min-width: 0; margin-right: 0.5rem;"> <!-- Allow shrinking, prevent overflow push, add right margin -->
                     <div class="d-flex align-items-center mb-1"> <!-- GP Name/Score/Label Line -->
                        ${gpIcon ? `<img src="${gpIcon}" alt="${gpName}" class="me-2" style="width: 20px; height: 20px; object-fit: contain;">` : ''}
                        <strong class="me-2">${gpName}</strong>
                        <input type="text" class="form-control form-control-sm gp-instance-label me-2" style="width: 150px;" placeholder="Optional Label" value="${gpInstance.instanceLabel || ''}">
                        <span class="badge" style="background-color: ${this.getScoreColor(gpScore)}; color: white;">${gpScore}</span> <!-- Display GP Score with color -->
                     </div>
                    <small class="d-block text-muted">${spDetails}</small> <!-- Display SP details -->
                </div>
                <div class="ms-auto flex-shrink-0"> <!-- Push buttons right, prevent shrinking -->
                    <button type="button" class="btn btn-sm btn-outline-primary me-1 edit-gp-btn" title="Edit SPs"> <!-- Use title attribute for tooltip -->
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger remove-gp-btn" title="Remove GP Instance">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            // Add event listeners for buttons within this item
            listItem.querySelector('.edit-gp-btn').addEventListener('click', (e) => {
                this.handleEditGpInstance(index);
            });
            listItem.querySelector('.remove-gp-btn').addEventListener('click', (e) => {
                this.handleRemoveGpInstance(index);
            });
            // Add listener for the label input
            listItem.querySelector('.gp-instance-label').addEventListener('change', (e) => {
                 if (this.data && this.data.gpInstances[index]) {
                     this.data.gpInstances[index].instanceLabel = e.target.value.trim();
                     console.log(`Label for GP index ${index} updated to: ${this.data.gpInstances[index].instanceLabel}`);
                 }
            });


            listGroup.appendChild(listItem);
        });

        this.gpInstancesContainer.appendChild(listGroup);
    }

    handleEditGpInstance(index) {
        console.log("Edit GP Instance at index:", index, this.data.gpInstances[index]);
        const gpInstanceToEdit = this.data.gpInstances[index];
        if (!gpInstanceToEdit) {
            console.error("Could not find GP instance data at index", index);
            UiService.showNotification("Error loading GP data for editing.", "danger");
            return;
        }

        // Always create a new DialogManager instance for the sub-dialog
        // This prevents issues with stale states or listeners if the dialog is reopened.
        // Ensure previous instance is destroyed if it exists to avoid duplicates in DOM
        if (this.gpSpEditDialog && typeof this.gpSpEditDialog.destroy === 'function') {
             this.gpSpEditDialog.destroy();
        }

        this.gpSpEditDialog = new DialogManager({
            id: `gpSpEditDialog-${gpInstanceToEdit.gpId}-${index}`, // More unique ID
            title: 'Edit SP Instances', // Will be updated below
            size: 'xlarge', // Make it wider to accommodate the list and form
            onSave: () => {
                // Trigger save on the GpSpEditForm instance
                const formInstance = this.gpSpEditDialog.contentComponent; // Assuming we store the instance
                if (formInstance && typeof formInstance.save === 'function') {
                    formInstance.save(); // This will call the onSaveCallback passed below
                }
                // Let the callback handle closing or keep it open if validation fails within GpSpEditForm
                return false; // Keep dialog open, let GpSpEditForm callback handle closing
            }
        });

        // Find GP name for the title
        const gpInfo = this.allGps.find(gp => gp.id === gpInstanceToEdit.gpId);
        const gpNameToDisplay = gpInfo ? gpInfo.name : gpInstanceToEdit.gpId;

        // Update the sub-dialog title
        this.gpSpEditDialog.setTitle(`Edit SPs for GP: ${gpNameToDisplay} (${gpInstanceToEdit.gpId})`);

        // Create the GpSpEditForm instance
        const gpSpForm = new GpSpEditForm({
            gpInstance: gpInstanceToEdit,
            allSps: this.allSps,
            allGps: this.allGps, // Pass GP data for name lookup within GpSpEditForm if needed
            onSave: (updatedGpInstanceData) => {
                // This callback is executed when GpSpEditForm's save() is called successfully
                console.log("Received updated GP instance data:", updatedGpInstanceData);
                // Update the data in the main AscForm's state
                this.data.gpInstances[index] = updatedGpInstanceData;
                // Re-render the GP instance list in the main AscForm
                this.renderGpInstances();
                // Recalculate and update the overall ASC score display
                this.updateAscScoreDisplay();
                // Close the sub-dialog
                this.gpSpEditDialog.close();
                UiService.showNotification(`SPs for GP ${updatedGpInstanceData.gpId} updated. Remember to save the main ASC.`, 'info');
            }
            // onCancel can be implicitly handled by DialogManager's close button
        });

        // Store the form instance on the dialog manager for the onSave handler
        this.gpSpEditDialog.contentComponent = gpSpForm;

        // Set content and open the sub-dialog
        this.gpSpEditDialog.setContent(gpSpForm.element);
        this.gpSpEditDialog.open();
    }

    handleAddGpInstance() {
        if (!this.addGpSelect || !this.data || !this.data.gpInstances) return;

        const selectedGpId = this.addGpSelect.value;
        if (!selectedGpId) {
            UiService.showNotification("Please select a GP type to add.", "warning");
            return;
        }
        
        // Find GP info for better user feedback
        const gpInfo = this.allGps.find(gp => gp.id === selectedGpId);
        const gpName = gpInfo ? gpInfo.name : selectedGpId;

        // Get the selected service to check for models associated with this GP
        const serviceInfo = this.allServices.find(s => s.id === this.data.serviceId);
        let defaultModels = [];
        
        // Check if this GP has model-specific configuration in the service
        if (serviceInfo?.gps && Array.isArray(serviceInfo.gps)) {
            // Check if new structure (objects with models)
            if (serviceInfo.gps.length > 0 && typeof serviceInfo.gps[0] === 'object') {
                const gpConfig = serviceInfo.gps.find(gp => gp.id === selectedGpId);
                if (gpConfig && gpConfig.models && Array.isArray(gpConfig.models)) {
                    defaultModels = gpConfig.models;
                }
            }
        }

        // Create a new GP instance object
        const newGpInstance = {
            gpId: selectedGpId,
            gpScore: "0%", // Default score
            instanceLabel: "", // Default label
            spInstances: [], // Default empty SPs
            // Store the allowed models for this GP if available from new service structure
            models: defaultModels.length > 0 ? defaultModels : [this.data.model] 
        };

        // Add to the data array
        this.data.gpInstances.push(newGpInstance);

        // Re-render the list and update scores
        this.renderGpInstances();
        this.updateAscScoreDisplay();

        // Reset the dropdown
        this.addGpSelect.value = "";

        UiService.showNotification(`GP "${gpName}" added. Remember to save the ASC.`, 'success');
    }


    handleRemoveGpInstance(index) {
         if (!this.data || !this.data.gpInstances) return;

         const gpToRemove = this.data.gpInstances[index];
         const gpIdToRemove = gpToRemove.gpId;

         // Count how many instances of this specific GP ID exist
         const countOfThisGp = this.data.gpInstances.filter(gp => gp.gpId === gpIdToRemove).length;

         // Check if this is the last instance of this type
         if (countOfThisGp <= 1) {
             // Check if this GP type is required by the service definition
             const serviceInfo = this.allServices.find(s => s.id === this.data.serviceId);
             const requiredGpIds = serviceInfo?.gps || [];
             // Look up GP name for the message
             const gpInfo = this.allGps.find(gp => gp.id === gpIdToRemove);
             const gpNameToDisplay = gpInfo ? gpInfo.name : gpIdToRemove;
             if (requiredGpIds.includes(gpIdToRemove)) {
                 UiService.showNotification(`Cannot remove the last instance of required GP "${gpNameToDisplay}".`, "danger");
                 return; // Prevent deletion
             }
         }

         // Proceed with deletion confirmation
         const gpInfo = this.allGps.find(gp => gp.id === gpIdToRemove);
         const gpName = gpInfo ? gpInfo.name : gpIdToRemove;
         if (confirm(`Are you sure you want to remove the GP instance "${gpName}"?`)) {
             this.data.gpInstances.splice(index, 1);
             this.renderGpInstances(); // Re-render the list
             this.updateAscScoreDisplay(); // Recalculate ASC score
             UiService.showNotification(`GP Instance ${gpName} removed. Remember to save the ASC.`, 'warning');
         }
    }

    calculateAscScore() {
        if (!this.data?.gpInstances || this.data.gpInstances.length === 0) {
            return '0%';
        }
        let totalGpScore = 0;
        this.data.gpInstances.forEach(gpInst => {
            totalGpScore += parseInt(gpInst.gpScore || '0', 10);
        });
        const averageScore = Math.round(totalGpScore / this.data.gpInstances.length);
        return `${averageScore}%`;
    }

    // Helper function to get background color based on score percentage
    getScoreColor(percentage) {
        percentage = parseInt(percentage, 10) || 0;
        if (percentage >= 100) return '#2e7d32'; // Dark green
        if (percentage >= 75) return '#43a047';  // Light green
        if (percentage >= 50) return '#fdd835';  // Yellow
        if (percentage >= 25) return '#fb8c00';  // Orange
        return '#e53935';                        // Red
    }
    
    // Helper function to get model name from model ID
    getModelName(modelId) {
        if (!modelId) return 'N/A';
        if (!this.formData.models) {
            console.warn('Models data not available, attempting to load from static file');
            // Return the ID for now, but trigger an async load of models
            this.loadModelsData(modelId);
            return modelId;
        }
        
        const model = this.formData.models.find(m => m.id === modelId);
        return model ? model.name : modelId;
    }
    
    // Helper method to load models data asynchronously if needed
    async loadModelsData(modelIdToUpdate = null) {
        try {
            // Update to use API endpoint instead of direct file access
            const modelsResponse = await fetch('/api/models');
            if (modelsResponse.ok) {
                const modelsData = await modelsResponse.json();
                this.formData.models = modelsData;
                
                // If we were asked to update a specific model display, do it now
                if (modelIdToUpdate) {
                    const modelSelect = document.getElementById('ascModel');
                    if (modelSelect) {
                        const modelName = this.getModelName(modelIdToUpdate);
                        if (modelName !== modelIdToUpdate) { // Only update if we got an actual name
                            modelSelect.innerHTML = `<option value="${modelIdToUpdate}" selected>${modelName}</option>`;
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error loading models data from API:", error);
        }
    }

    // Keep the original method for backward compatibility
    getProgressClass(percentage) {
        percentage = parseInt(percentage, 10) || 0;
        if (percentage >= 100) return 'progress-100';
        if (percentage >= 75) return 'progress-75';
        if (percentage >= 50) return 'progress-50';
        if (percentage >= 25) return 'progress-25';
        return 'progress-0';
    }
    
    updateAscScoreDisplay() {
        if (this.isEditMode && this.ascScoreDisplay) {
            const newScore = this.calculateAscScore();
            // Update text
            this.ascScoreDisplay.textContent = newScore;
            
            // Update the color class based on the score value
            // Parse the score to get the numeric value
            const scoreValue = parseInt(newScore, 10) || 0;
            
            // Update the style with direct color
            this.ascScoreDisplay.className = 'badge p-2 fs-6';
            this.ascScoreDisplay.style.backgroundColor = this.getScoreColor(newScore);
            this.ascScoreDisplay.style.color = 'white';
            
            // Also update the score in the underlying data object for saving
            if (this.data) {
                this.data.ascScore = newScore;
            }
        }
    }

    getValues() {
        // Collect values from the form
        const formData = {
            // Keep the ID if in edit mode (otherwise it would create a new ASC)
            id: this.isEditMode && this.data?.id ? this.data.id : undefined,
            
            // Affiliate, Environment, and Service ID values
            affiliateId: this.affiliateSelect.value,
            environment: this.environmentSelect.value,
            serviceId: this.serviceSelect.value,
            model: this.modelDisplay.value, // This is read-only but still collect it
            
            // ASC Score
            ascScore: this.isEditMode ? this.data.ascScore : '0%',
            
            // Status (carry forward in edit mode, or default to 'Planned' for new)
            status: this.isEditMode && this.data?.status ? this.data.status : 'Planned'
        };
        
        // Handle GP instances differently for new vs edit mode
        if (this.isEditMode && this.data?.gpInstances) {
            // In edit mode, use the existing GP instances
            formData.gpInstances = this.data.gpInstances;
        } else {
            // In create mode, ensure we only add GPs compatible with the selected model
            formData.gpInstances = [];
            
            // Get service info for the selected service
            const selectedServiceId = this.serviceSelect.value;
            const selectedModelId = this.modelDisplay.value;
            
            if (selectedServiceId && selectedModelId) {
                const serviceInfo = this.allServices.find(s => s.id === selectedServiceId);
                
                if (serviceInfo?.gps && Array.isArray(serviceInfo.gps)) {
                    // Check if using new structure (objects with models)
                    if (serviceInfo.gps.length > 0 && typeof serviceInfo.gps[0] === 'object') {
                        console.log(`Filtering GPs for model ${selectedModelId} in service ${serviceInfo.name}`);
                        
                        // Filter GPs that support the selected model
                        const compatibleGps = serviceInfo.gps.filter(gp => 
                            gp.models && Array.isArray(gp.models) && gp.models.includes(selectedModelId)
                        );
                        
                        console.log(`Found ${compatibleGps.length} compatible GPs:`, compatibleGps.map(gp => gp.id));
                        console.log(`Service has ${serviceInfo.gps.length} total GPs:`, serviceInfo.gps.map(gp => gp.id));
                        
                        // Log the full service info for debugging
                        console.log('Service info:', JSON.stringify(serviceInfo, null, 2));
                        
                        // Add each compatible GP
                        compatibleGps.forEach(gpConfig => {
                            console.log(`Adding GP ${gpConfig.id} which supports models:`, gpConfig.models);
                            // Create a new GP instance with the proper ID
                            formData.gpInstances.push({
                                gpId: gpConfig.id,
                                gpScore: "0%", // Default score
                                instanceLabel: "", // Default label
                                spInstances: [], // Default empty SPs
                                models: gpConfig.models // Keep the model info
                            });
                        });
                        
                        // Log the final count
                        console.log(`Final GP instances added: ${formData.gpInstances.length}`, formData.gpInstances.map(gp => gp.gpId));
                    } else {
                        // Old structure - default to empty
                        console.warn('Using old GP structure - cannot filter by model');
                    }
                }
            }
        }
        
        return formData;
    }
    
    // Setup initial GP instances based on selected model (for new ASCs)
    // DISABLED - We now handle this in getValues at form submission time
    setupInitialGpInstances(selectedModelId) {
        console.log('setupInitialGpInstances is now disabled as filtering is done at form submission');
        /* DISABLED - this method was causing conflicts with form submission logic
        // Skip if in edit mode or no model selected
        if (this.isEditMode || !selectedModelId) return;
        
        // Initialize data structure if needed
        if (!this.data) this.data = {};
        if (!this.data.gpInstances) this.data.gpInstances = [];
        
        // Clear any existing GP instances first
        this.data.gpInstances = [];
        
        // Get the currently selected service ID
        const selectedServiceId = this.serviceSelect.value;
        if (!selectedServiceId) {
            console.warn('No service selected, cannot auto-populate GPs');
            return;
        }
        
        // Get service info
        const serviceInfo = this.allServices.find(s => s.id === selectedServiceId);
        if (!serviceInfo) {
            console.error('Service not found:', selectedServiceId);
            return;
        }
        
        console.log('Setting up initial GP instances for model:', selectedModelId, 'in service:', serviceInfo.name);
        
        // Check if gps is an array of objects (new structure) or simple array of strings (old structure)
        if (serviceInfo.gps && Array.isArray(serviceInfo.gps)) {
            if (serviceInfo.gps.length > 0 && typeof serviceInfo.gps[0] === 'object') {
                // New structure: filter GPs that support the selected model
                const compatibleGps = serviceInfo.gps.filter(gp => 
                    gp.models && Array.isArray(gp.models) && gp.models.includes(selectedModelId)
                );
                
                console.log('Found compatible GPs:', compatibleGps.length);
                
                // Add each compatible GP
                compatibleGps.forEach(gpConfig => {
                    const gpId = gpConfig.id;
                    if (!gpId) return; // Skip if no ID
                    
                    // Get GP info for better display
                    const gpInfo = this.allGps.find(gp => gp.id === gpId);
                    const gpName = gpInfo ? gpInfo.name : gpId;
                    
                    // Create a new GP instance object
                    const newGpInstance = {
                        gpId: gpId,
                        gpScore: "0%", // Default score
                        instanceLabel: "", // Default label
                        spInstances: [], // Default empty SPs
                        models: gpConfig.models // Keep the allowed models for this GP
                    };
                    
                    // Add to the data array
                    this.data.gpInstances.push(newGpInstance);
                    console.log(`Added GP instance: ${gpName} (${gpId})`);
                });
                
                // Update the display
                this.renderGpInstances();
                this.updateAscScoreDisplay();
            } else {
                // Old structure - we don't have model-specific info, show warning
                console.warn('Using old GP structure - cannot filter by model');
            }
        }
        */
    }
    
    handleSubmit() {
        // Validate form data first
        if (!this.validate()) {
            return false; // Don't proceed if validation fails
        }
        
        // Get form values
        const formData = this.getValues();
        
        // Call the provided onSubmit callback with the form data
        if (typeof this.onSubmit === 'function') {
            try {
                this.onSubmit(formData);
            } catch (error) {
                console.error('Error in form submission:', error);
                UiService.showNotification('An error occurred while saving. Please try again.', 'danger');
                return false;
            }
        } else {
            console.warn('No onSubmit callback provided. Form data collected but not saved.');
            return false;
        }
        
        return true; // Indicate successful submission (primarily for testing)
    }
    
    // Add a delete button at the bottom of the form
    addDeleteButton() {
        // Create a container for the delete button
        const deleteButtonContainer = document.createElement('div');
        deleteButtonContainer.className = 'mt-4 mb-2 delete-button-container text-center';
        
        // Create the delete button
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn btn-danger';
        deleteButton.id = 'deleteAscButton';
        deleteButton.innerHTML = '<i class="fas fa-trash me-1"></i> Delete ASC';
        
        // Add the button to the container
        deleteButtonContainer.appendChild(deleteButton);
        
        // Add the container to the bottom of the form
        this.formElement.appendChild(deleteButtonContainer);
        
        // Add event listener to the delete button
        if (this.onDelete) {
            deleteButton.addEventListener('click', () => {
                // Confirm deletion with a browser dialog
                if (confirm(`Are you sure you want to delete ASC ${this.data.id}? This action cannot be undone.`)) {
                    // Call the onDelete callback with the ASC ID
                    this.onDelete(this.data.id);
                }
            });
        }
    }
    
    validate() {
        const isValid = this.formElement.checkValidity();
        
        if (!isValid) {
            // Add 'was-validated' class to show validation styling
            this.formElement.classList.add('was-validated');
            
            // Find the first invalid element and focus it
            const firstInvalidEl = this.formElement.querySelector(':invalid');
            if (firstInvalidEl) {
                firstInvalidEl.focus();
            }
            
            UiService.showNotification('Please fill in all required fields.', 'warning');
        }
        
        return isValid;
    }
}
