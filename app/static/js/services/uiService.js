// uiService.js - Handles UI operations like loaders and notifications
export class UiService {
  
  /**
   * Shows the loading spinner
   */
  static showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.remove('hidden');
    }
  }

  /**
   * Displays a dynamic notification message (Bootstrap alert style).
   * @param {string} message - The message to display.
   * @param {string} type - The type of alert ('success', 'danger', 'warning', 'info'). Defaults to 'info'.
   * @param {number} duration - How long the message should stay (in ms). 0 means it stays until closed. Defaults to 5000ms.
   */
  static showNotification(message, type = 'info', duration = 5000) {
    const notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
      console.error('Notification container (#notificationContainer) not found in the DOM.');
      // Fallback to simple alert if container is missing
      alert(`${type.toUpperCase()}: ${message}`);
      return;
    }

    // Map type to Bootstrap alert class
    const alertClass = `alert-${type}`; // e.g., alert-success, alert-danger

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClass} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');

    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    notificationContainer.appendChild(alertDiv);

    // Auto-dismiss after duration (if duration > 0)
    if (duration > 0) {
      setTimeout(() => {
        // Use Bootstrap's API to dismiss if available, otherwise just remove
        const bsAlert = bootstrap.Alert.getInstance(alertDiv);
        if (bsAlert) {
          bsAlert.close();
        } else {
          alertDiv.remove();
        }
      }, duration);
    }
  }


  /**
   * Hides the loading spinner
   */
  static hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
    }
  }
  
  /**
   * Displays a success message that auto-hides after a few seconds
   * @param {string} title - The title/content of the success message
   */
  static showSuccessMessage(title) {
    const messagesContainer = document.getElementById('successMessages');
    if (!messagesContainer) return;
    
    const message = document.createElement('div');
    message.className = 'success-message';
    message.textContent = `${title} report generated successfully!`;
    messagesContainer.appendChild(message);

    // Remove the message after 3 seconds
    setTimeout(() => {
      message.remove();
    }, 3000);
  }
  
  /**
   * Shows a non-blocking confirmation dialog
   * @param {string} message - The confirmation message to display
   * @param {Function} onConfirm - Callback function to execute if user confirms
   * @param {Function} onCancel - Optional callback function to execute if user cancels
   * @param {string} confirmText - Optional text for the confirmation button (default: Delete)
   */
  static showConfirmDialog(message, onConfirm, onCancel = null, confirmText = 'Delete') {
    // Create container if not exists
    let confirmContainer = document.getElementById('confirmDialogContainer');
    if (!confirmContainer) {
      confirmContainer = document.createElement('div');
      confirmContainer.id = 'confirmDialogContainer';
      confirmContainer.style.position = 'fixed';
      confirmContainer.style.top = '0';
      confirmContainer.style.left = '0';
      confirmContainer.style.width = '100%';
      confirmContainer.style.height = '100%';
      confirmContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      confirmContainer.style.zIndex = '2000';
      confirmContainer.style.display = 'flex';
      confirmContainer.style.alignItems = 'center';
      confirmContainer.style.justifyContent = 'center';
      document.body.appendChild(confirmContainer);
    } else {
      confirmContainer.innerHTML = ''; // Clear any existing dialogs
      confirmContainer.style.display = 'flex';
    }
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.style.backgroundColor = 'white';
    dialog.style.padding = '20px';
    dialog.style.borderRadius = '5px';
    dialog.style.maxWidth = '400px';
    dialog.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    
    // Add message
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    dialog.appendChild(messageEl);
    
    // Add buttons container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'flex-end';
    buttonContainer.style.marginTop = '15px';
    buttonContainer.style.gap = '10px';
    
    // Create cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'btn btn-secondary';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => {
      confirmContainer.style.display = 'none';
      if (onCancel) onCancel();
    };
    
    // Create confirm button
    const confirmButton = document.createElement('button');
    confirmButton.className = 'btn btn-danger';
    confirmButton.textContent = confirmText;
    confirmButton.onclick = () => {
      confirmContainer.style.display = 'none';
      onConfirm();
    };
    
    // Add buttons to container
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    dialog.appendChild(buttonContainer);
    
    // Add dialog to container
    confirmContainer.appendChild(dialog);
    
    // Focus confirm button for keyboard navigation
    setTimeout(() => confirmButton.focus(), 0);
  }

  /**
   * Creates a timer overlay with customizable appearance
   * @param {Object} options - Customization options
   * @returns {HTMLElement} The created timer overlay
   */
  static createTimerOverlay(options) {
    const {
      title = 'Processing...',
      subtitle = 'Please wait',
      backgroundColor = 'rgba(0, 0, 0, 0.8)',
      timerId = 'timer',
      timerColor = 'white',
      statusId = null,
      statusMessage = null
    } = options;
    
    const timerOverlay = document.createElement('div');
    timerOverlay.className = 'timer-overlay';
    timerOverlay.style.backgroundColor = backgroundColor;
    
    let htmlContent = `
      <div>${title}</div>
      <div style="margin: 10px 0;">${subtitle}</div>
      <div id="${timerId}" style="font-size: 24px; color: ${timerColor};">0s</div>
    `;
    
    if (statusId && statusMessage) {
      htmlContent += `
        <div id="${statusId}" style="font-size: 14px; color: #aaaaaa; margin-top: 10px;">
          ${statusMessage}
        </div>
      `;
    }
    
    timerOverlay.innerHTML = htmlContent;
    document.body.appendChild(timerOverlay);
    
    return timerOverlay;
  }
  
  /**
   * Removes the timer overlay
   */
  static removeTimerOverlay() {
    try {
      const overlay = document.querySelector('.timer-overlay');
      if (overlay) document.body.removeChild(overlay);
    } catch (e) {
      // Ignore error if overlay doesn't exist
      console.error('Error removing timer overlay:', e);
    }
  }
  
  // Theme-related functionality removed to avoid inconsistencies
}

// Ensure a container exists in the DOM for notifications
// This could be added to a base template (e.g., nav_menu.html or a base layout)
// <div id="notificationContainer" style="position: fixed; top: 80px; right: 20px; z-index: 1050; min-width: 300px;"></div>
// We'll add a check on DOM load to create it if missing, as a fallback.
document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('notificationContainer')) {
    console.warn('Notification container not found, creating dynamically.');
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.style.position = 'fixed';
    container.style.top = '80px'; // Adjust as needed based on nav height
    container.style.right = '20px';
    container.style.zIndex = '1060'; // Increased z-index to be above dialogs (1055)
    container.style.minWidth = '300px';
    document.body.appendChild(container);
  }
});
