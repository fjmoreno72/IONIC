/**
 * CIS Plan JavaScript file
 * 
 * This file handles the functionality for the CIS Plan view
 */

// Initialize variables for state management
let currentTreeNode = null;
let currentElement = null;
let cisPlanData = null;

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener for the saveAssetBtn
    document.getElementById('saveAssetBtn').addEventListener('click', addAsset);
    
    // Add event listener for the updateAssetBtn
    document.getElementById('updateAssetBtn').addEventListener('click', updateAsset);
    
    // Add Enter key save functionality to all modals
    // Function to add Enter key handler to a modal
    function addEnterKeyHandler(modalId, saveFunction) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Prevent default form submission
                    saveFunction(); // Call the save function
                }
            });
        }
    }
    
    // Apply Enter key handlers to all entity modals
    // Mission Networks
    addEnterKeyHandler('addMissionNetworkModal', addMissionNetwork);
    addEnterKeyHandler('editMissionNetworkModal', updateMissionNetwork);
    
    // Network Segments
    addEnterKeyHandler('addNetworkSegmentModal', addNetworkSegment);
    addEnterKeyHandler('editNetworkSegmentModal', updateNetworkSegment);
    
    // Security Domains
    addEnterKeyHandler('addSecurityDomainModal', addSecurityDomain);
    
    // HW Stacks
    addEnterKeyHandler('addHwStackModal', addHwStack);
    addEnterKeyHandler('editHwStackModal', updateHwStack);
    
    // Assets
    addEnterKeyHandler('addAssetModal', addAsset);
    addEnterKeyHandler('editAssetModal', updateAsset);
    
    // Get references to DOM elements
    const treeSearchInput = document.getElementById('treeSearchInput');
    const elementsSearchInput = document.getElementById('elementsSearchInput');
    const cisTree = document.getElementById('cisTree');
    const elementsContainer = document.getElementById('elementsContainer') || document.createElement('div');
    const elementsTitle = document.getElementById('elementsTitle') || document.createElement('h4');
    const detailsContainer = document.getElementById('detailsContainer') || document.createElement('div');
    const detailsTitle = document.getElementById('detailsTitle') || document.createElement('h4');
    const refreshButton = document.getElementById('refreshButton');
    const addElementButton = document.getElementById('addElementButton');
    const editDetailButton = document.getElementById('editDetailButton');
    const deleteDetailButton = document.getElementById('deleteDetailButton');
    
    // We'll add navigation elements to the elements panel dynamically when needed
    
    // Add event listeners for search inputs
    treeSearchInput.addEventListener('input', handleTreeSearch);
    treeSearchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            focusFirstMatchingTreeNode();
        }
    });
    elementsSearchInput.addEventListener('input', handleElementsSearch);
    
    // Navigation events will be added dynamically when the elements panel is populated
    
    // Add event listeners for buttons
    if (refreshButton) {
        refreshButton.addEventListener('click', fetchCISPlanData);
    }
    
    // Let's keep it simple and follow the same pattern as mission networks
    
    // Add element button opens the appropriate modal based on current selection
    if (addElementButton) {
        addElementButton.addEventListener('click', async function() {
            // Root node (CIS Plan) selected - add mission network
            if (currentTreeNode && currentTreeNode.getAttribute('data-id') === 'root-cisplan') {
                // Show add mission network modal
                const addModal = new bootstrap.Modal(document.getElementById('addMissionNetworkModal'));
                addModal.show();
            }
            // Mission Network selected - add network segment
            else if (currentTreeNode && currentTreeNode.getAttribute('data-type') === 'missionNetworks') {
                // Show add network segment modal
                document.getElementById('addNetworkSegmentMissionNetworkId').value = currentTreeNode.getAttribute('data-id');
                const addModal = new bootstrap.Modal(document.getElementById('addNetworkSegmentModal'));
                addModal.show();
            }
            // Network Segment selected - add security domain
            else if (currentTreeNode && currentTreeNode.getAttribute('data-type') === 'networkSegments') {
                // First load security classifications for the dropdown
                fetchSecurityClassifications().then(() => {
                    // Store parent IDs for the API call
                    const segmentId = currentTreeNode.getAttribute('data-id');
                    const missionNetworkId = currentTreeNode.getAttribute('data-parent-mission-network');
                    
                    document.getElementById('addSecurityDomainSegmentId').value = segmentId;
                    document.getElementById('addSecurityDomainMissionNetworkId').value = missionNetworkId;
                    
                    // Show add security domain modal
                    const addModal = new bootstrap.Modal(document.getElementById('addSecurityDomainModal'));
                    addModal.show();
                });
            }
            // Security Domain selected - add HW Stack
            else if (currentTreeNode && currentTreeNode.getAttribute('data-type') === 'securityDomains') {
                const mn = currentTreeNode.getAttribute('data-parent-mission-network');
                const seg = currentTreeNode.getAttribute('data-parent-segment');
                const dom = currentTreeNode.getAttribute('data-id');
                document.getElementById('addHwStackMissionNetworkId').value = mn;
                document.getElementById('addHwStackSegmentId').value = seg;
                document.getElementById('addHwStackDomainId').value = dom;
                const select = document.getElementById('addHwStackCisParticipant');
                select.innerHTML = '';
                const participants = await fetchParticipants();
                participants.forEach(p => {
                    const opt = document.createElement('option'); opt.value = p.key; opt.textContent = p.name; select.appendChild(opt);
                });
                const addModal = new bootstrap.Modal(document.getElementById('addHwStackModal'));
                addModal.show();
            }
            // HW Stack selected - add Asset
            else if (currentTreeNode && currentTreeNode.getAttribute('data-type') === 'hwStacks') {
                const mn = currentTreeNode.getAttribute('data-parent-mission-network');
                const seg = currentTreeNode.getAttribute('data-parent-segment');
                const dom = currentTreeNode.getAttribute('data-parent-domain');
                const stack = currentTreeNode.getAttribute('data-id');
                document.getElementById('addAssetMissionNetworkId').value = mn;
                document.getElementById('addAssetSegmentId').value = seg;
                document.getElementById('addAssetDomainId').value = dom;
                document.getElementById('addAssetHwStackId').value = stack;
                const addModal = new bootstrap.Modal(document.getElementById('addAssetModal'));
                addModal.show();
            }
            // Other node types would be handled here as the feature expands
        });
    }
    
    // Edit button opens the appropriate modal based on what's selected
    if (editDetailButton) {
        editDetailButton.addEventListener('click', function() {
            if (currentElement) {
                const type = currentElement.type || currentTreeNode.getAttribute('data-type');
                
                if (type === 'missionNetworks') {
                    // Populate and show edit mission network modal
                    document.getElementById('editMissionNetworkId').value = currentElement.id;
                    document.getElementById('editMissionNetworkName').value = currentElement.name;
                    
                    const editModal = new bootstrap.Modal(document.getElementById('editMissionNetworkModal'));
                    editModal.show();
                }
                else if (type === 'networkSegments') {
                    // Populate and show edit network segment modal
                    document.getElementById('editNetworkSegmentId').value = currentElement.id;
                    document.getElementById('editNetworkSegmentName').value = currentElement.name;
                    
                    // Store mission network ID for the API call
                    const missionNetworkId = currentTreeNode.getAttribute('data-parent-mission-network') || 
                                           (currentElement.parentMissionNetwork ? currentElement.parentMissionNetwork.id : '');
                    document.getElementById('editNetworkSegmentMissionNetworkId').value = missionNetworkId;
                    
                    const editModal = new bootstrap.Modal(document.getElementById('editNetworkSegmentModal'));
                    editModal.show();
                }
                else if (type === 'hwStacks') {
                    // Populate and show edit HW Stack modal
                    document.getElementById('editHwStackId').value = currentElement.id;
                    document.getElementById('editHwStackName').value = currentElement.name;
                    
                    // Store parent IDs for the API call
                    const domainId = currentTreeNode.getAttribute('data-parent-domain') || 
                                    (currentElement.parentDomain ? currentElement.parentDomain.id : '');
                    const segmentId = currentTreeNode.getAttribute('data-parent-segment') || 
                                     (currentElement.parentSegment ? currentElement.parentSegment.id : '');
                    const missionNetworkId = currentTreeNode.getAttribute('data-parent-mission-network') || 
                                            (currentElement.parentMissionNetwork ? currentElement.parentMissionNetwork.id : '');
                    
                    document.getElementById('editHwStackDomainId').value = domainId;
                    document.getElementById('editHwStackSegmentId').value = segmentId;
                    document.getElementById('editHwStackMissionNetworkId').value = missionNetworkId;
                    
                    // Populate participants dropdown
                    const select = document.getElementById('editHwStackCisParticipant');
                    select.innerHTML = '<option value="" disabled>Select a participant...</option>';
                    
                    // Set current participant ID
                    fetchParticipants().then(participants => {
                        participants.forEach(p => {
                            const opt = document.createElement('option');
                            opt.value = p.key;
                            opt.textContent = p.name;
                            if (p.key === currentElement.cisParticipantID) {
                                opt.selected = true;
                            }
                            select.appendChild(opt);
                        });
                        
                        const editModal = new bootstrap.Modal(document.getElementById('editHwStackModal'));
                        editModal.show();
                    });
                }
                else if (type === 'assets') {
                    // Populate and show edit Asset modal
                    document.getElementById('editAssetId').value = currentElement.id;
                    document.getElementById('editAssetName').value = currentElement.name;
                    
                    // Store parent IDs for the API call
                    let hwStackId, domainId, segmentId, missionNetworkId;
                
                    // First try to get the hwStackId directly if available (we added this as a redundant property)
                    if (currentElement && currentElement.hwStackId) {
                        // Check if hwStackId is an object and extract id if needed
                        if (typeof currentElement.hwStackId === 'object' && currentElement.hwStackId !== null) {
                            hwStackId = currentElement.hwStackId.id || '';
                        } else {
                            hwStackId = currentElement.hwStackId;
                        }
                    }
                    
                    if (currentTreeNode) {
                        // Get from tree node if available
                        hwStackId = hwStackId || currentTreeNode.getAttribute('data-parent-stack');
                        domainId = currentTreeNode.getAttribute('data-parent-domain');
                        segmentId = currentTreeNode.getAttribute('data-parent-segment');
                        missionNetworkId = currentTreeNode.getAttribute('data-parent-mission-network');
                    } 
                    
                    if (currentElement) {
                        // Try to get from the current element if any values are still missing
                        if (!hwStackId) {
                            // Try parentStack
                            if (typeof currentElement.parentStack === 'object' && currentElement.parentStack !== null) {
                                hwStackId = currentElement.parentStack.id || '';
                            } else {
                                hwStackId = currentElement.parentStack || '';
                            }
                        }
                        
                        if (!domainId) {
                            domainId = typeof currentElement.parentDomain === 'object' ? 
                                (currentElement.parentDomain ? currentElement.parentDomain.id : '') : 
                                currentElement.parentDomain;
                        }
                        
                        if (!segmentId) {
                            segmentId = typeof currentElement.parentSegment === 'object' ? 
                                (currentElement.parentSegment ? currentElement.parentSegment.id : '') : 
                                currentElement.parentSegment;
                        }
                        
                        if (!missionNetworkId) {
                            missionNetworkId = typeof currentElement.parentMissionNetwork === 'object' ? 
                                (currentElement.parentMissionNetwork ? currentElement.parentMissionNetwork.id : '') : 
                                currentElement.parentMissionNetwork;
                        }
                    }
                
                    console.log('Edit Asset - Parent IDs:', { hwStackId, domainId, segmentId, missionNetworkId });
                    
                    document.getElementById('editAssetHwStackId').value = hwStackId;
                    document.getElementById('editAssetDomainId').value = domainId;
                    document.getElementById('editAssetSegmentId').value = segmentId;
                    document.getElementById('editAssetMissionNetworkId').value = missionNetworkId;
                    
                    const editModal = new bootstrap.Modal(document.getElementById('editAssetModal'));
                    editModal.show();
                }
                // Other node types would be handled here as the feature expands
            }
        });
    }
    
    // Delete button shows delete confirmation modal
    if (deleteDetailButton) {
        deleteDetailButton.addEventListener('click', function() {
            if (currentElement) {
                // The type is now stored directly in the currentElement object
                const elementType = currentElement.type;
                
                console.log('Delete item:', currentElement.name, 'type:', elementType); // Debug log
                
                document.getElementById('deleteItemName').textContent = currentElement.name;
                document.getElementById('deleteItemId').value = currentElement.id;
                document.getElementById('deleteItemType').value = elementType;
                
                // For hierarchical items that need parent ID for deletion
                if (elementType === 'networkSegments') {
                    // Get parent mission network ID - either from the tree node or element data
                    const missionNetworkId = currentTreeNode.getAttribute('data-parent-mission-network') || 
                                           (currentElement.parentMissionNetwork ? currentElement.parentMissionNetwork.id : '');
                    document.getElementById('deleteItemParentId').value = missionNetworkId;
                }
                else if (elementType === 'securityDomains') {
                    // For security domains, we need both the mission network ID and the segment ID
                    // Get them from the tree node or the current element
                    const segmentId = currentTreeNode.getAttribute('data-id');
                    const missionNetworkId = currentTreeNode.getAttribute('data-parent-mission-network') || '';
                    
                    // Store both parent IDs as comma-separated values
                    document.getElementById('deleteItemParentId').value = `${missionNetworkId},${segmentId}`;
                }
                else if (elementType === 'hwStacks') {
                    // For HW stacks, we need mission network ID, segment ID, and domain ID
                    const domainId = currentTreeNode.getAttribute('data-parent-domain') || 
                                   (currentElement.parentDomain ? currentElement.parentDomain.id : '');
                    const segmentId = currentTreeNode.getAttribute('data-parent-segment') || 
                                    (currentElement.parentSegment ? currentElement.parentSegment.id : '');
                    const missionNetworkId = currentTreeNode.getAttribute('data-parent-mission-network') || 
                                           (currentElement.parentMissionNetwork ? currentElement.parentMissionNetwork.id : '');
                    
                    // Store all three parent IDs as comma-separated values
                    document.getElementById('deleteItemParentId').value = `${missionNetworkId},${segmentId},${domainId}`;
                }
                else if (elementType === 'assets') {
                    // For assets, we need mission network ID, segment ID, domain ID, and HW stack ID
                    // Extract hwStackId properly - first try direct property, then parentStack
                    let hwStackId = '';
                    if (currentElement) {
                        // First try direct hwStackId property
                        if (currentElement.hwStackId) {
                            if (typeof currentElement.hwStackId === 'object' && currentElement.hwStackId !== null) {
                                hwStackId = currentElement.hwStackId.id || '';
                            } else {
                                hwStackId = currentElement.hwStackId;
                            }
                        } 
                        // Then try parentStack
                        else if (currentElement.parentStack) {
                            if (typeof currentElement.parentStack === 'object' && currentElement.parentStack !== null) {
                                hwStackId = currentElement.parentStack.id || '';
                            } else {
                                hwStackId = currentElement.parentStack;
                            }
                        }
                    }
                    
                    // If we still don't have hwStackId, try from tree node
                    if (!hwStackId && currentTreeNode) {
                        hwStackId = currentTreeNode.getAttribute('data-parent-stack') || '';
                    }
                    
                    // Extract other parent IDs
                    const domainId = currentTreeNode.getAttribute('data-parent-domain') || 
                                   (currentElement.parentDomain ? (typeof currentElement.parentDomain === 'object' ? currentElement.parentDomain.id : currentElement.parentDomain) : '');
                    const segmentId = currentTreeNode.getAttribute('data-parent-segment') || 
                                     (currentElement.parentSegment ? (typeof currentElement.parentSegment === 'object' ? currentElement.parentSegment.id : currentElement.parentSegment) : '');
                    const missionNetworkId = currentTreeNode.getAttribute('data-parent-mission-network') || 
                                            (currentElement.parentMissionNetwork ? (typeof currentElement.parentMissionNetwork === 'object' ? currentElement.parentMissionNetwork.id : currentElement.parentMissionNetwork) : '');
                    
                    // Store all four parent IDs as comma-separated values
                    document.getElementById('deleteItemParentId').value = `${missionNetworkId},${segmentId},${domainId},${hwStackId}`;
                    
                    console.log('Enhanced asset parent references:', {
                        hwStackId,
                        parentStack: currentElement.parentStack,
                        parentDomain: currentElement.parentDomain,
                        parentSegment: currentElement.parentSegment,
                        parentMissionNetwork: currentElement.parentMissionNetwork
                    });
                }
                
                const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
                deleteModal.show();
            }
        });
    }
    
    // Mission Network add/edit/delete event handlers
    const saveMissionNetworkBtn = document.getElementById('saveMissionNetworkBtn');
    if (saveMissionNetworkBtn) {
        saveMissionNetworkBtn.addEventListener('click', addMissionNetwork);
    }
    
    const updateMissionNetworkBtn = document.getElementById('updateMissionNetworkBtn');
    if (updateMissionNetworkBtn) {
        updateMissionNetworkBtn.addEventListener('click', updateMissionNetwork);
    }
    
    // Network Segment add/edit event handlers
    const saveNetworkSegmentBtn = document.getElementById('saveNetworkSegmentBtn');
    if (saveNetworkSegmentBtn) {
        saveNetworkSegmentBtn.addEventListener('click', addNetworkSegment);
    }
    
    const updateNetworkSegmentBtn = document.getElementById('updateNetworkSegmentBtn');
    if (updateNetworkSegmentBtn) {
        updateNetworkSegmentBtn.addEventListener('click', updateNetworkSegment);
    }
    
    // Security Domain add event handler
    const saveSecurityDomainBtn = document.getElementById('saveSecurityDomainBtn');
    if (saveSecurityDomainBtn) {
        saveSecurityDomainBtn.addEventListener('click', addSecurityDomain);
    }
    
    // HW Stack add/edit event handlers
    const saveHwStackBtn = document.getElementById('saveHwStackBtn');
    if (saveHwStackBtn) {
        saveHwStackBtn.addEventListener('click', addHwStack);
    }
    
    const updateHwStackBtn = document.getElementById('updateHwStackBtn');
    if (updateHwStackBtn) {
        updateHwStackBtn.addEventListener('click', updateHwStack);
    }
    
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', deleteItem);
    }
    
    // Initial data fetch
    async function initializeApp() {
        try {
            // Load security classifications first
            await fetchSecurityClassifications();
            console.log('Security classifications loaded:', securityClassifications);
            
            // Then load the CIS Plan data
            await fetchCISPlanData();
        } catch (error) {
            console.error('Error initializing CIS Plan app:', error);
            showToast('Error initializing application: ' + error.message, 'danger');
        }
    }
    
    // Fetch participants from API
    // Fetch participants - delegates to CISApi
    async function fetchParticipants() {
        try {
            const participants = await CISApi.fetchParticipants();
            console.log('Participants loaded:', participants.length);
            return participants;
        } catch (error) {
            console.error('Error in fetchParticipants:', error);
            return [];
        }
    }
    
    // Get participant name by key - delegates to CISUtils
    async function getParticipantNameByKey(key) {
        return CISUtils.getParticipantNameByKey(key);
    }
    
    // Add HW Stack
    async function addHwStack() {
        const name = document.getElementById('addHwStackName').value.trim();
        const cisParticipantID = document.getElementById('addHwStackCisParticipant').value;
        const missionNetworkId = document.getElementById('addHwStackMissionNetworkId').value;
        const segmentId = document.getElementById('addHwStackSegmentId').value;
        const domainId = document.getElementById('addHwStackDomainId').value;
        
        // Validation
        if (!name) {
            showToast('Please enter a HW Stack name', 'warning');
            return;
        }
        
        if (!cisParticipantID) {
            showToast('Please select a participant', 'warning');
            return;
        }
        
        if (!missionNetworkId || !segmentId || !domainId) {
            showToast('Missing parent information', 'warning');
            return;
        }
        
        try {
            const url = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks`;
            console.log('Adding HW Stack with URL:', url);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, cisParticipantID })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Properly close the modal and clear focus
                const modalElement = document.getElementById('addHwStackModal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                
                // Blur (unfocus) the save button before hiding the modal
                document.getElementById('saveHwStackBtn').blur();
                
                // Small delay to ensure blur takes effect before closing the modal
                setTimeout(() => {
                    modal.hide();
                }, 10);
                
                showToast(`HW Stack "${name}" created successfully!`);
                
                // Refresh the UI with the proper state
                await refreshPanelsWithState({
                    nodeType: 'securityDomains',
                    nodeId: domainId,
                    segmentId: segmentId,
                    missionNetworkId: missionNetworkId
                });
            } else {
                showToast(`${result.message || 'Failed to create HW Stack'}`, 'danger');
            }
        } catch (error) {
            console.error('Error creating HW Stack:', error);
            showToast('An error occurred while creating the HW Stack', 'danger');
        }
    }
    
    // Update HW Stack
    async function updateHwStack() {
        const name = document.getElementById('editHwStackName').value.trim();
        const cisParticipantID = document.getElementById('editHwStackCisParticipant').value;
        const missionNetworkId = document.getElementById('editHwStackMissionNetworkId').value;
        const segmentId = document.getElementById('editHwStackSegmentId').value;
        const domainId = document.getElementById('editHwStackDomainId').value;
        const id = document.getElementById('editHwStackId').value;
        
        // Validation
        if (!name) {
            showToast('Please enter a HW Stack name', 'warning');
            return;
        }
        
        if (!cisParticipantID) {
            showToast('Please select a participant', 'warning');
            return;
        }
        
        if (!missionNetworkId || !segmentId || !domainId || !id) {
            showToast('Missing required information', 'warning');
            return;
        }
        
        try {
            const url = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${id}`;
            console.log('Updating HW Stack with URL:', url);
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, cisParticipantID })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Properly close the modal and clear focus
                const modalElement = document.getElementById('editHwStackModal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                
                // Blur (unfocus) the update button before hiding the modal
                document.getElementById('updateHwStackBtn').blur();
                
                // Small delay to ensure blur takes effect before closing the modal
                setTimeout(() => {
                    modal.hide();
                }, 10);
                
                showToast(`HW Stack updated successfully!`);
                
                // Refresh the UI with the proper state
                await refreshPanelsWithState({
                    nodeType: 'securityDomains',
                    nodeId: domainId,
                    segmentId: segmentId,
                    missionNetworkId: missionNetworkId
                });
            } else {
                showToast(`${result.message || 'Failed to update HW Stack'}`, 'danger');
            }
        } catch (error) {
            console.error('Error updating HW Stack:', error);
            showToast('An error occurred while updating the HW Stack', 'danger');
        }
    }

    // Refresh panels while preserving tree state and selection
    async function refreshPanelsWithState(stateToRestore) {
        try {
            // Default state is empty if not provided
            stateToRestore = stateToRestore || {};
            
            // Store current state if not provided
            if (!stateToRestore.missionNetworkId && currentTreeNode) {
                // Get current tree node and its parents
                stateToRestore.nodeType = currentTreeNode.getAttribute('data-type');
                stateToRestore.nodeId = currentTreeNode.getAttribute('data-id');
                
                // Store parent references if available
                if (stateToRestore.nodeType === 'assets') {
                    stateToRestore.hwStackId = currentTreeNode.getAttribute('data-parent-stack');
                    stateToRestore.domainId = currentTreeNode.getAttribute('data-parent-domain');
                    stateToRestore.segmentId = currentTreeNode.getAttribute('data-parent-segment');
                    stateToRestore.missionNetworkId = currentTreeNode.getAttribute('data-parent-mission-network');
                } else if (stateToRestore.nodeType === 'hwStacks') {
                    stateToRestore.domainId = currentTreeNode.getAttribute('data-parent-domain');
                    stateToRestore.segmentId = currentTreeNode.getAttribute('data-parent-segment');
                    stateToRestore.missionNetworkId = currentTreeNode.getAttribute('data-parent-mission-network');
                } else if (stateToRestore.nodeType === 'securityDomains') {
                    stateToRestore.segmentId = currentTreeNode.getAttribute('data-parent-segment');
                    stateToRestore.missionNetworkId = currentTreeNode.getAttribute('data-parent-mission-network');
                } else if (stateToRestore.nodeType === 'networkSegments') {
                    stateToRestore.missionNetworkId = currentTreeNode.getAttribute('data-parent-mission-network');
                }
                
                console.log('Saving state before refresh:', stateToRestore);
            }
            
            // Fetch updated data
            await fetchCISPlanData();
            
            // Now restore the state
            setTimeout(() => {
                // Start by looking for the mission network if available
                if (stateToRestore.missionNetworkId) {
                    console.log('Restoring state after refresh:', stateToRestore);
                    
                    // First find and expand the mission network
                    const mnNode = document.querySelector(`.tree-node[data-type="missionNetworks"][data-id="${stateToRestore.missionNetworkId}"]`);
                    if (mnNode) {
                        console.log('Found mission network to restore:', stateToRestore.missionNetworkId);
                        
                        // First select and expand the mission network
                        mnNode.click();
                        const mnChildren = mnNode.nextElementSibling;
                        if (mnChildren && mnChildren.classList.contains('tree-node-children')) {
                            mnChildren.style.display = 'block'; // Show children
                            
                            // Update toggle icon
                            const mnToggle = mnNode.querySelector('.tree-toggle i');
                            if (mnToggle) mnToggle.className = 'fas fa-chevron-down';
                            
                            // If we have a segment to restore, look for it
                            if (stateToRestore.segmentId) {
                                const segNode = mnChildren.querySelector(`.tree-node[data-type="networkSegments"][data-id="${stateToRestore.segmentId}"]`);
                                if (segNode) {
                                    console.log('Found segment to restore:', stateToRestore.segmentId);
                                    
                                    // Select and expand the segment
                                    segNode.click();
                                    const segChildren = segNode.nextElementSibling;
                                    if (segChildren && segChildren.classList.contains('tree-node-children')) {
                                        segChildren.style.display = 'block'; // Show children
                                        
                                        // Update toggle icon
                                        const segToggle = segNode.querySelector('.tree-toggle i');
                                        if (segToggle) segToggle.className = 'fas fa-chevron-down';
                                        
                                        // If we have a security domain to restore, look for it
                                        if (stateToRestore.domainId) {
                                            console.log('Looking for security domain with ID:', stateToRestore.domainId);
                                            
                                            // Debug: List all security domain nodes in this segment
                                            const allSDNodes = segChildren.querySelectorAll(`.tree-node[data-type="securityDomains"]`);
                                            console.log(`Found ${allSDNodes.length} security domain nodes in segment ${stateToRestore.segmentId}:`);
                                            allSDNodes.forEach(node => {
                                                console.log(`- Security domain node ID: ${node.getAttribute('data-id')}`);
                                            });
                                            
                                            // Try to find the security domain node
                                            const sdNode = segChildren.querySelector(`.tree-node[data-type="securityDomains"][data-id="${stateToRestore.domainId}"]`);
                                            if (sdNode) {
                                                console.log('Found security domain to restore:', stateToRestore.domainId);
                                                sdNode.click(); // Select the security domain
                                                const sdChildren = sdNode.nextElementSibling;
                                                if (sdChildren && sdChildren.classList.contains('tree-node-children')) {
                                                    sdChildren.style.display = 'block'; // Show children
                                                    
                                                    // Update toggle icon
                                                    const sdToggle = sdNode.querySelector('.tree-toggle i');
                                                    if (sdToggle) sdToggle.className = 'fas fa-chevron-down';
                                                    
                                                    // If we have an HW stack to restore, look for it
                                                    if (stateToRestore.nodeType === 'hwStacks' && stateToRestore.nodeId) {
                                                        console.log('Looking for HW stack with ID:', stateToRestore.nodeId);
                                                        
                                                        // Debug: List all HW stack nodes in this domain
                                                        const allHWNodes = sdChildren.querySelectorAll(`.tree-node[data-type="hwStacks"]`);
                                                        console.log(`Found ${allHWNodes.length} HW stack nodes in domain ${stateToRestore.domainId}:`);
                                                        allHWNodes.forEach(node => {
                                                            console.log(`- HW stack node ID: ${node.getAttribute('data-id')}`);
                                                        });
                                                        
                                                        // Try to find the HW stack node
                                                        const hwNode = sdChildren.querySelector(`.tree-node[data-type="hwStacks"][data-id="${stateToRestore.nodeId}"]`);
                                                        if (hwNode) {
                                                            console.log('Found HW stack to restore:', stateToRestore.nodeId);
                                                            hwNode.click(); // Select the HW stack
                                                            
                                                            // If we need to go further to assets
                                                            if (stateToRestore.hwStackId || (stateToRestore.nodeType === 'assets' && stateToRestore.nodeId)) {
                                                                const hwChildren = hwNode.nextElementSibling;
                                                                if (hwChildren && hwChildren.classList.contains('tree-node-children')) {
                                                                    hwChildren.style.display = 'block'; // Show children
                                                                    
                                                                    // Update toggle icon
                                                                    const hwToggle = hwNode.querySelector('.tree-toggle i');
                                                                    if (hwToggle) hwToggle.className = 'fas fa-chevron-down';
                                                                    
                                                                    // Find asset if needed
                                                                    if (stateToRestore.nodeType === 'assets' && stateToRestore.nodeId) {
                                                                        console.log('Looking for asset with ID:', stateToRestore.nodeId);
                                                                        const assetNode = hwChildren.querySelector(`.tree-node[data-type="assets"][data-id="${stateToRestore.nodeId}"]`);
                                                                        if (assetNode) {
                                                                            console.log('Found asset to restore:', stateToRestore.nodeId);
                                                                            assetNode.click(); // Select the asset
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        } else {
                                                            console.warn(`Could not find HW stack node with ID ${stateToRestore.nodeId}`);
                                                        }
                                                    }
                                                }
                                            } else {
                                                console.warn(`Could not find security domain node with ID ${stateToRestore.domainId}`);
                                                // As a fallback, look for any security domain that contains the specified ID
                                                for (const node of allSDNodes) {
                                                    if (node.textContent.includes(stateToRestore.domainId)) {
                                                        console.log('Found security domain by name match:', node.textContent);
                                                        node.click();
                                                        break;
                                                    }
                                                }
                                            }
                                        } else if (stateToRestore.nodeType === 'securityDomains' && stateToRestore.nodeId) {
                                            console.log('Looking for security domain with ID:', stateToRestore.nodeId);
                                            
                                            // Debug: List all security domain nodes in this segment
                                            const allSDNodes = segChildren.querySelectorAll(`.tree-node[data-type="securityDomains"]`);
                                            console.log(`Found ${allSDNodes.length} security domain nodes in segment ${stateToRestore.segmentId}:`);
                                            allSDNodes.forEach(node => {
                                                console.log(`- Security domain node ID: ${node.getAttribute('data-id')}`);
                                            });
                                            
                                            // Try to find the security domain node
                                            const sdNode = segChildren.querySelector(`.tree-node[data-type="securityDomains"][data-id="${stateToRestore.nodeId}"]`);
                                            if (sdNode) {
                                                console.log('Found security domain to restore:', stateToRestore.nodeId);
                                                sdNode.click(); // Select the security domain
                                            } else {
                                                console.warn(`Could not find security domain node with ID ${stateToRestore.nodeId}`);
                                                // As a fallback, look for any security domain that contains the specified ID
                                                for (const node of allSDNodes) {
                                                    if (node.textContent.includes(stateToRestore.nodeId)) {
                                                        console.log('Found security domain by name match:', node.textContent);
                                                        node.click();
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }, 300); // Delay to ensure DOM is updated
        } catch (error) {
            console.error('Error refreshing panels with state:', error);
        }
    }
    
    // Start app initialization
    initializeApp();
    
    // Show a toast notification - delegates to CISUtils
    function showToast(message, type = 'success') {
        return CISUtils.showToast(message, type);
    }
    
    // Add a new mission network
    // Add a mission network - delegates to CISApi
    async function addMissionNetwork() {
        const nameInput = document.getElementById('addMissionNetworkName');
        const name = nameInput.value.trim();
        
        if (!name) {
            showToast('Please enter a mission network name', 'warning');
            return;
        }
        
        try {
            // Call the API to add the mission network
            const apiResult = await CISApi.addMissionNetwork(name);
            
            if (apiResult.success) {
                // Properly close the modal and clear focus
                const modalElement = document.getElementById('addMissionNetworkModal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                
                // Blur (unfocus) the save button before hiding the modal
                document.getElementById('saveMissionNetworkBtn').blur();
                
                // Small delay to ensure blur takes effect before closing the modal
                setTimeout(() => {
                    modal.hide();
                }, 10);
                
                // Clear the form
                nameInput.value = '';
                
                // Show success message
                showToast(`Mission Network "${name}" created successfully!`);
                
                // Refresh the data
                fetchCISPlanData();
            } else {
                showToast(`${apiResult.message || apiResult.error || 'Failed to create mission network'}`, 'danger');
            }
        } catch (error) {
            console.error('Error in addMissionNetwork function:', error);
            showToast('An error occurred while creating the mission network', 'danger');
        }
    }
    
    // Update an existing mission network
    // Update a mission network - delegates to CISApi
    async function updateMissionNetwork() {
        const idInput = document.getElementById('editMissionNetworkId');
        const nameInput = document.getElementById('editMissionNetworkName');
        const id = idInput.value;
        const name = nameInput.value.trim();
        
        if (!name) {
            showToast('Please enter a mission network name', 'warning');
            return;
        }
        
        try {
            // Call the API to update the mission network
            const apiResult = await CISApi.updateMissionNetwork(id, name);
            
            if (apiResult.success) {
                // Properly close the modal and clear focus
                const modalElement = document.getElementById('editMissionNetworkModal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                
                // Blur (unfocus) the update button before hiding the modal
                document.getElementById('updateMissionNetworkBtn').blur();
                
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
                showToast(`${apiResult.message || apiResult.error || 'Failed to update mission network'}`, 'danger');
            }
        } catch (error) {
            console.error('Error in updateMissionNetwork function:', error);
            showToast('An error occurred while updating the mission network', 'danger');
        }
    }
    
    // Add a new network segment
    // Add a network segment - delegates to CISApi
    async function addNetworkSegment() {
        const nameInput = document.getElementById('addNetworkSegmentName');
        const missionNetworkIdInput = document.getElementById('addNetworkSegmentMissionNetworkId');
        const name = nameInput.value.trim();
        const missionNetworkId = missionNetworkIdInput.value;
        
        if (!name) {
            showToast('Please enter a network segment name', 'warning');
            return;
        }
        
        if (!missionNetworkId) {
            showToast('Missing mission network ID', 'warning');
            return;
        }
        
        try {
            // Call the API to add the network segment
            const apiResult = await CISApi.addNetworkSegment(missionNetworkId, name);
            
            if (apiResult.success) {
                // Properly close the modal and clear focus
                const modalElement = document.getElementById('addNetworkSegmentModal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                
                // Blur (unfocus) the save button before hiding the modal
                document.getElementById('saveNetworkSegmentBtn').blur();
                
                // Small delay to ensure blur takes effect before closing the modal
                setTimeout(() => {
                    modal.hide();
                }, 10);
                
                // Clear the form
                nameInput.value = '';
                
                // Show success message
                showToast(`Network Segment "${name}" created successfully!`);
                
                // Refresh the data
                fetchCISPlanData();
            } else {
                showToast(`${apiResult.message || apiResult.error || 'Failed to create network segment'}`, 'danger');
            }
        } catch (error) {
            console.error('Error in addNetworkSegment function:', error);
            showToast('An error occurred while creating the network segment', 'danger');
        }
    }
    
    // Update an existing network segment - delegates to CISApi
    async function updateNetworkSegment() {
        const idInput = document.getElementById('editNetworkSegmentId');
        const nameInput = document.getElementById('editNetworkSegmentName');
        const missionNetworkIdInput = document.getElementById('editNetworkSegmentMissionNetworkId');
        const id = idInput.value;
        const name = nameInput.value.trim();
        const missionNetworkId = missionNetworkIdInput.value;
        
        if (!name) {
            showToast('Please enter a network segment name', 'warning');
            return;
        }
        
        if (!missionNetworkId) {
            showToast('Missing mission network ID', 'warning');
            return;
        }
        
        try {
            // Call the API to update the network segment
            const apiResult = await CISApi.updateNetworkSegment(missionNetworkId, id, name);
            
            if (apiResult.success) {
                // Properly close the modal and clear focus
                const modalElement = document.getElementById('editNetworkSegmentModal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                
                // Blur (unfocus) the update button before hiding the modal
                document.getElementById('updateNetworkSegmentBtn').blur();
                
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
                showToast(`${apiResult.message || apiResult.error || 'Failed to update network segment'}`, 'danger');
            }
        } catch (error) {
            console.error('Error in updateNetworkSegment function:', error);
            showToast('An error occurred while updating the network segment', 'danger');
        }
    }
    
    // Add a new asset
async function addAsset() {
    const nameInput = document.getElementById('addAssetName');
    const missionNetworkIdInput = document.getElementById('addAssetMissionNetworkId');
    const segmentIdInput = document.getElementById('addAssetSegmentId');
    const domainIdInput = document.getElementById('addAssetDomainId');
    const hwStackIdInput = document.getElementById('addAssetHwStackId');
    
    const name = nameInput.value.trim();
    const missionNetworkId = missionNetworkIdInput.value;
    const segmentId = segmentIdInput.value;
    const domainId = domainIdInput.value;
    const hwStackId = hwStackIdInput.value;
    
    if (!name) {
        showToast('Please enter an asset name', 'warning');
        return;
    }
    
    if (!missionNetworkId || !segmentId || !domainId || !hwStackId) {
        showToast('Missing parent ID information', 'warning');
        return;
    }
    
    try {
        const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}/assets`;
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Properly close the modal and clear focus
            const modalElement = document.getElementById('addAssetModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            
            // Blur (unfocus) the save button before hiding the modal
            document.getElementById('saveAssetBtn').blur();
            
            // Small delay to ensure blur takes effect before closing the modal
            setTimeout(() => {
                modal.hide();
            }, 10);
            
            // Clear the form
            nameInput.value = '';
            
            // Show success message
            showToast(`Asset "${name}" created successfully!`);
            
            // Get the ID of the new asset from the response if available
            let newAssetId = null;
            if (result.data && result.data.id) {
                newAssetId = result.data.id;
                console.log('New asset created with ID:', newAssetId);
            }
            
            // Create a state object that contains the full parent hierarchy
            const stateToRestore = {
                nodeType: 'hwStacks',
                nodeId: hwStackId,
                domainId: domainId,
                segmentId: segmentId,
                missionNetworkId: missionNetworkId,
                highlightNewAsset: newAssetId
            };
            
            console.log('Refreshing with state:', stateToRestore);
            await refreshPanelsWithState(stateToRestore);
            
            // If the new asset ID is available, try to highlight it after refresh
            if (newAssetId) {
                // Let the DOM update first
                setTimeout(() => {
                    const assetNode = document.querySelector(`.tree-node[data-id="${newAssetId}"]`);
                    if (assetNode) {
                        assetNode.click(); // Programmatically click the node to select it
                    }
                }, 100);
            }
        } else {
            showToast(`${result.message || 'Failed to create asset'}`, 'danger');
        }
    } catch (error) {
        console.error('Error adding asset:', error);
        showToast('An error occurred while creating the asset', 'danger');
    }
}

// Update an existing asset
async function updateAsset() {
    console.log('Updating asset with current element:', currentElement);
    const idInput = document.getElementById('editAssetId');
    const nameInput = document.getElementById('editAssetName');
    const missionNetworkIdInput = document.getElementById('editAssetMissionNetworkId');
    const segmentIdInput = document.getElementById('editAssetSegmentId');
    const domainIdInput = document.getElementById('editAssetDomainId');
    const hwStackIdInput = document.getElementById('editAssetHwStackId');
    
    const id = idInput.value;
    const name = nameInput.value.trim();
    const missionNetworkId = missionNetworkIdInput.value;
    const segmentId = segmentIdInput.value;
    const domainId = domainIdInput.value;
    const hwStackId = hwStackIdInput.value;
    
    // Make sure hwStackId is a string, not an object
    if (typeof hwStackId === 'object' && hwStackId !== null) {
        hwStackId = hwStackId.id || '';
    }
    
    console.log('Asset update values:', {
        id,
        name,
        missionNetworkId,
        segmentId,
        domainId,
        hwStackId
    });
    
    if (!name) {
        showToast('Please enter an asset name', 'warning');
        return;
    }
    
    if (!missionNetworkId || !segmentId || !domainId || !hwStackId) {
        showToast('Missing parent ID information', 'warning');
        return;
    }
    
    try {
        const endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}/assets/${id}`;
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Properly close the modal and clear focus
            const modalElement = document.getElementById('editAssetModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            
            // Blur (unfocus) the update button before hiding the modal
            document.getElementById('updateAssetBtn').blur();
            
            // Small delay to ensure blur takes effect before closing the modal
            setTimeout(() => {
                modal.hide();
            }, 10);
            
            // Show success message
            showToast(`Asset updated successfully!`);
            
            // Update the current element with the new name
            if (currentElement && currentElement.id === id) {
                currentElement.name = name;
                
                // Update the details panel with the new name
                updateDetailPanel(currentElement, currentElement.type);
            }
            
            // Refresh the data with state preservation
            // Create a state object to restore UI to the HW Stack
            await refreshPanelsWithState({
                nodeType: 'hwStacks',
                nodeId: hwStackId,
                domainId: domainId,
                segmentId: segmentId,
                missionNetworkId: missionNetworkId
            });
        } else {
            showToast(`${result.message || 'Failed to update asset'}`, 'danger');
        }
    } catch (error) {
        console.error('Error updating asset:', error);
        showToast('An error occurred while updating the asset', 'danger');
    }
}

// Store security classifications data
    let securityClassifications = [];
    
    // Helper function to get security classification details by ID
    function getSecurityClassificationById(id) {
        if (!id) {
            console.log('No ID provided for classification lookup');
            return { 
                id: 'Unknown', 
                name: 'Unknown Classification', 
                guid: 'N/A',
                releasabilityString: 'N/A',
                order: 0,
                colour: '#808080' 
            };
        }
        
        // Log state for debugging
        // Classification lookup
        
        // Find the classification with the matching ID
        const classification = securityClassifications.find(c => c.id === id);
        
        if (classification) {
            // Classification found
            return classification;
        } else {
            // Classification not found
            // Return a default object with the ID
            return { 
                id: id, 
                name: id, // Fallback to showing the ID as name if not found
                guid: 'N/A',
                releasabilityString: 'N/A',
                order: 0,
                colour: '#808080' // Default gray color
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
            const dropdown = document.getElementById('addSecurityDomainClassification');
            if (dropdown) {
                // Clear existing options except the first one
                while (dropdown.options.length > 1) {
                    dropdown.remove(1);
                }
                
                // Add options from the security classifications
                securityClassifications.forEach(classification => {
                    const option = document.createElement('option');
                    option.value = classification.id; // Use classification.id for the option value
                    option.textContent = classification.name;
                    option.setAttribute('data-guid', classification.guid);
                    dropdown.appendChild(option);
                });
            }
            
            return securityClassifications;
        } catch (error) {
            console.error('Error in fetchSecurityClassifications:', error);
            showToast('Error loading security classifications', 'danger');
            return [];
        }
    }
    
    // Add a new security domain
    async function addSecurityDomain() {
        const segmentIdInput = document.getElementById('addSecurityDomainSegmentId');
        const missionNetworkIdInput = document.getElementById('addSecurityDomainMissionNetworkId');
        const classificationSelect = document.getElementById('addSecurityDomainClassification');
        
        const segmentId = segmentIdInput.value;
        const missionNetworkId = missionNetworkIdInput.value;
        const classificationId = classificationSelect.value;
        
        if (!classificationId) {
            showToast('Please select a security classification', 'warning');
            return;
        }
        
        if (!segmentId || !missionNetworkId) {
            showToast('Missing parent information', 'warning');
            return;
        }
        
        // Check if this security domain classification already exists in this segment
        // Need to check if data is properly initialized first
        if (data && data.missionNetworks && Array.isArray(data.missionNetworks)) {
            // First find the segment in our data
            const missionNetwork = data.missionNetworks.find(mn => mn.id === missionNetworkId);
            if (missionNetwork && missionNetwork.networkSegments && Array.isArray(missionNetwork.networkSegments)) {
                const segment = missionNetwork.networkSegments.find(seg => seg.id === segmentId);
                if (segment && segment.securityDomains && Array.isArray(segment.securityDomains)) {
                    // Check if any existing security domain has the same classification ID
                    const existingDomain = segment.securityDomains.find(sd => sd.id === classificationId);
                    if (existingDomain) {
                        const classification = getSecurityClassificationById(classificationId);
                        if (classification) {
                            showToast(`Security Domain "${classification.name}" already exists in this segment`, 'warning');
                        } else {
                            showToast(`Security Domain with ID ${classificationId} already exists in this segment`, 'warning');
                        }
                        return;
                    }
                }
            }
        }
        
        // Get the selected classification object
        const selectedOption = classificationSelect.options[classificationSelect.selectedIndex];
        const name = selectedOption.textContent;
        const guid = selectedOption.getAttribute('data-guid');
        
        try {
            // Adding security domain - using CISApi
            const apiResult = await CISApi.addSecurityDomain(missionNetworkId, segmentId, classificationId);
            
            if (apiResult.success) {
                // Properly close the modal
                const modalElement = document.getElementById('addSecurityDomainModal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                
                // Blur (unfocus) the save button before hiding the modal
                document.getElementById('saveSecurityDomainBtn').blur();
                
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
                sessionStorage.setItem('lastAddedSecurityDomain', JSON.stringify({
                    missionNetworkId: missionNetworkId,
                    segmentId: segmentId
                }));
                
                // Then refresh - the fetch function will handle expansion
                fetchCISPlanData();
            } else {
                // Log the error response for debugging
                console.log('Error response from backend:', apiResult.data);
                
                // Handle specific errors from backend
                if (apiResult.error && typeof apiResult.error === 'string' && apiResult.error.includes('already exists')) {
                    // This is a duplicate security domain error
                    const classification = getSecurityClassificationById(classificationId);
                    const name = classification ? classification.name : classificationId;
                    showToast(`Security domain "${name}" already exists in this segment`, 'warning');
                } else if (apiResult.status === 400) {
                    // Specific handling for 400 Bad Request which is likely a duplicate
                    const classification = getSecurityClassificationById(classificationId);
                    const name = classification ? classification.name : classificationId;
                    showToast(`Cannot add duplicate security domain "${name}" to this segment`, 'warning');
                } else {
                    // Other errors
                    showToast(`Failed to add security domain: ${apiResult.error || 'Unknown error'}`, 'danger');
                }
            }
        } catch (error) {
            console.error('Error adding security domain:', error);
            showToast('An error occurred while adding the security domain', 'danger');
        }
    }
    
    // Delete an item (mission network, segment, etc.)
    // Delete an item from the CIS Plan - delegates to CISApi
    async function deleteItem() {
        const type = document.getElementById('deleteItemType').value;
        const id = document.getElementById('deleteItemId').value;
        const name = document.getElementById('deleteItemName').textContent;
        const parentId = document.getElementById('deleteItemParentId').value;
        
        console.log(`Deleting ${type} item with ID: ${id}`);
        
        try {
            // Call the API to delete the item
            const apiResult = await CISApi.deleteItem(type, id, parentId);
            
            if (apiResult.success) {
                // Properly close the modal and clear focus
                const modalElement = document.getElementById('deleteConfirmModal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                
                // Blur (unfocus) the confirm button before hiding the modal
                document.getElementById('confirmDeleteBtn').blur();
                
                // Small delay to ensure blur takes effect before closing the modal
                setTimeout(() => {
                    modal.hide();
                }, 10);
                
                // Show success message
                showToast(`${name} deleted successfully!`);
                
                // Store parent info before refreshing
                let parentId = '';
                let parentType = '';
                let missionNetworkId = '';
                let segmentId = '';
                let domainId = '';
                
                if (type === 'securityDomains') {
                    // For security domains, we want to restore the segment selection
                    const parentIds = document.getElementById('deleteItemParentId').value.split(',');
                    parentId = parentIds[1]; // Use segment ID
                    missionNetworkId = parentIds[0]; // Store mission network ID
                    parentType = 'networkSegments';
                } else if (type === 'hwStacks') {
                    // For HW stacks, we want to restore the security domain selection
                    const parentIds = document.getElementById('deleteItemParentId').value.split(',');
                    parentId = parentIds[2]; // Use domain ID
                    segmentId = parentIds[1]; // Store segment ID
                    missionNetworkId = parentIds[0]; // Store mission network ID
                    parentType = 'securityDomains';
                } else if (type === 'assets') {
                    // For assets, we want to restore the HW stack selection
                    const parentIds = document.getElementById('deleteItemParentId').value.split(',');
                    parentId = parentIds[3]; // Use HW stack ID
                    domainId = parentIds[2]; // Store domain ID
                    segmentId = parentIds[1]; // Store segment ID
                    missionNetworkId = parentIds[0]; // Store mission network ID
                    parentType = 'hwStacks';
                } else if (type === 'networkSegments') {
                    // For network segments, we want to restore the mission network selection
                    parentId = document.getElementById('deleteItemParentId').value;
                    parentType = 'missionNetworks';
                }
                
                console.log(`Deleted ${type} item, will restore to parent type: ${parentType}, id: ${parentId}`);
                
                // Create a state object that will be used to restore the UI state
                const stateToRestore = {
                    nodeType: parentType,
                    nodeId: parentId,
                    missionNetworkId: missionNetworkId
                };
                
                // If we're restoring to a network segment, we need to include the segment ID
                if (parentType === 'networkSegments') {
                    stateToRestore.segmentId = parentId;
                }
                
                // If we're restoring to a security domain or HW stack, include the segment ID
                if (segmentId && (parentType === 'securityDomains' || parentType === 'hwStacks')) {
                    stateToRestore.segmentId = segmentId;
                }
                
                // If we're restoring to an HW stack, include the domain ID
                if (domainId && parentType === 'hwStacks') {
                    stateToRestore.domainId = domainId;
                }
                
                try {
                    // Use the state-preserving refresh function
                    await refreshPanelsWithState(stateToRestore);
                } catch (error) {
                    console.error('Error updating tree after deleting item:', error);
                    showToast('Item was deleted, but there was a problem updating the display', 'warning');
                }
            } else {
                showToast(`${apiResult.message || apiResult.error || 'Failed to delete item'}`, 'danger');
            }
        } catch (error) {
            console.error('Error in deleteItem function:', error);
            showToast('An error occurred while deleting the item', 'danger');
        }
    }
    
    // Fetch CIS Plan data from the API
    // Fetch CIS Plan tree data - delegates to CISApi
    async function fetchCISPlanData() {
        const treeData = await CISApi.fetchCISPlanData();
        
        if (treeData) {
            // Now manually call renderTree since it's a function outside the API namespace
            renderTree(treeData);
            
            // Handle special cases like recently added security domains
            const lastAddedSecurityDomain = sessionStorage.getItem('lastAddedSecurityDomain');
            if (lastAddedSecurityDomain) {
                try {
                    const sdInfo = JSON.parse(lastAddedSecurityDomain);
                    // Clear it immediately to prevent repeated application
                    sessionStorage.removeItem('lastAddedSecurityDomain');
                    
                    // Add a small delay to ensure DOM is rendered
                    setTimeout(() => {
                        // First find and expand the mission network
                        const mnNode = document.querySelector(`.tree-node[data-type="missionNetworks"][data-id="${sdInfo.missionNetworkId}"]`);
                        if (mnNode) {
                            // Click the toggle to expand it
                            const mnToggle = mnNode.querySelector('.tree-toggle');
                            if (mnToggle) mnToggle.click();
                            
                            // Small delay to let mission network expand
                            setTimeout(() => {
                                // Then find and expand the segment
                                const segNode = document.querySelector(`.tree-node[data-type="networkSegments"][data-id="${sdInfo.segmentId}"]`);
                                if (segNode) {
                                    // Select the segment
                                    segNode.click();
                                    
                                    // Click the toggle to expand it
                                    const segToggle = segNode.querySelector('.tree-toggle');
                                    if (segToggle) segToggle.click();
                                }
                            }, 100);
                        }
                    }, 150);
                } catch (e) {
                    console.warn('Error parsing security domain info:', e);
                }
            }
            
            // Restore selection state if needed
            restoreSelectionState();
        }
        
        return treeData;
    }
    
    // Helper function to restore selection state after tree refresh
    function restoreSelectionState() {
        // Get current selection state
        let currentNodeId = null;
        let currentNodeType = null;
        let currentElementId = null;
        
        if (currentTreeNode) {
            currentNodeId = currentTreeNode.getAttribute('data-id');
            currentNodeType = currentTreeNode.getAttribute('data-type');
        }
        
        if (currentElement) {
            currentElementId = currentElement.id;
        }
        
        // IMPORTANT: Check if we have a pending security domain selection
        // If so, skip the default state restoration as it will be handled by the event listener
        const hasPendingSDSelection = sessionStorage.getItem('pendingSecurityDomainSelect') !== null;
        
        // Only do regular state restoration if no security domain selection is pending
        if (!hasPendingSDSelection) {
            // Now restore selection and update panels based on the current selection state
            let nodeToSelect = null;
            
            // Find and re-select the previously selected node in the tree
            if (currentNodeId) {
                // If it was a mission network, network segment, etc.
                if (currentNodeId !== 'root-cisplan') {
                    nodeToSelect = document.querySelector(`.tree-node[data-id="${currentNodeId}"][data-type="${currentNodeType}"]`);
                } else {
                    // If it was the root CIS Plan node
                    nodeToSelect = document.querySelector('.tree-node[data-id="root-cisplan"]');
                }
                
                // If we found the node, programmatically click it to restore selection
                if (nodeToSelect) {
                    nodeToSelect.click();
                    
                    // For nodes with children, ensure they're expanded
                    const childrenContainer = nodeToSelect.nextElementSibling;
                    if (childrenContainer && childrenContainer.classList.contains('tree-node-children')) {
                        childrenContainer.style.display = 'block';
                        const toggleIcon = nodeToSelect.querySelector('.tree-toggle');
                        if (toggleIcon) {
                            toggleIcon.innerHTML = '<i class="fas fa-chevron-down"></i>';
                        }
                    }
                    
                    // If we had a selected element in the elements panel, try to re-select it
                    if (currentElementId) {
                        setTimeout(() => {
                            const elementCard = document.querySelector(`.element-card[data-id="${currentElementId}"]`);
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
                elementsTitle.textContent = 'CIS Plan - Mission Networks';
            }
            
            if (elementsContainer) {
                elementsContainer.innerHTML = '';
                renderElementCards(elementsContainer, data, 'missionNetworks');
            }
        }
    }
    
    // Render the tree based on CIS Plan data
    function renderTree(data) {
        // Clear the tree container
        cisTree.innerHTML = '';
        
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
        const treeContainer = document.createElement('div');
        treeContainer.className = 'tree-list p-2';
        cisTree.appendChild(treeContainer);

        // Create a root "CIS Plan" node
        const rootNode = createTreeNode(
            'cisplan',
            'CIS Plan',
            'root-cisplan',
            'root-guid',
            'cisplan'
        );
        treeContainer.appendChild(rootNode);
        
        // Create a container for mission networks under the root node
        const missionNetworksContainer = document.createElement('div');
        missionNetworksContainer.className = 'tree-node-children ms-4';
        missionNetworksContainer.style.display = 'none'; // Initially collapsed
        missionNetworksContainer.setAttribute('data-parent', 'root-cisplan');
        treeContainer.appendChild(missionNetworksContainer);
        
        // Add click event to toggle mission networks visibility
        rootNode.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = this.classList.contains('active');
            
            // Toggle active class
            document.querySelectorAll('.tree-node.active').forEach(node => {
                node.classList.remove('active');
            });
            
            if (!isActive) {
                this.classList.add('active');
                currentTreeNode = this;
                
                // When the root node is selected, display all mission networks in the Elements panel
                if (elementsTitle) {
                    elementsTitle.textContent = 'CIS Plan - Mission Networks';
                }
                
                if (elementsContainer) {
                    elementsContainer.innerHTML = '';
                    renderElementCards(elementsContainer, data, 'missionNetworks');
                }
                
                // Clear the details panel
                if (detailsContainer) {
                    detailsContainer.innerHTML = '';
                }
                
                if (detailsTitle) {
                    detailsTitle.textContent = 'CIS Plan Details';
                }
            }
            
            // Toggle children container
            // Use nextElementSibling instead of global query to avoid affecting other branches
            const childrenContainer = this.nextElementSibling;
            if (childrenContainer) {
                const isExpanded = childrenContainer.style.display !== 'none';
                childrenContainer.style.display = isExpanded ? 'none' : 'block';
                
                // Toggle icon
                const icon = this.querySelector('.tree-toggle');
                if (icon) {
                    icon.innerHTML = isExpanded ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-down"></i>';
                }
            }
        });
        
        // Render mission networks under the root node
        data.forEach(missionNetwork => {
            const missionNetworkNode = createTreeNode(
                'missionNetworks', 
                missionNetwork.name, 
                missionNetwork.id, 
                missionNetwork.guid,
                'fa-project-diagram'
            );
            missionNetworksContainer.appendChild(missionNetworkNode);
            
            // Create a container for the children (network segments)
            const segmentsContainer = document.createElement('div');
            segmentsContainer.className = 'tree-node-children ms-4';
            segmentsContainer.style.display = 'none'; // Initially collapsed
            segmentsContainer.setAttribute('data-parent', missionNetwork.id);
            missionNetworksContainer.appendChild(segmentsContainer);
            
            // Add click event to mission network node to toggle children
            missionNetworkNode.addEventListener('click', function(e) {
                e.stopPropagation();
                const isActive = this.classList.contains('active');
                
                // Remove active class from all nodes
                document.querySelectorAll('.tree-node.active').forEach(node => {
                    node.classList.remove('active');
                });
                
                // Toggle active class for this node
                if (!isActive) {
                    this.classList.add('active');
                    currentTreeNode = this;
                    loadSelectedNodeChildren(missionNetwork, 'missionNetworks');
                }
                
                // Toggle children container
                // Use nextElementSibling instead of global query to avoid affecting other branches
                const childrenContainer = this.nextElementSibling;
                if (childrenContainer) {
                    const isExpanded = childrenContainer.style.display !== 'none';
                    childrenContainer.style.display = isExpanded ? 'none' : 'block';
                    
                    // Toggle the icon for expand/collapse
                    const icon = this.querySelector('.tree-toggle');
                    if (icon) {
                        icon.innerHTML = isExpanded ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-down"></i>';
                    }
                    
                    // If expanding and no children yet, render them
                    if (!isExpanded && childrenContainer.children.length === 0 && missionNetwork.networkSegments) {
                        renderNetworkSegments(childrenContainer, missionNetwork.networkSegments, missionNetwork);
                    }
                }
            });
        });
    }
    
    // Render network segments under a mission network
    function renderNetworkSegments(container, segments, parentMissionNetwork) {
        segments.forEach(segment => {
            const segmentNode = createTreeNode(
                'networkSegments', 
                segment.name, 
                segment.id, 
                segment.guid,
                'fa-network-wired'
            );
            
            // Store parent mission network ID for use in operations
            if (parentMissionNetwork && parentMissionNetwork.id) {
                segmentNode.setAttribute('data-parent-mission-network', parentMissionNetwork.id);
                // Store full parent reference in the segment's data
                segment.parentMissionNetwork = parentMissionNetwork;
            }
            
            container.appendChild(segmentNode);
            
            // Create a container for the children (security domains)
            const domainsContainer = document.createElement('div');
            domainsContainer.className = 'tree-node-children ms-4';
            domainsContainer.style.display = 'none'; // Initially collapsed
            domainsContainer.setAttribute('data-parent', segment.id);
            container.appendChild(domainsContainer);
            
            // Add click event to segment node to toggle children
            segmentNode.addEventListener('click', function(e) {
                e.stopPropagation();
                const isActive = this.classList.contains('active');
                
                // Remove active class from all nodes
                document.querySelectorAll('.tree-node.active').forEach(node => {
                    node.classList.remove('active');
                });
                
                // Toggle active class for this node
                if (!isActive) {
                    this.classList.add('active');
                    currentTreeNode = this;
                    loadSelectedNodeChildren(segment, 'networkSegments', parentMissionNetwork);
                }
                
                // Toggle children container
                // Use nextElementSibling instead of global query to avoid affecting other branches
                const childrenContainer = this.nextElementSibling;
                if (childrenContainer) {
                    const isExpanded = childrenContainer.style.display !== 'none';
                    childrenContainer.style.display = isExpanded ? 'none' : 'block';
                    
                    // Toggle the icon for expand/collapse
                    const icon = this.querySelector('.tree-toggle');
                    if (icon) {
                        icon.innerHTML = isExpanded ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-down"></i>';
                    }
                    
                    // If expanding and no children yet, render them
                    if (!isExpanded && childrenContainer.children.length === 0 && segment.securityDomains) {
                        renderSecurityDomains(childrenContainer, segment.securityDomains, segment, parentMissionNetwork);
                    }
                }
            });
        });
    }
    
    // Render security domains under a network segment
    function renderSecurityDomains(container, domains, parentSegment, parentMissionNetwork) {
        domains.forEach(domain => {
            // Look up full classification details using the domain's ID
            const classification = getSecurityClassificationById(domain.id);
            
            const domainNode = createTreeNode(
                'securityDomains', 
                classification.name, // Use name from classification data
                domain.id, 
                classification.guid, // Use guid from classification data
                'fa-shield-alt'
            );
            
            // Store parent references as attributes for better state restoration
            if (parentSegment && parentSegment.id) {
                domainNode.setAttribute('data-parent-segment', parentSegment.id);
                // Added parent segment reference
            }
            
            if (parentMissionNetwork && parentMissionNetwork.id) {
                domainNode.setAttribute('data-parent-mission-network', parentMissionNetwork.id);
                // Added parent mission network reference
            }
            
            container.appendChild(domainNode);
            
            // Create a container for the children (hw stacks)
            const stacksContainer = document.createElement('div');
            stacksContainer.className = 'tree-node-children ms-4';
            stacksContainer.style.display = 'none'; // Initially collapsed
            stacksContainer.setAttribute('data-parent', domain.id);
            container.appendChild(stacksContainer);
            
            // Add click event to domain node to toggle children
            domainNode.addEventListener('click', function(e) {
                e.stopPropagation();
                const isActive = this.classList.contains('active');
                
                // Remove active class from all nodes
                document.querySelectorAll('.tree-node.active').forEach(node => {
                    node.classList.remove('active');
                });
                
                // Toggle active class for this node
                if (!isActive) {
                    this.classList.add('active');
                    currentTreeNode = this;
                    loadSelectedNodeChildren(domain, 'securityDomains', parentSegment, parentMissionNetwork);
                }
                
                // Toggle children container
                // Use nextElementSibling instead of global query to avoid affecting other branches
                const childrenContainer = this.nextElementSibling;
                if (childrenContainer) {
                    const isExpanded = childrenContainer.style.display !== 'none';
                    childrenContainer.style.display = isExpanded ? 'none' : 'block';
                    
                    // Toggle the icon for expand/collapse
                    const icon = this.querySelector('.tree-toggle');
                    if (icon) {
                        icon.innerHTML = isExpanded ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-down"></i>';
                    }
                    
                    // If expanding and no children yet, render them
                    if (!isExpanded && childrenContainer.children.length === 0 && domain.hwStacks) {
                        renderHWStacks(childrenContainer, domain.hwStacks, domain, parentSegment, parentMissionNetwork);
                    }
                }
            });
        });
    }
    
    // Render hardware stacks under a security domain
    function renderHWStacks(container, stacks, parentDomain, parentSegment, parentMissionNetwork) {
        stacks.forEach(stack => {
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
                'hwStacks', 
                stack.name, 
                stack.id, 
                stack.guid,
                'fa-server'
            );
            
            // Set parent attributes for proper edit/delete functionality
            if (parentDomain && parentDomain.id) {
                stackNode.setAttribute('data-parent-domain', parentDomain.id);
            }
            if (parentSegment && parentSegment.id) {
                stackNode.setAttribute('data-parent-segment', parentSegment.id);
            }
            if (parentMissionNetwork && parentMissionNetwork.id) {
                stackNode.setAttribute('data-parent-mission-network', parentMissionNetwork.id);
            }
            
            container.appendChild(stackNode);
            
            // Create a container for the children (assets)
            const assetsContainer = document.createElement('div');
            assetsContainer.className = 'tree-node-children ms-4';
            assetsContainer.style.display = 'none'; // Initially collapsed
            assetsContainer.setAttribute('data-parent', stack.id);
            container.appendChild(assetsContainer);
            
            // Add click event to stack node to toggle children
            stackNode.addEventListener('click', function(e) {
                e.stopPropagation();
                const isActive = this.classList.contains('active');
                
                // Remove active class from all nodes
                document.querySelectorAll('.tree-node.active').forEach(node => {
                    node.classList.remove('active');
                });
                
                // Toggle active class for this node
                if (!isActive) {
                    this.classList.add('active');
                    currentTreeNode = this;
                    loadSelectedNodeChildren(stack, 'hwStacks', parentDomain, parentSegment, parentMissionNetwork);
                }
                
                // Toggle children container
                // Use nextElementSibling instead of global query to avoid affecting other branches
                const childrenContainer = this.nextElementSibling;
                if (childrenContainer) {
                    const isExpanded = childrenContainer.style.display !== 'none';
                    childrenContainer.style.display = isExpanded ? 'none' : 'block';
                    
                    // Toggle the icon for expand/collapse
                    const icon = this.querySelector('.tree-toggle');
                    if (icon) {
                        icon.innerHTML = isExpanded ? '<i class="fas fa-chevron-right"></i>' : '<i class="fas fa-chevron-down"></i>';
                    }
                    
                    // If expanding and no children yet, render them
                    if (!isExpanded && childrenContainer.children.length === 0 && stack.assets) {
                        renderAssets(childrenContainer, stack.assets, stack, parentDomain, parentSegment, parentMissionNetwork);
                    }
                }
            });
        });
    }
    
    // Render assets under a hardware stack
    function renderAssets(container, assets, parentStack, parentDomain, parentSegment, parentMissionNetwork) {
        if (!assets || assets.length === 0) {
            return;
        }
        
        // Create a container for the assets
        const assetsContainer = document.createElement('div');
        container.appendChild(assetsContainer);
        
        // For each asset, create a tree node
        assets.forEach(asset => {
            const assetNode = createTreeNode('assets', asset.name, asset.id, asset.guid);
            
            // Store parent references as data attributes
            assetNode.setAttribute('data-parent-stack', parentStack);
            assetNode.setAttribute('data-parent-domain', parentDomain);
            assetNode.setAttribute('data-parent-segment', parentSegment);
            assetNode.setAttribute('data-parent-mission-network', parentMissionNetwork);
            
            // Store these references in asset object too for when selected from the elements panel
            // Make sure all references are string IDs, not objects
            asset.parentStack = parentStack;
            asset.parentDomain = parentDomain;
            asset.parentSegment = parentSegment;
            asset.parentMissionNetwork = parentMissionNetwork;
            // We also store the hwStackId directly to ensure it's always available
            asset.hwStackId = parentStack;
            
            // Add click event for the asset node
            assetNode.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event bubbling
                
                // Remove active class from all nodes
                document.querySelectorAll('.tree-node.active').forEach(node => {
                    node.classList.remove('active');
                });
                
                // Add active class to this node
                this.classList.add('active');
                
                // Update currentTreeNode
                currentTreeNode = this;
                
                // Update the elements panel with the children of this node
                loadSelectedNodeChildren(
                    asset,
                    'assets',
                    { id: parentStack },
                    { id: parentDomain },
                    { id: parentSegment },
                    { id: parentMissionNetwork }
                );
                
                // Enable the "Add Element" button
                if (addElementButton) addElementButton.disabled = false;
            });
            
            assetsContainer.appendChild(assetNode);
            
            // Recursively render network interfaces if any
            renderNetworkInterfaces(assetsContainer, asset.networkInterfaces, asset.id, parentStack, parentDomain, parentSegment, parentMissionNetwork);
            
            // Recursively render GP instances if any
            renderGPInstances(assetsContainer, asset.gpInstances, asset.id, parentStack, parentDomain, parentSegment, parentMissionNetwork);
        });
    }
    
    // Render network interfaces under an asset
    function renderNetworkInterfaces(container, networkInterfaces, parentAsset, parentStack, parentDomain, parentSegment, parentMissionNetwork) {
        networkInterfaces.forEach(networkInterface => {
            const networkInterfaceNode = createTreeNode(
                'networkInterfaces', 
                networkInterface.name, 
                networkInterface.id, 
                networkInterface.guid,
                'fa-network-wired'
            );
            container.appendChild(networkInterfaceNode);
            
            // Add click event to network interface node
            networkInterfaceNode.addEventListener('click', function(e) {
                e.stopPropagation();
                const isActive = this.classList.contains('active');
                
                // Remove active class from all nodes
                document.querySelectorAll('.tree-node.active').forEach(node => {
                    node.classList.remove('active');
                });
                
                // Toggle active class for this node
                if (!isActive) {
                    this.classList.add('active');
                    currentTreeNode = this;
                    loadSelectedNodeChildren(networkInterface, 'networkInterfaces', parentAsset, parentStack, parentDomain, parentSegment, parentMissionNetwork);
                }
            });
        });
    }
    
    // Render GP instances under an asset
    function renderGPInstances(container, gpInstances, parentAsset, parentStack, parentDomain, parentSegment, parentMissionNetwork) {
        gpInstances.forEach(gpInstance => {
            const gpInstanceNode = createTreeNode(
                'gpInstances', 
                gpInstance.name || gpInstance.instanceLabel || `GP Instance ${gpInstance.id}`, 
                gpInstance.id, 
                gpInstance.guid,
                'fa-cogs'
            );
            container.appendChild(gpInstanceNode);
            
            // Add click event to GP instance node
            gpInstanceNode.addEventListener('click', function(e) {
                e.stopPropagation();
                const isActive = this.classList.contains('active');
                
                // Remove active class from all nodes
                document.querySelectorAll('.tree-node.active').forEach(node => {
                    node.classList.remove('active');
                });
                
                // Toggle active class for this node
                if (!isActive) {
                    this.classList.add('active');
                    currentTreeNode = this;
                    loadSelectedNodeChildren(gpInstance, 'gpInstances', parentAsset, parentStack, parentDomain, parentSegment, parentMissionNetwork);
                }
            });
        });
    }

    // Create a tree node element
    function createTreeNode(type, name, id, guid, iconClass) {
        const node = document.createElement('div');
        node.className = 'tree-node d-flex align-items-center p-2 mb-1 rounded';
        node.setAttribute('data-type', type);
        node.setAttribute('data-id', id);
        node.setAttribute('data-guid', guid);
        
        // Create the toggle button for expandable nodes
        const toggleSpan = document.createElement('span');
        toggleSpan.className = 'tree-toggle me-2';
        toggleSpan.innerHTML = '<i class="fas fa-chevron-right"></i>';
        node.appendChild(toggleSpan);
        
        // Create the icon - use SVG icons from ENTITY_META via getElementIcon function
        const iconSpan = document.createElement('span');
        iconSpan.className = 'me-2';
        
        // Get the appropriate SVG icon for this element type
        const iconPath = getElementIcon(type);
        iconSpan.innerHTML = `<img src="${iconPath}" width="18" height="18" alt="${type} icon">`;
        node.appendChild(iconSpan);
        
        // Create the text
        const textSpan = document.createElement('span');
        textSpan.className = 'node-text';
        textSpan.textContent = name;
        node.appendChild(textSpan);
        
        return node;
    }
    
    // Load and display children of the selected node in the elements panel
    // Config-driven: Load and display children of the selected node in the elements panel
    function loadSelectedNodeChildren(nodeData, nodeType, ...parentData) {
        console.log('Loading children for node:', nodeType, nodeData, 'Parents:', parentData);
        
        if (elementsContainer) {
            elementsContainer.innerHTML = '';
        }
        
        // Add navigation header with title and Up button if not at root level
        const headerContainer = document.createElement('div');
        headerContainer.className = 'd-flex justify-content-between align-items-center mb-3 pb-2 border-bottom';
        
        // Add title to the header
        const titleDiv = document.createElement('div');
        let displayName = nodeData.name;
        if (nodeType === 'securityDomains') {
            const classification = getSecurityClassificationById(nodeData.id);
            displayName = classification.name;
        }
        titleDiv.className = 'h5 mb-0 d-flex align-items-center';
        titleDiv.id = 'elementsTitle';
        
        // Get the SVG icon for this node type
        const iconPath = getElementIcon(nodeType);
        
        // Create icon element
        titleDiv.innerHTML = `
            <img src="${iconPath}" alt="${nodeType}" class="icon-small me-2" style="width: 20px; height: 20px;">
            <span>${displayName} - ${formatNodeTypeName(nodeType)}</span>
        `;
        headerContainer.appendChild(titleDiv);
        
        // Add Up button if not at root level
        if (nodeType !== 'root-cisplan') {
            const upButton = document.createElement('button');
            upButton.className = 'btn btn-sm btn-outline-secondary';
            upButton.innerHTML = '<i class="fas fa-arrow-up"></i> Up';
            upButton.title = 'Navigate up to parent';
            upButton.id = 'elementsUpButton';
            
            // Add event listener for up navigation
            upButton.addEventListener('click', function() {
                navigateUp();
            });
            
            // Add tooltip for better UX
            upButton.setAttribute('data-bs-toggle', 'tooltip');
            upButton.setAttribute('data-bs-placement', 'top');
            upButton.setAttribute('data-bs-title', 'Navigate to parent');
            
            headerContainer.appendChild(upButton);
        }
        
        // Add the header container to the elements container
        elementsContainer.appendChild(headerContainer);
        
        // Create a container for the actual elements
        const elementsContent = document.createElement('div');
        elementsContent.className = 'elements-content';
        elementsContent.id = 'elementsContent';
        elementsContainer.appendChild(elementsContent);
        
        // Use ENTITY_CHILDREN config to determine children to render
        const childrenDefs = ENTITY_CHILDREN[nodeType];
        let childrenRendered = false;

        if (childrenDefs) {
            childrenDefs.forEach(def => {
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
        container.innerHTML = '';
        
        // Create a sticky header for the Add button if we're on a scrollable list
        if (type === 'assets') {
            // Create sticky header with add button
            const stickyHeader = document.createElement('div');
            stickyHeader.className = 'sticky-top bg-light mb-2 p-2 d-flex justify-content-between align-items-center border-bottom';
            stickyHeader.style.zIndex = '100';
            
            // Create title in sticky header
            const headerTitle = document.createElement('h5');
            headerTitle.className = 'm-0';
            headerTitle.textContent = `Assets (${elements.length})`;
            stickyHeader.appendChild(headerTitle);
            
            // Create add button in sticky header
            const addButton = document.createElement('button');
            addButton.className = 'btn btn-sm btn-primary';
            addButton.innerHTML = '<i class="fas fa-plus"></i> Add Asset';
            addButton.addEventListener('click', function() {
                // This will trigger the same action as the main Add Element button when HW Stack is selected
                if (currentTreeNode && currentTreeNode.getAttribute('data-type') === 'hwStacks') {
                    const mn = currentTreeNode.getAttribute('data-parent-mission-network');
                    const seg = currentTreeNode.getAttribute('data-parent-segment');
                    const dom = currentTreeNode.getAttribute('data-parent-domain');
                    const stack = currentTreeNode.getAttribute('data-id');
                    document.getElementById('addAssetMissionNetworkId').value = mn;
                    document.getElementById('addAssetSegmentId').value = seg;
                    document.getElementById('addAssetDomainId').value = dom;
                    document.getElementById('addAssetHwStackId').value = stack;
                    const addModal = new bootstrap.Modal(document.getElementById('addAssetModal'));
                    addModal.show();
                }
            });
            stickyHeader.appendChild(addButton);
            
            container.appendChild(stickyHeader);
            
            // For assets, use a compact list view instead of cards
            const compactList = document.createElement('div');
            compactList.className = 'compact-asset-list';
            container.appendChild(compactList);
            
            // Create a grid layout for more condensed view
            const grid = document.createElement('div');
            grid.className = 'row row-cols-2 row-cols-md-3 row-cols-lg-4 g-2';
            compactList.appendChild(grid);
            
            // Store current selected element ID if there is one
            let selectedElementId = '';
            if (currentElement && currentElement.id) {
                selectedElementId = currentElement.id;
            }
            
            // Render each asset in a compact form
            elements.forEach(element => {
                const col = document.createElement('div');
                col.className = 'col';
                
                const assetItem = document.createElement('div');
                assetItem.className = 'asset-item p-2 border rounded d-flex align-items-center';
                if (selectedElementId === element.id) {
                    assetItem.classList.add('active', 'bg-primary', 'text-white');
                }
                
                assetItem.setAttribute('data-type', type);
                assetItem.setAttribute('data-id', element.id);
                assetItem.setAttribute('data-guid', element.guid);
                
                // Get icon for asset
                const iconPath = getElementIcon(type);
                
                // Create compact layout with icon and name
                assetItem.innerHTML = `
                    <img src="${iconPath}" width="20" height="20" alt="${type} icon" class="me-2">
                    <div class="asset-name text-truncate">${element.name}</div>
                `;
                
                // Add tooltip with ID info
                assetItem.setAttribute('title', `${element.name} (${element.id})`);
                
                // Add click event
                assetItem.addEventListener('click', function() {
                    // Remove active class from all items
                    document.querySelectorAll('.asset-item.active').forEach(item => {
                        item.classList.remove('active', 'bg-primary', 'text-white');
                    });
                    
                    // Add active class to this item
                    this.classList.add('active', 'bg-primary', 'text-white');
                    
                    // Store the selected element and its type
                    currentElement = element;
                    currentElement.type = type; // Store the type explicitly
                    
                    // Update detail panel
                    updateDetailPanel(element, type);
                });
                
                // Add double-click handler for drill-down navigation
                assetItem.addEventListener('dblclick', function(event) {
                    // Find and select the corresponding tree node
                    findAndSelectTreeNode(type, element.id);
                });
                
                col.appendChild(assetItem);
                grid.appendChild(col);
            });
            
            return; // Exit early since we've handled the assets case specially
        }
        
        // For non-asset types, use the original card layout
        let cardsContainer = document.createElement('div');
        cardsContainer.className = 'element-cards-container row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 m-1';
        container.appendChild(cardsContainer);
        
        // Store current selected element ID if there is one
        let selectedElementId = '';
        if (currentElement && currentElement.id) {
            selectedElementId = currentElement.id;
        }
        
        // Render each element as a card
        elements.forEach(element => {
            const cardCol = document.createElement('div');
            cardCol.className = 'col';
            
            const card = document.createElement('div');
            card.className = 'card element-card h-100';
            
            // If this card represents the currently selected element, add active class
            if (selectedElementId === element.id) {
                card.classList.add('active');
                console.log('Applied active class during render:', element.id); // Debug log
            }
            
            card.setAttribute('data-type', type);
            card.setAttribute('data-id', element.id);
            card.setAttribute('data-guid', element.guid);
            
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';
            
            // Get the SVG icon for this element type
            // Use centralized ENTITY_META for icon
            const iconPath = getElementIcon(type);
            
            // Create a header with icon and title
            const cardHeader = document.createElement('div');
            cardHeader.className = 'd-flex align-items-center mb-2';
            
            // Add icon
            const iconSpan = document.createElement('span');
            iconSpan.className = 'me-2';
            iconSpan.innerHTML = `<img src="${iconPath}" width="26" height="26" alt="${type} icon">`;
            cardHeader.appendChild(iconSpan);
            
            // Create title with the icon
            const cardTitle = document.createElement('h5');
            cardTitle.className = 'card-title mb-0';
            
            // For security domains, look up the classification name
            if (type === 'securityDomains') {
                const classification = getSecurityClassificationById(element.id);
                cardTitle.textContent = classification.name;
            } else {
                cardTitle.textContent = element.name;
            }
            
            cardHeader.appendChild(cardTitle);
            
            // Add the header to the card body
            cardBody.appendChild(cardHeader);
            
            // Add subtitle (ID)
            const cardSubtitle = document.createElement('h6');
            cardSubtitle.className = 'card-subtitle mb-2 text-muted';
            cardSubtitle.textContent = element.id || '';  
            cardBody.appendChild(cardSubtitle);
            
            // For HW Stacks, use a more condensed layout
            if (type === 'hwStacks') {
                // Remove the subtitle (ID) that was added earlier for HW stacks
                cardBody.removeChild(cardSubtitle);
                
                // Add participant info if available in a more compact way
                if (element.cisParticipantID) {
                    const participantContainer = document.createElement('div');
                    participantContainer.className = 'small text-secondary mb-1';
                    participantContainer.innerHTML = `<span class="participant-name text-truncate">${element.cisParticipantID}</span>`;
                    cardBody.appendChild(participantContainer);
                    
                    // Asynchronously fetch and update the participant name
                    (async function() {
                        const participantName = await getParticipantNameByKey(element.cisParticipantID);
                        const nameSpan = participantContainer.querySelector('.participant-name');
                        if (nameSpan && participantName !== element.cisParticipantID) {
                            nameSpan.textContent = participantName;
                        }
                    })();
                }
                
                // Make the card more compact
                card.classList.add('compact-hw-stack');
                cardBody.classList.add('p-2');
                cardHeader.classList.add('mb-1');
            }
            card.appendChild(cardBody);
            cardCol.appendChild(card);
            cardsContainer.appendChild(cardCol);
            
            // Add double-click handler for drill-down navigation (separate from click handler)
            card.addEventListener('dblclick', function(event) {
                // Prevent the click event from firing
                event.stopPropagation();
                
                // Find and select the corresponding tree node
                findAndSelectTreeNode(type, element.id);
            });
            
            // Add click event to the card
            card.addEventListener('click', function() {
                // Remove active class from all cards
                document.querySelectorAll('.element-card.active').forEach(card => {
                    card.classList.remove('active');
                });
                
                // Add active class to this card
                this.classList.add('active');
                
                // Store the selected element and its type
                currentElement = element;
                currentElement.type = type; // Add the type property to the element
                
                // For network segments, ensure parent mission network reference is maintained
                if (type === 'networkSegments' && currentTreeNode) {
                    const missionNetworkId = currentTreeNode.getAttribute('data-parent-mission-network') || 
                                           (currentTreeNode.getAttribute('data-id'));
                    if (missionNetworkId && !element.parentMissionNetwork) {
                        // If we're viewing network segments from a mission network tree node, store the parent reference
                        element.parentMissionNetwork = { id: missionNetworkId };
                    }
                }
                
                console.log('Selected element:', { ...currentElement, type }); // Debug log with type
            
            // Ensure parent references for hierarchy are populated
            if (type === 'assets') {
                // For assets, we need to ensure all parent references are set
                // Try to get from current element first
                let hwStackId = element.hwStackId || element.parentStack;
                
                // If not found and we have a currentTreeNode, get from there
                if ((!hwStackId || hwStackId === 'undefined') && currentTreeNode) {
                    hwStackId = currentTreeNode.getAttribute('data-parent-stack');
                    element.parentDomain = currentTreeNode.getAttribute('data-parent-domain');
                    element.parentSegment = currentTreeNode.getAttribute('data-parent-segment');
                    element.parentMissionNetwork = currentTreeNode.getAttribute('data-parent-mission-network');
                }
                
                // Ensure we store it in both places for redundancy and as a string
                if (typeof hwStackId === 'object' && hwStackId !== null) {
                    element.parentStack = hwStackId.id || '';
                    element.hwStackId = hwStackId.id || '';
                } else {
                    element.parentStack = hwStackId;
                    element.hwStackId = hwStackId;
                }
                
                console.log('Enhanced asset parent references:', {
                    hwStackId: element.hwStackId,
                    parentStack: element.parentStack,
                    parentDomain: element.parentDomain,
                    parentSegment: element.parentSegment,
                    parentMissionNetwork: element.parentMissionNetwork
                });
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
            detailsContainer.innerHTML = '';
        }
        
        // Ensure the corresponding element card is highlighted
        if (element && element.id) {
            // First remove active class from all element cards
            document.querySelectorAll('.element-card.active').forEach(card => {
                card.classList.remove('active');
            });
            
            // Find and highlight the card that corresponds to the element being displayed
            const cardToHighlight = document.querySelector(`.element-card[data-id="${element.id}"]`);
            if (cardToHighlight) {
                cardToHighlight.classList.add('active');
                // Card highlighted
            } else {
                // Card not found to highlight
            }
        }
        
        // Update the details title
        if (detailsTitle) {
            // For security domains, look up the classification name
            if (type === 'securityDomains') {
                const classification = getSecurityClassificationById(element.id);
                detailsTitle.textContent = `${classification.name} Details`;
            } else {
                detailsTitle.textContent = `${element.name} Details`;
            }
        }
        
        // Create a card to display the details
        const detailCard = document.createElement('div');
        detailCard.className = 'card m-3';
        
        // Create the card header
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header d-flex align-items-center';
        
        // For security domains, use the classification name
        if (type === 'securityDomains') {
            const classification = getSecurityClassificationById(element.id);
            const iconPath = getElementIcon(type);
            cardHeader.innerHTML = `
                <img src="${iconPath}" alt="${type}" class="icon-small me-2" style="width: 20px; height: 20px;">
                <h5 class="mb-0">${classification.name}</h5>
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
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        // Create a table for the details
        const table = document.createElement('table');
        table.className = 'table table-bordered';
        
        // Add the basic details rows
        if (type === 'securityDomains') {
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
                        <td>${classification.id || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">GUID</th>
                        <td>${classification.guid || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">Releasability</th>
                        <td>${classification.releasabilityString || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">Order</th>
                        <td>${classification.order || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">Color</th>
                        <td>
                            <span style="display: inline-block; width: 20px; height: 20px; background-color: ${classification.colour || '#808080'}; margin-right: 5px; vertical-align: middle;"></span>
                            ${classification.colour || 'N/A'}
                        </td>
                    </tr>
                </tbody>
            `;
        } else {
            table.innerHTML = `
                <tbody>
                    <tr>
                        <th scope="row">Name</th>
                        <td>${element.name}</td>
                    </tr>
                    <tr>
                        <th scope="row">ID</th>
                        <td>${element.id || 'N/A'}</td>
                    </tr>
                    <tr>
                        <th scope="row">GUID</th>
                        <td>${element.guid || 'N/A'}</td>
                    </tr>
                </tbody>
            `;
        }
        
        // Add type-specific details
        // This can be expanded based on the different element types
        if (type === 'hwStacks' && element.cisParticipantID) {
            // Add the participant ID row
            table.querySelector('tbody').innerHTML += `
                <tr>
                    <th scope="row">CIS Participant ID</th>
                    <td>${element.cisParticipantID}</td>
                </tr>
            `;
            
            // Add participant name asynchronously
            (async function() {
                const participantName = await getParticipantNameByKey(element.cisParticipantID);
                
                // Only add the row if we got a valid name that's different from the key
                if (participantName !== element.cisParticipantID && participantName !== 'N/A') {
                    // Check if the details panel is still showing the same element
                    if (currentElement && currentElement.id === element.id) {
                        const participantRow = document.createElement('tr');
                        participantRow.innerHTML = `
                            <th scope="row">CIS Participant</th>
                            <td>${participantName}</td>
                        `;
                        
                        table.querySelector('tbody').appendChild(participantRow);
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
    
    // Search functionality for the tree
    function handleTreeSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const treeNodes = document.querySelectorAll('#cisTree .tree-node');
        let matchFound = false;
        
        // Clear any previous selection from search
        document.querySelectorAll('.tree-node.search-selected').forEach(node => {
            node.classList.remove('search-selected');
        });
        
        // If search is empty, show all nodes
        if (searchTerm === '') {
            treeNodes.forEach(node => {
                node.style.display = 'flex';
                node.classList.remove('search-match');
                // Show collapse/expand icons
                const toggleIcon = node.querySelector('.toggle-icon');
                if (toggleIcon) toggleIcon.style.visibility = 'visible';
            });
            // Reset all parent nodes
            document.querySelectorAll('.parent-node').forEach(parentNode => {
                const childContainer = parentNode.nextElementSibling;
                if (childContainer && childContainer.classList.contains('child-container')) {
                    childContainer.style.display = parentNode.classList.contains('expanded') ? 'block' : 'none';
                }
            });
            return;
        }
        
        // First pass: Find matching nodes
        const matchingNodes = new Set();
        const directMatchingNodes = [];
        
        treeNodes.forEach(node => {
            const nodeText = node.textContent.toLowerCase();
            const nodeId = node.getAttribute('data-id');
            const nodeName = node.querySelector('.node-name')?.textContent.toLowerCase() || '';
            
            // Check for matches in node text or specifically in the node name
            if (nodeText.includes(searchTerm) || nodeName.includes(searchTerm)) {
                matchingNodes.add(nodeId);
                directMatchingNodes.push(node);
                matchFound = true;
                
                // Also add all parent nodes to ensure hierarchy is maintained
                let parentNode = node.parentElement;
                while (parentNode) {
                    const parentTreeNode = parentNode.closest('.tree-node');
                    if (parentTreeNode) {
                        matchingNodes.add(parentTreeNode.getAttribute('data-id'));
                        parentNode = parentTreeNode.parentElement;
                    } else {
                        break;
                    }
                }
            }
        });
        
        // Second pass: Show/hide based on matches
        treeNodes.forEach(node => {
            const nodeId = node.getAttribute('data-id');
            if (matchingNodes.has(nodeId)) {
                node.style.display = 'flex';
                
                // Only add search-match class to direct matches, not parent nodes
                if (directMatchingNodes.includes(node)) {
                    node.classList.add('search-match');
                }
                
                // Ensure all parent containers are visible
                let parentContainer = node.parentElement;
                while (parentContainer) {
                    if (parentContainer.classList.contains('child-container')) {
                        parentContainer.style.display = 'block';
                        
                        // Also expand the corresponding parent node
                        const parentTreeNode = parentContainer.previousElementSibling;
                        if (parentTreeNode && parentTreeNode.classList.contains('parent-node')) {
                            parentTreeNode.classList.add('expanded');
                        }
                    }
                    parentContainer = parentContainer.parentElement;
                }
            } else {
                node.style.display = 'none';
                node.classList.remove('search-match');
            }
        });
        
        // Show a message if no matches found
        const noMatchMessage = document.getElementById('treeNoMatchMessage');
        if (!noMatchMessage && !matchFound) {
            const message = document.createElement('div');
            message.id = 'treeNoMatchMessage';
            message.className = 'alert alert-info mt-2';
            message.textContent = 'No matching items found';
            document.getElementById('cisTree').appendChild(message);
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
        document.querySelectorAll('#elementsContainer .search-match').forEach(el => {
            el.classList.remove('search-match');
        });
        
        // If search is empty, show everything
        if (searchTerm === '') {
            // Show all regular element cards
            document.querySelectorAll('#elementsContainer .col').forEach(col => {
                col.style.display = 'block';
            });
            // Show all assets
            document.querySelectorAll('#elementsContainer .asset-item').forEach(asset => {
                asset.closest('.col').style.display = 'block';
                // Clear the yellow highlight
                asset.style.backgroundColor = '';
                // Reset any animations
                asset.style.animation = 'none';
            });
            
            // Update elements count in title
            updateElementsCount();
            
            // Remove any no-match message
            const noMatchMessage = document.getElementById('elementsNoMatchMessage');
            if (noMatchMessage) noMatchMessage.remove();
            
            return;
        }
        
        // Step 1: Search regular element cards
        const elementCards = document.querySelectorAll('#elementsContainer .element-card');
        elementCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            const cardName = card.querySelector('.element-card-title')?.textContent.toLowerCase() || '';
            const cardType = card.getAttribute('data-type')?.toLowerCase() || '';
            
            // Improved matching: check title, content, and type attributes
            if (cardText.includes(searchTerm) || 
                cardName.includes(searchTerm) || 
                cardType.includes(searchTerm)) {
                
                const columnElement = card.closest('.col');
                if (columnElement) {
                    columnElement.style.display = 'block';
                    matchFound = true;
                    card.classList.add('search-match');
                    
                    // Add subtle highlight animation for matched cards
                    card.style.animation = 'none';
                    setTimeout(() => {
                        card.style.animation = 'highlight-pulse 1s';
                    }, 10);
                }
            } else {
                const columnElement = card.closest('.col');
                if (columnElement) {
                    columnElement.style.display = 'none';
                }
            }
        });
        
        // Step 2: Search asset items (which have a different structure)
        const assetItems = document.querySelectorAll('#elementsContainer .asset-item');
        assetItems.forEach(asset => {
            const assetText = asset.textContent.toLowerCase();
            const assetName = asset.querySelector('.asset-name')?.textContent.toLowerCase() || '';
            const assetType = asset.getAttribute('data-type')?.toLowerCase() || '';
            
            if (assetText.includes(searchTerm) || 
                assetName.includes(searchTerm) || 
                assetType.includes(searchTerm)) {
                
                const columnElement = asset.closest('.col');
                if (columnElement) {
                    columnElement.style.display = 'block';
                    matchFound = true;
                    asset.classList.add('search-match');
                    
                    // Add highlight animation
                    asset.style.animation = 'none';
                    setTimeout(() => {
                        asset.style.animation = 'highlight-pulse 1s';
                    }, 10);
                    
                    // For assets in the compact view, add a stronger highlight
                    asset.style.backgroundColor = 'rgba(255, 255, 0, 0.1)';
                }
            } else {
                const columnElement = asset.closest('.col');
                if (columnElement) {
                    columnElement.style.display = 'none';
                }
            }
        });
        
        // Show a message if no matches found and search is not empty
        const elementsContainer = document.getElementById('elementsContainer');
        const noMatchMessage = document.getElementById('elementsNoMatchMessage');
        
        if (!matchFound) {
            if (!noMatchMessage) {
                const message = document.createElement('div');
                message.id = 'elementsNoMatchMessage';
                message.className = 'alert alert-info mt-2';
                message.textContent = 'No matching elements found';
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
        const visibleCount = document.querySelectorAll('#elementsContainer .col[style="display: block;"]').length;
        const elementsTitle = document.getElementById('elementsTitle');
        if (elementsTitle) {
            const titleText = elementsTitle.textContent.split('(')[0].trim();
            elementsTitle.textContent = `${titleText} (${visibleCount})`;
        }
    }
});

// Function to find and select a node in the tree by type and ID
function findAndSelectTreeNode(type, id) {
    // First, find the node in the tree
    const targetNode = document.querySelector(`.tree-node[data-type="${type}"][data-id="${id}"]`);
    
    if (!targetNode) {
        console.log(`Node not found: type=${type}, id=${id}`);
        return false; // Return false to indicate failure
    }
    
    // Ensure all parent containers are expanded
    let parentContainer = targetNode.parentElement;
    while (parentContainer) {
        if (parentContainer.classList.contains('child-container')) {
            parentContainer.style.display = 'block';
            
            // Also expand the corresponding parent node
            const parentTreeNode = parentContainer.previousElementSibling;
            if (parentTreeNode && parentTreeNode.classList.contains('parent-node')) {
                parentTreeNode.classList.add('expanded');
            }
        }
        parentContainer = parentContainer.parentElement;
    }
    
    // Clear any previous selection
    document.querySelectorAll('.tree-node.selected').forEach(node => {
        node.classList.remove('selected');
    });
    
    // Select the target node and ensure it's visible
    targetNode.classList.add('selected');
    targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Update currentTreeNode reference
    currentTreeNode = targetNode;
    
    // Simulate a click to load its children and update the UI
    targetNode.click();
    
    // Add visual feedback
    targetNode.style.animation = 'none';
    setTimeout(() => {
        targetNode.style.animation = 'highlight-pulse 1s';
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
        console.log('Navigating up from element type:', type);
        
        // Handle based on element type
        if (type === 'assets') {
            // For assets, we need to find the parent HW Stack
            // First check if there's a parentStack or hwStackId property
            let parentStack = currentElement.parentStack || currentElement.hwStackId;
            
            // Extract ID if it's an object
            if (parentStack && typeof parentStack === 'object' && parentStack.id) {
                parentNodeId = parentStack.id;
            } else {
                parentNodeId = parentStack;
            }
            
            // If not found, try to get from parent attributes
            if (!parentNodeId && currentTreeNode) {
                parentNodeId = currentTreeNode.getAttribute('data-parent-stack');
            }
            
            if (parentNodeId) {
                console.log('Navigating up to HW Stack ID:', parentNodeId);
                if (findAndSelectTreeNode('hwStacks', parentNodeId)) {
                    // Reset currentElement to ensure next navigation works
                    currentElement = null;
                }
                return;
            }
        } 
        else if (type === 'hwStacks') {
            // For HW Stacks, we need to find the parent Security Domain
            let parentDomain = currentElement.parentDomain || currentElement.domainId;
            
            // Extract ID if it's an object
            if (parentDomain && typeof parentDomain === 'object' && parentDomain.id) {
                parentNodeId = parentDomain.id;
            } else {
                parentNodeId = parentDomain;
            }
            
            if (!parentNodeId && currentTreeNode) {
                parentNodeId = currentTreeNode.getAttribute('data-parent-domain');
            }
            
            if (parentNodeId) {
                console.log('Navigating up to Security Domain ID:', parentNodeId);
                if (findAndSelectTreeNode('securityDomains', parentNodeId)) {
                    // Reset currentElement to ensure next navigation works
                    currentElement = null;
                }
                return;
            }
        } 
        else if (type === 'securityDomains') {
            // For Security Domains, navigate to parent Network Segment
            let parentSegment = currentElement.parentSegment || currentElement.segmentId;
            
            // Extract ID if it's an object
            if (parentSegment && typeof parentSegment === 'object' && parentSegment.id) {
                parentNodeId = parentSegment.id;
            } else {
                parentNodeId = parentSegment;
            }
            
            if (!parentNodeId && currentTreeNode) {
                parentNodeId = currentTreeNode.getAttribute('data-parent-segment');
            }
            
            if (parentNodeId) {
                console.log('Navigating up to Network Segment ID:', parentNodeId);
                if (findAndSelectTreeNode('networkSegments', parentNodeId)) {
                    // Reset currentElement to ensure next navigation works
                    currentElement = null;
                }
                return;
            }
        } 
        else if (type === 'networkSegments') {
            // For Network Segments, navigate to parent Mission Network
            let parentMissionNetwork = currentElement.parentMissionNetwork;
            
            // Extract ID if it's an object
            if (parentMissionNetwork && typeof parentMissionNetwork === 'object' && parentMissionNetwork.id) {
                parentNodeId = parentMissionNetwork.id;
            } else {
                parentNodeId = parentMissionNetwork;
            }
            
            if (!parentNodeId && currentTreeNode) {
                parentNodeId = currentTreeNode.getAttribute('data-parent-mission-network');
            }
            
            if (parentNodeId) {
                console.log('Navigating up to Mission Network ID:', parentNodeId);
                if (findAndSelectTreeNode('missionNetworks', parentNodeId)) {
                    // Reset currentElement to ensure next navigation works
                    currentElement = null;
                }
                return;
            }
        } 
        else if (type === 'missionNetworks') {
            // Go to the root node
            const rootNode = document.querySelector('.tree-node[data-id="root-cisplan"]');
            if (rootNode) rootNode.click();
            return;
        }
    }
    
    // Fallback to current tree node if we haven't returned yet
    if (!currentTreeNode) return;
    
    // Get the parent node's ID based on data attributes
    const nodeType = currentTreeNode.getAttribute('data-type');
    
    if (nodeType === 'assets') {
        parentNodeId = currentTreeNode.getAttribute('data-parent-stack');
        if (parentNodeId) {
            // Find and select the parent HW Stack node
            if (findAndSelectTreeNode('hwStacks', parentNodeId)) {
                // Reset currentElement to ensure next navigation works
                currentElement = null;
            }
        }
    } else if (nodeType === 'hwStacks') {
        parentNodeId = currentTreeNode.getAttribute('data-parent-domain');
        if (parentNodeId) {
            // Find and select the parent Security Domain node
            if (findAndSelectTreeNode('securityDomains', parentNodeId)) {
                // Reset currentElement to ensure next navigation works
                currentElement = null;
            }
        }
    } else if (nodeType === 'securityDomains') {
        parentNodeId = currentTreeNode.getAttribute('data-parent-segment');
        if (parentNodeId) {
            // Find and select the parent Network Segment node
            if (findAndSelectTreeNode('networkSegments', parentNodeId)) {
                // Reset currentElement to ensure next navigation works
                currentElement = null;
            }
        }
    } else if (nodeType === 'networkSegments') {
        parentNodeId = currentTreeNode.getAttribute('data-parent-mission-network');
        if (parentNodeId) {
            // Find and select the parent Mission Network node
            if (findAndSelectTreeNode('missionNetworks', parentNodeId)) {
                // Reset currentElement to ensure next navigation works
                currentElement = null;
            }
        }
    } else if (nodeType === 'missionNetworks') {
        // Go to the root node
        const rootNode = document.querySelector('.tree-node[data-id="root-cisplan"]');
        if (rootNode) {
            rootNode.click();
            // Reset currentElement to ensure next navigation works
            currentElement = null;
        }
    }
}

// No longer needed as we're using a different navigation approach

// Add new function to focus the first matching tree node
function focusFirstMatchingTreeNode() {
    const searchTerm = document.getElementById('treeSearchInput').value.toLowerCase();
    if (!searchTerm) return;
    
    // Find all matching nodes that are currently visible
    const matchingNodes = document.querySelectorAll('#cisTree .tree-node.search-match');
    if (matchingNodes.length === 0) return;
    
    // Clear any previous selection
    document.querySelectorAll('.tree-node.selected').forEach(node => {
        node.classList.remove('selected');
    });
    document.querySelectorAll('.tree-node.search-selected').forEach(node => {
        node.classList.remove('search-selected');
    });
    
    // Focus on the first matching node
    const firstMatchingNode = matchingNodes[0];
    firstMatchingNode.classList.add('selected');
    firstMatchingNode.classList.add('search-selected');
    
    // Scroll the node into view with a smooth animation
    firstMatchingNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Simulate a click to load its details
    firstMatchingNode.click();
    
    // Add visual feedback
    firstMatchingNode.style.animation = 'none';
    setTimeout(() => {
        firstMatchingNode.style.animation = 'highlight-pulse 1s';
    }, 10);
    
    // No longer updating breadcrumb since we're not using it
}

// Add CSS for search highlighting
document.addEventListener('DOMContentLoaded', function() {
    // Add search highlight styles to head
    const style = document.createElement('style');
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

// ---- Entity Metadata (Quick Win Refactor) ----
// Centralized meta for entity labels and icons
const ENTITY_META = {
    cisplan:            { label: 'CIS Plan',            icon: '/static/img/CIS-PLAN.svg' },
    missionNetworks:     { label: 'Mission Network',     icon: '/static/img/missionNetworks.svg' },
    networkSegments:     { label: 'Network Segment',     icon: '/static/img/networkSegments.svg' },
    securityDomains:     { label: 'Security Domain',     icon: '/static/img/securityDomains.svg' },
    hwStacks:            { label: 'HW Stack',            icon: '/static/img/hwStacks.svg' },
    assets:              { label: 'Asset',               icon: '/static/img/assets.svg' },
    networkInterfaces:   { label: 'Network Interface',   icon: '/static/img/networkInterfaces.svg' },
    gpInstances:         { label: 'Generic Product',     icon: '/static/img/gpInstances.svg' },
    configurationItems:  { label: 'Configuration Item',  icon: '/static/img/configurationItems.svg' },
    spInstances:         { label: 'Specific Product',    icon: '/static/img/spInstances.svg' }
};

// ---- Entity Children Mapping (Config-Driven Panel Rendering) ----
// Maps each node type to its child collections and types
const ENTITY_CHILDREN = {
    missionNetworks:   [{ key: 'networkSegments', type: 'networkSegments' }],
    networkSegments:   [{ key: 'securityDomains', type: 'securityDomains' }],
    securityDomains:   [{ key: 'hwStacks', type: 'hwStacks' }],
    hwStacks:          [{ key: 'assets', type: 'assets' }],
    assets: [
        { key: 'networkInterfaces', type: 'networkInterfaces' },
        { key: 'gpInstances', type: 'gpInstances' }
    ],
    gpInstances: [
        { key: 'spInstances', type: 'spInstances' },
        { key: 'configurationItems', type: 'configurationItems' }
    ]
    // Add more as needed
};

// Minimal utility namespace - keeps backward compatibility
const CISUtils = {
    // Format node type name for display
    formatNodeTypeName: function(type) {
        return ENTITY_META[type]?.label || type
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, function(str) { return str.toUpperCase(); })
            .trim();
    },
    
    // Get SVG icon path for a specific element type
    getElementIcon: function(type) {
        return ENTITY_META[type]?.icon || '/static/img/default.svg';
    },
    
    // Show a toast notification
    showToast: function(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        const toastId = 'toast-' + Date.now();
        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center text-white bg-${type} border-0`;
        toastEl.id = toastId;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        toastContainer.appendChild(toastEl);
        
        const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: 5000 });
        toast.show();
        
        // Auto-remove the toast element after it hides
        toastEl.addEventListener('hidden.bs.toast', function() {
            toastEl.remove();
        });
    },
    
    // Get participant name by key from the API
    getParticipantNameByKey: async function(key) {
        if (!key) return 'N/A';
        
        try {
            const response = await fetch(`/api/participants/name_by_key?key=${encodeURIComponent(key)}`);
            const result = await response.json();
            if (result.status === 'success') {
                return result.name || key; // Return name if found, otherwise return the key
            } else {
                console.warn('Participant name not found for key:', key);
                return key; // Return the key if not found
            }
        } catch (error) {
            console.error('Error getting participant name:', error);
            return key; // Return the key if there's an error
        }
    }
};

// API namespace is already defined - removed redundant declaration

// API functionality namespace - slimmed down version
const CISApi = {
    // Fetch CIS Plan tree data
    fetchCISPlanData: async function() {
        try {
            // Show loading indicator in the tree
            cisTree.innerHTML = `
                <div class="d-flex justify-content-center p-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;
            
            // Make API request to get CIS Plan data
            const response = await fetch('/api/cis_plan/tree');
            if (!response.ok) {
                throw new Error(`Failed to fetch CIS Plan data: ${response.statusText}`);
            }
            
            const result = await response.json();
            if (result.status === 'success') {
                // Store the data and render the tree
                data = result.data;
                return result.data;
            } else {
                cisTree.innerHTML = `
                    <div class="alert alert-danger m-3">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Error fetching CIS Plan data: ${result.message || 'Unknown error'}
                    </div>
                `;
                console.error('Error fetching CIS Plan data:', result.message);
                return null;
            }
        } catch (error) {
            cisTree.innerHTML = `
                <div class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error fetching CIS Plan data: ${error.message || 'Unknown error'}
                </div>
            `;
            console.error('Error fetching CIS Plan data:', error);
            return null;
        }
    },
    
    // Fetch security classifications from the API
    fetchSecurityClassifications: async function() {
        try {
            const response = await fetch('/api/cis_security_classification/all');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch security classifications: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success') {
                // Return the classifications data
                return result.data.securityClassifications || [];
            } else {
                console.error('Failed to load security classifications:', result.message);
                return [];
            }
        } catch (error) {
            console.error('Error fetching security classifications:', error);
            return [];
        }
    },
    
    // Fetch participants from the API
    fetchParticipants: async function() {
        try {
            const response = await fetch('/api/participants');
            if (!response.ok) {
                throw new Error(`Failed to fetch participants: ${response.statusText}`);
            }
            
            const result = await response.json();
            if (result.status === 'success') {
                return result.data || [];
            } else {
                console.error('Failed to load participants:', result.message);
                return [];
            }
        } catch (error) {
            console.error('Error loading participants:', error);
            return [];
        }
    },
    
    // Add a security domain to a network segment
    addSecurityDomain: async function(missionNetworkId, segmentId, classificationId) {
        try {
            const response = await fetch(`/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    id: classificationId 
                })
            });
            
            const result = await response.json();
            
            return {
                success: response.ok,
                status: response.status,
                data: result,
                error: result.error || null
            };
        } catch (error) {
            console.error('Error in addSecurityDomain API call:', error);
            return {
                success: false,
                error: error.message || 'Network error occurred',
                status: 0
            };
        }
    },
    
    // Delete an item from the CIS Plan based on its type and IDs
    deleteItem: async function(type, id, parentIds) {
        try {
            let endpoint = '';
            
            // Construct the appropriate endpoint based on item type
            if (type === 'missionNetworks') {
                endpoint = `/api/cis_plan/mission_network/${id}`;
            }
            else if (type === 'networkSegments') {
                const missionNetworkId = parentIds; // For segments, parentIds is just the mission network ID
                endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${id}`;
            }
            else if (type === 'securityDomains') {
                const [missionNetworkId, segmentId] = Array.isArray(parentIds) ? parentIds : parentIds.split(',');
                endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${id}`;
            }
            else if (type === 'hwStacks') {
                const [missionNetworkId, segmentId, domainId] = Array.isArray(parentIds) ? parentIds : parentIds.split(',');
                endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${id}`;
            }
            else if (type === 'assets') {
                const [missionNetworkId, segmentId, domainId, hwStackId] = Array.isArray(parentIds) ? parentIds : parentIds.split(',');
                endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${domainId}/hw_stacks/${hwStackId}/assets/${id}`;
            }
            
            if (!endpoint) {
                return {
                    success: false,
                    error: `Unknown item type: ${type}`,
                    status: 400
                };
            }
            
            // Make the DELETE request
            const response = await fetch(endpoint, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            return {
                success: response.ok,
                status: response.status,
                data: result,
                message: result.message || ''
            };
        } catch (error) {
            console.error(`Error in deleteItem API call for ${type}:`, error);
            return {
                success: false,
                error: error.message || 'Network error occurred',
                status: 0
            };
        }
    },
    
    // Add a new mission network to the CIS Plan
    addMissionNetwork: async function(name) {
        try {
            // Validate the input
            if (!name || typeof name !== 'string' || name.trim() === '') {
                return {
                    success: false,
                    error: 'Mission network name is required',
                    status: 400
                };
            }
            
            // Make the API request
            const response = await fetch('/api/cis_plan/mission_network', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name.trim() })
            });
            
            const result = await response.json();
            
            return {
                success: response.ok,
                status: response.status,
                data: result,
                message: result.message || ''
            };
        } catch (error) {
            console.error('Error in addMissionNetwork API call:', error);
            return {
                success: false,
                error: error.message || 'Network error occurred',
                status: 0
            };
        }
    },
    
    // Add a new network segment to a mission network
    addNetworkSegment: async function(missionNetworkId, name) {
        try {
            // Validate the input
            if (!name || typeof name !== 'string' || name.trim() === '') {
                return {
                    success: false,
                    error: 'Network segment name is required',
                    status: 400
                };
            }
            
            if (!missionNetworkId) {
                return {
                    success: false,
                    error: 'Mission network ID is required',
                    status: 400
                };
            }
            
            // Make the API request
            const response = await fetch(`/api/cis_plan/mission_network/${missionNetworkId}/segment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name.trim() })
            });
            
            const result = await response.json();
            
            return {
                success: response.ok,
                status: response.status,
                data: result,
                message: result.message || ''
            };
        } catch (error) {
            console.error('Error in addNetworkSegment API call:', error);
            return {
                success: false,
                error: error.message || 'Network error occurred',
                status: 0
            };
        }
    },
    
    // Update an existing network segment
    updateNetworkSegment: async function(missionNetworkId, segmentId, name) {
        try {
            // Validate the input
            if (!name || typeof name !== 'string' || name.trim() === '') {
                return {
                    success: false,
                    error: 'Network segment name is required',
                    status: 400
                };
            }
            
            if (!missionNetworkId) {
                return {
                    success: false,
                    error: 'Mission network ID is required',
                    status: 400
                };
            }
            
            if (!segmentId) {
                return {
                    success: false,
                    error: 'Segment ID is required',
                    status: 400
                };
            }
            
            // Make the API request
            const response = await fetch(`/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name.trim() })
            });
            
            const result = await response.json();
            
            return {
                success: response.ok,
                status: response.status,
                data: result,
                message: result.message || ''
            };
        } catch (error) {
            console.error('Error in updateNetworkSegment API call:', error);
            return {
                success: false,
                error: error.message || 'Network error occurred',
                status: 0
            };
        }
    },
    
    // Update an existing mission network
    updateMissionNetwork: async function(id, name) {
        try {
            // Validate the input
            if (!name || typeof name !== 'string' || name.trim() === '') {
                return {
                    success: false,
                    error: 'Mission network name is required',
                    status: 400
                };
            }
            
            if (!id) {
                return {
                    success: false,
                    error: 'Mission network ID is required',
                    status: 400
                };
            }
            
            // Make the API request
            const response = await fetch(`/api/cis_plan/mission_network/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: name.trim() })
            });
            
            const result = await response.json();
            
            return {
                success: response.ok,
                status: response.status,
                data: result,
                message: result.message || ''
            };
        } catch (error) {
            console.error('Error in updateMissionNetwork API call:', error);
            return {
                success: false,
                error: error.message || 'Network error occurred',
                status: 0
            };
        }
    }
};
    
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
