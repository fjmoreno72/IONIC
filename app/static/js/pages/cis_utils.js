/**
 * CISUtils - Utility functions for the CIS Plan UI
 * 
 * This file contains utility functions used throughout the CIS Plan UI.
 * It handles common tasks like formatting, icon retrieval, notifications, and data helpers.
 */

// Entity metadata configuration
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

// Entity children mapping (config-driven panel rendering)
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
    ],
    spInstances:       [{ key: 'configurationItems', type: 'configurationItems' }],
    // Add more as needed
    networkInterfaces: [],
    configurationItems: []
};

/**
 * CISUtils namespace containing utility functions for the CIS Plan UI.
 * @namespace CISUtils
 */
const CISUtils = {
    /**
     * Formats a node type name for display.
     * Uses predefined labels from ENTITY_META if available, otherwise formats the string.
     * 
     * @param {string} type - The raw type name to format
     * @returns {string} Formatted node type name
     */
    formatNodeTypeName: function(type) {
        if (ENTITY_META[type]) {
            return ENTITY_META[type].label;
        }
        
        // Format the string if not found in ENTITY_META
        return type
            .replace(/([A-Z])/g, ' $1')  // Insert space before capital letters
            .replace(/^./, str => str.toUpperCase())  // Capitalize first letter
            .trim();  // Remove any leading/trailing spaces
    },
    
    /**
     * Gets the SVG icon path for a given entity type.
     * 
     * @param {string} type - Entity type to get icon for
     * @returns {string} Path to the SVG icon
     */
    getElementIcon: function(type) {
        return ENTITY_META[type]?.icon || '/static/img/default.svg';
    },
    
    /**
     * Creates and displays a Bootstrap toast notification.
     * 
     * @param {string} message - The message to display in the toast
     * @param {string} [type='success'] - Toast type: 'success', 'danger', 'warning', or 'info'
     */
    showToast: function(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        // Create the toast element
        const toastElement = document.createElement('div');
        toastElement.className = `toast bg-${type} text-white`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');
        
        // Create the toast body
        toastElement.innerHTML = `
            <div class="toast-header bg-${type} text-white">
                <strong class="me-auto">CIS Plan</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;
        
        // Add the toast to the container
        toastContainer.appendChild(toastElement);
        
        // Initialize and show the toast using Bootstrap
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 5000
        });
        toast.show();
        
        // Remove the element after the toast is hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    },
    
    /**
     * Gets a participant's name by their key.
     * 
     * @async
     * @param {string} key - The participant key to look up
     * @returns {Promise<string>} The participant name or the original key if not found
     */
    getParticipantNameByKey: async function(key) {
        if (!key) return '';
        
        try {
            // Direct API call to avoid circular dependency with CISApi
            const response = await fetch(`/api/participants/name_by_key?key=${encodeURIComponent(key)}`);
            const result = await response.json();
            
            if (result.status === 'success') {
                return result.name || key;  // Return name if found, otherwise return key
            } else {
                console.warn(`Participant name not found for key: ${key}`);
                return key;  // Return key if not found
            }
        } catch (error) {
            console.error(`Error in getParticipantNameByKey for key ${key}:`, error);
            return key;
        }
    },
    
    /**
     * Handles common Bootstrap modal operations: closing, blurring buttons, and showing toast messages.
     * This standardizes modal handling across the application.
     * 
     * @param {string} modalId - The ID of the modal element to handle
     * @param {string} buttonId - The ID of the button to blur (optional)
     * @param {string} [successMessage] - Optional success message to show in a toast
     * @param {string} [toastType='success'] - Toast type: 'success', 'warning', 'danger', 'info'
     * @returns {Promise<void>} Promise that resolves after modal is handled
     */
    handleModal(modalId, buttonId, successMessage, toastType = 'success') {
        return new Promise((resolve) => {
            try {
                // Get modal element and instance
                const modalElement = document.getElementById(modalId);
                if (!modalElement) {
                    console.warn(`Modal element with ID ${modalId} not found`);
                    resolve();
                    return;
                }
                
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (!modal) {
                    console.warn(`No Bootstrap modal instance found for ${modalId}`);
                    resolve();
                    return;
                }
                
                // Blur button if provided
                if (buttonId) {
                    const button = document.getElementById(buttonId);
                    if (button) button.blur();
                }
                
                // Small delay to ensure blur takes effect before closing the modal
                setTimeout(() => {
                    modal.hide();
                    
                    // Show success message if provided
                    if (successMessage) {
                        this.showToast(successMessage, toastType);
                    }
                    
                    resolve();
                }, 10);
            } catch (error) {
                console.error('Error handling modal:', error);
                resolve(); // Resolve anyway to prevent blocking
            }
        });
    }
};

// Export the namespace and constants
window.CISUtils = CISUtils;
window.ENTITY_META = ENTITY_META;
window.ENTITY_CHILDREN = ENTITY_CHILDREN;
