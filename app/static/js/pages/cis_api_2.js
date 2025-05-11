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
                body: JSON.stringify({
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
        try {
            const response = await fetch(`/api/v2/cis_plan/entity/${guid}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            
            return true;
        } catch (error) {
            console.error(`Error deleting entity ${guid}:`, error);
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
            if (response && response.data && Array.isArray(response.data)) {
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
     * Show an error message to the user
     * @param {string} message - Error message to display
     */
    showError: function(message) {
        // Use toast notification if available, otherwise alert
        if (typeof showToast === 'function') {
            showToast(message, 'error');
        } else {
            alert(message);
        }
    }
};
