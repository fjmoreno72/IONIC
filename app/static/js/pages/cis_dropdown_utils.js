/**
 * CIS Plan Dropdown Utilities
 * 
 * Shared utilities for dropdown components used across CIS Plan 2.0.
 * This includes functions for loading data from APIs, initializing Select2,
 * and handling fallback scenarios when Select2 is not available.
 */

const CISDropdownUtils = {
    /**
     * Load participants for dropdown
     * @returns {Promise<Array>} Array of participant objects with id and text properties
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
     * Get participant name by ID
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
            const participants = await CISDropdownUtils.loadParticipants();
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
     * @returns {Promise<Array>} Array of service objects with id and text properties
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
                return CISDropdownUtils.processServicesResponse(await altResponse.json());
            }
            
            return CISDropdownUtils.processServicesResponse(await response.json());
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
                            return CISDropdownUtils.processGPsResponse(await altResponse.json());
                        }
                    } catch (e) {
                        console.warn(`Failed to fetch from ${alt}:`, e);
                    }
                }
                
                throw new Error(`Failed to fetch GPs: ${response.statusText}`);
            }
            
            return CISDropdownUtils.processGPsResponse(await response.json());
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
     * Add custom styling for Select2 dropdowns
     * @returns {void}
     */
    addSelect2Styling: function() {
        // Check if the style already exists to avoid duplicates
        if (document.getElementById('select2-custom-styles')) {
            return;
        }
        
        const styleElement = document.createElement('style');
        styleElement.id = 'select2-custom-styles';
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
    },
    
    /**
     * Initialize Select2 on a select element with fallback to standard select
     * @param {HTMLElement} selectElement - The select element to initialize
     * @param {Object} options - Select2 options
     * @param {Function} dataLoader - Function to load data for the select
     * @param {string} initialValue - Initial value to select (optional)
     * @param {Function} onChangeCallback - Callback for change event (optional)
     * @returns {Promise<boolean>} True if Select2 was initialized, false if using fallback
     */
    initSelect2WithFallback: async function(selectElement, options, dataLoader, initialValue = null, onChangeCallback = null) {
        if (!selectElement) {
            console.error('Cannot initialize Select2: null select element');
            return false;
        }
        
        const formGroup = selectElement.closest('.form-group');
        const loadingIndicator = formGroup ? formGroup.querySelector('.loading-indicator') : null;
        
        // Check if jQuery and Select2 are available
        if (typeof jQuery !== 'undefined') {
            try {
                // Add select2 styling
                CISDropdownUtils.addSelect2Styling();
                
                // Initialize Select2
                jQuery(selectElement).select2(options);
                
                // Make sure the search field inside Select2 also has autocomplete off
                jQuery(selectElement).on('select2:open', function() {
                    setTimeout(function() {
                        const searchField = document.querySelector('.select2-search__field');
                        if (searchField) {
                            searchField.setAttribute('autocomplete', 'new-password');
                        }
                    }, 100);
                });
                
                // Load data if a loader function is provided
                if (typeof dataLoader === 'function') {
                    try {
                        const data = await dataLoader();
                        
                        // Hide loading indicator if it exists
                        if (loadingIndicator) {
                            loadingIndicator.style.display = 'none';
                        }
                        
                        // Add options to select
                        data.forEach(item => {
                            const option = new Option(item.text, item.id, false, false);
                            jQuery(selectElement).append(option);
                        });
                        
                        // Set initial value if provided
                        if (initialValue) {
                            jQuery(selectElement).val(initialValue).trigger('change');
                        }
                        
                        // Add change handler if provided
                        if (onChangeCallback && typeof onChangeCallback === 'function') {
                            jQuery(selectElement).on('change', onChangeCallback);
                        }
                        
                        return true;
                    } catch (error) {
                        console.error('Error loading data for Select2:', error);
                        
                        // Show error in loading indicator
                        if (loadingIndicator) {
                            loadingIndicator.innerHTML = '<div class="text-danger">Error loading data</div>';
                        }
                        
                        // Still try to set initial value if available
                        if (initialValue) {
                            const option = new Option(initialValue, initialValue, true, true);
                            jQuery(selectElement).append(option);
                            jQuery(selectElement).val(initialValue).trigger('change');
                        }
                        
                        return true; // Still return true since Select2 was initialized
                    }
                }
                
                return true;
            } catch (e) {
                console.error('Error initializing Select2:', e);
                // Fall through to fallback
            }
        }
        
        // Fallback to standard select
        console.warn('jQuery not available or Select2 initialization failed, using standard select');
        
        if (loadingIndicator) {
            loadingIndicator.innerHTML = '<div class="text-warning">Using standard dropdown (Select2 failed)</div>';
        }
        
        // Still try to load data for the standard select
        if (typeof dataLoader === 'function') {
            try {
                const data = await dataLoader();
                
                // Hide loading indicator
                if (loadingIndicator) {
                    loadingIndicator.style.display = 'none';
                }
                
                // Add options to standard select
                data.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = item.text;
                    selectElement.appendChild(option);
                });
                
                // Set initial value if provided
                if (initialValue) {
                    selectElement.value = initialValue;
                }
                
                // Add change handler if provided
                if (onChangeCallback && typeof onChangeCallback === 'function') {
                    selectElement.addEventListener('change', onChangeCallback);
                }
            } catch (error) {
                console.error('Error loading data for standard select:', error);
                
                if (loadingIndicator) {
                    loadingIndicator.innerHTML = '<div class="text-danger">Error loading data</div>';
                }
                
                // Try to add initial value as option
                if (initialValue) {
                    const option = document.createElement('option');
                    option.value = initialValue;
                    option.textContent = initialValue;
                    option.selected = true;
                    selectElement.appendChild(option);
                }
            }
        }
        
        return false; // Return false since we're using fallback
    },
    
    /**
     * Convert a select element to text input
     * @param {HTMLElement} selectElement - The select element to convert
     * @param {string} placeholder - The placeholder text for the input
     * @param {string} name - The name attribute for the input
     * @param {boolean} required - Whether the input is required
     * @param {string} initialValue - The initial value for the input (optional)
     * @returns {HTMLElement|null} The created input element or null if conversion failed
     */
    convertSelectToTextInput: function(selectElement, placeholder, name, required = false, initialValue = '') {
        if (!selectElement) {
            console.error('Cannot convert null select element to text input');
            return null;
        }
        
        // Get the parent form group
        const formGroup = selectElement.closest('.form-group');
        if (!formGroup) {
            console.error('Cannot find parent form group for select element');
            return null;
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
    },

    /**
     * Load all Specific Products for dropdown
     * @returns {Promise<Array>} Array of SP objects with id and text properties
     */
    loadAllSPs: async function() {
        try {
            console.log('Loading all Specific Products for dropdown...');
            const response = await fetch('/api/sps');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch SPs: ${response.statusText}`);
            }
            
            const result = await response.json();
            let sps = [];
            
            // Handle different API response formats
            if (Array.isArray(result)) {
                sps = result;
            } else if (result.sps && Array.isArray(result.sps)) {
                sps = result.sps;
            } else if (result.data && Array.isArray(result.data)) {
                sps = result.data;
            } else {
                console.warn('Unexpected SP API response format:', result);
                return [];
            }
            
            // Transform the data into the format needed for Select2
            const formattedSPs = sps.map(sp => ({
                id: sp.id,
                text: `${sp.name || sp.spName || 'Unknown'} (${sp.id})`,
                description: sp.description
            }));
            
            console.log(`Loaded ${formattedSPs.length} Specific Products for dropdown`);
            return formattedSPs;
        } catch (error) {
            console.error('Error loading Specific Products:', error);
            return [];
        }
    },

    /**
     * Load versions for a specific SP
     * @param {string} spId - SP ID to get versions for
     * @returns {Promise<Array>} Array of version objects with id and text properties
     */
    loadSPVersions: async function(spId) {
        if (!spId) {
            console.warn('Cannot load SP versions: No SP ID provided');
            return [];
        }
        
        try {
            console.log(`Loading versions for SP ${spId}...`);
            const response = await fetch(`/api/sps/versions/${spId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch SP versions: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Check for successful response with versions array
            if (result.success && Array.isArray(result.versions)) {
                // Format versions for dropdown
                const versions = result.versions.map(version => ({
                    id: version,
                    text: version
                }));
                
                console.log(`Loaded ${versions.length} versions for SP ${spId}`);
                return versions;
            } else {
                console.warn('Unexpected SP versions response format:', result);
                return [];
            }
        } catch (error) {
            console.error(`Error loading versions for SP ${spId}:`, error);
            return [];
        }
    },

    /**
     * Get SP name by ID
     * @param {string} spId - SP ID to get name for
     * @returns {Promise<string>} SP name
     */
    getSPName: async function(spId) {
        if (!spId) return 'Unknown';
        
        try {
            console.log(`Getting name for SP ${spId}...`);
            const response = await fetch(`/api/sps/name/${spId}`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch SP name: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Check API response format
            if (result.success && result.name) {
                return result.name;
            } else {
                // If the direct name lookup fails, try to find in all SPs
                const allSPs = await CISDropdownUtils.loadAllSPs();
                const sp = allSPs.find(sp => sp.id === spId);
                if (sp) {
                    return sp.text.split(' (')[0]; // Extract name part from "Name (ID)" format
                }
                
                // If still not found, return the ID
                return spId;
            }
        } catch (error) {
            console.error(`Error getting name for SP ${spId}:`, error);
            return spId; // Return the ID as fallback
        }
    }
};

// Export the utilities
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CISDropdownUtils;
} 