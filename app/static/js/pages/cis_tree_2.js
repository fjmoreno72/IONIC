/**
 * CIS Plan Tree Component 2.0
 *
 * Manages the tree view for CIS Plan hierarchy visualization.
 * Provides functions for creating, selecting, and navigating tree nodes.
 */

const CISTree2 = {
  // DOM element references
  treeContent: null,

  // State management
  currentTreeNode: null,
  expandedNodes: new Set(),
  fullTreeData: null,

  /**
   * Initialize the tree component
   */
  init: function () {
    this.treeContent = document.getElementById("tree-content");
    if (!this.treeContent) {
      console.error("Tree content element not found");
      return;
    }
  },

  /**
   * Render the CIS Plan tree
   * @param {Object} cisPlanData - The CIS Plan data
   */
  renderTree: function (cisPlanData) {
    // Save the current expanded nodes before refreshing
    const previouslyExpandedNodes = new Set(this.expandedNodes);
    console.log('Saving expanded nodes state:', previouslyExpandedNodes.size, 'nodes');
    
    // Process and store the data
    if (cisPlanData) {
      this.fullTreeData = cisPlanData.data && cisPlanData.data.missionNetworks ? 
        cisPlanData.data : 
        (cisPlanData.missionNetworks ? cisPlanData : null);
    }

    // Validate we have data to render
    if (!this.fullTreeData || !this.fullTreeData.missionNetworks) {
      console.error("No valid CIS Plan data to render");
      return;
    }
    
    // Store the previously expanded nodes to restore after rendering
    this._previouslyExpandedNodes = previouslyExpandedNodes;

    if (!this.treeContent) {
      console.error("Tree content element not found for rendering");
      return;
    }

    // Clear existing content and apply styling
    this.treeContent.innerHTML = "";
    this.treeContent.style.display = "block";
    this.treeContent.style.padding = "10px";
    this.treeContent.style.overflow = "auto";

    // Create root node
    const rootNode = this.createTreeNode("cisplan", "CIS Plan", null, null);
    this.treeContent.appendChild(rootNode);

    // Add click handler to root node
    rootNode.addEventListener("click", (e) => {
      e.stopPropagation();
      this.selectTreeNode(rootNode);
      
      this.dispatchNodeSelected("cisplan", null, null, this.fullTreeData);
    });

    // Get mission networks from the stored data
    const missionNetworks = this.fullTreeData.missionNetworks || [];

    // Initialize expanded nodes if needed
    this._initializeExpandedNodes();

    // Create container for mission networks
    const childContainer = document.createElement("div");
    childContainer.className = "tree-children";
    rootNode.appendChild(childContainer);

    // Apply consistent styling
    CISUtil2.styleChildContainer(childContainer);

    // Set expand icon for root
    this._configureExpandIcon(rootNode, childContainer, true);

    // Render mission networks
    if (missionNetworks.length > 0) {
      this._renderEntityArray({
        container: childContainer,
        entities: missionNetworks,
        entityType: "mission_network",
        childrenProp: "networkSegments",
        childEntityType: "network_segment",
        parentPath: {}
      });

      // Apply consistent styling to all tree levels
      this.applyConsistentStylingToTree();
      
      // Restore previously expanded nodes if available
      if (this._previouslyExpandedNodes && this._previouslyExpandedNodes.size > 0) {
        console.log('Restoring expanded nodes state:', this._previouslyExpandedNodes.size, 'nodes');
        this.restoreExpandedNodes(this._previouslyExpandedNodes);
        this._previouslyExpandedNodes = null;
      }

      // Select the root node by default
      this.selectRootNodeByDefault();
    } else {
      console.warn("No mission networks found in data");
      childContainer.innerHTML = '<div class="tree-node-empty">No mission networks found</div>';
    }
  },

  /**
   * Initialize expanded nodes set
   * By default, expands up to the asset level
   * @private
   */
  _initializeExpandedNodes: function() {
    if (this._expandedInitialized) return;
    
    // Clear any previous expanded nodes
    this.expandedNodes = new Set();

    // Add root node to expanded set
    this.expandedNodes.add(null);

    if (this.fullTreeData && this.fullTreeData.missionNetworks) {
      // Expand nodes only up to security domain level (not including hw stacks)
      this.fullTreeData.missionNetworks.forEach(network => {
        if (network.guid) this.expandedNodes.add(network.guid);

        if (network.networkSegments) {
          network.networkSegments.forEach(segment => {
            if (segment.guid) this.expandedNodes.add(segment.guid);

            if (segment.securityDomains) {
              segment.securityDomains.forEach(domain => {
                if (domain.guid) this.expandedNodes.add(domain.guid);
                
                // We DO NOT add hwStacks GUIDs to the expandedNodes Set
                // This will make hwStacks collapsed by default
              });
            }
          });
        }
      });
    }

    this._expandedInitialized = true;
  },

  /**
   * Unified function to render any entity array in the tree
   * @param {Object} options - Rendering options
   * @param {HTMLElement} options.container - Container to render into
   * @param {Array} options.entities - Array of entities to render
   * @param {string} options.entityType - Type of entities being rendered
   * @param {string} options.childrenProp - Property name for children entities
   * @param {string} options.childEntityType - Type of child entities
   * @param {Object} options.parentPath - Object containing parent references
   * @private
   */
  _renderEntityArray: function(options) {
    const { container, entities, entityType, childrenProp, childEntityType, parentPath } = options;
    
    if (!entities || !entities.length) return;

    entities.forEach(entity => {
      // Determine display name based on entity type
      let displayName = this._getEntityDisplayName(entity, entityType);
      
      // Create entity node
      const entityNode = this.createTreeNode(
        entityType,
        displayName,
        entity.id || entity.spId || entity.gpid,
        entity.guid
      );
      
      // Add type-specific data attributes
      if (entityType === "gp_instance" && entity.gpid) {
        entityNode.setAttribute("data-gpid", entity.gpid);
      } else if (entityType === "sp_instance" && entity.spId) {
        entityNode.setAttribute("data-spid", entity.spId);
      }
      
      container.appendChild(entityNode);

      // If it's a GP or SP instance, fetch and update the name
      if (entityType === "gp_instance" || entityType === "sp_instance") {
        this._fetchAndUpdateEntityName(entity, entityType, entityNode);
      }

      // Create path for this entity including parents
      const currentPath = { ...parentPath };
      currentPath[entityType] = entity;

      // Set up click handler
      entityNode.addEventListener("click", (e) => {
        e.stopPropagation();
        this.selectTreeNode(entityNode);
        this.dispatchNodeSelected(entityType, entity.id || entity.spId || entity.gpid, entity.guid, entity, currentPath);
      });

      // Check if entity has children based on its type
      let hasChildren = false;
      let childEntities = null;
      let nextEntityType = null;
      let nextChildrenProp = null;

      // Determine children based on entity type
      if (childrenProp && entity[childrenProp]) {
        childEntities = entity[childrenProp];
        nextEntityType = childEntityType;
        nextChildrenProp = this._getNextChildrenProp(childEntityType);
        hasChildren = childEntities && childEntities.length > 0;
      }

      // For assets, also check for network interfaces and GP instances
      if (entityType === "asset") {
        const hasNetworkInterfaces = entity.networkInterfaces && entity.networkInterfaces.length > 0;
        const hasGPInstances = entity.gpInstances && entity.gpInstances.length > 0;
        
        if (hasNetworkInterfaces || hasGPInstances) {
          hasChildren = true;
        }
      }

      // For GP instances, check for SP instances
      if (entityType === "gp_instance") {
        const hasSPInstances = entity.spInstances && entity.spInstances.length > 0;
        
        if (hasSPInstances) {
          hasChildren = true;
          childEntities = entity.spInstances;
          nextEntityType = "sp_instance";
        }
      }

      // If entity has children, create child container
      if (hasChildren) {
        // Create child container
        const childContainer = document.createElement("div");
        childContainer.className = "tree-children";
        entityNode.appendChild(childContainer);
        
        // Apply styling
        CISUtil2.styleChildContainer(childContainer);
        
        // Determine if this node should be expanded
        // ONLY expand if it's not an asset, network interface, or GP instance
        // This ensures these nodes are collapsed by default
        const shouldBeExpanded = 
          this.expandedNodes.has(entity.guid) && 
          entityType !== "asset" && 
          entityType !== "network_interface" && 
          entityType !== "gp_instance";
        
        childContainer.style.display = shouldBeExpanded ? "block" : "none";
        
        // Configure expand icon
        const isExpanded = childContainer.style.display === "block";
        this._configureExpandIcon(entityNode, childContainer, isExpanded);
        
        // Handle different types of children
        if (entityType === "asset") {
          // Special handling for assets with network interfaces and GP instances
          this._renderAssetChildren(childContainer, entity, currentPath);
        } else if (childEntities && childEntities.length > 0 && nextEntityType) {
          // Render regular child entities
          this._renderEntityArray({
            container: childContainer,
            entities: childEntities,
            entityType: nextEntityType,
            childrenProp: nextChildrenProp,
            childEntityType: this._getNextEntityType(nextEntityType),
            parentPath: currentPath
          });
        }
      }
    });
  },

  /**
   * Render children for assets (network interfaces and GP instances)
   * @param {HTMLElement} container - Container to render into
   * @param {Object} asset - The asset entity
   * @param {Object} parentPath - Path to the asset
   * @private
   */
  _renderAssetChildren: function(container, asset, parentPath) {
    // Render network interfaces if present
    if (asset.networkInterfaces && asset.networkInterfaces.length > 0) {
      this._renderEntityArray({
        container: container,
        entities: asset.networkInterfaces,
        entityType: "network_interface",
        childrenProp: null,
        childEntityType: null,
        parentPath: parentPath
      });
    }
    
    // Render GP instances if present
    if (asset.gpInstances && asset.gpInstances.length > 0) {
      this._renderEntityArray({
        container: container,
        entities: asset.gpInstances,
        entityType: "gp_instance",
        childrenProp: "spInstances",
        childEntityType: "sp_instance",
        parentPath: parentPath
      });
    }
  },

  /**
   * Get the next entity type in the hierarchy
   * @param {string} currentType - Current entity type
   * @returns {string|null} Next entity type or null
   * @private
   */
  _getNextEntityType: function(currentType) {
    const hierarchyMap = {
      "mission_network": "network_segment",
      "network_segment": "security_domain",
      "security_domain": "hw_stack",
      "hw_stack": "asset",
      "asset": null, // Special handling for assets with network interfaces and GP instances
      "gp_instance": "sp_instance",
      "network_interface": null,
      "sp_instance": null
    };
    
    return hierarchyMap[currentType] || null;
  },

  /**
   * Get the children property name for the given entity type
   * @param {string} entityType - Entity type
   * @returns {string|null} Children property name or null
   * @private
   */
  _getNextChildrenProp: function(entityType) {
    const propMap = {
      "mission_network": "networkSegments",
      "network_segment": "securityDomains",
      "security_domain": "hwStacks",
      "hw_stack": "assets",
      "asset": null, // Special handling for assets
      "gp_instance": "spInstances",
      "network_interface": null,
      "sp_instance": null
    };
    
    return propMap[entityType] || null;
  },

  /**
   * Fetches and updates entity names for GP and SP instances
   * @param {Object} entity - The entity object
   * @param {string} entityType - Type of entity
   * @param {HTMLElement} entityNode - The DOM node
   * @private
   */
  _fetchAndUpdateEntityName: function(entity, entityType, entityNode) {
    let apiUrl, entityId, labelProp;
    
    if (entityType === "gp_instance") {
      apiUrl = `/api/gps/${entity.gpid}/name`;
      entityId = entity.gpid;
      labelProp = "instanceLabel";
    } else if (entityType === "sp_instance") {
      apiUrl = `/api/sps/name/${entity.spId}`;
      entityId = entity.spId;
      labelProp = "spVersion";
    } else {
      return;
    }
    
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        let name = "";
        
        if (entityType === "gp_instance" && data && data.name) {
          name = entity[labelProp] ? `${data.name} (${entity[labelProp]})` : data.name;
        } else if (entityType === "sp_instance" && data && data.success && data.name) {
          name = entity[labelProp] ? `${data.name} (v${entity[labelProp]})` : data.name;
        }
        
        if (name) {
          // Find all nodes with this entity ID and update them
          const selector = entityType === "gp_instance" ? 
            `.tree-node[data-gpid="${entityId}"]` : 
            `.tree-node[data-spid="${entityId}"]`;
            
          document.querySelectorAll(selector).forEach(node => {
            const nodeText = node.querySelector(".tree-node-text");
            if (nodeText) nodeText.textContent = name;
          });
        }
      })
      .catch(error => {
        console.error(`Error fetching ${entityType} name for ${entityId}:`, error);
    });
  },

  /**
   * Get the display name for an entity based on its type
   * @param {Object} entity - The entity object
   * @param {string} entityType - The entity type
   * @returns {string} The display name
   * @private
   */
  _getEntityDisplayName: function(entity, entityType) {
    switch (entityType) {
      case "network_interface":
      // Get IP address from configuration items if available
      let ipAddress = "N/A";
        if (entity.configurationItems && Array.isArray(entity.configurationItems)) {
          const ipItem = entity.configurationItems.find(item => item.Name === "IP Address");
        if (ipItem && ipItem.AnswerContent) {
          ipAddress = ipItem.AnswerContent;
        }
      }
        return `${entity.name} - ${ipAddress}`;
        
      case "gp_instance":
        return entity.instanceLabel ? `${entity.gpid} (${entity.instanceLabel})` : entity.gpid;
        
      case "sp_instance":
        return entity.spVersion ? `${entity.spId} (v${entity.spVersion})` : entity.spId;
        
      case "security_domain":
        return entity.id; // Using ID as name since security domains often use classification IDs
        
      default:
        return entity.name || entity.id || entity.gpid || entity.spId || "Unnamed";
    }
  },

  /**
   * Get child entities based on the childrenProp
   * @param {Object} entity - The parent entity
   * @param {string} childrenProp - The property name for children
   * @returns {Array|null} The child entities
   * @private
   */
  _getChildEntities: function(entity, childrenProp) {
    return childrenProp && entity[childrenProp] ? entity[childrenProp] : null;
  },

  /**
   * Get options for the next level in the hierarchy
   * @param {string} currentType - Current entity type
   * @param {string} childType - Child entity type
   * @param {Object} entity - Current entity
   * @param {Object} path - Path to current entity
   * @returns {Object|null} Options for next level rendering
   * @private
   */
  _getNextLevelOptions: function(currentType, childType, entity, path) {
    // Map of entity types to their children
    const hierarchyMap = {
      "mission_network": { childrenProp: "networkSegments", childEntityType: "network_segment" },
      "network_segment": { childrenProp: "securityDomains", childEntityType: "security_domain" },
      "security_domain": { childrenProp: "hwStacks", childEntityType: "hw_stack" },
      "hw_stack": { childrenProp: "assets", childEntityType: "asset" },
      "gp_instance": { childrenProp: "spInstances", childEntityType: "sp_instance" }
    };
    
    return hierarchyMap[childType] || null;
  },

  /**
   * Configure expand icon for a node
   * @param {HTMLElement} node - The tree node
   * @param {HTMLElement} childContainer - The child container
   * @param {boolean} isExpanded - Whether the node is expanded
   * @private
   */
  _configureExpandIcon: function(node, childContainer, isExpanded) {
    const expandIcon = node.querySelector(".expand-icon");
    if (!expandIcon) return;
    
          expandIcon.style.visibility = "visible";
          expandIcon.innerHTML = isExpanded ? "&#9660;" : "&#9658;";

          expandIcon.onclick = (e) => {
            e.stopPropagation();
      this.toggleNodeExpanded(node);
    };
  },

  /**
   * Dispatch node selected event
   * @param {string} type - Entity type
   * @param {string} id - Entity ID
   * @param {string} guid - Entity GUID
   * @param {Object} data - Entity data
   * @param {Object} parentPath - Path to entity
   */
  dispatchNodeSelected: function(type, id, guid, data, parentPath = {}) {
    const detail = {
      type,
      id,
      guid,
      data,
      ...parentPath
    };
    
    // Remove undefined properties
    Object.keys(detail).forEach(key => {
      if (detail[key] === undefined) delete detail[key];
    });
    
    const event = new CustomEvent("cis:node-selected", { detail });
        document.dispatchEvent(event);
  },

  /**
   * Create a tree node element
   * @param {string} type - Type of node
   * @param {string} name - Display name
   * @param {string} id - ID of the entity
   * @param {string} guid - GUID of the entity
   * @returns {HTMLElement} The created tree node
   */
  createTreeNode: function (type, name, id, guid) {
    // Use the utility function from CISUtil2
    return CISUtil2.createTreeNode(type, name, id, guid);
  },

  /**
   * Select a tree node and deselect others
   * @param {HTMLElement} node - The node to select
   */
  selectTreeNode: function (node) {
    if (!node) return;

    // Use the utility function from CISUtil2
    CISUtil2.selectTreeNode(node);

    // Store the current node reference
    this.currentTreeNode = node;
  },

  /**
   * Expand all parent nodes of a given node
   * @param {HTMLElement} node - The node whose parents to expand
   */
  expandParents: function (node) {
    if (!node) return;

    let parent = node.parentElement;
    while (parent) {
      // If parent is a tree-children container, expand it
      if (parent.classList.contains("tree-children")) {
        parent.style.display = "block";

        // Update the expand icon of the parent node
        const parentNode = parent.parentElement;
        if (parentNode && parentNode.classList.contains("tree-node")) {
          const expandIcon = parentNode.querySelector(".expand-icon");
          if (expandIcon) {
            expandIcon.innerHTML = "&#9660;"; // Down arrow
          }

          // Add the parent node's GUID to expanded nodes set if available
          const guid = parentNode.getAttribute("data-guid");
          if (guid) {
            this.expandedNodes.add(guid);
          }
        }
      }
      parent = parent.parentElement;
    }
  },

  /**
   * Apply consistent styling to all levels of the tree
   */
  applyConsistentStylingToTree: function () {
    // Get all tree-children containers in the tree
    const allContainers = document.querySelectorAll(".tree-children");

    // Apply consistent styling to each container
    allContainers.forEach((container) => {
      container.style.marginLeft = "20px";
      container.style.paddingLeft = "10px";
      container.style.borderLeft = "2px solid #ccc";
    });
  },

  /**
   * Select the root node by default when the page loads
   */
  selectRootNodeByDefault: function () {
    // Find the root node
    const rootNode = document.querySelector('.tree-node[data-type="cisplan"]');
    if (!rootNode) {
      console.warn("Root node not found for default selection");
      return;
    }

    // Select the root node
    this.selectTreeNode(rootNode);

    // Dispatch node selected event to update elements panel
    this.dispatchNodeSelected("cisplan", null, null, this.fullTreeData);

    // Ensure the elements panel shows mission networks
    setTimeout(() => {
      // Check if the elements panel is showing mission networks, if not, render them explicitly
      const elementsTitle = document.querySelector(".elements-title h5");
      if (!elementsTitle || !elementsTitle.textContent.includes("Mission Network")) {
        if (this.fullTreeData && this.fullTreeData.missionNetworks) {
          // Use the direct CISElements2 API to render mission networks
          CISElements2.clearElements();
          CISElements2.renderElementCards(
            this.fullTreeData.missionNetworks,
            "mission_network"
          );
        }
      }
    }, 100); // Small delay to ensure DOM is updated
  },

  /**
   * Toggle the expanded state of a node
   * @param {HTMLElement} node - The node to toggle
   */
  toggleNodeExpanded: function (node) {
    if (!node) return;

    const guid = node.getAttribute("data-guid");
    const isExpanded = CISUtil2.toggleNodeExpanded(node);

    // Update the expanded nodes set
    if (guid) {
      if (isExpanded) {
        this.expandedNodes.add(guid);
      } else {
        this.expandedNodes.delete(guid);
      }
    }

    // Apply consistent styling after toggling
    this.applyConsistentStylingToTree();
    
    return isExpanded;
  },
  
  /**
   * Restore expanded nodes from a saved set of GUIDs
   * @param {Set} expandedNodesSet - Set of GUIDs for nodes that should be expanded
   */
  restoreExpandedNodes: function (expandedNodesSet) {
    if (!expandedNodesSet || expandedNodesSet.size === 0) return;
    
    console.log('Attempting to restore expanded nodes:', Array.from(expandedNodesSet));
    
    // First, update our internal expanded nodes set
    expandedNodesSet.forEach(guid => {
      if (guid) this.expandedNodes.add(guid);
    });
    
    // Find all tree nodes in the DOM
    const allNodes = document.querySelectorAll('.tree-node');
    let expandedCount = 0;
    
    // For each node, check if its GUID is in the set of expanded nodes
    allNodes.forEach(node => {
      const guid = node.getAttribute('data-guid');
      if (guid && expandedNodesSet.has(guid)) {
        // Find the child container
        const childContainer = node.querySelector('.tree-children');
        const expandIcon = node.querySelector('.expand-icon');
        
        // Only expand if the node has children
        if (childContainer && expandIcon) {
          // Force expand the node regardless of current state
          childContainer.style.display = 'block';
          expandIcon.innerHTML = '&#9660;'; // Down-pointing triangle
          node.classList.add('expanded'); // Add expanded class for CSS targeting
          expandedCount++;
        }
      }
    });
    
    // Apply consistent styling to ensure all child containers are properly styled
    this.applyConsistentStylingToTree();
    
    console.log(`Expanded ${expandedCount} nodes from saved state`);
    
    // If we didn't expand any nodes but had some to expand, try again after a short delay
    if (expandedCount === 0 && expandedNodesSet.size > 0) {
      setTimeout(() => {
        let retryCount = 0;
        document.querySelectorAll('.tree-node').forEach(node => {
          const guid = node.getAttribute('data-guid');
          if (guid && expandedNodesSet.has(guid)) {
            const childContainer = node.querySelector('.tree-children');
            const expandIcon = node.querySelector('.expand-icon');
            
            if (childContainer && expandIcon) {
              childContainer.style.display = 'block';
              expandIcon.innerHTML = '&#9660;';
              node.classList.add('expanded');
              retryCount++;
            }
          }
        });
        console.log(`Retry expanded ${retryCount} nodes`);
      }, 100);
    }
  },

  /**
   * Select a tree node by its GUID
   * @param {string} guid - GUID of the node to select
   * @returns {boolean} True if the node was found and selected, false otherwise
   */
  selectNodeByGuid: function (guid) {
    if (!guid) return false;

    // Find the node with the given GUID
    const node = document.querySelector(`.tree-node[data-guid="${guid}"]`);
    if (node) {
      // Select the node
      this.selectTreeNode(node);

      // Trigger a click on the node to dispatch the node-selected event
      node.dispatchEvent(new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window
      }));

      return true;
    }

    return false;
  },

  /**
   * Select a tree node by its type and ID
   * @param {string} type - Type of the node to select
   * @param {string} id - ID of the node to select
   * @returns {boolean} True if the node was found and selected, false otherwise
   */
  selectNodeByTypeAndId: function (type, id) {
    if (!type || !id) return false;

    // Find the node with the given type and ID
    const node = document.querySelector(
      `.tree-node[data-type="${type}"][data-id="${id}"]`
    );
    if (node) {
      // Select the node
      this.selectTreeNode(node);

      // Trigger a click on the node to dispatch the node-selected event
      node.dispatchEvent(new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window
      }));

      return true;
    }

    return false;
  },

  /**
   * Navigate up to the parent node
   */
  navigateUp: function () {
    if (!this.currentTreeNode) return;

    // Find the parent tree node
    let parent = this.currentTreeNode.parentElement;
    while (parent) {
      if (parent.classList.contains("tree-node")) {
        // Select the parent node and trigger click
        this.selectTreeNode(parent);
        parent.dispatchEvent(new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window
        }));
        return;
      }
      parent = parent.parentElement;
    }
  },

  /**
   * Get the appropriate icon for an entity type
   * @param {string} type - Entity type
   * @returns {string} URL of the icon
   */
  getEntityIcon: function (type) {
    // Use the centralized utility function
    return CISUtil2.getEntityIcon(type);
  },

  /**
   * Copy the currently selected element
   * @param {string} guid - GUID of the element to copy
   * @param {string} name - Name of the element to copy (for confirmation dialog)
   */
  copyElement: function(guid, name) {
    if (!guid) {
      console.error("Cannot copy element: missing GUID");
      return;
    }
    
    // Show confirmation dialog
    const confirmCopy = confirm(`Do you want to create a copy of "${name}"?`);
    if (!confirmCopy) return;
    
    // Show loading indicator (assuming CISUtil2 has this helper)
    if (typeof CISUtil2 !== 'undefined' && CISUtil2.showLoading) {
      CISUtil2.showLoading("Creating copy...");
    }
    
    // Call the API to copy the element
    fetch(`/api/v2/cis_plan/entity/${guid}/copy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        new_name: `${name}_Copy`
      })
    })
    .then(response => response.json())
    .then(response => {
      // Hide loading indicator
      if (typeof CISUtil2 !== 'undefined' && CISUtil2.hideLoading) {
        CISUtil2.hideLoading();
      }
      
      if (response.status === 'success') {
        // Show success message
        if (typeof CISUtil2 !== 'undefined' && CISUtil2.showNotification) {
          CISUtil2.showNotification("Element copied successfully", "success");
        } else {
          alert("Element copied successfully");
        }
        
        // Refresh the tree to show the new element
        this.refreshOrReloadTree();
        
        // Select the new element if we have its GUID
        if (response.data && response.data.newEntityGuid) {
          setTimeout(() => {
            this.selectNodeByGuid(response.data.newEntityGuid);
          }, 500); // Give the tree time to render
        }
      } else {
        // Show error message
        const errorMsg = response.message || "Failed to copy element";
        if (typeof CISUtil2 !== 'undefined' && CISUtil2.showNotification) {
          CISUtil2.showNotification(errorMsg, "error");
        } else {
          alert(errorMsg);
        }
      }
    })
    .catch(error => {
      // Hide loading indicator
      if (typeof CISUtil2 !== 'undefined' && CISUtil2.hideLoading) {
        CISUtil2.hideLoading();
      }
      
      // Show error message
      console.error("Error copying element:", error);
      if (typeof CISUtil2 !== 'undefined' && CISUtil2.showNotification) {
        CISUtil2.showNotification("Error copying element", "error");
      } else {
        alert("Error copying element");
      }
    });
  },

  /**
   * Refresh the tree or reload if needed
   */
  refreshOrReloadTree: function() {
    // Fetch the latest CIS Plan data
    fetch('/api/v2/cis_plan')
      .then(response => response.json())
      .then(response => {
        if (response.status === 'success' && response.data) {
          // Remember expanded nodes
          const expandedNodes = new Set(this.expandedNodes);
          
          // Render the tree with the updated data
          this.renderTree(response.data);
          
          // Restore expanded nodes state
          this.restoreExpandedNodes(expandedNodes);
        } else {
          // If we couldn't get the data, reload the page
          window.location.reload();
        }
      })
      .catch(error => {
        console.error("Error refreshing tree:", error);
        // If there was an error, reload the page
        window.location.reload();
      });
  }
};
