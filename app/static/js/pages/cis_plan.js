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
    console.log('CIS Plan JS loaded');
    
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
    
    // Add event listeners for search inputs
    treeSearchInput.addEventListener('input', handleTreeSearch);
    elementsSearchInput.addEventListener('input', handleElementsSearch);
    
    // Add event listeners for buttons
    if (refreshButton) {
        refreshButton.addEventListener('click', fetchCISPlanData);
    }
    
    // Add element button opens the appropriate modal based on current selection
    if (addElementButton) {
        addElementButton.addEventListener('click', function() {
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
    
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', deleteItem);
    }
    
    // Initial data load
    fetchCISPlanData();
    
    // Show a toast notification
    function showToast(message, type = 'success') {
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
    }
    
    // Add a new mission network
    async function addMissionNetwork() {
        const nameInput = document.getElementById('addMissionNetworkName');
        const name = nameInput.value.trim();
        
        if (!name) {
            showToast('Please enter a mission network name', 'warning');
            return;
        }
        
        try {
            const response = await fetch('/api/cis_plan/mission_network', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });
            
            const result = await response.json();
            
            if (response.ok) {
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
                showToast(`${result.message || 'Failed to create mission network'}`, 'danger');
            }
        } catch (error) {
            console.error('Error adding mission network:', error);
            showToast('An error occurred while creating the mission network', 'danger');
        }
    }
    
    // Update an existing mission network
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
            const response = await fetch(`/api/cis_plan/mission_network/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });
            
            const result = await response.json();
            
            if (response.ok) {
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
                showToast(`${result.message || 'Failed to update mission network'}`, 'danger');
            }
        } catch (error) {
            console.error('Error updating mission network:', error);
            showToast('An error occurred while updating the mission network', 'danger');
        }
    }
    
    // Add a new network segment
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
            const response = await fetch(`/api/cis_plan/mission_network/${missionNetworkId}/segment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });
            
            const result = await response.json();
            
            if (response.ok) {
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
                showToast(`${result.message || 'Failed to create network segment'}`, 'danger');
            }
        } catch (error) {
            console.error('Error adding network segment:', error);
            showToast('An error occurred while creating the network segment', 'danger');
        }
    }
    
    // Update an existing network segment
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
            const response = await fetch(`/api/cis_plan/mission_network/${missionNetworkId}/segment/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });
            
            const result = await response.json();
            
            if (response.ok) {
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
                showToast(`${result.message || 'Failed to update network segment'}`, 'danger');
            }
        } catch (error) {
            console.error('Error updating network segment:', error);
            showToast('An error occurred while updating the network segment', 'danger');
        }
    }
    
    // Store security classifications data
    let securityClassifications = [];
    
    // Fetch security classifications for dropdown
    async function fetchSecurityClassifications() {
        try {
            const response = await fetch('/api/cis_security_classification/all');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch security classifications: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success') {
                // Store the data
                securityClassifications = result.data.securityClassifications || [];
                
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
            } else {
                showToast('Failed to load security classifications', 'danger');
                return [];
            }
        } catch (error) {
            console.error('Error fetching security classifications:', error);
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
        
        // Get the selected classification object
        const selectedOption = classificationSelect.options[classificationSelect.selectedIndex];
        const name = selectedOption.textContent;
        const guid = selectedOption.getAttribute('data-guid');
        
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
            
            if (response.ok) {
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
                
                try {
                    // Refresh tree, which will erase the current DOM
                    await fetchCISPlanData();
                    
                    // After data is fetched and DOM is rebuilt, find our nodes
                    // Use a longer timeout to ensure the DOM is fully rebuilt
                    setTimeout(() => {
                        console.log('Trying to restore selection after adding security domain');
                        console.log(`Looking for segment ID: ${segmentId} and mission network ID: ${missionNetworkId}`);
                        
                        // Try multiple selector patterns to find the segment node
                        let segmentNode = document.querySelector(`div.tree-node[data-type="networkSegments"][data-id="${segmentId}"]`);
                        
                        if (!segmentNode) {
                            // Fallback to a less specific selector
                            console.log('First segment selector failed, trying alternative selector');
                            segmentNode = document.querySelector(`[data-type="networkSegments"][data-id="${segmentId}"]`);
                        }
                        
                        if (!segmentNode) {
                            // Try a different approach - first find mission network, then find the segment within it
                            console.log('Both segment selectors failed, trying to find via parent mission network');
                            const missionNetwork = document.querySelector(`[data-type="missionNetworks"][data-id="${missionNetworkId}"]`);
                            
                            if (missionNetwork) {
                                console.log('Found mission network, checking its children for segment');
                                const mnChildren = missionNetwork.nextElementSibling;
                                
                                if (mnChildren && mnChildren.classList.contains('tree-node-children')) {
                                    // Ensure mission network is expanded
                                    mnChildren.style.display = 'block';
                                    
                                    // Update toggle icon
                                    const mnToggleIcon = missionNetwork.querySelector('.tree-toggle i');
                                    if (mnToggleIcon) {
                                        mnToggleIcon.className = 'fas fa-chevron-down';
                                    }
                                    
                                    // Now look for the segment within the mission network's children
                                    segmentNode = mnChildren.querySelector(`[data-id="${segmentId}"]`);
                                    console.log('Searched within mission network children, found segment:', !!segmentNode);
                                }
                            }
                        }
                        
                        if (segmentNode) {
                            console.log(`Found segment node ${segmentId}, looking for newly added security domain`);
                            
                            // First ensure segment node is expanded
                            let parent = segmentNode.parentElement;
                            while (parent) {
                                if (parent.classList.contains('tree-node-children')) {
                                    parent.style.display = 'block';
                                    // If this is under a mission network, make sure its toggle is updated
                                    const parentTreeNode = parent.previousElementSibling;
                                    if (parentTreeNode && parentTreeNode.querySelector('.tree-toggle i')) {
                                        parentTreeNode.querySelector('.tree-toggle i').className = 'fas fa-chevron-down';
                                    }
                                }
                                parent = parent.parentElement;
                            }
                            
                            // Make sure segment node is expanded
                            const childrenContainer = segmentNode.nextElementSibling;
                            if (childrenContainer && childrenContainer.classList.contains('tree-node-children')) {
                                childrenContainer.style.display = 'block';
                                
                                // Update toggle icon
                                const toggleIcon = segmentNode.querySelector('.tree-toggle i');
                                if (toggleIcon) {
                                    toggleIcon.className = 'fas fa-chevron-down';
                                }
                                
                                // Find all security domains
                                let allSecurityDomains = childrenContainer.querySelectorAll('.tree-node[data-type="securityDomains"]');
                                console.log(`Found ${allSecurityDomains.length} security domains under segment`);
                                
                                // Find the one we just added by name
                                let securityDomainNode = null;
                                allSecurityDomains.forEach(node => {
                                    const nodeName = node.querySelector('.tree-node-text').textContent.trim();
                                    if (nodeName === securityDomainName) {
                                        securityDomainNode = node;
                                        console.log('Found security domain by name match:', nodeName);
                                    }
                                });
                                
                                // If not found by name, take the last one which is likely the newest
                                if (!securityDomainNode && allSecurityDomains.length > 0) {
                                    securityDomainNode = allSecurityDomains[allSecurityDomains.length - 1];
                                    console.log('Using last security domain as fallback');
                                }
                                
                                if (securityDomainNode) {
                                    console.log('Selecting the security domain node');
                                    
                                    // Update currentTreeNode and UI state
                                    currentTreeNode = securityDomainNode;
                                    
                                    // Remove active class from all nodes
                                    document.querySelectorAll('.tree-node').forEach(node => {
                                        node.classList.remove('active');
                                    });
                                    
                                    // Add active class to the security domain node
                                    securityDomainNode.classList.add('active');
                                    
                                    // Update elements panel for this security domain
                                    const domainId = securityDomainNode.getAttribute('data-id');
                                    
                                    if (elementsContainer) {
                                        const nodeData = {
                                            id: domainId,
                                            type: 'securityDomains'
                                        };
                                        
                                        const parentData = {
                                            segmentId: segmentId,
                                            missionNetworkId: missionNetworkId
                                        };
                                        
                                        // Load hardware stacks for this security domain
                                        loadSelectedNodeChildren(nodeData, 'securityDomains', parentData);
                                    }
                                } else {
                                    // If we can't find the security domain, select the segment as fallback
                                    console.log('Could not find security domain node, selecting segment instead');
                                    segmentNode.click();
                                }
                            } else {
                                // If we can't expand the segment node, just select it
                                console.log('Could not find children container for segment, selecting segment');
                                segmentNode.click();
                            }
                        } else {
                            // If we can't find the segment node, try to find the mission network
                            console.warn(`Could not find segment node with ID ${segmentId}, falling back to mission network`);
                            const missionNetworkNode = document.querySelector(`div.tree-node[data-type="missionNetworks"][data-id="${missionNetworkId}"]`);
                            
                            if (missionNetworkNode) {
                                console.log('Found mission network, selecting it');
                                missionNetworkNode.click();
                            }
                        }
                    }, 300); // Longer delay to ensure DOM is fully updated
                } catch (refreshError) {
                    console.error('Error refreshing data after adding security domain:', refreshError);
                }
            } else {
                showToast(`${result.message || 'Failed to create security domain'}`, 'danger');
            }
        } catch (error) {
            console.error('Error adding security domain:', error);
            showToast('An error occurred while creating the security domain', 'danger');
        }
    }
    
    // Delete an item (mission network, segment, etc.)
    async function deleteItem() {
        const id = document.getElementById('deleteItemId').value;
        const type = document.getElementById('deleteItemType').value;
        const name = document.getElementById('deleteItemName').textContent;
        
        console.log('Deleting item:', { id, type, name }); // Debug log
        
        let endpoint = '';
        
        // Determine the correct endpoint based on the item type
        if (type === 'missionNetworks') {
            endpoint = `/api/cis_plan/mission_network/${id}`;
        }
        else if (type === 'networkSegments') {
            const missionNetworkId = document.getElementById('deleteItemParentId').value;
            endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${id}`;
        }
        else if (type === 'securityDomains') {
            const parentIds = document.getElementById('deleteItemParentId').value.split(',');
            const missionNetworkId = parentIds[0];
            const segmentId = parentIds[1];
            endpoint = `/api/cis_plan/mission_network/${missionNetworkId}/segment/${segmentId}/security_domain/${id}`;
        }
        // Add other item types as needed
        
        if (!endpoint) {
            showToast('Unknown item type: ' + type, 'warning');
            return;
        }
        
        try {
            const response = await fetch(endpoint, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            // Properly close the modal and clear focus
            const modalElement = document.getElementById('deleteConfirmModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            
            // Blur (unfocus) the confirm button before hiding the modal
            document.getElementById('confirmDeleteBtn').blur();
            
            // Small delay to ensure blur takes effect before closing the modal
            setTimeout(() => {
                modal.hide();
            }, 10);
            
            if (response.ok) {
                // Show success message
                showToast(`${name} deleted successfully!`);
                
                // Store parent info before refreshing
                let parentId = '';
                let parentType = '';
                let missionNetworkId = '';
                
                if (type === 'securityDomains') {
                    // For security domains, we want to restore the segment selection
                    const parentIds = document.getElementById('deleteItemParentId').value.split(',');
                    parentId = parentIds[1]; // Use segment ID
                    missionNetworkId = parentIds[0]; // Store mission network ID
                    parentType = 'networkSegments';
                } else if (type === 'networkSegments') {
                    // For network segments, we want to restore the mission network selection
                    parentId = document.getElementById('deleteItemParentId').value;
                    parentType = 'missionNetworks';
                }
                
                console.log(`Deleted ${type} item, will restore to parent type: ${parentType}, id: ${parentId}`);
                
                // Refresh the data
                fetchCISPlanData().then(() => {
                    console.log(`Refreshed data after deleting ${type} item, will restore to parent type: ${parentType}, id: ${parentId}`);
                    
                    // For security domain deletion, we want to go back to showing the network segment view
                    // to maintain context but show remaining security domains
                    if (type === 'securityDomains') {
                        console.log('Security domain deleted - will restore to parent segment');
                        
                        // Add a small delay to ensure DOM is fully updated
                        setTimeout(() => {
                            console.log(`Looking for parent segment node with ID: ${parentId} after deleting security domain`);
                            
                            // Try multiple selector patterns to find the segment node
                            let segmentNode = document.querySelector(`div.tree-node[data-type="networkSegments"][data-id="${parentId}"]`);
                            
                            if (!segmentNode) {
                                // Fallback to a less specific selector
                                console.log('First segment selector failed, trying alternative selector');
                                segmentNode = document.querySelector(`[data-type="networkSegments"][data-id="${parentId}"]`);
                            }
                            
                            if (!segmentNode) {
                                // Try a different approach - first find mission network, then find the segment within it
                                console.log('Both segment selectors failed, trying to find via parent mission network');
                                const missionNetwork = document.querySelector(`[data-type="missionNetworks"][data-id="${missionNetworkId}"]`);
                                
                                if (missionNetwork) {
                                    console.log('Found mission network, checking its children for segment');
                                    const mnChildren = missionNetwork.nextElementSibling;
                                    
                                    if (mnChildren && mnChildren.classList.contains('tree-node-children')) {
                                        // Ensure mission network is expanded
                                        mnChildren.style.display = 'block';
                                        
                                        // Update toggle icon
                                        const mnToggleIcon = missionNetwork.querySelector('.tree-toggle i');
                                        if (mnToggleIcon) {
                                            mnToggleIcon.className = 'fas fa-chevron-down';
                                        }
                                        
                                        // Now look for the segment within the mission network's children
                                        segmentNode = mnChildren.querySelector(`[data-id="${parentId}"]`);
                                        console.log('Searched within mission network children, found segment:', !!segmentNode);
                                    }
                                }
                            }
                            
                            if (segmentNode) {
                                console.log(`Found parent segment node ${parentId}, selecting it`);
                                
                                // First, expand all parent containers
                                let parent = segmentNode.parentElement;
                                while (parent) {
                                    if (parent.classList.contains('tree-node-children')) {
                                        parent.style.display = 'block';
                                    }
                                    parent = parent.parentElement;
                                }
                                
                                // Set as current tree node
                                currentTreeNode = segmentNode;
                                
                                // Update node highlighting in the tree
                                document.querySelectorAll('.tree-node').forEach(node => {
                                    node.classList.remove('active');
                                });
                                segmentNode.classList.add('active');
                                
                                // Force segment node to expand 
                                const childrenContainer = segmentNode.nextElementSibling;
                                if (childrenContainer && childrenContainer.classList.contains('tree-node-children')) {
                                    childrenContainer.style.display = 'block';
                                    
                                    // Update toggle icon
                                    const toggleIcon = segmentNode.querySelector('.tree-toggle i');
                                    if (toggleIcon) {
                                        toggleIcon.className = 'fas fa-chevron-down';
                                    }
                                }
                                
                                // Update the elements panel to show remaining security domains
                                if (elementsContainer) {
                                    elementsContainer.innerHTML = '';
                                    
                                    const nodeData = {
                                        id: parentId,
                                        type: 'networkSegments'
                                    };
                                    
                                    const parentData = {
                                        missionNetworkId: missionNetworkId
                                    };
                                    
                                    // Load security domains in the elements panel
                                    loadSelectedNodeChildren(nodeData, 'networkSegments', parentData);
                                }
                            } else {
                                // Fallback to mission network if segment not found
                                console.log('Could not find segment, falling back to mission network');
                                const missionNetworkNode = document.querySelector(`div.tree-node[data-type="missionNetworks"][data-id="${missionNetworkId}"]`);
                                
                                if (missionNetworkNode) {
                                    missionNetworkNode.click();
                                }
                            }
                        }, 300); // Longer delay to ensure DOM is fully updated
                        
                        return; // Exit early since we've handled the refresh
                    }
                    
                    // Add a small delay to ensure DOM is fully updated
                    setTimeout(() => {
                        // If we have a parent ID to restore
                        if (parentId) {
                            console.log(`Looking for parent node ${parentType}:${parentId}`);
                            
                            // Try multiple selectors to find the node
                            let parentNode = document.querySelector(`div.tree-node[data-type="${parentType}"][data-id="${parentId}"]`);
                            
                            // Fallback to a simpler selector if the specific one fails
                            if (!parentNode) {
                                console.log('Trying alternative selector for parent...');
                                parentNode = document.querySelector(`[data-id="${parentId}"]`);
                            }
                            
                            if (parentNode) {
                                console.log(`Found parent node ${parentId}, restoring selection`);
                                
                                // First, expand all parent containers
                                let parent = parentNode.parentElement;
                                while (parent) {
                                    if (parent.classList.contains('tree-node-children')) {
                                        parent.style.display = 'block';
                                    }
                                    parent = parent.parentElement;
                                }
                                
                                // Manually restore selection state
                                currentTreeNode = parentNode;
                                
                                // Update node highlighting in the tree
                                document.querySelectorAll('.tree-node').forEach(node => {
                                    node.classList.remove('active');
                                });
                                parentNode.classList.add('active');
                                
                                // Force parent node to expand to show its children
                                const childrenContainer = parentNode.nextElementSibling;
                                if (childrenContainer && childrenContainer.classList.contains('tree-node-children')) {
                                    childrenContainer.style.display = 'block';
                                    
                                    // Update toggle icon
                                    const toggleIcon = parentNode.querySelector('.tree-toggle i');
                                    if (toggleIcon) {
                                        toggleIcon.className = 'fas fa-chevron-down';
                                    }
                                }
                                
                                // Update the elements panel 
                                if (elementsContainer) {
                                    elementsContainer.innerHTML = '';
                                    
                                    // Get the parent data from the currentTreeNode
                                    const nodeData = {
                                        id: parentId,
                                        type: parentType
                                    };
                                    
                                    const parentData = parentType === 'networkSegments' ? { missionNetworkId } : null;
                                    
                                    // Load children in the elements panel
                                    loadSelectedNodeChildren(nodeData, parentType, parentData);
                                }
                            } else {
                                console.warn(`Could not find parent node with ID ${parentId} after refresh, falling back to root`);
                                
                                // Fallback to root if parent not found
                                const rootNode = document.querySelector(`div.tree-node[data-id="root-cisplan"]`);
                                if (rootNode) {
                                    rootNode.click();
                                } else {
                                    // Clear the details panel as last resort
                                    if (detailsContainer) {
                                        detailsContainer.innerHTML = '';
                                    }
                                    
                                    if (detailsTitle) {
                                        detailsTitle.textContent = 'Details';
                                    }
                                }
                            }
                        } else {
                            // If no parent to restore to, just clear the details panel
                            if (detailsContainer) {
                                detailsContainer.innerHTML = '';
                            }
                            
                            if (detailsTitle) {
                                detailsTitle.textContent = 'Details';
                            }
                        }
                    }, 300); // Longer delay to ensure DOM is fully updated
                });
            } else {
                showToast(`${result.message || 'Failed to delete item'}`, 'danger');
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            showToast('An error occurred while deleting the item', 'danger');
        }
    }
    
    // Fetch CIS Plan data from the API
    async function fetchCISPlanData() {
        try {
            // Store current selection state before refresh
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
                renderTree(data);
                
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
            } else {
                cisTree.innerHTML = `
                    <div class="alert alert-danger m-3">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Error fetching CIS Plan data: ${result.message || 'Unknown error'}
                    </div>
                `;
                console.error('Error fetching CIS Plan data:', result.message);
            }
        } catch (error) {
            cisTree.innerHTML = `
                <div class="alert alert-danger m-3">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error fetching CIS Plan data: ${error.message || 'Unknown error'}
                </div>
            `;
            console.error('Error fetching CIS Plan data:', error);
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
            const domainNode = createTreeNode(
                'securityDomains', 
                domain.name, 
                domain.id, 
                domain.guid,
                'fa-shield-alt'
            );
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
            const stackNode = createTreeNode(
                'hwStacks', 
                stack.name, 
                stack.id, 
                stack.guid,
                'fa-server'
            );
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
        assets.forEach(asset => {
            const assetNode = createTreeNode(
                'assets', 
                asset.name, 
                asset.id, 
                asset.guid,
                'fa-desktop'
            );
            container.appendChild(assetNode);
            
            // Create a container for the children (networkInterfaces and gpInstances)
            const assetChildrenContainer = document.createElement('div');
            assetChildrenContainer.className = 'tree-node-children ms-4';
            assetChildrenContainer.style.display = 'none'; // Initially collapsed
            assetChildrenContainer.setAttribute('data-parent', asset.id);
            container.appendChild(assetChildrenContainer);
            
            // Add click event to asset node to toggle children
            assetNode.addEventListener('click', function(e) {
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
                    loadSelectedNodeChildren(asset, 'assets', parentStack, parentDomain, parentSegment, parentMissionNetwork);
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
                    
                    // If expanding and no children yet, render networkInterfaces and gpInstances
                    if (!isExpanded && childrenContainer.children.length === 0) {
                        // Render network interfaces if they exist
                        if (asset.networkInterfaces && asset.networkInterfaces.length > 0) {
                            renderNetworkInterfaces(childrenContainer, asset.networkInterfaces, asset, parentStack, parentDomain, parentSegment, parentMissionNetwork);
                        }
                        
                        // Render GP instances if they exist
                        if (asset.gpInstances && asset.gpInstances.length > 0) {
                            renderGPInstances(childrenContainer, asset.gpInstances, asset, parentStack, parentDomain, parentSegment, parentMissionNetwork);
                        }
                    }
                }
            });
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
        
        // Create the icon - use SVG icons from getElementIcon function
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
    function loadSelectedNodeChildren(nodeData, nodeType, parentData) {
        // Update the elements panel title
        if (elementsTitle) {
            elementsTitle.textContent = `${nodeData.name} - ${formatNodeTypeName(nodeType)}`;
        }
        
        // Clear the elements container
        if (elementsContainer) {
            elementsContainer.innerHTML = '';
        }
        
        // Determine which children to display based on node type
        if (nodeType === 'missionNetworks' && nodeData.networkSegments) {
            // Display network segments
            renderElementCards(elementsContainer, nodeData.networkSegments, 'networkSegments');
            
            // Show mission network details in the details panel
            updateDetailPanel(nodeData, nodeType);
        } else if (nodeType === 'networkSegments' && nodeData.securityDomains) {
            // Display security domains
            renderElementCards(elementsContainer, nodeData.securityDomains, 'securityDomains');
            
            // Show network segment details in the details panel
            updateDetailPanel(nodeData, nodeType);
        } else if (nodeType === 'securityDomains' && nodeData.hwStacks) {
            // Display hardware stacks
            renderElementCards(elementsContainer, nodeData.hwStacks, 'hwStacks');
            
            // Show security domain details in the details panel
            updateDetailPanel(nodeData, nodeType);
        } else if (nodeType === 'hwStacks' && nodeData.assets) {
            // Display assets
            renderElementCards(elementsContainer, nodeData.assets, 'assets');
            
            // Show hw stack details in the details panel
            updateDetailPanel(nodeData, nodeType);
        } else if (nodeType === 'assets') {
            // Display both network interfaces and GP instances if available
            const hasNetworkInterfaces = nodeData.networkInterfaces && nodeData.networkInterfaces.length > 0;
            const hasGPInstances = nodeData.gpInstances && nodeData.gpInstances.length > 0;
            
            if (hasNetworkInterfaces) {
                renderElementCards(elementsContainer, nodeData.networkInterfaces, 'networkInterfaces');
            }
            
            if (hasGPInstances) {
                renderElementCards(elementsContainer, nodeData.gpInstances, 'gpInstances');
            }
            
            if (!hasNetworkInterfaces && !hasGPInstances) {
                showNoElementsMessage(elementsContainer);
            }
            
            // Update detail panel with asset information
            updateDetailPanel(nodeData, nodeType);
        } else if (nodeType === 'networkInterfaces') {
            // Network interface selected - no child elements in panel
            // Just update detail panel with network interface information
            updateDetailPanel(nodeData, nodeType);
            showNoElementsMessage(elementsContainer);
        } else if (nodeType === 'gpInstances') {
            // GP Instance selected - show details including spInstances and configurationItems
            const hasSpInstances = nodeData.spInstances && nodeData.spInstances.length > 0;
            const hasConfigItems = nodeData.configurationItems && nodeData.configurationItems.length > 0;
            
            // Don't show these in tree, but show in elements panel
            if (hasSpInstances) {
                renderElementCards(elementsContainer, nodeData.spInstances, 'spInstances');
            }
            
            if (hasConfigItems) {
                renderElementCards(elementsContainer, nodeData.configurationItems, 'configurationItems');
            }
            
            if (!hasSpInstances && !hasConfigItems) {
                showNoElementsMessage(elementsContainer);
            }
            
            // Update detail panel with GP Instance information
            updateDetailPanel(nodeData, nodeType);
        } else {
            // No children to display
            showNoElementsMessage(elementsContainer);
        }
        
        // Enable the add button if appropriate
        if (addElementButton) {
            addElementButton.disabled = false;
        }
    }
    
    // Render element cards in the elements panel
    function renderElementCards(container, elements, type) {
        // Create a container for the cards if it doesn't exist
        let cardsContainer = container.querySelector('.element-cards-container');
        if (!cardsContainer) {
            cardsContainer = document.createElement('div');
            cardsContainer.className = 'element-cards-container row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 m-1';
            container.appendChild(cardsContainer);
        }
        
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
            cardTitle.textContent = element.name;
            cardHeader.appendChild(cardTitle);
            
            // Add the header to the card body
            cardBody.appendChild(cardHeader);
            
            // Add subtitle (ID)
            const cardSubtitle = document.createElement('h6');
            cardSubtitle.className = 'card-subtitle mb-2 text-muted';
            cardSubtitle.textContent = element.id || '';  
            cardBody.appendChild(cardSubtitle);
            card.appendChild(cardBody);
            cardCol.appendChild(card);
            cardsContainer.appendChild(cardCol);
            
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
                
                console.log('Selected element:', { ...currentElement }); // Debug log
                
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
                console.log('Card highlighted:', element.id, cardToHighlight); // Debug log
            } else {
                console.log('Card not found to highlight:', element.id); // Debug log
            }
        }
        
        // Update the details title
        if (detailsTitle) {
            detailsTitle.textContent = `${element.name} Details`;
        }
        
        // Create a card to display the details
        const detailCard = document.createElement('div');
        detailCard.className = 'card m-3';
        
        // Create the card header
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header d-flex align-items-center';
        cardHeader.innerHTML = `
            <i class="fas ${getTypeIcon(type)} me-2"></i>
            <h5 class="mb-0">${element.name}</h5>
        `;
        detailCard.appendChild(cardHeader);
        
        // Create the card body
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';
        
        // Create a table for the details
        const table = document.createElement('table');
        table.className = 'table table-bordered';
        
        // Add the basic details rows
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
        
        // Add type-specific details
        // This can be expanded based on the different element types
        if (type === 'hwStacks' && element.cisParticipantID) {
            table.querySelector('tbody').innerHTML += `
                <tr>
                    <th scope="row">CIS Participant ID</th>
                    <td>${element.cisParticipantID}</td>
                </tr>
            `;
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
        const treeNodes = document.querySelectorAll('.tree-node');
        
        treeNodes.forEach(node => {
            const nodeText = node.textContent.toLowerCase();
            if (nodeText.includes(searchTerm) || searchTerm === '') {
                node.style.display = 'flex';
            } else {
                node.style.display = 'none';
            }
        });
    }
    
    // Search functionality for the elements panel
    function handleElementsSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const elementCards = document.querySelectorAll('.element-card');
        
        elementCards.forEach(card => {
            const cardText = card.textContent.toLowerCase();
            if (cardText.includes(searchTerm) || searchTerm === '') {
                card.closest('.col').style.display = 'block';
            } else {
                card.closest('.col').style.display = 'none';
            }
        });
    }
});

// Utility functions

// Format node type name for display
function formatNodeTypeName(type) {
    // Convert camelCase to Title Case with spaces
    return type
        .replace(/([A-Z])/g, ' $1') // Insert space before uppercase letters
        .replace(/^./, function(str) { return str.toUpperCase(); }) // Capitalize first letter
        .trim(); // Remove leading/trailing spaces
}

// Get icon class for a specific element type
function getTypeIcon(type) {
    const iconMap = {
        'missionNetworks': 'fa-project-diagram',
        'networkSegments': 'fa-network-wired',
        'securityDomains': 'fa-shield-alt',
        'hwStacks': 'fa-server',
        'assets': 'fa-desktop',
        'networkInterfaces': 'fa-ethernet',
        'gpInstances': 'fa-cogs',
        'configurationItems': 'fa-wrench',
        'spInstances': 'fa-puzzle-piece'
    };
    
    return iconMap[type] || 'fa-file';
}

// Get SVG icon path for a specific element type
function getElementIcon(type) {
    // This will return the appropriate icon for the element type
    const iconMap = {
        'cisplan': '/static/img/CIS-PLAN.svg',
        'missionNetworks': '/static/img/missionNetworks.svg',
        'networkSegments': '/static/img/networkSegments.svg',
        'securityDomains': '/static/img/securityDomains.svg',
        'hwStacks': '/static/img/hwStacks.svg',
        'assets': '/static/img/assets.svg',
        'networkInterfaces': '/static/img/networkInterfaces.svg',
        'gpInstances': '/static/img/gpInstances.svg',
        'configurationItems': '/static/img/configurationItems.svg',
        'spInstances': '/static/img/spInstances.svg'
    };
    
    return iconMap[type] || '/static/img/default.svg';
}
