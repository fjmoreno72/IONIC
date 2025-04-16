/**
 * DialogManager - A reusable component for creating and managing modal dialogs
 * 
 * This component allows for creating, opening, and closing modal dialogs with
 * customizable content, size, and behavior. It's designed to be reused across
 * the application for different dialog needs.
 */
export class DialogManager {
  /**
   * Create a new dialog manager
   * @param {Object} config - Configuration options
   * @param {string} [config.id] - Unique ID for the dialog (defaults to a generated ID)
   * @param {string} [config.title] - Dialog title
   * @param {string} [config.size] - Dialog size ('small', 'medium', or 'large')
   * @param {Function} [config.onSave] - Callback when save/confirm button is clicked
   * @param {Function} [config.onClose] - Callback when dialog is closed
   * @param {string|HTMLElement} [config.content] - Initial content for the dialog
   */
  constructor(config = {}) {
    this.id = config.id || `dialog-${Date.now()}`;
    this.title = config.title || 'Dialog';
    this.size = config.size || 'medium'; // small, medium, large
    this.onSave = config.onSave || null;
    this.onClose = config.onClose || null;
    this.dialogElement = null;
    this.backdropElement = null;
    this.contentElement = null;
    
    // Create the dialog structure in the DOM
    this.createDialog();
  }
  
  /**
   * Create the dialog DOM structure
   * @private
   */
  createDialog() {
    // Check if the dialog already exists
    const existingDialog = document.getElementById(this.id);
    if (existingDialog) {
      this.dialogElement = existingDialog;
      return;
    }
    
    // Create backdrop
    this.backdropElement = document.createElement('div');
    this.backdropElement.className = 'dialog-backdrop';
    this.backdropElement.style.display = 'none';
    
    // Create dialog container
    this.dialogElement = document.createElement('div');
    this.dialogElement.id = this.id;
    this.dialogElement.className = `dialog dialog-${this.size}`;
    this.dialogElement.style.display = 'none';
    
    // Create dialog header
    const header = document.createElement('div');
    header.className = 'dialog-header';
    
    const titleEl = document.createElement('h5');
    titleEl.className = 'dialog-title';
    titleEl.textContent = this.title;
    
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.onclick = () => this.close();
    
    header.appendChild(titleEl);
    header.appendChild(closeBtn);
    
    // Create dialog body
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'dialog-body';
    
    // Create dialog footer
    const footer = document.createElement('div');
    footer.className = 'dialog-footer';
    
    // Default buttons
    this.createDefaultButtons(footer);
    
    // Assemble dialog
    this.dialogElement.appendChild(header);
    this.dialogElement.appendChild(this.contentElement);
    this.dialogElement.appendChild(footer);
    
    // Add dialog to DOM
    document.body.appendChild(this.backdropElement);
    document.body.appendChild(this.dialogElement);
    
    // Add event listener to close on backdrop click
    this.backdropElement.addEventListener('click', () => this.close());
    
    // Stop propagation of clicks on the dialog itself
    this.dialogElement.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    // Add keyboard event listener for ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
    
    // Add dialog CSS if not already in the document
    this.addDialogStyles();
  }
  
  /**
   * Add dialog CSS styles to the document if they don't exist
   * @private
   */
  addDialogStyles() {
    if (!document.getElementById('dialog-styles')) {
      const style = document.createElement('style');
      style.id = 'dialog-styles';
      style.textContent = `
        .dialog-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          backdrop-filter: blur(2px);
          transition: all 0.3s ease;
          opacity: 0;
        }
        
        .dialog {
          background: var(--bs-body-bg, #fff);
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          width: 90%;
          max-width: 90vw;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0.95);
          z-index: 1055;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          opacity: 0;
        }
        
        .dialog-backdrop.open {
          opacity: 1;
        }
        
        .dialog.open {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
        
        .dialog-small {
          width: 90%;
          max-width: 350px;
        }
        
        .dialog-medium {
          width: 90%;
          max-width: 550px;
        }
        
        .dialog-large {
          width: 90%;
          max-width: 850px;
        }
        
        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--bs-border-color, #dee2e6);
        }
        
        .dialog-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .dialog-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex-grow: 1;
        }
        
        .dialog-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          border-top: 1px solid var(--bs-border-color, #dee2e6);
        }
        
        .dialog .btn-close {
          transition: transform 0.2s ease;
          opacity: 0.7;
        }
        
        .dialog .btn-close:hover {
          transform: rotate(90deg);
          opacity: 1;
        }
        
        .dialog .btn {
          border-radius: 6px;
          padding: 0.5rem 1.25rem;
          transition: all 0.2s ease;
        }
        
        .dialog .btn-primary {
          background: #0d6efd;
          border-color: #0d6efd;
        }
        
        .dialog .btn-primary:hover {
          background: #0b5ed7;
          border-color: #0a58ca;
          transform: translateY(-2px);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
        }
        
        .dialog .btn-secondary {
          background: #6c757d;
          border-color: #6c757d;
        }
        
        .dialog .btn-secondary:hover {
          background: #5c636a;
          border-color: #565e64;
        }
        
        @media (max-width: 576px) {
          .dialog {
            width: 95%;
            max-height: 95vh;
          }
          
          .dialog-body {
            padding: 1rem;
          }
          
          .dialog-header,
          .dialog-footer {
            padding: 1rem;
          }
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Set the dialog title
   * @param {string} title - New dialog title
   */
  setTitle(title) {
    this.title = title;
    const titleEl = this.dialogElement.querySelector('.dialog-title');
    if (titleEl) {
      titleEl.innerHTML = title;
    }
  }
  
  /**
   * Set the dialog content
   * @param {string|HTMLElement} content - HTML content or DOM element
   */
  setContent(content) {
    if (!this.contentElement) return;
    
    // Clear existing content
    this.contentElement.innerHTML = '';
    
    if (content instanceof HTMLElement) {
      this.contentElement.appendChild(content);
    } else if (typeof content === 'string') {
      this.contentElement.innerHTML = content;
    }
  }
  
  /**
   * Open the dialog, optionally with data to populate it
   * @param {Object} [data] - Data to pass to content components
   */
  open(data) {
    if (!this.dialogElement || !this.backdropElement) return;
    
    // Show backdrop and dialog
    this.backdropElement.style.display = 'block';
    this.dialogElement.style.display = 'flex';
    
    // Add open class for animation
    this.backdropElement.classList.add('open');
    this.dialogElement.classList.add('open');
    
    // Focus the first input in the dialog
    setTimeout(() => {
      const firstInput = this.dialogElement.querySelector('input, select, textarea, button:not(.btn-close)');
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
    
    // Trigger content initialization with data if applicable
    if (data && this.contentElement) {
      const form = this.contentElement.querySelector('form');
      if (form && form.setValues && typeof form.setValues === 'function') {
        form.setValues(data);
      } else if (this.contentElement.setValues && typeof this.contentElement.setValues === 'function') {
        this.contentElement.setValues(data);
      }
    }
    
    // Prevent scrolling of the background
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Check if dialog is currently open
   * @return {boolean} true if dialog is open
   */
  isOpen() {
    return this.dialogElement && 
           this.dialogElement.style.display !== 'none' &&
           this.backdropElement &&
           this.backdropElement.style.display !== 'none';
  }
  
  /**
   * Close the dialog
   */
  close() {
    if (!this.dialogElement || !this.backdropElement) return;
    
    // Hide backdrop and dialog
    this.backdropElement.style.display = 'none';
    this.dialogElement.style.display = 'none';
    
    // Remove open class
    this.backdropElement.classList.remove('open');
    this.dialogElement.classList.remove('open');
    
    // Restore background scrolling
    document.body.style.overflow = '';
    
    // Call onClose callback if provided
    if (this.onClose && typeof this.onClose === 'function') {
      this.onClose();
    }
  }
  
  /**
   * Create default buttons for the dialog footer
   * @param {HTMLElement} footer - The footer element to add buttons to
   * @private
   */
  createDefaultButtons(footer) {
    // Clear any existing buttons
    footer.innerHTML = '';
    
    // Create Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.dataset.action = 'cancel';
    cancelBtn.onclick = () => this.close();
    
    // Create Save button
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn btn-primary';
    saveBtn.textContent = 'Save';
    saveBtn.dataset.action = 'save';
    saveBtn.onclick = () => {
      if (this.onSave) {
        // If onSave returns false, prevent dialog from closing
        const result = this.onSave();
        if (result !== false) {
          this.close();
        }
      } else {
        this.close();
      }
    };
    
    // Add buttons to footer
    footer.appendChild(cancelBtn);
    footer.appendChild(saveBtn);
  }
  
  /**
   * Set custom buttons for the dialog
   * @param {Array} buttons - Array of button configurations
   * @param {string} buttons[].text - Button text
   * @param {string} buttons[].class - Button CSS class
   * @param {string} buttons[].action - Button action ('cancel', 'save', or custom)
   */
  setButtons(buttons) {
    if (!this.dialogElement) return;
    
    const footer = this.dialogElement.querySelector('.dialog-footer');
    if (!footer) return;
    
    // Clear existing buttons
    footer.innerHTML = '';
    
    // If no buttons provided, restore defaults
    if (!buttons || !Array.isArray(buttons) || buttons.length === 0) {
      this.createDefaultButtons(footer);
      return;
    }
    
    // Add custom buttons
    buttons.forEach(button => {
      const btnElement = document.createElement('button');
      btnElement.type = 'button';
      btnElement.className = `btn ${button.class || 'btn-secondary'}`;
      btnElement.textContent = button.text || 'Button';
      btnElement.dataset.action = button.action || '';
      
      // Set click handler based on action
      if (button.action === 'cancel') {
        btnElement.onclick = () => this.close();
      } else if (button.action === 'save') {
        btnElement.onclick = () => {
          if (this.onSave) {
            const result = this.onSave();
            if (result !== false) {
              this.close();
            }
          } else {
            this.close();
          }
        };
      } else if (button.onClick && typeof button.onClick === 'function') {
        btnElement.onclick = button.onClick;
      }
      
      footer.appendChild(btnElement);
    });
  }
  
  /**
   * Remove the dialog from the DOM
   */
  destroy() {
    if (this.backdropElement && this.backdropElement.parentNode) {
      this.backdropElement.parentNode.removeChild(this.backdropElement);
    }
    
    if (this.dialogElement && this.dialogElement.parentNode) {
      this.dialogElement.parentNode.removeChild(this.dialogElement);
    }
    
    this.dialogElement = null;
    this.backdropElement = null;
    this.contentElement = null;
  }
}
