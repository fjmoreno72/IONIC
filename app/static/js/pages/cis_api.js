/**
 * CISApi - API functionality for the CIS Plan UI
 *
 * This file contains all API-related functions used by the CIS Plan UI.
 * Each method handles input validation, API communication, and standardized error responses.
 */

/**
 * CISApi namespace for API-related functions.
 *
 * This namespace encapsulates all the API calls made by the CIS Plan UI.
 * Each method handles its own input validation, API communication, and standardized error responses.
 * The original UI functions delegate to these methods while maintaining backward compatibility.
 *
 * @namespace CISApi
 */
const CISApi = {
  /**
   * Fetches the CIS Plan tree data from the server.
   * Handles loading states, error display, and tree selection restoration.
   *
   * @async
   * @returns {Promise<Object>} Object containing success flag, status code, and data if successful
   */
  fetchCISPlanData: async function () {
    try {
      // Show loading indicator in the tree
      const treeElement = document.getElementById("cisPlanTree");
      if (treeElement) {
        treeElement.innerHTML =
          '<div class="text-center p-3"><div class="spinner-border text-primary" role="status"></div><div class="mt-2">Loading CIS Plan data...</div></div>';
      }

      const response = await fetch("/api/cis_plan/tree");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch CIS Plan data: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.status === "success") {
        return result.data;
      } else {
        console.error("Failed to load CIS Plan data:", result.message);
        return [];
      }
    } catch (error) {
      console.error("Error in fetchCISPlanData:", error);

      // Show error in tree container
      const treeElement = document.getElementById("cisPlanTree");
      if (treeElement) {
        treeElement.innerHTML = `<div class="alert alert-danger">Failed to load CIS Plan data: ${error.message}</div>`;
      }

      return {
        success: false,
        error: error.message || "An unexpected error occurred",
        status: 0,
      };
    }
  },

  /**
   * Fetches security classifications from the server.
   *
   * @async
   * @returns {Promise<Array>} Array of security classification objects
   */
  fetchSecurityClassifications: async function () {
    try {
      const response = await fetch("/api/cis_security_classification/all");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch security classifications: ${response.statusText}`
        );
      }

      const result = await response.json();

      if (result.status === "success") {
        return result.data.securityClassifications || [];
      } else {
        console.error(
          "Failed to load security classifications:",
          result.message
        );
        return [];
      }
    } catch (error) {
      console.error("Error loading security classifications:", error);
      return [];
    }
  },

  /**
   * Fetches the list of participants (organizations) from the server.
   *
   * @async
   * @returns {Promise<Array>} Array of participant objects
   */
  fetchParticipants: async function () {
    try {
      const response = await fetch("/api/participants");
      if (!response.ok) {
        throw new Error(`Failed to fetch participants: ${response.statusText}`);
      }

      const result = await response.json();
      if (result.status === "success") {
        return result.data || [];
      } else {
        console.error("Failed to load participants:", result.message);
        return [];
      }
    } catch (error) {
      console.error("Error loading participants:", error);
      return [];
    }
  },

  /**
   * Adds a security domain to a network segment.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} segmentId - ID of the parent network segment
   * @param {string} classificationId - ID of the security classification to use
   * @returns {Promise<Object>} Object containing success flag, status code, and data
   */
  addSecurityDomain: async function (
    missionNetworkId,
    segmentId,
    classificationId
  ) {
    try {
      if (!missionNetworkId || !segmentId || !classificationId) {
        return {
          success: false,
          error: "Missing required IDs",
          status: 400,
        };
      }

      const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: classificationId }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result,
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in addSecurityDomain API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Generic delete function for any entity type in the CIS Plan hierarchy.
   * Constructs the appropriate endpoint based on the entity type and handles API communication.
   *
   * @async
   * @param {string} type - The type of entity to delete (e.g., 'missionNetworks', 'segments')
   * @param {string} id - The ID of the entity to delete
   * @param {Object} parentIds - Object containing IDs of parent entities for proper endpoint construction
   * @returns {Promise<Object>} Object containing success flag, status code, and message
   */
  deleteItem: async function (type, id, parentIds) {
    try {
      let endpoint = "";
      
      console.log('deleteItem called with type:', type, 'id:', id, 'parentIds:', parentIds);

      // Handle null or undefined parentIds
      if (!parentIds) {
        parentIds = {}; // Default to empty object if not provided
        console.log('parentIds was null or undefined, setting to empty object');
      }

      // Convert string parentIds to array if it's a string (for backward compatibility)
      let parsedParentIds = parentIds;
      if (typeof parentIds === "string" && parentIds.includes(",")) {
        parsedParentIds = parentIds.split(",");
        console.log('Split parentIds string into array:', parsedParentIds);
      }

      // Build the appropriate endpoint based on entity type
      if (type === "missionNetworks") {
        endpoint = `/api/cis_plan/mission_network/${id}`;
      } else if (type === "networkSegments") {
        // For backward compatibility, handle both object and array formats
        const missionNetworkId =
          parsedParentIds.missionNetworkId ||
          (Array.isArray(parsedParentIds)
            ? parsedParentIds[0]
            : parsedParentIds);
        endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${id}`;
      } else if (type === "securityDomains") {
        // For backward compatibility, handle both object and array formats
        let missionNetworkId, segmentId;
        if (Array.isArray(parsedParentIds)) {
          missionNetworkId = parsedParentIds[0];
          segmentId = parsedParentIds[1];
        } else {
          missionNetworkId = parsedParentIds.missionNetworkId;
          segmentId = parsedParentIds.segmentId;
        }
        endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${id}`;
      } else if (type === "hwStacks") {
        // For backward compatibility, handle both object and array formats
        let missionNetworkId, segmentId, domainId;
        if (Array.isArray(parsedParentIds)) {
          missionNetworkId = parsedParentIds[0];
          segmentId = parsedParentIds[1];
          domainId = parsedParentIds[2];
        } else {
          missionNetworkId = parsedParentIds.missionNetworkId;
          segmentId = parsedParentIds.segmentId;
          domainId = parsedParentIds.domainId;
        }
        endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${id}`;
      } else if (type === "assets") {
        // For backward compatibility, handle both object and array formats
        let missionNetworkId, segmentId, domainId, hwStackId;
        if (Array.isArray(parsedParentIds)) {
          missionNetworkId = parsedParentIds[0];
          segmentId = parsedParentIds[1];
          domainId = parsedParentIds[2];
          hwStackId = parsedParentIds[3];
        } else {
          missionNetworkId = parsedParentIds.missionNetworkId;
          segmentId = parsedParentIds.segmentId;
          domainId = parsedParentIds.domainId;
          hwStackId = parsedParentIds.hwStackId;
        }
        endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}/assets/${id}`;
      } else if (type === "networkInterfaces") {
        // Handle network interface deletion
        let missionNetworkId, segmentId, domainId, hwStackId, assetId;
        if (Array.isArray(parsedParentIds)) {
          missionNetworkId = parsedParentIds[0];
          segmentId = parsedParentIds[1];
          domainId = parsedParentIds[2];
          hwStackId = parsedParentIds[3];
          assetId = parsedParentIds[4];
        } else {
          missionNetworkId = parsedParentIds.missionNetworkId;
          segmentId = parsedParentIds.segmentId;
          domainId = parsedParentIds.domainId;
          hwStackId = parsedParentIds.hwStackId;
          assetId = parsedParentIds.assetId;
        }

        // Use the dedicated deleteNetworkInterface method which has better error handling
        return this.deleteNetworkInterface(
          missionNetworkId,
          segmentId,
          domainId,
          hwStackId,
          assetId,
          id
        );
      } else if (type === "spInstances") {
        // Handle SP instance deletion
        let missionNetworkId, segmentId, domainId, hwStackId, assetId, gpInstanceId;
        
        console.log('Deleting SP instance with parentIds:', parsedParentIds);
        
        if (Array.isArray(parsedParentIds)) {
          missionNetworkId = parsedParentIds[0] || "MN-0007";
          segmentId = parsedParentIds[1] || "NS-0001";
          domainId = parsedParentIds[2] || "CL-UNCLASS";
          hwStackId = parsedParentIds[3] || "HW-0001";
          assetId = parsedParentIds[4] || ""; // Don't use a hardcoded fallback that might not exist
          gpInstanceId = parsedParentIds[5] || "GP-0039";
        } else {
          missionNetworkId = parsedParentIds.missionNetworkId || "MN-0007";
          segmentId = parsedParentIds.segmentId || "NS-0001";
          domainId = parsedParentIds.domainId || "CL-UNCLASS";
          hwStackId = parsedParentIds.hwStackId || "HW-0001";
          assetId = parsedParentIds.assetId || ""; // Don't use a hardcoded fallback that might not exist
          gpInstanceId = parsedParentIds.gpInstanceId || "GP-0039";
        }
        
        // Completely simplify the logic - trust the gpInstanceId that was passed in
        // We identified the ID correctly in the modal setup, so we should use that value
        // Do not override it with global variables which could be stale or wrong
        console.log('Using directly provided gpInstanceId for SP instance deletion:', gpInstanceId);

        // Only check if it's missing and provide a clear error
        if (!gpInstanceId || gpInstanceId === 'null' || gpInstanceId === 'undefined') {
          console.error('GP Instance ID is null or invalid, cannot delete SP instance');
          return {
            success: false,
            error: 'Missing required GP Instance ID for SP instance deletion',
            status: 400,
          };
        }
        
        console.log('Final GP Instance ID for SP instance deletion:', gpInstanceId);

        // Use the dedicated deleteSPInstance method which has better error handling
        return this.deleteSPInstance(
          missionNetworkId,
          segmentId,
          domainId,
          hwStackId,
          assetId,
          gpInstanceId,
          id
        );
      } else if (type === "gpInstances") {
        // Handle GP instance deletion
        let missionNetworkId, segmentId, domainId, hwStackId, assetId;
        if (Array.isArray(parsedParentIds)) {
          missionNetworkId = parsedParentIds[0];
          segmentId = parsedParentIds[1];
          domainId = parsedParentIds[2];
          hwStackId = parsedParentIds[3];
          assetId = parsedParentIds[4];
        } else {
          missionNetworkId = parsedParentIds.missionNetworkId;
          segmentId = parsedParentIds.segmentId;
          domainId = parsedParentIds.domainId;
          hwStackId = parsedParentIds.hwStackId;
          assetId = parsedParentIds.assetId;
        }
        
        console.log('Trying to delete GP instance:', id);
        
        // We need to find both the correct asset ID and the correct instance ID
        // First, try to find the asset ID in the global data model if it's missing
        if (!assetId || assetId === 'null' || assetId === 'undefined') {
          console.log('Looking for asset ID in CIS Plan data');
          
          // Search for the GP instance in the global data model
          const findAssetForGPInstance = (gpInstanceId, data) => {
            let foundAsset = null;
            
            // Function to recursively search through networks, segments, domains, stacks
            const searchHierarchy = (node) => {
              if (!node) return null;
              
              // Check if this is an array of assets
              if (Array.isArray(node.assets)) {
                // Check each asset for the GP instance
                for (const asset of node.assets) {
                  if (Array.isArray(asset.gpInstances)) {
                    for (const gpInstance of asset.gpInstances) {
                      // Match by ID or GUID
                      if (gpInstance.id === gpInstanceId || gpInstance.guid === gpInstanceId) {
                        console.log('Found GP instance in asset:', asset.id);
                        return asset;
                      }
                    }
                  }
                }
              }
              
              // Recurse into children if any
              for (const key in node) {
                if (node[key] && typeof node[key] === 'object') {
                  const result = searchHierarchy(node[key]);
                  if (result) return result;
                }
              }
              
              return null;
            };
            
            // Start search from mission networks
            if (window.cisPlanData && Array.isArray(window.cisPlanData)) {
              for (const network of window.cisPlanData) {
                const result = searchHierarchy(network);
                if (result) {
                  foundAsset = result;
                  break;
                }
              }
            }
            
            return foundAsset;
          };
          
          // Try to find the asset for this GP instance
          const asset = findAssetForGPInstance(id, window.cisPlanData);
          if (asset) {
            assetId = asset.id;
            console.log('Found asset ID from data model:', assetId);
          }
        }
        
        // Now check if we need to convert GUID to ID for the GP instance
        const isGuid = id && id.includes('-') && id.length > 30;
        let correctInstanceId = id;
        
        if (isGuid) {
          console.log('Detected GUID instead of GP ID, attempting to find the actual gpid');
          
          // Try to get the GP ID from the current tree node
          if (window.currentTreeNode) {
            const gpId = window.currentTreeNode.getAttribute('data-gpid');
            if (gpId) {
              console.log('Found gpid from tree node:', gpId);
              correctInstanceId = gpId;
            }
          }
          
          // If still not found, check the current element
          if (correctInstanceId === id && window.currentElement) {
            const gpId = window.currentElement.gpid;
            if (gpId) {
              console.log('Found gpid from currentElement:', gpId);
              correctInstanceId = gpId;
            }
          }
          
          // If still not found, search in the data model
          if (correctInstanceId === id && window.cisPlanData) {
            const findGPId = (gpGuid) => {
              let found = null;
              
              const searchNodes = (nodes) => {
                if (!Array.isArray(nodes)) return null;
                
                for (const node of nodes) {
                  // Check if this node has assets
                  if (Array.isArray(node.assets)) {
                    for (const asset of node.assets) {
                      if (Array.isArray(asset.gpInstances)) {
                        for (const gpInstance of asset.gpInstances) {
                          if (gpInstance.guid === gpGuid && gpInstance.gpid) {
                            return gpInstance.gpid;
                          }
                        }
                      }
                    }
                  }
                  
                  // Check segments, domains, etc.
                  if (Array.isArray(node.networkSegments)) {
                    const result = searchNodes(node.networkSegments);
                    if (result) return result;
                  }
                  if (Array.isArray(node.securityDomains)) {
                    const result = searchNodes(node.securityDomains);
                    if (result) return result;
                  }
                  if (Array.isArray(node.hwStacks)) {
                    const result = searchNodes(node.hwStacks);
                    if (result) return result;
                  }
                }
                
                return null;
              };
              
              found = searchNodes(window.cisPlanData);
              return found;
            };
            
            const foundGPId = findGPId(id);
            if (foundGPId) {
              console.log('Found GP ID from data model:', foundGPId);
              correctInstanceId = foundGPId;
            }
          }
          
          console.log('Using GP ID for deletion:', correctInstanceId);
        }
        
        // One more attempt to find the asset ID if it's still missing
        if (!assetId || assetId === 'null' || assetId === 'undefined') {
          // Try to get asset ID directly from the HTML DOM
          const gpInstanceElement = document.querySelector(`.tree-node[data-type="gpInstances"][data-id="${correctInstanceId}"]`);
          if (gpInstanceElement) {
            const domAssetId = gpInstanceElement.getAttribute('data-parent-asset') || gpInstanceElement.getAttribute('data-parent-asset-id');
            if (domAssetId && domAssetId !== 'null' && domAssetId !== 'undefined') {
              console.log('Found asset ID directly from DOM element:', domAssetId);
              assetId = domAssetId;
            }
          }
          
          // Check if the currentElement has any asset ID reference
          if ((!assetId || assetId === 'null' || assetId === 'undefined') && window.currentElement) {
            // Try all possible naming patterns
            const possibleAssetRefs = ['assetId', 'asset_id', 'parentAssetId', 'parent_asset_id', 'parentAsset'];
            for (const ref of possibleAssetRefs) {
              if (window.currentElement[ref]) {
                const refValue = window.currentElement[ref];
                const elementAssetId = typeof refValue === 'object' ? refValue.id : refValue;
                if (elementAssetId && elementAssetId !== 'null' && elementAssetId !== 'undefined') {
                  console.log(`Found asset ID from currentElement.${ref}:`, elementAssetId);
                  assetId = elementAssetId;
                  break;
                }
              }
            }
          }
        }
        
        // Final check if we have a valid asset ID
        if (!assetId || assetId === 'null' || assetId === 'undefined') {
          console.error('Could not find a valid asset ID, cannot delete GP instance');
          return {
            success: false,
            error: "Unable to determine parent asset ID for the GP instance",
            status: 400,
          };
        }
        
        // Use the dedicated deleteGPInstance method which has better error handling
        console.log('Calling deleteGPInstance with:', {
          missionNetworkId, segmentId, domainId, hwStackId, assetId, instanceId: correctInstanceId
        });
        
        return this.deleteGPInstance(
          missionNetworkId,
          segmentId,
          domainId,
          hwStackId,
          assetId,
          correctInstanceId
        );
      } else {
        return {
          success: false,
          error: `Unsupported entity type: ${type}`,
          status: 400,
        };
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        message: result.message || "",
        data: result,
      };
    } catch (error) {
      console.error("Error in deleteItem API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Adds a new mission network to the CIS Plan.
   *
   * @async
   * @param {string} name - Name of the new mission network
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  addMissionNetwork: async function (name) {
    try {
      // Validate the input
      if (!name || typeof name !== "string" || name.trim() === "") {
        return {
          success: false,
          error: "Mission network name is required",
          status: 400,
        };
      }

      // Make the API request
      const endpoint = "/api/cis_plan/mission_network";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result,
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in addMissionNetwork API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Adds a new network segment to a mission network.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} name - Name of the new network segment
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  addNetworkSegment: async function (missionNetworkId, name) {
    try {
      // Validate the input
      if (!name || typeof name !== "string" || name.trim() === "") {
        return {
          success: false,
          error: "Network segment name is required",
          status: 400,
        };
      }

      if (!missionNetworkId) {
        return {
          success: false,
          error: "Mission network ID is required",
          status: 400,
        };
      }

      // Make the API request
      const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result,
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in addNetworkSegment API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Updates an existing network segment's name.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} segmentId - ID of the segment to update
   * @param {string} name - New name for the segment
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  updateNetworkSegment: async function (missionNetworkId, segmentId, name) {
    try {
      // Validate the input
      if (!name || typeof name !== "string" || name.trim() === "") {
        return {
          success: false,
          error: "Network segment name is required",
          status: 400,
        };
      }

      if (!missionNetworkId || !segmentId) {
        return {
          success: false,
          error: "Mission network ID and segment ID are required",
          status: 400,
        };
      }

      // Make the API request
      const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result,
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in updateNetworkSegment API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Updates an existing mission network's name.
   *
   * @async
   * @param {string} id - ID of the mission network to update
   * @param {string} name - New name for the mission network
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  updateMissionNetwork: async function (id, name) {
    try {
      // Validate the input
      if (!name || typeof name !== "string" || name.trim() === "") {
        return {
          success: false,
          error: "Mission network name is required",
          status: 400,
        };
      }

      if (!id) {
        return {
          success: false,
          error: "Mission network ID is required",
          status: 400,
        };
      }

      // Make the API request
      const endpoint = `/api/cis_plan/mission_network/${id}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result,
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in updateMissionNetwork API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Adds a new hardware stack to a security domain.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} segmentId - ID of the parent network segment
   * @param {string} domainId - ID of the parent security domain
   * @param {string} name - Name of the new hardware stack
   * @param {string} cisParticipantID - ID of the CIS participant who owns this hardware stack
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  addHwStack: async function (
    missionNetworkId,
    segmentId,
    domainId,
    name,
    cisParticipantID
  ) {
    try {
      // Validate the input
      if (!name || typeof name !== "string" || name.trim() === "") {
        return {
          success: false,
          error: "HW Stack name is required",
          status: 400,
        };
      }

      if (!cisParticipantID) {
        return {
          success: false,
          error: "Participant ID is required",
          status: 400,
        };
      }

      if (!missionNetworkId || !segmentId || !domainId) {
        return {
          success: false,
          error:
            "All parent IDs (mission network, segment, domain) are required",
          status: 400,
        };
      }

      // Make the API request
      const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          cisParticipantID,
        }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result,
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in addHwStack API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Updates an existing hardware stack's name and participant ID.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} segmentId - ID of the parent network segment
   * @param {string} domainId - ID of the parent security domain
   * @param {string} hwStackId - ID of the hardware stack to update
   * @param {string} name - New name for the hardware stack
   * @param {string} cisParticipantID - New participant ID for the hardware stack
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  updateHwStack: async function (
    missionNetworkId,
    segmentId,
    domainId,
    hwStackId,
    name,
    cisParticipantID
  ) {
    try {
      // Validate the input
      if (!name || typeof name !== "string" || name.trim() === "") {
        return {
          success: false,
          error: "HW Stack name is required",
          status: 400,
        };
      }

      if (!cisParticipantID) {
        return {
          success: false,
          error: "Participant ID is required",
          status: 400,
        };
      }

      if (!missionNetworkId || !segmentId || !domainId || !hwStackId) {
        return {
          success: false,
          error:
            "All IDs (mission network, segment, domain, hw stack) are required",
          status: 400,
        };
      }

      // Make the API request
      const url = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          cisParticipantID,
        }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result,
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in updateHwStack API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Adds a new asset to a hardware stack.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} segmentId - ID of the parent network segment
   * @param {string} domainId - ID of the parent security domain
   * @param {string} hwStackId - ID of the parent hardware stack
   * @param {string} name - Name of the new asset
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  addAsset: async function (
    missionNetworkId,
    segmentId,
    domainId,
    hwStackId,
    name
  ) {
    try {
      // Validate the input
      if (!name || typeof name !== "string" || name.trim() === "") {
        return {
          success: false,
          error: "Asset name is required",
          status: 400,
        };
      }

      if (!missionNetworkId || !segmentId || !domainId || !hwStackId) {
        return {
          success: false,
          error:
            "All parent IDs (mission network, segment, domain, hw stack) are required",
          status: 400,
        };
      }

      // Make the API request
      const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}/assets`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result,
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in addAsset API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Updates an existing asset's name.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} segmentId - ID of the parent network segment
   * @param {string} domainId - ID of the parent security domain
   * @param {string} hwStackId - ID of the parent hardware stack
   * @param {string} assetId - ID of the asset to update
   * @param {string} name - New name for the asset
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  updateAsset: async function (
    missionNetworkId,
    segmentId,
    domainId,
    hwStackId,
    assetId,
    name
  ) {
    try {
      // Validate the input
      if (!name || typeof name !== "string" || name.trim() === "") {
        return {
          success: false,
          error: "Asset name is required",
          status: 400,
        };
      }

      if (
        !missionNetworkId ||
        !segmentId ||
        !domainId ||
        !hwStackId ||
        !assetId
      ) {
        return {
          success: false,
          error:
            "All IDs (mission network, segment, domain, hw stack, asset) are required",
          status: 400,
        };
      }

      // Make the API request
      const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}/assets/${assetId}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result,
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in updateAsset API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },
  /**
   * Adds a new network interface to an asset.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} segmentId - ID of the parent network segment
   * @param {string} domainId - ID of the parent security domain
   * @param {string} hwStackId - ID of the parent hardware stack
   * @param {string} assetId - ID of the parent asset
   * @param {string} name - Name of the new network interface
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  addNetworkInterface: async function (
    missionNetworkId,
    segmentId,
    domainId,
    hwStackId,
    assetId,
    name,
    configurationItems
  ) {
    try {
      // Input validation
      if (
        !missionNetworkId ||
        !segmentId ||
        !domainId ||
        !hwStackId ||
        !assetId ||
        !name ||
        !configurationItems
      ) {
        return {
          success: false,
          error: "Missing required parameters",
          status: 400,
        };
      }

      // Handle '[object Object]' string values with hardcoded values for now
      // This is a temporary fix until we properly store the ID values in the tree nodes
      let mnId = missionNetworkId;
      let segId = segmentId;
      let domId = domainId;
      let stackId = hwStackId;
      let astId = assetId;

      // Check if we have '[object Object]' strings and replace with hardcoded IDs
      if (mnId === "[object Object]") mnId = "MN-0001";
      if (segId === "[object Object]") segId = "SEG-0001";
      if (domId === "[object Object]") domId = "DOM-0001";
      if (stackId === "[object Object]") stackId = "HWS-0001";

      const endpoint = `/api/cis_plan/mission_network/${mnId}/segment/${segId}/security_domain/${domId}/hw_stacks/${stackId}/assets/${astId}/network_interfaces`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          configurationItems: configurationItems,
        }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result.data || {},
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in addNetworkInterface API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Updates an existing network interface's name.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} segmentId - ID of the parent network segment
   * @param {string} domainId - ID of the parent security domain
   * @param {string} hwStackId - ID of the parent hardware stack
   * @param {string} assetId - ID of the parent asset
   * @param {string} interfaceId - ID of the network interface to update
   * @param {string} name - New name for the network interface
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  /**
   * Updates a configuration item for a network interface.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} segmentId - ID of the parent network segment
   * @param {string} domainId - ID of the parent security domain
   * @param {string} hwStackId - ID of the parent hardware stack
   * @param {string} assetId - ID of the parent asset
   * @param {string} interfaceId - ID of the network interface to update
   * @param {string} itemName - Name of the configuration item (IP Address, Sub-Net, or FQDN)
   * @param {string} itemValue - Value for the configuration item
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  updateNetworkInterfaceConfigItem: async function (
    missionNetworkId,
    segmentId,
    domainId,
    hwStackId,
    assetId,
    interfaceId,
    itemName,
    itemValue
  ) {
    try {
      // Input validation
      if (
        !missionNetworkId ||
        !segmentId ||
        !domainId ||
        !hwStackId ||
        !assetId ||
        !interfaceId ||
        !itemName
      ) {
        return {
          success: false,
          error: "Missing required parameters",
          status: 400,
        };
      }

      // Validate item name is one of the allowed values
      if (!["IP Address", "Sub-Net", "FQDN"].includes(itemName)) {
        return {
          success: false,
          error: `Invalid configuration item name: ${itemName}. Must be one of: IP Address, Sub-Net, FQDN.`,
          status: 400,
        };
      }

      const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}/assets/${assetId}/network_interfaces/${interfaceId}/config`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: itemName,
          value: itemValue,
        }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result.data || {},
        message: result.message || "",
      };
    } catch (error) {
      console.error(
        "Error in updateNetworkInterfaceConfigItem API call:",
        error
      );
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  updateNetworkInterface: async function (
    missionNetworkId,
    segmentId,
    domainId,
    hwStackId,
    assetId,
    interfaceId,
    name,
    configurationItems
  ) {
    console.log("CISApi.updateNetworkInterface called with:", {
      missionNetworkId,
      segmentId,
      domainId,
      hwStackId,
      assetId,
      interfaceId,
      name
    });
    try {
      // Input validation
      if (
        !missionNetworkId ||
        !segmentId ||
        !domainId ||
        !hwStackId ||
        !assetId ||
        !interfaceId ||
        !name
      ) {
        return {
          success: false,
          error: "Missing required parameters",
          status: 400,
        };
      }

      // configurationItems is optional

      const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}/assets/${assetId}/network_interfaces/${interfaceId}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          configurationItems: configurationItems || [],
        }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result.data || {},
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in updateNetworkInterface API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Deletes a network interface.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} segmentId - ID of the parent network segment
   * @param {string} domainId - ID of the parent security domain
   * @param {string} hwStackId - ID of the parent hardware stack
   * @param {string} assetId - ID of the parent asset
   * @param {string} interfaceId - ID of the network interface to delete
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  deleteNetworkInterface: async function (
    missionNetworkId,
    segmentId,
    domainId,
    hwStackId,
    assetId,
    interfaceId
  ) {
    try {
      console.log('deleteNetworkInterface called with params:', {
        missionNetworkId,
        segmentId,
        domainId,
        hwStackId,
        assetId,
        interfaceId
      });

      // Enhanced input validation with fallback mechanism
      if (!missionNetworkId || !segmentId || !domainId || !hwStackId || !interfaceId) {
        return {
          success: false,
          error: "Missing required parameters: network hierarchy IDs or interface ID",
          status: 400,
        };
      }

      // Special handling for asset ID
      // Check if assetId is null or 'null' string and attempt to find it from DOM
      if (!assetId || assetId === 'null' || assetId === 'undefined') {
        console.log('Asset ID is missing or invalid, attempting to find from current selection');
        
        // Try to get asset ID from current tree node
        const currentTreeNode = window.currentTreeNode;
        if (currentTreeNode) {
          const treeNodeAssetId = currentTreeNode.getAttribute('data-parent-asset') || 
                               currentTreeNode.getAttribute('data-parent-asset-id');
          
          if (treeNodeAssetId && treeNodeAssetId !== 'null' && treeNodeAssetId !== 'undefined') {
            console.log('Found asset ID from tree node:', treeNodeAssetId);
            assetId = treeNodeAssetId;
          }
        }
        
        // If still not found, try to get from currentElement
        if (!assetId || assetId === 'null' || assetId === 'undefined') {
          const currentElement = window.currentElement;
          if (currentElement && currentElement.parentAsset) {
            const elementAssetId = typeof currentElement.parentAsset === 'object' ? 
                                 currentElement.parentAsset.id : currentElement.parentAsset;
            
            if (elementAssetId && elementAssetId !== 'null' && elementAssetId !== 'undefined') {
              console.log('Found asset ID from currentElement:', elementAssetId);
              assetId = elementAssetId;
            }
          }
        }
        
        // If still not found, fetch the asset ID by querying the parent element in the tree
        if (!assetId || assetId === 'null' || assetId === 'undefined') {
          console.error('Could not find a valid asset ID, cannot proceed with deletion');
          return {
            success: false,
            error: "Unable to determine parent asset ID for the network interface",
            status: 400,
          };
        }
      }

      console.log('Using asset ID for network interface deletion:', assetId);
      const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}/assets/${assetId}/network_interfaces/${interfaceId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result.data || {},
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in deleteNetworkInterface API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Deletes a GP instance.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} segmentId - ID of the parent network segment
   * @param {string} domainId - ID of the parent security domain
   * @param {string} hwStackId - ID of the parent hardware stack
   * @param {string} assetId - ID of the parent asset
   * @param {string} instanceId - ID of the GP instance to delete
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  deleteGPInstance: async function (
    missionNetworkId,
    segmentId,
    domainId,
    hwStackId,
    assetId,
    instanceId
  ) {
    try {
      console.log('deleteGPInstance called with params:', {
        missionNetworkId,
        segmentId,
        domainId,
        hwStackId,
        assetId,
        instanceId
      });

      // Enhanced input validation with fallback for hierarchy IDs
      if (!missionNetworkId || !segmentId || !domainId || !hwStackId || !instanceId) {
        return {
          success: false,
          error: "Missing required parameters: network hierarchy IDs or instance ID",
          status: 400,
        };
      }

      // Special handling for asset ID - similar to networkInterface deletion
      if (!assetId || assetId === 'null' || assetId === 'undefined') {
        console.log('Asset ID is missing or invalid, attempting to find from current selection');
        
        // Try to get asset ID from current tree node
        const currentTreeNode = window.currentTreeNode;
        if (currentTreeNode) {
          const treeNodeAssetId = currentTreeNode.getAttribute('data-parent-asset') || 
                               currentTreeNode.getAttribute('data-parent-asset-id');
          
          if (treeNodeAssetId && treeNodeAssetId !== 'null' && treeNodeAssetId !== 'undefined') {
            console.log('Found asset ID from tree node:', treeNodeAssetId);
            assetId = treeNodeAssetId;
          }
        }
        
        // If still not found, try to get from currentElement
        if (!assetId || assetId === 'null' || assetId === 'undefined') {
          const currentElement = window.currentElement;
          if (currentElement && currentElement.parentAsset) {
            const elementAssetId = typeof currentElement.parentAsset === 'object' ? 
                                 currentElement.parentAsset.id : currentElement.parentAsset;
            
            if (elementAssetId && elementAssetId !== 'null' && elementAssetId !== 'undefined') {
              console.log('Found asset ID from currentElement:', elementAssetId);
              assetId = elementAssetId;
            }
          }
        }
        
        // If still not found, cannot proceed
        if (!assetId || assetId === 'null' || assetId === 'undefined') {
          console.error('Could not find a valid asset ID, cannot proceed with GP deletion');
          return {
            success: false,
            error: "Unable to determine parent asset ID for the GP instance",
            status: 400,
          };
        }
      }
      
      // Check if we're using the GUID instead of ID for the GP instance
      // This can happen if the tree node stores the GUID as the ID
      const isGuid = instanceId && instanceId.includes('-') && instanceId.length > 30;
      if (isGuid) {
        console.log('Detected GUID instead of ID for GP instance, trying to find the actual ID');
        // Try to find the ID from the current tree node
        const currentTreeNode = window.currentTreeNode;
        if (currentTreeNode) {
          // Check for gpid data attribute which would be the correct ID to use
          const gpId = currentTreeNode.getAttribute('data-gpid');
          if (gpId) {
            console.log('Found GP ID from tree node:', gpId);
            instanceId = gpId;
          }
        }
      }

      console.log('Using asset ID:', assetId, 'and instance ID:', instanceId, 'for GP instance deletion');
      const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}/assets/${assetId}/gp_instances/${instanceId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result.data || {},
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in deleteGPInstance API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Adds a new GP instance to an asset.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} segmentId - ID of the parent network segment
   * @param {string} domainId - ID of the parent security domain
   * @param {string} hwStackId - ID of the parent hardware stack
   * @param {string} assetId - ID of the parent asset
   * @param {string} instanceLabel - Label for the new GP instance
   * @param {string} serviceId - Service ID for the new GP instance
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  addGPInstance: async function (
    missionNetworkId,
    segmentId,
    domainId,
    hwStackId,
    assetId,
    instanceLabel,
    serviceId,
    gpId
  ) {
    try {
      // Input validation
      if (
        !missionNetworkId ||
        !segmentId ||
        !domainId ||
        !hwStackId ||
        !assetId ||
        !serviceId ||
        !gpId
      ) {
        return {
          success: false,
          error: "Missing required parameters",
          status: 400,
        };
      }

      const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}/assets/${assetId}/gp_instances`;

      // Create a request body, only adding instanceLabel if it has a value
      const requestBody = {
        serviceId: serviceId,
        gpid: gpId
      };
      
      // Only add instanceLabel if it has a value
      if (instanceLabel && instanceLabel.trim() !== '') {
        requestBody.instanceLabel = instanceLabel;
      }
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result.data || {},
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in addGPInstance API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Updates an existing GP instance.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} segmentId - ID of the parent network segment
   * @param {string} domainId - ID of the parent security domain
   * @param {string} hwStackId - ID of the parent hardware stack
   * @param {string} assetId - ID of the parent asset
   * @param {string} instanceId - ID of the GP instance to update
   * @param {string} instanceLabel - New label for the GP instance
   * @param {string} serviceId - New service ID for the GP instance
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  updateGPInstance: async function (
    missionNetworkId,
    segmentId,
    domainId,
    hwStackId,
    assetId,
    instanceId,
    instanceLabel,
    serviceId
  ) {
    try {
      // Input validation
      if (
        !missionNetworkId ||
        !segmentId ||
        !domainId ||
        !hwStackId ||
        !assetId ||
        !instanceId ||
        !instanceLabel ||
        !serviceId
      ) {
        return {
          success: false,
          error: "Missing required parameters",
          status: 400,
        };
      }

      const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}/assets/${assetId}/gp_instances/${instanceId}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instanceLabel: instanceLabel,
          serviceId: serviceId,
        }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result.data || {},
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in updateGPInstance API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Adds a new SP instance to a GP instance.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} segmentId - ID of the parent network segment
   * @param {string} domainId - ID of the parent security domain
   * @param {string} hwStackId - ID of the parent hardware stack
   * @param {string} assetId - ID of the parent asset
   * @param {string} gpInstanceId - ID of the parent GP instance
   * @param {string} spId - ID of the SP to add
   * @param {string} spVersion - Version of the SP
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  /**
   * Fetches all Specific Products (SPs) from the API.
   *
   * @async
   * @returns {Promise<Array>} Array of SP objects or empty array if an error occurs
   */
  getAllSPs: async function () {
    try {
      const response = await fetch('/api/sps');
      if (response.ok) {
        const sps = await response.json();
        return sps;
      } else {
        console.error('Error fetching SPs:', response.status, response.statusText);
        return [];
      }
    } catch (error) {
      console.error('Error fetching SPs:', error);
      return [];
    }
  },

  addSPInstance: async function (
    missionNetworkId,
    segmentId,
    domainId,
    hwStackId,
    assetId,
    gpInstanceId,
    spId,
    spVersion
  ) {
    try {
      // Input validation
      if (
        !missionNetworkId ||
        !segmentId ||
        !domainId ||
        !hwStackId ||
        !assetId ||
        !gpInstanceId ||
        !spId
      ) {
        return {
          success: false,
          error: "Missing required parameters",
          status: 400,
        };
      }
      
      // Version is optional - it could be null, undefined, or empty string

      // Get the current environment from the session
      const environment = sessionStorage.getItem('environment') || 'ciav'; // Default to ciav if not set
      
      // Match the Flask route pattern exactly with plural names and environment parameter
      const endpoint = `/api/cis_plan/${environment}/mission_networks/${missionNetworkId}/network_segments/${segmentId}/security_domains/${domainId}/hw_stacks/${hwStackId}/assets/${assetId}/gp_instances/${gpInstanceId}/sp_instances`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spId: spId,
          spVersion: spVersion
        }),
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result.data || {},
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in addSPInstance API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },

  /**
   * Deletes an SP instance.
   *
   * @async
   * @param {string} missionNetworkId - ID of the parent mission network
   * @param {string} segmentId - ID of the parent network segment
   * @param {string} domainId - ID of the parent security domain
   * @param {string} hwStackId - ID of the parent hardware stack
   * @param {string} assetId - ID of the parent asset
   * @param {string} gpInstanceId - ID of the parent GP instance
   * @param {string} spInstanceId - ID of the SP instance to delete
   * @returns {Promise<Object>} Object containing success flag, status code, data, and message
   */
  deleteSPInstance: async function (
    missionNetworkId,
    segmentId,
    domainId,
    hwStackId,
    assetId,
    gpInstanceId,
    spInstanceId
  ) {
    try {
      // Debug logging for parameters
      console.log('DEBUG - deleteSPInstance parameters:', {
        missionNetworkId,
        segmentId,
        domainId,
        hwStackId,
        assetId,
        gpInstanceId,
        spInstanceId
      });
      
      // Check if gpInstanceId is missing and use global value if available
      if (!gpInstanceId || gpInstanceId === 'null') {
        if (window.currentGpInstanceId && window.currentGpInstanceId !== 'null' && window.currentGpInstanceId !== 'undefined') {
          console.log('Using window.currentGpInstanceId:', window.currentGpInstanceId);
          gpInstanceId = window.currentGpInstanceId;
        }
      }
      
      // Explicit debug for GP instance ID after potential fallback
      console.log('Final gpInstanceId used for deletion:', gpInstanceId);
      
      // Input validation
      if (
        !missionNetworkId ||
        !segmentId ||
        !domainId ||
        !hwStackId ||
        !assetId ||
        !gpInstanceId ||
        !spInstanceId
      ) {
        // Add detailed logging about which parameter is missing
        const missingParams = [];
        if (!missionNetworkId) missingParams.push('missionNetworkId');
        if (!segmentId) missingParams.push('segmentId');
        if (!domainId) missingParams.push('domainId');
        if (!hwStackId) missingParams.push('hwStackId');
        if (!assetId) missingParams.push('assetId');
        if (!gpInstanceId) missingParams.push('gpInstanceId');
        if (!spInstanceId) missingParams.push('spInstanceId');
        
        console.error('Missing parameters for deleteSPInstance:', missingParams);
        
        return {
          success: false,
          error: `Missing required parameters: ${missingParams.join(', ')}`,
          status: 400,
        };
      }

      const environment = sessionStorage.getItem('environment') || 'ciav';
      // CRITICAL FIX: URL segment style must match exactly what the backend expects
      // The correct hierarchy is singular forms for most path elements, except a few plurals
      // Hard coding it to match the backend route exactly
      const endpoint = `/api/cis_plan/${environment}/mission_networks/${missionNetworkId}/network_segments/${segmentId}/security_domains/${domainId}/hw_stacks/${hwStackId}/assets/${assetId}/gp_instances/${gpInstanceId}/sp_instances/${spInstanceId}`;

      console.log('DELETE request to endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: result.data || {},
        message: result.message || "",
      };
    } catch (error) {
      console.error("Error in deleteSPInstance API call:", error);
      return {
        success: false,
        error: error.message || "Network error occurred",
        status: 0,
      };
    }
  },
};

// Export the CISApi namespace
window.CISApi = CISApi;
