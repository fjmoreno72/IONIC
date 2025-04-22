import { UiService } from '../services/uiService.js'; // Correct import path
import { DialogManager } from './dialogManager.js'; // Import DialogManager for sub-dialog
import { GpSpEditForm } from './gpSpEditForm.js'; // Import the new form
import { ApiService } from '../services/apiService.js';

// Disable debug console.log messages; keep errors/warnings
console.log = function() {};

export class AscForm {
    constructor(config = {}) {
        this.data = config.data || null; // For edit mode later
        this.onSubmit = config.onSubmit || null;
        this.onCancel = config.onCancel || null; // Not used yet, but good practice
        this.onDelete = config.onDelete || null; // For edit mode later
        this.element = null;
        this.formElement = null;
        this.isEditMode = !!this.data;
        
        // Check for direct initialization mode
        this.preloadedData = config.preloadedData || false;
        this.directInitialization = config.directInitialization || false;
        
        // Determine if the ASC is editable based on its status
        // Only Draft and In Progress ASCs can be edited
        this.isEditable = !this.isEditMode || !this.data.status || 
                         ['Draft', 'Initial', 'In Progress'].includes(this.data.status);

        // Data fetched from API
        this.formData = {
            affiliates: [],
            services: []
        };

        // DOM elements for easy access
        this.affiliateSelect = null;
        this.environmentSelect = null;
        this.serviceSelect = null;
        this.modelSelect = null; // Store the model select element
        this.gpInstancesContainer = null; // Container for GP instances list
        this.ascScoreDisplay = null; // Element to display ASC score
        this.addGpSelect = null; // Dropdown to select which GP to add
        this.addGpButton = null; // Button to trigger adding the selected GP
        this.nationFlag = null; // Reference to the nation flag element

        // Store fetched data for lookups
        this.allServices = [];
        this.allGps = []; // Store all GPs for name lookup
        this.allSps = [];

        // Dialog manager for the GP/SP editing sub-dialog
        this.gpSpEditDialog = null; // Keep track, but create new instance each time

        // Flag to track form initialization
        this.initialized = false;
        
        console.log(`Creating ASC form with preloadedData=${this.preloadedData}, directInitialization=${this.directInitialization}`);

        this.createForm();
        this.fetchFormData(); // Fetch data after creating the basic form structure
    }

    async fetchFormData() {
        try {
            // ENHANCED: Check if we have pre-loaded data from Kanban Board
            if (this.isEditMode && this.data && this.data._preloadedData) {
                console.log('Using pre-loaded data from Kanban board for ASC-' + this.data.id);
                
                // We'll still fetch the full form data for completeness, but prioritize pre-loaded data
                // for critical elements like affiliate, service, and model
                const [formResponse, modelsResponse] = await Promise.all([
                    fetch('/api/asc_form_data'),
                    fetch('/api/models')
                ]);
                
                if (!formResponse.ok) {
                    throw new Error(`HTTP error! status: ${formResponse.status}`);
                }
                
                const fetchedData = await formResponse.json();
                this.formData = fetchedData; // Base structure from API
                this.allServices = fetchedData.services || [];
                this.allSps = fetchedData.sps || [];
                this.allGps = fetchedData.gps || []; // Store GPs
                
                // Process models data if available
                if (modelsResponse.ok) {
                    const modelsData = await modelsResponse.json();
                    this.formData.models = modelsData; // Add models to formData
                }
                
                // Override with pre-loaded data where available
                if (this.data._modelData) {
                    // Ensure the correct model is in our models array
                    const modelExists = this.formData.models.some(m => m.id === this.data.model);
                    if (!modelExists && this.data._model) {
                        // Add the pre-loaded model to our models array
                        this.formData.models.push(this.data._model);
                        console.log('Added pre-loaded model to models array:', this.data._model);
                    }
                }
                
                console.log("ASC Form Data loaded with pre-loaded enhancements");
            } else {
                // Standard data loading for non-preloaded cases
                console.log('Fetching ASC form data from API...');
                const [formResponse, modelsResponse] = await Promise.all([
                    fetch('/api/asc_form_data'),
                    fetch('/api/models')
                ]);
                
                if (!formResponse.ok) {
                    throw new Error(`HTTP error! status: ${formResponse.status}`);
                }
                
                const fetchedData = await formResponse.json();
                this.formData = fetchedData; // Keep original structure for dropdowns
                this.allServices = fetchedData.services || [];
                this.allSps = fetchedData.sps || [];
                this.allGps = fetchedData.gps || []; // Store GPs
                
                // Process models data if available
                if (modelsResponse.ok) {
                    const modelsData = await modelsResponse.json();
                    this.formData.models = modelsData; // Add models to formData
                }
                
                console.log("ASC Form Data fetched from API", this.formData); // Debugging
            }

            this.populateAffiliateDropdown();
            this.populateServiceDropdown();

            // If in edit mode, set values *after* dropdowns are populated
            if (this.isEditMode && this.data) {
                // Ensure dropdowns are ready before setting values
                await this.waitForElement(this.affiliateSelect, opt => opt.length > 1);
                await this.waitForElement(this.serviceSelect, opt => opt.length > 1);
                
                // Fix flag display immediately after data load
                this.nationFlag = document.getElementById('nationFlag');
                if (this.nationFlag && this.data.affiliateId) {
                    const affiliate = this.formData.affiliates.find(a => a.id === this.data.affiliateId);
                    if (affiliate && affiliate.flagPath) {
                        // Convert './image/flags/...' to '/static/ASC/image/flags/...'
                        const flagPath = `/static/ASC/${affiliate.flagPath.replace('./', '')}`;
                        console.log(`Direct DOM update: Setting flag src to ${flagPath}`);
                        
                        // IMPORTANT: We directly set the src attribute in the DOM
                        this.nationFlag.src = flagPath;
                        this.nationFlag.setAttribute('data-original-src', flagPath);
                    }
                }
                
                // Now continue with regular initialization
                this.setValues(this.data);
                this.renderGpInstances(); // Render GP instances in edit mode
                this.updateAscScoreDisplay(); // Initial ASC score calculation and display
                this.populateAddGpDropdown(); // Populate the Add GP dropdown
                
                // Force another flag update as a backup
                try {
                    await this.updateNationFlag(); 
                } catch (flagError) {
                    console.warn('Flag update warning:', flagError);
                }
                
                // Mark the form as fully initialized
                this.initialized = true;
                console.log('ASC form fully initialized');
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
        
        // Determine the initial flag path to use if in edit mode
        let initialFlagPath = '/static/ASC/image/flags/FMN-ASC.png';
        if (this.isEditMode && this.data && this.data.affiliateId) {
            console.log('Preparing flag path for affiliate:', this.data.affiliateId);
            // Using this direct approach eliminates the timing issues with async loading
            if (this.data.affiliateFlag) {
                initialFlagPath = this.data.affiliateFlag;
                console.log('Using provided flag path:', initialFlagPath);
            } else {
                // Lookup affiliate flag path from loaded formData
                const affiliate = this.formData.affiliates.find(a => a.id === this.data.affiliateId);
                if (affiliate && affiliate.flagPath) {
                    // Convert './image/flags/...' to '/static/ASC/image/flags/...'
                    initialFlagPath = `/static/ASC/${affiliate.flagPath.replace('./', '')}`;
                    console.log('Using affiliate flagPath from data:', initialFlagPath);
                } else {
                    // Fallback to default initialFlagPath silently
                }
            }
        }

        // Basic structure - with more compact layout using Bootstrap grid
        this.formElement.innerHTML = `
            ${this.isEditMode ? `
            <!-- ASC Score and Status displayed prominently at the top in edit mode -->
            <div class="mb-3 d-flex align-items-center gap-4">
                <div class="d-flex align-items-center">
                    <h5 class="mb-0 me-2">ASC Score:</h5>
                    <span class="badge p-2 fs-6" style="background-color: ${this.getScoreColor(this.data?.ascScore || '0')}; color: white;" id="ascOverallScore">${this.data?.ascScore || '0%'}</span>
                </div>
                <div class="d-flex align-items-center">
                    <h5 class="mb-0 me-2">Status:</h5>
                    <span class="badge p-2 fs-6" style="background-color: ${this.getStatusColor(this.data?.status || 'Initial')}; color: white;" id="ascStatus">${this.data?.status || 'Initial'}</span>
                </div>
            </div>
            ${!this.isEditable ? `
            <!-- Read-only warning message -->
            <div class="alert alert-warning d-flex align-items-center mb-3" role="alert">
                <i class="fas fa-lock me-2"></i>
                <div>
                    This ASC can only be edited in "Draft" or "In Progress" status. Move it to one of these statuses in the ASC board to enable editing.
                </div>
            </div>
            ` : ''}
            <hr class="mt-2 mb-3">
            ` : ''}
            
            
            <!-- Two-column layout for form fields -->
            <div class="row">
                <!-- First column -->
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="ascAffiliate" class="form-label">Affiliate (Nation)</label>
                        <div class="input-group">
                            ${this.isEditMode ? `<span class="input-group-text p-0 border-0 bg-transparent"><img src="${initialFlagPath}" alt="Nation Flag" width="24" height="auto" class="me-2" id="nationFlag"></span>` : ''}
                            <select class="form-select" id="ascAffiliate" required ${this.isEditMode || !this.isEditable ? 'disabled' : ''}>
                                <option value="" selected disabled>Loading affiliates...</option>
                            </select>
                        </div>
                        <div class="invalid-feedback">Please select an affiliate.</div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="ascService" class="form-label">Service</label>
                        <select class="form-select" id="ascService" required ${this.isEditMode || !this.isEditable ? 'disabled' : ''}>
                            <option value="" selected disabled>Loading services...</option>
                        </select>
                        <div class="invalid-feedback">Please select a service.</div>
                    </div>
                </div>
                
                <!-- Second column -->
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="ascEnvironment" class="form-label">Environment</label>
                        <select class="form-select" id="ascEnvironment" required ${this.isEditMode || !this.isEditable ? 'disabled' : ''}>
                            <option value="" selected disabled>Select an affiliate first</option>
                        </select>
                        <div class="invalid-feedback">Please select an environment.</div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="ascModel" class="form-label">Model</label>
                        <select class="form-select" id="ascModel" required ${this.isEditMode || !this.isEditable ? 'disabled' : ''}>
                            ${this.isEditMode && this.data?.model ? 
                                `<option value="${this.data.model}" selected>${this.data._modelData?.name || this.data.modelName || this.data.model}</option>` : 
                                `<option value="" selected disabled>Select a service first</option>`
                            }
                        </select>
                        <div class="invalid-feedback">Please select a model.</div>
                        ${this.isEditMode && this.data?.model ? 
                            `<span class="text-muted mt-1" style="display: block;">Model ID: ${this.data.model}</span>` : 
                            ''
                        }
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
                    <select id="addGpSelect" class="form-select form-select-sm ${!this.isEditable ? 'bg-light text-muted' : ''}" ${!this.isEditable ? 'disabled' : ''}>
                        <option value="" selected disabled>${!this.isEditable ? 'ASC is read-only' : 'Select GP type to add...'}</option>
                        <!-- Options populated dynamically -->
                    </select>
                 </div>
                 <div class="col-sm-4">
                    <button type="button" id="addGpInstanceButton" class="btn ${this.isEditable ? 'btn-outline-success' : 'btn-light text-muted'} btn-sm w-100" ${!this.isEditable ? 'disabled' : ''} style="${!this.isEditable ? 'pointer-events: none; opacity: 0.65;' : ''}">
                        <i class="fas fa-${this.isEditable ? 'plus' : 'lock'} me-1"></i> ${this.isEditable ? 'Add Selected GP' : 'Not Available'}
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
            // SIMPLIFIED MODEL APPROACH: Use preloaded model data immediately
            let modelName;
            let modelId = this.data.model;
            
            // Prioritize using the preloaded model data from kanban-board.js
            if (this.data._preloadedData) {
                if (this.data._modelData) {
                    // Use preloaded model data structure
                    modelName = this.data._modelData.name;
                    console.log('DIRECT MODEL: Using fully preloaded model name:', modelName);
                } else if (this.data.modelName) {
                    // Use model name directly attached to ASC data
                    modelName = this.data.modelName;
                    console.log('DIRECT MODEL: Using attached model name:', modelName);
                } else {
                    // Fallback lookup in formData if needed
                    modelName = this.formData.models?.find(m => m.id === modelId)?.name || `Model ID: ${modelId}`;
                    console.log('DIRECT MODEL: Using looked-up model name (fallback):', modelName);
                }
            } else {
                // Standard lookup for non-preloaded data
                modelName = this.formData.models?.find(m => m.id === modelId)?.name || `Model ID: ${modelId}`;
                console.log('Using standard model name lookup:', modelName);
            }
            
            // Create a single option with the current model (explicitly setting both value and text)
            console.log(`Setting model select to ID=${modelId}, Name=${modelName}`);
            
            // Clear any existing options
            modelSelect.innerHTML = '';
            
            // Create and add the new option
            const option = document.createElement('option');
            option.value = modelId;
            option.textContent = modelName;
            option.selected = true;
            modelSelect.appendChild(option);
            
            // Disable the select since it's in edit mode
            modelSelect.disabled = true;
            
            // Force a DOM update to ensure immediate display
            modelSelect.setAttribute('data-model-id', modelId);
            modelSelect.setAttribute('data-model-name', modelName);
            modelSelect.setAttribute('data-update-time', new Date().toISOString());
            
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
                if (this.formData.models && this.formData.models.length > 0) {
                    this.updateModelSelect(selectedServiceId);
                } else {
                    console.error("Models data still not available after delay");
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

            let spDetails = '<div class="text-muted fst-italic">No SPs configured</div>';
            if (gpInstance.spInstances && gpInstance.spInstances.length > 0) {
                // Create a proper bullet list with better styling
                spDetails = '<ul class="list-unstyled mb-0">';
                gpInstance.spInstances.forEach(spInst => {
                    const spInfo = this.allSps.find(s => s.id === spInst.spId);
                    const spName = spInfo ? spInfo.name : spInst.spId; // Fallback to ID if name not found
                    const spScore = spInst.spScore || '0%';
                    
                    // Create a badge with the score color
                    const scoreBadge = `<span class="badge" style="background-color: ${this.getScoreColor(spScore)}; color: white; font-size: 0.75rem;">${spScore}</span>`;
                    
                    // Add a bullet point entry with better spacing and alignment
                    spDetails += `
                        <li class="d-flex align-items-center mb-1">
                            <i class="fas fa-angle-right text-secondary me-2"></i>
                            <span class="me-1">${spName}</span>
                            <span class="text-muted small">(v${spInst.spVersion || 'N/A'})</span>
                            <span class="ms-auto">${scoreBadge}</span>
                        </li>`;
                });
                spDetails += '</ul>';
            }

            // Include GP Score with colored indicator using the correct class naming pattern 
            const gpScore = gpInstance.gpScore || '0%';
            const gpScoreValue = parseInt(gpScore, 10) || 0;

            listItem.innerHTML = `
                <div style="flex-grow: 1; min-width: 0; margin-right: 0.5rem;"> <!-- Allow shrinking, prevent overflow push, add right margin -->
                     <div class="d-flex align-items-center mb-2"> <!-- GP Name/Score/Label Line -->
                        ${gpIcon ? `<img src="${gpIcon}" alt="${gpName}" class="me-2" style="width: 24px; height: 24px; object-fit: contain;">` : ''}
                        <strong class="me-2">${gpName}</strong>
                        <input type="text" class="form-control form-control-sm gp-instance-label me-2" style="width: 150px;" placeholder="Optional Label" value="${gpInstance.instanceLabel || ''}" ${!this.isEditable ? 'disabled' : ''}>
                        <span class="badge" style="background-color: ${this.getScoreColor(gpScore)}; color: white;">${gpScore}</span> <!-- Display GP Score with color -->
                     </div>
                     
                     <!-- SP details in a card-like container -->
                     <div class="ps-3 border-start border-light">
                         ${spDetails}
                     </div>
                </div>
                <div class="ms-auto flex-shrink-0"> <!-- Push buttons right, prevent shrinking -->
                    <button type="button" class="btn btn-sm ${this.isEditable ? 'btn-outline-primary' : 'btn-light text-muted'} me-1 edit-gp-btn" title="${this.isEditable ? 'Edit SPs' : 'View SPs (read-only)'}" ${!this.isEditable ? 'disabled' : ''} style="${!this.isEditable ? 'pointer-events: none; opacity: 0.65;' : ''}"> <!-- Use title attribute for tooltip -->
                        <i class="fas fa-${this.isEditable ? 'edit' : 'lock'}"></i>
                    </button>
                    <button type="button" class="btn btn-sm ${this.isEditable ? 'btn-outline-danger' : 'btn-light text-muted'} remove-gp-btn" title="${this.isEditable ? 'Remove GP Instance' : 'Cannot remove (read-only)'}" ${!this.isEditable ? 'disabled' : ''} style="${!this.isEditable ? 'pointer-events: none; opacity: 0.65;' : ''}">
                        <i class="fas fa-${this.isEditable ? 'trash' : 'lock'}"></i>
                    </button>
                </div>
            `;

            // Add event listeners for buttons within this item
            listItem.querySelector('.edit-gp-btn').addEventListener('click', (e) => {
                this.handleEditGpInstance(index);
            });
            listItem.querySelector('.remove-gp-btn').addEventListener('click', (e) => {
                // Call handleRemoveGpInstance to perform all validations first
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

    async handleAddGpInstance() {
        if (!this.isEditable) {
            UiService.showNotification('This ASC cannot be modified. Change its status to Draft or In Progress first.', 'warning');
            return;
        }
        const gpId = this.addGpSelect?.value;
        if (!gpId) {
            UiService.showNotification('Please select a GP type to add.', 'warning');
            return;
        }
        const gpName = this.allGps.find(gp => gp.id === gpId)?.name || gpId;
        try {
            const response = await fetch(`/api/ascs/${this.data.id}/gpInstances`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({gpId})
            });
            const newGp = await response.json();
            if (!response.ok) {
                UiService.showNotification(`Error adding GP: ${newGp.error || response.statusText}`, 'danger');
                return;
            }
            this.data.gpInstances.push(newGp);
            this.renderGpInstances();
            this.updateAscScoreDisplay();
            this.addGpSelect.value = '';
            UiService.showNotification(`GP "${gpName}" added. Remember to save the ASC.`, 'success');
        } catch (error) {
            console.error(error);
            UiService.showNotification('Unexpected error adding GP instance.', 'danger');
        }
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
            ascId: this.data.id,
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

    async handleRemoveGpInstance(index) {
        if (!this.isEditable) {
            UiService.showNotification('This ASC cannot be modified. Change its status to Draft or In Progress first.', 'warning');
            return;
        }
        const instances = this.data?.gpInstances;
        if (!instances || !instances[index]) return;
        const gpToRemove = instances[index];
        const gpId = gpToRemove.gpId;
        const countOfType = instances.filter(g => g.gpId === gpId).length;
        if (countOfType <= 1) {
            const info = this.allGps.find(g => g.id === gpId);
            const nm = info ? info.name : gpId;
            UiService.showNotification(`Cannot remove the last instance of GP "${nm}".`, 'danger');
            return;
        }
        const info = this.allGps.find(g => g.id === gpId);
        const name = info ? info.name : gpId;
        
        // Use non-blocking confirmation dialog
        UiService.showConfirmDialog(
            `Remove GP instance "${name}"?`,
            () => {
                // This runs when user confirms, without blocking UI
                const task = () => {
                    window.requestAnimationFrame(() => {
                        instances.splice(index, 1);
                        const li = this.gpInstancesContainer.querySelector(`li[data-gp-index="${index}"]`);
                        if (li) li.remove();
                        this.gpInstancesContainer.querySelectorAll('li').forEach((el, i) => el.dataset.gpIndex = i);
                        this.updateAscScoreDisplay();
                        UiService.showNotification(`GP Instance ${name} removed.`, 'warning');
                    });
                };
                if ('requestIdleCallback' in window) {
                    window.requestIdleCallback(task);
                } else {
                    setTimeout(task, 0);
                }
            },
            null,  // No cancel handler needed
            'Remove'  // Button text
        )
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
    
    // Helper function to get background color based on ASC status
    getStatusColor(status) {
        // Return color based on status
        switch(status) {
            case 'Initial': return '#6c757d'; // Gray - Secondary
            case 'In Progress': return '#0d6efd'; // Blue - Primary
            case 'In Review': return '#ffc107'; // Yellow - Warning
            case 'Validated': return '#198754'; // Green - Success
            case 'Deprecated': return '#dc3545'; // Red - Danger
            default: return '#6c757d'; // Gray - Secondary
        }
    }
    
    // Helper function to get nation flag path for an affiliate
    getNationFlagPath() {
        if (!this.data || !this.data.affiliateId) return '/static/ASC/image/flags/FMN-ASC.png';
        
        // Find the affiliate in the formData
        const affiliate = this.formData.affiliates.find(a => a.id === this.data.affiliateId);
        if (!affiliate || !affiliate.flagPath) return '/static/ASC/image/flags/FMN-ASC.png';
        
        // Convert './image/flags/...' to '/static/ASC/image/flags/...'
        const flagPath = `/static/ASC/${affiliate.flagPath.replace('./', '')}`;
        return flagPath;
    }
    
    // Update the nation flag image when editing an ASC - enhanced version with DOM updates
    async updateNationFlag() {
        if (!this.isEditMode) return;
        
        // First try to get the flag element if we don't already have it
        if (!this.nationFlag) {
            this.nationFlag = document.getElementById('nationFlag');
        }
        
        const flagImage = this.nationFlag || document.getElementById('nationFlag');
        if (!flagImage) {
            console.warn('Flag image element not found');
            return;
        }
        
        // Only update if we have affiliates data loaded
        if (this.formData.affiliates && this.formData.affiliates.length > 0 && this.data && this.data.affiliateId) {
            // Find the affiliate in our loaded data
            const affiliate = this.formData.affiliates.find(a => a.id === this.data.affiliateId);
            console.log('Updating flag for affiliate:', this.data.affiliateId, 'Found:', affiliate);
            
            if (affiliate && affiliate.flagPath) {
                // Convert './image/flags/...' to '/static/ASC/image/flags/...'
                const flagPath = `/static/ASC/${affiliate.flagPath.replace('./', '')}`;
                console.log('FORCE-SETTING flag path to:', flagPath);
                
                // Store current src for debugging
                const currentSrc = flagImage.getAttribute('src') || flagImage.src || 'unknown';
                console.log('Current flag src before update:', currentSrc);
                
                // CRITICAL FIX: We need to use multiple approaches to ensure the image updates
                // 1. Use the src property
                flagImage.src = flagPath;
                
                // 2. Use setAttribute for maximum compatibility
                flagImage.setAttribute('src', flagPath);
                
                // 3. Force a browser reflow to ensure the change takes effect
                void flagImage.offsetWidth;
                
                // 4. Make the flag element visible again if it was hidden
                flagImage.style.visibility = 'visible';
                flagImage.style.display = '';
                
                // Store update metadata for debugging
                flagImage.setAttribute('data-updated', new Date().toISOString());
                flagImage.setAttribute('data-affiliate', this.data.affiliateId);
                
                // Verify the update took effect
                console.log('Flag src after update:', flagImage.getAttribute('src'));
                
                // Return a promise that resolves when the image loads or errors
                return new Promise((resolve) => {
                    // Define one-time event handlers
                    const handleLoad = () => {
                        console.log('Flag image loaded successfully');
                        flagImage.removeEventListener('load', handleLoad);
                        flagImage.removeEventListener('error', handleError);
                        resolve();
                    };
                    
                    const handleError = () => {
                        console.warn('Flag image failed to load, using default');
                        flagImage.removeEventListener('load', handleLoad);
                        flagImage.removeEventListener('error', handleError);
                        
                        // Try default flag as fallback
                        flagImage.src = '/static/ASC/image/flags/FMN-ASC.png';
                        flagImage.setAttribute('src', '/static/ASC/image/flags/FMN-ASC.png');
                        resolve();
                    };
                    
                    // Add event listeners
                    flagImage.addEventListener('load', handleLoad, {once: true});
                    flagImage.addEventListener('error', handleError, {once: true});
                    
                    // Set a timeout in case the events don't fire
                    setTimeout(() => {
                        flagImage.removeEventListener('load', handleLoad);
                        flagImage.removeEventListener('error', handleError);
                        console.log('Flag update timeout reached - resolving promise anyway');
                        resolve();
                    }, 1000);
                });
            } else {
                // Fallback to default flag silently
                flagImage.src = '/static/ASC/image/flags/FMN-ASC.png';
                flagImage.setAttribute('src', '/static/ASC/image/flags/FMN-ASC.png');
            }
        } else {
            console.warn('Affiliates data not loaded yet, using default flag');
            flagImage.src = '/static/ASC/image/flags/FMN-ASC.png';
            flagImage.setAttribute('src', '/static/ASC/image/flags/FMN-ASC.png');
        }
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
            console.log('Loading models data asynchronously...');
            // Update to use API endpoint instead of direct file access
            const modelsResponse = await fetch('/api/models');
            if (modelsResponse.ok) {
                const modelsData = await modelsResponse.json();
                this.formData.models = modelsData;
                console.log('Models data loaded:', modelsData.length, 'models');
                
                // If we were asked to update a specific model display, do it now
                if (modelIdToUpdate) {
                    console.log('Updating model display for ID:', modelIdToUpdate);
                    const modelSelect = document.getElementById('ascModel');
                    if (modelSelect) {
                        const modelName = this.getModelName(modelIdToUpdate);
                        console.log('Model name retrieved:', modelName);
                        
                        if (modelName !== modelIdToUpdate) { // Only update if we got an actual name
                            // Check if the option already exists and update it
                            const existingOption = Array.from(modelSelect.options).find(opt => opt.value === modelIdToUpdate);
                            if (existingOption) {
                                console.log('Updating existing option text to:', modelName);
                                existingOption.text = modelName;
                            } else {
                                console.log('Creating new option with text:', modelName);
                                modelSelect.innerHTML = `<option value="${modelIdToUpdate}" selected>${modelName}</option>`;
                            }
                        }
                        
                        // Ensure the value is still set correctly
                        modelSelect.value = modelIdToUpdate;
                    } else {
                        console.warn('Model select element not found');
                    }
                }
                
                return true;
            } else {
                console.error('Models API response not OK:', modelsResponse.status);
                return false;
            }
        } catch (error) {
            console.error("Error loading models data from API:", error);
            return false;
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
            
            // Also update the ASC status display if it exists
            const statusDisplay = document.getElementById('ascStatus');
            if (statusDisplay) {
                statusDisplay.style.backgroundColor = this.getStatusColor(this.data?.status || 'Initial');
                statusDisplay.textContent = this.data?.status || 'Initial';
            }
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
                    console.log(`Adding GP ${gpConfig.id} which supports models:`, gpConfig.models);
                    // Create a new GP instance with the proper ID
                    const newGpInstance = {
                        gpId: gpConfig.id,
                        gpScore: "0%", // Default score
                        instanceLabel: "", // Default label
                        spInstances: [], // Default empty SPs
                        models: gpConfig.models // Keep the allowed models for this GP
                    };
                    
                    // Add to the data array
                    this.data.gpInstances.push(newGpInstance);
                    console.log(`Added GP instance: ${gpConfig.id}`);
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
    
    // Setup initial GP instances based on selected model (for new ASCs)
    // DISABLED - We now handle this in getValues at form submission time
    handleSubmit() {
        // Check if the ASC is editable
        if (!this.isEditable) {
            UiService.showNotification('This ASC cannot be edited. Change its status to Draft or In Progress first.', 'warning');
            return false;
        }
        
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
        
        // Disable the delete button if the ASC is not editable
        if (!this.isEditable) {
            deleteButton.disabled = true;
            deleteButton.title = 'ASC must be in Draft or In Progress status to delete';
            // Add a small lock icon to indicate it's locked
            deleteButton.innerHTML = '<i class="fas fa-lock me-1"></i> Delete ASC';
        }
        
        // Add the button to the container
        deleteButtonContainer.appendChild(deleteButton);
        
        // Add the container to the bottom of the form
        this.formElement.appendChild(deleteButtonContainer);
        
        // Add event listener to the delete button
        if (this.onDelete) {
            deleteButton.addEventListener('click', () => {
                if (!this.isEditable) {
                    UiService.showNotification('This ASC cannot be deleted. Change its status to Draft or In Progress first.', 'warning');
                    return;
                }
                
                // Use non-blocking confirmation dialog
                UiService.showConfirmDialog(
                    `Are you sure you want to delete ASC ${this.data.id}? This action cannot be undone.`,
                    () => {
                        // This runs when user confirms, without blocking UI
                        const task = () => this.onDelete(this.data.id);
                        if ('requestIdleCallback' in window) {
                            window.requestIdleCallback(task);
                        } else {
                            setTimeout(task, 0);
                        }
                    },
                    null,  // No cancel handler needed
                    'Delete'  // Button text
                )
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

// Pre-create notification container to avoid dynamic creation warning
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('notificationContainer')) {
      const container = document.createElement('div');
      container.id = 'notificationContainer';
      container.style.position = 'fixed';
      container.style.top = '80px';
      container.style.right = '20px';
      container.style.zIndex = '1060';
      container.style.minWidth = '300px';
      document.body.appendChild(container);
    }
  });
} else {
  if (!document.getElementById('notificationContainer')) {
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.style.position = 'fixed';
    container.style.top = '80px';
    container.style.right = '20px';
    container.style.zIndex = '1060';
    container.style.minWidth = '300px';
    document.body.appendChild(container);
  }
}
