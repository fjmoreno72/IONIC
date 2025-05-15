/**
 * CIS Plan UI Utilities
 * 
 * Shared UI utilities for CIS Plan 2.0 components.
 * This includes functions for displaying toast notifications, loading overlays,
 * and other common UI patterns used across the application.
 */

const CISUIUtils = {
    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - The type of notification: 'success', 'warning', or 'error'
     * @param {number} duration - Time in milliseconds to show the toast (default: 5000)
     */
    showToast: function(message, type = 'success', duration = 5000) {
        // Find or create the toast container
        let toastContainer = document.getElementById('toast-container');
        
        if (!toastContainer) {
            // Create the toast container if it doesn't exist
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }
        
        // Create a new toast
        const toast = document.createElement('div');
        toast.className = 'toast show';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        // Set background color based on type
        let headerClass = '';
        let headerText = '';
        let backgroundColor = '';
        let textColor = 'black';
        
        switch (type) {
            case 'success':
                headerClass = 'bg-success text-white';
                headerText = 'Success';
                backgroundColor = 'rgba(25, 135, 84, 0.1)'; // Light green
                break;
            case 'warning':
                headerClass = 'bg-warning text-dark';
                headerText = 'Warning';
                backgroundColor = 'rgba(255, 193, 7, 0.1)'; // Light yellow
                break;
            case 'error':
                headerClass = 'bg-danger text-white';
                headerText = 'Error';
                backgroundColor = 'rgba(220, 53, 69, 0.1)'; // Light red
                textColor = '#dc3545';
                break;
            default:
                headerClass = 'bg-primary text-white';
                headerText = 'Information';
                backgroundColor = 'rgba(13, 110, 253, 0.1)'; // Light blue
        }
        
        toast.innerHTML = `
            <div class="toast-header ${headerClass}">
                <strong class="me-auto">${headerText}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body" style="background-color: ${backgroundColor}; color: ${textColor};">
                ${message}
            </div>
        `;
        
        // Add close button functionality
        const closeBtn = toast.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toastContainer.contains(toast)) {
                        toastContainer.removeChild(toast);
                    }
                }, 500);
            });
        }
        
        toastContainer.appendChild(toast);
        
        // Auto-remove after specified duration
        setTimeout(() => {
            if (toast.classList.contains('show')) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toastContainer.contains(toast)) {
                        toastContainer.removeChild(toast);
                    }
                }, 500);
            }
        }, duration);
    },
    
    /**
     * Show a success toast notification
     * @param {string} message - The message to display
     * @param {number} duration - Time in milliseconds to show the toast
     */
    showSuccessToast: function(message, duration = 5000) {
        this.showToast(message, 'success', duration);
    },
    
    /**
     * Show a warning toast notification
     * @param {string} message - The message to display
     * @param {number} duration - Time in milliseconds to show the toast
     */
    showWarningToast: function(message, duration = 5000) {
        this.showToast(message, 'warning', duration);
    },
    
    /**
     * Show an error toast notification
     * @param {string} message - The message to display
     * @param {number} duration - Time in milliseconds to show the toast
     */
    showErrorToast: function(message, duration = 5000) {
        this.showToast(message, 'error', duration);
    },
    
    /**
     * Show a loading overlay
     * @param {string} message - Message to display
     * @param {string} overlayId - ID to use for the overlay (default: 'loading-overlay')
     */
    showLoadingOverlay: function(message = 'Loading...', overlayId = 'loading-overlay') {
        // Check if the overlay already exists
        const existingOverlay = document.getElementById(overlayId);
        if (existingOverlay) {
            // If it exists, just update the message
            const messageElement = existingOverlay.querySelector('.mt-2');
            if (messageElement) {
                messageElement.textContent = message;
            }
            return;
        }
        
        // Create the overlay
        const overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.className = 'modal-backdrop fade show d-flex align-items-center justify-content-center';
        overlay.innerHTML = `
            <div class="text-center text-white">
                <div class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <div class="mt-2">${message}</div>
            </div>
        `;
        document.body.appendChild(overlay);
    },
    
    /**
     * Hide the loading overlay
     * @param {string} overlayId - ID of the overlay to hide (default: 'loading-overlay')
     */
    hideLoadingOverlay: function(overlayId = 'loading-overlay') {
        const overlay = document.getElementById(overlayId);
        if (overlay) {
            // Add a fade out animation
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            
            // Remove after animation completes
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 300);
        }
    },
    
    /**
     * Show a modal dialog
     * @param {string} modalId - ID of the modal to show
     * @param {function} onShown - Callback to execute after the modal is shown (optional)
     */
    showModal: function(modalId, onShown = null) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with ID "${modalId}" not found`);
            return;
        }
        
        // Check if Bootstrap is available
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            try {
                // Fix for "Illegal invocation" error - use proper initialization
                if (modal.dataset.bsModal) {
                    // If modal already has a Bootstrap modal instance, use that
                    try {
                        const existingModal = bootstrap.Modal.getInstance(modal);
                        if (existingModal) {
                            existingModal.show();
                            if (onShown && typeof onShown === 'function') {
                                modal.addEventListener('shown.bs.modal', onShown, { once: true });
                            }
                            return;
                        }
                    } catch (e) {
                        console.warn("Error getting existing modal instance:", e);
                    }
                }
                
                // Fall back to our own implementation which is more reliable
                console.log("Using fallback modal implementation instead of Bootstrap");
                this.showModalFallback(modal, onShown);
            } catch (error) {
                console.error("Bootstrap modal error:", error);
                this.showModalFallback(modal, onShown);
            }
        } else {
            this.showModalFallback(modal, onShown);
        }
    },
    
    /**
     * Fallback method to show modals when Bootstrap is not available or fails
     * @param {HTMLElement} modal - The modal element to show
     * @param {function} onShown - Callback to execute after the modal is shown
     * @private
     */
    showModalFallback: function(modal, onShown = null) {
        // Ensure any existing backdrops are removed first to prevent stacking issues
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        
        // Create a new backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        backdrop.style.zIndex = '1040'; // Ensure backdrop is behind modal
        document.body.appendChild(backdrop);
        
        // Add a click handler to the backdrop to close the modal if needed
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop && modal.classList.contains('show')) {
                this.hideModalFallback(modal);
            }
        });
        
        // Show the modal
        modal.style.display = 'block';
        modal.classList.add('show');
        modal.style.zIndex = '1050'; // Ensure modal is above backdrop
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
        
        // Explicitly set all form elements to be interactive
        const formElements = modal.querySelectorAll('input, select, button, textarea');
        formElements.forEach(el => {
            el.style.pointerEvents = 'all';
        });
        
        // Make sure modal and its content are interactive
        modal.style.pointerEvents = 'all';
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.pointerEvents = 'all';
        }
        
        // Ensure the close buttons work
        const closeButtons = modal.querySelectorAll('.close-modal, [data-dismiss="modal"]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideModalFallback(modal);
            });
        });
        
        // Execute callback if provided
        if (onShown && typeof onShown === 'function') {
            setTimeout(onShown, 100);
        }
    },
    
    /**
     * Hide a modal dialog
     * @param {string} modalId - ID of the modal to hide
     * @param {function} onHidden - Callback to execute after the modal is hidden (optional)
     */
    hideModal: function(modalId, onHidden = null) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal with ID "${modalId}" not found`);
            return;
        }
        
        // Check if Bootstrap is available
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            // Use Bootstrap's Modal API if available
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                if (onHidden && typeof onHidden === 'function') {
                    modal.addEventListener('hidden.bs.modal', onHidden, { once: true });
                }
                bsModal.hide();
            } else {
                this.hideModalFallback(modal, onHidden);
            }
        } else {
            this.hideModalFallback(modal, onHidden);
        }
    },
    
    /**
     * Fallback method to hide modals when Bootstrap is not available
     * @param {HTMLElement} modal - The modal element to hide
     * @param {function} onHidden - Callback to execute after the modal is hidden
     * @private
     */
    hideModalFallback: function(modal, onHidden = null) {
        // Basic hiding logic
        modal.style.display = 'none';
        modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = ''; // Restore scrolling
        
        // Remove backdrop
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
            backdrop.style.opacity = '0';
            setTimeout(() => {
                if (backdrop.parentNode) {
                    backdrop.remove();
                }
            }, 150);
        });
        
        // Execute callback if provided
        if (onHidden && typeof onHidden === 'function') {
            setTimeout(onHidden, 150);
        }
    },
    
    /**
     * Generate a random suffix for form field names to prevent browser autocomplete
     * @returns {string} Random suffix string
     */
    generateRandomSuffix: function() {
        return Math.random().toString(36).substring(2, 8);
    }
};

// Export the utilities
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CISUIUtils;
} 