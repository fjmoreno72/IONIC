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

const CISPlanPointer = (function () {
    // Constants and configuration
    const ELEMENT_TYPES = {
      CIS_PLAN: "cisplan",
      MISSION_NETWORK: "missionNetwork",
      MISSION_NETWORKS: "missionNetworks",
      NETWORK_SEGMENT: "networkSegment",
      NETWORK_SEGMENTS: "networkSegments",
      SECURITY_DOMAIN: "securityDomain",
      SECURITY_DOMAINS: "securityDomains",
      HW_STACK: "hwStack",
      HW_STACKS: "hwStacks",
      ASSET: "asset",
      ASSETS: "assets",
      NETWORK_INTERFACE: "networkInterface",
      NETWORK_INTERFACES: "networkInterfaces",
      NI_CONFIG_ITEM: "niConfigItem",
      GP_INSTANCE: "gpInstance",
      GP_INSTANCES: "gpInstances",
      SP_INSTANCE: "spInstance",
      GP_CONFIG_ITEM: "gpConfigItem",
      ROOT: "root",
    };
  
    // Navigation hierarchy configuration
    const NAVIGATION_CONFIG = {
      'L0':    { parentLevel: null,           parentType: null },
      'L1':    { parentLevel: 'L0',           parentType: ELEMENT_TYPES.CIS_PLAN },
      'L1.1':  { parentLevel: 'L1',           parentType: ELEMENT_TYPES.MISSION_NETWORK },
      'L1.1.1':{ parentLevel: 'L1.1',         parentType: ELEMENT_TYPES.NETWORK_SEGMENT },
      'L1.1.1.1':{ parentLevel: 'L1.1.1',     parentType: ELEMENT_TYPES.SECURITY_DOMAIN },
      'L1.1.1.1.1':{ parentLevel: 'L1.1.1.1', parentType: ELEMENT_TYPES.HW_STACK },
      'L1.1.1.1.1.1':{ parentLevel: 'L1.1.1.1.1', parentType: ELEMENT_TYPES.ASSET },
      'L1.1.1.1.1.1.1':{ parentLevel: 'L1.1.1.1.1.1', parentType: ELEMENT_TYPES.NETWORK_INTERFACE },
      'L1.1.1.1.1.2':{ parentLevel: 'L1.1.1.1.1', parentType: ELEMENT_TYPES.ASSET },
      'L1.1.1.1.1.2.1':{ parentLevel: 'L1.1.1.1.1.2', parentType: ELEMENT_TYPES.GP_INSTANCE },
      'L1.1.1.1.1.2.2':{ parentLevel: 'L1.1.1.1.1.2', parentType: ELEMENT_TYPES.GP_INSTANCE }
    };
  
    const state = {
      previous: { level: null, type: null, id: null, name: null, parentIds: {} },
      current:  { level: null, type: null, id: null, name: null, parentIds: {} },
      selected: { level: null, type: null, id: null, name: null, element: null, parentIds: {} },
    };
  
    // Map of plural to singular type names
    // Map to standardize type names (both singular and plural forms)
    const TYPE_MAP = {
      // Plural to singular mapping
      missionnetworks:   'missionNetwork',
      networksegments:   'networkSegment',
      securitydomains:   'securityDomain',
      // SPECIAL CASE: Let hwStacks remain in plural form to match node attributes
      // hwstacks:          'hwStack',
      assets:            'asset',
      networkinterfaces: 'networkInterface',
      gpinstances:       'gpInstance',
      spinstances:       'spInstance',
      configitems:       'configItem',
      
      // Ensure singular forms map to themselves for consistency
      missionnetwork:    'missionNetwork',
      networksegment:    'networkSegment',
      securitydomain:    'securityDomain',
      hwstack:           'hwStack',
      // Special mapping to preserve actual type used in tree nodes
      hwstacks:          'hwStacks',
      asset:             'asset',
      networkinterface:  'networkInterface',
      gpinstance:        'gpInstance',
      spinstance:        'spInstance',
      configitem:        'configItem',
      cisplan:           'cisplan',
      root:              'cisplan'
    };
  
    /**
     * Normalizes element type names to a consistent format
     * This ensures that both singular and plural forms are handled correctly
     * @param {string} type - The type name to normalize
     * @returns {string} - The normalized type name
     */
    function normalizeType(type) {
      if (!type) return type;
      const lc = type.toLowerCase();
      return TYPE_MAP[lc] || lc;
    }
  
    function createStateObject(elementType, level, id, name, element = null, parentIds = {}) {
      return {
        type: normalizeType(elementType),
        level,
        id,
        name,
        element,
        parentIds
      };
    }
  
    function validateStateParams(elementType, level, id) {
      // Normalize the type for consistent validation
      const normalizedType = elementType.toLowerCase();
      
      // Check if the type exists in our defined element types
      const validType = Object.values(ELEMENT_TYPES)
        .some(t => t.toLowerCase() === normalizedType);
        
      if (!elementType || !validType) {
        console.warn(`Invalid element type: ${elementType}`);
        return false;
      }
      if (!level || !NAVIGATION_CONFIG[level]) {
        console.warn(`Invalid navigation level: ${level}`);
        return false;
      }
      if (!id) {
        console.error('Element ID is required');
        throw new Error('Element ID is required');
      }
      return true;
    }
  
    function updateState(elementType, level, id, name, element, parentIds = {}) {
      if (!validateStateParams(elementType, level, id)) return false;
      elementType = elementType.toLowerCase();
  
      const normalizedParents = {};
      for (let [k,v] of Object.entries(parentIds)) {
        normalizedParents[k.toLowerCase()] = v;
      }
  
      const newState = createStateObject(elementType, level, id, name, element, normalizedParents);
      state.previous = { ...state.current };
      state.current  = { ...newState };
      state.selected = { ...newState };
  
      if (window.DEBUG_CIS_PLAN_POINTER) logNavigationState();
      return true;
    }
  
    function updateSelectedOnly(elementType, level, id, name, element, parentIds = {}) {
      state.selected = { level, type: elementType, id, name, element, parentIds };
      console.group("CIS Plan Navigation State (Central Panel Selection)");
      console.log("Previous Position:", state.previous);
      console.log("Current Position:",  state.current);
      console.log("Selected Element:",   state.selected);
      console.groupEnd();
    }
  
    function logNavigationState() {
      if (!window.DEBUG_CIS_PLAN_POINTER) return;
      console.group("CIS Plan Navigation State");
      console.log("Previous:", state.previous);
      console.log("Current: ", state.current);
      console.log("Selected:", state.selected);
      console.groupEnd();
    }
  
    function getParentNavInfo() {
      const cur = state.current;
      if (!cur.level) {
        console.warn('No current position set');
        return null;
      }
      const cfg = NAVIGATION_CONFIG[cur.level];
      if (!cfg) {
        console.warn(`Unknown level ${cur.level}`);
        return null;
      }
      const parentType = cfg.parentType?.toLowerCase();
      
      // Special case for navigating from Mission Network to CIS Plan root
      if (cur.type === ELEMENT_TYPES.MISSION_NETWORK && parentType === ELEMENT_TYPES.CIS_PLAN) {
        return {
          level: cfg.parentLevel,
          type: parentType,
          id: 'root-cisplan'  // Use the fixed ID of the root node
        };
      }
      
      let parentId = cur.parentIds?.[parentType] || 'Unknown';
      
      // Add debug logging to help diagnose issues
      if (window.DEBUG_CIS_PLAN_POINTER) {
        console.log('getParentNavInfo:', { 
          currentType: cur.type,
          currentLevel: cur.level,
          parentType: parentType,
          parentId: parentId,
          parentIds: cur.parentIds
        });
      }
      
      return {
        level: cfg.parentLevel,
        type: parentType,
        id: parentId
      };
    }
  
    function logNavigationUp() {
      const parentInfo = getParentNavInfo();
      if (!parentInfo) return;
      if (window.DEBUG_CIS_PLAN_POINTER) {
        console.group("CIS Plan Navigation Path");
        console.log("Current:", state.current);
        console.log("Parent: ", parentInfo);
        console.groupEnd();
      }
      console.log("%cCISPlanPointer: Navigation UP", "font-weight:bold;color:blue;");
      console.log("%cNavigate To:", "color:orange;", parentInfo);
    }
  
    function logEditElement() {
      if (!state.selected) {
        console.warn("No selected element to edit");
        return null;
      }
      console.log("CISPlanPointer: Editing Element", state.selected);
      return state.selected;
    }
  
    function createElementRefreshState(elementType, elementId, parentIds) {
      console.log(`CISPlanPointer: Creating ${elementType} refresh state`);
      let nodeType = elementType;
      if (elementType.endsWith("y")) {
        nodeType = elementType.replace(/y$/, "ies");
      } else if (!elementType.endsWith("s")) {
        nodeType = elementType + "s";
      }
      const refresh = { nodeType, nodeId: elementId, fromPointer: true };
      if (parentIds) {
        if (parentIds.missionNetworkId) refresh.missionNetworkId = parentIds.missionNetworkId;
        if (parentIds.segmentId     ) refresh.segmentId        = parentIds.segmentId;
        if (parentIds.domainId      ) refresh.domainId         = parentIds.domainId;
        if (elementType === "hwStack") refresh.hwStackId       = elementId;
        if (elementType === "asset"  ) {
          refresh.assetId = elementId;
          if (parentIds.hwStackId) refresh.hwStackId = parentIds.hwStackId;
        }
        if (elementType === "networkInterface") {
          refresh.networkInterfaceId = elementId;
          if (parentIds.assetId)      refresh.assetId      = parentIds.assetId;
          if (parentIds.hwStackId)    refresh.hwStackId    = parentIds.hwStackId;
        }
      }
      console.log(`Created refresh state:`, refresh);
      return refresh;
    }
  
    function getCurrentPosition() {
      return { ...state.current };
    }
  
    function setCurrentPosition(pos) {
      if (!pos) return;
      state.current = {
        level:     pos.level     || null,
        type:      pos.type      || null,
        id:        pos.id        || null,
        name:      pos.name      || null,
        element:   pos.element   || null,
        parentIds: pos.parentIds || {}
      };
      if (window.DEBUG_CIS_PLAN_POINTER) {
        console.log("CISPlanPointer: setCurrentPosition", state.current);
      }
    }
  
    function getSelectedElement() {
      return { ...state.selected };
    }
  
    function setSelectedElement(sel) {
      if (!sel) return;
      state.selected = {
        type:      sel.type    || null,
        id:        sel.id      || null,
        name:      sel.name    || null,
        element:   sel.element || null,
        parentIds: sel.parentIds || {}
      };
      if (window.DEBUG_CIS_PLAN_POINTER) {
        console.log("CISPlanPointer: setSelectedElement", state.selected);
      }
    }
  
    function getState() {
      return {
        previous: { ...state.previous },
        current:  { ...state.current  },
        selected: { ...state.selected }
      };
    }
  
    function setState(newSt) {
      if (!newSt) return;
      if (newSt.previous) state.previous = { ...state.previous, ...newSt.previous };
      if (newSt.current ) state.current  = { ...state.current,  ...newSt.current  };
      if (newSt.selected) state.selected = { ...state.selected, ...newSt.selected };
      if (window.DEBUG_CIS_PLAN_POINTER) {
        console.log("CISPlanPointer: setState", getState());
      }
    }
  
    function resetState() {
      state.previous = { level:null, type:null, id:null, name:null, parentIds:{} };
      state.current  = { level:null, type:null, id:null, name:null, parentIds:{} };
      state.selected = { level:null, type:null, id:null, name:null, element:null, parentIds:{} };
      console.log("CIS Plan Navigation State Reset");
    }
  
    function handleTreeClick(treeNode, element, type, parentIds = {}) {
      console.log('handleTreeClick called with', { treeNode, element, type, parentIds });
      if (!element) {
        console.error('No element provided to handleTreeClick');
        return false;
      }
      try {
        let level = "";
        let id    = element.id || element.gpid || element.spId;
        let name  = element.name || element.Name || id;
  
        const editBtn   = document.getElementById("editDetailButton");
        const deleteBtn = document.getElementById("deleteDetailButton");
  
        if (typeof window.currentElement !== "undefined" && type !== "root") {
          window.currentElement      = element;
          window.currentElement.type = type;
        }
  
        switch (type) {
          case "cisplan":
          case "root": // Keep for backward compatibility
            level = "L0"; id = "root-cisplan"; name = "CIS Plan";
            editBtn   && (editBtn.disabled   = true);
            deleteBtn && (deleteBtn.disabled = true);
            break;
          case "missionNetworks": // Handle plural form
          case "missionNetwork":
            level = "L1";
            editBtn   && (editBtn.disabled   = false);
            deleteBtn && (deleteBtn.disabled = false);
            break;
          case "networkSegments": // Handle plural form
          case "networkSegment":
            level = "L1.1";
            editBtn   && (editBtn.disabled   = false);
            deleteBtn && (deleteBtn.disabled = false);
            break;
          case "securityDomains": // Handle plural form
          case "securityDomain":
            level = "L1.1.1";
            editBtn   && (editBtn.disabled   = false);
            deleteBtn && (deleteBtn.disabled = false);
            break;
          case "hwStacks": // Handle plural form
          case "hwStack":
            level = "L1.1.1.1";
            editBtn   && (editBtn.disabled   = false);
            deleteBtn && (deleteBtn.disabled = false);
            break;
          case "assets": // Handle plural form
          case "asset":
            level = "L1.1.1.1.1";
            editBtn   && (editBtn.disabled   = false);
            deleteBtn && (deleteBtn.disabled = false);
            break;
          case "networkInterfaces": // Handle plural form
          case "networkInterface":
            level = "L1.1.1.1.1.1";
            editBtn   && (editBtn.disabled   = false);
            deleteBtn && (deleteBtn.disabled = false);
            break;
          case "configItem":
            if (parentIds.networkInterface) {
              level = "L1.1.1.1.1.1.1";
            } else if (parentIds.gpInstance) {
              level = "L1.1.1.1.1.2.2";
            }
            id   = element.Name || element.name;
            name = element.Name || element.name;
            editBtn   && (editBtn.disabled   = false);
            deleteBtn && (deleteBtn.disabled = false);
            break;
          case "gpInstances": // Handle plural form
          case "gpInstance":
            level = "L1.1.1.1.1.2";
            id    = element.gpid;
            name  = element.name;
            editBtn   && (editBtn.disabled   = false);
            deleteBtn && (deleteBtn.disabled = false);
            break;
          case "spInstances": // Handle plural form
          case "spInstance":
            level = "L1.1.1.1.1.2.1";
            id    = element.spId;
            name  = element.name;
            editBtn   && (editBtn.disabled   = false);
            deleteBtn && (deleteBtn.disabled = false);
            break;
          default:
            console.warn("Unknown type:", type);
            return false;
        }
  
        return updateState(type, level, id, name, element, parentIds);
      } catch (err) {
        console.error("Error in handleTreeClick:", err);
        return false;
      }
    }
  
    function handleCentralPanelClick(element, type, currentTreeNode) {
      if (!element) {
        console.error('No element provided to handleCentralPanelClick');
        return false;
      }
      try {
        let id = element.id || element.gpid || element.spId || element.Name || element.name || element.guid;
        let name = element.name || element.Name || id;
  
        const parentIds = {};
        // Normalize the type using our standard function
        const normType = normalizeType(type);
        console.log(`Central panel click: ${type} normalized to ${normType}`);
  
        let level = "";
        switch (normType) {
          case "missionNetwork":
            level = "L1"; 
            break;
          case "networkSegment":
            level = "L1.1";
            parentIds.missionNetwork = currentTreeNode?.getAttribute("data-parent-mission-network");
            break;
          case "securityDomain":
            level = "L1.1.1";
            parentIds.missionNetworkId = currentTreeNode?.getAttribute("data-parent-mission-network");
            parentIds.segmentId       = currentTreeNode?.getAttribute("data-parent-segment");
            break;
          case "hwStack":
          case "hwStacks": // Add support for both singular and plural forms
            level = "L1.1.1.1";
            parentIds.missionNetwork   = currentTreeNode?.getAttribute("data-parent-mission-network");
            parentIds.networkSegment   = currentTreeNode?.getAttribute("data-parent-segment");
            parentIds.securityDomain   = currentTreeNode?.getAttribute("data-parent-domain");
            break;
          case "asset":
            level = "L1.1.1.1.1";
            parentIds.missionNetwork    = currentTreeNode?.getAttribute("data-parent-mission-network");
            parentIds.networkSegment    = currentTreeNode?.getAttribute("data-parent-segment");
            parentIds.securityDomain    = currentTreeNode?.getAttribute("data-parent-domain");
            parentIds.hwStack           = currentTreeNode?.getAttribute("data-parent-stack");
            break;
          case "networkInterface":
            level = "L1.1.1.1.1.1";
            parentIds.missionNetwork    = currentTreeNode?.getAttribute("data-parent-mission-network");
            parentIds.networkSegment    = currentTreeNode?.getAttribute("data-parent-segment");
            parentIds.securityDomain    = currentTreeNode?.getAttribute("data-parent-domain");
            parentIds.hwStack           = currentTreeNode?.getAttribute("data-parent-stack");
            parentIds.asset             = currentTreeNode?.getAttribute("data-parent-asset");
            break;
          case "gpInstance":
            level = "L1.1.1.1.1.2";
            parentIds.missionNetwork    = currentTreeNode?.getAttribute("data-parent-mission-network");
            parentIds.networkSegment    = currentTreeNode?.getAttribute("data-parent-segment");
            parentIds.securityDomain    = currentTreeNode?.getAttribute("data-parent-domain");
            parentIds.hwStack           = currentTreeNode?.getAttribute("data-parent-stack");
            parentIds.asset             = currentTreeNode?.getAttribute("data-parent-asset");
            break;
          case "spInstance":
            level = "L1.1.1.1.1.2.1";
            parentIds.missionNetwork    = currentTreeNode?.getAttribute("data-parent-mission-network");
            parentIds.networkSegment    = currentTreeNode?.getAttribute("data-parent-segment");
            parentIds.securityDomain    = currentTreeNode?.getAttribute("data-parent-domain");
            parentIds.hwStack           = currentTreeNode?.getAttribute("data-parent-stack");
            parentIds.asset             = currentTreeNode?.getAttribute("data-parent-asset");
            parentIds.gpInstance        = currentTreeNode?.getAttribute("data-parent-gp-id");
            break;
          default:
            console.warn("Unknown type:", normType);
            return false;
        }
  
        return updateState(normType, level, id, name, element, parentIds);
      } catch (err) {
        console.error('Error in handleCentralPanelClick:', err);
        return false;
      }
    }
  
    function getStateForRefresh() {
      try {
        const st = getState();
        if (!st.selected?.type) {
          console.warn('No element selected for refresh');
          return null;
        }
        const isCentral = (st.current.type === 'root' && st.selected.type !== 'root');
        
        // Use the normalized type (singular form) for consistent handling
        const normalizedType = normalizeType(st.selected.type);
        
        // For API calls, we need to convert to plural form in some cases
        let apiType = normalizedType;
        
        // Only convert to plural for API calls if needed
        switch (normalizedType) {
          case 'missionNetwork': apiType = 'missionNetworks'; break;
          case 'networkSegment': apiType = 'networkSegments'; break;
          case 'securityDomain': apiType = 'securityDomains'; break;
          case 'hwStack':        apiType = 'hwStacks';        break;
          case 'asset':          apiType = 'assets';          break;
          case 'gpInstance':     apiType = 'gpInstances';     break;
          case 'spInstance':     apiType = 'spInstances';     break;
          default: break;
        }
  
        const refreshState = {
          type: apiType,  // Use apiType for API calls (plural form when needed)
          normalizedType: normalizedType, // Keep the normalized type (singular) for UI handling
          id: st.selected.id,
          name: st.selected.name,
          parentIds: st.selected.parentIds || {},
          fromPointer: true,
          isCentralPanelSelection: isCentral,
          skipLegacyHandling: true
        };
        
        console.log(`getStateForRefresh: original type=${st.selected.type}, normalized=${normalizedType}, apiType=${apiType}`);
  
        // Map parentIds to specific keys
        const parentMap = {
          missionNetwork: 'missionNetworkId',
          networkSegment: 'segmentId',
          securityDomain: 'domainId',
          hwStack:        'hwStackId',
          asset:          'assetId',
          gpInstance:     'gpInstanceId'
        };
        for (let [ptype, key] of Object.entries(parentMap)) {
          if (st.selected.parentIds[ptype]) {
            refreshState[key] = st.selected.parentIds[ptype];
          }
        }
        if (normalizedType === 'assets') {
          refreshState.isAssetEdit = true;
          refreshState.assetId     = st.selected.id;
        }
  
        if (window.DEBUG_CIS_PLAN_POINTER) {
          console.log('CISPlanPointer: Created refresh state:', refreshState);
        }
        return refreshState;
      } catch (err) {
        console.error('Error in getStateForRefresh:', err);
        return null;
      }
    }
  
    function isEditingAsset() {
      return state.selected?.type === "asset";
    }
  
    function getCurrentAsset() {
      if (!isEditingAsset()) return null;
      return {
        id:        state.selected.id,
        parentIds: state.selected.parentIds,
        element:   state.selected.element
      };
    }
  
    function navigateUp() {
      if (window.DEBUG_CIS_PLAN_POINTER) logNavigationUp();
      const curSt = getState();
      if (!curSt.current) {
        console.warn('No current position for navigation');
        return false;
      }
      const parentInfo = getParentNavInfo();
      if (!parentInfo || parentInfo.id === 'Unknown') {
        console.warn('Cannot navigate up:', parentInfo);
        return false;
      }
      const selector = `[data-id="${parentInfo.id}"]`;
      const candidates = Array.from(document.querySelectorAll(selector));
      const target = candidates.find(node => {
        let t = node.getAttribute('data-type').toLowerCase().replace(/s$/, '');
        return t === parentInfo.type;
      });
      if (!target) {
        console.warn('Parent node not found for', parentInfo);
        return false;
      }
      target.click();
      return true;
    }
  
    // Public API
    return {
      ELEMENT_TYPES,
      getState,
      setState,
      getCurrentPosition,
      setCurrentPosition,
      getSelectedElement,
      setSelectedElement,
      navigateUp,
      handleTreeClick,
      handleCentralPanelClick,
      logNavigationState,
      logNavigationUp,
      logEditElement,
      getStateForRefresh,
      createElementRefreshState,
      isEditingAsset,
      getCurrentAsset,
      resetState,
      normalizeType,
      updateState
    };
  })(); 
  
  // Export for global use
  window.CISPlanPointer = CISPlanPointer;
  