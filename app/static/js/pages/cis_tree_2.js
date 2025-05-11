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

  // Use the centralized entity type names from CISUtil2

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
      if (cisPlanData.data && cisPlanData.data.missionNetworks) {
        // API response format: {data: {missionNetworks: [...]}}        
        this.fullTreeData = cisPlanData.data;
      } else if (cisPlanData.missionNetworks) {
        // Direct data format: {missionNetworks: [...]}
        this.fullTreeData = cisPlanData;
      }
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

    // Apply vertical tree styling
    this.treeContent.style.display = "block";
    this.treeContent.style.padding = "10px";
    this.treeContent.style.overflow = "auto";

    // Clear existing content
    this.treeContent.innerHTML = "";

    // Create root node
    const rootNode = this.createTreeNode("cisplan", "CIS Plan", null, null);
    this.treeContent.appendChild(rootNode);

    // Add click handler to root node
    const self = this;
    rootNode.addEventListener("click", function (e) {
      e.stopPropagation();

      // Select this node using the centralized function
      self.selectTreeNode(this);

      // Dispatch node selected event
      const event = new CustomEvent("cis:node-selected", {
        detail: {
          type: "cisplan",
          id: null,
          guid: null,
          data: self.fullTreeData,
        },
      });
      document.dispatchEvent(event);
    });

    // Get mission networks from the stored data
    const missionNetworks = this.fullTreeData.missionNetworks || [];

    // Initialize expanded nodes set if not already done
    // By default, expand only up to the asset level (not including network interfaces, GP instances, or SP instances)
    if (!this._expandedInitialized) {
      // Clear any previous expanded nodes
      this.expandedNodes = new Set();

      // Add root node to expanded set
      this.expandedNodes.add(null);

      // Only expand up to the asset level
      if (this.fullTreeData && this.fullTreeData.missionNetworks) {
        // Process each mission network
        this.fullTreeData.missionNetworks.forEach((network) => {
          // Add mission network GUID to expanded nodes
          if (network.guid) this.expandedNodes.add(network.guid);

          // Process each network segment
          if (network.networkSegments) {
            network.networkSegments.forEach((segment) => {
              // Add segment GUID to expanded nodes
              if (segment.guid) this.expandedNodes.add(segment.guid);

              // Process each security domain
              if (segment.securityDomains) {
                segment.securityDomains.forEach((domain) => {
                  // Add domain GUID to expanded nodes
                  if (domain.guid) this.expandedNodes.add(domain.guid);

                  // Process each HW stack
                  if (domain.hwStacks) {
                    domain.hwStacks.forEach((stack) => {
                      // Add stack GUID to expanded nodes
                      if (stack.guid) this.expandedNodes.add(stack.guid);

                      // We do NOT add assets' children (network interfaces, GP instances, SP instances)
                      // to the expanded nodes set
                    });
                  }
                });
              }
            });
          }
        });
      }

      this._expandedInitialized = true;
    }

    // Create container for mission networks
    const childContainer = document.createElement("div");
    childContainer.className = "tree-children";
    rootNode.appendChild(childContainer);

    // Apply consistent styling using the utility function
    CISUtil2.styleChildContainer(childContainer);

    // Set expand icon for root
    const expandIcon = rootNode.querySelector(".expand-icon");
    if (expandIcon) {
      expandIcon.style.visibility = "visible";
      expandIcon.innerHTML = "&#9660;"; // Down-pointing triangle (expanded)
      expandIcon.onclick = (e) => {
        e.stopPropagation();
        if (childContainer.style.display === "block") {
          childContainer.style.display = "none";
          expandIcon.innerHTML = "&#9658;"; // Right-pointing triangle
        } else {
          childContainer.style.display = "block";
          expandIcon.innerHTML = "&#9660;"; // Down-pointing triangle
        }
      };
    }

    // Render mission networks
    if (missionNetworks.length > 0) {
      this.renderMissionNetworks(childContainer, missionNetworks);

      // Apply consistent styling to all tree levels
      this.applyConsistentStylingToTree();
      
      // Restore previously expanded nodes if available
      if (this._previouslyExpandedNodes && this._previouslyExpandedNodes.size > 0) {
        console.log('Restoring expanded nodes state:', this._previouslyExpandedNodes.size, 'nodes');
        this.restoreExpandedNodes(this._previouslyExpandedNodes);
        // Clear the temporary storage
        this._previouslyExpandedNodes = null;
      }

      // Select the root node by default
      this.selectRootNodeByDefault();
    } else {
      console.warn("No mission networks found in data");
      childContainer.innerHTML =
        '<div class="tree-node-empty">No mission networks found</div>';
    }
  },

  /**
   * Render mission networks
   * @param {HTMLElement} container - The container element
   * @param {Array} missionNetworks - Array of mission networks
   */
  renderMissionNetworks: function (container, missionNetworks) {
    if (!missionNetworks || !missionNetworks.length) {
      console.warn("No mission networks to render");
      return;
    }

    const self = this;

    // Process each mission network
    missionNetworks.forEach((network) => {
      // Create mission network node
      const networkNode = this.createTreeNode(
        "mission_network",
        network.name,
        network.id,
        network.guid
      );
      container.appendChild(networkNode);

      // Set up click handler
      networkNode.addEventListener("click", function (e) {
        e.stopPropagation();

        // Select this node using the centralized function
        self.selectTreeNode(this);

        // Dispatch node selected event
        const event = new CustomEvent("cis:node-selected", {
          detail: {
            type: "mission_network",
            id: network.id,
            guid: network.guid,
            data: network,
          },
        });
        document.dispatchEvent(event);
      });

      // If network has segments, create child container
      if (network.networkSegments && network.networkSegments.length > 0) {
        const childContainer = document.createElement("div");
        childContainer.className = "tree-children";
        networkNode.appendChild(childContainer);

        // Apply consistent styling
        this.styleChildContainer(childContainer);

        // Set display based on expanded state
        const isExpanded = this.expandedNodes.has(network.guid);
        childContainer.style.display = isExpanded ? "block" : "none";

        // Update expand icon
        const expandIcon = networkNode.querySelector(".expand-icon");
        if (expandIcon) {
          expandIcon.style.visibility = "visible";
          expandIcon.innerHTML = isExpanded ? "&#9660;" : "&#9658;";

          // Add click handler for expand/collapse
          expandIcon.onclick = (e) => {
            e.stopPropagation();
            this.toggleNodeExpanded(networkNode);
          };
        }

        // Render network segments
        this.renderNetworkSegments(
          childContainer,
          network.networkSegments,
          network
        );
      }
    });
  },

  /**
   * Render network segments
   * @param {HTMLElement} container - The container element
   * @param {Array} segments - Array of network segments
   * @param {Object} parentNetwork - Parent mission network
   */
  renderNetworkSegments: function (container, segments, parentNetwork) {
    if (!segments || !segments.length) return;

    const self = this;

    segments.forEach((segment) => {
      // Create segment node
      const segmentNode = this.createTreeNode(
        "network_segment",
        segment.name,
        segment.id,
        segment.guid
      );
      container.appendChild(segmentNode);

      // Set up click handler
      segmentNode.addEventListener("click", function (e) {
        e.stopPropagation();

        // Select this node using the centralized function
        self.selectTreeNode(this);

        // Dispatch node selected event
        const event = new CustomEvent("cis:node-selected", {
          detail: {
            type: "network_segment",
            id: segment.id,
            guid: segment.guid,
            data: segment,
            parentNetwork: parentNetwork,
          },
        });
        document.dispatchEvent(event);
      });

      // If segment has security domains, create child container
      if (segment.securityDomains && segment.securityDomains.length > 0) {
        const childContainer = document.createElement("div");
        childContainer.className = "tree-children";
        segmentNode.appendChild(childContainer);

        // Apply consistent styling
        CISUtil2.styleChildContainer(childContainer);

        // Set display based on expanded state
        const isExpanded = this.expandedNodes.has(segment.guid);
        childContainer.style.display = isExpanded ? "block" : "none";

        // Update expand icon
        const expandIcon = segmentNode.querySelector(".expand-icon");
        if (expandIcon) {
          expandIcon.style.visibility = "visible";
          expandIcon.innerHTML = isExpanded ? "&#9660;" : "&#9658;";

          // Add click handler for expand/collapse
          expandIcon.onclick = (e) => {
            e.stopPropagation();
            this.toggleNodeExpanded(segmentNode);
          };
        }

        // Render security domains
        this.renderSecurityDomains(
          childContainer,
          segment.securityDomains,
          segment,
          parentNetwork
        );
      }
    });
  },

  /**
   * Render security domains
   * @param {HTMLElement} container - The container element
   * @param {Array} domains - Array of security domains
   * @param {Object} parentSegment - Parent network segment
   * @param {Object} parentNetwork - Parent mission network
   */
  renderSecurityDomains: function (
    container,
    domains,
    parentSegment,
    parentNetwork
  ) {
    if (!domains || !domains.length) return;

    const self = this;

    domains.forEach((domain) => {
      // Create domain node
      const domainNode = this.createTreeNode(
        "security_domain",
        domain.id, // Using ID as name since security domains often use classification IDs
        domain.id,
        domain.guid
      );
      container.appendChild(domainNode);

      // Set up click handler
      domainNode.addEventListener("click", function (e) {
        e.stopPropagation();

        // Select this node using the centralized function
        self.selectTreeNode(this);

        // Dispatch node selected event
        const event = new CustomEvent("cis:node-selected", {
          detail: {
            type: "security_domain",
            id: domain.id,
            guid: domain.guid,
            data: domain,
            parentSegment: parentSegment,
            parentNetwork: parentNetwork,
          },
        });
        document.dispatchEvent(event);
      });

      // If domain has HW stacks, create child container
      if (domain.hwStacks && domain.hwStacks.length > 0) {
        const childContainer = document.createElement("div");
        childContainer.className = "tree-children";
        domainNode.appendChild(childContainer);

        // Apply consistent styling
        CISUtil2.styleChildContainer(childContainer);

        // Set display based on expanded state
        const isExpanded = this.expandedNodes.has(domain.guid);
        childContainer.style.display = isExpanded ? "block" : "none";

        // Update expand icon
        const expandIcon = domainNode.querySelector(".expand-icon");
        if (expandIcon) {
          expandIcon.style.visibility = "visible";
          expandIcon.innerHTML = isExpanded ? "&#9660;" : "&#9658;";

          // Add click handler for expand/collapse
          expandIcon.onclick = (e) => {
            e.stopPropagation();
            this.toggleNodeExpanded(domainNode);
          };
        }

        // Render HW stacks
        this.renderHWStacks(
          childContainer,
          domain.hwStacks,
          domain,
          parentSegment,
          parentNetwork
        );
      }
    });
  },

  /**
   * Render HW stacks
   * @param {HTMLElement} container - The container element
   * @param {Array} stacks - Array of HW stacks
   * @param {Object} parentDomain - Parent security domain
   * @param {Object} parentSegment - Parent network segment
   * @param {Object} parentNetwork - Parent mission network
   */
  renderHWStacks: function (
    container,
    stacks,
    parentDomain,
    parentSegment,
    parentNetwork
  ) {
    if (!stacks || !stacks.length) return;

    const self = this;

    stacks.forEach((stack) => {
      // Create stack node
      const stackNode = this.createTreeNode(
        "hw_stack",
        stack.name,
        stack.id,
        stack.guid
      );
      container.appendChild(stackNode);

      // Set up click handler
      stackNode.addEventListener("click", function (e) {
        e.stopPropagation();

        // Select this node using the centralized function
        self.selectTreeNode(this);

        // Dispatch node selected event
        const event = new CustomEvent("cis:node-selected", {
          detail: {
            type: "hw_stack",
            id: stack.id,
            guid: stack.guid,
            data: stack,
            parentDomain: parentDomain,
            parentSegment: parentSegment,
            parentNetwork: parentNetwork,
          },
        });
        document.dispatchEvent(event);
      });

      // If stack has assets, create child container
      if (stack.assets && stack.assets.length > 0) {
        const childContainer = document.createElement("div");
        childContainer.className = "tree-children";
        stackNode.appendChild(childContainer);

        // Apply consistent styling
        CISUtil2.styleChildContainer(childContainer);

        // Set display based on expanded state
        const isExpanded = this.expandedNodes.has(stack.guid);
        childContainer.style.display = isExpanded ? "block" : "none";

        // Update expand icon
        const expandIcon = stackNode.querySelector(".expand-icon");
        if (expandIcon) {
          expandIcon.style.visibility = "visible";
          expandIcon.innerHTML = isExpanded ? "&#9660;" : "&#9658;";

          // Add click handler for expand/collapse
          expandIcon.onclick = (e) => {
            e.stopPropagation();
            this.toggleNodeExpanded(stackNode);
          };
        }

        // Render assets
        this.renderAssets(
          childContainer,
          stack.assets,
          stack,
          parentDomain,
          parentSegment,
          parentNetwork
        );
      }
    });
  },

  /**
   * Render assets
   * @param {HTMLElement} container - The container element
   * @param {Array} assets - Array of assets
   * @param {Object} parentStack - Parent HW stack
   * @param {Object} parentDomain - Parent security domain
   * @param {Object} parentSegment - Parent network segment
   * @param {Object} parentNetwork - Parent mission network
   */
  renderAssets: function (
    container,
    assets,
    parentStack,
    parentDomain,
    parentSegment,
    parentNetwork
  ) {
    if (!assets || !assets.length) return;

    const self = this;

    assets.forEach((asset) => {
      // Create asset node
      const assetNode = this.createTreeNode(
        "asset",
        asset.name,
        asset.id,
        asset.guid
      );
      container.appendChild(assetNode);

      // Set up click handler
      assetNode.addEventListener("click", function (e) {
        e.stopPropagation();

        // Select this node using the centralized function
        self.selectTreeNode(this);

        // Dispatch node selected event
        const event = new CustomEvent("cis:node-selected", {
          detail: {
            type: "asset",
            id: asset.id,
            guid: asset.guid,
            data: asset,
            parentStack: parentStack,
            parentDomain: parentDomain,
            parentSegment: parentSegment,
            parentNetwork: parentNetwork,
          },
        });
        document.dispatchEvent(event);
      });

      // Check if asset has network interfaces or GP instances
      const hasNetworkInterfaces =
        asset.networkInterfaces && asset.networkInterfaces.length > 0;
      const hasGPInstances = asset.gpInstances && asset.gpInstances.length > 0;

      // If asset has children, create child container
      if (hasNetworkInterfaces || hasGPInstances) {
        const childContainer = document.createElement("div");
        childContainer.className = "tree-children";
        assetNode.appendChild(childContainer);

        // Apply consistent styling
        CISUtil2.styleChildContainer(childContainer);

        // Set display based on expanded state
        const isExpanded = this.expandedNodes.has(asset.guid);
        childContainer.style.display = isExpanded ? "block" : "none";

        // Update expand icon
        const expandIcon = assetNode.querySelector(".expand-icon");
        if (expandIcon) {
          expandIcon.style.visibility = "visible";
          expandIcon.innerHTML = isExpanded ? "&#9660;" : "&#9658;";

          // Add click handler for expand/collapse
          expandIcon.onclick = (e) => {
            e.stopPropagation();
            this.toggleNodeExpanded(assetNode);
          };
        }

        // Render network interfaces
        if (hasNetworkInterfaces) {
          this.renderNetworkInterfaces(
            childContainer,
            asset.networkInterfaces,
            asset,
            parentStack,
            parentDomain,
            parentSegment,
            parentNetwork
          );
        }

        // Render GP instances
        if (hasGPInstances) {
          this.renderGPInstances(
            childContainer,
            asset.gpInstances,
            asset,
            parentStack,
            parentDomain,
            parentSegment,
            parentNetwork
          );
        }
      }
    });
  },

  /**
   * Render network interfaces
   * @param {HTMLElement} container - The container element
   * @param {Array} interfaces - Array of network interfaces
   * @param {Object} parentAsset - Parent asset
   * @param {Object} parentStack - Parent HW stack
   * @param {Object} parentDomain - Parent security domain
   * @param {Object} parentSegment - Parent network segment
   * @param {Object} parentNetwork - Parent mission network
   */
  renderNetworkInterfaces: function (
    container,
    interfaces,
    parentAsset,
    parentStack,
    parentDomain,
    parentSegment,
    parentNetwork
  ) {
    if (!interfaces || !interfaces.length) return;

    const self = this;

    interfaces.forEach((iface) => {
      // Get IP address from configuration items if available
      let ipAddress = "N/A";
      if (iface.configurationItems && Array.isArray(iface.configurationItems)) {
        const ipItem = iface.configurationItems.find(
          (item) => item.Name === "IP Address"
        );
        if (ipItem && ipItem.AnswerContent) {
          ipAddress = ipItem.AnswerContent;
        }
      }

      // Create interface node with name and IP address
      const displayName = `${iface.name} - ${ipAddress}`;
      const interfaceNode = this.createTreeNode(
        "network_interface",
        displayName,
        iface.id,
        iface.guid
      );
      container.appendChild(interfaceNode);

      // Set up click handler
      interfaceNode.addEventListener("click", function (e) {
        e.stopPropagation();

        // Select this node using the centralized function
        self.selectTreeNode(this);

        // Dispatch node selected event
        const event = new CustomEvent("cis:node-selected", {
          detail: {
            type: "network_interface",
            id: iface.id,
            guid: iface.guid,
            data: iface,
            parentAsset: parentAsset,
            parentStack: parentStack,
            parentDomain: parentDomain,
            parentSegment: parentSegment,
            parentNetwork: parentNetwork,
          },
        });
        document.dispatchEvent(event);
      });
    });
  },

  /**
   * Render GP instances
   * @param {HTMLElement} container - The container element
   * @param {Array} gpInstances - Array of GP instances
   * @param {Object} parentAsset - Parent asset
   * @param {Object} parentStack - Parent HW stack
   * @param {Object} parentDomain - Parent security domain
   * @param {Object} parentSegment - Parent network segment
   * @param {Object} parentNetwork - Parent mission network
   */
  renderGPInstances: function (
    container,
    gpInstances,
    parentAsset,
    parentStack,
    parentDomain,
    parentSegment,
    parentNetwork
  ) {
    if (!gpInstances || !gpInstances.length) return;

    const self = this;

    gpInstances.forEach((gp) => {
      // Create GP instance node with loading placeholder
      const initialDisplayName = gp.instanceLabel
        ? `${gp.gpid} (${gp.instanceLabel})`
        : gp.gpid;

      const gpNode = this.createTreeNode(
        "gp_instance",
        initialDisplayName,
        gp.gpid,
        gp.guid
      );

      // Add a data attribute to identify this node by gpid
      gpNode.setAttribute("data-gpid", gp.gpid);
      container.appendChild(gpNode);

      // Fetch the GP name from the API
      fetch(`/api/gps/${gp.gpid}/name`)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data && data.name) {
            // Find all nodes with this gpid and update them
            const nodes = document.querySelectorAll(
              `.tree-node[data-gpid="${gp.gpid}"]`
            );

            nodes.forEach((node) => {
              const nodeText = node.querySelector(".tree-node-text");
              if (nodeText) {
                const displayName = gp.instanceLabel
                  ? `${data.name} (${gp.instanceLabel})`
                  : data.name;
                nodeText.textContent = displayName;
              } else {
                console.warn(`No .tree-node-text found in node for ${gp.gpid}`);
              }
            });
          } else {
            console.warn(`No name data found for GP ${gp.gpid}`);
          }
        })
        .catch((error) => {
          console.error(`Error fetching GP name for ${gp.gpid}:`, error);
        });

      // Set up click handler
      gpNode.addEventListener("click", function (e) {
        e.stopPropagation();

        // Select this node using the centralized function
        self.selectTreeNode(this);

        // Dispatch node selected event
        const event = new CustomEvent("cis:node-selected", {
          detail: {
            type: "gp_instance",
            id: gp.gpid,
            guid: gp.guid,
            data: gp,
            parentAsset: parentAsset,
            parentStack: parentStack,
            parentDomain: parentDomain,
            parentSegment: parentSegment,
            parentNetwork: parentNetwork,
          },
        });
        document.dispatchEvent(event);
      });

      // If GP instance has SP instances, create child container
      if (gp.spInstances && gp.spInstances.length > 0) {
        const childContainer = document.createElement("div");
        childContainer.className = "tree-children";
        gpNode.appendChild(childContainer);

        // Set display based on expanded state
        const isExpanded = this.expandedNodes.has(gp.guid);
        childContainer.style.display = isExpanded ? "block" : "none";

        // Update expand icon
        const expandIcon = gpNode.querySelector(".expand-icon");
        if (expandIcon) {
          expandIcon.style.visibility = "visible";
          expandIcon.innerHTML = isExpanded ? "&#9660;" : "&#9658;";

          // Add click handler for expand/collapse
          expandIcon.onclick = (e) => {
            e.stopPropagation();
            this.toggleNodeExpanded(gpNode);
          };
        }

        // Render SP instances
        this.renderSPInstances(
          childContainer,
          gp.spInstances,
          gp,
          parentAsset,
          parentStack,
          parentDomain,
          parentSegment,
          parentNetwork
        );
      }
    });
  },

  /**
   * Render SP instances
   * @param {HTMLElement} container - The container element
   * @param {Array} spInstances - Array of SP instances
   * @param {Object} parentGP - Parent GP instance
   * @param {Object} parentAsset - Parent asset
   * @param {Object} parentStack - Parent HW stack
   * @param {Object} parentDomain - Parent security domain
   * @param {Object} parentSegment - Parent network segment
   * @param {Object} parentNetwork - Parent mission network
   */
  renderSPInstances: function (
    container,
    spInstances,
    parentGP,
    parentAsset,
    parentStack,
    parentDomain,
    parentSegment,
    parentNetwork
  ) {
    if (!spInstances || !spInstances.length) return;

    const self = this;

    spInstances.forEach((sp) => {
      // Create SP instance node with loading placeholder
      const initialDisplayName = sp.spVersion
        ? `${sp.spId} (v${sp.spVersion})`
        : sp.spId;
      const spNode = this.createTreeNode(
        "sp_instance",
        initialDisplayName,
        sp.spId,
        sp.guid
      );

      // Add a data attribute to identify this node by spId
      spNode.setAttribute("data-spid", sp.spId);
      container.appendChild(spNode);

      // Fetch the SP name from the API
      fetch(`/api/sps/name/${sp.spId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data && data.success && data.name) {
            // Find all nodes with this spId and update them
            document
              .querySelectorAll(`.tree-node[data-spid="${sp.spId}"]`)
              .forEach((node) => {
                const nodeText = node.querySelector(".tree-node-text");
                if (nodeText) {
                  const displayName = sp.spVersion
                    ? `${data.name} (v${sp.spVersion})`
                    : data.name;
                  nodeText.textContent = displayName;
                }
              });
          }
        })
        .catch((error) => {
          console.error(`Error fetching SP name for ${sp.spId}:`, error);
        });

      // Set up click handler
      spNode.addEventListener("click", function (e) {
        e.stopPropagation();

        // Select this node using the centralized function
        self.selectTreeNode(this);

        // Dispatch node selected event
        const event = new CustomEvent("cis:node-selected", {
          detail: {
            type: "sp_instance",
            id: sp.spId,
            guid: sp.guid,
            data: sp,
            parentGP: parentGP,
            parentAsset: parentAsset,
            parentStack: parentStack,
            parentDomain: parentDomain,
            parentSegment: parentSegment,
            parentNetwork: parentNetwork,
          },
        });
        document.dispatchEvent(event);
      });
    });
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
   * Apply consistent styling to a tree children container
   * @param {HTMLElement} container - The container to style
   */
  styleChildContainer: function (container) {
    // Use the utility function from CISUtil2
    CISUtil2.styleChildContainer(container);
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
   * This ensures vertical lines appear at all levels
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
   * This will also trigger the display of mission networks in the elements panel
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
    const event = new CustomEvent("cis:node-selected", {
      detail: {
        type: "cisplan",
        id: null,
        guid: null,
        data: this.fullTreeData,
      },
    });
    document.dispatchEvent(event);

    // Ensure the elements panel shows mission networks
    setTimeout(() => {
      // Check if the elements panel is showing mission networks, if not, render them explicitly
      const elementsTitle = document.querySelector(".elements-title h5");
      if (
        !elementsTitle ||
        !elementsTitle.textContent.includes("Mission Network")
      ) {
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
    // This handles cases where the DOM might not be fully rendered yet
    if (expandedCount === 0 && expandedNodesSet.size > 0) {
      console.log('No nodes expanded, retrying after delay...');
      setTimeout(() => {
        let retryCount = 0;
        allNodes.forEach(node => {
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
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      node.dispatchEvent(clickEvent);

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
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      node.dispatchEvent(clickEvent);

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
        // Select the parent node
        this.selectTreeNode(parent);

        // Trigger a click on the parent node to dispatch the node-selected event
        const clickEvent = new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        parent.dispatchEvent(clickEvent);

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
};
