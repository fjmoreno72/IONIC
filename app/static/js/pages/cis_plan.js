/**
 * CIS Plan JavaScript file
 *
 * This file handles the functionality for the CIS Plan view.
 * The code is organized into sections for state management, event handlers,
 * API integration, tree rendering, panel rendering, search, and utility functions.
 */

// GLOBAL VARIABLES & STATE MANAGEMENT

// Core state management variables
let currentElement = null; // Currently selected element within a node
let currentTreeNode = null; // Global variables to track state
let cisPlanData = null; // CIS Plan tree data from API
let allSPs = []; // Global variable for storing all SPs

// Make this a window property so it's accessible from other scripts like cis_api.js
window.currentGpInstanceId = null; // Tracks the current GP instance ID when viewing its SP instances

// Store security classifications data
let securityClassifications = [];

// EVENT HANDLERS & INITIALIZATION

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

      // If this is the GP Container modal, load the services
      if (modal.id === "addGPContainerModal") {
        fetchAndPopulateServices();
      }
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

  // Add event listener for SP Instance button
  document
    .getElementById("saveSPInstanceBtn")
    .addEventListener("click", addSPInstance);

  // Only add the modal show event listener for SP dropdown initialization
  // Other listeners will be added dynamically when the modal opens
  document
    .getElementById("addSPInstanceModal")
    .addEventListener("show.bs.modal", initializeSPDropdown);

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

  // SP Instances
  addEnterKeyHandler("addSPInstanceModal", addSPInstance);

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
          .addEventListener("click", async function () {
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

            // Reset the form fields to ensure we start fresh
            document.getElementById("addGPContainerInstanceLabel").value = "";

            try {
              // Reset both dropdowns to their default state
              const serviceSelect = document.getElementById(
                "addGPContainerServiceId"
              );
              const gpSelect = document.getElementById("addGPContainerGpId");

              // Reset service dropdown to first option
              serviceSelect.selectedIndex = 0;

              // Reset GP dropdown to just the placeholder
              while (gpSelect.options.length > 1) {
                gpSelect.remove(1);
              }

              // Fetch services before showing the modal
              await fetchAndPopulateServices();
            } catch (error) {
              console.error("Error preparing GP container form:", error);
              showToast("Error loading form data. Please try again.", "error");
            }

            // Show the add GP container modal
            const addModal = new bootstrap.Modal(
              document.getElementById("addGPContainerModal")
            );
            addModal.show();
          });
      }
      // GP Instance selected - add SP Instance
      else if (
        currentTreeNode &&
        currentTreeNode.getAttribute("data-type") === "gpInstances"
      ) {
        // Get the parent information
        // For GP instances, the ID we need for the API is actually stored in a data-gpid attribute
        // or it can be found in the currentElement if available
        let gpInstanceId;
        if (currentElement && currentElement.gpid) {
          // If we have a currentElement with gpid, use that (most reliable)
          gpInstanceId = currentElement.gpid;
        } else {
          // Otherwise try to get it from the data-gpid attribute
          gpInstanceId = currentTreeNode.getAttribute("data-gpid");

          // If still not found, use the data-id as a fallback (but this might not be correct)
          if (!gpInstanceId) {
            gpInstanceId = currentTreeNode.getAttribute("data-id");
            console.warn(
              "Warning: Using data-id instead of gpid for GP instance"
            );
          }
        }

        const parentAsset = currentTreeNode.getAttribute("data-parent-asset");
        const parentStack = currentTreeNode.getAttribute("data-parent-stack");
        const parentDomain = currentTreeNode.getAttribute("data-parent-domain");
        const parentSegment = currentTreeNode.getAttribute(
          "data-parent-segment"
        );
        const parentMissionNetwork = currentTreeNode.getAttribute(
          "data-parent-mission-network"
        );

        // Store IDs in the form
        document.getElementById("addSPInstanceGPId").value = gpInstanceId;
        document.getElementById("addSPInstanceAssetId").value = parentAsset;
        document.getElementById("addSPInstanceHwStackId").value = parentStack;
        document.getElementById("addSPInstanceDomainId").value = parentDomain;
        document.getElementById("addSPInstanceSegmentId").value = parentSegment;
        document.getElementById("addSPInstanceMissionNetworkId").value =
          parentMissionNetwork;

        // Clear previous values
        document.getElementById("addSPInstanceId").value = "";
        document.getElementById("addSPInstanceVersion").value = "";

        // Show the add SP instance modal
        const addModal = new bootstrap.Modal(
          document.getElementById("addSPInstanceModal")
        );
        addModal.show();
      }
      // Other node types would be handled here as the feature expands
    });
  }

  // Edit button opens the appropriate modal based on what's selected
  if (editDetailButton) {
    editDetailButton.addEventListener("click", function () {
      // Get the selected element from CISPlanPointer instead of using currentElement
      const pointerState = CISPlanPointer.getState();

      // Check if we have a selected element in the pointer that's not the root
      if (pointerState.selected && pointerState.selected.type !== "root") {
        // Log the edit action and selected element
        console.log("I am editing the selected element from CISPlanPointer");
        const pointerElement = CISPlanPointer.logEditElement();

        // Get the element details and type from the pointer state
        const element = pointerState.selected.element;
        const originalType = pointerState.selected.type; // Original type (singular form)

        // Store a reference to the element being edited to preserve it during refresh
        const elementBeingEdited = Object.assign({}, element);

        // Normalize the type for API calls if needed (some APIs expect plural forms)
        let type = originalType;
        if (type === "missionNetwork") type = "missionNetworks";
        else if (type === "networkSegment") type = "networkSegments";
        else if (type === "securityDomain") type = "securityDomains";
        else if (type === "hwStack") type = "hwStacks";
        else if (type === "asset") type = "assets";

        console.log("Using element for edit:", element, "with type:", type);

        // Store current element for compatibility with existing code
        currentElement = element;
        currentElement.type = type;

        // Store this element for the update handler to use
        window.elementBeingEdited = element;

        if (type === "missionNetworks" || type === "missionNetwork") {
          // Populate and show edit mission network modal
          document.getElementById("editMissionNetworkId").value = element.id;
          document.getElementById("editMissionNetworkName").value =
            element.name;

          // Make sure the element has the correct type attribute for the update function
          element.type = type;

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

          // Use the actual parent asset ID for network interfaces
          document.getElementById("editNetworkInterfaceAssetId").value =
            assetId;
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
          // CRITICAL: Use gpid instead of id to avoid 404 errors
          const gpid = currentElement.gpid || currentElement.id;
          console.log(
            "Editing GP instance with ID:",
            gpid,
            "Current element:",
            currentElement
          );

          document.getElementById("editGPContainerId").value = gpid;
          document.getElementById("editGPContainerInstanceLabel").value =
            currentElement.instanceLabel || "";
          document.getElementById("editGPContainerServiceId").value =
            currentElement.serviceId || "";

          // Store parent IDs for the API call - try both attribute formats
          console.log("Current tree node for parent lookups:", currentTreeNode);

          // Try all possible ways to get the parent IDs
          const assetId =
            currentTreeNode.getAttribute("data-parent-asset-id") ||
            currentTreeNode.getAttribute("data-parent-asset") ||
            currentElement.parentAssetId ||
            currentElement.parentAsset;

          const hwStackId =
            currentTreeNode.getAttribute("data-parent-stack-id") ||
            currentTreeNode.getAttribute("data-parent-stack") ||
            currentElement.parentStackId ||
            currentElement.parentStack;

          const domainId =
            currentTreeNode.getAttribute("data-parent-domain-id") ||
            currentTreeNode.getAttribute("data-parent-domain") ||
            currentElement.parentDomainId ||
            currentElement.parentDomain;

          const segmentId =
            currentTreeNode.getAttribute("data-parent-segment-id") ||
            currentTreeNode.getAttribute("data-parent-segment") ||
            currentElement.parentSegmentId ||
            currentElement.parentSegment;

          const missionNetworkId =
            currentTreeNode.getAttribute("data-parent-mission-network-id") ||
            currentTreeNode.getAttribute("data-parent-mission-network") ||
            currentElement.parentMissionNetworkId ||
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
      // First ensure we're using the most up-to-date element info from CISPlanPointer
      const currentState = CISPlanPointer.getState();
      
      // If we have a valid selected element in the state, use that instead of currentElement
      if (currentState && currentState.selected && currentState.selected.element) {
        // Update the currentElement with the one from CISPlanPointer state
        currentElement = currentState.selected.element;
        
        // Make sure the type is set correctly
        if (currentState.selected.type) {
          // Convert singular to plural form if needed for API calls
          let elementType = currentState.selected.type;
          if (elementType === "missionNetwork") elementType = "missionNetworks";
          else if (elementType === "networkSegment") elementType = "networkSegments";
          else if (elementType === "securityDomain") elementType = "securityDomains";
          else if (elementType === "hwStack") elementType = "hwStacks";
          else if (elementType === "asset") elementType = "assets";
          
          // Set the type on currentElement
          currentElement.type = elementType;
        }
        
        console.log("Using element from CISPlanPointer for delete:", currentElement);
      }
      
      if (currentElement) {
        // The type is now stored directly in the currentElement object
        const elementType = currentElement.type;

        // Preparing to delete item

        // Special handling for GP instances and SP instances
        if (elementType === "gpInstances") {
          // For GP instances, set the name appropriately
          const cardTitle = document.querySelector(
            ".element-card.active .card-title"
          );
          let displayName = cardTitle
            ? cardTitle.textContent
            : currentElement.instanceLabel ||
              `GP Instance ${currentElement.id}`;
          document.getElementById("deleteItemName").textContent = displayName;

          // IMPORTANT: For GP instances, we need to use gpid, NOT guid
          // First try to get it from the tree node data attribute
          let gpId = currentTreeNode
            ? currentTreeNode.getAttribute("data-gpid")
            : null;

          // If not found in tree node, check the current element's gpid property
          if (!gpId && currentElement && currentElement.gpid) {
            gpId = currentElement.gpid;
          }

          // Fall back to ID or GUID only if we couldn't find a gpid
          const instanceId =
            gpId || currentElement.id || currentElement.guid || "";
          console.log(
            "Using GP ID for deletion:",
            instanceId,
            "(gpid:",
            gpId,
            ")"
          );

          document.getElementById("deleteItemId").value = instanceId;
        } else if (elementType === "spInstances") {
          // For SP instances, set the name appropriately
          let displayName = `SP ${currentElement.spId} v${currentElement.spVersion}`;
          document.getElementById("deleteItemName").textContent = displayName;

          // Use spId for SP instances (NOT id as SP instances don't have an id field)
          document.getElementById("deleteItemId").value =
            currentElement.spId || "";
          console.log(
            "Setting SP instance ID for deletion:",
            currentElement.spId
          );

          // SIMPLIFIED FIX: Get parent GP instance ID directly
          let gpInstanceId = null;

          // Try getting GP instance ID from tree node first (most reliable source)
          if (currentTreeNode) {
            gpInstanceId = currentTreeNode.getAttribute(
              "data-parent-gp-instance"
            );
          }

          // If not found in tree node, check currentElement
          if (!gpInstanceId && currentElement.parentGpInstance) {
            gpInstanceId =
              typeof currentElement.parentGpInstance === "object"
                ? currentElement.parentGpInstance.id
                : currentElement.parentGpInstance;
          }

          // Check directly for gpid property as a fallback
          if (!gpInstanceId && currentElement.gpid) {
            gpInstanceId = currentElement.gpid;
          }

          // Last ditch effort - try to get from parent context
          if (!gpInstanceId && window.currentGpInstanceId) {
            gpInstanceId = window.currentGpInstanceId;
          }

          console.log(
            "GP Instance ID for this SP instance (SIMPLIFIED):",
            gpInstanceId
          );

          // Get other parent IDs from the tree node
          const assetId = currentTreeNode
            ? currentTreeNode.getAttribute("data-parent-asset")
            : "";
          const hwStackId = currentTreeNode
            ? currentTreeNode.getAttribute("data-parent-stack")
            : "HW-0001";
          const domainId = currentTreeNode
            ? currentTreeNode.getAttribute("data-parent-domain")
            : "CL-UNCLASS";
          const segmentId = currentTreeNode
            ? currentTreeNode.getAttribute("data-parent-segment")
            : "NS-0001";
          const missionNetworkId = currentTreeNode
            ? currentTreeNode.getAttribute("data-parent-mission-network")
            : "MN-0007";

          // For safety, ensure none of our values are null/undefined before setting the string
          // This prevents literal 'null' or 'undefined' strings in the comma-separated values
          const sanitizedGpInstanceId = gpInstanceId || ""; // Empty string if null/undefined

          // Log the actual GP instance ID we're using
          console.log(
            "Final GP instance ID for deletion (before storing in form):",
            sanitizedGpInstanceId || "EMPTY STRING"
          );

          // Skip setting the comma-separated values entirely if we don't have a valid GP instance ID
          if (!sanitizedGpInstanceId) {
            console.error(
              "Cannot delete SP instance: No valid GP instance ID available"
            );
            showToast(
              "Error: Cannot delete SP instance without a valid parent GP instance ID",
              "danger"
            );
            return false; // Prevent continuing with deletion
          }

          // ROBUST FIX: Store all parent IDs as comma-separated values
          // Make very sure we're using the sanitized GP instance ID that we know is valid
          const parentIdString = `${missionNetworkId},${segmentId},${domainId},${hwStackId},${assetId},${sanitizedGpInstanceId}`;
          document.getElementById("deleteItemParentId").value = parentIdString;

          // Store the GP instance ID separately for extra redundancy
          // This value will be checked in the deleteItem function
          window.lastGpInstanceIdForDeletion = sanitizedGpInstanceId;

          console.log("Set parentId value for form:", parentIdString);
        } else {
          // For other types, use the standard name and id
          document.getElementById("deleteItemName").textContent =
            currentElement.name || "";
          document.getElementById("deleteItemId").value =
            currentElement.id || "";
        }

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
        } else if (elementType === "gpInstances") {
          // For GP instances, we need mission network ID, segment ID, domain ID, HW stack ID, and asset ID
          // Try all possible ways to get the asset ID - this is critical for deletion to work

          // First try to get parent asset ID using the same pattern as network interfaces
          let assetId = currentTreeNode.getAttribute("data-parent-asset-id");
          if (!assetId)
            assetId = currentTreeNode.getAttribute("data-parent-asset");

          let hwStackId = currentTreeNode.getAttribute("data-parent-stack-id");
          if (!hwStackId)
            hwStackId = currentTreeNode.getAttribute("data-parent-stack");

          let domainId = currentTreeNode.getAttribute("data-parent-domain-id");
          if (!domainId)
            domainId = currentTreeNode.getAttribute("data-parent-domain");

          let segmentId = currentTreeNode.getAttribute(
            "data-parent-segment-id"
          );
          if (!segmentId)
            segmentId = currentTreeNode.getAttribute("data-parent-segment");

          let missionNetworkId = currentTreeNode.getAttribute(
            "data-parent-mission-network-id"
          );
          if (!missionNetworkId)
            missionNetworkId = currentTreeNode.getAttribute(
              "data-parent-mission-network"
            );

          // Fall back to object properties if still not found
          if (!assetId && currentElement.parentAsset) {
            assetId =
              typeof currentElement.parentAsset === "object"
                ? currentElement.parentAsset.id
                : currentElement.parentAsset;
          }

          // If still not found, try to search in the global data
          if (!assetId || assetId === "null" || assetId === "undefined") {
            // CRITICAL: First check if we have a gpid from the tree node or element
            let gpId = currentTreeNode
              ? currentTreeNode.getAttribute("data-gpid")
              : null;
            if (!gpId && currentElement && currentElement.gpid) {
              gpId = currentElement.gpid;
            }

            // If we have a valid gpid, use that for searching
            const searchId = gpId || currentElement.id || currentElement.guid;
            console.log(
              "Searching for asset ID in the data model for GP instance using ID:",
              searchId
            );

            // Find which asset contains this GP instance
            if (window.cisPlanData && Array.isArray(window.cisPlanData)) {
              const findAsset = (gpId, data) => {
                // Recursive function to search through the hierarchy
                const searchNodes = (nodes) => {
                  if (!Array.isArray(nodes)) return null;

                  for (const node of nodes) {
                    // Check if this node has assets
                    if (Array.isArray(node.assets)) {
                      for (const asset of node.assets) {
                        if (Array.isArray(asset.gpInstances)) {
                          for (const gp of asset.gpInstances) {
                            // Match by gpid first, then id, then guid
                            if (
                              (gpId && gp.gpid === gpId) ||
                              gp.id === gpId ||
                              gp.guid === gpId
                            ) {
                              console.log(
                                "Found matching GP instance in asset:",
                                asset.id,
                                "GP instance details:",
                                gp
                              );
                              return asset.id;
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

                return searchNodes(data);
              };

              const foundAssetId = findAsset(searchId, window.cisPlanData);
              if (foundAssetId) {
                console.log("Found asset ID from data model:", foundAssetId);
                assetId = foundAssetId;
              }
            }
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

          // Store all five parent IDs as comma-separated values
          document.getElementById(
            "deleteItemParentId"
          ).value = `${missionNetworkId},${segmentId},${domainId},${hwStackId},${assetId}`;
        } else if (elementType === "spInstances") {
          // For SP instances, we need mission network ID, segment ID, domain ID, HW stack ID, asset ID, and GP instance ID
          let gpInstanceId = currentTreeNode.getAttribute(
            "data-parent-gpinstance"
          );
          let assetId = currentTreeNode.getAttribute("data-parent-asset");
          let hwStackId = currentTreeNode.getAttribute("data-parent-stack");
          let domainId = currentTreeNode.getAttribute("data-parent-domain");
          let segmentId = currentTreeNode.getAttribute("data-parent-segment");
          let missionNetworkId = currentTreeNode.getAttribute(
            "data-parent-mission-network"
          );

          // Fall back to object properties if needed
          if (!gpInstanceId && currentElement.parentGPInstance) {
            gpInstanceId =
              typeof currentElement.parentGPInstance === "object"
                ? currentElement.parentGPInstance.id
                : currentElement.parentGPInstance;
          }

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

          // Store all six parent IDs as comma-separated values
          document.getElementById(
            "deleteItemParentId"
          ).value = `${missionNetworkId},${segmentId},${domainId},${hwStackId},${assetId},${gpInstanceId}`;
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

      // Check if we need to navigate to a specific GP instance after SP creation
      checkAndHandleSPCreationRedirect();
    } catch (error) {
      console.error("Error initializing CIS Plan app:", error);
      showToast("Error initializing application: " + error.message, "danger");
    }
  }

  // Function to check for SP creation redirect and navigate to the GP instance
  function checkAndHandleSPCreationRedirect() {
    const storedPath = localStorage.getItem("cis_plan_sp_creation_path");
    if (storedPath) {
      try {
        // Parse the stored path
        const path = JSON.parse(storedPath);
        console.log("Found SP creation path, will navigate to:", path);

        // Clear it immediately to prevent reprocessing
        localStorage.removeItem("cis_plan_sp_creation_path");

        // Wait for the tree to be fully rendered
        setTimeout(async () => {
          // Navigate the tree to show the GP instance with its new SP
          // First expand the mission network
          const mnNode = document.querySelector(
            `.tree-node[data-type="missionNetworks"][data-id="${path.missionNetworkId}"]`
          );
          if (mnNode) {
            console.log("Expanding mission network");
            mnNode.click();
            await new Promise((resolve) => setTimeout(resolve, 10));

            // Then expand the segment
            const segNode = document.querySelector(
              `.tree-node[data-type="networkSegments"][data-id="${path.segmentId}"]`
            );
            if (segNode) {
              console.log("Expanding segment");
              segNode.click();
              await new Promise((resolve) => setTimeout(resolve, 10));

              // Then expand the domain
              const domainNode = document.querySelector(
                `.tree-node[data-type="securityDomains"][data-id="${path.domainId}"]`
              );
              if (domainNode) {
                console.log("Expanding domain");
                domainNode.click();
                await new Promise((resolve) => setTimeout(resolve, 10));

                // Then expand the hw stack
                const stackNode = document.querySelector(
                  `.tree-node[data-type="hwStacks"][data-id="${path.hwStackId}"]`
                );
                if (stackNode) {
                  console.log("Expanding HW stack");
                  stackNode.click();
                  await new Promise((resolve) => setTimeout(resolve, 10));

                  // Then find the asset
                  const assetNode = document.querySelector(
                    `.tree-node[data-type="assets"][data-id="${path.assetId}"]`
                  );
                  if (assetNode) {
                    console.log("Expanding asset");
                    assetNode.click();
                    await new Promise((resolve) => setTimeout(resolve, 10));

                    // Find the GP instance - improve selection logic with more comprehensive selectors
                    console.log(
                      "Looking for GP instance with ID or GPID:",
                      path.gpInstanceId
                    );

                    // CRITICAL FIX: We need a more robust approach to find GP instance nodes
                    // after adding a new SP instance and page refresh

                    // First, wait to make sure the tree is fully expanded and all nodes are visible
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    // We need to expand the asset node first to make sure all GP instances are loaded in the DOM
                    console.log(
                      "Clicking asset node again to ensure full expansion"
                    );
                    assetNode.click();
                    await new Promise((resolve) => setTimeout(resolve, 500));

                    // Define multiple approaches to find the GP instance
                    // First try: Use data-id attribute (Now has the gpid value)
                    let gpNode = document.querySelector(
                      `.tree-node[data-type="gpInstances"][data-id="${path.gpInstanceId}"]`
                    );
                    console.log(
                      "Attempt 1 - By data-id:",
                      gpNode ? "Found" : "Not found"
                    );

                    // Second try: Use data-gpid attribute
                    if (!gpNode) {
                      gpNode = document.querySelector(
                        `.tree-node[data-type="gpInstances"][data-gpid="${path.gpInstanceId}"]`
                      );
                      console.log(
                        "Attempt 2 - By data-gpid:",
                        gpNode ? "Found" : "Not found"
                      );
                    }

                    // Third try: Use more generic tree-node selectors and check attributes
                    if (!gpNode) {
                      // Get all visible GP nodes
                      const allGpNodes = document.querySelectorAll(
                        '.tree-node[data-type="gpInstances"]'
                      );
                      console.log(
                        "Found",
                        allGpNodes.length,
                        "total GP instance nodes"
                      );

                      // First filter by instance-id attribute (the original ID)
                      for (const node of allGpNodes) {
                        if (
                          node.getAttribute("data-instance-id") ===
                          path.instanceId
                        ) {
                          gpNode = node;
                          console.log("Found node by instance-id attribute");
                          break;
                        }
                      }

                      // If still not found, try by data-parent-asset
                      if (!gpNode) {
                        const assetGpNodes = Array.from(allGpNodes).filter(
                          (node) => {
                            return (
                              node.getAttribute("data-parent-asset") ===
                                path.assetId ||
                              node.getAttribute("data-parent-asset-id") ===
                                path.assetId
                            );
                          }
                        );

                        console.log(
                          "Found",
                          assetGpNodes.length,
                          "GP nodes under asset ID",
                          path.assetId
                        );

                        // Last resort: Log all nodes and select the last one as fallback
                        assetGpNodes.forEach((node, index) => {
                          console.log(`GP node ${index}:`, {
                            id: node.getAttribute("data-id"),
                            instanceId: node.getAttribute("data-instance-id"),
                            gpid: node.getAttribute("data-gpid"),
                            text: node.textContent.trim(),
                          });
                        });

                        if (assetGpNodes.length > 0) {
                          gpNode = assetGpNodes[assetGpNodes.length - 1]; // Select the last one as fallback
                          console.log(
                            "Selecting the last GP node under this asset as fallback"
                          );
                        }
                      }
                    }

                    if (gpNode) {
                      console.log(
                        "Selecting GP instance to show new SP instance"
                      );
                      gpNode.click();
                      // Set the global variable for SP operations
                      window.currentGpInstanceId = path.gpInstanceId;
                    } else {
                      console.log(
                        "Could not find GP instance node, staying on asset view"
                      );
                    }
                  }
                }
              }
            }
          }
        }, 700); // Wait for tree to be fully rendered
      } catch (error) {
        console.error("Error processing SP creation redirect:", error);
      }
    }
  }

  // Fetch participants from API

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

  async function getParticipantNameByKey(key) {
    return CISUtils.getParticipantNameByKey(key);
  }

  // Add HW Stack
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

        // This is the correct state that will select the HW Stack directly
        await refreshPanelsWithState({
          nodeType: "hwStacks",
          nodeId: id,
          hwStackId: id,
          domainId: domainId,
          segmentId: segmentId,
          missionNetworkId: missionNetworkId,
        });

        // Set the flag for HW Stack restoration
        window.restoringHwStack = true;
        window.hwStackToRestore = id;
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

        // This is the correct state that will select the HW Stack directly
        await refreshPanelsWithState({
          nodeType: "hwStacks",
          nodeId: id,
          hwStackId: id,
          domainId: domainId,
          segmentId: segmentId,
          missionNetworkId: missionNetworkId,
        });

        // Set the flag for HW Stack restoration
        window.restoringHwStack = true;
        window.hwStackToRestore = id;
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
    console.log("refreshPanelsWithState called with state:", stateToRestore);
    try {
      // Default state is empty if not provided
      stateToRestore = stateToRestore || {};
      const isRootLevel = stateToRestore.isRootLevel === true;
      
      // IMPORTANT: Don't override the provided state if it's explicitly for root level
      // or if the node type is 'root', as this is likely after a deletion
      if (!isRootLevel && stateToRestore.nodeType !== 'root') {
        // Only capture current tree state if no mission network ID is provided AND we're not at root level
        if (!stateToRestore.missionNetworkId && currentTreeNode) {
          // Store the isRootLevel flag before overriding
          const wasRootLevel = isRootLevel;
          
          // Now capture current state
          stateToRestore = captureCurrentTreeState(currentTreeNode);
          
          // Restore the isRootLevel flag if it was set
          if (wasRootLevel) {
            stateToRestore.isRootLevel = true;
          }
          
          console.log("Captured current tree state:", stateToRestore);
        }
      } else {
        console.log("Preserving root state during refresh", stateToRestore);
      }

      // Fetch updated data
      await fetchCISPlanData();

      // Now restore the state after a slight delay to ensure DOM is updated
      setTimeout(() => restoreTreeState(stateToRestore), 300);
    } catch (error) {
      console.error("Error refreshing panels with state:", error);
      showToast("An error occurred while refreshing the view", "danger");
    }
  }

  // Helper function to capture the current tree state
  function captureCurrentTreeState(treeNode) {
    // If no tree node is provided, use the current tree node if available
    if (!treeNode) {
      treeNode = currentTreeNode;

      // If there's still no tree node available, return a minimal state object
      if (!treeNode) {
        console.log("No tree node available to capture state");
        return {
          nodeType: null,
          nodeId: null,
        };
      }
    }

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
    console.log("restoreTreeState called with state:", state);
    // Handle root state explicitly
    if (state.nodeType === 'root' || state.isRootLevel === true) {
      console.log("Restoring to root level", state);
      // Clear any selections
      document.querySelectorAll('.tree-node.active').forEach(node => {
        node.classList.remove('active');
      });
      
      // Select the root node
      const rootNode = document.querySelector('.tree-node[data-id="root-cisplan"]');
      if (rootNode) {
        rootNode.classList.add('active');
        // Update current tree node reference
        currentTreeNode = rootNode;
        
        // CRITICAL DEBUG: Check if elementsContainer is defined
        console.log("elementsContainer defined in restoreTreeState?", !!elementsContainer);
        console.log("typeof elementsContainer:", typeof elementsContainer);
        
        // Let's check the elementsContainer ID to make sure it's the right element
        console.log("elementsContainer id:", elementsContainer?.id || "No ID");
        
        // Direct solution: Show mission networks in the central panel
        // Clear the elements container first
        
        if (elementsContainer) {
          elementsContainer.innerHTML = "";
          
          // Add header
          const headerContainer = document.createElement("div");
          headerContainer.className = "d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom";
          
          // Add title with CIS Plan icon
          const titleDiv = document.createElement("div");
          titleDiv.className = "h5 mb-0 d-flex align-items-center";
          titleDiv.id = "elementsTitle";
          
          const iconPath = getElementIcon("cisplan");
          titleDiv.innerHTML = `
            <img src="${iconPath}" alt="CIS Plan" class="icon-small me-2" style="width: 20px; height: 20px;">
            <span>CIS Plan - Mission Networks</span>
          `;
          headerContainer.appendChild(titleDiv);
          elementsContainer.appendChild(headerContainer);
          
          // Create content container
          const elementsContent = document.createElement("div");
          elementsContent.className = "elements-content";
          elementsContent.id = "elementsContent";
          elementsContainer.appendChild(elementsContent);
          
          // DETAILED LOGGING: Check cisPlanData
          console.log("cisPlanData available in restoreTreeState:", !!cisPlanData);
          console.log("cisPlanData contents:", cisPlanData);
          
          // CRITICAL FIX: The cisPlanData variable is directly an array of mission networks
          // NOT an object with a missionNetworks property
          
          // Check if cisPlanData is an array with items
          if (cisPlanData && Array.isArray(cisPlanData) && cisPlanData.length > 0) {
            console.log("Detected mission networks directly in cisPlanData array:", cisPlanData.length);
            
            // Render mission networks directly from the array
            renderElementCards(elementsContent, cisPlanData, "missionNetworks");
          } else {
            // Extreme backup approach: directly fetch mission networks from the API
            console.log("No mission networks found in cisPlanData, attempting direct API fetch");
            
            // Try a direct API call as a last resort
            try {
              fetch("/api/cis_plan/tree")
                .then(response => response.json())
                .then(result => {
                  console.log("Direct API fetch result:", result);
                  
                  // The data is in result.data array
                  if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
                    console.log("Rendering mission networks from direct API call:", result.data.length);
                    renderElementCards(elementsContent, result.data, "missionNetworks");
                  } else {
                    console.log("No mission networks to display, showing empty message");
                    showNoElementsMessage(elementsContent);
                  }
                })
                .catch(error => {
                  console.error("Error fetching direct data:", error);
                  showNoElementsMessage(elementsContent);
                });
            } catch (error) {
              console.error("Exception during direct fetch attempt:", error);
              showNoElementsMessage(elementsContent);
            }
          }
        }
        
        // Update detail panel with root info
        updateDetailPanel({id: "root-cisplan", name: "CIS Plan"}, "cisplan");
        return;
      }
    }
    
    // Return early if state is invalid
    if (!state || !state.nodeType || !state.nodeId) {
      console.log("Invalid tree state, unable to restore", state);
      return;
    }
    
    // For node types that don't have a mission network ID, we can't restore
    // Exception: 'missionNetworks' type trying to restore itself
    if (!state.missionNetworkId && state.nodeType !== 'missionNetworks') {
      console.log("No mission network ID in state, unable to restore", state);
      return;
    }
    
    // For 'missionNetworks' type, validate it exists before trying to restore
    if (state.nodeType === 'missionNetworks') {
      console.log("Checking if mission network exists for restoration:", state.nodeId);
      
      // CRITICAL FIX: cisPlanData is the array of mission networks directly
      let missionNetworkExists = false;
      
      if (cisPlanData && Array.isArray(cisPlanData)) {
        // Direct check on the array
        missionNetworkExists = cisPlanData.some(mn => mn.id === state.nodeId);
        console.log("Mission network exists in cisPlanData?", missionNetworkExists);
      } else {
        console.log("Unexpected cisPlanData structure:", cisPlanData);
        // Handle the case where we don't have expected data structure
        // Just try to continue as it might be a transient issue
        missionNetworkExists = true; 
      }
      
      if (!missionNetworkExists) {
        console.log("Cannot restore to deleted mission network: " + state.nodeId);
        // Since mission network doesn't exist anymore, restore to root instead
        restoreTreeState({ nodeType: 'root', nodeId: 'root-cisplan', isRootLevel: true });
        return;
      }
    }

    // Special handling for HW Stack selections to make sure they're properly selected
    if (state.nodeType === "hwStacks" && state.nodeId && state.domainId) {
      console.log("Special handling for HW Stack state:", state);

      // Set a flag on window to indicate we're in the process of restoring an HW Stack
      window.restoringHwStack = true;
      window.hwStackToRestore = state.nodeId;
    }

    // Special handling for central panel selections
    if (state.isCentralPanelSelection) {
      console.log(
        "Central panel selection detected, preserving root view",
        state
      );

      // For central panel selections, don't select the mission network in the tree
      // Instead, just update the detail panel with the selected element

      try {
        // Check if cisPlanData is available - it might not be fully loaded yet
        // so add defensive checks throughout the code
        if (
          typeof cisPlanData !== "undefined" &&
          cisPlanData &&
          Array.isArray(cisPlanData.missionNetworks)
        ) {
          // If this is a mission network selection
          if (state.nodeType === "missionNetworks") {
            // Find the mission network
            const mn = cisPlanData.missionNetworks.find(
              (m) => m.id === state.nodeId
            );

            if (mn) {
              // Update current element
              currentElement = mn;
              currentElement.type = state.nodeType;

              // Update detail panel
              updateDetailPanel(mn, state.nodeType);

              // Update selected element in pointer
              CISPlanPointer.updateSelectedOnly(
                state.nodeType.replace(/s$/, ""),
                "L1",
                state.nodeId,
                mn.name,
                mn
              );

              console.log(
                "Updated detail panel for mission network from central panel selection"
              );
              return; // Early return as we've handled this special case
            }
          }
        }
      } catch (error) {
        console.error("Error handling central panel selection:", error);
      }
    }

    // Restoring state after refresh - standard tree navigation
    console.log("Standard tree restore for state:", state);

    // First find and restore the mission network
    const mnNode = findTreeNode("missionNetworks", state.missionNetworkId);
    if (!mnNode) return;

    // Found mission network to restore
    selectAndExpandNode(mnNode);

    // If we have a segment to restore, find and restore it
    // Handle both state.segmentId and nodeId if nodeType is networkSegments
    const segmentId = state.segmentId || (state.nodeType === "networkSegments" ? state.nodeId : null);
    if (!segmentId) return;
    
    console.log(`Looking for segment with ID: ${segmentId} in mission network ${state.missionNetworkId}`);
    
    const segNode = findTreeNodeInParent(
      mnNode,
      "networkSegments",
      segmentId
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

    // If we're restoring an HW Stack, find and select it after the security domain is expanded
    if (
      window.restoringHwStack &&
      window.hwStackToRestore &&
      state.nodeType === "hwStacks"
    ) {
      console.log("Looking for HW Stack to restore:", window.hwStackToRestore);

      // Wait a short time to let the security domain expand and populate children
      setTimeout(() => {
        try {
          const domainChildren = getChildrenContainer(sdNode);

          if (domainChildren) {
            // Find the HW Stack node
            const hwStackNode = domainChildren.querySelector(
              `.tree-node[data-type="hwStacks"][data-id="${window.hwStackToRestore}"]`
            );

            if (hwStackNode) {
              console.log(
                "Found HW Stack to restore, selecting it:",
                hwStackNode
              );

              // Remove active class from security domain
              sdNode.classList.remove("active");

              // Add active class to HW Stack
              hwStackNode.classList.add("active");

              // Set currentTreeNode
              currentTreeNode = hwStackNode;

              // Trigger the node's click handler to fully select it
              hwStackNode.click();

              // Update detail panel with HW Stack info
              if (typeof cisPlanData !== "undefined" && cisPlanData) {
                // Find the HW Stack element in the data
                let hwStackElement = null;

                // Find the element in the data by traversing the hierarchy
                if (cisPlanData.missionNetworks) {
                  const mn = cisPlanData.missionNetworks.find(
                    (m) => m.id === state.missionNetworkId
                  );
                  if (mn && mn.segments) {
                    const segment = mn.segments.find(
                      (s) => s.id === state.segmentId
                    );
                    if (segment && segment.securityDomains) {
                      const domain = segment.securityDomains.find(
                        (d) => d.id === state.domainId
                      );
                      if (domain && domain.hwStacks) {
                        hwStackElement = domain.hwStacks.find(
                          (h) => h.id === state.nodeId
                        );
                      }
                    }
                  }
                }

                if (hwStackElement) {
                  // Update current element
                  currentElement = hwStackElement;
                  currentElement.type = "hwStacks";

                  // Update detail panel
                  updateDetailPanel(hwStackElement, "hwStacks");
                }
              }
            } else {
              console.log("Could not find HW Stack node to restore");
            }
          }
        } catch (error) {
          console.error("Error restoring HW Stack:", error);
        } finally {
          // Clear the restoration flags
          window.restoringHwStack = false;
          window.hwStackToRestore = null;
        }
      }, 100); // Short delay to allow DOM to update
    }

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

    // Determine which asset to look for
    const assetId =
      state.assetId || (state.nodeType === "assets" ? state.nodeId : null);

    if (!assetId) return;

    // Looking for asset
    const assetNode = findTreeNodeInParent(hwNode, "assets", assetId);
    if (!assetNode) {
      console.warn(`Could not find asset node with ID ${assetId}`);
      return;
    }

    // Found asset to restore
    selectAndExpandNode(assetNode); // Select and expand the asset to show children

    // For GP instances, use a more direct approach
    if (state.nodeType === "gpInstances" && state.nodeId) {
      // Log that we're attempting to restore a GP instance
      console.log(`Attempting to restore GP instance with ID ${state.nodeId}`);

      // First, ensure the asset node is fully expanded to display its child GP instances
      // Force the expansion by clicking the toggle if it's not already expanded
      const assetToggle = assetNode.querySelector(".tree-toggle");
      if (assetToggle) {
        // Check if the toggle icon indicates it's collapsed
        const toggleIcon = assetToggle.querySelector("i");
        if (toggleIcon && toggleIcon.classList.contains("fa-chevron-right")) {
          console.log("Asset node is collapsed, expanding it");
          assetToggle.click();
          // Give a moment for the DOM to update
          setTimeout(() => {
            // Now try to locate the children container
            findAndSelectGPInstance(assetNode, state);
          }, 100);
          return; // Early return since we'll continue in the timeout
        }
      }

      // If we get here, the asset node should already be expanded, so proceed immediately
      findAndSelectGPInstance(assetNode, state);
      return;
    }

    // Helper function to find and select a GP instance within an asset node
    function findAndSelectGPInstance(assetNode, state) {
      // For SP instance deletion, we need to directly load and select the GP instance
      if (state.fromSpDeletion) {
        console.log("Using more direct approach for SP deletion scenario");

        // CRITICAL FIX: Check if state.nodeId is a GP ID (starts with GP-), if not, we should not proceed
        // This prevents asset IDs from being incorrectly used as GP IDs
        if (
          !state.nodeId ||
          typeof state.nodeId !== "string" ||
          !state.nodeId.startsWith("GP-")
        ) {
          console.warn(
            "Invalid GP ID format in state restoration:",
            state.nodeId,
            "Must be a string starting with GP-"
          );
          // Try to find the actual GP instance in the data model as a fallback
          if (assetNode) {
            const assetId = assetNode.getAttribute("data-id");
            if (assetId) {
              const foundGp = findGPInstanceByParentAsset(assetId);
              if (foundGp && foundGp.gpid) {
                console.log("Found GP instance by asset:", foundGp);
                state.nodeId = foundGp.gpid; // Use the correct GP ID instead
              }
            }
          }

          // If we still don't have a valid GP ID, we can't proceed
          if (
            !state.nodeId ||
            typeof state.nodeId !== "string" ||
            !state.nodeId.startsWith("GP-")
          ) {
            console.error(
              "Could not determine a valid GP ID for state restoration. Aborting."
            );
            return;
          }
        }

        // Use the loadGPInstanceChildren function which knows how to load SP instances
        // We're now passing a valid GP ID, not an asset ID or node
        console.log(
          "Loading GP instance children with verified GP ID:",
          state.nodeId
        );
        loadGPInstanceChildren({
          id: state.nodeId,
          gpid: state.nodeId,
          type: "gpInstances",
        });

        // Set the current GP instance ID for SP operations
        window.currentGpInstanceId = state.nodeId;
        console.log("Set currentGpInstanceId to", window.currentGpInstanceId);

        // We've directly triggered the correct panel to show
        return;
      }

      // Try multiple approaches to find the children container
      let assetChildren = getChildrenContainer(assetNode);

      // If the standard approach didn't work, try another way
      if (!assetChildren) {
        console.log(
          "Standard approach didn't find asset children, trying alternative..."
        );
        // The asset wrapper is the parent of the asset node
        const assetWrapper = assetNode.parentElement;
        if (assetWrapper) {
          // Look for a div that has data-parent matching the asset ID
          const assetId = assetNode.getAttribute("data-id");
          if (assetId) {
            assetChildren = assetWrapper.querySelector(
              `div[data-parent="${assetId}"]`
            );
          }
        }
      }

      // If we still couldn't find the children container, try one last approach
      if (!assetChildren) {
        console.log(
          "Alternative approach also failed, trying one last method..."
        );
        // Look for any div that immediately follows this asset node in the DOM
        let nextElement = assetNode.nextElementSibling;
        if (
          nextElement &&
          nextElement.tagName === "DIV" &&
          !nextElement.classList.contains("tree-node")
        ) {
          assetChildren = nextElement;
        }
      }

      // If we still couldn't find it, we're out of options
      if (!assetChildren) {
        console.warn(
          "Could not find children container for asset node after multiple attempts"
        );
        return;
      }

      console.log("Found asset children container, looking for GP instance");

      // Try multiple approaches to find the GP instance
      let gpNode = null;

      // Try by ID
      gpNode = assetChildren.querySelector(
        `.tree-node[data-type="gpInstances"][data-id="${state.nodeId}"]`
      );

      // If that didn't work, try by GPID attribute
      if (!gpNode) {
        gpNode = assetChildren.querySelector(
          `.tree-node[data-type="gpInstances"][data-gpid="${state.nodeId}"]`
        );
      }

      // If still not found, try searching all GP instances and matching by text content
      if (!gpNode) {
        const allGpNodes = assetChildren.querySelectorAll(
          '.tree-node[data-type="gpInstances"]'
        );
        for (const node of allGpNodes) {
          if (node.textContent && node.textContent.includes(state.nodeId)) {
            gpNode = node;
            break;
          }
        }
      }

      if (gpNode) {
        console.log("Found GP instance node, selecting it");
        // Found GP instance, select it to show its SP instances
        gpNode.click();

        // Make sure the currentGpInstanceId is set so any operations on SP instances work correctly
        if (gpNode.getAttribute("data-gpid")) {
          window.currentGpInstanceId = gpNode.getAttribute("data-gpid");
        } else if (gpNode.getAttribute("data-id")) {
          window.currentGpInstanceId = gpNode.getAttribute("data-id");
        }
        console.log("Set currentGpInstanceId to", window.currentGpInstanceId);
      } else {
        console.warn(`Could not find GP instance node with ID ${state.nodeId}`);
        // If we couldn't find the exact GP node, at least show all GP instances for this asset
        const assetId = assetNode.getAttribute("data-id");
        if (assetId) {
          // Use loadSelectedNodeChildren which is the correct function to load children
          const assetData = findAssetById(assetId);
          if (assetData) {
            loadSelectedNodeChildren(
              assetData,
              "assets",
              assetId,
              state.hwStackId,
              state.domainId,
              state.segmentId,
              state.missionNetworkId
            );
            console.log("Loaded asset node children as fallback");
          }
        }
      }
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
  
  // Helper function to expand all parent containers of a tree node
  function expandParentContainers(node) {
    if (!node) return;
    
    // Get parent node
    let parent = node.parentElement;
    
    // Continue up the DOM tree until we reach the main tree container
    while (parent && !parent.classList.contains('main-tree-container')) {
      // If this is a children container, make it visible
      if (parent.classList.contains('children-container')) {
        parent.style.display = 'block';
        
        // Find the toggle icon in the parent tree node and update it
        const parentTreeNode = parent.parentElement;
        if (parentTreeNode) {
          const toggleIcon = parentTreeNode.querySelector('.toggle-icon');
          if (toggleIcon) {
            toggleIcon.classList.remove('fa-chevron-right');
            toggleIcon.classList.add('fa-chevron-down');
          }
        }
      }
      
      // Move up to the next parent
      parent = parent.parentElement;
    }
  }

  // Helper function to select and expand a tree node
  function selectAndExpandNode(node) {
    if (!node) return;
    console.log(
      `Selecting and expanding node: ${node.getAttribute(
        "data-type"
      )}/${node.getAttribute("data-id")} (${node.getAttribute("data-name")})`
    );
    node.classList.add("active");
    expandParentContainers(node);
    
    // Get node type and id for special handling
    const nodeType = node.getAttribute("data-type");
    const nodeId = node.getAttribute("data-id");
    
    // Simulate click on the node
    simulateTreeNodeClick(node);
    
    // For network segments, ensure we load the right panel
    if (nodeType === "networkSegments") {
      console.log(`Special handling for network segment ${nodeId} - ensuring detail panel loads correctly`);
      
      // Find the element in CIS Plan data
      const foundElement = findNetworkSegmentById(nodeId);
      
      // If found, update the detail panel explicitly
      if (foundElement) {
        currentElement = foundElement;
        updateDetailPanel(foundElement, "networkSegments");
        // Also update the CISPlanPointer
        CISPlanPointer.setSelectedElement(foundElement, "networkSegments");
      }
    }
  }
  
  // Helper function to find a network segment by ID
  function findNetworkSegmentById(segmentId) {
    if (!cisPlanData || !Array.isArray(cisPlanData)) return null;
    
    // Search through mission networks
    for (const mn of cisPlanData) {
      if (mn.networkSegments && Array.isArray(mn.networkSegments)) {
        const segment = mn.networkSegments.find(seg => seg.id === segmentId);
        if (segment) return segment;
      }
    }
    
    return null;
  }
  
  // Helper function to find a mission network by ID
  function findMissionNetworkById(missionNetworkId) {
    if (!cisPlanData || !Array.isArray(cisPlanData)) return null;
    
    // Find the mission network in the CIS plan data
    const missionNetwork = cisPlanData.find(mn => mn.id === missionNetworkId);
    
    // Log results for debugging
    console.log(`Finding mission network ${missionNetworkId}: ${missionNetwork ? 'Found' : 'Not found'}`);
    
    return missionNetwork;
  }

  // Function to simulate a click on a tree node
  function simulateTreeNodeClick(node) {
    if (!node) return;
    
    // Get node data before clicking
    const nodeType = node.getAttribute("data-type");
    const nodeId = node.getAttribute("data-id");
    
    // Custom event handling for different node types
    if (nodeType === "networkSegments") {
      console.log(`Using custom event handling for network segment ${nodeId}`);
      
      // Find the actual element data
      const segmentElement = findNetworkSegmentById(nodeId);
      
      if (segmentElement) {
        // Set as current element before triggering tree behavior
        currentElement = segmentElement;
        
        // Create a custom handler for tree click that will set the proper context
        const customHandler = function() {
          // Directly load the network segment's children
          loadSelectedNodeChildren(segmentElement, "networkSegments");
          // Update detail panel with segment details
          updateDetailPanel(segmentElement, "networkSegments");
          // Update CISPlanPointer state
          CISPlanPointer.setSelectedElement(segmentElement, "networkSegments");
        };
        
        // Execute the custom handler
        setTimeout(customHandler, 50);
      }
    } else if (nodeType === "missionNetworks") {
      console.log(`Using custom event handling for mission network ${nodeId}`);
      
      // Find the actual mission network element data
      const missionNetworkElement = findMissionNetworkById(nodeId);
      
      if (missionNetworkElement) {
        // Set as current element before triggering tree behavior
        currentElement = missionNetworkElement;
        
        // Create a custom handler for tree click that will set the proper context
        const customHandler = function() {
          // Directly load the mission network's children
          loadSelectedNodeChildren(missionNetworkElement, "missionNetworks");
          // Update detail panel with mission network details
          updateDetailPanel(missionNetworkElement, "missionNetworks");
          // Update CISPlanPointer state
          CISPlanPointer.setSelectedElement(missionNetworkElement, "missionNetworks");
        };
        
        // Execute the custom handler
        setTimeout(customHandler, 50);
      }
    }
    
    // Click the node to trigger default behavior
    node.click();

    // Ensure the children container is expanded
    const childrenContainer = getChildrenContainer(node);
    if (!childrenContainer) return;

    childrenContainer.style.display = "block"; // Show children

    // Update toggle icon
    const toggleIcon = node.querySelector(".tree-toggle i");
    if (toggleIcon) toggleIcon.className = "fas fa-chevron-down";

    // Set the currentTreeNode explicitly
    currentTreeNode = node;

    // If this is a mission network and we're restoring after an edit,
    // make sure we also update the detail panel and CISPlanPointer
  }

  // Start app initialization
  initializeApp();

  // API INTEGRATION FUNCTIONS

  // Show a toast notification - delegates to CISUtils
  function showToast(message, type = "success") {
    return CISUtils.showToast(message, type);
  }

  // Add a new mission network

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

  // Helper function to refresh data while preserving position using CISPlanPointer
  async function refreshWithPointerState() {
    // Get state to preserve from CISPlanPointer
    const stateToRestore = CISPlanPointer.getStateForRefresh();

    // Log what we're preserving
    console.log("Preserving state during refresh:", stateToRestore);

    // Refresh while preserving state
    await refreshPanelsWithState(stateToRestore);
  }

  // Update an existing mission network
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

        // Check if we have a stored element being edited
        const editedElement = window.elementBeingEdited;

        // Update the current element with the new name
        if (currentElement && currentElement.id === id) {
          currentElement.name = name;

          // Update the details panel with the new name
          updateDetailPanel(currentElement, currentElement.type);
        }

        // Create a custom state to restore the element being edited
        let stateToRestore = {};

        // If we have an element being edited, use that for restoration
        if (editedElement && editedElement.id === id) {
          console.log(
            "Using stored element for state restoration:",
            editedElement
          );

          // Create a proper state object for a mission network in the central panel
          stateToRestore = {
            isCentralPanelSelection: true, // Mark this as a central panel selection
            nodeType: "missionNetworks", // Use plural form expected by restoreTreeState
            nodeId: id, // Use the ID from the form
            missionNetworkId: id, // Set explicitly to prevent state override
            elementName: name, // Store updated name
          };

          // Clear the stored element
          window.elementBeingEdited = null;
        } else {
          // Fallback to the CISPlanPointer state
          stateToRestore = CISPlanPointer.getStateForRefresh();
        }

        // Log what we're preserving
        console.log(
          "Preserving state during mission network update:",
          stateToRestore
        );

        // Refresh while preserving state
        await refreshPanelsWithState(stateToRestore);
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

        // Store the state before refreshing
        let stateToRestore = {
          nodeType: "networkSegments",
          nodeId: id,
          missionNetworkId: missionNetworkId,
          elementName: name
        };

        // Capture the current CISPlanPointer state to ensure we restore to the right place
        const currentPointerState = CISPlanPointer.getState();
        console.log("Preserving CISPlanPointer state before refresh:", currentPointerState);

        // Update the current element with the new name
        if (currentElement && currentElement.id === id) {
          currentElement.name = name;

          // Update the details panel with the new name
          updateDetailPanel(currentElement, currentElement.type);
        }

        // Refresh the data with state preservation
        console.log("Refreshing data with network segment state preservation:", stateToRestore);
        refreshPanelsWithState(stateToRestore);
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

  function formatNodeTypeName(type) {
    return CISUtils.formatNodeTypeName(type);
  }

  // Update an existing network interface
  async function updateNetworkInterface() {
    console.log("Starting network interface update...");
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

    // Log all parent IDs for debugging
    console.log("Network Interface Update - Parent IDs:", {
      missionNetworkId,
      segmentId,
      domainId,
      hwStackId,
      assetId,
      interfaceId: id,
    });

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

      console.log("Making API call to update network interface name...");
      console.log("Using asset ID:", assetId);

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

  // Function to fetch services and populate the service dropdown
  async function fetchAndPopulateServices() {
    try {
      // Get the select element
      const serviceSelect = document.getElementById("addGPContainerServiceId");

      // Clear previous options (except the first placeholder)
      while (serviceSelect.options.length > 1) {
        serviceSelect.remove(1);
      }

      // Show loading option
      const loadingOption = document.createElement("option");
      loadingOption.textContent = "Loading services...";
      loadingOption.disabled = true;
      loadingOption.id = "loading-services-option";
      serviceSelect.appendChild(loadingOption);

      // Fetch services from API
      const response = await fetch("/api/services");

      if (!response.ok) {
        throw new Error(`Error fetching services: ${response.status}`);
      }

      // Get services directly as an array
      const services = (await response.json()) || [];

      // Remove loading option safely
      const loadingOptionElement = document.getElementById(
        "loading-services-option"
      );
      if (
        loadingOptionElement &&
        loadingOptionElement.parentNode === serviceSelect
      ) {
        serviceSelect.removeChild(loadingOptionElement);
      }

      // Sort services alphabetically by name
      services.sort((a, b) => a.name.localeCompare(b.name));

      // Add an option for each service
      services.forEach((service) => {
        const option = document.createElement("option");
        option.value = service.id;
        option.textContent = service.name;
        option.setAttribute("data-service-id", service.id);
        serviceSelect.appendChild(option);
      });

      // Add change event handler to service select to update GPs when service changes
      serviceSelect.addEventListener("change", fetchAndPopulateGPs);
    } catch (error) {
      console.error("Error fetching services:", error);
      showToast("Error loading services. Please try again.", "error");

      // Clear loading option if it exists
      const serviceSelect = document.getElementById("addGPContainerServiceId");
      for (let i = 1; i < serviceSelect.options.length; i++) {
        if (serviceSelect.options[i].textContent === "Loading services...") {
          serviceSelect.remove(i);
          break;
        }
      }
    }
  }

  // Function to fetch GP names for a list of GP IDs
  async function fetchGPNames(gpIds) {
    const gpNames = {};

    if (!gpIds || gpIds.length === 0) {
      console.warn("No GP IDs provided to fetchGPNames function");
      return gpNames;
    }

    // Fetch names for each GP ID
    const promises = gpIds.map(async (gpId) => {
      try {
        const response = await fetch(`/api/gps/${gpId}/name`);

        if (response.ok) {
          const result = await response.json();

          // Direct access to name field in the response, matching fetchGPName function
          if (result.name) {
            gpNames[gpId] = result.name;
          } else {
            console.warn(`Name not found for GP ${gpId}, using fallback`);
            gpNames[gpId] = `GP ${gpId}`; // Fallback if name not found
          }
        } else {
          console.warn(
            `Failed to fetch name for GP ${gpId}: ${response.status}`
          );
          gpNames[gpId] = `GP ${gpId}`; // Fallback if request fails
        }
      } catch (error) {
        console.error(`Error fetching name for GP ${gpId}:`, error);
        gpNames[gpId] = `GP ${gpId}`; // Fallback on error
      }
    });

    // Wait for all name fetches to complete
    await Promise.all(promises);

    return gpNames;
  }

  // Function to fetch and populate GPs based on selected service
  async function fetchAndPopulateGPs() {
    try {
      // Get the select elements
      const serviceSelect = document.getElementById("addGPContainerServiceId");
      const gpSelect = document.getElementById("addGPContainerGpId");

      const selectedServiceId = serviceSelect.value;

      if (!selectedServiceId) {
        // Reset GP dropdown if no service selected
        while (gpSelect.options.length > 1) {
          gpSelect.remove(1);
        }
        return;
      }

      // Clear previous GP options (except the first placeholder)
      while (gpSelect.options.length > 1) {
        gpSelect.remove(1);
      }

      // Show loading option
      const loadingOption = document.createElement("option");
      loadingOption.textContent = "Loading GPs...";
      loadingOption.disabled = true;
      loadingOption.id = "loading-gps-option";
      gpSelect.appendChild(loadingOption);

      // Fetch GPs for the selected service
      const response = await fetch(
        `/api/services/${selectedServiceId}/all_gps`
      );

      if (!response.ok) {
        throw new Error(`Error fetching GPs: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to retrieve GPs");
      }

      const gpIds = result.gp_ids || [];

      // Remove loading option safely
      const loadingOptionElement =
        document.getElementById("loading-gps-option");
      if (
        loadingOptionElement &&
        loadingOptionElement.parentNode === gpSelect
      ) {
        gpSelect.removeChild(loadingOptionElement);
      }

      if (gpIds.length === 0) {
        // Show a message if no GPs available
        const noGpsOption = document.createElement("option");
        noGpsOption.textContent = "No GPs available for this service";
        noGpsOption.disabled = true;
        gpSelect.appendChild(noGpsOption);
        return;
      }

      // Fetch GP names for the IDs
      const gpNames = await fetchGPNames(gpIds);

      // Create an array of GP objects with IDs and names for sorting
      const gps = gpIds.map((id) => ({
        id,
        name: gpNames[id] || `GP ${id}`,
      }));

      // Sort GPs alphabetically by name
      gps.sort((a, b) => a.name.localeCompare(b.name));

      // Add an option for each GP
      gps.forEach((gp) => {
        const option = document.createElement("option");
        option.value = gp.id;
        option.textContent = gp.name;
        option.setAttribute("data-gp-id", gp.id);
        gpSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching GPs:", error);
      showToast("Error loading Generic Products. Please try again.", "error");

      // Clear loading option if it exists
      const gpSelect = document.getElementById("addGPContainerGpId");
      for (let i = 1; i < gpSelect.options.length; i++) {
        if (gpSelect.options[i].textContent === "Loading GPs...") {
          gpSelect.remove(i);
          break;
        }
      }
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

    // Debug which ID is missing
    console.log("Edit GP Instance - IDs:", {
      id,
      missionNetworkId,
      segmentId,
      domainId,
      hwStackId,
      assetId,
    });

    if (
      !id ||
      !missionNetworkId ||
      !segmentId ||
      !domainId ||
      !hwStackId ||
      !assetId
    ) {
      // Provide more specific information about which ID is missing
      let missingIds = [];
      if (!id) missingIds.push("GP Instance ID");
      if (!missionNetworkId) missingIds.push("Mission Network ID");
      if (!segmentId) missingIds.push("Segment ID");
      if (!domainId) missingIds.push("Domain ID");
      if (!hwStackId) missingIds.push("HW Stack ID");
      if (!assetId) missingIds.push("Asset ID");

      showToast("Missing ID information", "warning");
      console.error("Missing IDs:", missingIds);
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

  // Add a new SP instance to a GP instance
  async function addSPInstance() {
    try {
      // Store current state for restoration
      const originalTreeNode = currentTreeNode;
      const originalElement = currentElement;

      // Get form fields
      let gpInstanceId = document.getElementById("addSPInstanceGPId").value;
      const missionNetworkId = document.getElementById(
        "addSPInstanceMissionNetworkId"
      ).value;
      const segmentId = document.getElementById("addSPInstanceSegmentId").value;
      const domainId = document.getElementById("addSPInstanceDomainId").value;
      const hwStackId = document.getElementById("addSPInstanceHwStackId").value;
      const assetId = document.getElementById("addSPInstanceAssetId").value;
      const spId = document.getElementById("addSPInstanceId").value;
      const spVersion = document.getElementById("addSPInstanceVersion").value;

      // For GP instances, we need to find the actual gpid
      // First try to check if currentElement is a GP instance and has the gpid property
      if (
        currentElement &&
        currentElement.type === "gpInstances" &&
        currentElement.gpid
      ) {
        // Use the current element's gpid property
        gpInstanceId = currentElement.gpid;
        console.log("Using gpid from currentElement:", gpInstanceId);
      } else if (
        currentTreeNode &&
        currentTreeNode.getAttribute("data-type") === "gpInstances"
      ) {
        // Try to get it from the data-gpid attribute on the tree node
        const treeNodeGpid = currentTreeNode.getAttribute("data-gpid");
        if (treeNodeGpid) {
          gpInstanceId = treeNodeGpid;
          console.log("Using gpid from tree node attribute:", gpInstanceId);
        }
      }

      // Validate required fields
      if (!spId) {
        CISUtils.showToast("Please select a Specific Product", "danger");
        return;
      }
      // Version is optional - if not provided, it will be null or empty string

      // Call API to add SP instance
      const result = await CISApi.addSPInstance(
        missionNetworkId,
        segmentId,
        domainId,
        hwStackId,
        assetId,
        gpInstanceId,
        spId,
        spVersion
      );

      if (result.success) {
        // Close the modal
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("addSPInstanceModal")
        );
        modal.hide();

        // Clear the form fields
        document.getElementById("addSPInstanceId").value = "";
        document.getElementById("addSPInstanceVersion").value = "";

        // Show success message
        CISUtils.showToast("Specific Product added successfully", "success");

        // ULTRA SIMPLE: Force a full UI reload
        try {
          // Show a brief message to the user
          CISUtils.showToast(
            "Refreshing CIS Plan with new SP instance...",
            "info"
          );

          // First, store the path information that we need to navigate to after refresh
          // CRITICAL: Validate that gpInstanceId is a proper GP ID to avoid asset IDs being used
          if (
            !gpInstanceId ||
            typeof gpInstanceId !== "string" ||
            !gpInstanceId.startsWith("GP-")
          ) {
            console.warn(
              "Invalid GP ID detected before saving SP creation path:",
              gpInstanceId
            );
            // Try to find the actual GP ID using the API or data model
            try {
              // First attempt: Check if we have it in window.currentGpInstanceId
              if (
                window.currentGpInstanceId &&
                typeof window.currentGpInstanceId === "string" &&
                window.currentGpInstanceId.startsWith("GP-")
              ) {
                console.log(
                  "Using window.currentGpInstanceId instead:",
                  window.currentGpInstanceId
                );
                gpInstanceId = window.currentGpInstanceId;
              }
              // Second attempt: Try to find the GP instance using the asset ID
              else if (assetId) {
                const foundGp = findGPInstanceByParentAsset(assetId);
                if (foundGp && foundGp.gpid) {
                  console.log("Found GP instance by asset:", foundGp);
                  gpInstanceId = foundGp.gpid;
                }
              }
            } catch (err) {
              console.error("Error finding correct GP ID:", err);
            }

            // Final validation before storing
            if (
              !gpInstanceId ||
              typeof gpInstanceId !== "string" ||
              !gpInstanceId.startsWith("GP-")
            ) {
              console.error(
                "Could not determine a valid GP ID for SP creation path. Using a placeholder."
              );
            }
          }

          // Store path with validated GP ID and additional information
          // IMPORTANT: Store both the GP ID (product ID) and the instance ID (original ID)
          // to make it easier to find the correct node after page refresh
          const path = {
            missionNetworkId,
            segmentId,
            domainId,
            hwStackId,
            assetId,
            gpInstanceId, // The GP ID (product ID) - starts with GP-
            instanceId: null, // We'll try to find the original instance ID from the data model
          };

          // Try to get the instance ID from the current element or tree node
          try {
            // Try to find the GP instance in the data model to get its instance ID
            const gpInstance = findGPInstanceById(gpInstanceId);
            if (gpInstance) {
              console.log("Found GP instance in data model:", gpInstance);
              path.instanceId = gpInstance.id; // This is the instance ID (original ID)
            }
          } catch (err) {
            console.error("Error finding GP instance for path storage:", err);
          }

          // Store this in local storage so it persists through navigation
          localStorage.setItem(
            "cis_plan_sp_creation_path",
            JSON.stringify(path)
          );

          // Now reload the entire page - this is a guaranteed way to refresh everything
          console.log("Reloading page to refresh CIS Plan data");

          // Use a short timeout to ensure the localStorage is set before reload
          setTimeout(() => {
            window.location.reload();
          }, 100);
        } catch (error) {
          console.error(
            "Error refreshing UI after SP instance creation:",
            error
          );
        }
      } else {
        // Show error message
        if (result.message) {
          CISUtils.showToast(
            "Error adding SP instance: " + result.message,
            "danger"
          );
        } else {
          CISUtils.showToast(
            "Error adding SP instance: " + (result.error || "Unknown error"),
            "danger"
          );
        }
      }
    } catch (error) {
      console.log("Error adding SP instance:", error);
      CISUtils.showToast("Error adding SP instance: " + error, "danger");
    }
  }

  /**
   * Initialize the SP dropdown by loading all SPs from the API
   */
  async function initializeSPDropdown() {
    try {
      // Prepare the dropdown menu but don't show it yet
      const dropdownMenu = document.getElementById("spDropdownMenu");
      const dropdownContainer = document.getElementById("spDropdownContainer");

      // Hide the dropdown by default
      dropdownContainer.classList.add("d-none");

      // Clear the search input and selected SP display
      document.getElementById("spSearchInput").value = "";
      document.getElementById("selectedSPDisplay").innerHTML = "";
      document.getElementById("addSPInstanceId").value = "";

      // Fetch all SPs from the API if we don't have them already
      if (allSPs.length === 0) {
        dropdownMenu.innerHTML =
          '<div class="list-group-item text-muted">Loading SPs...</div>';
        allSPs = await CISApi.getAllSPs();
      }

      if (allSPs.length === 0) {
        dropdownMenu.innerHTML =
          '<div class="list-group-item text-muted">No SPs found</div>';
        return;
      }

      // Sort SPs by name for better usability
      allSPs.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });

      // Prepare the dropdown with all SPs but don't show it yet
      // We'll set showDropdown to false to keep it hidden until user interaction
      populateSPDropdown(allSPs, false);

      // Setup event listeners for this instance
      setupSPSearchListeners();
    } catch (error) {
      console.error("Error initializing SP dropdown:", error);
      document.getElementById("spDropdownMenu").innerHTML =
        '<div class="list-group-item text-muted">Error loading SPs</div>';
    }
  }

  /**
   * Setup event listeners for SP search functionality
   */
  function setupSPSearchListeners() {
    const searchInput = document.getElementById("spSearchInput");
    const dropdownContainer = document.getElementById("spDropdownContainer");

    // Show dropdown when input is focused
    searchInput.addEventListener("focus", function () {
      dropdownContainer.classList.remove("d-none");
    });

    // Add the input event listener for search filtering
    searchInput.addEventListener("input", function () {
      console.log("Search input changed, filtering SPs...");
      filterSPs();
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (event) {
      const isClickInside =
        searchInput.contains(event.target) ||
        dropdownContainer.contains(event.target);

      if (!isClickInside) {
        dropdownContainer.classList.add("d-none");
      }
    });

    // Reset dropdown when modal is closed
    document
      .getElementById("addSPInstanceModal")
      .addEventListener("hidden.bs.modal", function () {
        dropdownContainer.classList.add("d-none");
      });
  }

  /**
   * Populate the SP dropdown with the provided list of SPs
   * @param {Array} spsToShow - The array of SPs to display
   * @param {boolean} showDropdown - Whether to show the dropdown after populating
   */
  function populateSPDropdown(spsToShow, showDropdown = false) {
    const dropdownMenu = document.getElementById("spDropdownMenu");
    const dropdownContainer = document.getElementById("spDropdownContainer");

    if (spsToShow.length === 0) {
      dropdownMenu.innerHTML =
        '<div class="list-group-item text-muted">No matching SPs found</div>';
      return;
    }

    // Create dropdown items for each SP
    let dropdownHtml = "";
    spsToShow.forEach((sp) => {
      dropdownHtml += `<div class="list-group-item" data-sp-id="${sp.id}" data-sp-name="${sp.name}">${sp.name} <small class="text-muted">(${sp.id})</small></div>`;
    });

    dropdownMenu.innerHTML = dropdownHtml;

    // Add click handlers to the newly created items
    const items = dropdownMenu.querySelectorAll(
      ".list-group-item:not(.text-muted)"
    );
    items.forEach((item) => {
      item.addEventListener("click", selectSP);
    });

    // Only show the dropdown if requested
    if (showDropdown) {
      dropdownContainer.classList.remove("d-none");
    } else {
      dropdownContainer.classList.add("d-none");
    }
  }

  /**
   * Filter the SPs based on the search input
   */
  function filterSPs() {
    const searchTerm = document
      .getElementById("spSearchInput")
      .value.toLowerCase();

    if (!searchTerm) {
      // If search is empty and this is due to initial load, hide the dropdown
      // We'll keep the SPs loaded in the dropdown but hidden
      populateSPDropdown(allSPs, false);
      return;
    }

    // If user has typed something, show the dropdown with filtered results
    // Filter SPs based on name or ID containing the search term
    const filteredSPs = allSPs.filter(
      (sp) =>
        sp.name.toLowerCase().includes(searchTerm) ||
        sp.id.toLowerCase().includes(searchTerm)
    );

    // Show the dropdown with filtered results
    populateSPDropdown(filteredSPs, true);
  }

  /**
   * Handle SP selection from the dropdown
   * @param {Event} event - The click event
   */
  function selectSP(event) {
    event.preventDefault();

    const target = event.currentTarget;
    const spId = target.getAttribute("data-sp-id");
    const spName = target.getAttribute("data-sp-name");

    if (!spId || !spName) return;

    // Update the hidden input with the selected SP ID
    document.getElementById("addSPInstanceId").value = spId;

    // Update the display to show the selected SP
    document.getElementById(
      "selectedSPDisplay"
    ).innerHTML = `<strong>Selected:</strong> ${spName} <small class="text-muted">(${spId})</small>`;

    // Update the search input to show the selected SP
    document.getElementById("spSearchInput").value = spName;

    // Hide the dropdown
    document.getElementById("spDropdownContainer").classList.add("d-none");

    console.log(`Selected SP: ${spName} (${spId})`);

    // Fetch and populate versions for this SP
    fetchSPVersions(spId);
  }

  /**
   * Fetch versions for a specific SP and populate the version dropdown
   * @param {string} spId - The ID of the SP to fetch versions for
   */
  async function fetchSPVersions(spId) {
    if (!spId) return;

    // Show loading indicator
    const versionLoadingIndicator = document.getElementById(
      "versionLoadingIndicator"
    );
    const versionSelect = document.getElementById("addSPInstanceVersion");

    versionLoadingIndicator.classList.remove("d-none");
    versionSelect.disabled = true;

    try {
      // Call the API endpoint to get versions for this SP
      const response = await fetch(`/api/sps/versions/${spId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch versions for SP ${spId}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.versions)) {
        // Reset the select element
        versionSelect.innerHTML =
          '<option value="" disabled selected>Select a version...</option>';

        // Add options for each version
        data.versions.forEach((version) => {
          const option = document.createElement("option");
          option.value = version;
          option.textContent = version;
          versionSelect.appendChild(option);
        });

        // Enable the select if we have versions
        versionSelect.disabled = data.versions.length === 0;

        // Show message if no versions
        if (data.versions.length === 0) {
          const option = document.createElement("option");
          option.disabled = true;
          option.selected = true;
          option.textContent = "No versions available";
          versionSelect.appendChild(option);
        }
      } else {
        console.error(
          "API returned success=false or invalid versions array",
          data
        );
        versionSelect.innerHTML =
          '<option value="" disabled selected>Error loading versions</option>';
      }
    } catch (error) {
      console.error(`Error fetching versions for SP ${spId}:`, error);
      versionSelect.innerHTML =
        '<option value="" disabled selected>Error loading versions</option>';
    } finally {
      // Hide loading indicator
      versionLoadingIndicator.classList.add("d-none");
      versionSelect.disabled = false;
    }
  }

  // Helper function to find a GP instance by ID in the tree data
  /**
   * Find an asset by its ID in the CIS plan data
   * @param {string} assetId - The ID of the asset to find
   * @param {object} [data] - Optional data object to search in, defaults to cisPlanData
   * @returns {object|null} - The asset object or null if not found
   */
  function findAssetById(assetId, data) {
    console.log(`Looking for Asset with ID: ${assetId}`);

    // Use provided data or fall back to cisPlanData global
    const searchData = data || window.cisPlanData;
    if (!searchData || !searchData.missionNetworks) {
      console.warn("No data available to search for asset");
      return null;
    }

    // Loop through mission networks
    for (const missionNetwork of searchData.missionNetworks) {
      if (!missionNetwork.networkSegments) continue;

      for (const segment of missionNetwork.networkSegments) {
        if (!segment.securityDomains) continue;

        for (const domain of segment.securityDomains) {
          if (!domain.hwStacks) continue;

          for (const stack of domain.hwStacks) {
            if (!stack.assets) continue;

            for (const asset of stack.assets) {
              if (asset.id === assetId) {
                console.log(`Found Asset: ${assetId}`, asset);
                return asset;
              }
            }
          }
        }
      }
    }

    console.warn(`Asset ${assetId} not found in data model`);
    return null;
  }

  /**
   * Find a GP instance by its ID, gpid, or guid
   * @param {string} gpInstanceId - The ID, gpid, or guid of the GP instance to find
   * @param {object} [data] - Optional data object to search in, defaults to cisPlanData
   * @returns {object|null} - The GP instance object or null if not found
   */
  function findGPInstanceById(gpInstanceId, data) {
    console.log(`Looking for GP instance with ID: ${gpInstanceId}`);

    // Use provided data or fall back to cisPlanData global
    const searchData = data || window.cisPlanData;
    if (!searchData || !searchData.missionNetworks) {
      console.warn("No data available to search for GP instance");
      return null;
    }

    // Loop through mission networks
    for (const missionNetwork of searchData.missionNetworks) {
      // Use networkSegments (correct property name) instead of segments
      if (!missionNetwork.networkSegments) continue;

      for (const segment of missionNetwork.networkSegments) {
        if (!segment.securityDomains) continue;

        for (const domain of segment.securityDomains) {
          if (!domain.hwStacks) continue;

          for (const stack of domain.hwStacks) {
            if (!stack.assets) continue;

            for (const asset of stack.assets) {
              if (!asset.gpInstances) continue;

              for (const gpInstance of asset.gpInstances) {
                // Check all possible ID fields: id, gpid, guid
                if (
                  gpInstance.id === gpInstanceId ||
                  gpInstance.gpid === gpInstanceId ||
                  gpInstance.guid === gpInstanceId
                ) {
                  console.log(`Found GP instance: ${gpInstanceId}`, gpInstance);
                  return gpInstance;
                }
              }
            }
          }
        }
      }
    }

    console.warn(`GP instance ${gpInstanceId} not found in data model`);
    return null;
  }

  /**
   * Find a GP instance by its parent asset ID
   * @param {string} assetId - The parent asset ID to search for
   * @param {object} [data] - Optional data object to search in, defaults to cisPlanData
   * @returns {object|null} - The first found GP instance or null if none found
   */
  function findGPInstanceByParentAsset(assetId, data = window.cisPlanData) {
    console.log(`Looking for GP instances under asset ID: ${assetId}`);

    // Validate inputs
    if (!assetId || !data || !data.missionNetworks) {
      console.warn("Invalid input to findGPInstanceByParentAsset");
      return null;
    }

    // Search through the data structure
    for (const mn of data.missionNetworks) {
      if (!mn.networkSegments) continue;

      for (const segment of mn.networkSegments) {
        if (!segment.securityDomains) continue;

        for (const domain of segment.securityDomains) {
          if (!domain.hwStacks) continue;

          for (const hwStack of domain.hwStacks) {
            if (!hwStack.assets) continue;

            for (const asset of hwStack.assets) {
              // Check if this is the asset we're looking for
              if (asset.id === assetId) {
                // Found the asset, return the first GP instance if any exist
                if (asset.gpInstances && asset.gpInstances.length > 0) {
                  console.log(
                    "Found GP instance under asset",
                    assetId,
                    ":",
                    asset.gpInstances[0]
                  );
                  return asset.gpInstances[0];
                } else {
                  console.log(
                    "Asset found but it has no GP instances:",
                    assetId
                  );
                  return null;
                }
              }
            }
          }
        }
      }
    }

    console.log("Asset not found:", assetId);
    return null;
  }

  // * Update a GP instance in the CIS plan data model
  //    * This is used after adding SP instances to ensure the model stays in sync
  //    */
  function updateGPInstanceInCISPlanData(gpInstanceId, updatedGpInstance) {
    // Traverse the CIS plan data to find the GP instance
    if (!window.cisPlanData || !window.cisPlanData.missionNetworks)
      return false;

    const missionNetworks = window.cisPlanData.missionNetworks;

    // Search through each mission network
    for (const mn of missionNetworks) {
      if (!mn.networkSegments) continue;

      for (const segment of mn.networkSegments) {
        if (!segment.securityDomains) continue;

        for (const domain of segment.securityDomains) {
          if (!domain.hwStacks) continue;

          for (const hwStack of domain.hwStacks) {
            if (!hwStack.assets) continue;

            for (const asset of hwStack.assets) {
              if (!asset.gpInstances) continue;

              // Look for the GP instance
              for (let i = 0; i < asset.gpInstances.length; i++) {
                if (
                  asset.gpInstances[i].id === gpInstanceId ||
                  asset.gpInstances[i].gpid === gpInstanceId
                ) {
                  // Found it - update it
                  asset.gpInstances[i] = {
                    ...asset.gpInstances[i],
                    ...updatedGpInstance,
                  };
                  console.log(
                    "Updated GP instance in data model:",
                    asset.gpInstances[i]
                  );
                  return true;
                }
              }
            }
          }
        }
      }
    }

    return false;
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

  async function deleteItem() {
    const type = document.getElementById("deleteItemType").value;
    const id = document.getElementById("deleteItemId").value;
    const name = document.getElementById("deleteItemName").textContent;
    let parentId = document.getElementById("deleteItemParentId").value;
    let stateToRestore;

    // Enhanced debugging
    console.log("About to delete item with:", {
      type,
      id,
      name,
      parentId,
    });

    // For SP instances, validate that we have a valid GP instance ID (not null, undefined, or the string 'null')
    if (type === "spInstances") {
      console.log("Checking parentId string:", parentId);
      console.log(
        "Last cached GP instance ID:",
        window.lastGpInstanceIdForDeletion
      );

      // Check for typical problems in the parentId string
      const hasNullInString = parentId && parentId.includes(",null");
      const hasUndefinedInString = parentId && parentId.includes(",undefined");
      const endsWithComma = parentId && parentId.endsWith(",");

      // If any problem is detected, try to fix it
      if (hasNullInString || hasUndefinedInString || endsWithComma) {
        console.error(
          "Invalid GP instance ID detected in parentId string:",
          parentId
        );

        // IMPROVED: Check both possible sources for the GP instance ID
        let correctGpId =
          window.lastGpInstanceIdForDeletion || window.currentGpInstanceId;

        console.log("Using backup GP instance ID:", correctGpId);

        if (correctGpId) {
          // Parse the existing parentId to get the first 5 values
          const parts = parentId.split(",");
          const validParts = parts
            .slice(0, 5)
            .filter((part) => part && part !== "null" && part !== "undefined");

          // Reconstruct with the valid GP instance ID
          if (validParts.length === 5) {
            parentId = [...validParts, correctGpId].join(",");
            console.log("Fixed parentId:", parentId);
          } else {
            console.error("Could not parse parentId string correctly");
            showToast("Error: Invalid parent ID format", "danger");
            return; // Exit function
          }
        } else {
          // No valid GP instance ID available - cannot proceed
          console.error(
            "Cannot delete SP instance without a valid GP instance ID"
          );
          showToast(
            "Error: Cannot delete SP instance without a valid parent GP instance ID",
            "danger"
          );
          return; // Exit function
        }
      }
    }

    // Deleting item
    try {
      // FINAL VALIDATION: For SP instances only, ensure the GP instance ID is in the parentId
      if (type === "spInstances") {
        // Parse the parentId string into its components
        const parts = parentId.split(",");

        // Check if the GP instance ID (6th element) is missing or invalid
        if (
          parts.length < 6 ||
          !parts[5] ||
          parts[5] === "null" ||
          parts[5] === "undefined"
        ) {
          console.log(
            "FINAL VALIDATION: Missing or invalid GP instance ID in parentId string"
          );

          // Try to get the GP instance ID from our backup sources
          const validGpId =
            window.lastGpInstanceIdForDeletion || window.currentGpInstanceId;

          if (validGpId) {
            console.log(
              "FINAL VALIDATION: Using backup GP instance ID:",
              validGpId
            );

            // If we have at least 5 parts (up to asset ID), add the GP instance ID
            if (parts.length >= 5) {
              parentId = parts.slice(0, 5).join(",") + "," + validGpId;
              console.log("FINAL VALIDATION: Fixed parentId:", parentId);
            }
          }
        }
      }

      // Call the API to delete the item - EXPLICITLY pass the parentId to ensure it's included
      console.log("Making API call with final parentId:", parentId);
      const apiResult = await CISApi.deleteItem(type, id, parentId || "");

      if (apiResult.success) {
        // Close the modal using CISUtils helper for consistent modal handling
        closeDeleteModal();

        // Show success message
        showToast(`${name} deleted successfully!`);

        // ADD THIS CODE: Reset CISPlanPointer state to properly clear the detail panel after deletion
        if (type === "missionNetworks") {
          // If we're deleting a mission network, navigate to the root
          console.log(
            "Resetting CISPlanPointer state to root after mission network deletion"
          );
          CISPlanPointer.resetState();

          // Set current to root node for consistency
          CISPlanPointer.updateState("root", "L0", "root-cisplan", "CIS Plan", {
            id: "root-cisplan",
            name: "CIS Plan",
            type: "root",
          });

          console.log(
            "CISPlanPointer state after reset:",
            CISPlanPointer.getState()
          );

          // IMPORTANT: Update stateToRestore to use the root node instead of the deleted mission network
          stateToRestore = {
            nodeType: "root",
            nodeId: "root-cisplan",
            // Add this line to explicitly set this as a root-level element
            isRootLevel: true,
          };

          console.log("Updated stateToRestore to root:", stateToRestore);
          // Call refresh panels directly with the root state
          try {
            await refreshPanelsWithState(stateToRestore);
            // Return early to prevent the regular refresh logic
            return;
          } catch (error) {
            console.error(
              "Error updating tree after mission network deletion:",
              error
            );
            showToast(
              "Mission network was deleted, but there was a problem updating the display",
              "warning"
            );
            return;
          }
        }
        // Special handling for network interfaces, GP instances, and SP instances
        if (
          type === "networkInterfaces" ||
          type === "gpInstances" ||
          type === "spInstances"
        ) {
          // For network interfaces, GP instances, and SP instances, extract parent IDs from the comma-separated string
          const parentIds = parentId.split(",");

          if (type === "spInstances") {
            // For SP instances, we need to ensure we navigate directly to the GP instance view
            // Get the GP Instance ID from the parentIds array or from our backup source
            const gpInstanceId =
              parentIds[5] ||
              window.lastGpInstanceIdForDeletion ||
              window.currentGpInstanceId;
            console.log(
              "Preparing to restore to GP instance after SP deletion:",
              gpInstanceId
            );

            // Set up the complete state including all parent references
            stateToRestore = {
              nodeType: "gpInstances", // We're targeting a GP instance
              nodeId: gpInstanceId, // The GP instance ID to restore to
              // All parent references for the hierarchy
              assetId: parentIds[4],
              hwStackId: parentIds[3],
              domainId: parentIds[2],
              segmentId: parentIds[1],
              missionNetworkId: parentIds[0],
              // Special flag to indicate this is an SP instance deletion
              fromSpDeletion: true,
            };
          } else {
            // For network interfaces and GP instances, restore to the parent asset
            stateToRestore = {
              nodeType: "assets",
              nodeId: parentIds[4], // assetId is at index 4
              hwStackId: parentIds[3],
              domainId: parentIds[2],
              segmentId: parentIds[1],
              missionNetworkId: parentIds[0],
            };
          }
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

  // TREE RENDERING & MANIPULATION

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

        // Update the CISPlanPointer with the root node selection
        CISPlanPointer.handleTreeClick(this, { name: "CIS Plan" }, "root", {});

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

          // Update the CISPlanPointer with the mission network selection
          CISPlanPointer.handleTreeClick(
            this,
            missionNetwork,
            "missionNetwork",
            {}
          );

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

          // Update the CISPlanPointer with the network segment selection
          CISPlanPointer.handleTreeClick(this, segment, "networkSegment", {
            missionNetwork: parentMissionNetwork
              ? typeof parentMissionNetwork === "object"
                ? parentMissionNetwork.id
                : parentMissionNetwork
              : null,
          });

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

          // Update the CISPlanPointer with the security domain selection
          CISPlanPointer.handleTreeClick(this, domain, "securityDomain", {
            missionNetwork: parentMissionNetwork
              ? parentMissionNetwork.id
              : null,
            networkSegment: parentSegment ? parentSegment.id : null,
          });

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

          // Update the CISPlanPointer with the hardware stack selection
          CISPlanPointer.handleTreeClick(this, stack, "hwStack", {
            missionNetwork: parentMissionNetwork
              ? parentMissionNetwork.id
              : null,
            networkSegment: parentSegment ? parentSegment.id : null,
            securityDomain: parentDomain ? parentDomain.id : null,
          });

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

        // Update the CISPlanPointer with the asset selection
        CISPlanPointer.handleTreeClick(this, asset, "asset", {
          missionNetwork: parentMissionNetwork
            ? typeof parentMissionNetwork === "object"
              ? parentMissionNetwork.id
              : parentMissionNetwork
            : null,
          networkSegment: parentSegment
            ? typeof parentSegment === "object"
              ? parentSegment.id
              : parentSegment
            : null,
          securityDomain: parentDomain
            ? typeof parentDomain === "object"
              ? parentDomain.id
              : parentDomain
            : null,
          hwStack: parentStack
            ? typeof parentStack === "object"
              ? parentStack.id
              : parentStack
            : null,
        });

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

          // Update the CISPlanPointer with the network interface selection
          CISPlanPointer.handleTreeClick(
            this,
            networkInterface,
            "networkInterface",
            {
              missionNetwork: parentMissionNetwork
                ? typeof parentMissionNetwork === "object"
                  ? parentMissionNetwork.id
                  : parentMissionNetwork
                : null,
              networkSegment: parentSegment
                ? typeof parentSegment === "object"
                  ? parentSegment.id
                  : parentSegment
                : null,
              securityDomain: parentDomain
                ? typeof parentDomain === "object"
                  ? parentDomain.id
                  : parentDomain
                : null,
              hwStack: parentStack
                ? typeof parentStack === "object"
                  ? parentStack.id
                  : parentStack
                : null,
              asset: parentAsset
                ? typeof parentAsset === "object"
                  ? parentAsset.id
                  : parentAsset
                : null,
            }
          );

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
    // Validate that this is actually a GP ID and not an asset ID or other ID type
    if (!gpid || typeof gpid !== "string") {
      console.warn(`Invalid GP ID format: ${gpid}`);
      return null;
    }

    // Check if this looks like a GP ID (should start with GP-)
    if (!gpid.startsWith("GP-")) {
      console.warn(
        `ID ${gpid} doesn't appear to be a valid GP ID (doesn't start with GP-). Skipping API call.`
      );
      return `Generic Product`; // Return a generic name instead of null to avoid UI issues
    }

    try {
      const response = await fetch(`/api/gps/${gpid}/name`);
      if (response.ok) {
        const result = await response.json();
        return result.name;
      } else {
        console.warn(
          `API returned non-OK response for GP name fetch: ${response.status}`
        );
      }
    } catch (error) {
      console.error(`Error fetching GP name: ${error}`);
    }
    return `GP ${gpid.substring(3)}`; // Return a formatted version of the ID as fallback
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
    gpInstances.forEach((gpInstance) => {
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
      // IMPORTANT: For GP instances, use gpid as the data-id instead of id, to prevent confusion
      // when navigating in the tree. The gpid is what we use consistently elsewhere.
      const gpInstanceNode = createTreeNode(
        "gpInstances",
        displayText,
        gpInstance.gpid || gpInstance.id, // Use gpid for the data-id attribute, fall back to id if not available
        gpInstance.guid,
        "fa-cogs"
      );

      // Store the actual id as data-instance-id for reference
      gpInstanceNode.setAttribute("data-instance-id", gpInstance.id);

      // Store the display name as a data attribute for reference in the details panel
      gpInstanceNode.setAttribute("data-display-name", displayText);

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

      // CRITICAL: Set parent reference ID attributes (needed for deletion operations)
      // This is the critical difference from network interfaces - these ID-suffixed attributes are needed
      gpInstanceNode.setAttribute(
        "data-parent-asset-id",
        typeof parentAsset === "object" ? parentAsset.id : parentAsset
      );
      gpInstanceNode.setAttribute(
        "data-parent-stack-id",
        typeof parentStack === "object" ? parentStack.id : parentStack
      );
      gpInstanceNode.setAttribute(
        "data-parent-domain-id",
        typeof parentDomain === "object" ? parentDomain.id : parentDomain
      );
      gpInstanceNode.setAttribute(
        "data-parent-segment-id",
        typeof parentSegment === "object" ? parentSegment.id : parentSegment
      );
      gpInstanceNode.setAttribute(
        "data-parent-mission-network-id",
        typeof parentMissionNetwork === "object"
          ? parentMissionNetwork.id
          : parentMissionNetwork
      );

      // Also store the references directly on the gpInstance object, like we do for network interfaces
      gpInstance.parentAsset = parentAsset;
      gpInstance.parentStack = parentStack;
      gpInstance.parentDomain = parentDomain;
      gpInstance.parentSegment = parentSegment;
      gpInstance.parentMissionNetwork = parentMissionNetwork;

      container.appendChild(gpInstanceNode);

      // Create children container for SP instances
      const childrenContainer = document.createElement("div");
      childrenContainer.className = "tree-node-children ms-4 ps-2 border-start";
      childrenContainer.style.display = "none"; // Hidden by default
      container.appendChild(childrenContainer);

      // Add toggle functionality
      gpInstanceNode
        .querySelector(".tree-toggle")
        .addEventListener("click", function (e) {
          e.stopPropagation();
          const toggleIcon = this.querySelector("i");
          const isExpanded = childrenContainer.style.display === "block";

          // Toggle children visibility
          childrenContainer.style.display = isExpanded ? "none" : "block";

          // Toggle icon
          toggleIcon.className = isExpanded
            ? "fas fa-chevron-right"
            : "fas fa-chevron-down";

          // If expanding and we have SP instances, render them
          if (
            !isExpanded &&
            gpInstance.spInstances &&
            gpInstance.spInstances.length > 0
          ) {
            // Render SP instances inside the children container
            renderSPInstances(
              childrenContainer,
              gpInstance.spInstances,
              gpInstance,
              parentAsset,
              parentStack,
              parentDomain,
              parentSegment,
              parentMissionNetwork
            );
          }
        });

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

          // Create a proper GP instance object to pass to loadSelectedNodeChildren
          // Make sure we're passing the actual GP instance ID, not the asset ID
          const gpInstanceData = {
            ...gpInstance,
            // CRITICAL: For tree node clicks, pass gpid as the main id to ensure consistency
            // Retrieve the actual gpid that was used as data-id when creating the tree node
            id: this.getAttribute("data-id"), // This is now the gpid based on our changes to createTreeNode
            // Also store the actual instance ID as a separate property
            instanceId: gpInstance.id,
            // Double ensure gpid is correct
            gpid: gpInstance.gpid || this.getAttribute("data-id") || null,
            guid: gpInstance.guid || null,
            // Make sure the type is explicitly set
            type: "gpInstances",
          };

          // Update the CISPlanPointer with the GP instance selection
          CISPlanPointer.handleTreeClick(this, gpInstanceData, "gpInstance", {
            missionNetwork: parentMissionNetwork
              ? typeof parentMissionNetwork === "object"
                ? parentMissionNetwork.id
                : parentMissionNetwork
              : null,
            networkSegment: parentSegment
              ? typeof parentSegment === "object"
                ? parentSegment.id
                : parentSegment
              : null,
            securityDomain: parentDomain
              ? typeof parentDomain === "object"
                ? parentDomain.id
                : parentDomain
              : null,
            hwStack: parentStack
              ? typeof parentStack === "object"
                ? parentStack.id
                : parentStack
              : null,
            asset: parentAsset
              ? typeof parentAsset === "object"
                ? parentAsset.id
                : parentAsset
              : null,
          });

          console.log(
            "Clicked GP instance tree node, passing data with gpid:",
            gpInstanceData.id,
            gpInstanceData
          );

          // CRITICAL FIX: When calling loadSelectedNodeChildren for GP instances,
          // we need to make sure we're not passing the asset as the first parent parameter.
          // Instead, we'll pass the GP ID explicitly as the first parameter to ensure
          // that when loadGPInstanceChildren receives this in parentData[0], it's the correct GP ID.
          loadSelectedNodeChildren(
            gpInstanceData,
            "gpInstances",
            gpInstanceData.gpid, // Pass GP ID as first parameter instead of asset ID
            parentAsset,
            parentStack,
            parentDomain,
            parentSegment,
            parentMissionNetwork
          );

          // Also set the global window.currentGpInstanceId for consistency
          window.currentGpInstanceId = gpInstanceData.gpid || gpInstanceData.id;
        }
      });
    });
  }

  // Render SP instances under a GP instance
  function renderSPInstances(
    container,
    spInstances,
    parentGPInstance,
    parentAsset,
    parentStack,
    parentDomain,
    parentSegment,
    parentMissionNetwork
  ) {
    // Clear existing children to avoid duplicates
    container.innerHTML = "";

    if (!spInstances || spInstances.length === 0) {
      const noItemsMessage = document.createElement("div");
      noItemsMessage.className = "text-muted small p-2";
      noItemsMessage.textContent = "No SP instances";
      container.appendChild(noItemsMessage);
      return;
    }

    // Render each SP instance
    spInstances.forEach((spInstance) => {
      // Initial display name using SP ID and version
      const initialDisplayName = `SP-${spInstance.spId} v${spInstance.spVersion}`;

      // Create the tree node with initial display name
      const spInstanceNode = createTreeNode(
        "spInstances",
        initialDisplayName,
        spInstance.id,
        spInstance.guid,
        "fa-cogs"
      );

      // Set parent references for proper navigation
      spInstanceNode.setAttribute(
        "data-parent-gp-instance",
        typeof parentGPInstance === "object"
          ? parentGPInstance.id
          : parentGPInstance
      );

      spInstanceNode.setAttribute(
        "data-parent-asset",
        typeof parentAsset === "object" ? parentAsset.id : parentAsset
      );

      spInstanceNode.setAttribute(
        "data-parent-stack",
        typeof parentStack === "object" ? parentStack.id : parentStack
      );

      spInstanceNode.setAttribute(
        "data-parent-domain",
        typeof parentDomain === "object" ? parentDomain.id : parentDomain
      );

      spInstanceNode.setAttribute(
        "data-parent-segment",
        typeof parentSegment === "object" ? parentSegment.id : parentSegment
      );

      spInstanceNode.setAttribute(
        "data-parent-mission-network",
        typeof parentMissionNetwork === "object"
          ? parentMissionNetwork.id
          : parentMissionNetwork
      );

      // Add the node to the container
      container.appendChild(spInstanceNode);

      // Fetch SP name and update the node text asynchronously
      if (spInstance.spId) {
        (async function () {
          try {
            const response = await fetch(`/api/sps/name/${spInstance.spId}`);
            if (response.ok) {
              const result = await response.json();

              if (result.success && result.name) {
                // Format display name with SP name and version in parentheses
                let displayName = result.name;
                if (spInstance.spVersion) {
                  displayName = `${result.name} (v${spInstance.spVersion})`;
                }

                // Find the name element inside the tree node and update it
                const nameElement = spInstanceNode.querySelector(".node-text");
                if (nameElement) {
                  nameElement.textContent = displayName;
                }
              }
            }
          } catch (error) {
            console.error(
              `Error fetching SP name for ${spInstance.spId}:`,
              error
            );
          }
        })();
      }

      // Add click event to handle selection
      spInstanceNode.addEventListener("click", function (e) {
        e.stopPropagation();

        // Check if this node is already active
        const isActive = this.classList.contains("active");

        // Remove active class from all nodes
        document.querySelectorAll(".tree-node.active").forEach((node) => {
          node.classList.remove("active");
        });

        // If this node wasn't active before, make it active and load its data
        if (!isActive) {
          this.classList.add("active");
          currentTreeNode = this;

          // Set current element (important for the detail panel)
          currentElement = spInstance;
          currentElement.type = "spInstances";

          // Get the parent GP instance ID from the tree node and add it to the currentElement
          const gpInstanceId = this.getAttribute("data-parent-gp-instance");
          console.log(
            "Tree node click - GP instance ID for this SP instance:",
            gpInstanceId
          );

          // Update the CISPlanPointer with the SP instance selection
          CISPlanPointer.handleTreeClick(this, spInstance, "spInstance", {
            missionNetwork: parentMissionNetwork
              ? typeof parentMissionNetwork === "object"
                ? parentMissionNetwork.id
                : parentMissionNetwork
              : null,
            networkSegment: parentSegment
              ? typeof parentSegment === "object"
                ? parentSegment.id
                : parentSegment
              : null,
            securityDomain: parentDomain
              ? typeof parentDomain === "object"
                ? parentDomain.id
                : parentDomain
              : null,
            hwStack: parentStack
              ? typeof parentStack === "object"
                ? parentStack.id
                : parentStack
              : null,
            asset: parentAsset
              ? typeof parentAsset === "object"
                ? parentAsset.id
                : parentAsset
              : null,
            gpInstance: parentGPInstance
              ? typeof parentGPInstance === "object"
                ? parentGPInstance.gpid || parentGPInstance.id
                : parentGPInstance
              : gpInstanceId,
          });

          // Always set the parent GP instance ID, even if we have to look in multiple places
          if (gpInstanceId) {
            currentElement.parentGpInstance = gpInstanceId;
          } else if (spInstance.parentGpInstance) {
            // Use the value already on the SP instance
            console.log(
              "Using parentGpInstance from spInstance object:",
              spInstance.parentGpInstance
            );
          } else if (window.currentGpInstanceId) {
            // Fall back to global context if available
            currentElement.parentGpInstance = window.currentGpInstanceId;
            console.log(
              "Using currentGpInstanceId from window:",
              window.currentGpInstanceId
            );
          }

          // Update the detail panel
          updateDetailPanel(spInstance, "spInstances");
        }
      });
    });
  }

  // PANEL RENDERING & ELEMENT DISPLAY

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
    // Special handling for GP instances - we want to show SP instances, not configuration items
    if (nodeType === "gpInstances") {
      loadGPInstanceChildren(nodeData, ...parentData);
      return;
    }

    // Special handling for SP instances - they don't have children, just show details
    if (nodeType === "spInstances") {
      // Clear the elements container
      if (elementsContainer) {
        elementsContainer.innerHTML = "";
      }

      // Set current element to this SP instance
      currentElement = nodeData;
      currentElement.type = "spInstances";

      // Update the detail panel with SP instance details
      updateDetailPanel(currentElement, "spInstances");
      return;
    }
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

    // Generate appropriate title based on the node type
    let elementTypeText = "";

    // Get the formatted element type name for the title
    if (nodeType === "root-cisplan") {
      elementTypeText = "CIS Plan";
    } else if (nodeType === "missionNetworks") {
      elementTypeText = "Mission Networks";
    } else if (nodeType === "networkSegments") {
      elementTypeText = "Network Segments";
    } else if (nodeType === "securityDomains") {
      elementTypeText = "Security Domains";
    } else if (nodeType === "hwStacks") {
      elementTypeText = "Hardware Stacks";
    } else if (nodeType === "assets") {
      elementTypeText = "Assets";
    } else if (nodeType === "networkInterfaces") {
      elementTypeText = "Network Interfaces";
    } else if (nodeType === "gpInstances") {
      elementTypeText = "Generic Products";
    } else if (nodeType === "spInstances") {
      elementTypeText = "Specific Products";
    } else {
      elementTypeText = formatNodeTypeName(nodeType);
    }

    // Also update the main elements title at the top of the panel
    const mainElementsTitle = document.getElementById("elementsTitle");
    if (mainElementsTitle) {
      mainElementsTitle.textContent = `CIS Plan - ${elementTypeText}`;
    }

    // Create icon element for breadcrumb
    titleDiv.innerHTML = `
            <img src="${iconPath}" alt="${nodeType}" class="icon-small me-2" style="width: 20px; height: 20px;">
            <span>${displayName} - ${elementTypeText}</span>
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
        renderElementCards(
          networkInterfacesContainer,
          nodeData.networkInterfaces,
          "networkInterfaces"
        );
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
        renderElementCards(
          gpInstancesContainer,
          nodeData.gpInstances,
          "gpInstances"
        );
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
    console.log("renderElementCards called with", {
      containerExists: !!container,
      elementsCount: elements?.length || 0,
      type: type
    });
    
    // First, clear the container
    container.innerHTML = "";
    console.log("Container cleared");

    // Create a sticky header for the Assets list if we're on a scrollable list
    if (type === "assets") {
      // Create sticky header with just the title (no add button - using the global one instead)
      const stickyHeader = document.createElement("div");
      stickyHeader.className =
        "sticky-top bg-light mb-2 p-2 d-flex justify-content-between align-items-center border-bottom";
      stickyHeader.style.zIndex = "100";

      // Create title in sticky header
      const headerTitle = document.createElement("h5");
      headerTitle.className = "m-0";
      headerTitle.textContent = `Assets (${elements.length})`;
      stickyHeader.appendChild(headerTitle);

      // Note: We're removing the redundant Add Asset button here as the main green Add button
      // already provides this functionality

      container.appendChild(stickyHeader);

      // For assets, use an even more compact list view
      const compactList = document.createElement("div");
      compactList.className = "compact-asset-list";
      compactList.style.overflow = "auto"; // Enable scrolling if needed
      container.appendChild(compactList);

      // Create a grid layout for more condensed view with minimal gaps
      const grid = document.createElement("div");
      grid.className = "row row-cols-2 row-cols-md-3 row-cols-lg-3 g-1"; // Smallest gap
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
          "asset-item p-1 border rounded d-flex align-items-center"; // Reduced padding
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
                    <div class="asset-name text-truncate" style="font-size: 0.85rem;">${element.name}</div>
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

          // Use the CISPlanPointer to handle the central panel element click
          // This will update the selected element in the pointer system
          console.log("Asset clicked in central panel:", element);

          if (!currentTreeNode) {
            console.warn(
              "currentTreeNode is not defined when clicking asset in central panel!"
            );
            // In this case, we can't get parent references from the currentTreeNode
            // Let's try to find the tree node that corresponds to this asset
            const assetTreeNode = document.querySelector(
              `.tree-node[data-type="asset"][data-id="${element.id}"]`
            );

            if (assetTreeNode) {
              console.log(
                "Found corresponding tree node for asset:",
                assetTreeNode
              );
              // Use this node instead
              CISPlanPointer.handleCentralPanelClick(
                element,
                type,
                assetTreeNode
              );
            } else {
              console.warn(
                "Could not find corresponding tree node for asset:",
                element.id
              );
              // Just update with the element itself, no parent references
              CISPlanPointer.updateSelectedOnly(
                type,
                "L1.1.1.1.1",
                element.id,
                element.name,
                element,
                {}
              );
            }
          } else {
            console.log("Current tree node:", currentTreeNode);
            console.log(
              "currentTreeNode type:",
              currentTreeNode.getAttribute("data-type")
            );
            console.log(
              "currentTreeNode parent-stack:",
              currentTreeNode.getAttribute("data-parent-stack")
            );
            console.log(
              "currentTreeNode parent-domain:",
              currentTreeNode.getAttribute("data-parent-domain")
            );
            console.log(
              "currentTreeNode parent-segment:",
              currentTreeNode.getAttribute("data-parent-segment")
            );
            console.log(
              "currentTreeNode parent-mission-network:",
              currentTreeNode.getAttribute("data-parent-mission-network")
            );

            // Pass detailed information to the pointer
            CISPlanPointer.handleCentralPanelClick(
              element,
              type,
              currentTreeNode
            );
          }

          // Update detail panel
          updateDetailPanel(element, type);
        });

        // Add double-click handler for drill-down navigation
        assetItem.addEventListener("dblclick", function (event) {
          // For GP instances, use the gpid instead of id to correctly find the tree node
          if (type === "gpInstances" && element.gpid) {
            console.log(
              "Double-click on GP instance card, using gpid for tree navigation:",
              element.gpid
            );
            findAndSelectTreeNode(type, element.gpid);
          } else {
            // For other types, use the regular id
            findAndSelectTreeNode(type, element.id);
          }
        });

        col.appendChild(assetItem);
        grid.appendChild(col);
      });

      return; // Exit early since we've handled the assets case specially
    }

    // For all non-asset types, also use the compact approach similar to assets
    // Create title header for the element type
    const stickyHeader = document.createElement("div");
    stickyHeader.className =
      "sticky-top bg-light mb-2 p-2 d-flex justify-content-between align-items-center border-bottom";
    stickyHeader.style.zIndex = "100";

    // Format the type name for display (e.g., "networkInterfaces" -> "Network Interfaces")
    const formattedType = type
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/([a-z])([A-Z])/g, "$1 $2");

    // Create title in sticky header
    const headerTitle = document.createElement("h5");
    headerTitle.className = "m-0";
    headerTitle.textContent = `${formattedType} (${elements.length})`;
    stickyHeader.appendChild(headerTitle);

    container.appendChild(stickyHeader);

    // Create compact layout container
    const compactList = document.createElement("div");
    compactList.className = "compact-element-list";
    compactList.style.overflow = "auto"; // Enable scrolling if needed
    container.appendChild(compactList);

    // Create a grid layout for more condensed view with minimal gaps
    const grid = document.createElement("div");
    grid.className = "row row-cols-2 row-cols-md-3 row-cols-lg-3 g-1"; // Smallest gap
    compactList.appendChild(grid);

    // Store current selected element ID if there is one
    let selectedElementId = "";
    if (currentElement && currentElement.id) {
      selectedElementId = currentElement.id;
    }

    // Render each element in a compact form
    elements.forEach((element) => {
      const col = document.createElement("div");
      col.className = "col";

      const itemElement = document.createElement("div");
      itemElement.className =
        "element-item p-1 border rounded d-flex align-items-center";
      if (selectedElementId === element.id) {
        itemElement.classList.add("active", "bg-primary", "text-white");
      }

      itemElement.setAttribute("data-type", type);
      itemElement.setAttribute("data-id", element.id);
      itemElement.setAttribute("data-guid", element.guid);

      // For gpInstances, networkInterfaces, or spInstances, add parent reference attributes for proper deletion
      if (
        type === "gpInstances" ||
        type === "networkInterfaces" ||
        type === "spInstances"
      ) {
        // Get parent references from the current tree node
        if (currentTreeNode) {
          // Add parent asset reference
          const assetId = currentTreeNode.getAttribute("data-id");
          if (assetId) {
            itemElement.setAttribute("data-parent-asset", assetId);
          }

          // Add other parent references from the tree
          const hwStackId = currentTreeNode.getAttribute("data-parent-stack");
          if (hwStackId) {
            itemElement.setAttribute("data-parent-stack", hwStackId);
          }

          const domainId = currentTreeNode.getAttribute("data-parent-domain");
          if (domainId) {
            itemElement.setAttribute("data-parent-domain", domainId);
          }

          const segmentId = currentTreeNode.getAttribute("data-parent-segment");
          if (segmentId) {
            itemElement.setAttribute("data-parent-segment", segmentId);
          }

          const mnId = currentTreeNode.getAttribute(
            "data-parent-mission-network"
          );
          if (mnId) {
            itemElement.setAttribute("data-parent-mission-network", mnId);
          }
        }
      }

      // Get the SVG icon for this element type
      const iconPath = getElementIcon(type);

      // Generate display content based on element type
      let displayName = element.name || "";

      // For security domains, look up the classification name
      if (type === "securityDomains") {
        const classification = getSecurityClassificationById(element.id);
        displayName = classification.name;
        // Store display name as data attribute
        itemElement.setAttribute("data-display-name", displayName);
      } else if (type === "networkInterfaces") {
        // For network interfaces, show name and IP address
        let ipAddress = "N/A";

        // Extract IP address from configuration items if available
        if (
          element.configurationItems &&
          Array.isArray(element.configurationItems)
        ) {
          // Look for IP Address configuration item
          element.configurationItems.forEach((item) => {
            if (item.Name === "IP Address" && item.AnswerContent) {
              ipAddress = item.AnswerContent;
            }
          });
        }

        // Display name and IP address
        displayName = `${element.name} - ${ipAddress}`;
        // Store display name as data attribute
        itemElement.setAttribute("data-display-name", displayName);
      } else if (type === "gpInstances") {
        // For GP instances, show the GP name based on gpid and instance label
        // Set initial value to the instance label or default text
        displayName = element.instanceLabel || `GP Instance ${element.id}`;

        // Store initial display name as data attribute
        itemElement.setAttribute("data-display-name", displayName);

        // If we have a gpid, fetch the actual GP name
        if (element.gpid) {
          // Fetch GP name asynchronously and update the element
          (async function () {
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

                // Find and update the element name span
                const nameSpan = itemElement.querySelector(".element-name");
                if (nameSpan) {
                  nameSpan.textContent = updatedText;
                }
                // Update the data attribute with the final display name
                itemElement.setAttribute("data-display-name", updatedText);
                // Update tooltip
                itemElement.setAttribute(
                  "title",
                  `${updatedText} (${element.id})`
                );
              }
            } catch (error) {
              console.error(
                `Error fetching GP name for ${element.gpid}:`,
                error
              );
            }
          })();
        }
      } else if (type === "spInstances") {
        // For SP instances, show the SP name from API and version
        // Set initial value using SP ID and version as placeholder
        displayName = `SP ${element.spId}`;
        if (element.spVersion) {
          displayName += ` v${element.spVersion}`;
        }

        // Store initial display name as data attribute
        itemElement.setAttribute("data-display-name", displayName);

        // If we have a spId, fetch the actual SP name
        if (element.spId) {
          // Fetch SP name asynchronously
          (async function () {
            try {
              const response = await fetch(`/api/sps/name/${element.spId}`);
              if (response.ok) {
                const result = await response.json();

                if (result.success && result.name) {
                  // Format display name - include SP name and version if available
                  let spName = result.name;
                  let updatedText = spName;

                  // If we have a version, add it in parentheses
                  if (element.spVersion) {
                    updatedText = `${spName} (v${element.spVersion})`;
                  }

                  // Find and update the element name span
                  const nameSpan = itemElement.querySelector(".element-name");
                  if (nameSpan) {
                    nameSpan.textContent = updatedText;
                  }
                  // Update the data attribute with the final display name
                  itemElement.setAttribute("data-display-name", updatedText);
                  // Update tooltip
                  itemElement.setAttribute(
                    "title",
                    `${updatedText} (${element.id})`
                  );
                }
              }
            } catch (error) {
              console.error(
                `Error fetching SP name for ${element.spId}:`,
                error
              );
            }
          })();
        }
      }

      // Create compact layout with icon and name (similar to assets)
      itemElement.innerHTML = `
        <img src="${iconPath}" width="20" height="20" alt="${type} icon" class="me-2">
        <div class="element-name text-truncate" style="font-size: 0.85rem;">${displayName}</div>
      `;

      // Add tooltip with full name and ID info
      itemElement.setAttribute("title", `${displayName} (${element.id})`);

      // For special types that need participant info, add it to the tooltip
      if (type === "hwStacks" && element.cisParticipantID) {
        // Asynchronously fetch and update the participant name
        (async function () {
          const participantName = await getParticipantNameByKey(
            element.cisParticipantID
          );
          if (participantName && participantName !== element.cisParticipantID) {
            const currentTitle = itemElement.getAttribute("title");
            itemElement.setAttribute(
              "title",
              `${currentTitle}\nParticipant: ${participantName}`
            );
          }
        })();
      }

      // Add click event
      itemElement.addEventListener("click", function () {
        // Remove active class from all items
        document.querySelectorAll(".element-item.active").forEach((item) => {
          item.classList.remove("active", "bg-primary", "text-white");
        });

        // Add active class to this item
        this.classList.add("active", "bg-primary", "text-white");

        // Store the selected element and its type
        currentElement = element;
        currentElement.type = type; // Store the type explicitly

        // Use the CISPlanPointer to handle the central panel element click
        // This will update the selected element in the pointer system
        CISPlanPointer.handleCentralPanelClick(element, type, currentTreeNode);

        // Update detail panel
        updateDetailPanel(element, type);

        // Enable edit and delete buttons
        if (editDetailButton) editDetailButton.disabled = false;
        if (deleteDetailButton) deleteDetailButton.disabled = false;
      });

      // Add double-click handler for drill-down navigation
      itemElement.addEventListener("dblclick", function (event) {
        // Prevent the click event from firing
        event.stopPropagation();

        // For leaf node types, don't try to drill down
        if (type === "networkInterfaces" || type === "spInstances") {
          return;
        }

        // For GP instances, use gpid for tree navigation instead of id
        if (type === "gpInstances" && element.gpid) {
          console.log(
            "Double-click on GP instance card, using gpid for tree navigation:",
            element.gpid
          );
          findAndSelectTreeNode(type, element.gpid);
        } else {
          // For other types, use the regular id
          findAndSelectTreeNode(type, element.id);
        }
      });

      col.appendChild(itemElement);
      grid.appendChild(col);

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
      } else if (type === "gpInstances" || type === "networkInterfaces") {
        // For GP instances and network interfaces, ensure parent asset and all hierarchy references are set
        // First check if we have info from the current tree node
        if (currentTreeNode) {
          // Set all parent references using only currentTreeNode since itemElement might not have these attributes yet
          element.parentAsset =
            currentTreeNode.getAttribute("data-parent-asset");
          element.parentStack =
            currentTreeNode.getAttribute("data-parent-stack");
          element.parentDomain =
            currentTreeNode.getAttribute("data-parent-domain");
          element.parentSegment = currentTreeNode.getAttribute(
            "data-parent-segment"
          );
          element.parentMissionNetwork = currentTreeNode.getAttribute(
            "data-parent-mission-network"
          );
        }
      }
    });
  }

  // Special function to handle children of GP instances (SP instances)
  // This function can be called in three ways:
  // 1. From tree node click - with gpInstance as a GP instance object with proper id/gpid
  // 2. From state restoration - with gpInstance as node data and parentData[0] as gpId string
  // 3. From SP-creation redirect with potentially incorrect IDs
  function loadGPInstanceChildren(gpInstance, ...parentData) {
    if (elementsContainer) {
      elementsContainer.innerHTML = "";
    }

    // Handle the different call patterns
    let gpInstanceId;
    let actualGpInstance = null;

    // First, determine the source of our GP instance data
    if (parentData.length > 0 && typeof parentData[0] === "string") {
      // This is a call from state restoration with explicit GP ID
      gpInstanceId = parentData[0];
      console.log("***** parentData *****", parentData);

      // CRITICAL FIX: Validate that parentData[0] is a GP ID, not an asset ID
      if (gpInstanceId.startsWith("AS-")) {
        console.warn("Received asset ID in parentData[0]:", gpInstanceId);
        // Check if we have a GP instance in the data, and a valid gpid property
        if (
          gpInstance &&
          typeof gpInstance === "object" &&
          gpInstance.gpid &&
          typeof gpInstance.gpid === "string" &&
          gpInstance.gpid.startsWith("GP-")
        ) {
          console.log(
            "Using gpid from gpInstance object instead:",
            gpInstance.gpid
          );
          gpInstanceId = gpInstance.gpid;
        } else {
          // Try to find the actual GP instance using the asset ID
          console.log("Trying to find GP instance by asset ID...");
          const foundGp = findGPInstanceByParentAsset(gpInstanceId);
          if (foundGp && foundGp.gpid) {
            console.log("Found GP instance by asset:", foundGp);
            gpInstanceId = foundGp.gpid;
          }
        }
      }

      console.log("Using GP ID after validation:", gpInstanceId);
    } else if (gpInstance && typeof gpInstance === "object") {
      // This is a regular call with a GP instance object
      // Check if the object itself is properly typed
      if (gpInstance.type === "gpInstances") {
        // We have a properly typed GP instance object
        // IMPORTANT: For tree node clicks, we now use gpid as id, to ensure consistency
        // After our tree node changes, gpInstance.id should already be the gpid, not the asset ID
        gpInstanceId = gpInstance.id; // This is now the gpid
        actualGpInstance = gpInstance;
        console.log(
          "Called loadGPInstanceChildren with properly typed GP instance, using ID:",
          gpInstanceId
        );
      } else {
        // We have an object but it might not be properly identified
        // Prioritize gpid over id if available
        gpInstanceId = gpInstance.gpid || gpInstance.id;
        console.log(
          "Called loadGPInstanceChildren with object, determined ID:",
          gpInstanceId
        );
      }
    } else {
      console.warn("Called loadGPInstanceChildren with invalid parameters");
      return; // Cannot proceed without valid data
    }

    // Validate the GP instance ID format
    if (gpInstanceId && typeof gpInstanceId === "string") {
      // Now that we're consistently using GP IDs (GP-xxxx) for GP instance nodes,
      // we can be more precise with our validation
      if (gpInstanceId.startsWith("GP-")) {
        // This is a valid GP ID format - proceed normally
        console.log("Confirmed valid GP ID format:", gpInstanceId);
      } else if (gpInstanceId.startsWith("AS-")) {
        // Legacy case: Still handle the case where we somehow got an asset ID
        console.warn(
          "Received an asset ID instead of a GP instance ID:",
          gpInstanceId
        );

        // Try to find the actual GP instance under this asset
        if (window.cisPlanData) {
          const foundGPInstance = findGPInstanceByParentAsset(
            gpInstanceId,
            window.cisPlanData
          );
          if (foundGPInstance) {
            console.log("Found related GP instance:", foundGPInstance.id);
            gpInstanceId = foundGPInstance.id;
            actualGpInstance = foundGPInstance;
          } else {
            // If we couldn't find a GP instance, we need to handle this gracefully
            console.warn(
              "Could not find a GP instance under asset",
              gpInstanceId
            );
            // Show a friendly message in the elements panel
            showNoElementsMessage(
              elementsContainer,
              "No Generic Products found for this asset."
            );
            return;
          }
        }
      }
    } else {
      console.warn("Invalid GP instance ID:", gpInstanceId);
      return; // Cannot proceed without valid ID
    }

    // Store the current GP instance ID globally for SP instance deletion context
    // Critical: only update if we have a valid ID
    if (gpInstanceId) {
      window.currentGpInstanceId = gpInstanceId;
      console.log(
        "Setting current GP instance ID:",
        window.currentGpInstanceId
      );
    } else {
      console.warn(
        "No valid GP instance ID found, keeping existing:",
        window.currentGpInstanceId
      );
    }

    // Create the header with title and up button
    const headerContainer = document.createElement("div");
    headerContainer.className =
      "d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom";

    // Add title to the header - fetch the GP name for a nice title
    const titleDiv = document.createElement("div");
    titleDiv.className = "h5 mb-0 d-flex align-items-center";
    titleDiv.id = "elementsBreadcrumb"; // Changed ID to avoid confusion with main title

    // Also update the main elements title at the top of the panel
    const mainElementsTitle = document.getElementById("elementsTitle");
    if (mainElementsTitle) {
      mainElementsTitle.textContent = "CIS Plan - Generic Product Instance";
    }

    // Default display text - handle both object and string ID cases
    let displayText = "GP Instance";
    let gpId = gpInstanceId; // Use the determined ID from earlier

    // If we have a GP instance object (tree click case)
    if (typeof gpInstance === "object" && gpInstance !== null) {
      if (gpInstance.instanceLabel) {
        displayText = gpInstance.instanceLabel;
      } else if (gpInstance.gpid) {
        displayText = `GP ${gpInstance.gpid}`;
        gpId = gpInstance.gpid;
      }
    } else if (gpId) {
      // Direct GP ID case (state restoration)
      displayText = `GP ${gpId}`;
    }

    // Get the name asynchronously if we have a GP ID
    if (gpId) {
      fetchGPName(gpId).then((gpName) => {
        if (gpName) {
          const titleSpan = document.querySelector("#elementsBreadcrumb span");
          if (titleSpan) {
            // If we have a GP instance object with an instance label
            if (
              typeof gpInstance === "object" &&
              gpInstance !== null &&
              gpInstance.instanceLabel &&
              gpInstance.instanceLabel !== gpName
            ) {
              titleSpan.textContent = `${gpName} (${gpInstance.instanceLabel}) - Generic Product Instance`;
            } else {
              titleSpan.textContent = `${gpName} - Generic Product Instance`;
            }
          }
        }
      });
    }

    // Get the icon
    const iconPath = getElementIcon("gpInstances");

    // Set the initial title
    titleDiv.innerHTML = `
      <img src="${iconPath}" alt="GP Instance" class="icon-small me-2" style="width: 20px; height: 20px;">
      <span>${displayText} - Generic Product Instance</span>
    `;
    headerContainer.appendChild(titleDiv);

    // Add up button
    const upButton = document.createElement("button");
    upButton.className = "btn btn-sm btn-outline-secondary";
    upButton.innerHTML = '<i class="fas fa-arrow-up"></i> Up';
    upButton.title = "Navigate up to parent";
    upButton.id = "elementsUpButton";

    // Add event listener for up navigation
    upButton.addEventListener("click", navigateUp);

    // Add tooltip for better UX
    upButton.setAttribute("data-bs-toggle", "tooltip");
    upButton.setAttribute("data-bs-placement", "top");
    upButton.setAttribute("data-bs-title", "Navigate to parent");

    headerContainer.appendChild(upButton);
    elementsContainer.appendChild(headerContainer);

    // Create a container for the elements
    const elementsContent = document.createElement("div");
    elementsContent.id = "elementsContent";
    elementsContainer.appendChild(elementsContent);

    // Check if we have SP instances to display
    let childrenRendered = false;

    // Find SP instances either from gpInstance object or by searching global data
    let spInstances = [];

    // Case 1: We have a direct GP instance object with SP instances (tree click)
    if (
      typeof gpInstance === "object" &&
      gpInstance !== null &&
      gpInstance.spInstances &&
      gpInstance.spInstances.length > 0
    ) {
      spInstances = gpInstance.spInstances;
    }
    // Case 2: State restoration - need to find SP instances for this GP in the global data
    else if (gpId && cisPlanData && cisPlanData.missionNetworks) {
      console.log("Looking for SP instances for GP ID:", gpId);

      // Find SP instances for this GP ID in the global data
      function findSpInstancesForGp(data, targetGpId) {
        // Base case: We found a GP instance with the target ID
        if (data && data.gpid === targetGpId && data.spInstances) {
          return data.spInstances;
        }

        // Recursive case: Check all arrays in the object
        if (typeof data === "object" && data !== null) {
          for (const key in data) {
            if (Array.isArray(data[key])) {
              for (const item of data[key]) {
                const result = findSpInstancesForGp(item, targetGpId);
                if (result && result.length) {
                  return result;
                }
              }
            }
          }
        }

        return [];
      }

      spInstances = findSpInstancesForGp(cisPlanData, gpId);
      console.log("Found", spInstances.length, "SP instances for GP ID:", gpId);
    }

    // If we have SP instances to display
    if (spInstances && spInstances.length > 0) {
      // Add a header for SP instances
      const spHeader = document.createElement("h5");
      spHeader.className = "mt-3 mb-2";
      spHeader.innerHTML = `<i class="fas fa-cog me-2"></i> Specific Products (${spInstances.length})`;
      elementsContent.appendChild(spHeader);

      // Add the GP instance ID to each SP instance for proper parent reference
      const spInstancesWithParent = spInstances.map((spInstance) => {
        // Create a copy of the SP instance with an added parentGpInstance property
        return {
          ...spInstance,
          parentGpInstance: gpId, // Add parent GP ID reference
        };
      });

      console.log("SP instances with parent GP ID:", spInstancesWithParent);

      // Render SP instances as cards with parent reference
      renderElementCards(elementsContent, spInstancesWithParent, "spInstances");
      childrenRendered = true;
    }

    // If no children, show a message and add button
    if (!childrenRendered) {
      const noElementsDiv = document.createElement("div");
      noElementsDiv.className = "alert alert-info";
      noElementsDiv.innerHTML = `<i class="fas fa-info-circle me-2"></i> No Specific Products found. Use the Add SP button to add one.`;
      elementsContent.appendChild(noElementsDiv);
    }

    // Note: We're NOT adding a floating action button since there's already an Add button

    // Always update detail panel with the GP instance details
    updateDetailPanel(gpInstance, "gpInstances");
  }

  // Update the details panel with the selected element's data
  function updateDetailPanel(element, type) {
    // Clear the details container
    if (detailsContainer) {
      detailsContainer.innerHTML = "";
    }

    // Handle SP instances
    if (type === "spInstances") {
      if (detailsContainer) {
        // Create the card
        const card = document.createElement("div");
        card.className = "card mb-3";

        // Set up the card header
        const cardHeader = document.createElement("div");
        cardHeader.className =
          "card-header d-flex justify-content-between align-items-center";

        // Title with icon - will be updated with SP name if available
        const title = document.createElement("h5");
        title.className = "card-title mb-0 d-flex align-items-center";
        const iconImg = document.createElement("img");
        iconImg.src = CISUtils.getElementIcon("spInstances");
        iconImg.width = 24;
        iconImg.height = 24;
        iconImg.className = "me-2";
        title.appendChild(iconImg);

        // Create initial title with ID and version
        const titleText = document.createElement("span");
        titleText.textContent = `SP Instance: ${element.spId} v${element.spVersion}`;
        title.appendChild(titleText);

        // Add title to header
        cardHeader.appendChild(title);

        // Add header to card
        card.appendChild(cardHeader);

        // Set up the card body
        const cardBody = document.createElement("div");
        cardBody.className = "card-body";

        // Create a table for the SP instance details
        const table = document.createElement("table");
        table.className = "table table-sm detail-table";

        // Table body
        const tbody = document.createElement("tbody");

        // SP name row - will be populated asynchronously
        const nameRow = document.createElement("tr");
        const nameTh = document.createElement("th");
        nameTh.textContent = "Name";
        const nameTd = document.createElement("td");
        nameTd.textContent = "Loading...";
        nameRow.appendChild(nameTh);
        nameRow.appendChild(nameTd);
        tbody.appendChild(nameRow);

        // Add details rows
        const detailRows = [
          { label: "SP ID", value: element.spId },
          { label: "Version", value: element.spVersion },
        ];

        detailRows.forEach((row) => {
          const tr = document.createElement("tr");
          const th = document.createElement("th");
          th.textContent = row.label;
          const td = document.createElement("td");
          td.textContent = row.value || "N/A";
          tr.appendChild(th);
          tr.appendChild(td);
          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        cardBody.appendChild(table);
        card.appendChild(cardBody);

        // Add the card to the container
        detailsContainer.appendChild(card);

        // Fetch SP name and update both title and details asynchronously
        if (element.spId) {
          (async function () {
            try {
              const response = await fetch(`/api/sps/name/${element.spId}`);
              if (response.ok) {
                const result = await response.json();

                if (result.success && result.name) {
                  // Update name in details table
                  nameTd.textContent = result.name;

                  // Update the title with name and version
                  let displayText = result.name;
                  if (element.spVersion) {
                    displayText = `${result.name} (v${element.spVersion})`;
                  }
                  titleText.textContent = `SP Instance: ${displayText}`;
                }
              }
            } catch (error) {
              console.error(
                `Error fetching SP name for ${element.spId}:`,
                error
              );
              nameTd.textContent = "Error loading name";
            }
          })();
        } else {
          nameTd.textContent = "N/A";
        }

        // Enable/disable buttons as needed
        if (editDetailButton) editDetailButton.disabled = true; // Disable edit for SP instances for now
        if (deleteDetailButton) deleteDetailButton.disabled = false;

        return;
      }
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
      }
    }

    // For GP instances, update the title with the name and optional label
    if (type === "gpInstances") {
      // Start with a default title based on GP ID
      let displayTitle = element.gpid
        ? `GP ${element.gpid}`
        : "Generic Product";

      // If we have a GP ID, fetch the actual name
      if (element.gpid) {
        // First update with what we have now
        if (element.instanceLabel) {
          detailsTitle.textContent = `${displayTitle} (${element.instanceLabel}) Details`;
        } else {
          detailsTitle.textContent = `${displayTitle} Details`;
        }

        // Then fetch and update with the actual name
        fetchGPName(element.gpid)
          .then((gpName) => {
            if (gpName) {
              // Update the details title with the fetched name
              if (element.instanceLabel) {
                detailsTitle.textContent = `${gpName} (${element.instanceLabel}) Details`;
              } else {
                detailsTitle.textContent = `${gpName} Details`;
              }
            }
          })
          .catch((error) => {
            console.error(`Error fetching GP name: ${error}`);
          });
      } else if (element.instanceLabel) {
        // If we just have an instance label, use that
        detailsTitle.textContent = `${element.instanceLabel} Details`;
      } else {
        // Last resort
        detailsTitle.textContent = "Generic Product Details";
      }
    }
    // For other types, set the title based on the element type
    else if (type === "securityDomains") {
      const classification = getSecurityClassificationById(element.id);
      detailsTitle.textContent = `${classification.name} Details`;
    } else if (type === "networkInterfaces") {
      // For network interfaces, include IP address if available
      let ipAddress = "N/A";
      if (
        element.configurationItems &&
        Array.isArray(element.configurationItems)
      ) {
        // Find IP Address in configuration items
        element.configurationItems.forEach((item) => {
          if (item.Name === "IP Address" && item.AnswerContent) {
            ipAddress = item.AnswerContent;
          }
        });
      }
      detailsTitle.textContent = `${element.name} - ${ipAddress} Details`;
    } else if (element.name) {
      // For all other named elements
      detailsTitle.textContent = `${element.name} Details`;
    } else {
      // Complete fallback
      detailsTitle.textContent = `${formatNodeTypeName(type)} Details`;
    }

    // Create a card to display the details
    const detailCard = document.createElement("div");
    detailCard.className = "card m-3";

    // Create the card header
    const cardHeader = document.createElement("div");
    cardHeader.className = "card-header d-flex align-items-center";

    // Get the element's display name for the card header
    let displayName = "";

    // For security domains, use the classification name
    if (type === "securityDomains") {
      const classification = getSecurityClassificationById(element.id);
      displayName = classification.name;
    } else if (type === "networkInterfaces") {
      // For network interfaces, extract IP address from configuration items
      let ipAddress = "N/A";
      if (
        element.configurationItems &&
        Array.isArray(element.configurationItems)
      ) {
        // Look for IP Address configuration item
        element.configurationItems.forEach((item) => {
          if (item.Name === "IP Address" && item.AnswerContent) {
            ipAddress = item.AnswerContent;
          }
        });
      }

      // Create display text with both name and IP address
      displayName = `${element.name} - ${ipAddress}`;
    } else if (type === "gpInstances") {
      // For GP instances, start with the GP ID or instance label
      if (element.instanceLabel) {
        displayName = element.instanceLabel;
      } else if (element.gpid) {
        displayName = `GP ${element.gpid}`;
      } else {
        displayName = "Generic Product";
      }
    } else if (element.name) {
      // For all other types with a name property
      displayName = element.name;
    } else {
      // Complete fallback for unknown types
      displayName = `${formatNodeTypeName(type)} ${element.id || ""}`;
    }

    // Create the card header with icon and initial title
    const iconPath = getElementIcon(type);
    cardHeader.innerHTML = `
      <img src="${iconPath}" alt="${type}" class="icon-small me-2" style="width: 20px; height: 20px;">
      <h5 class="mb-0">${displayName}</h5>
    `;

    // If this is a GP instance and we have a GP ID, fetch the actual name
    if (type === "gpInstances" && element.gpid) {
      fetchGPName(element.gpid)
        .then((gpName) => {
          if (gpName) {
            // Find the h5 element in the card header and update it
            const headerTitle = cardHeader.querySelector("h5");
            if (headerTitle) {
              if (element.instanceLabel) {
                headerTitle.textContent = `${gpName} (${element.instanceLabel})`;
              } else {
                headerTitle.textContent = gpName;
              }
            }
          }
        })
        .catch((error) => {
          console.error(`Error fetching GP name for card header: ${error}`);
        });
    }

    // Add the card header to the card
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
    } else if (type === "gpInstances") {
      // Special handling for GP Instances
      let tableHtml = `
                <tbody>
      `;

      // Combined GP ID and Name row
      if (element.gpid) {
        // Add GP name asynchronously
        fetchGPName(element.gpid).then((gpName) => {
          const gpNameCell = document.getElementById(
            `gp-name-cell-${element.guid}`
          );
          if (gpNameCell) {
            gpNameCell.textContent = gpName || `GP ${element.gpid}`;
          }
        });

        tableHtml += `
                    <tr>
                        <th scope="row">Generic Product</th>
                        <td>
                          <strong>ID:</strong> ${element.gpid}
                          <br>
                          <strong>Name:</strong> <span id="gp-name-cell-${element.guid}">Loading...</span>
                        </td>
                    </tr>
        `;
      }

      // Combined GUID and Instance Label row
      tableHtml += `
                    <tr>
                        <th scope="row">Instance</th>
                        <td>

                          <strong>Label:</strong> ${
                            element.instanceLabel || "<em>Not set</em>"
                          }
                        </td>
                    </tr>
      `;

      // Combined Service ID and Name row
      if (element.serviceId) {
        // Add Service name asynchronously
        fetch(`/api/services/id_to_name?id=${element.serviceId}`)
          .then((response) => response.json())
          .then((data) => {
            const serviceNameCell = document.getElementById(
              `service-name-cell-${element.guid}`
            );
            if (serviceNameCell) {
              serviceNameCell.textContent = data.name || element.serviceId;
            }
          })
          .catch((error) => {
            console.error("Error fetching service name:", error);
            const serviceNameCell = document.getElementById(
              `service-name-cell-${element.guid}`
            );
            if (serviceNameCell) {
              serviceNameCell.textContent = "Error loading service name";
            }
          });

        tableHtml += `
                    <tr>
                        <th scope="row">Service</th>
                        <td>
                          <strong>ID:</strong> ${element.serviceId}
                          <br>
                          <strong>Name:</strong> <span id="service-name-cell-${element.guid}">Loading...</span>
                        </td>
                    </tr>
        `;
      }

      // Close basic details section
      tableHtml += `
                </tbody>
            `;

      table.innerHTML = tableHtml;
      cardBody.appendChild(table);

      // Add Configuration Items section if present
      if (element.configurationItems && element.configurationItems.length > 0) {
        // Create a heading for Configuration Items
        const configHeading = document.createElement("h5");
        configHeading.className = "mt-4 mb-3";
        configHeading.textContent = "Configuration Items";
        cardBody.appendChild(configHeading);

        // Create a table for configuration items
        const configTable = document.createElement("table");
        configTable.className = "table table-bordered table-sm";

        // Create the table header
        const configThead = document.createElement("thead");
        configThead.innerHTML = `
          <tr>
            <th>Name</th>
            <th>Value</th>
          </tr>
        `;
        configTable.appendChild(configThead);

        // Create table body and add each configuration item
        const configTbody = document.createElement("tbody");

        element.configurationItems.forEach((item) => {
          const row = document.createElement("tr");

          // Name cell
          const nameCell = document.createElement("td");
          nameCell.textContent = item.Name;
          if (item.HelpText) {
            nameCell.title = item.HelpText; // Add tooltip with help text
          }
          row.appendChild(nameCell);

          // Value cell
          const valueCell = document.createElement("td");
          valueCell.innerHTML = item.AnswerContent || "<em>Not set</em>";
          if (item.DefaultValue && !item.AnswerContent) {
            valueCell.innerHTML += ` <small class="text-muted">(Default: ${item.DefaultValue})</small>`;
          }
          row.appendChild(valueCell);

          configTbody.appendChild(row);
        });

        configTable.appendChild(configTbody);
        cardBody.appendChild(configTable);

        // Return here since we've already appended table and configTable to cardBody
        // Add a button to add SP instances
        const addSpButton = document.createElement("button");
        addSpButton.className = "btn btn-primary mt-3";
        addSpButton.innerHTML =
          '<i class="fas fa-plus me-2"></i>Add Specific Product';
        addSpButton.addEventListener("click", function () {
          // Store gpInstanceId in the form
          document.getElementById("addSPInstanceGPId").value = element.id;

          // Store all necessary parent IDs for creating proper API URLs
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

          document.getElementById("addSPInstanceAssetId").value = parentAsset;
          document.getElementById("addSPInstanceHwStackId").value = parentStack;
          document.getElementById("addSPInstanceDomainId").value = parentDomain;
          document.getElementById("addSPInstanceSegmentId").value =
            parentSegment;
          document.getElementById("addSPInstanceMissionNetworkId").value =
            parentMissionNetwork;

          // Show the modal
          const modal = new bootstrap.Modal(
            document.getElementById("addSPInstanceModal")
          );
          modal.show();
        });
        cardBody.appendChild(addSpButton);

        detailCard.appendChild(cardBody);
        detailsContainer.appendChild(detailCard);
        return;
      }
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
  function showNoElementsMessage(container, customMessage = null) {
    container.innerHTML = `
            <div class="alert alert-info m-3">
                <i class="fas fa-info-circle me-2"></i>
                ${customMessage || "No elements available"}
            </div>
        `;
  }

  // SEARCH & NAVIGATION FUNCTIONS

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

  // Make these functions globally available
  window.findAndSelectTreeNode = findAndSelectTreeNode;
  window.navigateUp = navigateUp;
  window.focusFirstMatchingTreeNode = focusFirstMatchingTreeNode;

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
    // Log the current position and where we should navigate to
    console.log("Navigating UP from current position...");
    CISPlanPointer.logNavigationUp();

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
      } else if (type === "gpInstances") {
        // For GP instances, navigate to parent asset
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
    } else if (nodeType === "gpInstances") {
      parentNodeId = currentTreeNode.getAttribute("data-parent-asset");
      if (parentNodeId) {
        // Find and select the parent Asset node
        if (findAndSelectTreeNode("assets", parentNodeId)) {
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

        @keyframes highlight-pulse {
            0% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.5); }
            70% { box-shadow: 0 0 0 10px rgba(0, 123, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 123, 255, 0); }
        }
    `;
    document.head.appendChild(style);
  });

  // UTILITY & HELPER FUNCTIONS

  /**
   * Get SVG icon path for a specific element type - delegates to CISUtils
   */
  function getElementIcon(type) {
    return CISUtils.getElementIcon(type);
  }

  /**
   * Get participant name by key from the API - delegates to CISUtils
   */
  async function getParticipantNameByKey(key) {
    return await CISUtils.getParticipantNameByKey(key);
  }

  /**
   * Fetch detailed GP instance data directly from the API
   * This is used for refreshing after adding SP instances
   */
  async function fetchGPInstanceDetails(gpInstanceId, assetId) {
    try {
      // We need to find the full path to the GP instance to construct the correct API URL
      const gpInstance = findGPInstanceById(gpInstanceId);
      if (!gpInstance) {
        console.error(
          `Cannot find GP instance ${gpInstanceId} in the data model`
        );
        return null;
      }

      // Find parent IDs - either from the GP instance object or from the DOM
      let missionNetworkId, segmentId, domainId, hwStackId;

      // Try to get from the GP instance object first
      if (gpInstance.parentMissionNetwork) {
        missionNetworkId =
          typeof gpInstance.parentMissionNetwork === "object"
            ? gpInstance.parentMissionNetwork.id
            : gpInstance.parentMissionNetwork;
      }

      if (gpInstance.parentSegment) {
        segmentId =
          typeof gpInstance.parentSegment === "object"
            ? gpInstance.parentSegment.id
            : gpInstance.parentSegment;
      }

      if (gpInstance.parentDomain) {
        domainId =
          typeof gpInstance.parentDomain === "object"
            ? gpInstance.parentDomain.id
            : gpInstance.parentDomain;
      }

      if (gpInstance.parentStack) {
        hwStackId =
          typeof gpInstance.parentStack === "object"
            ? gpInstance.parentStack.id
            : gpInstance.parentStack;
      }

      // If we couldn't get the parent IDs from the GP instance object, try to get them from the DOM
      const gpNode = document.querySelector(
        `.tree-node[data-type="gpInstances"][data-gpid="${gpInstanceId}"]`
      );

      if (gpNode) {
        if (!missionNetworkId) {
          missionNetworkId =
            gpNode.getAttribute("data-parent-mission-network") ||
            gpNode.getAttribute("data-parent-mission-network-id");
        }

        if (!segmentId) {
          segmentId =
            gpNode.getAttribute("data-parent-segment") ||
            gpNode.getAttribute("data-parent-segment-id");
        }

        if (!domainId) {
          domainId =
            gpNode.getAttribute("data-parent-domain") ||
            gpNode.getAttribute("data-parent-domain-id");
        }

        if (!hwStackId) {
          hwStackId =
            gpNode.getAttribute("data-parent-stack") ||
            gpNode.getAttribute("data-parent-stack-id");
        }

        if (!assetId) {
          assetId =
            gpNode.getAttribute("data-parent-asset") ||
            gpNode.getAttribute("data-parent-asset-id");
        }
      }

      // If we still don't have all the parent IDs, we can't fetch the GP instance
      if (
        !missionNetworkId ||
        !segmentId ||
        !domainId ||
        !hwStackId ||
        !assetId
      ) {
        console.error("Missing parent IDs for GP instance", {
          missionNetworkId,
          segmentId,
          domainId,
          hwStackId,
          assetId,
        });
        return null;
      }

      // Construct the API URL
      const url = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}/assets/${assetId}/gp_instances/${gpInstanceId}`;

      // Fetch the GP instance details
      const response = await fetch(url);

      if (response.ok) {
        const result = await response.json();
        return result.data || null;
      } else {
        console.error(
          `Error fetching GP instance details: ${response.status} ${response.statusText}`
        );
        return null;
      }
    } catch (error) {
      console.error("Error in fetchGPInstanceDetails:", error);
      return null;
    }
  }

  /**
   * Update a GP instance in the CIS plan data model
   * This is used after adding SP instances to ensure the model stays in sync
   */
  function updateGPInstanceInCISPlanData(gpInstanceId, updatedGpInstance) {
    try {
      if (!window.cisPlanData || !window.cisPlanData.missionNetworks) {
        console.error("CIS plan data is not available");
        return false;
      }

      // Iterate through the data model to find and update the GP instance
      for (const mn of window.cisPlanData.missionNetworks) {
        for (const segment of mn.networkSegments || []) {
          for (const domain of segment.securityDomains || []) {
            for (const stack of domain.hwStacks || []) {
              for (const asset of stack.assets || []) {
                // Find the matching GP instance
                const gpIndex = (asset.gpInstances || []).findIndex(
                  (gp) =>
                    gp.id === gpInstanceId ||
                    gp.guid === gpInstanceId ||
                    gp.gpid === gpInstanceId
                );

                if (gpIndex !== -1) {
                  // Found it - update the GP instance with the new data
                  // But preserve any properties that might be missing in the updated instance
                  const originalGp = asset.gpInstances[gpIndex];
                  asset.gpInstances[gpIndex] = {
                    ...originalGp,
                    ...updatedGpInstance,
                  };

                  console.log(
                    `Updated GP instance ${gpInstanceId} in CIS plan data`,
                    asset.gpInstances[gpIndex]
                  );
                  return true;
                }
              }
            }
          }
        }
      }

      console.error(
        `Could not find GP instance ${gpInstanceId} in CIS plan data`
      );
      return false;
    } catch (error) {
      console.error("Error in updateGPInstanceInCISPlanData:", error);
      return false;
    }
  }
});
