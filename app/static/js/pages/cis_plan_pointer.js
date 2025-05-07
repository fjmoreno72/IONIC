/**
 * CIS Plan Pointer - A global navigation state manager for CIS Plan
 * 
 * This module tracks the current position in the CIS Plan tree hierarchy,
 * the previous position, and the currently selected element.
 * 
 * Hierarchy levels:
 * L1 → missionNetworks
 * L1.1 → networkSegments
 * L1.1.1 → securityDomains
 * L1.1.1.1 → hwStacks
 * L1.1.1.1.1 → assets
 * L1.1.1.1.1.1 → networkInterfaces
 * L1.1.1.1.1.1.1 → configurationItems
 * L1.1.1.1.1.2 → gpInstances
 * L1.1.1.1.1.2.1 → spInstances
 * L1.1.1.1.1.2.2 → configurationItems
 */

const CISPlanPointer = (function() {
  // Private state
  const ELEMENT_TYPES = {
    MISSION_NETWORK: 'missionNetwork',
    NETWORK_SEGMENT: 'networkSegment',
    SECURITY_DOMAIN: 'securityDomain',
    HW_STACK: 'hwStack',
    ASSET: 'asset',
    NETWORK_INTERFACE: 'networkInterface',
    NI_CONFIG_ITEM: 'niConfigItem',
    GP_INSTANCE: 'gpInstance',
    SP_INSTANCE: 'spInstance',
    GP_CONFIG_ITEM: 'gpConfigItem',
    ROOT: 'root'
  };

  const state = {
    // Previous position
    previous: {
      level: null,
      type: null,
      id: null,
      name: null,
      parentIds: {}
    },
    
    // Current position
    current: {
      level: null,
      type: null,
      id: null,
      name: null,
      parentIds: {}
    },
    
    // Currently selected element (same as current for tree clicks)
    selected: {
      level: null,
      type: null,
      id: null,
      name: null,
      element: null,
      parentIds: {}
    }
  };

  /**
   * Updates the navigation state when a new element is clicked in the tree
   * @param {string} elementType - Type of element (from ELEMENT_TYPES)
   * @param {string} level - Hierarchy level (e.g., "L1", "L1.1.1")
   * @param {string} id - Element ID
   * @param {string} name - Element name
   * @param {Object} element - Full element data
   * @param {Object} parentIds - IDs of parent elements in the hierarchy
   */
  function updateState(elementType, level, id, name, element, parentIds = {}) {
    // Move current state to previous
    state.previous = { ...state.current };
    
    // Update current state
    state.current = {
      level,
      type: elementType,
      id,
      name,
      parentIds: { ...parentIds }
    };
    
    // Update selected element (same as current for tree clicks)
    state.selected = {
      level,
      type: elementType,
      id,
      name,
      element: element,
      parentIds: { ...parentIds }
    };
    
    // Log the current navigation state
    logNavigationState();
  }

  /**
   * Updates only the selected element when clicking in the central panel
   * This preserves the current tree position while changing what's selected
   * 
   * @param {string} elementType - Type of element (from ELEMENT_TYPES)
   * @param {string} level - Hierarchy level (e.g., "L1", "L1.1.1")
   * @param {string} id - Element ID
   * @param {string} name - Element name
   * @param {Object} element - Full element data
   * @param {Object} parentIds - IDs of parent elements in the hierarchy
   */
  function updateSelectedOnly(elementType, level, id, name, element, parentIds = {}) {
    // Only update the selected element, leaving current and previous unchanged
    state.selected = {
      level,
      type: elementType,
      id,
      name,
      element: element,
      parentIds: { ...parentIds }
    };
    
    // Log the navigation state with updated selection
    console.group('CIS Plan Navigation State (Central Panel Selection)');
    console.log('Previous Position:', state.previous);
    console.log('Current Position:', state.current);
    console.log('Selected Element:', state.selected);
    console.groupEnd();
  }

  /**
   * Log the current navigation state to console
   */
  function logNavigationState() {
    console.group('CIS Plan Navigation State');
    console.log('Previous Position:', state.previous);
    console.log('Current Position:', state.current);
    console.log('Selected Element:', state.selected);
    console.groupEnd();
  }

  /**
   * Log navigation path for UP button
   * Shows where we currently are and where we would navigate to
   */
  function logNavigationUp() {
    // Get the current state
    const currentState = state.current;
    let targetLevel = '';
    let targetType = '';
    let targetId = '';
    
    if (!currentState) {
      console.log('CISPlanPointer: Cannot determine navigation path - no current position set');
      return;
    }
    
    // Determine the parent level based on the current level
    switch(currentState.level) {
      case 'L1.1.1.1.1.2.1': // spInstance -> gpInstance
        targetLevel = 'L1.1.1.1.1.2';
        targetType = 'gpInstance';
        targetId = currentState.parentIds?.gpInstance || 'Unknown';
        break;
      case 'L1.1.1.1.1.2': // gpInstance -> asset
        targetLevel = 'L1.1.1.1.1';
        targetType = 'asset';
        targetId = currentState.parentIds?.asset || 'Unknown';
        break;
      case 'L1.1.1.1.1.1': // networkInterface -> asset
        targetLevel = 'L1.1.1.1.1';
        targetType = 'asset';
        targetId = currentState.parentIds?.asset || 'Unknown';
        break;
      case 'L1.1.1.1.1': // asset -> hwStack
        targetLevel = 'L1.1.1.1';
        targetType = 'hwStack';
        targetId = currentState.parentIds?.hwStack || 'Unknown';
        break;
      case 'L1.1.1.1': // hwStack -> securityDomain
        targetLevel = 'L1.1.1';
        targetType = 'securityDomain';
        targetId = currentState.parentIds?.securityDomain || 'Unknown';
        break;
      case 'L1.1.1': // securityDomain -> networkSegment
        targetLevel = 'L1.1';
        targetType = 'networkSegment';
        targetId = currentState.parentIds?.networkSegment || 'Unknown';
        break;
      case 'L1.1': // networkSegment -> missionNetwork
        targetLevel = 'L1';
        targetType = 'missionNetwork';
        targetId = currentState.parentIds?.missionNetwork || 'Unknown';
        break;
      case 'L1': // missionNetwork -> root
        targetLevel = 'L0';
        targetType = 'root';
        targetId = 'root-cisplan';
        break;
      default:
        console.log('CISPlanPointer: Unknown current level:', currentState.level);
        return;
    }
    
    // Log current position and intended target
    console.log('%cCISPlanPointer: Navigation UP', 'font-weight: bold; color: blue;');
    console.log('%cCurrent Position:', 'color: green;', {
      level: currentState.level,
      type: currentState.type,
      id: currentState.id,
      name: currentState.name
    });
    console.log('%cNavigate To:', 'color: orange;', {
      level: targetLevel,
      type: targetType,
      id: targetId
    });
  }
  
  /**
   * Log when editing an element
   * Shows information about the selected element being edited
   */
  function logEditElement() {
    if (!state.selected) {
      console.warn('CISPlanPointer: No selected element to edit');
      return null;
    }
    
    console.log('CISPlanPointer: Editing Element');
    console.log('Selected Element:', state.selected);
    console.log('Element Details:', state.selected.element);
    
    return state.selected;
  }
  
  /**
   * Creates a special refresh state for HW Stacks that ensures proper selection after update
   * @param {string} hwStackId - The ID of the HW Stack to restore
   * @param {string} domainId - The ID of the parent security domain
   * @param {string} segmentId - The ID of the parent network segment
   * @param {string} missionNetworkId - The ID of the root mission network
   * @returns {Object} A state object for refreshPanelsWithState
   */
  function createHwStackRefreshState(hwStackId, domainId, segmentId, missionNetworkId) {
    console.log('CISPlanPointer: Creating HW Stack refresh state');
    
    // Create a state that will select the HW Stack after refresh
    const refreshState = {
      nodeType: 'hwStacks',
      nodeId: hwStackId,
      hwStackId: hwStackId,
      domainId: domainId,
      segmentId: segmentId,
      missionNetworkId: missionNetworkId,
      fromPointer: true
    };
    
    console.log('CISPlanPointer: Created HW Stack refresh state:', refreshState);
    return refreshState;
  }

  /**
   * Get the current navigation state
   * @returns {Object} Current state
   */
  function getState() {
    return {
      previous: { ...state.previous },
      current: { ...state.current },
      selected: { ...state.selected }
    };
  }

  /**
   * Reset the navigation state
   */
  function resetState() {
    state.previous = {
      level: null,
      type: null,
      id: null,
      name: null,
      parentIds: {}
    };
    
    state.current = {
      level: null,
      type: null,
      id: null,
      name: null,
      parentIds: {}
    };
    
    state.selected = {
      level: null,
      type: null,
      id: null,
      name: null,
      element: null,
      parentIds: {}
    };
    
    console.log('CIS Plan Navigation State Reset');
  }

  /**
   * Handle tree click events
   * @param {Object} treeNode - DOM node representing the tree item
   * @param {Object} element - Data element associated with the tree node
   * @param {string} type - Type of element
   * @param {Object} parentIds - IDs of all parent elements
   */
  function handleTreeClick(treeNode, element, type, parentIds = {}) {
    let level = '';
    let id = '';
    let name = '';
    
    // Get references to the edit and delete buttons
    const editDetailButton = document.getElementById("editDetailButton");
    const deleteDetailButton = document.getElementById("deleteDetailButton");
    
    // Set the global currentElement to enable proper edit/delete functionality
    // This mirrors what happens in the central panel click handler
    if (typeof window.currentElement !== 'undefined' && element && type !== 'root') {
      // Create a shallow copy of the element
      window.currentElement = element;
      
      // Explicitly set the type on the element to ensure edit works properly
      window.currentElement.type = type;
      
      console.log('CISPlanPointer: Set currentElement for edit/delete:', window.currentElement);
    }
    
    switch(type) {
      case 'root':
        level = 'L0';
        id = 'root';
        name = 'CIS Plan';
        
        // Disable edit/delete for root
        if (editDetailButton) editDetailButton.disabled = true;
        if (deleteDetailButton) deleteDetailButton.disabled = true;
        break;
      case 'missionNetwork':
        level = 'L1';
        id = element.id;
        name = element.name;
        
        // Enable edit/delete for mission networks
        if (editDetailButton) editDetailButton.disabled = false;
        if (deleteDetailButton) deleteDetailButton.disabled = false;
        break;
      case 'networkSegment':
        level = 'L1.1';
        id = element.id;
        name = element.name;
        
        // Enable edit/delete for network segments
        if (editDetailButton) editDetailButton.disabled = false;
        if (deleteDetailButton) deleteDetailButton.disabled = false;
        break;
      case 'securityDomain':
        level = 'L1.1.1';
        id = element.id;
        name = element.name;
        
        // Enable edit/delete for security domains
        if (editDetailButton) editDetailButton.disabled = false;
        if (deleteDetailButton) deleteDetailButton.disabled = false;
        break;
      case 'hwStack':
        level = 'L1.1.1.1';
        id = element.id;
        name = element.name;
        
        // Enable edit/delete for hardware stacks
        if (editDetailButton) editDetailButton.disabled = false;
        if (deleteDetailButton) deleteDetailButton.disabled = false;
        break;
      case 'asset':
        level = 'L1.1.1.1.1';
        id = element.id;
        name = element.name;
        
        // Enable edit/delete for assets
        if (editDetailButton) editDetailButton.disabled = false;
        if (deleteDetailButton) deleteDetailButton.disabled = false;
        break;
      case 'networkInterface':
        level = 'L1.1.1.1.1.1';
        id = element.id;
        name = element.name;
        
        // Enable edit/delete for network interfaces
        if (editDetailButton) editDetailButton.disabled = false;
        if (deleteDetailButton) deleteDetailButton.disabled = false;
        break;
      case 'configItem':
        // Check if parent is network interface or GP instance
        if (parentIds.networkInterface) {
          level = 'L1.1.1.1.1.1.1';
          id = element.Name || element.name;
          name = element.Name || element.name;
        } else if (parentIds.gpInstance) {
          level = 'L1.1.1.1.1.2.2';
          id = element.Name || element.name;
          name = element.Name || element.name;
        }
        break;
      case 'gpInstance':
        level = 'L1.1.1.1.1.2';
        id = element.gpid;
        name = element.name;
        break;
      case 'spInstance':
        level = 'L1.1.1.1.1.2.1';
        id = element.spid;
        name = element.name;
        break;
      default:
        console.warn('Unknown element type:', type);
        return;
    }
    
    updateState(type, level, id, name, element, parentIds);
  }
  
  /**
   * Handle central panel element click events
   * This specifically handles elements clicked in the center panel
   * 
   * @param {Object} element - Data element that was clicked
   * @param {string} type - Type of element
   * @param {Object} currentTreeNode - The current tree node for context
   */
  function handleCentralPanelClick(element, type, currentTreeNode) {
    let level = '';
    let id = element.id || element.gpid || element.spid || (element.Name || element.name);
    let name = element.name || element.Name || id;
    
    // Get parent IDs based on the current tree position
    const parentIds = {};
    
    // Normalize type - convert plural form (from central panel) to singular form (for consistency)
    // This ensures it matches with the tree elements types when needed
    let normalizedType = type;
    
    // Map used to convert between plural and singular forms
    const typeMapping = {
      'missionNetworks': 'missionNetwork',
      'networkSegments': 'networkSegment',
      'securityDomains': 'securityDomain',
      'hwStacks': 'hwStack',
      'assets': 'asset',
      'networkInterfaces': 'networkInterface',
      'gpInstances': 'gpInstance',
      'spInstances': 'spInstance',
      'configItems': 'configItem'
    };
    
    // For logging
    console.log('CISPlanPointer: Central panel click with type:', type, 'Element:', element);
    
    // Map the element type to the correct level in the hierarchy
    // and extract the appropriate parent IDs
    switch(type) {
      case 'missionNetworks':
      case 'missionNetwork':
        level = 'L1';
        normalizedType = 'missionNetwork';
        break;
      case 'networkSegments':
      case 'networkSegment':
        level = 'L1.1';
        normalizedType = 'networkSegment';
        parentIds.missionNetwork = currentTreeNode.getAttribute("data-parent-mission-network");
        break;
      case 'securityDomains':
      case 'securityDomain':
        level = 'L1.1.1';
        normalizedType = 'securityDomain';
        parentIds.missionNetwork = currentTreeNode.getAttribute("data-parent-mission-network");
        parentIds.networkSegment = currentTreeNode.getAttribute("data-parent-segment");
        break;
      case 'hwStacks':
      case 'hwStack':
        level = 'L1.1.1.1';
        normalizedType = 'hwStack';
        parentIds.missionNetwork = currentTreeNode.getAttribute("data-parent-mission-network");
        parentIds.networkSegment = currentTreeNode.getAttribute("data-parent-segment");
        parentIds.securityDomain = currentTreeNode.getAttribute("data-parent-domain");
        break;
      case 'assets':
      case 'asset':
        level = 'L1.1.1.1.1';
        normalizedType = 'asset';
        parentIds.missionNetwork = currentTreeNode.getAttribute("data-parent-mission-network");
        parentIds.networkSegment = currentTreeNode.getAttribute("data-parent-segment");
        parentIds.securityDomain = currentTreeNode.getAttribute("data-parent-domain");
        parentIds.hwStack = currentTreeNode.getAttribute("data-parent-stack");
        break;
      case 'networkInterfaces':
      case 'networkInterface':
        level = 'L1.1.1.1.1.1';
        normalizedType = 'networkInterface';
        parentIds.missionNetwork = currentTreeNode.getAttribute("data-parent-mission-network-id") || 
                                  currentTreeNode.getAttribute("data-parent-mission-network");
        parentIds.networkSegment = currentTreeNode.getAttribute("data-parent-segment-id") || 
                                 currentTreeNode.getAttribute("data-parent-segment");
        parentIds.securityDomain = currentTreeNode.getAttribute("data-parent-domain-id") || 
                                 currentTreeNode.getAttribute("data-parent-domain");
        parentIds.hwStack = currentTreeNode.getAttribute("data-parent-stack-id") || 
                          currentTreeNode.getAttribute("data-parent-stack");
        parentIds.asset = currentTreeNode.getAttribute("data-parent-asset-id") || 
                        currentTreeNode.getAttribute("data-parent-asset");
        break;
      case 'gpInstances':
      case 'gpInstance':
        level = 'L1.1.1.1.1.2';
        normalizedType = 'gpInstance';
        parentIds.missionNetwork = currentTreeNode.getAttribute("data-parent-mission-network-id") || 
                                  currentTreeNode.getAttribute("data-parent-mission-network");
        parentIds.networkSegment = currentTreeNode.getAttribute("data-parent-segment-id") || 
                                 currentTreeNode.getAttribute("data-parent-segment");
        parentIds.securityDomain = currentTreeNode.getAttribute("data-parent-domain-id") || 
                                 currentTreeNode.getAttribute("data-parent-domain");
        parentIds.hwStack = currentTreeNode.getAttribute("data-parent-stack-id") || 
                          currentTreeNode.getAttribute("data-parent-stack");
        parentIds.asset = currentTreeNode.getAttribute("data-parent-asset-id") || 
                        currentTreeNode.getAttribute("data-parent-asset");
        break;
      case 'spInstances':
      case 'spInstance':
        level = 'L1.1.1.1.1.2.1';
        normalizedType = 'spInstance';
        parentIds.missionNetwork = currentTreeNode.getAttribute("data-parent-mission-network-id") || 
                                  currentTreeNode.getAttribute("data-parent-mission-network");
        parentIds.networkSegment = currentTreeNode.getAttribute("data-parent-segment-id") || 
                                 currentTreeNode.getAttribute("data-parent-segment");
        parentIds.securityDomain = currentTreeNode.getAttribute("data-parent-domain-id") || 
                                 currentTreeNode.getAttribute("data-parent-domain");
        parentIds.hwStack = currentTreeNode.getAttribute("data-parent-stack-id") || 
                          currentTreeNode.getAttribute("data-parent-stack");
        parentIds.asset = currentTreeNode.getAttribute("data-parent-asset-id") || 
                        currentTreeNode.getAttribute("data-parent-asset");
        parentIds.gpInstance = currentTreeNode.getAttribute("data-parent-gp-instance");
        break;
      case 'configItems':
      case 'configItem':
        normalizedType = 'configItem';
        // Configuration items can be under network interfaces or GP instances
        if (element.parentNetworkInterface || currentTreeNode.getAttribute("data-parent-network-interface")) {
          level = 'L1.1.1.1.1.1.1';
          parentIds.networkInterface = element.parentNetworkInterface || currentTreeNode.getAttribute("data-parent-network-interface");
        } else {
          level = 'L1.1.1.1.1.2.2';
          parentIds.gpInstance = element.parentGpInstance || currentTreeNode.getAttribute("data-parent-gp-instance");
        }
        break;
      default:
        console.warn('CISPlanPointer: Unknown element type:', type);
        level = 'L0';
        break;
    }
    
    // Log the parent IDs for debugging
    console.log('CISPlanPointer: Parent IDs for', normalizedType, ':', parentIds);
    
    // Only update the selected element, not the current position
    // Use normalizedType for consistent type representation in the state
    updateSelectedOnly(normalizedType, level, id, name, element, parentIds);
    
    // Log the state after update
    logNavigationState();
    
    return { level, id, name, parentIds };
  }

  /**
   * Get state for element refresh
   * Used to preserve current selection state during refreshes
   * @returns {Object} State object suitable for refreshPanelsWithState
   */
  function getStateForRefresh() {
    const state = getState();
    let refreshState = {};
    
    // Check if this is a central panel selection (current is root, but selected is not)
    const isCentralPanelSelection = state.current && state.current.type === 'root' && 
                                   state.selected && state.selected.type !== 'root';
    
    // Add a flag to indicate if this was a central panel selection
    refreshState.isCentralPanelSelection = isCentralPanelSelection;
    
    // Log the detection
    if (isCentralPanelSelection) {
      console.log('CISPlanPointer: Detected central panel selection, preserving root view');
    }
    
    // If we have a selected element, use that
    if (state.selected) {
      // Convert singular element types to plural for tree state restoration
      let normalizedType = state.selected.type;
      
      // Map singular types to plural as needed
      switch (normalizedType) {
        case 'missionNetwork':
          normalizedType = 'missionNetworks';
          // For mission networks, we need to set both nodeType and missionNetworkId
          refreshState.missionNetworkId = state.selected.id;
          break;
        case 'networkSegment':
          normalizedType = 'networkSegments';
          break;
        case 'securityDomain':
          normalizedType = 'securityDomains';
          break;
        case 'hwStack':
          normalizedType = 'hwStacks';
          break;
        case 'asset':
          normalizedType = 'assets';
          break;
        case 'networkInterface':
          normalizedType = 'networkInterfaces';
          break;
        case 'gpInstance':
          normalizedType = 'gpInstances';
          break;
        case 'spInstance':
          normalizedType = 'spInstances';
          break;
      }
      
      // Use normalized node type for state restoration
      refreshState.nodeType = normalizedType;
      refreshState.nodeId = state.selected.id;
      
      // Add parent IDs if available
      if (state.selected.parentIds) {
        // Ensure we have proper parent IDs based on element type
        if (state.selected.type === 'hwStack') {
          // For HW Stack, make sure we have all parent references
          refreshState.missionNetworkId = state.selected.parentIds.missionNetwork;
          refreshState.segmentId = state.selected.parentIds.networkSegment;
          refreshState.domainId = state.selected.parentIds.securityDomain;
          refreshState.hwStackId = state.selected.id; // Important: this is the HW Stack's own ID
          
          // Flag to indicate this was edited from CISPlanPointer
          refreshState.fromPointer = true;
          
          console.log('CISPlanPointer: Enhanced HW Stack state with all parents:', refreshState);
        } else {
          // Standard parent ID handling for other types
          if (state.selected.parentIds.missionNetwork) {
            refreshState.missionNetworkId = state.selected.parentIds.missionNetwork;
          }
          if (state.selected.parentIds.networkSegment || state.selected.parentIds.segment) {
            refreshState.segmentId = state.selected.parentIds.networkSegment || state.selected.parentIds.segment;
          }
          if (state.selected.parentIds.securityDomain || state.selected.parentIds.domain) {
            refreshState.domainId = state.selected.parentIds.securityDomain || state.selected.parentIds.domain;
          }
          if (state.selected.parentIds.hwStack || state.selected.parentIds.stack) {
            refreshState.hwStackId = state.selected.parentIds.hwStack || state.selected.parentIds.stack;
          }
        }
      }
      
      console.log('CISPlanPointer: Created refresh state from selected element:', refreshState);
    }
    // If no selected element but current position, use that
    else if (state.current && state.current.type !== 'root') {
      // Convert singular element types to plural for tree state restoration
      let normalizedType = state.current.type;
      
      // Map singular types to plural as needed
      switch (normalizedType) {
        case 'missionNetwork':
          normalizedType = 'missionNetworks';
          // For mission networks, we need to set both nodeType and missionNetworkId
          refreshState.missionNetworkId = state.current.id;
          break;
        case 'networkSegment':
          normalizedType = 'networkSegments';
          break;
        case 'securityDomain':
          normalizedType = 'securityDomains';
          break;
        case 'hwStack':
          normalizedType = 'hwStacks';
          break;
        case 'asset':
          normalizedType = 'assets';
          break;
        case 'networkInterface':
          normalizedType = 'networkInterfaces';
          break;
        case 'gpInstance':
          normalizedType = 'gpInstances';
          break;
        case 'spInstance':
          normalizedType = 'spInstances';
          break;
      }
      
      refreshState.nodeType = normalizedType;
      refreshState.nodeId = state.current.id;
      
      // Add parent IDs if available
      if (state.current.parentIds) {
        if (state.current.parentIds.missionNetwork) {
          refreshState.missionNetworkId = state.current.parentIds.missionNetwork;
        }
        if (state.current.parentIds.segment) {
          refreshState.segmentId = state.current.parentIds.segment;
        }
        if (state.current.parentIds.domain) {
          refreshState.domainId = state.current.parentIds.domain;
        }
        if (state.current.parentIds.stack) {
          refreshState.hwStackId = state.current.parentIds.stack;
        }
      }
      
      console.log('CISPlanPointer: Created refresh state from current position:', refreshState);
    }
    
    return refreshState;
  }

  /**
   * Creates a refresh state for HW Stacks using the current pointer selection state
   * @returns {Object} A state object for refreshPanelsWithState
   */
  function createHwStackRefreshState() {
    // Check if we have a selected hwStack
    if (!state.selected || state.selected.type !== 'hwStack') {
      console.warn('CISPlanPointer: No HW Stack selected, cannot create refresh state');
      return null;
    }
    
    const refreshState = {};
    refreshState.nodeType = 'hwStacks';
    refreshState.nodeId = state.selected.id;
    
    // Set parent IDs from the selection
    if (state.selected.parentIds) {
      refreshState.missionNetworkId = state.selected.parentIds.missionNetwork;
      refreshState.segmentId = state.selected.parentIds.networkSegment;
      refreshState.domainId = state.selected.parentIds.securityDomain;
    }
    
    // Set hwStackId to the selected ID
    refreshState.hwStackId = state.selected.id;
    refreshState.fromPointer = true;
    
    console.log('CISPlanPointer: Created HW Stack refresh state from current selection:', refreshState);
    return refreshState;
  }

  // Public API
  return {
    ELEMENT_TYPES,
    updateState,
    updateSelectedOnly,
    getState,
    resetState,
    handleTreeClick,
    handleCentralPanelClick,
    logNavigationState,
    logNavigationUp,
    logEditElement,
    getStateForRefresh,
    createHwStackRefreshState
  };
})();

// Export for global use
window.CISPlanPointer = CISPlanPointer;
