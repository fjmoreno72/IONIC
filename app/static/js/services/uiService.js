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
