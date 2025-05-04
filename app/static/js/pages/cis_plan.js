/**
 * CIS Plan JavaScript file
 *
 * This file handles the functionality for the CIS Plan view.
 * The code is organized into the following sections:
 *
 * 1. Global Variables & State Management
 * 2. Event Handlers & Initialization
 * 3. API Integration Functions (delegating to CISApi)
 * 4. Tree Rendering & Manipulation
 * 5. Panel Rendering & Element Display
 * 6. Search & Navigation Functions
 * 7. Utility & Helper Functions
 */

//=============================================================================
// 1. GLOBAL VARIABLES & STATE MANAGEMENT
//=============================================================================

// Core state management variables
let currentTreeNode = null; // Currently selected tree node
let currentElement = null; // Currently selected element within a node
let cisPlanData = null; // CIS Plan tree data from API

// Store security classifications data
let securityClassifications = [];

//=============================================================================
// 2. EVENT HANDLERS & INITIALIZATION
//=============================================================================

// Function to prevent unwanted autocomplete on forms by randomizing field names
function applyRandomizedFieldNames() {
  // Use CISUtils to generate a random suffix
  const randomSuffix = CISUtils.generateRandomSuffix();

  // Select all forms that need protection
  const forms = document.querySelectorAll("form[data-form-type]");

  forms.forEach((form) => {
    // Get all inputs, selects, and textareas in the form
    const formElements = form.querySelectorAll("input, select, textarea");

    formElements.forEach((element) => {
      if (element.name && element.name.includes("_random")) {
        // Replace the placeholder "random" with an actual random string
        const baseName = element.name.split("_random")[0];
        element.name = `${baseName}_${randomSuffix}`;
      }
    });
  });
}

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Add event listeners to all modals to apply randomized field names on show
  const modals = document.querySelectorAll(".modal");
  modals.forEach((modal) => {
    modal.addEventListener("show.bs.modal", function () {
      // Apply randomized names to all form fields when modal is shown
      // This defeats browser autocomplete and password manager interference
      applyRandomizedFieldNames();
    });
  });
  // Add event listener for the saveAssetBtn
  document.getElementById("saveAssetBtn").addEventListener("click", addAsset);

  // Add event listener for the updateAssetBtn
  document
    .getElementById("updateAssetBtn")
    .addEventListener("click", updateAsset);

  // Add event listeners for network interface buttons
  document
    .getElementById("saveNetworkInterfaceBtn")
    .addEventListener("click", addNetworkInterface);
  document
    .getElementById("updateNetworkInterfaceBtn")
    .addEventListener("click", updateNetworkInterface);

  // Add event listeners for GP container buttons
  document
    .getElementById("saveGPContainerBtn")
    .addEventListener("click", addGPContainer);
  document
    .getElementById("updateGPContainerBtn")
    .addEventListener("click", updateGPContainer);

  // Add Enter key save functionality to all modals
  // Function to add Enter key handler to a modal
  function addEnterKeyHandler(modalId, saveFunction) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault(); // Prevent default form submission
          saveFunction(); // Call the save function
        }
      });
    }
  }

  // Apply Enter key handlers to all entity modals
  // Mission Networks
  addEnterKeyHandler("addMissionNetworkModal", addMissionNetwork);
  addEnterKeyHandler("editMissionNetworkModal", updateMissionNetwork);

  // Network Segments
  addEnterKeyHandler("addNetworkSegmentModal", addNetworkSegment);
  addEnterKeyHandler("editNetworkSegmentModal", updateNetworkSegment);

  // Security Domains
  addEnterKeyHandler("addSecurityDomainModal", addSecurityDomain);

  // HW Stacks
  addEnterKeyHandler("addHwStackModal", addHwStack);
  addEnterKeyHandler("editHwStackModal", updateHwStack);

  // Assets
  addEnterKeyHandler("addAssetModal", addAsset);
  addEnterKeyHandler("editAssetModal", updateAsset);

  // Network Interfaces
  addEnterKeyHandler("addNetworkInterfaceModal", addNetworkInterface);
  addEnterKeyHandler("editNetworkInterfaceModal", updateNetworkInterface);

  // GP Containers
  addEnterKeyHandler("addGPContainerModal", addGPContainer);
  addEnterKeyHandler("editGPContainerModal", updateGPContainer);

  // Get references to DOM elements
  const treeSearchInput = document.getElementById("treeSearchInput");
  const elementsSearchInput = document.getElementById("elementsSearchInput");
  const cisTree = document.getElementById("cisTree");
  const elementsContainer =
    document.getElementById("elementsContainer") ||
    document.createElement("div");
  const elementsTitle =
    document.getElementById("elementsTitle") || document.createElement("h4");
  const detailsContainer =
    document.getElementById("detailsContainer") ||
    document.createElement("div");
  const detailsTitle =
    document.getElementById("detailsTitle") || document.createElement("h4");
  const refreshButton = document.getElementById("refreshButton");
  const addElementButton = document.getElementById("addElementButton");
  const editDetailButton = document.getElementById("editDetailButton");
  const deleteDetailButton = document.getElementById("deleteDetailButton");

  // We'll add navigation elements to the elements panel dynamically when needed

  // Add event listeners for search inputs
  treeSearchInput.addEventListener("input", handleTreeSearch);
  treeSearchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      focusFirstMatchingTreeNode();
    }
  });
  elementsSearchInput.addEventListener("input", handleElementsSearch);

  // Navigation events will be added dynamically when the elements panel is populated

  // Add event listeners for buttons
  if (refreshButton) {
    refreshButton.addEventListener("click", fetchCISPlanData);
  }

  // Let's keep it simple and follow the same pattern as mission networks

  // Add element button opens the appropriate modal based on current selection
  if (addElementButton) {
    addElementButton.addEventListener("click", async function () {
      // Root node (CIS Plan) selected - add mission network
      if (
        currentTreeNode &&
        currentTreeNode.getAttribute("data-id") === "root-cisplan"
      ) {
        // Show add mission network modal
        const addModal = new bootstrap.Modal(
          document.getElementById("addMissionNetworkModal")
        );
        addModal.show();
      }
      // Mission Network selected - add network segment
      else if (
        currentTreeNode &&
        currentTreeNode.getAttribute("data-type") === "missionNetworks"
      ) {
        // Show add network segment modal
        document.getElementById("addNetworkSegmentMissionNetworkId").value =
          currentTreeNode.getAttribute("data-id");
        const addModal = new bootstrap.Modal(
          document.getElementById("addNetworkSegmentModal")
        );
        addModal.show();
      }
      // Network Segment selected - add security domain
      else if (
        currentTreeNode &&
        currentTreeNode.getAttribute("data-type") === "networkSegments"
      ) {
        // First load security classifications for the dropdown
        fetchSecurityClassifications().then(() => {
          // Store parent IDs for the API call
          const segmentId = currentTreeNode.getAttribute("data-id");
          const missionNetworkId = currentTreeNode.getAttribute(
            "data-parent-mission-network"
          );

          document.getElementById("addSecurityDomainSegmentId").value =
            segmentId;
          document.getElementById("addSecurityDomainMissionNetworkId").value =
            missionNetworkId;

          // Show add security domain modal
          const addModal = new bootstrap.Modal(
            document.getElementById("addSecurityDomainModal")
          );
          addModal.show();
        });
      }
      // Security Domain selected - add HW Stack
      else if (
        currentTreeNode &&
        currentTreeNode.getAttribute("data-type") === "securityDomains"
      ) {
        const mn = currentTreeNode.getAttribute("data-parent-mission-network");
        const seg = currentTreeNode.getAttribute("data-parent-segment");
        const dom = currentTreeNode.getAttribute("data-id");
        document.getElementById("addHwStackMissionNetworkId").value = mn;
        document.getElementById("addHwStackSegmentId").value = seg;
        document.getElementById("addHwStackDomainId").value = dom;
        const select = document.getElementById("addHwStackCisParticipant");
        select.innerHTML = "";
        const participants = await fetchParticipants();
        participants.forEach((p) => {
          const opt = document.createElement("option");
          opt.value = p.key;
          opt.textContent = p.name;
          select.appendChild(opt);
        });
        const addModal = new bootstrap.Modal(
          document.getElementById("addHwStackModal")
        );
        addModal.show();
      }
      // HW Stack selected - add Asset
      else if (
        currentTreeNode &&
        currentTreeNode.getAttribute("data-type") === "hwStacks"
      ) {
        const mn = currentTreeNode.getAttribute("data-parent-mission-network");
        const seg = currentTreeNode.getAttribute("data-parent-segment");
        const dom = currentTreeNode.getAttribute("data-parent-domain");
        const stack = currentTreeNode.getAttribute("data-id");
        document.getElementById("addAssetMissionNetworkId").value = mn;
        document.getElementById("addAssetSegmentId").value = seg;
        document.getElementById("addAssetDomainId").value = dom;
        document.getElementById("addAssetHwStackId").value = stack;
        const addModal = new bootstrap.Modal(
          document.getElementById("addAssetModal")
        );
        addModal.show();
      }
      // Asset selected - add Network Interface or GP Container
      else if (
        currentTreeNode &&
        currentTreeNode.getAttribute("data-type") === "assets"
      ) {
        // Create a split panel with options for Network Interface and GP Container
        const modalContent = document.createElement("div");
        modalContent.className = "container";
        modalContent.innerHTML = `
          <div class="row">
            <div class="col-md-6 border-end">
              <div class="p-3 text-center">
                <img src="${getElementIcon(
                  "networkInterfaces"
                )}" width="48" height="48" alt="Network Interface">
                <h5 class="mt-3">Network Interface</h5>
                <p class="small text-muted">Add a new network interface to this asset</p>
                <button class="btn btn-primary btn-add-network-interface">Add Network Interface</button>
              </div>
            </div>
            <div class="col-md-6">
              <div class="p-3 text-center">
                <img src="${getElementIcon(
                  "gpInstances"
                )}" width="48" height="48" alt="GP Container">
                <h5 class="mt-3">Generic Product</h5>
                <p class="small text-muted">Add a new generic product to this asset</p>
                <button class="btn btn-primary btn-add-gp-container">Add Generic Product</button>
              </div>
            </div>
          </div>
        `;

        // Create a modal to display the options
        const modalDialog = document.createElement("div");
        modalDialog.className = "modal fade";
        modalDialog.id = "assetAddOptionsModal";
        modalDialog.setAttribute("tabindex", "-1");
        modalDialog.setAttribute(
          "aria-labelledby",
          "assetAddOptionsModalLabel"
        );
        modalDialog.setAttribute("aria-hidden", "true");

        modalDialog.innerHTML = `
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="assetAddOptionsModalLabel">Add to ${
                  currentTreeNode.querySelector(".node-text").textContent
                }</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <!-- Content will be inserted here -->
              </div>
            </div>
          </div>
        `;

        // Add the modal to the document if it doesn't exist
        if (!document.getElementById("assetAddOptionsModal")) {
          document.body.appendChild(modalDialog);
        } else {
          document
            .getElementById("assetAddOptionsModal")
            .querySelector(".modal-body").innerHTML = "";
        }

        // Add the content to the modal
        document
          .getElementById("assetAddOptionsModal")
          .querySelector(".modal-body")
          .appendChild(modalContent);

        // Show the modal
        const optionsModal = new bootstrap.Modal(
          document.getElementById("assetAddOptionsModal")
        );
        optionsModal.show();

        // Add event listeners to the buttons
        document
          .querySelector(".btn-add-network-interface")
          .addEventListener("click", function () {
            // Hide the options modal
            optionsModal.hide();

            // Get the parent information - ensure we're getting string values
            const mn = currentTreeNode.getAttribute(
              "data-parent-mission-network"
            );
            const seg = currentTreeNode.getAttribute("data-parent-segment");
            const dom = currentTreeNode.getAttribute("data-parent-domain");
            const stack = currentTreeNode.getAttribute("data-parent-stack");
            const asset = currentTreeNode.getAttribute("data-id");
            // Extract actual IDs from the parent tree nodes
            // Special handling for '[object Object]' strings
            let mnId =
              currentTreeNode.getAttribute("data-parent-mission-network-id") ||
              "MN-0001";
            let segId =
              currentTreeNode.getAttribute("data-parent-segment-id") ||
              "SEG-0001";
            let domId =
              currentTreeNode.getAttribute("data-parent-domain-id") ||
              "DOM-0001";
            let stackId =
              currentTreeNode.getAttribute("data-parent-stack-id") ||
              "HWS-0001";
            let assetId = asset;

            // Populate the hidden fields in the add network interface modal
            document.getElementById(
              "addNetworkInterfaceMissionNetworkId"
            ).value = mnId;
            document.getElementById("addNetworkInterfaceSegmentId").value =
              segId;
            document.getElementById("addNetworkInterfaceDomainId").value =
              domId;
            document.getElementById("addNetworkInterfaceHwStackId").value =
              stackId;
            document.getElementById("addNetworkInterfaceAssetId").value =
              assetId;

            // Show the add network interface modal
            const addModal = new bootstrap.Modal(
              document.getElementById("addNetworkInterfaceModal")
            );
            addModal.show();
          });

        document
          .querySelector(".btn-add-gp-container")
          .addEventListener("click", function () {
            // Hide the options modal
            optionsModal.hide();

            // Get the parent information - ensure we're getting string values
            const mn = currentTreeNode.getAttribute(
              "data-parent-mission-network"
            );
            const seg = currentTreeNode.getAttribute("data-parent-segment");
            const dom = currentTreeNode.getAttribute("data-parent-domain");
            const stack = currentTreeNode.getAttribute("data-parent-stack");
            const asset = currentTreeNode.getAttribute("data-id");

            // Ensure we have string values, not objects
            const mnId = typeof mn === "object" ? mn.id || mn : mn;
            const segId = typeof seg === "object" ? seg.id || seg : seg;
            const domId = typeof dom === "object" ? dom.id || dom : dom;
            const stackId =
              typeof stack === "object" ? stack.id || stack : stack;
            const assetId =
              typeof asset === "object" ? asset.id || asset : asset;

            // Populate the hidden fields in the add GP container modal
            document.getElementById("addGPContainerMissionNetworkId").value =
              mnId;
            document.getElementById("addGPContainerSegmentId").value = segId;
            document.getElementById("addGPContainerDomainId").value = domId;
            document.getElementById("addGPContainerHwStackId").value = stackId;
            document.getElementById("addGPContainerAssetId").value = assetId;

            // Show the add GP container modal
            const addModal = new bootstrap.Modal(
              document.getElementById("addGPContainerModal")
            );
            addModal.show();
          });
      }
      // Other node types would be handled here as the feature expands
    });
  }

  // Edit button opens the appropriate modal based on what's selected
  if (editDetailButton) {
    editDetailButton.addEventListener("click", function () {
      if (currentElement) {
        const type =
          currentElement.type || currentTreeNode.getAttribute("data-type");

        if (type === "missionNetworks") {
          // Populate and show edit mission network modal
          document.getElementById("editMissionNetworkId").value =
            currentElement.id;
          document.getElementById("editMissionNetworkName").value =
            currentElement.name;

          const editModal = new bootstrap.Modal(
            document.getElementById("editMissionNetworkModal")
          );
          editModal.show();
        } else if (type === "networkSegments") {
          // Populate and show edit network segment modal
          document.getElementById("editNetworkSegmentId").value =
            currentElement.id;
          document.getElementById("editNetworkSegmentName").value =
            currentElement.name;

          // Store mission network ID for the API call
          const missionNetworkId =
            currentTreeNode.getAttribute("data-parent-mission-network") ||
            (currentElement.parentMissionNetwork
              ? currentElement.parentMissionNetwork.id
              : "");
          document.getElementById("editNetworkSegmentMissionNetworkId").value =
            missionNetworkId;

          const editModal = new bootstrap.Modal(
            document.getElementById("editNetworkSegmentModal")
          );
          editModal.show();
        } else if (type === "hwStacks") {
          // Populate and show edit HW Stack modal
          document.getElementById("editHwStackId").value = currentElement.id;
          document.getElementById("editHwStackName").value =
            currentElement.name;

          // Store parent IDs for the API call
          const domainId =
            currentTreeNode.getAttribute("data-parent-domain") ||
            (currentElement.parentDomain ? currentElement.parentDomain.id : "");
          const segmentId =
            currentTreeNode.getAttribute("data-parent-segment") ||
            (currentElement.parentSegment
              ? currentElement.parentSegment.id
              : "");
          const missionNetworkId =
            currentTreeNode.getAttribute("data-parent-mission-network") ||
            (currentElement.parentMissionNetwork
              ? currentElement.parentMissionNetwork.id
              : "");

          document.getElementById("editHwStackDomainId").value = domainId;
          document.getElementById("editHwStackSegmentId").value = segmentId;
          document.getElementById("editHwStackMissionNetworkId").value =
            missionNetworkId;

          // Populate participants dropdown
          const select = document.getElementById("editHwStackCisParticipant");
          select.innerHTML =
            '<option value="" disabled>Select a participant...</option>';

          // Set current participant ID
          fetchParticipants().then((participants) => {
            participants.forEach((p) => {
              const opt = document.createElement("option");
              opt.value = p.key;
              opt.textContent = p.name;
              if (p.key === currentElement.cisParticipantID) {
                opt.selected = true;
              }
              select.appendChild(opt);
            });

            const editModal = new bootstrap.Modal(
              document.getElementById("editHwStackModal")
            );
            editModal.show();
          });
        } else if (type === "assets") {
          // Populate and show edit Asset modal
          document.getElementById("editAssetId").value = currentElement.id;
          document.getElementById("editAssetName").value = currentElement.name;

          // Store parent IDs for the API call
          let hwStackId, domainId, segmentId, missionNetworkId;

          // First try to get the hwStackId directly if available (we added this as a redundant property)
          if (currentElement && currentElement.hwStackId) {
            // Check if hwStackId is an object and extract id if needed
            if (
              typeof currentElement.hwStackId === "object" &&
              currentElement.hwStackId !== null
            ) {
              hwStackId = currentElement.hwStackId.id || "";
            } else {
              hwStackId = currentElement.hwStackId;
            }
          }

          if (currentTreeNode) {
            // Get from tree node if available
            hwStackId =
              hwStackId || currentTreeNode.getAttribute("data-parent-stack");
            domainId = currentTreeNode.getAttribute("data-parent-domain");
            segmentId = currentTreeNode.getAttribute("data-parent-segment");
            missionNetworkId = currentTreeNode.getAttribute(
              "data-parent-mission-network"
            );
          }

          if (currentElement) {
            // Try to get from the current element if any values are still missing
            if (!hwStackId) {
              // Try parentStack
              if (
                typeof currentElement.parentStack === "object" &&
                currentElement.parentStack !== null
              ) {
                hwStackId = currentElement.parentStack.id || "";
              } else {
                hwStackId = currentElement.parentStack || "";
              }
            }

            if (!domainId) {
              domainId =
                typeof currentElement.parentDomain === "object"
                  ? currentElement.parentDomain
                    ? currentElement.parentDomain.id
                    : ""
                  : currentElement.parentDomain;
            }

            if (!segmentId) {
              segmentId =
                typeof currentElement.parentSegment === "object"
                  ? currentElement.parentSegment
                    ? currentElement.parentSegment.id
                    : ""
                  : currentElement.parentSegment;
            }

            if (!missionNetworkId) {
              missionNetworkId =
                typeof currentElement.parentMissionNetwork === "object"
                  ? currentElement.parentMissionNetwork
                    ? currentElement.parentMissionNetwork.id
                    : ""
                  : currentElement.parentMissionNetwork;
            }
          }

          // Parent IDs for asset editing

          document.getElementById("editAssetHwStackId").value = hwStackId;
          document.getElementById("editAssetDomainId").value = domainId;
          document.getElementById("editAssetSegmentId").value = segmentId;
          document.getElementById("editAssetMissionNetworkId").value =
            missionNetworkId;

          const editModal = new bootstrap.Modal(
            document.getElementById("editAssetModal")
          );
          editModal.show();
        } else if (type === "networkInterfaces") {
          // Populate and show edit Network Interface modal
          // Retrieve parent references from tree node
          const parentAsset = currentTreeNode.getAttribute("data-parent-asset");
          const parentStack = currentTreeNode.getAttribute("data-parent-stack");
          const parentDomain =
            currentTreeNode.getAttribute("data-parent-domain");
          const parentSegment = currentTreeNode.getAttribute(
            "data-parent-segment"
          );
          const parentMissionNetwork = currentTreeNode.getAttribute(
            "data-parent-mission-network"
          );

          document.getElementById("editNetworkInterfaceId").value =
            currentElement.id;
          document.getElementById("editNetworkInterfaceName").value =
            currentElement.name;

          // The configuration items are stored in an array of objects with Name and AnswerContent properties
          // Initialize default values
          let ipAddressValue = "";
          let subnetValue = "";
          let fqdnValue = "";

          // Extract values from configurationItems if they exist
          if (
            currentElement.configurationItems &&
            Array.isArray(currentElement.configurationItems)
          ) {
            // Look for each specific item by name
            currentElement.configurationItems.forEach((item) => {
              if (item.Name === "IP Address" && item.AnswerContent) {
                ipAddressValue = item.AnswerContent;
              } else if (item.Name === "Sub-Net" && item.AnswerContent) {
                subnetValue = item.AnswerContent;
              } else if (item.Name === "FQDN" && item.AnswerContent) {
                fqdnValue = item.AnswerContent;
              }
            });
          }

          // Set the form field values
          document.getElementById("editNetworkInterfaceIpAddress").value =
            ipAddressValue;
          document.getElementById("editNetworkInterfaceSubnet").value =
            subnetValue;
          document.getElementById("editNetworkInterfaceFqdn").value = fqdnValue;

          // Store parent IDs for the API call
          const assetId =
            currentTreeNode.getAttribute("data-parent-asset") ||
            currentElement.parentAsset;
          const hwStackId =
            currentTreeNode.getAttribute("data-parent-stack") ||
            currentElement.parentStack;
          const domainId =
            currentTreeNode.getAttribute("data-parent-domain") ||
            currentElement.parentDomain;
          const segmentId =
            currentTreeNode.getAttribute("data-parent-segment") ||
            currentElement.parentSegment;
          const missionNetworkId =
            currentTreeNode.getAttribute("data-parent-mission-network") ||
            currentElement.parentMissionNetwork;

          // TEMPORARY FIX: Use AS-0001 as the asset ID for network interfaces
          document.getElementById("editNetworkInterfaceAssetId").value =
            "AS-0001";
          document.getElementById("editNetworkInterfaceHwStackId").value =
            hwStackId;
          document.getElementById("editNetworkInterfaceDomainId").value =
            domainId;
          document.getElementById("editNetworkInterfaceSegmentId").value =
            segmentId;
          document.getElementById(
            "editNetworkInterfaceMissionNetworkId"
          ).value = missionNetworkId;

          const editModal = new bootstrap.Modal(
            document.getElementById("editNetworkInterfaceModal")
          );
          editModal.show();
        } else if (type === "gpInstances") {
          // Populate and show edit GP instance modal
          document.getElementById("editGPContainerId").value =
            currentElement.id;
          document.getElementById("editGPContainerInstanceLabel").value =
            currentElement.instanceLabel || "";
          document.getElementById("editGPContainerServiceId").value =
            currentElement.serviceId || "";

          // Store parent IDs for the API call
          const assetId =
            currentTreeNode.getAttribute("data-parent-asset") ||
            currentElement.parentAsset;
          const hwStackId =
            currentTreeNode.getAttribute("data-parent-stack") ||
            currentElement.parentStack;
          const domainId =
            currentTreeNode.getAttribute("data-parent-domain") ||
            currentElement.parentDomain;
          const segmentId =
            currentTreeNode.getAttribute("data-parent-segment") ||
            currentElement.parentSegment;
          const missionNetworkId =
            currentTreeNode.getAttribute("data-parent-mission-network") ||
            currentElement.parentMissionNetwork;

          document.getElementById("editGPContainerAssetId").value = assetId;
          document.getElementById("editGPContainerHwStackId").value = hwStackId;
          document.getElementById("editGPContainerDomainId").value = domainId;
          document.getElementById("editGPContainerSegmentId").value = segmentId;
          document.getElementById("editGPContainerMissionNetworkId").value =
            missionNetworkId;

          const editModal = new bootstrap.Modal(
            document.getElementById("editGPContainerModal")
          );
          editModal.show();
        }
        // Other node types would be handled here as the feature expands
      }
    });
  }

  // Delete button shows delete confirmation modal
  if (deleteDetailButton) {
    deleteDetailButton.addEventListener("click", function () {
      if (currentElement) {
        // The type is now stored directly in the currentElement object
        const elementType = currentElement.type;

        // Preparing to delete item

        document.getElementById("deleteItemName").textContent =
          currentElement.name;
        document.getElementById("deleteItemId").value = currentElement.id;
        document.getElementById("deleteItemType").value = elementType;

        // For hierarchical items that need parent ID for deletion
        if (elementType === "networkSegments") {
          // Get parent mission network ID - either from the tree node or element data
          const missionNetworkId =
            currentTreeNode.getAttribute("data-parent-mission-network") ||
            (currentElement.parentMissionNetwork
              ? currentElement.parentMissionNetwork.id
              : "");
          document.getElementById("deleteItemParentId").value =
            missionNetworkId;
        } else if (elementType === "securityDomains") {
          // For security domains, we need both the mission network ID and the segment ID
          // Get them from the tree node or the current element
          const segmentId = currentTreeNode.getAttribute("data-id");
          const missionNetworkId =
            currentTreeNode.getAttribute("data-parent-mission-network") || "";

          // Store both parent IDs as comma-separated values
          document.getElementById(
            "deleteItemParentId"
          ).value = `${missionNetworkId},${segmentId}`;
        } else if (elementType === "hwStacks") {
          // For HW stacks, we need mission network ID, segment ID, and domain ID
          const domainId =
            currentTreeNode.getAttribute("data-parent-domain") ||
            (currentElement.parentDomain ? currentElement.parentDomain.id : "");
          const segmentId =
            currentTreeNode.getAttribute("data-parent-segment") ||
            (currentElement.parentSegment
              ? currentElement.parentSegment.id
              : "");
          const missionNetworkId =
            currentTreeNode.getAttribute("data-parent-mission-network") ||
            (currentElement.parentMissionNetwork
              ? currentElement.parentMissionNetwork.id
              : "");

          // Store all three parent IDs as comma-separated values
          document.getElementById(
            "deleteItemParentId"
          ).value = `${missionNetworkId},${segmentId},${domainId}`;
        } else if (elementType === "assets") {
          // For assets, we need mission network ID, segment ID, domain ID, and HW stack ID
          // Extract hwStackId properly - first try direct property, then parentStack
          let hwStackId = "";
          if (currentElement) {
            // First try direct hwStackId property
            if (currentElement.hwStackId) {
              if (
                typeof currentElement.hwStackId === "object" &&
                currentElement.hwStackId !== null
              ) {
                hwStackId = currentElement.hwStackId.id || "";
              } else {
                hwStackId = currentElement.hwStackId;
              }
            }
            // Then try parentStack
            else if (currentElement.parentStack) {
              if (
                typeof currentElement.parentStack === "object" &&
                currentElement.parentStack !== null
              ) {
                hwStackId = currentElement.parentStack.id || "";
              } else {
                hwStackId = currentElement.parentStack;
              }
            }
          }

          // If we still don't have hwStackId, try from tree node
          if (!hwStackId && currentTreeNode) {
            hwStackId = currentTreeNode.getAttribute("data-parent-stack") || "";
          }

          // Extract other parent IDs
          const domainId =
            currentTreeNode.getAttribute("data-parent-domain") ||
            (currentElement.parentDomain
              ? typeof currentElement.parentDomain === "object"
                ? currentElement.parentDomain.id
                : currentElement.parentDomain
              : "");
          const segmentId =
            currentTreeNode.getAttribute("data-parent-segment") ||
            (currentElement.parentSegment
              ? typeof currentElement.parentSegment === "object"
                ? currentElement.parentSegment.id
                : currentElement.parentSegment
              : "");
          const missionNetworkId =
            currentTreeNode.getAttribute("data-parent-mission-network") ||
            (currentElement.parentMissionNetwork
              ? typeof currentElement.parentMissionNetwork === "object"
                ? currentElement.parentMissionNetwork.id
                : currentElement.parentMissionNetwork
              : "");

          // Store all four parent IDs as comma-separated values
          document.getElementById(
            "deleteItemParentId"
          ).value = `${missionNetworkId},${segmentId},${domainId},${hwStackId}`;
        } else if (elementType === "networkInterfaces") {
          // For network interfaces, we need mission network ID, segment ID, domain ID, HW stack ID, and asset ID
          // First try to get parent IDs from data-parent-*-id attributes which are most reliable
          let assetId = currentTreeNode.getAttribute("data-parent-asset-id");
          let hwStackId = currentTreeNode.getAttribute("data-parent-stack-id");
          let domainId = currentTreeNode.getAttribute("data-parent-domain-id");
          let segmentId = currentTreeNode.getAttribute(
            "data-parent-segment-id"
          );
          let missionNetworkId = currentTreeNode.getAttribute(
            "data-parent-mission-network-id"
          );

          // Extract parent IDs from data attributes

          // Fall back to regular data attributes if needed
          if (!assetId)
            assetId = currentTreeNode.getAttribute("data-parent-asset");
          if (!hwStackId)
            hwStackId = currentTreeNode.getAttribute("data-parent-stack");
          if (!domainId)
            domainId = currentTreeNode.getAttribute("data-parent-domain");
          if (!segmentId)
            segmentId = currentTreeNode.getAttribute("data-parent-segment");
          if (!missionNetworkId)
            missionNetworkId = currentTreeNode.getAttribute(
              "data-parent-mission-network"
            );

          // Fall back to object properties if needed
          if (!assetId && currentElement.parentAsset) {
            assetId =
              typeof currentElement.parentAsset === "object"
                ? currentElement.parentAsset.id
                : currentElement.parentAsset;
          }

          if (!hwStackId && currentElement.parentStack) {
            hwStackId =
              typeof currentElement.parentStack === "object"
                ? currentElement.parentStack.id
                : currentElement.parentStack;
          }

          if (!domainId && currentElement.parentDomain) {
            domainId =
              typeof currentElement.parentDomain === "object"
                ? currentElement.parentDomain.id
                : currentElement.parentDomain;
          }

          if (!segmentId && currentElement.parentSegment) {
            segmentId =
              typeof currentElement.parentSegment === "object"
                ? currentElement.parentSegment.id
                : currentElement.parentSegment;
          }

          if (!missionNetworkId && currentElement.parentMissionNetwork) {
            missionNetworkId =
              typeof currentElement.parentMissionNetwork === "object"
                ? currentElement.parentMissionNetwork.id
                : currentElement.parentMissionNetwork;
          }

          // All parent IDs retrieved and ready

          // Store all five parent IDs as comma-separated values
          document.getElementById(
            "deleteItemParentId"
          ).value = `${missionNetworkId},${segmentId},${domainId},${hwStackId},${assetId}`;

          // Store parent references for network interface deletion
        }

        const deleteModal = new bootstrap.Modal(
          document.getElementById("deleteConfirmModal")
        );
        deleteModal.show();
      }
    });
  }

  // Mission Network add/edit/delete event handlers
  const saveMissionNetworkBtn = document.getElementById(
    "saveMissionNetworkBtn"
  );
  if (saveMissionNetworkBtn) {
    saveMissionNetworkBtn.addEventListener("click", addMissionNetwork);
  }

  const updateMissionNetworkBtn = document.getElementById(
    "updateMissionNetworkBtn"
  );
  if (updateMissionNetworkBtn) {
    updateMissionNetworkBtn.addEventListener("click", updateMissionNetwork);
  }

  // Network Segment add/edit event handlers
  const saveNetworkSegmentBtn = document.getElementById(
    "saveNetworkSegmentBtn"
  );
  if (saveNetworkSegmentBtn) {
    saveNetworkSegmentBtn.addEventListener("click", addNetworkSegment);
  }

  const updateNetworkSegmentBtn = document.getElementById(
    "updateNetworkSegmentBtn"
  );
  if (updateNetworkSegmentBtn) {
    updateNetworkSegmentBtn.addEventListener("click", updateNetworkSegment);
  }

  // Security Domain add event handler
  const saveSecurityDomainBtn = document.getElementById(
    "saveSecurityDomainBtn"
  );
  if (saveSecurityDomainBtn) {
    saveSecurityDomainBtn.addEventListener("click", addSecurityDomain);
  }

  // HW Stack add/edit event handlers
  const saveHwStackBtn = document.getElementById("saveHwStackBtn");
  if (saveHwStackBtn) {
    saveHwStackBtn.addEventListener("click", addHwStack);
  }

  const updateHwStackBtn = document.getElementById("updateHwStackBtn");
  if (updateHwStackBtn) {
    updateHwStackBtn.addEventListener("click", updateHwStack);
  }

  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", deleteItem);
  }

  //-------------------------------------------------------------------------
  // Application Initialization
  //-------------------------------------------------------------------------

  // Initial data fetch
  async function initializeApp() {
    try {
      // Load security classifications first
      await fetchSecurityClassifications();
      // Security classifications loaded

      // Then load the CIS Plan data
      await fetchCISPlanData();
    } catch (error) {
      console.error("Error initializing CIS Plan app:", error);
      showToast("Error initializing application: " + error.message, "danger");
    }
  }

  // Fetch participants from API
  // Fetch participants - delegates to CISApi
  async function fetchParticipants() {
    try {
      const participants = await CISApi.fetchParticipants();
      // Participants loaded
      return participants;
    } catch (error) {
      console.error("Error in fetchParticipants:", error);
      return [];
    }
  }

  // Get participant name by key - delegates to CISUtils
  async function getParticipantNameByKey(key) {
    return CISUtils.getParticipantNameByKey(key);
  }

  // Add HW Stack
  // Add a hardware stack - delegates to CISApi
  async function addHwStack() {
    const name = document.getElementById("addHwStackName").value.trim();
    const cisParticipantID = document.getElementById(
      "addHwStackCisParticipant"
    ).value;
    const missionNetworkId = document.getElementById(
      "addHwStackMissionNetworkId"
    ).value;
    const segmentId = document.getElementById("addHwStackSegmentId").value;
    const domainId = document.getElementById("addHwStackDomainId").value;

    // Validation
    if (!name) {
      showToast("Please enter a HW Stack name", "warning");
      return;
    }

    if (!cisParticipantID) {
      showToast("Please select a participant", "warning");
      return;
    }

    if (!missionNetworkId || !segmentId || !domainId) {
      showToast("Missing parent information", "warning");
      return;
    }

    try {
      // Call the API to add the hardware stack
      // Adding HW Stack for security domain
      const apiResult = await CISApi.addHwStack(
        missionNetworkId,
        segmentId,
        domainId,
        name,
        cisParticipantID
      );

      if (apiResult.success) {
        // Use the utility function to handle modal, button, and toast in one call
        await CISUtils.handleModal(
          "addHwStackModal",
          "saveHwStackBtn",
          `HW Stack "${name}" created successfully!`
        );

        // Refresh the UI with the proper state
        await refreshPanelsWithState({
          nodeType: "securityDomains",
          nodeId: domainId,
          segmentId: segmentId,
          missionNetworkId: missionNetworkId,
        });
      } else {
        showToast(
          `${
            apiResult.message || apiResult.error || "Failed to create HW Stack"
          }`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error in addHwStack function:", error);
      showToast("An error occurred while creating the HW Stack", "danger");
    }
  }

  // Update HW Stack - delegates to CISApi
  async function updateHwStack() {
    const name = document.getElementById("editHwStackName").value.trim();
    const cisParticipantID = document.getElementById(
      "editHwStackCisParticipant"
    ).value;
    const missionNetworkId = document.getElementById(
      "editHwStackMissionNetworkId"
    ).value;
    const segmentId = document.getElementById("editHwStackSegmentId").value;
    const domainId = document.getElementById("editHwStackDomainId").value;
    const id = document.getElementById("editHwStackId").value;

    // Validation
    if (!name) {
      showToast("Please enter a HW Stack name", "warning");
      return;
    }

    if (!cisParticipantID) {
      showToast("Please select a participant", "warning");
      return;
    }

    if (!missionNetworkId || !segmentId || !domainId || !id) {
      showToast("Missing required information", "warning");
      return;
    }

    try {
      // Call the API to update the hardware stack
      // Updating HW Stack
      const apiResult = await CISApi.updateHwStack(
        missionNetworkId,
        segmentId,
        domainId,
        id,
        name,
        cisParticipantID
      );

      if (apiResult.success) {
        // Use the utility function to handle modal, button, and toast in one call
        await CISUtils.handleModal(
          "editHwStackModal",
          "updateHwStackBtn",
          `HW Stack updated successfully!`
        );

        // Refresh the UI with the proper state
        await refreshPanelsWithState({
          nodeType: "securityDomains",
          nodeId: domainId,
          segmentId: segmentId,
          missionNetworkId: missionNetworkId,
        });
      } else {
        showToast(
          `${
            apiResult.message || apiResult.error || "Failed to update HW Stack"
          }`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error in updateHwStack function:", error);
      showToast("An error occurred while updating the HW Stack", "danger");
    }
  }

  // Refresh panels while preserving tree state and selection
  async function refreshPanelsWithState(stateToRestore) {
    try {
      // Default state is empty if not provided
      stateToRestore = stateToRestore || {};

      // Store current state if not provided
      if (!stateToRestore.missionNetworkId && currentTreeNode) {
        stateToRestore = captureCurrentTreeState(currentTreeNode);
        // Saving state before refresh
      }

      // Fetch updated data
      await fetchCISPlanData();

      // Now restore the state after a slight delay to ensure DOM is updated
      setTimeout(() => restoreTreeState(stateToRestore), 300);
    } catch (error) {
      console.error("Error refreshing panels with state:", error);
    }
  }

  // Helper function to capture the current tree state
  function captureCurrentTreeState(treeNode) {
    const state = {
      nodeType: treeNode.getAttribute("data-type"),
      nodeId: treeNode.getAttribute("data-id"),
    };

    // Add parent references based on node type
    switch (state.nodeType) {
      case "assets":
        state.hwStackId = treeNode.getAttribute("data-parent-stack");
        state.domainId = treeNode.getAttribute("data-parent-domain");
        state.segmentId = treeNode.getAttribute("data-parent-segment");
        state.missionNetworkId = treeNode.getAttribute(
          "data-parent-mission-network"
        );
        break;
      case "hwStacks":
        state.domainId = treeNode.getAttribute("data-parent-domain");
        state.segmentId = treeNode.getAttribute("data-parent-segment");
        state.missionNetworkId = treeNode.getAttribute(
          "data-parent-mission-network"
        );
        break;
      case "securityDomains":
        state.segmentId = treeNode.getAttribute("data-parent-segment");
        state.missionNetworkId = treeNode.getAttribute(
          "data-parent-mission-network"
        );
        break;
      case "networkSegments":
        state.missionNetworkId = treeNode.getAttribute(
          "data-parent-mission-network"
        );
        break;
    }

    return state;
  }

  // Helper function to restore the tree state
  function restoreTreeState(state) {
    if (!state.missionNetworkId) return;
    // Restoring state after refresh

    // First find and restore the mission network
    const mnNode = findTreeNode("missionNetworks", state.missionNetworkId);
    if (!mnNode) return;

    // Found mission network to restore
    selectAndExpandNode(mnNode);

    // If we have a segment to restore, find and restore it
    if (!state.segmentId) return;
    const segNode = findTreeNodeInParent(
      mnNode,
      "networkSegments",
      state.segmentId
    );
    if (!segNode) return;

    // Found segment to restore
    selectAndExpandNode(segNode);

    // Determine which security domain ID to look for
    const domainId =
      state.domainId ||
      (state.nodeType === "securityDomains" ? state.nodeId : null);

    if (!domainId) return;

    // Debug: List all security domain nodes in this segment
    const segChildren = getChildrenContainer(segNode);
    const allSDNodes = segChildren.querySelectorAll(
      `.tree-node[data-type="securityDomains"]`
    );
    // Found security domain nodes in segment
    allSDNodes.forEach((node) => {
      // Security domain node IDs logged
    });

    // Try to find the security domain node
    let sdNode = findTreeNodeInParent(segNode, "securityDomains", domainId);

    // Fallback to name matching if needed
    if (!sdNode) {
      console.warn(`Could not find security domain node with ID ${domainId}`);
      sdNode = findNodeByTextContent(allSDNodes, domainId);
      if (sdNode) {
        // Found security domain by name match
      }
    } else {
      // Found security domain to restore
    }

    if (!sdNode) return;
    selectAndExpandNode(sdNode);

    // Determine which HW stack ID to look for
    const hwStackId =
      state.hwStackId || (state.nodeType === "hwStacks" ? state.nodeId : null);

    if (!hwStackId) return;

    // Debug: List all HW stack nodes in this domain
    const sdChildren = getChildrenContainer(sdNode);
    const allHWNodes = sdChildren.querySelectorAll(
      `.tree-node[data-type="hwStacks"]`
    );
    // Found HW stack nodes in domain
    allHWNodes.forEach((node) => {
      // HW stack node IDs logged
    });

    // Try to find the HW stack node
    const hwNode = findTreeNodeInParent(sdNode, "hwStacks", hwStackId);
    if (!hwNode) {
      console.warn(`Could not find HW stack node with ID ${hwStackId}`);
      return;
    }

    // Found HW stack to restore
    selectAndExpandNode(hwNode);

    // If we have an asset to restore, find and restore it
    if (state.nodeType !== "assets" || !state.nodeId) return;

    // Looking for asset
    const assetNode = findTreeNodeInParent(hwNode, "assets", state.nodeId);
    if (assetNode) {
      // Found asset to restore
      assetNode.click(); // Just select the asset, no need to expand
    }
  }

  // Helper function to find a tree node by type and ID
  function findTreeNode(type, id) {
    return document.querySelector(
      `.tree-node[data-type="${type}"][data-id="${id}"]`
    );
  }

  // Helper function to find a tree node within a parent's children
  function findTreeNodeInParent(parentNode, childType, childId) {
    const childrenContainer = getChildrenContainer(parentNode);
    if (!childrenContainer) return null;

    return childrenContainer.querySelector(
      `.tree-node[data-type="${childType}"][data-id="${childId}"]`
    );
  }

  // Helper function to get the children container of a node
  function getChildrenContainer(node) {
    const container = node.nextElementSibling;
    return container && container.classList.contains("tree-node-children")
      ? container
      : null;
  }

  // Helper function to find a node by text content
  function findNodeByTextContent(nodeList, textToMatch) {
    for (const node of nodeList) {
      if (node.textContent.includes(textToMatch)) {
        return node;
      }
    }
    return null;
  }

  // Helper function to select and expand a tree node
  function selectAndExpandNode(node) {
    node.click(); // Select the node

    const childrenContainer = getChildrenContainer(node);
    if (!childrenContainer) return;

    childrenContainer.style.display = "block"; // Show children

    // Update toggle icon
    const toggleIcon = node.querySelector(".tree-toggle i");
    if (toggleIcon) toggleIcon.className = "fas fa-chevron-down";
  }

  // Start app initialization
  initializeApp();

  //=========================================================================
  // 3. API INTEGRATION FUNCTIONS
  //=========================================================================

  // Show a toast notification - delegates to CISUtils
  function showToast(message, type = "success") {
    return CISUtils.showToast(message, type);
  }

  // Add a new mission network
  // Add a mission network - delegates to CISApi
  async function addMissionNetwork() {
    const nameInput = document.getElementById("addMissionNetworkName");
    const name = nameInput.value.trim();

    if (!name) {
      showToast("Please enter a mission network name", "warning");
      return;
    }

    try {
      // Call the API to add the mission network
      const apiResult = await CISApi.addMissionNetwork(name);

      if (apiResult.success) {
        // Clear the form
        nameInput.value = "";

        // Use the utility function to handle modal, button, and toast in one call
        await CISUtils.handleModal(
          "addMissionNetworkModal",
          "saveMissionNetworkBtn",
          `Mission Network "${name}" created successfully!`
        );

        // Refresh the data
        fetchCISPlanData();
      } else {
        showToast(
          `${
            apiResult.message ||
            apiResult.error ||
            "Failed to create mission network"
          }`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error in addMissionNetwork function:", error);
      showToast(
        "An error occurred while creating the mission network",
        "danger"
      );
    }
  }

  // Update an existing mission network
  // Update a mission network - delegates to CISApi
  async function updateMissionNetwork() {
    const idInput = document.getElementById("editMissionNetworkId");
    const nameInput = document.getElementById("editMissionNetworkName");
    const id = idInput.value;
    const name = nameInput.value.trim();

    if (!name) {
      showToast("Please enter a mission network name", "warning");
      return;
    }

    try {
      // Call the API to update the mission network
      const apiResult = await CISApi.updateMissionNetwork(id, name);

      if (apiResult.success) {
        // Properly close the modal and clear focus
        const modalElement = document.getElementById("editMissionNetworkModal");
        const modal = bootstrap.Modal.getInstance(modalElement);

        // Blur (unfocus) the update button before hiding the modal
        document.getElementById("updateMissionNetworkBtn").blur();

        // Small delay to ensure blur takes effect before closing the modal
        setTimeout(() => {
          modal.hide();
        }, 10);

        // Show success message
        showToast(`Mission Network updated successfully!`);

        // Update the current element with the new name
        if (currentElement && currentElement.id === id) {
          currentElement.name = name;

          // Update the details panel with the new name
          updateDetailPanel(currentElement, currentElement.type);
        }

        // Refresh the data
        fetchCISPlanData();
      } else {
        showToast(
          `${
            apiResult.message ||
            apiResult.error ||
            "Failed to update mission network"
          }`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error in updateMissionNetwork function:", error);
      showToast(
        "An error occurred while updating the mission network",
        "danger"
      );
    }
  }

  // Add a new network segment
  // Add a network segment - delegates to CISApi
  async function addNetworkSegment() {
    const nameInput = document.getElementById("addNetworkSegmentName");
    const missionNetworkIdInput = document.getElementById(
      "addNetworkSegmentMissionNetworkId"
    );
    const name = nameInput.value.trim();
    const missionNetworkId = missionNetworkIdInput.value;

    if (!name) {
      showToast("Please enter a network segment name", "warning");
      return;
    }

    if (!missionNetworkId) {
      showToast("Missing mission network ID", "warning");
      return;
    }

    try {
      // Call the API to add the network segment
      const apiResult = await CISApi.addNetworkSegment(missionNetworkId, name);

      if (apiResult.success) {
        // Properly close the modal and clear focus
        const modalElement = document.getElementById("addNetworkSegmentModal");
        const modal = bootstrap.Modal.getInstance(modalElement);

        // Blur (unfocus) the save button before hiding the modal
        document.getElementById("saveNetworkSegmentBtn").blur();

        // Small delay to ensure blur takes effect before closing the modal
        setTimeout(() => {
          modal.hide();
        }, 10);

        // Clear the form
        nameInput.value = "";

        // Show success message
        showToast(`Network Segment "${name}" created successfully!`);

        // Refresh the data
        fetchCISPlanData();
      } else {
        showToast(
          `${
            apiResult.message ||
            apiResult.error ||
            "Failed to create network segment"
          }`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error in addNetworkSegment function:", error);
      showToast(
        "An error occurred while creating the network segment",
        "danger"
      );
    }
  }

  // Update an existing network segment - delegates to CISApi
  async function updateNetworkSegment() {
    const idInput = document.getElementById("editNetworkSegmentId");
    const nameInput = document.getElementById("editNetworkSegmentName");
    const missionNetworkIdInput = document.getElementById(
      "editNetworkSegmentMissionNetworkId"
    );
    const id = idInput.value;
    const name = nameInput.value.trim();
    const missionNetworkId = missionNetworkIdInput.value;

    if (!name) {
      showToast("Please enter a network segment name", "warning");
      return;
    }

    if (!missionNetworkId) {
      showToast("Missing mission network ID", "warning");
      return;
    }

    try {
      // Call the API to update the network segment
      const apiResult = await CISApi.updateNetworkSegment(
        missionNetworkId,
        id,
        name
      );

      if (apiResult.success) {
        // Properly close the modal and clear focus
        const modalElement = document.getElementById("editNetworkSegmentModal");
        const modal = bootstrap.Modal.getInstance(modalElement);

        // Blur (unfocus) the update button before hiding the modal
        document.getElementById("updateNetworkSegmentBtn").blur();

        // Small delay to ensure blur takes effect before closing the modal
        setTimeout(() => {
          modal.hide();
        }, 10);

        // Show success message
        showToast(`Network Segment updated successfully!`);

        // Update the current element with the new name
        if (currentElement && currentElement.id === id) {
          currentElement.name = name;

          // Update the details panel with the new name
          updateDetailPanel(currentElement, currentElement.type);
        }

        // Refresh the data
        fetchCISPlanData();
      } else {
        showToast(
          `${
            apiResult.message ||
            apiResult.error ||
            "Failed to update network segment"
          }`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error in updateNetworkSegment function:", error);
      showToast(
        "An error occurred while updating the network segment",
        "danger"
      );
    }
  }

  // Add a new asset - delegates to CISApi
  async function addAsset() {
    const nameInput = document.getElementById("addAssetName");
    const missionNetworkIdInput = document.getElementById(
      "addAssetMissionNetworkId"
    );
    const segmentIdInput = document.getElementById("addAssetSegmentId");
    const domainIdInput = document.getElementById("addAssetDomainId");
    const hwStackIdInput = document.getElementById("addAssetHwStackId");

    const name = nameInput.value.trim();
    const missionNetworkId = missionNetworkIdInput.value;
    const segmentId = segmentIdInput.value;
    const domainId = domainIdInput.value;
    const hwStackId = hwStackIdInput.value;

    if (!name) {
      showToast("Please enter an asset name", "warning");
      return;
    }

    if (!missionNetworkId || !segmentId || !domainId || !hwStackId) {
      showToast("Missing parent ID information", "warning");
      return;
    }

    try {
      // Call the API to add the asset
      const apiResult = await CISApi.addAsset(
        missionNetworkId,
        segmentId,
        domainId,
        hwStackId,
        name
      );

      if (apiResult.success) {
        // Clear the form
        nameInput.value = "";

        // Use the utility function to handle modal, button, and toast in one call
        await CISUtils.handleModal(
          "addAssetModal",
          "saveAssetBtn",
          `Asset "${name}" created successfully!`
        );

        // Get the ID of the new asset from the response if available
        let newAssetId = null;
        if (apiResult.data && apiResult.data.id) {
          newAssetId = apiResult.data.id;
          // New asset created
        }

        // Create a state object that contains the full parent hierarchy
        const stateToRestore = {
          nodeType: "hwStacks",
          nodeId: hwStackId,
          domainId: domainId,
          segmentId: segmentId,
          missionNetworkId: missionNetworkId,
          highlightNewAsset: newAssetId,
        };

        // Refreshing with state
        await refreshPanelsWithState(stateToRestore);

        // If the new asset ID is available, try to highlight it after refresh
        if (newAssetId) {
          // Let the DOM update first
          setTimeout(() => {
            const assetNode = document.querySelector(
              `.tree-node[data-id="${newAssetId}"]`
            );
            if (assetNode) {
              assetNode.click(); // Programmatically click the node to select it
            }
          }, 100);
        }
      } else {
        const errorMessage =
          apiResult.message || apiResult.error || "Failed to create asset";
        console.error("Error creating asset:", errorMessage);
        showToast(errorMessage, "danger");
      }
    } catch (error) {
      console.error("Error in addAsset function:", error);
      showToast("An error occurred while creating the asset", "danger");
    }
  }

  // Update an existing asset - delegates to CISApi
  async function updateAsset() {
    // Updating asset with current element
    const idInput = document.getElementById("editAssetId");
    const nameInput = document.getElementById("editAssetName");
    const missionNetworkIdInput = document.getElementById(
      "editAssetMissionNetworkId"
    );
    const segmentIdInput = document.getElementById("editAssetSegmentId");
    const domainIdInput = document.getElementById("editAssetDomainId");
    const hwStackIdInput = document.getElementById("editAssetHwStackId");

    const id = idInput.value;
    const name = nameInput.value.trim();
    const missionNetworkId = missionNetworkIdInput.value;
    const segmentId = segmentIdInput.value;
    const domainId = domainIdInput.value;
    let hwStackId = hwStackIdInput.value;

    // Make sure hwStackId is a string, not an object
    if (typeof hwStackId === "object" && hwStackId !== null) {
      hwStackId = hwStackId.id || "";
    }

    // Asset update values

    if (!name) {
      showToast("Please enter an asset name", "warning");
      return;
    }

    if (!missionNetworkId || !segmentId || !domainId || !hwStackId) {
      showToast("Missing parent ID information", "warning");
      return;
    }

    try {
      // Call the API to update the asset
      const apiResult = await CISApi.updateAsset(
        missionNetworkId,
        segmentId,
        domainId,
        hwStackId,
        id,
        name
      );

      if (apiResult.success) {
        // Use the utility function to handle modal, button, and toast in one call
        await CISUtils.handleModal(
          "editAssetModal",
          "updateAssetBtn",
          `Asset updated successfully!`
        );

        // Update the current element with the new name
        if (currentElement && currentElement.id === id) {
          currentElement.name = name;

          // Update the details panel with the new name
          updateDetailPanel(currentElement, currentElement.type);
        }

        // Refresh the data with state preservation
        // Create a state object to restore UI to the HW Stack
        await refreshPanelsWithState({
          nodeType: "hwStacks",
          nodeId: hwStackId,
          domainId: domainId,
          segmentId: segmentId,
          missionNetworkId: missionNetworkId,
        });
      } else {
        showToast(
          `${apiResult.message || apiResult.error || "Failed to update asset"}`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error in updateAsset function:", error);
      showToast("An error occurred while updating the asset", "danger");
    }
  }

  // Add a new network interface to an asset
  async function addNetworkInterface() {
    const nameInput = document.getElementById("addNetworkInterfaceName");
    const ipAddressInput = document.getElementById(
      "addNetworkInterfaceIpAddress"
    );
    const subnetInput = document.getElementById("addNetworkInterfaceSubnet");
    const fqdnInput = document.getElementById("addNetworkInterfaceFqdn");
    const missionNetworkIdInput = document.getElementById(
      "addNetworkInterfaceMissionNetworkId"
    );
    const segmentIdInput = document.getElementById(
      "addNetworkInterfaceSegmentId"
    );
    const domainIdInput = document.getElementById(
      "addNetworkInterfaceDomainId"
    );
    const hwStackIdInput = document.getElementById(
      "addNetworkInterfaceHwStackId"
    );
    const assetIdInput = document.getElementById("addNetworkInterfaceAssetId");

    const name = nameInput.value.trim();
    const ipAddress = ipAddressInput.value.trim();
    const subnet = subnetInput.value.trim();
    const fqdn = fqdnInput.value.trim();
    const missionNetworkId = missionNetworkIdInput.value;
    const segmentId = segmentIdInput.value;
    const domainId = domainIdInput.value;
    const hwStackId = hwStackIdInput.value;
    const assetId = assetIdInput.value;

    // Validate required fields - only name is mandatory
    if (!name) {
      showToast("Please enter a network interface name", "warning");
      return;
    }

    // IP Address, Subnet, and FQDN are optional

    if (
      !missionNetworkId ||
      !segmentId ||
      !domainId ||
      !hwStackId ||
      !assetId
    ) {
      showToast("Missing parent ID information", "warning");
      return;
    }

    try {
      // Create the configuration items array with the proper structure
      const configItems = [
        {
          Name: "IP Address",
          AnswerContent: ipAddress,
        },
        {
          Name: "Sub-Net",
          AnswerContent: subnet,
        },
      ];

      // Only add FQDN if it's not empty
      if (fqdn) {
        configItems.push({
          Name: "FQDN",
          AnswerContent: fqdn,
        });
      }

      // Prepare to add network interface

      // Call the API to add the network interface
      const apiResult = await CISApi.addNetworkInterface(
        missionNetworkId,
        segmentId,
        domainId,
        hwStackId,
        assetId,
        name,
        configItems
      );

      if (apiResult.success) {
        // Clear the form
        nameInput.value = "";

        // Use the utility function to handle modal, button, and toast in one call
        await CISUtils.handleModal(
          "addNetworkInterfaceModal",
          "saveNetworkInterfaceBtn",
          `Network Interface "${name}" created successfully!`
        );

        // Refresh the data with state preservation
        // Create a state object to restore UI to the Asset
        await refreshPanelsWithState({
          nodeType: "assets",
          nodeId: assetId,
          hwStackId: hwStackId,
          domainId: domainId,
          segmentId: segmentId,
          missionNetworkId: missionNetworkId,
        });
      } else {
        showToast(
          `${
            apiResult.message ||
            apiResult.error ||
            "Failed to create network interface"
          }`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error in addNetworkInterface function:", error);
      showToast(
        "An error occurred while creating the network interface",
        "danger"
      );
    }
  }

  // Update an existing network interface
  async function updateNetworkInterface() {
    const idInput = document.getElementById("editNetworkInterfaceId");
    const nameInput = document.getElementById("editNetworkInterfaceName");
    const ipAddressInput = document.getElementById(
      "editNetworkInterfaceIpAddress"
    );
    const subnetInput = document.getElementById("editNetworkInterfaceSubnet");
    const fqdnInput = document.getElementById("editNetworkInterfaceFqdn");
    const missionNetworkIdInput = document.getElementById(
      "editNetworkInterfaceMissionNetworkId"
    );
    const segmentIdInput = document.getElementById(
      "editNetworkInterfaceSegmentId"
    );
    const domainIdInput = document.getElementById(
      "editNetworkInterfaceDomainId"
    );
    const hwStackIdInput = document.getElementById(
      "editNetworkInterfaceHwStackId"
    );
    const assetIdInput = document.getElementById("editNetworkInterfaceAssetId");

    const id = idInput.value;
    const name = nameInput.value.trim();
    const ipAddress = ipAddressInput.value.trim();
    const subnet = subnetInput.value.trim();
    const fqdn = fqdnInput.value.trim();
    const missionNetworkId = missionNetworkIdInput.value;
    const segmentId = segmentIdInput.value;
    const domainId = domainIdInput.value;
    const hwStackId = hwStackIdInput.value;

    // Get the asset ID from the form input
    const assetId = assetIdInput.value;

    // Validate required fields - only name is mandatory
    if (!name) {
      showToast("Please enter a network interface name", "warning");
      return;
    }

    if (
      !id ||
      !missionNetworkId ||
      !segmentId ||
      !domainId ||
      !hwStackId ||
      !assetId
    ) {
      showToast("Missing ID information", "warning");
      return;
    }

    try {
      // Create the configuration items array with the proper structure
      const configItems = [
        {
          Name: "IP Address",
          AnswerContent: ipAddress,
        },
        {
          Name: "Sub-Net",
          AnswerContent: subnet,
        },
      ];

      // Only add FQDN if it's not empty
      if (fqdn) {
        configItems.push({
          Name: "FQDN",
          AnswerContent: fqdn,
        });
      }

      // First update the network interface name
      const nameUpdateResult = await CISApi.updateNetworkInterface(
        missionNetworkId,
        segmentId,
        domainId,
        hwStackId,
        assetId,
        id,
        name
      );

      // Process name update result

      if (!nameUpdateResult.success) {
        return nameUpdateResult; // Return early if name update fails
      }

      // Now update each configuration item with a separate API call
      const configItemResults = [];

      // Update IP Address if provided
      if (ipAddress) {
        const ipAddressResult = await CISApi.updateNetworkInterfaceConfigItem(
          missionNetworkId,
          segmentId,
          domainId,
          hwStackId,
          assetId,
          id,
          "IP Address",
          ipAddress
        );
        configItemResults.push({ item: "IP Address", result: ipAddressResult });
      }

      // Update Sub-Net if provided
      if (subnet) {
        const subnetResult = await CISApi.updateNetworkInterfaceConfigItem(
          missionNetworkId,
          segmentId,
          domainId,
          hwStackId,
          assetId,
          id,
          "Sub-Net",
          subnet
        );
        configItemResults.push({ item: "Sub-Net", result: subnetResult });
      }

      // Update FQDN if provided
      if (fqdn) {
        const fqdnResult = await CISApi.updateNetworkInterfaceConfigItem(
          missionNetworkId,
          segmentId,
          domainId,
          hwStackId,
          assetId,
          id,
          "FQDN",
          fqdn
        );
        configItemResults.push({ item: "FQDN", result: fqdnResult });
      }

      // Check if all updates were successful
      const allSuccess =
        nameUpdateResult.success &&
        (!configItemResults.length ||
          configItemResults.every((item) => item.result.success));

      // Create a combined result
      const apiResult = {
        success: allSuccess,
        status: allSuccess ? 200 : 400,
        data: { nameUpdate: nameUpdateResult, configItemResults },
        message: allSuccess
          ? "All updates successful"
          : "One or more updates failed",
      };

      // Process the final combined result

      if (apiResult.success) {
        // Use the utility function to handle modal, button, and toast in one call
        await CISUtils.handleModal(
          "editNetworkInterfaceModal",
          "updateNetworkInterfaceBtn",
          `Network Interface updated successfully!`
        );

        // Update the current element with the new values
        if (currentElement && currentElement.id === id) {
          // Update the name
          currentElement.name = name;

          // Update the configuration items
          if (!currentElement.configurationItems) {
            currentElement.configurationItems = [];
          }

          // Map our config items to the expected format
          configItems.forEach((item) => {
            // Find existing item or create new one
            const existingItemIndex =
              currentElement.configurationItems.findIndex(
                (ci) => ci.Name === item.Name
              );
            if (existingItemIndex >= 0) {
              // Update existing
              currentElement.configurationItems[
                existingItemIndex
              ].AnswerContent = item.AnswerContent;
            } else {
              // Add new
              currentElement.configurationItems.push(item);
            }
          });

          // Update the details panel with the new values
          updateDetailPanel(currentElement, currentElement.type);
        }

        // IMPORTANT: Force a full refresh of the tree to ensure changes are reflected
        // Refresh UI to show updated network interface
        await refreshPanelsWithState({
          nodeType: "assets",
          nodeId: assetId,
          hwStackId: hwStackId,
          domainId: domainId,
          segmentId: segmentId,
          missionNetworkId: missionNetworkId,
        });

        // After refresh, select the parent asset again to show the network interfaces
        setTimeout(() => {
          // Find and select the asset node
          const assetNode = document.querySelector(
            `[data-type="assets"][data-id="${assetId}"]`
          );
          if (assetNode) {
            // Simulate a click to expand and show children
            assetNode.click();
          }
        }, 500);
      } else {
        showToast(
          `${
            apiResult.message ||
            apiResult.error ||
            "Failed to update network interface"
          }`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error in updateNetworkInterface function:", error);
      showToast(
        "An error occurred while updating the network interface",
        "danger"
      );
    }
  }

  // Add a new GP container (GP instance) to an asset
  async function addGPContainer() {
    const instanceLabelInput = document.getElementById(
      "addGPContainerInstanceLabel"
    );
    const serviceIdInput = document.getElementById("addGPContainerServiceId");
    const gpIdInput = document.getElementById("addGPContainerGpId");
    const missionNetworkIdInput = document.getElementById(
      "addGPContainerMissionNetworkId"
    );
    const segmentIdInput = document.getElementById("addGPContainerSegmentId");
    const domainIdInput = document.getElementById("addGPContainerDomainId");
    const hwStackIdInput = document.getElementById("addGPContainerHwStackId");
    const assetIdInput = document.getElementById("addGPContainerAssetId");

    const instanceLabel = instanceLabelInput.value.trim();
    const serviceId = serviceIdInput.value.trim();
    const gpId = gpIdInput.value.trim();
    const missionNetworkId = missionNetworkIdInput.value;
    const segmentId = segmentIdInput.value;
    const domainId = domainIdInput.value;
    const hwStackId = hwStackIdInput.value;
    const assetId = assetIdInput.value;

    if (!serviceId || !gpId) {
      showToast("Please fill in all required fields", "warning");
      return;
    }

    if (
      !missionNetworkId ||
      !segmentId ||
      !domainId ||
      !hwStackId ||
      !assetId
    ) {
      showToast("Missing parent ID information", "warning");
      return;
    }

    try {
      // Call the API to add the GP container
      const apiResult = await CISApi.addGPInstance(
        missionNetworkId,
        segmentId,
        domainId,
        hwStackId,
        assetId,
        instanceLabel,
        serviceId,
        gpId
      );

      if (apiResult.success) {
        // Clear the form
        instanceLabelInput.value = "";
        serviceIdInput.value = "";

        // Use the utility function to handle modal, button, and toast in one call
        await CISUtils.handleModal(
          "addGPContainerModal",
          "saveGPContainerBtn",
          `Generic Product "${instanceLabel}" created successfully!`
        );

        // Refresh the data with state preservation
        await refreshPanelsWithState({
          nodeType: "assets",
          nodeId: assetId,
          hwStackId: hwStackId,
          domainId: domainId,
          segmentId: segmentId,
          missionNetworkId: missionNetworkId,
        });
      } else {
        showToast(
          `${
            apiResult.message ||
            apiResult.error ||
            "Failed to create generic product"
          }`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error in addGPContainer function:", error);
      showToast(
        "An error occurred while creating the generic product",
        "danger"
      );
    }
  }

  // Update an existing GP container (GP instance)
  async function updateGPContainer() {
    const idInput = document.getElementById("editGPContainerId");
    const instanceLabelInput = document.getElementById(
      "editGPContainerInstanceLabel"
    );
    const serviceIdInput = document.getElementById("editGPContainerServiceId");
    const missionNetworkIdInput = document.getElementById(
      "editGPContainerMissionNetworkId"
    );
    const segmentIdInput = document.getElementById("editGPContainerSegmentId");
    const domainIdInput = document.getElementById("editGPContainerDomainId");
    const hwStackIdInput = document.getElementById("editGPContainerHwStackId");
    const assetIdInput = document.getElementById("editGPContainerAssetId");

    const id = idInput.value;
    const instanceLabel = instanceLabelInput.value.trim();
    const serviceId = serviceIdInput.value.trim();
    const missionNetworkId = missionNetworkIdInput.value;
    const segmentId = segmentIdInput.value;
    const domainId = domainIdInput.value;
    const hwStackId = hwStackIdInput.value;
    const assetId = assetIdInput.value;

    if (!instanceLabel || !serviceId) {
      showToast("Please fill in all required fields", "warning");
      return;
    }

    if (
      !id ||
      !missionNetworkId ||
      !segmentId ||
      !domainId ||
      !hwStackId ||
      !assetId
    ) {
      showToast("Missing ID information", "warning");
      return;
    }

    try {
      // Call the API to update the GP container
      const apiResult = await CISApi.updateGPInstance(
        missionNetworkId,
        segmentId,
        domainId,
        hwStackId,
        assetId,
        id,
        instanceLabel,
        serviceId
      );

      if (apiResult.success) {
        // Use the utility function to handle modal, button, and toast in one call
        await CISUtils.handleModal(
          "editGPContainerModal",
          "updateGPContainerBtn",
          `Generic Product updated successfully!`
        );

        // Update the current element if it's the one being edited
        if (currentElement && currentElement.id === id) {
          currentElement.instanceLabel = instanceLabel;
          currentElement.serviceId = serviceId;

          // Update the details panel with the new data
          updateDetailPanel(currentElement, currentElement.type);
        }

        // Refresh the data with state preservation
        await refreshPanelsWithState({
          nodeType: "assets",
          nodeId: assetId,
          hwStackId: hwStackId,
          domainId: domainId,
          segmentId: segmentId,
          missionNetworkId: missionNetworkId,
        });
      } else {
        showToast(
          `${
            apiResult.message ||
            apiResult.error ||
            "Failed to update generic product"
          }`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error in updateGPContainer function:", error);
      showToast(
        "An error occurred while updating the generic product",
        "danger"
      );
    }
  }

  // Store security classifications data globally
  // This is initialized in the fetchSecurityClassifications function

  // Helper function to get security classification details by ID
  function getSecurityClassificationById(id) {
    if (!id) {
      // No ID provided for classification lookup
      return {
        id: "Unknown",
        name: "Unknown Classification",
        guid: "N/A",
        releasabilityString: "N/A",
        order: 0,
        colour: "#808080",
      };
    }

    // Log state for debugging
    // Classification lookup

    // Find the classification with the matching ID
    const classification = securityClassifications.find((c) => c.id === id);

    if (classification) {
      // Classification found
      return classification;
    } else {
      // Classification not found
      // Return a default object with the ID
      return {
        id: id,
        name: id, // Fallback to showing the ID as name if not found
        guid: "N/A",
        releasabilityString: "N/A",
        order: 0,
        colour: "#808080", // Default gray color
      };
    }
  }

  // Fetch security classifications for dropdown
  // Fetch security classifications - delegates to CISApi
  async function fetchSecurityClassifications() {
    try {
      // Use the API namespace to fetch the data
      const classifications = await CISApi.fetchSecurityClassifications();

      // Store the data globally
      securityClassifications = classifications;

      // Populate the dropdown
      const dropdown = document.getElementById(
        "addSecurityDomainClassification"
      );
      if (dropdown) {
        // Clear existing options except the first one
        while (dropdown.options.length > 1) {
          dropdown.remove(1);
        }

        // Add options from the security classifications
        securityClassifications.forEach((classification) => {
          const option = document.createElement("option");
          option.value = classification.id; // Use classification.id for the option value
          option.textContent = classification.name;
          option.setAttribute("data-guid", classification.guid);
          dropdown.appendChild(option);
        });
      }

      return securityClassifications;
    } catch (error) {
      console.error("Error in fetchSecurityClassifications:", error);
      showToast("Error loading security classifications", "danger");
      return [];
    }
  }

  // Add a new security domain
  async function addSecurityDomain() {
    const segmentIdInput = document.getElementById(
      "addSecurityDomainSegmentId"
    );
    const missionNetworkIdInput = document.getElementById(
      "addSecurityDomainMissionNetworkId"
    );
    const classificationSelect = document.getElementById(
      "addSecurityDomainClassification"
    );

    const segmentId = segmentIdInput.value;
    const missionNetworkId = missionNetworkIdInput.value;
    const classificationId = classificationSelect.value;

    if (!classificationId) {
      showToast("Please select a security classification", "warning");
      return;
    }

    if (!segmentId || !missionNetworkId) {
      showToast("Missing parent information", "warning");
      return;
    }

    // Check if this security domain classification already exists in this segment
    // Need to check if cisPlanData is properly initialized first
    if (
      cisPlanData &&
      cisPlanData.missionNetworks &&
      Array.isArray(cisPlanData.missionNetworks)
    ) {
      // First find the segment in our data
      const missionNetwork = cisPlanData.missionNetworks.find(
        (mn) => mn.id === missionNetworkId
      );
      if (
        missionNetwork &&
        missionNetwork.networkSegments &&
        Array.isArray(missionNetwork.networkSegments)
      ) {
        const segment = missionNetwork.networkSegments.find(
          (seg) => seg.id === segmentId
        );
        if (
          segment &&
          segment.securityDomains &&
          Array.isArray(segment.securityDomains)
        ) {
          // Check if any existing security domain has the same classification ID
          const existingDomain = segment.securityDomains.find(
            (sd) => sd.id === classificationId
          );
          if (existingDomain) {
            const classification =
              getSecurityClassificationById(classificationId);
            if (classification) {
              showToast(
                `Security Domain "${classification.name}" already exists in this segment`,
                "warning"
              );
            } else {
              showToast(
                `Security Domain with ID ${classificationId} already exists in this segment`,
                "warning"
              );
            }
            return;
          }
        }
      }
    }

    // Get the selected classification object
    const selectedOption =
      classificationSelect.options[classificationSelect.selectedIndex];
    const name = selectedOption.textContent;
    const guid = selectedOption.getAttribute("data-guid");

    try {
      // Adding security domain - using CISApi
      const apiResult = await CISApi.addSecurityDomain(
        missionNetworkId,
        segmentId,
        classificationId
      );

      if (apiResult.success) {
        // Properly close the modal
        const modalElement = document.getElementById("addSecurityDomainModal");
        const modal = bootstrap.Modal.getInstance(modalElement);

        // Blur (unfocus) the save button before hiding the modal
        document.getElementById("saveSecurityDomainBtn").blur();

        // Small delay to ensure blur takes effect before closing
        setTimeout(() => {
          modal.hide();
        }, 10);

        // Reset the form
        classificationSelect.selectedIndex = 0;

        // Store info about the new security domain for restoration after refresh
        const securityDomainName = name;

        // Show success message
        showToast(`Security Domain "${name}" created successfully!`);

        // We need to store just enough information to expand the right segment after refresh
        // This is much simpler than our previous complex approach
        sessionStorage.setItem(
          "lastAddedSecurityDomain",
          JSON.stringify({
            missionNetworkId: missionNetworkId,
            segmentId: segmentId,
          })
        );

        // Then refresh - the fetch function will handle expansion
        fetchCISPlanData();
      } else {
        // Log the error response for debugging
        // Error response received from backend

        // Handle specific errors from backend
        if (
          apiResult.error &&
          typeof apiResult.error === "string" &&
          apiResult.error.includes("already exists")
        ) {
          // This is a duplicate security domain error
          const classification =
            getSecurityClassificationById(classificationId);
          const name = classification ? classification.name : classificationId;
          showToast(
            `Security domain "${name}" already exists in this segment`,
            "warning"
          );
        } else if (apiResult.status === 400) {
          // Specific handling for 400 Bad Request which is likely a duplicate
          const classification =
            getSecurityClassificationById(classificationId);
          const name = classification ? classification.name : classificationId;
          showToast(
            `Cannot add duplicate security domain "${name}" to this segment`,
            "warning"
          );
        } else {
          // Other errors
          showToast(
            `Failed to add security domain: ${
              apiResult.error || "Unknown error"
            }`,
            "danger"
          );
        }
      }
    } catch (error) {
      console.error("Error adding security domain:", error);
      showToast("An error occurred while adding the security domain", "danger");
    }
  }

  // Delete an item (mission network, segment, etc.)
  // Delete an item from the CIS Plan - delegates to CISApi
  async function deleteItem() {
    const type = document.getElementById("deleteItemType").value;
    const id = document.getElementById("deleteItemId").value;
    const name = document.getElementById("deleteItemName").textContent;
    const parentId = document.getElementById("deleteItemParentId").value;

    // Deleting item

    try {
      // Call the API to delete the item
      const apiResult = await CISApi.deleteItem(type, id, parentId);

      if (apiResult.success) {
        // Close the modal using CISUtils helper for consistent modal handling
        closeDeleteModal();

        // Show success message
        showToast(`${name} deleted successfully!`);

        // Create a state to restore to the appropriate parent based on the entity type
        let stateToRestore;

        // Special handling for network interfaces
        if (type === "networkInterfaces") {
          // For network interfaces, extract parent IDs from the comma-separated string
          const parentIds = parentId.split(",");

          // Create state to restore to the parent asset (same format as add/edit operations)
          stateToRestore = {
            nodeType: "assets",
            nodeId: parentIds[4], // assetId is at index 4
            hwStackId: parentIds[3],
            domainId: parentIds[2],
            segmentId: parentIds[1],
            missionNetworkId: parentIds[0],
          };
        } else {
          // Use CISUtils to build a restoration state for other entity types
          stateToRestore = CISUtils.buildRestoreState(type, parentId);
        }

        // Item deleted, preparing to restore parent node

        try {
          // Use the state-preserving refresh function
          await refreshPanelsWithState(stateToRestore);
        } catch (error) {
          console.error("Error updating tree after deleting item:", error);
          showToast(
            "Item was deleted, but there was a problem updating the display",
            "warning"
          );
        }
      } else {
        showToast(
          `${apiResult.message || apiResult.error || "Failed to delete item"}`,
          "danger"
        );
      }
    } catch (error) {
      console.error("Error in deleteItem function:", error);
      showToast("An error occurred while deleting the item", "danger");
    }
  }

  /**
   * Helper function to close the delete confirmation modal
   * This encapsulates the modal closing logic
   */
  function closeDeleteModal() {
    const modalElement = document.getElementById("deleteConfirmModal");
    const modal = bootstrap.Modal.getInstance(modalElement);

    // Blur (unfocus) the confirm button before hiding the modal
    document.getElementById("confirmDeleteBtn").blur();

    // Small delay to ensure blur takes effect before closing the modal
    setTimeout(() => {
      modal.hide();
    }, 10);
  }

  // Fetch CIS Plan data from the API
  // Fetch CIS Plan tree data - delegates to CISApi
  async function fetchCISPlanData() {
    // ... (rest of the code remains the same)
    const treeData = await CISApi.fetchCISPlanData();

    if (treeData) {
      // Store the data in the global variable
      cisPlanData = treeData;

      // Now manually call renderTree since it's a function outside the API namespace
      renderTree(treeData);

      // Handle special cases like recently added security domains
      const lastAddedSecurityDomain = sessionStorage.getItem(
        "lastAddedSecurityDomain"
      );
      if (lastAddedSecurityDomain) {
        try {
          const sdInfo = JSON.parse(lastAddedSecurityDomain);
          // Clear it immediately to prevent repeated application
          sessionStorage.removeItem("lastAddedSecurityDomain");

          // Add a small delay to ensure DOM is rendered
          setTimeout(() => {
            // First find and expand the mission network
            const mnNode = document.querySelector(
              `.tree-node[data-type="missionNetworks"][data-id="${sdInfo.missionNetworkId}"]`
            );
            if (mnNode) {
              // Click the toggle to expand it
              const mnToggle = mnNode.querySelector(".tree-toggle");
              if (mnToggle) mnToggle.click();

              // Small delay to let mission network expand
              setTimeout(() => {
                // Then find and expand the segment
                const segNode = document.querySelector(
                  `.tree-node[data-type="networkSegments"][data-id="${sdInfo.segmentId}"]`
                );
                if (segNode) {
                  // Select the segment
                  segNode.click();

                  // Click the toggle to expand it
                  const segToggle = segNode.querySelector(".tree-toggle");
                  if (segToggle) segToggle.click();
                }
              }, 100);
            }
          }, 150);
        } catch (e) {
          console.warn("Error parsing security domain info:", e);
        }
      }

      // Restore selection state if needed
      restoreSelectionState();
    }

    return treeData;
  }

  //=========================================================================
  // 4. TREE RENDERING & MANIPULATION
  //=========================================================================

  // Helper function to restore selection state after tree refresh
  function restoreSelectionState() {
    // Get current selection state
    let currentNodeId = null;
    let currentNodeType = null;
    let currentElementId = null;

    if (currentTreeNode) {
      currentNodeId = currentTreeNode.getAttribute("data-id");
      currentNodeType = currentTreeNode.getAttribute("data-type");
    }

    if (currentElement) {
      currentElementId = currentElement.id;
    }

    // IMPORTANT: Check if we have a pending security domain selection
    // If so, skip the default state restoration as it will be handled by the event listener
    const hasPendingSDSelection =
      sessionStorage.getItem("pendingSecurityDomainSelect") !== null;

    // Only do regular state restoration if no security domain selection is pending
    if (!hasPendingSDSelection) {
      // Now restore selection and update panels based on the current selection state
      let nodeToSelect = null;

      // Find and re-select the previously selected node in the tree
      if (currentNodeId) {
        // If it was a mission network, network segment, etc.
        if (currentNodeId !== "root-cisplan") {
          nodeToSelect = document.querySelector(
            `.tree-node[data-id="${currentNodeId}"][data-type="${currentNodeType}"]`
          );
        } else {
          // If it was the root CIS Plan node
          nodeToSelect = document.querySelector(
            '.tree-node[data-id="root-cisplan"]'
          );
        }

        // If we found the node, programmatically click it to restore selection
        if (nodeToSelect) {
          nodeToSelect.click();

          // For nodes with children, ensure they're expanded
          const childrenContainer = nodeToSelect.nextElementSibling;
          if (
            childrenContainer &&
            childrenContainer.classList.contains("tree-node-children")
          ) {
            childrenContainer.style.display = "block";
            const toggleIcon = nodeToSelect.querySelector(".tree-toggle");
            if (toggleIcon) {
              toggleIcon.innerHTML = '<i class="fas fa-chevron-down"></i>';
            }
          }

          // If we had a selected element in the elements panel, try to re-select it
          if (currentElementId) {
            setTimeout(() => {
              const elementCard = document.querySelector(
                `.element-card[data-id="${currentElementId}"]`
              );
              if (elementCard) {
                elementCard.click();
              }
            }, 100); // Small delay to ensure elements are rendered
          }
        }
      }
    } else {
      // If no selection was active, show root level elements
      if (elementsTitle) {
        elementsTitle.textContent = "CIS Plan - Mission Networks";
      }

      if (elementsContainer) {
        elementsContainer.innerHTML = "";
        renderElementCards(elementsContainer, data, "missionNetworks");
      }
    }
  }

  // Render the tree based on CIS Plan data
  function renderTree(data) {
    // Clear the tree container
    cisTree.innerHTML = "";

    // Check if there's data to display
    if (!data || data.length === 0) {
      cisTree.innerHTML = `
                <div class="alert alert-info m-3">
                    <i class="fas fa-info-circle me-2"></i>
                    No CIS Plan data available
                </div>
            `;
      return;
    }

    // Create a container for the tree
    const treeContainer = document.createElement("div");
    treeContainer.className = "tree-list p-2";
    cisTree.appendChild(treeContainer);

    // Create a root "CIS Plan" node
    const rootNode = createTreeNode(
      "cisplan",
      "CIS Plan",
      "root-cisplan",
      "root-guid",
      "cisplan"
    );
    treeContainer.appendChild(rootNode);

    // Create a container for mission networks under the root node
    const missionNetworksContainer = document.createElement("div");
    missionNetworksContainer.className = "tree-node-children ms-4";
    missionNetworksContainer.style.display = "none"; // Initially collapsed
    missionNetworksContainer.setAttribute("data-parent", "root-cisplan");
    treeContainer.appendChild(missionNetworksContainer);

    // Add click event to toggle mission networks visibility
    rootNode.addEventListener("click", function (e) {
      e.stopPropagation();
      const isActive = this.classList.contains("active");

      // Toggle active class
      document.querySelectorAll(".tree-node.active").forEach((node) => {
        node.classList.remove("active");
      });

      if (!isActive) {
        this.classList.add("active");
        currentTreeNode = this;

        // When the root node is selected, display all mission networks in the Elements panel
        if (elementsTitle) {
          elementsTitle.textContent = "CIS Plan - Mission Networks";
        }

        if (elementsContainer) {
          elementsContainer.innerHTML = "";
          renderElementCards(elementsContainer, data, "missionNetworks");
        }

        // Clear the details panel
        if (detailsContainer) {
          detailsContainer.innerHTML = "";
        }

        if (detailsTitle) {
          detailsTitle.textContent = "CIS Plan Details";
        }
      }

      // Toggle children container
      // Use nextElementSibling instead of global query to avoid affecting other branches
      const childrenContainer = this.nextElementSibling;
      if (childrenContainer) {
        const isExpanded = childrenContainer.style.display !== "none";
        childrenContainer.style.display = isExpanded ? "none" : "block";

        // Toggle icon
        const icon = this.querySelector(".tree-toggle");
        if (icon) {
          icon.innerHTML = isExpanded
            ? '<i class="fas fa-chevron-right"></i>'
            : '<i class="fas fa-chevron-down"></i>';
        }
      }
    });

    // Render mission networks under the root node
    cisPlanData.forEach((missionNetwork) => {
      const missionNetworkNode = createTreeNode(
        "missionNetworks",
        missionNetwork.name,
        missionNetwork.id,
        missionNetwork.guid,
        "fa-project-diagram"
      );
      missionNetworksContainer.appendChild(missionNetworkNode);

      // Create a container for the children (network segments)
      const segmentsContainer = document.createElement("div");
      segmentsContainer.className = "tree-node-children ms-4";
      segmentsContainer.style.display = "none"; // Initially collapsed
      segmentsContainer.setAttribute("data-parent", missionNetwork.id);
      missionNetworksContainer.appendChild(segmentsContainer);

      // Add click event to mission network node to toggle children
      missionNetworkNode.addEventListener("click", function (e) {
        e.stopPropagation();
        const isActive = this.classList.contains("active");

        // Remove active class from all nodes
        document.querySelectorAll(".tree-node.active").forEach((node) => {
          node.classList.remove("active");
        });

        // Toggle active class for this node
        if (!isActive) {
          this.classList.add("active");
          currentTreeNode = this;
          loadSelectedNodeChildren(missionNetwork, "missionNetworks");
        }

        // Toggle children container
        // Use nextElementSibling instead of global query to avoid affecting other branches
        const childrenContainer = this.nextElementSibling;
        if (childrenContainer) {
          const isExpanded = childrenContainer.style.display !== "none";
          childrenContainer.style.display = isExpanded ? "none" : "block";

          // Toggle the icon for expand/collapse
          const icon = this.querySelector(".tree-toggle");
          if (icon) {
            icon.innerHTML = isExpanded
              ? '<i class="fas fa-chevron-right"></i>'
              : '<i class="fas fa-chevron-down"></i>';
          }

          // If expanding and no children yet, render them
          if (
            !isExpanded &&
            childrenContainer.children.length === 0 &&
            missionNetwork.networkSegments
          ) {
            renderNetworkSegments(
              childrenContainer,
              missionNetwork.networkSegments,
              missionNetwork
            );
          }
        }
      });
    });
  }

  // Render network segments under a mission network
  function renderNetworkSegments(container, segments, parentMissionNetwork) {
    segments.forEach((segment) => {
      const segmentNode = createTreeNode(
        "networkSegments",
        segment.name,
        segment.id,
        segment.guid,
        "fa-network-wired"
      );

      // Store parent mission network ID for use in operations
      if (parentMissionNetwork && parentMissionNetwork.id) {
        segmentNode.setAttribute(
          "data-parent-mission-network",
          parentMissionNetwork.id
        );
        // Store full parent reference in the segment's data
        segment.parentMissionNetwork = parentMissionNetwork;
      }

      container.appendChild(segmentNode);

      // Create a container for the children (security domains)
      const domainsContainer = document.createElement("div");
      domainsContainer.className = "tree-node-children ms-4";
      domainsContainer.style.display = "none"; // Initially collapsed
      domainsContainer.setAttribute("data-parent", segment.id);
      container.appendChild(domainsContainer);

      // Add click event to segment node to toggle children
      segmentNode.addEventListener("click", function (e) {
        e.stopPropagation();
        const isActive = this.classList.contains("active");

        // Remove active class from all nodes
        document.querySelectorAll(".tree-node.active").forEach((node) => {
          node.classList.remove("active");
        });

        // Toggle active class for this node
        if (!isActive) {
          this.classList.add("active");
          currentTreeNode = this;
          loadSelectedNodeChildren(
            segment,
            "networkSegments",
            parentMissionNetwork
          );
        }

        // Toggle children container
        // Use nextElementSibling instead of global query to avoid affecting other branches
        const childrenContainer = this.nextElementSibling;
        if (childrenContainer) {
          const isExpanded = childrenContainer.style.display !== "none";
          childrenContainer.style.display = isExpanded ? "none" : "block";

          // Toggle the icon for expand/collapse
          const icon = this.querySelector(".tree-toggle");
          if (icon) {
            icon.innerHTML = isExpanded
              ? '<i class="fas fa-chevron-right"></i>'
              : '<i class="fas fa-chevron-down"></i>';
          }

          // If expanding and no children yet, render them
          if (
            !isExpanded &&
            childrenContainer.children.length === 0 &&
            segment.securityDomains
          ) {
            renderSecurityDomains(
              childrenContainer,
              segment.securityDomains,
              segment,
              parentMissionNetwork
            );
          }
        }
      });
    });
  }

  // Render security domains under a network segment
  function renderSecurityDomains(
    container,
    domains,
    parentSegment,
    parentMissionNetwork
  ) {
    domains.forEach((domain) => {
      // Look up full classification details using the domain's ID
      const classification = getSecurityClassificationById(domain.id);

      const domainNode = createTreeNode(
        "securityDomains",
        classification.name, // Use name from classification data
        domain.id,
        classification.guid, // Use guid from classification data
        "fa-shield-alt"
      );

      // Store parent references as attributes for better state restoration
      if (parentSegment && parentSegment.id) {
        domainNode.setAttribute("data-parent-segment", parentSegment.id);
        // Added parent segment reference
      }

      if (parentMissionNetwork && parentMissionNetwork.id) {
        domainNode.setAttribute(
          "data-parent-mission-network",
          parentMissionNetwork.id
        );
        // Added parent mission network reference
      }

      container.appendChild(domainNode);

      // Create a container for the children (hw stacks)
      const stacksContainer = document.createElement("div");
      stacksContainer.className = "tree-node-children ms-4";
      stacksContainer.style.display = "none"; // Initially collapsed
      stacksContainer.setAttribute("data-parent", domain.id);
      container.appendChild(stacksContainer);

      // Add click event to domain node to toggle children
      domainNode.addEventListener("click", function (e) {
        e.stopPropagation();
        const isActive = this.classList.contains("active");

        // Remove active class from all nodes
        document.querySelectorAll(".tree-node.active").forEach((node) => {
          node.classList.remove("active");
        });

        // Toggle active class for this node
        if (!isActive) {
          this.classList.add("active");
          currentTreeNode = this;
          loadSelectedNodeChildren(
            domain,
            "securityDomains",
            parentSegment,
            parentMissionNetwork
          );
        }

        // Toggle children container
        // Use nextElementSibling instead of global query to avoid affecting other branches
        const childrenContainer = this.nextElementSibling;
        if (childrenContainer) {
          const isExpanded = childrenContainer.style.display !== "none";
          childrenContainer.style.display = isExpanded ? "none" : "block";

          // Toggle the icon for expand/collapse
          const icon = this.querySelector(".tree-toggle");
          if (icon) {
            icon.innerHTML = isExpanded
              ? '<i class="fas fa-chevron-right"></i>'
              : '<i class="fas fa-chevron-down"></i>';
          }

          // If expanding and no children yet, render them
          if (
            !isExpanded &&
            childrenContainer.children.length === 0 &&
            domain.hwStacks
          ) {
            renderHWStacks(
              childrenContainer,
              domain.hwStacks,
              domain,
              parentSegment,
              parentMissionNetwork
            );
          }
        }
      });
    });
  }

  // Render hardware stacks under a security domain
  function renderHWStacks(
    container,
    stacks,
    parentDomain,
    parentSegment,
    parentMissionNetwork
  ) {
    stacks.forEach((stack) => {
      // Add parent references to the stack object itself
      if (parentDomain && parentDomain.id) {
        stack.parentDomain = { id: parentDomain.id };
      }
      if (parentSegment && parentSegment.id) {
        stack.parentSegment = { id: parentSegment.id };
      }
      if (parentMissionNetwork && parentMissionNetwork.id) {
        stack.parentMissionNetwork = { id: parentMissionNetwork.id };
      }

      const stackNode = createTreeNode(
        "hwStacks",
        stack.name,
        stack.id,
        stack.guid,
        "fa-server"
      );

      // Set parent attributes for proper edit/delete functionality
      if (parentDomain && parentDomain.id) {
        stackNode.setAttribute("data-parent-domain", parentDomain.id);
      }
      if (parentSegment && parentSegment.id) {
        stackNode.setAttribute("data-parent-segment", parentSegment.id);
      }
      if (parentMissionNetwork && parentMissionNetwork.id) {
        stackNode.setAttribute(
          "data-parent-mission-network",
          parentMissionNetwork.id
        );
      }

      container.appendChild(stackNode);

      // Create a container for the children (assets)
      const assetsContainer = document.createElement("div");
      assetsContainer.className = "tree-node-children ms-4";
      assetsContainer.style.display = "none"; // Initially collapsed
      assetsContainer.setAttribute("data-parent", stack.id);
      container.appendChild(assetsContainer);

      // Add click event to stack node to toggle children
      stackNode.addEventListener("click", function (e) {
        e.stopPropagation();
        const isActive = this.classList.contains("active");

        // Remove active class from all nodes
        document.querySelectorAll(".tree-node.active").forEach((node) => {
          node.classList.remove("active");
        });

        // Toggle active class for this node
        if (!isActive) {
          this.classList.add("active");
          currentTreeNode = this;
          loadSelectedNodeChildren(
            stack,
            "hwStacks",
            parentDomain,
            parentSegment,
            parentMissionNetwork
          );
        }

        // Toggle children container
        // Use nextElementSibling instead of global query to avoid affecting other branches
        const childrenContainer = this.nextElementSibling;
        if (childrenContainer) {
          const isExpanded = childrenContainer.style.display !== "none";
          childrenContainer.style.display = isExpanded ? "none" : "block";

          // Toggle the icon for expand/collapse
          const icon = this.querySelector(".tree-toggle");
          if (icon) {
            icon.innerHTML = isExpanded
              ? '<i class="fas fa-chevron-right"></i>'
              : '<i class="fas fa-chevron-down"></i>';
          }

          // If expanding and no children yet, render them
          if (
            !isExpanded &&
            childrenContainer.children.length === 0 &&
            stack.assets
          ) {
            renderAssets(
              childrenContainer,
              stack.assets,
              stack,
              parentDomain,
              parentSegment,
              parentMissionNetwork
            );
          }
        }
      });
    });
  }

  // Render assets under a hardware stack
  function renderAssets(
    container,
    assets,
    parentStack,
    parentDomain,
    parentSegment,
    parentMissionNetwork
  ) {
    if (!assets || assets.length === 0) {
      return;
    }

    // Create a container for the assets
    const assetsContainer = document.createElement("div");
    container.appendChild(assetsContainer);

    // For each asset, create a tree node
    assets.forEach((asset) => {
      // Create a wrapper for the asset and its children to ensure proper visual nesting
      const assetWrapper = document.createElement("div");
      assetWrapper.className = "asset-wrapper";
      assetsContainer.appendChild(assetWrapper);

      // Create the asset node
      const assetNode = createTreeNode(
        "assets",
        asset.name,
        asset.id,
        asset.guid
      );

      // Store parent references as data attributes - ensure we store ID strings, not objects
      assetNode.setAttribute(
        "data-parent-stack",
        typeof parentStack === "object" ? parentStack.id : parentStack
      );
      assetNode.setAttribute(
        "data-parent-domain",
        typeof parentDomain === "object" ? parentDomain.id : parentDomain
      );
      assetNode.setAttribute(
        "data-parent-segment",
        typeof parentSegment === "object" ? parentSegment.id : parentSegment
      );
      assetNode.setAttribute(
        "data-parent-mission-network",
        typeof parentMissionNetwork === "object"
          ? parentMissionNetwork.id
          : parentMissionNetwork
      );

      // Store IDs directly for easier access
      assetNode.setAttribute(
        "data-parent-stack-id",
        typeof parentStack === "object" ? parentStack.id : parentStack
      );
      assetNode.setAttribute(
        "data-parent-domain-id",
        typeof parentDomain === "object" ? parentDomain.id : parentDomain
      );
      assetNode.setAttribute(
        "data-parent-segment-id",
        typeof parentSegment === "object" ? parentSegment.id : parentSegment
      );
      assetNode.setAttribute(
        "data-parent-mission-network-id",
        typeof parentMissionNetwork === "object"
          ? parentMissionNetwork.id
          : parentMissionNetwork
      );

      // Store these references in asset object too for when selected from the elements panel
      asset.parentStack = parentStack;
      asset.parentDomain = parentDomain;
      asset.parentSegment = parentSegment;
      asset.parentMissionNetwork = parentMissionNetwork;
      asset.hwStackId = parentStack; // Ensure hwStackId is always available

      // Add the asset node first, so child elements appear after it
      assetWrapper.appendChild(assetNode);

      // Create container for children (network interfaces, GP instances)
      const childrenContainer = document.createElement("div");
      childrenContainer.className = "ms-4"; // Margin-start for indentation
      childrenContainer.style.display = "none"; // Initially collapsed
      childrenContainer.setAttribute("data-parent", asset.id);
      assetWrapper.appendChild(childrenContainer); // Add to the wrapper after the asset node

      // Unified click handler for selection and expand/collapse
      assetNode.onclick = function (e) {
        e.stopPropagation();

        // Track if this node was already active before this click
        const wasActive = this.classList.contains("active");

        // Handle selection
        document.querySelectorAll(".tree-node.active").forEach((node) => {
          node.classList.remove("active");
        });
        this.classList.add("active");
        currentTreeNode = this;

        // Update elements panel
        loadSelectedNodeChildren(
          asset,
          "assets",
          { id: parentStack },
          { id: parentDomain },
          { id: parentSegment },
          { id: parentMissionNetwork }
        );

        // Enable the "Add Element" button
        if (addElementButton) addElementButton.disabled = false;

        // Handle expand/collapse
        const isExpandIconClick = e.target.closest(".tree-toggle");
        if (isExpandIconClick || !wasActive) {
          // Find the children container in our asset wrapper
          const childContainer = this.parentElement.querySelector(
            `div[data-parent="${asset.id}"]`
          );
          if (childContainer) {
            const isExpanded = childContainer.style.display !== "none";
            const shouldExpand = isExpandIconClick ? !isExpanded : true;

            // Toggle visibility
            childContainer.style.display = shouldExpand ? "block" : "none";

            // Update icon
            const icon = this.querySelector(".tree-toggle");
            if (icon) {
              icon.innerHTML = shouldExpand
                ? '<i class="fas fa-chevron-down"></i>'
                : '<i class="fas fa-chevron-right"></i>';
            }

            // Lazy load children if needed
            if (shouldExpand && childContainer.children.length === 0) {
              // Network interfaces
              if (
                asset.networkInterfaces &&
                asset.networkInterfaces.length > 0
              ) {
                renderNetworkInterfaces(
                  childContainer,
                  asset.networkInterfaces,
                  asset.id,
                  parentStack,
                  parentDomain,
                  parentSegment,
                  parentMissionNetwork
                );
              }

              // GP instances
              if (asset.gpInstances && asset.gpInstances.length > 0) {
                renderGPInstances(
                  childContainer,
                  asset.gpInstances,
                  asset.id,
                  parentStack,
                  parentDomain,
                  parentSegment,
                  parentMissionNetwork
                );
              }
            }
          }
        }
      };
    });
  }

  // Render network interfaces under an asset
  function renderNetworkInterfaces(
    container,
    networkInterfaces,
    parentAsset,
    parentStack,
    parentDomain,
    parentSegment,
    parentMissionNetwork
  ) {
    networkInterfaces.forEach((networkInterface) => {
      const networkInterfaceNode = createTreeNode(
        "networkInterfaces",
        networkInterface.name,
        networkInterface.id,
        networkInterface.guid,
        "fa-network-wired"
      );

      // Set parent reference data attributes
      networkInterfaceNode.setAttribute(
        "data-parent-asset",
        typeof parentAsset === "object" ? parentAsset.id : parentAsset
      );
      networkInterfaceNode.setAttribute(
        "data-parent-stack",
        typeof parentStack === "object" ? parentStack.id : parentStack
      );
      networkInterfaceNode.setAttribute(
        "data-parent-domain",
        typeof parentDomain === "object" ? parentDomain.id : parentDomain
      );
      networkInterfaceNode.setAttribute(
        "data-parent-segment",
        typeof parentSegment === "object" ? parentSegment.id : parentSegment
      );
      networkInterfaceNode.setAttribute(
        "data-parent-mission-network",
        typeof parentMissionNetwork === "object"
          ? parentMissionNetwork.id
          : parentMissionNetwork
      );

      // Set parent reference ID attributes (needed for deletion operations)
      networkInterfaceNode.setAttribute(
        "data-parent-asset-id",
        typeof parentAsset === "object" ? parentAsset.id : parentAsset
      );
      networkInterfaceNode.setAttribute(
        "data-parent-stack-id",
        typeof parentStack === "object" ? parentStack.id : parentStack
      );
      networkInterfaceNode.setAttribute(
        "data-parent-domain-id",
        typeof parentDomain === "object" ? parentDomain.id : parentDomain
      );
      networkInterfaceNode.setAttribute(
        "data-parent-segment-id",
        typeof parentSegment === "object" ? parentSegment.id : parentSegment
      );
      networkInterfaceNode.setAttribute(
        "data-parent-mission-network-id",
        typeof parentMissionNetwork === "object"
          ? parentMissionNetwork.id
          : parentMissionNetwork
      );

      // Store these references in the network interface object too
      networkInterface.parentAsset = parentAsset;
      networkInterface.parentStack = parentStack;
      networkInterface.parentDomain = parentDomain;
      networkInterface.parentSegment = parentSegment;
      networkInterface.parentMissionNetwork = parentMissionNetwork;

      container.appendChild(networkInterfaceNode);

      // Add click event to network interface node
      networkInterfaceNode.addEventListener("click", function (e) {
        e.stopPropagation();
        const isActive = this.classList.contains("active");

        // Remove active class from all nodes
        document.querySelectorAll(".tree-node.active").forEach((node) => {
          node.classList.remove("active");
        });

        // Toggle active class for this node
        if (!isActive) {
          this.classList.add("active");
          currentTreeNode = this;
          loadSelectedNodeChildren(
            networkInterface,
            "networkInterfaces",
            parentAsset,
            parentStack,
            parentDomain,
            parentSegment,
            parentMissionNetwork
          );
        }
      });
    });
  }

  // Render GP instances under an asset
  // Fetch GP name for an item with its gpid
  async function fetchGPName(gpid) {
    try {
      const response = await fetch(`/api/gps/${gpid}/name`);
      if (response.ok) {
        const result = await response.json();
        return result.name;
      }
    } catch (error) {
      console.error(`Error fetching GP name: ${error}`);
    }
    return null;
  }

  function renderGPInstances(
    container,
    gpInstances,
    parentAsset,
    parentStack,
    parentDomain,
    parentSegment,
    parentMissionNetwork
  ) {
    // First, pre-fetch all GP names to reduce flashing in the UI
    const gpPromises = {};
    gpInstances.forEach(gpInstance => {
      if (gpInstance.gpid) {
        gpPromises[gpInstance.gpid] = fetchGPName(gpInstance.gpid);
      }
    });
    
    // Once all promises are created, render the nodes
    gpInstances.forEach(async (gpInstance) => {
      let displayText = `GP Instance ${gpInstance.id}`;
      
      // If we have a GP ID, get the name (from cache or wait for fetch)
      if (gpInstance.gpid && gpPromises[gpInstance.gpid]) {
        const gpName = await gpPromises[gpInstance.gpid];
        if (gpName) {
          if (gpInstance.instanceLabel && gpInstance.instanceLabel !== gpName) {
            displayText = `${gpName} (${gpInstance.instanceLabel})`;
          } else {
            displayText = gpName;
          }
        } else if (gpInstance.instanceLabel) {
          displayText = gpInstance.instanceLabel;
        }
      } else if (gpInstance.instanceLabel) {
        displayText = gpInstance.instanceLabel;
      }
      
      // Create the node with the display text
      const gpInstanceNode = createTreeNode(
        "gpInstances",
        displayText,
        gpInstance.id,
        gpInstance.guid,
        "fa-cogs"
      );
      
      // Store gpid as a data attribute for reference if available
      if (gpInstance.gpid) {
        gpInstanceNode.setAttribute("data-gpid", gpInstance.gpid);
      }

      // Set parent reference data attributes
      gpInstanceNode.setAttribute(
        "data-parent-asset",
        typeof parentAsset === "object" ? parentAsset.id : parentAsset
      );
      gpInstanceNode.setAttribute(
        "data-parent-stack",
        typeof parentStack === "object" ? parentStack.id : parentStack
      );
      gpInstanceNode.setAttribute(
        "data-parent-domain",
        typeof parentDomain === "object" ? parentDomain.id : parentDomain
      );
      gpInstanceNode.setAttribute(
        "data-parent-segment",
        typeof parentSegment === "object" ? parentSegment.id : parentSegment
      );
      gpInstanceNode.setAttribute(
        "data-parent-mission-network",
        typeof parentMissionNetwork === "object"
          ? parentMissionNetwork.id
          : parentMissionNetwork
      );

      container.appendChild(gpInstanceNode);

      // Add click event to GP instance node
      gpInstanceNode.addEventListener("click", function (e) {
        e.stopPropagation();
        const isActive = this.classList.contains("active");

        // Remove active class from all nodes
        document.querySelectorAll(".tree-node.active").forEach((node) => {
          node.classList.remove("active");
        });

        // Toggle active class for this node
        if (!isActive) {
          this.classList.add("active");
          currentTreeNode = this;
          loadSelectedNodeChildren(
            gpInstance,
            "gpInstances",
            parentAsset,
            parentStack,
            parentDomain,
            parentSegment,
            parentMissionNetwork
          );
        }
      });
    });
  }

  //=========================================================================
  // 5. PANEL RENDERING & ELEMENT DISPLAY
  //=========================================================================

  // Create a tree node element
  function createTreeNode(type, name, id, guid, iconClass) {
    const node = document.createElement("div");
    node.className = "tree-node d-flex align-items-center p-2 mb-1 rounded";
    node.setAttribute("data-type", type);
    node.setAttribute("data-id", id);
    node.setAttribute("data-guid", guid);

    // Create the toggle button for expandable nodes
    const toggleSpan = document.createElement("span");
    toggleSpan.className = "tree-toggle me-2";
    toggleSpan.innerHTML = '<i class="fas fa-chevron-right"></i>';
    node.appendChild(toggleSpan);

    // Create the icon - use SVG icons from ENTITY_META via getElementIcon function
    const iconSpan = document.createElement("span");
    iconSpan.className = "me-2";

    // Get the appropriate SVG icon for this element type
    const iconPath = getElementIcon(type);
    iconSpan.innerHTML = `<img src="${iconPath}" width="18" height="18" alt="${type} icon">`;
    node.appendChild(iconSpan);

    // Create the text
    const textSpan = document.createElement("span");
    textSpan.className = "node-text";
    textSpan.textContent = name;
    node.appendChild(textSpan);

    return node;
  }

  // Load and display children of the selected node in the elements panel
  // Config-driven: Load and display children of the selected node in the elements panel
  function loadSelectedNodeChildren(nodeData, nodeType, ...parentData) {
    if (elementsContainer) {
      elementsContainer.innerHTML = "";
    }

    // Add navigation header with title and Up button if not at root level
    const headerContainer = document.createElement("div");
    headerContainer.className =
      "d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom";

    // Add title to the header
    const titleDiv = document.createElement("div");
    let displayName = nodeData.name;
    if (nodeType === "securityDomains") {
      const classification = getSecurityClassificationById(nodeData.id);
      displayName = classification.name;
    }
    titleDiv.className = "h5 mb-0 d-flex align-items-center";
    titleDiv.id = "elementsTitle";

    // Get the SVG icon for this node type
    const iconPath = getElementIcon(nodeType);

    // Create icon element
    titleDiv.innerHTML = `
            <img src="${iconPath}" alt="${nodeType}" class="icon-small me-2" style="width: 20px; height: 20px;">
            <span>${displayName} - ${formatNodeTypeName(nodeType)}</span>
        `;
    headerContainer.appendChild(titleDiv);

    // Add Up button if not at root level
    if (nodeType !== "root-cisplan") {
      const upButton = document.createElement("button");
      upButton.className = "btn btn-sm btn-outline-secondary";
      upButton.innerHTML = '<i class="fas fa-arrow-up"></i> Up';
      upButton.title = "Navigate up to parent";
      upButton.id = "elementsUpButton";

      // Add event listener for up navigation
      upButton.addEventListener("click", function () {
        navigateUp();
      });

      // Add tooltip for better UX
      upButton.setAttribute("data-bs-toggle", "tooltip");
      upButton.setAttribute("data-bs-placement", "top");
      upButton.setAttribute("data-bs-title", "Navigate to parent");

      headerContainer.appendChild(upButton);
    }

    // Add the header container to the elements container
    elementsContainer.appendChild(headerContainer);

    // Create a container for the actual elements
    const elementsContent = document.createElement("div");
    elementsContent.className = "elements-content";
    elementsContent.id = "elementsContent";
    elementsContainer.appendChild(elementsContent);

    // Use ENTITY_CHILDREN config to determine children to render
    const childrenDefs = ENTITY_CHILDREN[nodeType];
    let childrenRendered = false;

    // For asset nodes, we specifically want to show both network interfaces and GP instances together
    if (nodeType === "assets") {
      const networkInterfacesContainer = document.createElement("div");
      const gpInstancesContainer = document.createElement("div");
      
      // Add section headers for better organization
      if (nodeData.networkInterfaces && nodeData.networkInterfaces.length > 0) {
        const networkHeader = document.createElement("h5");
        networkHeader.className = "mt-3 mb-2";
        const networkIcon = getElementIcon("networkInterfaces");
        networkHeader.innerHTML = `<img src="${networkIcon}" width="20" height="20" alt="Network Interfaces" class="me-2"> Network Interfaces (${nodeData.networkInterfaces.length})`;
        elementsContent.appendChild(networkHeader);
        
        // Render network interfaces
        renderElementCards(networkInterfacesContainer, nodeData.networkInterfaces, "networkInterfaces");
        elementsContent.appendChild(networkInterfacesContainer);
        childrenRendered = true;
      }
      
      if (nodeData.gpInstances && nodeData.gpInstances.length > 0) {
        const gpHeader = document.createElement("h5");
        gpHeader.className = "mt-4 mb-2";
        const gpIcon = getElementIcon("gpInstances");
        gpHeader.innerHTML = `<img src="${gpIcon}" width="20" height="20" alt="Generic Products" class="me-2"> Generic Products (${nodeData.gpInstances.length})`;
        elementsContent.appendChild(gpHeader);
        
        // Render GP instances
        renderElementCards(gpInstancesContainer, nodeData.gpInstances, "gpInstances");
        elementsContent.appendChild(gpInstancesContainer);
        childrenRendered = true;
      }
    } else if (childrenDefs) {
      // For other node types, use the standard approach
      childrenDefs.forEach((def) => {
        const children = nodeData[def.key];
        if (children && Array.isArray(children) && children.length > 0) {
          renderElementCards(elementsContent, children, def.type);
          childrenRendered = true;
        }
      });
    }

    if (!childrenRendered) {
      showNoElementsMessage(elementsContent);
    }

    // Always update detail panel
    updateDetailPanel(nodeData, nodeType);
  }

  // Render element cards in the elements panel
  function renderElementCards(container, elements, type) {
    // First, clear the container
    container.innerHTML = "";

    // Create a sticky header for the Add button if we're on a scrollable list
    if (type === "assets") {
      // Create sticky header with add button
      const stickyHeader = document.createElement("div");
      stickyHeader.className =
        "sticky-top bg-light mb-2 p-2 d-flex justify-content-between align-items-center border-bottom";
      stickyHeader.style.zIndex = "100";

      // Create title in sticky header
      const headerTitle = document.createElement("h5");
      headerTitle.className = "m-0";
      headerTitle.textContent = `Assets (${elements.length})`;
      stickyHeader.appendChild(headerTitle);

      // Create add button in sticky header
      const addButton = document.createElement("button");
      addButton.className = "btn btn-sm btn-primary";
      addButton.innerHTML = '<i class="fas fa-plus"></i> Add Asset';
      addButton.addEventListener("click", function () {
        // This will trigger the same action as the main Add Element button when HW Stack is selected
        if (
          currentTreeNode &&
          currentTreeNode.getAttribute("data-type") === "hwStacks"
        ) {
          const mn = currentTreeNode.getAttribute(
            "data-parent-mission-network"
          );
          const seg = currentTreeNode.getAttribute("data-parent-segment");
          const dom = currentTreeNode.getAttribute("data-parent-domain");
          const stack = currentTreeNode.getAttribute("data-id");
          document.getElementById("addAssetMissionNetworkId").value = mn;
          document.getElementById("addAssetSegmentId").value = seg;
          document.getElementById("addAssetDomainId").value = dom;
          document.getElementById("addAssetHwStackId").value = stack;
          const addModal = new bootstrap.Modal(
            document.getElementById("addAssetModal")
          );
          addModal.show();
        }
      });
      stickyHeader.appendChild(addButton);

      container.appendChild(stickyHeader);

      // For assets, use a compact list view instead of cards
      const compactList = document.createElement("div");
      compactList.className = "compact-asset-list";
      container.appendChild(compactList);

      // Create a grid layout for more condensed view
      const grid = document.createElement("div");
      grid.className = "row row-cols-2 row-cols-md-3 row-cols-lg-4 g-2";
      compactList.appendChild(grid);

      // Store current selected element ID if there is one
      let selectedElementId = "";
      if (currentElement && currentElement.id) {
        selectedElementId = currentElement.id;
      }

      // Render each asset in a compact form
      elements.forEach((element) => {
        const col = document.createElement("div");
        col.className = "col";

        const assetItem = document.createElement("div");
        assetItem.className =
          "asset-item p-2 border rounded d-flex align-items-center";
        if (selectedElementId === element.id) {
          assetItem.classList.add("active", "bg-primary", "text-white");
        }

        assetItem.setAttribute("data-type", type);
        assetItem.setAttribute("data-id", element.id);
        assetItem.setAttribute("data-guid", element.guid);

        // Get icon for asset
        const iconPath = getElementIcon(type);

        // Create compact layout with icon and name
        assetItem.innerHTML = `
                    <img src="${iconPath}" width="20" height="20" alt="${type} icon" class="me-2">
                    <div class="asset-name text-truncate">${element.name}</div>
                `;

        // Add tooltip with ID info
        assetItem.setAttribute("title", `${element.name} (${element.id})`);

        // Add click event
        assetItem.addEventListener("click", function () {
          // Remove active class from all items
          document.querySelectorAll(".asset-item.active").forEach((item) => {
            item.classList.remove("active", "bg-primary", "text-white");
          });

          // Add active class to this item
          this.classList.add("active", "bg-primary", "text-white");

          // Store the selected element and its type
          currentElement = element;
          currentElement.type = type; // Store the type explicitly

          // Update detail panel
          updateDetailPanel(element, type);
        });

        // Add double-click handler for drill-down navigation
        assetItem.addEventListener("dblclick", function (event) {
          // Find and select the corresponding tree node
          findAndSelectTreeNode(type, element.id);
        });

        col.appendChild(assetItem);
        grid.appendChild(col);
      });

      return; // Exit early since we've handled the assets case specially
    }

    // For non-asset types, use the original card layout
    let cardsContainer = document.createElement("div");
    cardsContainer.className =
      "element-cards-container row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 m-1";
    container.appendChild(cardsContainer);

    // Store current selected element ID if there is one
    let selectedElementId = "";
    if (currentElement && currentElement.id) {
      selectedElementId = currentElement.id;
    }

    // Render each element as a card
    elements.forEach((element) => {
      const cardCol = document.createElement("div");
      cardCol.className = "col";

      const card = document.createElement("div");
      card.className = "card element-card h-100";

      // If this card represents the currently selected element, add active class
      if (selectedElementId === element.id) {
        card.classList.add("active");
        // Applied active class during render
      }

      card.setAttribute("data-type", type);
      card.setAttribute("data-id", element.id);
      card.setAttribute("data-guid", element.guid);

      const cardBody = document.createElement("div");
      cardBody.className = "card-body";

      // Get the SVG icon for this element type
      // Use centralized ENTITY_META for icon
      const iconPath = getElementIcon(type);

      // Create a header with icon and title
      const cardHeader = document.createElement("div");
      cardHeader.className = "d-flex align-items-center mb-2";

      // Add icon
      const iconSpan = document.createElement("span");
      iconSpan.className = "me-2";
      iconSpan.innerHTML = `<img src="${iconPath}" width="26" height="26" alt="${type} icon">`;
      cardHeader.appendChild(iconSpan);

      // Create title with the icon
      const cardTitle = document.createElement("h5");
      cardTitle.className = "card-title mb-0";

      // For security domains, look up the classification name
      if (type === "securityDomains") {
        const classification = getSecurityClassificationById(element.id);
        cardTitle.textContent = classification.name;
      } else if (type === "networkInterfaces") {
        // For network interfaces, show name and IP address
        let ipAddress = "N/A";
        
        // Extract IP address from configuration items if available
        if (element.configurationItems && Array.isArray(element.configurationItems)) {
          // Look for IP Address configuration item
          element.configurationItems.forEach((item) => {
            if (item.Name === "IP Address" && item.AnswerContent) {
              ipAddress = item.AnswerContent;
            }
          });
        }
        
        // Display name and IP address
        cardTitle.textContent = `${element.name} - ${ipAddress}`;
      } else if (type === "gpInstances") {
        // For GP instances, show the GP name based on gpid and instance label
        // Set initial value to the instance label or default text
        let displayText = element.instanceLabel || `GP Instance ${element.id}`;
        
        // If we have a gpid, fetch the actual GP name
        if (element.gpid) {
          // Temporarily show placeholder while we fetch the name
          cardTitle.textContent = displayText;
          
          // Fetch GP name asynchronously
          (async function() {
            try {
              const response = await fetch(`/api/gps/${element.gpid}/name`);
              if (response.ok) {
                const result = await response.json();
                
                // Format display name - include both GP name and instance label if available
                let gpName = result.name;
                let updatedText = gpName;
                
                // If we have an instance label and it's different from the GP name, add it in parentheses
                if (element.instanceLabel && element.instanceLabel !== gpName) {
                  updatedText = `${gpName} (${element.instanceLabel})`;
                }
                
                // Update the card title with the GP name
                cardTitle.textContent = updatedText;
              }
            } catch (error) {
              console.error(`Error fetching GP name for ${element.gpid}:`, error);
            }
          })();
        } else {
          // No gpid available, just show the display text
          cardTitle.textContent = displayText;
        }
      } else {
        cardTitle.textContent = element.name;
      }

      cardHeader.appendChild(cardTitle);

      // Add the header to the card body
      cardBody.appendChild(cardHeader);

      // Add subtitle (ID)
      const cardSubtitle = document.createElement("h6");
      cardSubtitle.className = "card-subtitle mb-2 text-muted";
      cardSubtitle.textContent = element.id || "";
      cardBody.appendChild(cardSubtitle);

      // For HW Stacks and Network Interfaces, use a more condensed layout
      if (type === "hwStacks" || type === "networkInterfaces") {
        // Remove the subtitle (ID) that was added earlier to save space
        cardBody.removeChild(cardSubtitle);

        // Add participant info if available in a more compact way
        if (element.cisParticipantID) {
          const participantContainer = document.createElement("div");
          participantContainer.className = "small text-secondary mb-1";
          participantContainer.innerHTML = `<span class="participant-name text-truncate">${element.cisParticipantID}</span>`;
          cardBody.appendChild(participantContainer);

          // Asynchronously fetch and update the participant name
          (async function () {
            const participantName = await getParticipantNameByKey(
              element.cisParticipantID
            );
            const nameSpan =
              participantContainer.querySelector(".participant-name");
            if (nameSpan && participantName !== element.cisParticipantID) {
              nameSpan.textContent = participantName;
            }
          })();
        }

        // Make the card more compact
        card.classList.add("compact-hw-stack");
        cardBody.classList.add("p-2");
        cardHeader.classList.add("mb-1");
      }
      card.appendChild(cardBody);
      cardCol.appendChild(card);
      cardsContainer.appendChild(cardCol);

      // Add double-click handler for drill-down navigation (separate from click handler)
      card.addEventListener("dblclick", function (event) {
        // Prevent the click event from firing
        event.stopPropagation();

        // Find and select the corresponding tree node
        findAndSelectTreeNode(type, element.id);
      });

      // Add click event to the card
      card.addEventListener("click", function () {
        // Remove active class from all cards
        document.querySelectorAll(".element-card.active").forEach((card) => {
          card.classList.remove("active");
        });

        // Add active class to this card
        this.classList.add("active");

        // Store the selected element and its type
        currentElement = element;
        currentElement.type = type; // Add the type property to the element

        // For network segments, ensure parent mission network reference is maintained
        if (type === "networkSegments" && currentTreeNode) {
          const missionNetworkId =
            currentTreeNode.getAttribute("data-parent-mission-network") ||
            currentTreeNode.getAttribute("data-id");
          if (missionNetworkId && !element.parentMissionNetwork) {
            // If we're viewing network segments from a mission network tree node, store the parent reference
            element.parentMissionNetwork = { id: missionNetworkId };
          }
        }

        // Selected element for detail panel

        // Ensure parent references for hierarchy are populated
        if (type === "assets") {
          // For assets, we need to ensure all parent references are set
          // Try to get from current element first
          let hwStackId = element.hwStackId || element.parentStack;

          // If not found and we have a currentTreeNode, get from there
          if ((!hwStackId || hwStackId === "undefined") && currentTreeNode) {
            hwStackId = currentTreeNode.getAttribute("data-parent-stack");
            element.parentDomain =
              currentTreeNode.getAttribute("data-parent-domain");
            element.parentSegment = currentTreeNode.getAttribute(
              "data-parent-segment"
            );
            element.parentMissionNetwork = currentTreeNode.getAttribute(
              "data-parent-mission-network"
            );
          }

          // Ensure we store it in both places for redundancy and as a string
          if (typeof hwStackId === "object" && hwStackId !== null) {
            element.parentStack = hwStackId.id || "";
            element.hwStackId = hwStackId.id || "";
          } else {
            element.parentStack = hwStackId;
            element.hwStackId = hwStackId;
          }
        }

        // Update the details panel
        updateDetailPanel(element, type);

        // Enable edit and delete buttons
        if (editDetailButton) editDetailButton.disabled = false;
        if (deleteDetailButton) deleteDetailButton.disabled = false;
      });
    });
  }

  // Update the details panel with the selected element's data
  function updateDetailPanel(element, type) {
    // Clear the details container
    if (detailsContainer) {
      detailsContainer.innerHTML = "";
    }

    // Ensure the corresponding element card is highlighted
    if (element && element.id) {
      // First remove active class from all element cards
      document.querySelectorAll(".element-card.active").forEach((card) => {
        card.classList.remove("active");
      });

      // Find and highlight the card that corresponds to the element being displayed
      const cardToHighlight = document.querySelector(
        `.element-card[data-id="${element.id}"]`
      );
      if (cardToHighlight) {
        cardToHighlight.classList.add("active");
        // Card highlighted
      } else {
        // Card not found to highlight
      }
    }

    // Update the details title
    if (detailsTitle) {
      // For security domains, look up the classification name
      if (type === "securityDomains") {
        const classification = getSecurityClassificationById(element.id);
        detailsTitle.textContent = `${classification.name} Details`;
      } else {
        detailsTitle.textContent = `${element.name} Details`;
      }
    }

    // Create a card to display the details
    const detailCard = document.createElement("div");
    detailCard.className = "card m-3";

    // Create the card header
    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header d-flex align-items-center";

    // For security domains, use the classification name
    if (type === "securityDomains") {
      const classification = getSecurityClassificationById(element.id);
      const iconPath = getElementIcon(type);
      cardHeader.innerHTML = `
                <img src="${iconPath}" alt="${type}" class="icon-small me-2" style="width: 20px; height: 20px;">
                <h5 class="mb-0">${classification.name}</h5>
            `;
    } else if (type === "networkInterfaces") {
      // For network interfaces, extract IP address from configuration items
      let ipAddress = "N/A";
      if (element.configurationItems && Array.isArray(element.configurationItems)) {
        // Look for IP Address configuration item
        element.configurationItems.forEach((item) => {
          if (item.Name === "IP Address" && item.AnswerContent) {
            ipAddress = item.AnswerContent;
          }
        });
      }
      
      // Create display text with both name and IP address
      const displayText = `${element.name} - ${ipAddress}`;
      
      const iconPath = getElementIcon(type);
      cardHeader.innerHTML = `
                <img src="${iconPath}" alt="${type}" class="icon-small me-2" style="width: 20px; height: 20px;">
                <h5 class="mb-0">${displayText}</h5>
            `;
    } else {
      const iconPath = getElementIcon(type);
      cardHeader.innerHTML = `
                <img src="${iconPath}" alt="${type}" class="icon-small me-2" style="width: 20px; height: 20px;">
                <h5 class="mb-0">${element.name}</h5>
            `;
    }
    detailCard.appendChild(cardHeader);

    // Create the card body
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    // Create a table for the details
    const table = document.createElement("table");
    table.className = "table table-bordered";

    // Add the basic details rows
    if (type === "securityDomains") {
      // For security domains, get full classification details and show all properties
      const classification = getSecurityClassificationById(element.id);
      table.innerHTML = `
                <tbody>
                    <tr>
                        <th scope="row">Name</th>
                        <td>${classification.name}</td>
                    </tr>
                    <tr>
                        <th scope="row">ID</th>
                        <td>${classification.id || "N/A"}</td>
                    </tr>
                    <tr>
                        <th scope="row">GUID</th>
                        <td>${classification.guid || "N/A"}</td>
                    </tr>
                    <tr>
                        <th scope="row">Releasability</th>
                        <td>${classification.releasabilityString || "N/A"}</td>
                    </tr>
                    <tr>
                        <th scope="row">Order</th>
                        <td>${classification.order || "N/A"}</td>
                    </tr>
                    <tr>
                        <th scope="row">Color</th>
                        <td>
                            <span style="display: inline-block; width: 20px; height: 20px; background-color: ${
                              classification.colour || "#808080"
                            }; margin-right: 5px; vertical-align: middle;"></span>
                            ${classification.colour || "N/A"}
                        </td>
                    </tr>
                </tbody>
            `;
    } else if (type === "networkInterfaces") {
      // For network interfaces, show config items (IP Address, Sub-Net, FQDN)
      // Start with basic info
      let tableHtml = `
                <tbody>
                    <tr>
                        <th scope="row">Name</th>
                        <td>${element.name}</td>
                    </tr>
                    <tr>
                        <th scope="row">ID</th>
                        <td>${element.id || "N/A"}</td>
                    </tr>
                    <tr>
                        <th scope="row">GUID</th>
                        <td>${element.guid || "N/A"}</td>
                    </tr>
      `;

      // Add configuration items if present
      if (element.configurationItems && element.configurationItems.length > 0) {
        // Add each config item
        element.configurationItems.forEach((item) => {
          // Find if it's one of our standard items (IP Address, Sub-Net, FQDN)
          if (["IP Address", "Sub-Net", "FQDN"].includes(item.Name)) {
            tableHtml += `
                    <tr>
                        <th scope="row">${item.Name}</th>
                        <td>${item.AnswerContent || "<em>Not set</em>"}</td>
                    </tr>
            `;
          }
        });
      } else {
        // If no config items, show placeholders
        tableHtml += `
                    <tr>
                        <th scope="row">IP Address</th>
                        <td><em>Not set</em></td>
                    </tr>
                    <tr>
                        <th scope="row">Sub-Net</th>
                        <td><em>Not set</em></td>
                    </tr>
                    <tr>
                        <th scope="row">FQDN</th>
                        <td><em>Not set</em></td>
                    </tr>
        `;
      }

      // Close the table
      tableHtml += `
                </tbody>
            `;

      table.innerHTML = tableHtml;
    } else {
      table.innerHTML = `
                <tbody>
                    <tr>
                        <th scope="row">Name</th>
                        <td>${element.name}</td>
                    </tr>
                    <tr>
                        <th scope="row">ID</th>
                        <td>${element.id || "N/A"}</td>
                    </tr>
                    <tr>
                        <th scope="row">GUID</th>
                        <td>${element.guid || "N/A"}</td>
                    </tr>
                </tbody>
            `;
    }

    // Add type-specific details
    // This can be expanded based on the different element types
    if (type === "hwStacks" && element.cisParticipantID) {
      // Add the participant ID row
      table.querySelector("tbody").innerHTML += `
                <tr>
                    <th scope="row">CIS Participant ID</th>
                    <td>${element.cisParticipantID}</td>
                </tr>
            `;

      // Add participant name asynchronously
      (async function () {
        const participantName = await getParticipantNameByKey(
          element.cisParticipantID
        );

        // Only add the row if we got a valid name that's different from the key
        if (
          participantName !== element.cisParticipantID &&
          participantName !== "N/A"
        ) {
          // Check if the details panel is still showing the same element
          if (currentElement && currentElement.id === element.id) {
            const participantRow = document.createElement("tr");
            participantRow.innerHTML = `
                            <th scope="row">CIS Participant</th>
                            <td>${participantName}</td>
                        `;

            table.querySelector("tbody").appendChild(participantRow);
          }
        }
      })();
    }

    // Add the table to the card body
    cardBody.appendChild(table);
    detailCard.appendChild(cardBody);

    // Add the detail card to the container
    if (detailsContainer) {
      detailsContainer.appendChild(detailCard);
    }
  }

  // Show a message when there are no elements to display
  function showNoElementsMessage(container) {
    container.innerHTML = `
            <div class="alert alert-info m-3">
                <i class="fas fa-info-circle me-2"></i>
                No elements available
            </div>
        `;
  }

  //=========================================================================
  // 6. SEARCH & NAVIGATION FUNCTIONS
  //=========================================================================

  // Search functionality for the tree
  function handleTreeSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const treeNodes = document.querySelectorAll("#cisTree .tree-node");
    let matchFound = false;

    // Clear any previous selection from search
    document.querySelectorAll(".tree-node.search-selected").forEach((node) => {
      node.classList.remove("search-selected");
    });

    // If search is empty, show all nodes
    if (searchTerm === "") {
      treeNodes.forEach((node) => {
        node.style.display = "flex";
        node.classList.remove("search-match");
        // Show collapse/expand icons
        const toggleIcon = node.querySelector(".toggle-icon");
        if (toggleIcon) toggleIcon.style.visibility = "visible";
      });
      // Reset all parent nodes
      document.querySelectorAll(".parent-node").forEach((parentNode) => {
        const childContainer = parentNode.nextElementSibling;
        if (
          childContainer &&
          childContainer.classList.contains("child-container")
        ) {
          childContainer.style.display = parentNode.classList.contains(
            "expanded"
          )
            ? "block"
            : "none";
        }
      });
      return;
    }

    // First pass: Find matching nodes
    const matchingNodes = new Set();
    const directMatchingNodes = [];

    treeNodes.forEach((node) => {
      const nodeText = node.textContent.toLowerCase();
      const nodeId = node.getAttribute("data-id");
      const nodeName =
        node.querySelector(".node-name")?.textContent.toLowerCase() || "";

      // Check for matches in node text or specifically in the node name
      if (nodeText.includes(searchTerm) || nodeName.includes(searchTerm)) {
        matchingNodes.add(nodeId);
        directMatchingNodes.push(node);
        matchFound = true;

        // Also add all parent nodes to ensure hierarchy is maintained
        let parentNode = node.parentElement;
        while (parentNode) {
          const parentTreeNode = parentNode.closest(".tree-node");
          if (parentTreeNode) {
            matchingNodes.add(parentTreeNode.getAttribute("data-id"));
            parentNode = parentTreeNode.parentElement;
          } else {
            break;
          }
        }
      }
    });

    // Second pass: Show/hide based on matches
    treeNodes.forEach((node) => {
      const nodeId = node.getAttribute("data-id");
      if (matchingNodes.has(nodeId)) {
        node.style.display = "flex";

        // Only add search-match class to direct matches, not parent nodes
        if (directMatchingNodes.includes(node)) {
          node.classList.add("search-match");
        }

        // Ensure all parent containers are visible
        let parentContainer = node.parentElement;
        while (parentContainer) {
          if (parentContainer.classList.contains("child-container")) {
            parentContainer.style.display = "block";

            // Also expand the corresponding parent node
            const parentTreeNode = parentContainer.previousElementSibling;
            if (
              parentTreeNode &&
              parentTreeNode.classList.contains("parent-node")
            ) {
              parentTreeNode.classList.add("expanded");
            }
          }
          parentContainer = parentContainer.parentElement;
        }
      } else {
        node.style.display = "none";
        node.classList.remove("search-match");
      }
    });

    // Show a message if no matches found
    const noMatchMessage = document.getElementById("treeNoMatchMessage");
    if (!noMatchMessage && !matchFound) {
      const message = document.createElement("div");
      message.id = "treeNoMatchMessage";
      message.className = "alert alert-info mt-2";
      message.textContent = "No matching items found";
      document.getElementById("cisTree").appendChild(message);
    } else if (noMatchMessage && matchFound) {
      noMatchMessage.remove();
    }

    // Return direct matching nodes for potential focusing
    return directMatchingNodes;
  }

  // Search functionality for the elements panel
  function handleElementsSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    let matchFound = false;

    // First, clear previous search highlights
    document
      .querySelectorAll("#elementsContainer .search-match")
      .forEach((el) => {
        el.classList.remove("search-match");
      });

    // If search is empty, show everything
    if (searchTerm === "") {
      // Show all regular element cards
      document.querySelectorAll("#elementsContainer .col").forEach((col) => {
        col.style.display = "block";
      });
      // Show all assets
      document
        .querySelectorAll("#elementsContainer .asset-item")
        .forEach((asset) => {
          asset.closest(".col").style.display = "block";
          // Clear the yellow highlight
          asset.style.backgroundColor = "";
          // Reset any animations
          asset.style.animation = "none";
        });

      // Update elements count in title
      updateElementsCount();

      // Remove any no-match message
      const noMatchMessage = document.getElementById("elementsNoMatchMessage");
      if (noMatchMessage) noMatchMessage.remove();

      return;
    }

    // Step 1: Search regular element cards
    const elementCards = document.querySelectorAll(
      "#elementsContainer .element-card"
    );
    elementCards.forEach((card) => {
      const cardText = card.textContent.toLowerCase();
      const cardName =
        card.querySelector(".element-card-title")?.textContent.toLowerCase() ||
        "";
      const cardType = card.getAttribute("data-type")?.toLowerCase() || "";

      // Improved matching: check title, content, and type attributes
      if (
        cardText.includes(searchTerm) ||
        cardName.includes(searchTerm) ||
        cardType.includes(searchTerm)
      ) {
        const columnElement = card.closest(".col");
        if (columnElement) {
          columnElement.style.display = "block";
          matchFound = true;
          card.classList.add("search-match");

          // Add subtle highlight animation for matched cards
          card.style.animation = "none";
          setTimeout(() => {
            card.style.animation = "highlight-pulse 1s";
          }, 10);
        }
      } else {
        const columnElement = card.closest(".col");
        if (columnElement) {
          columnElement.style.display = "none";
        }
      }
    });

    // Step 2: Search asset items (which have a different structure)
    const assetItems = document.querySelectorAll(
      "#elementsContainer .asset-item"
    );
    assetItems.forEach((asset) => {
      const assetText = asset.textContent.toLowerCase();
      const assetName =
        asset.querySelector(".asset-name")?.textContent.toLowerCase() || "";
      const assetType = asset.getAttribute("data-type")?.toLowerCase() || "";

      if (
        assetText.includes(searchTerm) ||
        assetName.includes(searchTerm) ||
        assetType.includes(searchTerm)
      ) {
        const columnElement = asset.closest(".col");
        if (columnElement) {
          columnElement.style.display = "block";
          matchFound = true;
          asset.classList.add("search-match");

          // Add highlight animation
          asset.style.animation = "none";
          setTimeout(() => {
            asset.style.animation = "highlight-pulse 1s";
          }, 10);

          // For assets in the compact view, add a stronger highlight
          asset.style.backgroundColor = "rgba(255, 255, 0, 0.1)";
        }
      } else {
        const columnElement = asset.closest(".col");
        if (columnElement) {
          columnElement.style.display = "none";
        }
      }
    });

    // Show a message if no matches found and search is not empty
    const elementsContainer = document.getElementById("elementsContainer");
    const noMatchMessage = document.getElementById("elementsNoMatchMessage");

    if (!matchFound) {
      if (!noMatchMessage) {
        const message = document.createElement("div");
        message.id = "elementsNoMatchMessage";
        message.className = "alert alert-info mt-2";
        message.textContent = "No matching elements found";
        elementsContainer.appendChild(message);
      }
    } else if (noMatchMessage) {
      noMatchMessage.remove();
    }

    // Update elements count in title
    updateElementsCount();
  }

  // Helper function to update elements count in the title
  function updateElementsCount() {
    const visibleCount = document.querySelectorAll(
      '#elementsContainer .col[style="display: block;"]'
    ).length;
    const elementsTitle = document.getElementById("elementsTitle");
    if (elementsTitle) {
      const titleText = elementsTitle.textContent.split("(")[0].trim();
      elementsTitle.textContent = `${titleText} (${visibleCount})`;
    }
  }

  // Make these functions globally available so they can be called from outside the DOMContentLoaded event
  window.findAndSelectTreeNode = findAndSelectTreeNode;
  window.navigateUp = navigateUp;
  window.focusFirstMatchingTreeNode = focusFirstMatchingTreeNode;

  // Function definitions inside document.ready scope
  // Function to find and select a node in the tree by type and ID
  function findAndSelectTreeNode(type, id) {
    // First, find the node in the tree
    const targetNode = document.querySelector(
      `.tree-node[data-type="${type}"][data-id="${id}"]`
    );

    if (!targetNode) {
      // Node not found in tree
      return false; // Return false to indicate failure
    }

    // Ensure all parent containers are expanded
    let parentContainer = targetNode.parentElement;
    while (parentContainer) {
      if (parentContainer.classList.contains("child-container")) {
        parentContainer.style.display = "block";

        // Also expand the corresponding parent node
        const parentTreeNode = parentContainer.previousElementSibling;
        if (
          parentTreeNode &&
          parentTreeNode.classList.contains("parent-node")
        ) {
          parentTreeNode.classList.add("expanded");
        }
      }
      parentContainer = parentContainer.parentElement;
    }

    // Clear any previous selection
    document.querySelectorAll(".tree-node.selected").forEach((node) => {
      node.classList.remove("selected");
    });

    // Select the target node and ensure it's visible
    targetNode.classList.add("selected");
    targetNode.scrollIntoView({ behavior: "smooth", block: "center" });

    // Update currentTreeNode reference
    currentTreeNode = targetNode;

    // Simulate a click to load its children and update the UI
    targetNode.click();

    // Add visual feedback
    targetNode.style.animation = "none";
    setTimeout(() => {
      targetNode.style.animation = "highlight-pulse 1s";
    }, 10);

    return true; // Return true to indicate success
  }

  // Function to navigate up one level in the tree
  function navigateUp() {
    // Check the current element type first - this is what gets updated when clicking in the elements panel
    let type;
    let parentNodeId;

    // Use currentElement if available, otherwise fall back to currentTreeNode
    if (currentElement && currentElement.type) {
      type = currentElement.type;
      // Navigating up from element type

      // Handle based on element type
      if (type === "networkInterfaces") {
        // For network interfaces, navigate to parent asset
        let parentAsset = currentElement.parentAsset || currentElement.assetId;

        // Extract ID if it's an object
        if (parentAsset && typeof parentAsset === "object" && parentAsset.id) {
          parentNodeId = parentAsset.id;
        } else {
          parentNodeId = parentAsset;
        }

        // If not found, try to get from parent attributes
        if (!parentNodeId && currentTreeNode) {
          parentNodeId = currentTreeNode.getAttribute("data-parent-asset");
        }

        if (parentNodeId) {
          // Navigating up to Asset
          if (findAndSelectTreeNode("assets", parentNodeId)) {
            // Reset currentElement to ensure next navigation works
            currentElement = null;
          }
          return;
        }
      } else if (type === "assets") {
        // For assets, we need to find the parent HW Stack
        // First check if there's a parentStack or hwStackId property
        let parentStack =
          currentElement.parentStack || currentElement.hwStackId;

        // Extract ID if it's an object
        if (parentStack && typeof parentStack === "object" && parentStack.id) {
          parentNodeId = parentStack.id;
        } else {
          parentNodeId = parentStack;
        }

        // If not found, try to get from parent attributes
        if (!parentNodeId && currentTreeNode) {
          parentNodeId = currentTreeNode.getAttribute("data-parent-stack");
        }

        if (parentNodeId) {
          // Navigating up to HW Stack
          if (findAndSelectTreeNode("hwStacks", parentNodeId)) {
            // Reset currentElement to ensure next navigation works
            currentElement = null;
          }
          return;
        }
      } else if (type === "hwStacks") {
        // For HW Stacks, we need to find the parent Security Domain
        let parentDomain =
          currentElement.parentDomain || currentElement.domainId;

        // Extract ID if it's an object
        if (
          parentDomain &&
          typeof parentDomain === "object" &&
          parentDomain.id
        ) {
          parentNodeId = parentDomain.id;
        } else {
          parentNodeId = parentDomain;
        }

        if (!parentNodeId && currentTreeNode) {
          parentNodeId = currentTreeNode.getAttribute("data-parent-domain");
        }

        if (parentNodeId) {
          // Navigating up to Security Domain
          if (findAndSelectTreeNode("securityDomains", parentNodeId)) {
            // Reset currentElement to ensure next navigation works
            currentElement = null;
          }
          return;
        }
      } else if (type === "securityDomains") {
        // For Security Domains, navigate to parent Network Segment
        let parentSegment =
          currentElement.parentSegment || currentElement.segmentId;

        // Extract ID if it's an object
        if (
          parentSegment &&
          typeof parentSegment === "object" &&
          parentSegment.id
        ) {
          parentNodeId = parentSegment.id;
        } else {
          parentNodeId = parentSegment;
        }

        if (!parentNodeId && currentTreeNode) {
          parentNodeId = currentTreeNode.getAttribute("data-parent-segment");
        }

        if (parentNodeId) {
          // Navigating up to Network Segment
          if (findAndSelectTreeNode("networkSegments", parentNodeId)) {
            // Reset currentElement to ensure next navigation works
            currentElement = null;
          }
          return;
        }
      } else if (type === "networkSegments") {
        // For Network Segments, navigate to parent Mission Network
        let parentMissionNetwork = currentElement.parentMissionNetwork;

        // Extract ID if it's an object
        if (
          parentMissionNetwork &&
          typeof parentMissionNetwork === "object" &&
          parentMissionNetwork.id
        ) {
          parentNodeId = parentMissionNetwork.id;
        } else {
          parentNodeId = parentMissionNetwork;
        }

        if (!parentNodeId && currentTreeNode) {
          parentNodeId = currentTreeNode.getAttribute(
            "data-parent-mission-network"
          );
        }

        if (parentNodeId) {
          // Navigating up to Mission Network
          if (findAndSelectTreeNode("missionNetworks", parentNodeId)) {
            // Reset currentElement to ensure next navigation works
            currentElement = null;
          }
          return;
        }
      } else if (type === "missionNetworks") {
        // Go to the root node
        const rootNode = document.querySelector(
          '.tree-node[data-id="root-cisplan"]'
        );
        if (rootNode) rootNode.click();
        return;
      }
    }

    // Fallback to current tree node if we haven't returned yet
    if (!currentTreeNode) return;

    // Get the parent node's ID based on data attributes
    const nodeType = currentTreeNode.getAttribute("data-type");

    if (nodeType === "networkInterfaces") {
      parentNodeId = currentTreeNode.getAttribute("data-parent-asset");
      if (parentNodeId) {
        // Find and select the parent Asset node
        if (findAndSelectTreeNode("assets", parentNodeId)) {
          // Reset currentElement to ensure next navigation works
          currentElement = null;
        }
      }
    } else if (nodeType === "assets") {
      parentNodeId = currentTreeNode.getAttribute("data-parent-stack");
      if (parentNodeId) {
        // Find and select the parent HW Stack node
        if (findAndSelectTreeNode("hwStacks", parentNodeId)) {
          // Reset currentElement to ensure next navigation works
          currentElement = null;
        }
      }
    } else if (nodeType === "hwStacks") {
      parentNodeId = currentTreeNode.getAttribute("data-parent-domain");
      if (parentNodeId) {
        // Find and select the parent Security Domain node
        if (findAndSelectTreeNode("securityDomains", parentNodeId)) {
          // Reset currentElement to ensure next navigation works
          currentElement = null;
        }
      }
    } else if (nodeType === "securityDomains") {
      parentNodeId = currentTreeNode.getAttribute("data-parent-segment");
      if (parentNodeId) {
        // Find and select the parent Network Segment node
        if (findAndSelectTreeNode("networkSegments", parentNodeId)) {
          // Reset currentElement to ensure next navigation works
          currentElement = null;
        }
      }
    } else if (nodeType === "networkSegments") {
      parentNodeId = currentTreeNode.getAttribute(
        "data-parent-mission-network"
      );
      if (parentNodeId) {
        // Find and select the parent Mission Network node
        if (findAndSelectTreeNode("missionNetworks", parentNodeId)) {
          // Reset currentElement to ensure next navigation works
          currentElement = null;
        }
      }
    } else if (nodeType === "missionNetworks") {
      // From Mission Network, navigate to the root node
      const rootNode = document.querySelector(
        '.tree-node[data-id="root-cisplan"]'
      );
      if (rootNode) {
        rootNode.click();
        currentElement = null;
      }
    }
  }

  // No longer needed as we're using a different navigation approach

  // Add new function to focus the first matching tree node
  function focusFirstMatchingTreeNode() {
    const searchTerm = document
      .getElementById("treeSearchInput")
      .value.toLowerCase();
    if (!searchTerm) return;

    // Find all matching nodes that are currently visible
    const matchingNodes = document.querySelectorAll(
      "#cisTree .tree-node.search-match"
    );
    if (matchingNodes.length === 0) return;

    // Clear any previous selection
    document.querySelectorAll(".tree-node.selected").forEach((node) => {
      node.classList.remove("selected");
    });
    document.querySelectorAll(".tree-node.search-selected").forEach((node) => {
      node.classList.remove("search-selected");
    });

    // Focus on the first matching node
    const firstMatchingNode = matchingNodes[0];
    firstMatchingNode.classList.add("selected");
    firstMatchingNode.classList.add("search-selected");

    // Scroll the node into view with a smooth animation
    firstMatchingNode.scrollIntoView({ behavior: "smooth", block: "center" });

    // Simulate a click to load its details
    firstMatchingNode.click();

    // Add visual feedback
    firstMatchingNode.style.animation = "none";
    setTimeout(() => {
      firstMatchingNode.style.animation = "highlight-pulse 1s";
    }, 10);

    // No longer updating breadcrumb since we're not using it
  }

  // Add CSS for search highlighting
  document.addEventListener("DOMContentLoaded", function () {
    // Add search highlight styles to head
    const style = document.createElement("style");
    style.textContent = `
        .search-match {
            background-color: rgba(255, 255, 0, 0.1);
        }
        .search-selected {
            background-color: rgba(255, 255, 0, 0.4) !important;
            border-left: 3px solid #007bff !important;
        }
        /* Navigation styles moved to more specific elements */
        @keyframes highlight-pulse {
            0% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.5); }
            70% { box-shadow: 0 0 0 10px rgba(0, 123, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); }
        }
    `;
    document.head.appendChild(style);
  });

  //=============================================================================
  // 7. UTILITY & HELPER FUNCTIONS
  //=============================================================================

  // ---- Entity Metadata and Children ----
  // These are now defined in cis_utils.js

  // CISUtils is now loaded from cis_utils.js
  // The below delegation functions remain for backward compatibility with existing code

  /**
   * Format node type name for display - delegates to CISUtils
   */
  function formatNodeTypeName(type) {
    return CISUtils.formatNodeTypeName(type);
  }

  /**
   * Get SVG icon path for a specific element type - delegates to CISUtils
   */
  function getElementIcon(type) {
    return CISUtils.getElementIcon(type);
  }

  /**
   * Show a toast notification - delegates to CISUtils
   */
  function showToast(message, type = "success") {
    return CISUtils.showToast(message, type);
  }

  /**
   * Get participant name by key from the API - delegates to CISUtils
   */
  async function getParticipantNameByKey(key) {
    return await CISUtils.getParticipantNameByKey(key);
  }

  // API namespace is already defined - removed redundant declaration

  // CISApi namespace has been moved to cis_api.js
  // This allows for better organization of code while maintaining backward compatibility

  // Utility functions

  // Utility functions

  // Format node type name for display - delegates to CISUtils
  function formatNodeTypeName(type) {
    return CISUtils.formatNodeTypeName(type);
  }

  // Removed getTypeIcon function as it was replaced by getElementIcon

  // Get SVG icon path for a specific element type - delegates to CISUtils
  function getElementIcon(type) {
    return CISUtils.getElementIcon(type);
  }

  // Close the DOMContentLoaded event handler
});
