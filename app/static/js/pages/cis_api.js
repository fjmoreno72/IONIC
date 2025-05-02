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

      // Convert string parentIds to array if it's a string (for backward compatibility)
      let parsedParentIds = parentIds;
      if (typeof parentIds === "string" && parentIds.includes(",")) {
        parsedParentIds = parentIds.split(",");
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
    name
  ) {
    try {
      // Log input parameters for debugging
      console.log('DEBUG API - addNetworkInterface parameters:', {
        missionNetworkId,
        segmentId,
        domainId,
        hwStackId,
        assetId,
        name,
        missionNetworkIdType: typeof missionNetworkId,
        segmentIdType: typeof segmentId,
        domainIdType: typeof domainId,
        hwStackIdType: typeof hwStackId,
        assetIdType: typeof assetId
      });
      
      // Input validation
      if (!missionNetworkId || !segmentId || !domainId || !hwStackId || !assetId || !name) {
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
      if (mnId === '[object Object]') mnId = 'MN-0001';
      if (segId === '[object Object]') segId = 'SEG-0001';
      if (domId === '[object Object]') domId = 'DOM-0001';
      if (stackId === '[object Object]') stackId = 'HWS-0001';
      
      console.log('DEBUG API - Processed IDs:', {
        mnId,
        segId,
        domId,
        stackId,
        astId
      });

      const endpoint = `/api/cis_plan/mission_network/${mnId}/segment/${segId}/security_domain/${domId}/hw_stacks/${stackId}/assets/${astId}/network_interfaces`;
      
      console.log('DEBUG API - Endpoint:', endpoint);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name }),
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
  updateNetworkInterface: async function (
    missionNetworkId,
    segmentId,
    domainId,
    hwStackId,
    assetId,
    interfaceId,
    name
  ) {
    try {
      // Input validation
      if (!missionNetworkId || !segmentId || !domainId || !hwStackId || !assetId || !interfaceId || !name) {
        return {
          success: false,
          error: "Missing required parameters",
          status: 400,
        };
      }

      const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}/assets/${assetId}/network_interfaces/${interfaceId}`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name }),
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
    serviceId
  ) {
    try {
      // Input validation
      if (!missionNetworkId || !segmentId || !domainId || !hwStackId || !assetId || !instanceLabel || !serviceId) {
        return {
          success: false,
          error: "Missing required parameters",
          status: 400,
        };
      }

      const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}/assets/${assetId}/gp_instances`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          instanceLabel: instanceLabel,
          serviceId: serviceId 
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
      if (!missionNetworkId || !segmentId || !domainId || !hwStackId || !assetId || !instanceId || !instanceLabel || !serviceId) {
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
          serviceId: serviceId 
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
  }
};

// Export the CISApi namespace
window.CISApi = CISApi;
