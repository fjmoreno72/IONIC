/**
 * CIS Plan API 2.0
 * 
 * Provides functions for interacting with the CIS Plan 2.0 API endpoints.
 * Uses the new GUID-based API structure.
 */

const CISApi2 = {
    /**
     * Fetch the entire CIS Plan data
     * @returns {Promise<Object>} The CIS Plan data
     */
    fetchCISPlanData: async function() {
        try {
            const response = await fetch('/api/v2/cis_plan');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching CIS Plan data:', error);
            this.showError('Failed to load CIS Plan data');
            return null;
        }
    },

    /**
     * Get an entity by its GUID
     * @param {string} guid - The GUID of the entity
     * @returns {Promise<Object>} The entity
     */
    getEntity: async function(guid) {
        try {
            const response = await fetch(`/api/v2/cis_plan/entity/${guid}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching entity ${guid}:`, error);
            this.showError('Failed to load entity details');
            return null;
        }
    },

    /**
     * Get entities of a specific type
     * @param {string} entityType - Type of entity (mission_network, network_segment, etc.)
     * @param {string} parentGuid - Optional parent GUID to filter by
     * @returns {Promise<Array>} Array of entities
     */
    getEntitiesByType: async function(entityType, parentGuid = null) {
        try {
            let url = `/api/v2/cis_plan/entities/${entityType}`;
            if (parentGuid) {
                url += `?parent_guid=${parentGuid}`;
            }
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching ${entityType} entities:`, error);
            this.showError(`Failed to load ${entityType} entities`);
            return [];
        }
    },

    /**
     * Create a new entity
     * @param {string} entityType - Type of entity to create
     * @param {string} parentGuid - GUID of the parent entity
     * @param {Object} attributes - Attributes for the new entity
     * @returns {Promise<Object>} The created entity
     */
    createEntity: async function(entityType, parentGuid, attributes) {
        try {
            const response = await fetch('/api/v2/cis_plan/entity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    entity_type: entityType,
                    parent_guid: parentGuid,
                    attributes: attributes
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error creating ${entityType}:`, error);
            this.showError(`Failed to create ${entityType}: ${error.message}`);
            return null;
        }
    },

    /**
     * Update an existing entity
     * @param {string} guid - GUID of the entity to update
     * @param {Object} attributes - Attributes to update
     * @returns {Promise<Object>} The updated entity
     */
    updateEntity: async function(guid, attributes) {
        try {
            const response = await fetch(`/api/v2/cis_plan/entity/${guid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(attributes)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error updating entity ${guid}:`, error);
            this.showError(`Failed to update entity: ${error.message}`);
            return null;
        }
    },

    /**
     * Delete an entity
     * @param {string} guid - GUID of the entity to delete
     * @returns {Promise<boolean>} Whether the deletion was successful
     */
    deleteEntity: async function(guid) {
        console.log(`CISApi2: Attempting to delete entity with GUID: ${guid}`);
        
        if (!guid) {
            console.error('CISApi2: deleteEntity called without a valid GUID');
            return false;
        }
        
        try {
            const response = await fetch(`/api/v2/cis_plan/entity/${guid}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`CISApi2: Delete API response status: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                // Try to get error details from response
                let errorMessage = `HTTP error! Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    console.warn('CISApi2: Could not parse error response as JSON', jsonError);
                }
                
                throw new Error(errorMessage);
            }
            
            try {
                const data = await response.json();
                console.log('CISApi2: Delete operation result:', data);
                return data.status === 'success';
            } catch (jsonError) {
                console.warn('CISApi2: Could not parse success response as JSON', jsonError);
                // If we can't parse the response but the request was successful, assume success
                return response.ok;
            }
        } catch (error) {
            console.error(`CISApi2: Error deleting entity ${guid}:`, error);
            this.showError(`Failed to delete entity: ${error.message}`);
            return false;
        }
    },

    /**
     * Get the full path to an entity
     * @param {string} guid - GUID of the entity
     * @returns {Promise<Array>} Path to the entity as array of [type, guid] tuples
     */
    getEntityPath: async function(guid) {
        try {
            const response = await fetch(`/api/v2/cis_plan/entity/${guid}/path`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching path for entity ${guid}:`, error);
            this.showError('Failed to load entity path');
            return [];
        }
    },

    /**
     * Get the hierarchy information for an entity
     * @param {string} guid - GUID of the entity
     * @returns {Promise<Object>} The hierarchy information with parent GUIDs
     */
    getEntityHierarchy: async function(guid) {
        try {
            const response = await fetch(`/api/v2/cis_plan/entity/${guid}/hierarchy`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching hierarchy for entity ${guid}:`, error);
            this.showError('Failed to load entity hierarchy');
            return {};
        }
    },

    /**
     * Update a configuration item
     * @param {string} interfaceGuid - GUID of the network interface or GP instance
     * @param {string} itemName - Name of the configuration item
     * @param {string} answerContent - New content for the configuration item
     * @returns {Promise<Object>} The updated configuration item
     */
    updateConfigurationItem: async function(interfaceGuid, itemName, answerContent) {
        try {
            const response = await fetch(`/api/v2/cis_plan/configuration_item/${interfaceGuid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    item_name: itemName,
                    answer_content: answerContent
                })
            });
            
            // Handle error status codes
            if (!response.ok) {
                if (response.status === 404) {
                    // For 404 errors, we'll return a partial success to avoid breaking the edit
                    console.warn(`Configuration item endpoint returned 404 for GUID: ${interfaceGuid}, item: ${itemName}`);
                    return {
                        status: 'warning',
                        message: 'Configuration item update endpoint not found, but edit was applied to parent entity'
                    };
                }
                
                // For other errors, try to parse the error response
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
                } catch (jsonError) {
                    // If parsing the error response fails, just use the status text
                    throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
                }
            }
            
            // Parse and return the successful response
            try {
                const data = await response.json();
                return data;
            } catch (jsonError) {
                // If for some reason we can't parse the response, still return success
                return {
                    status: 'success',
                    message: 'Configuration item updated successfully (response could not be parsed)'
                };
            }
        } catch (error) {
            console.error(`Error updating configuration item ${itemName} for ${interfaceGuid}:`, error);
            
            // Instead of showing an error to the user (which would be distracting),
            // we'll just return an error object and let the calling code decide how to handle it
            return {
                status: 'error',
                message: error.message || 'Unknown error updating configuration item'
            };
        }
    },

    /**
     * Refresh the configuration items for a GP instance
     * @param {string} gpInstanceGuid - GUID of the GP instance
     * @returns {Promise<Object>} The updated GP instance
     */
    refreshGPInstanceConfig: async function(gpInstanceGuid) {
        try {
            const response = await fetch(`/api/v2/cis_plan/gp_instance/${gpInstanceGuid}/refresh_config`, {
                method: 'POST'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error refreshing GP instance config:`, error);
            this.showError(`Failed to refresh configuration items: ${error.message}`);
            return null;
        }
    },

    /**
     * Get all security classifications
     * @returns {Promise<Array>} Array of security classifications
     */
    getSecurityClassifications: async function() {
        try {
            const response = await fetch('/api/v2/cis_plan/security_classifications');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching security classifications:', error);
            this.showError('Failed to load security classifications');
            return [];
        }
    },
    
    /**
     * Get security classification details by ID
     * @param {string} classificationId - The ID of the security classification (e.g., CL-UNCLASS)
     * @returns {Promise<Object|null>} The security classification details or null if not found
     */
    getSecurityClassificationById: async function(classificationId) {
        try {
            // Get all classifications and find the one with matching ID
            const response = await this.getSecurityClassifications();
            if (response && response.status === 'success' && response.data) {
                const classification = response.data.find(item => item.id === classificationId);
                return classification || null;
            }
            return null;
        } catch (error) {
            console.error(`Error fetching security classification ${classificationId}:`, error);
            return null;
        }
    },

    /**
     * Find a specific entity in the CIS plan structure
     * @param {Object} cisPlanData - The CIS plan data
     * @param {string} entityType - Type of entity to find
     * @param {string} entityGuid - GUID of the entity to find
     * @returns {Object|null} The found entity or null
     */
    findEntityInCISPlan: function(cisPlanData, entityType, entityGuid) {
        if (!cisPlanData || !entityType || !entityGuid) {
            return null;
        }

        // For mission networks
        if (entityType === 'mission_network' && cisPlanData.missionNetworks) {
            return cisPlanData.missionNetworks.find(network => network.guid === entityGuid) || null;
        }

        // For other entity types, we need to search deeper
        return this._recursiveEntitySearch(cisPlanData, entityType, entityGuid);
    },

    /**
     * Recursively search for an entity in the CIS plan structure
     * @param {Object} data - The CIS plan data or a portion of it
     * @param {string} entityType - Type of entity to find
     * @param {string} entityGuid - GUID of the entity to find
     * @returns {Object|null} The found entity or null
     * @private
     */
    _recursiveEntitySearch: function(data, entityType, entityGuid) {
        // Base case: no data to search
        if (!data) {
            return null;
        }

        // Check if this is an array
        if (Array.isArray(data)) {
            // Search each item in the array
            for (const item of data) {
                const result = this._recursiveEntitySearch(item, entityType, entityGuid);
                if (result) {
                    return result;
                }
            }
            return null;
        }

        // Check if this is the entity we're looking for
        if (data.guid === entityGuid && 
            ((entityType === 'security_domain' && data.id && data.id.startsWith('CL-')) ||
             (entityType === 'network_segment' && data.networkSegments !== undefined) ||
             (entityType === 'hw_stack' && data.assets !== undefined) ||
             (entityType === 'asset' && (data.networkInterfaces !== undefined || data.gpInstances !== undefined)) ||
             (entityType === 'network_interface' && data.configurationItems !== undefined) ||
             (entityType === 'gp_instance' && data.gpid !== undefined) ||
             (entityType === 'sp_instance' && data.spId !== undefined))) {
            return data;
        }

        // Recursively search in nested objects
        for (const key in data) {
            if (data.hasOwnProperty(key) && typeof data[key] === 'object') {
                const result = this._recursiveEntitySearch(data[key], entityType, entityGuid);
                if (result) {
                    return result;
                }
            }
        }

        return null;
    },

    /**
     * Show an error message to the user
     * @param {string} message - Error message to display
     */
    showError: function(message) {
        // Use toast notification if available, otherwise alert
        if (typeof showToast === 'function') {
            showToast(message, 'error');
        } else if (typeof CISDialogs2 !== 'undefined' && CISDialogs2.showErrorToast) {
            CISDialogs2.showErrorToast(message);
        } else {
            alert(message);
        }
    }
};
