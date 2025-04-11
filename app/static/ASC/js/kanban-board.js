// kanban-board.js - Kanban board UI and drag-drop handling

import { DataManager } from './data-manager.js';
import { ThemeManager } from '../../js/components/themeManager.js';
import { DialogManager } from '../../js/components/dialogManager.js';
import { AscForm } from '../../js/components/ascForm.js';

/**
 * KanbanBoard class manages the ASC Kanban board UI
 * - Renders the board and cards
 * - Handles drag and drop functionality
 * - Manages card status updates
 * - Applies filters from the UI
 */
export class KanbanBoard {
  constructor() {
    console.log('Initializing Kanban board constructor');
    this.dataManager = new DataManager();
    this.themeManager = new ThemeManager();
    
    // Import UiService for notifications
    this.uiService = window.UiService || { showNotification: (message) => console.log('Notification:', message) };
    
    // Connect theme toggle button directly
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => this.themeManager.toggleTheme());
    }
    
    // Column status map
    this.statusMap = {
      "column-initial": "Initial",
      "column-inprogress": "In Progress", 
      "column-inreview": "In Review",
      "column-validated": "Validated",
      "column-deprecated": "Deprecated"
    };
    
    // UI elements cached for performance
    this.elements = {
      board: document.getElementById('kanban-board'),
      columns: {},
      cardContainers: {},
      filterAffiliate: document.getElementById('filter-affiliate'),
      filterService: document.getElementById('filter-service'),
      filterModel: document.getElementById('filter-model'),
      searchInput: document.getElementById('search-input'),
      clearFiltersBtn: document.getElementById('clear-filters'),
      loadingIndicator: document.getElementById('loading-indicator'),
      errorMessage: document.getElementById('error-message')
    };
    
    // Initialize columns and card containers references
    Object.keys(this.statusMap).forEach(columnId => {
      this.elements.columns[columnId] = document.getElementById(columnId);
      this.elements.cardContainers[columnId] = document.getElementById(`${columnId}-cards`);
    });
    
    // Event handlers
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
    this.handleDragEnter = this.handleDragEnter.bind(this);
    this.handleDragLeave = this.handleDragLeave.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
  }

  /**
   * Initialize the Kanban board
   */
  async init() {
    console.log('Initializing Kanban board');
    try {
      this.showLoading(true);
      
      // Initialize the data manager
      const success = await this.dataManager.init();
      if (!success) {
        this.showError(`Failed to load data: ${this.dataManager.error}`);
        return;
      }
      
      // Setup filter dropdowns
      this.setupFilters();
      
      // Setup event listeners for filters
      this.setupEventListeners();
      
      // Initialize drag and drop
      this.setupDragAndDrop();
      
      // Render the board
      this.renderBoard();
      
      this.showLoading(false);
    } catch (error) {
      console.error('Error initializing Kanban board:', error);
      this.showError(`Failed to initialize Kanban board: ${error.message}`);
    }
  }

  /**
   * Show or hide the loading indicator
   * @param {boolean} show - Whether to show the loading indicator
   */
  showLoading(show) {
    if (this.elements.loadingIndicator) {
      this.elements.loadingIndicator.style.display = show ? 'flex' : 'none';
    }
  }

  /**
   * Show an error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.textContent = message;
      this.elements.errorMessage.style.display = 'block';
    }
    this.showLoading(false);
  }

  /**
   * Setup filter dropdowns with options
   */
  setupFilters() {
    const filterOptions = this.dataManager.getFilterOptions();
    
    // Clear existing options
    this.elements.filterAffiliate.innerHTML = '<option value="">All Affiliates</option>';
    this.elements.filterService.innerHTML = '<option value="">All Services</option>';
    this.elements.filterModel.innerHTML = '<option value="">All Models</option>';
    
    // Add affiliate options
    filterOptions.affiliates.forEach(affiliate => {
      const option = document.createElement('option');
      option.value = affiliate.id;
      option.textContent = affiliate.name;
      this.elements.filterAffiliate.appendChild(option);
    });
    
    // Add service options
    filterOptions.services.forEach(service => {
      const option = document.createElement('option');
      option.value = service.id;
      option.textContent = service.name;
      this.elements.filterService.appendChild(option);
    });
    
    // Add model options
    filterOptions.models.forEach(model => {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.name;
      this.elements.filterModel.appendChild(option);
    });
  }

  /**
   * Setup event listeners for user interactions
   */
  setupEventListeners() {
    // Filter change events
    this.elements.filterAffiliate.addEventListener('change', this.handleFilterChange);
    this.elements.filterService.addEventListener('change', this.handleFilterChange);
    this.elements.filterModel.addEventListener('change', this.handleFilterChange);
    
    // Debounced search input
    let searchTimeout;
    this.elements.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.handleFilterChange(e);
      }, 300);
    });
    
    // Clear filters button
    this.elements.clearFiltersBtn.addEventListener('click', () => {
      this.elements.filterAffiliate.value = '';
      this.elements.filterService.value = '';
      this.elements.filterModel.value = '';
      this.elements.searchInput.value = '';
      this.handleFilterChange();
    });
  }

  /**
   * Handle filter change events
   */
  handleFilterChange() {
    const filters = {
      affiliate: this.elements.filterAffiliate.value,
      service: this.elements.filterService.value,
      model: this.elements.filterModel.value,
      search: this.elements.searchInput.value
    };
    
    this.dataManager.setFilters(filters);
    this.renderBoard();
  }

  /**
   * Setup drag and drop functionality
   */
  setupDragAndDrop() {
    // Setup column event listeners for drop targets
    Object.keys(this.elements.columns).forEach(columnId => {
      const column = this.elements.columns[columnId];
      if (column) {
        column.addEventListener('dragover', this.handleDragOver);
        column.addEventListener('dragenter', this.handleDragEnter);
        column.addEventListener('dragleave', this.handleDragLeave);
        column.addEventListener('drop', this.handleDrop);
      }
    });
  }

  /**
   * Render the entire Kanban board with all cards
   */
  renderBoard() {
    console.log('Rendering board');
    // Get ASCs grouped by status
    const ascsByStatus = this.dataManager.getAscsByStatus();
    
    // Clear all card containers first
    Object.keys(this.statusMap).forEach(columnId => {
      const cardContainer = this.elements.cardContainers[columnId];
      if (cardContainer) {
        cardContainer.innerHTML = '';
      } else {
        console.warn(`Card container for ${columnId} not found`);
      }
    });
    
    // Render cards in each column
    Object.keys(this.statusMap).forEach(columnId => {
      const status = this.statusMap[columnId];
      const ascs = ascsByStatus[status] || [];
      
      const cardContainer = this.elements.cardContainers[columnId];
      if (cardContainer) {
        if (ascs.length === 0) {
          // Show empty state
          const emptyState = document.createElement('div');
          emptyState.className = 'empty-state';
          emptyState.textContent = 'No items';
          cardContainer.appendChild(emptyState);
        } else {
          // Render cards for this column
          ascs.forEach(asc => {
            const card = this.createCardElement(asc);
            cardContainer.appendChild(card);
          });
        }
      }
    });
    
    // Update column counts
    Object.keys(this.statusMap).forEach(columnId => {
      const status = this.statusMap[columnId];
      const count = (ascsByStatus[status] || []).length;
      const countElement = document.querySelector(`#${columnId} .column-count`);
      if (countElement) {
        countElement.textContent = count;
      }
    });
  }

  /**
   * Get progress class based on percentage
   * @param {number} percentage - Progress percentage
   * @returns {string} CSS class for progress
   */
  getProgressClass(percentage) {
    if (percentage >= 100) return 'progress-100';
    if (percentage >= 75) return 'progress-75';
    if (percentage >= 50) return 'progress-50';
    if (percentage >= 25) return 'progress-25';
    return 'progress-0';
  }

  /**
   * Create a card element for an ASC
   * @param {Object} asc - ASC data object
   * @returns {HTMLElement} Card element
   */
  createCardElement(asc) {
    const affiliateName = this.dataManager.getAffiliateName(asc.affiliateId);
    const serviceName = this.dataManager.getServiceName(asc.serviceId);
    const flagPath = this.dataManager.getFlagPath(asc.affiliateId);
    
    // Get the model name if a model exists for this ASC
    const modelName = asc.model ? this.dataManager.getModelName(asc.model) : null;
    const serviceDisplay = modelName ? `${serviceName} - ${modelName}` : serviceName;
    
    // Extract ascScore percentage (remove any % sign and parse as int)
    const progressStr = asc.ascScore ? asc.ascScore.toString().replace('%', '') : '0';
    const progressPercentage = parseInt(progressStr);
    const progressClass = this.getProgressClass(progressPercentage);
    
    // Create card element
    const card = document.createElement('div');
    card.className = 'asc-card';
    card.draggable = true;
    card.dataset.id = asc.id;
    card.dataset.status = asc.status;
    
    // Add drag event listeners
    card.addEventListener('dragstart', this.handleDragStart);
    card.addEventListener('dragend', this.handleDragEnd);
    
    // Add click event listener to open edit form
    card.addEventListener('click', (e) => this.handleCardClick(e, asc));
    
    // Card HTML structure
    card.innerHTML = `
      <div class="card-header">
        <span class="asc-id">${asc.id}</span>
        <span class="progress-indicator ${progressClass}">${progressPercentage}%</span>
      </div>
      <div class="card-content">
        <div class="affiliate-row">
          <img class="affiliate-flag" src="${flagPath}" alt="${affiliateName} Flag" onerror="this.src='/static/ASC/image/flags/FMN-ASC.png'">
          ${affiliateName} - ${asc.environment}
        </div>
        <div class="service-row">
          ${serviceDisplay}
        </div>
      </div>
    `;
    
    return card;
  }

  /**
   * Handle card drag start event
   * @param {DragEvent} e - Drag event
   */
  handleDragStart(e) {
    const card = e.target;
    // Store the source column ID for animation
    card.dataset.sourceColumn = card.closest('.column-cards').id;
    
    // Set data transfer for drop
    e.dataTransfer.setData('text/plain', card.dataset.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add dragging class for visual feedback
    card.classList.add('dragging');
    
    // Create a better visual drag ghost
    const rect = card.getBoundingClientRect();
    const ghost = card.cloneNode(true);
    ghost.id = 'drag-ghost';
    ghost.classList.add('drag-ghost');
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.position = 'fixed';
    ghost.style.top = '-1000px';
    ghost.style.left = '-1000px';
    ghost.style.opacity = '0.6';
    ghost.style.pointerEvents = 'none';
    document.body.appendChild(ghost);
    
    // Use the cloned node as the drag image
    e.dataTransfer.setDragImage(ghost, rect.width / 2, rect.height / 2);
    
    // Create a placeholder in the source column
    const placeholder = document.createElement('div');
    placeholder.className = 'card-placeholder';
    placeholder.dataset.for = card.dataset.id;
    card.after(placeholder);
    
    // Clean up ghost element after drag starts
    setTimeout(() => {
      document.body.removeChild(ghost);
    }, 0);
  }

  /**
   * Handle card drag over event on columns
   * @param {DragEvent} e - Drag event
   */
  handleDragOver(e) {
    // Prevent default to allow drop
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  /**
   * Handle card drag enter event on columns
   * @param {DragEvent} e - Drag event
   */
  handleDragEnter(e) {
    // Find the column element (might be a child element that triggered the event)
    const column = e.target.closest('.kanban-column');
    if (column) {
      column.classList.add('drag-over');
    }
  }

  /**
   * Handle card drag leave event on columns
   * @param {DragEvent} e - Drag event
   */
  handleDragLeave(e) {
    // Only remove class if leaving the column, not entering a child
    const column = e.target.closest('.kanban-column');
    const relatedTarget = e.relatedTarget;
    
    if (column && !column.contains(relatedTarget)) {
      column.classList.remove('drag-over');
    }
  }

  /**
   * Handle card drop event on columns
   * @param {DragEvent} e - Drag event
   */
  async handleDrop(e) {
    e.preventDefault();
    
    // Get the dragged card ID
    const ascId = e.dataTransfer.getData('text/plain');
    if (!ascId) return;
    
    // Get the target column
    const column = e.target.closest('.kanban-column');
    if (!column) return;
    
    // Remove drag-over class
    column.classList.remove('drag-over');
    
    // Get the new status from column ID
    const columnId = column.id;
    const newStatus = this.statusMap[columnId];
    
    if (!newStatus) return;
    
    // Find the card element
    const card = document.querySelector(`.asc-card[data-id="${ascId}"]`);
    if (!card) return;
    
    // Find source and target containers
    const sourceContainer = document.getElementById(card.dataset.sourceColumn);
    const targetContainer = document.getElementById(`${columnId}-cards`);
    
    if (!sourceContainer || !targetContainer) return;
    
    // If dropped in the same column, just remove placeholder and return
    if (sourceContainer.id === targetContainer.id) {
      const placeholder = document.querySelector(`.card-placeholder[data-for="${ascId}"]`);
      if (placeholder) placeholder.remove();
      card.classList.remove('dragging');
      return;
    }
    
    // Remove all placeholders
    document.querySelectorAll('.card-placeholder').forEach(el => el.remove());
    
    // Prepare for animation
    const sourceRect = card.getBoundingClientRect();
    
    // Move card to target container
    targetContainer.appendChild(card);
    
    // Apply animation
    requestAnimationFrame(() => {
      const targetRect = card.getBoundingClientRect();
      
      // Calculate the transform to animate from source to target position
      const deltaX = sourceRect.left - targetRect.left;
      const deltaY = sourceRect.top - targetRect.top;
      
      // Apply initial transform to position at source
      card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      card.classList.add('moving');
      
      // Remove dragging class
      card.classList.remove('dragging');
      
      // Animate to final position
      requestAnimationFrame(() => {
        card.style.transform = '';
        
        // When animation completes, update the backend
        card.addEventListener('transitionend', async () => {
          // Show loading indicator for backend update
          this.showLoading(true);
          
          // Update the ASC status in backend
          const success = await this.dataManager.updateAscStatus(ascId, newStatus);
          
          // Hide loading
          this.showLoading(false);
          
          if (success) {
            // Show success message
            this.showSuccessMessage(`Updated ${ascId} to ${newStatus}`);
            
            // Clean up animation classes
            card.classList.remove('moving');
            
            // Update data in the UI
            card.dataset.status = newStatus;
          } else {
            // Show error
            this.showError('Failed to update ASC status');
            
            // Revert the move by re-rendering
            this.renderBoard();
          }
        }, { once: true });
      });
    });
  }

  /**
   * Handle card drag end event
   * @param {DragEvent} e - Drag event
   */
  handleDragEnd(e) {
    // Remove dragging class
    const card = e.target;
    card.classList.remove('dragging');
    
    // Remove any leftover placeholders
    const placeholder = document.querySelector(`.card-placeholder[data-for="${card.dataset.id}"]`);
    if (placeholder) placeholder.remove();
    
    // Clean up any ghost elements
    const ghost = document.getElementById('drag-ghost');
    if (ghost) ghost.remove();
    
    // Remove drag-over class from all columns
    Object.values(this.elements.columns).forEach(column => {
      if (column) {
        column.classList.remove('drag-over');
      }
    });
  }

  /**
   * Show success message
   * @param {string} message - Success message to display
   */
  showSuccessMessage(message) {
    // Create success toast element
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    
    // Append to body
    document.body.appendChild(toast);
    
    // Remove after animation completes
    setTimeout(() => {
      toast.classList.add('show');
      
      setTimeout(() => {
        toast.classList.remove('show');
        
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    }, 10);
  }
  
  /**
   * Handle card click to open edit form
   * @param {MouseEvent} e - Click event
   * @param {Object} asc - ASC data object
   */
  handleCardClick(e, asc) {
    // Prevent click from interfering with drag operations
    if (e.target.closest('.card-header') || this.isDragging) {
      return; // Don't open edit form when clicking on header or during drag
    }
    
    // Open the ASC edit dialog
    this.openAscEditForm(asc);
  }
  
  /**
   * Open the ASC edit form with completely preloaded data
   * @param {Object} asc - ASC data object
   */
  async openAscEditForm(asc) {
    // Show loading indicator while preparing form data
    this.showLoading(true);
    
    console.log('STARTING ASC edit dialog preparation for ASC-' + asc.id);
    
    // Create a new enhanced ASC object with all preloaded data
    // This avoids any asynchronous loading issues in the form
    const enhancedAsc = {
      ...JSON.parse(JSON.stringify(asc)), // Deep clone original ASC data
      _preloadedData: true, // Flag indicating this ASC has preloaded data
      _preloadTimestamp: new Date().toISOString()
    };
    
    // STEP 1: PRE-LOAD AFFILIATE DATA
    try {
      // Use the affiliateId to get data directly from the affiliates object
      if (enhancedAsc.affiliateId && this.dataManager.affiliates[enhancedAsc.affiliateId]) {
        const affiliate = this.dataManager.affiliates[enhancedAsc.affiliateId];
        
        // Store complete affiliate data
        enhancedAsc._affiliate = affiliate;
        enhancedAsc.affiliateName = affiliate.name;
        
        // Use the existing DataManager method to get the flag path
        enhancedAsc.affiliateFlag = this.dataManager.getFlagPath(enhancedAsc.affiliateId);
        
        console.log('Pre-loaded affiliate data:', {
          id: enhancedAsc.affiliateId,
          name: enhancedAsc.affiliateName,
          flag: enhancedAsc.affiliateFlag
        });
        
        // Pre-cache the flag image
        await new Promise((resolve) => {
          const preloadImg = new Image();
          preloadImg.onload = () => {
            console.log('Flag image pre-loaded successfully');
            resolve();
          };
          preloadImg.onerror = () => {
            console.warn('Failed to pre-load flag, will use default');
            resolve();
          };
          preloadImg.src = enhancedAsc.affiliateFlag;
          setTimeout(resolve, 500);
        });
      } else {
        console.warn(`Affiliate with ID ${enhancedAsc.affiliateId} not found`);
        enhancedAsc.affiliateName = this.dataManager.getAffiliateName(enhancedAsc.affiliateId) || `Unknown (ID: ${enhancedAsc.affiliateId})`;
        enhancedAsc.affiliateFlag = '/static/ASC/image/flags/FMN-ASC.png';
      }
    } catch (error) {
      console.error('Error pre-loading affiliate data:', error);
      enhancedAsc.affiliateFlag = '/static/ASC/image/flags/FMN-ASC.png';
    }
    
    // STEP 2: PRE-LOAD SERVICE DATA
    try {
      // Access service data directly from the services object
      if (enhancedAsc.serviceId && this.dataManager.services[enhancedAsc.serviceId]) {
        const service = this.dataManager.services[enhancedAsc.serviceId];
        
        // Store complete service data
        enhancedAsc._service = service;
        enhancedAsc.serviceName = service.name;
        
        console.log('Pre-loaded service data:', {
          id: enhancedAsc.serviceId,
          name: enhancedAsc.serviceName
        });
      } else {
        console.warn(`Service with ID ${enhancedAsc.serviceId} not found`);
        enhancedAsc.serviceName = this.dataManager.getServiceName(enhancedAsc.serviceId) || `Unknown (ID: ${enhancedAsc.serviceId})`;
      }
    } catch (error) {
      console.error('Error pre-loading service data:', error);
    }
    
    // STEP 3: PRE-LOAD MODEL DATA - Most important for fixing the issue
    try {
      if (enhancedAsc.model) {
        // Get the model directly if it exists
        if (this.dataManager.models[enhancedAsc.model]) {
          const selectedModel = this.dataManager.models[enhancedAsc.model];
          
          // Store complete model data in multiple formats for maximum compatibility
          enhancedAsc._model = selectedModel;
          enhancedAsc.modelName = selectedModel.name;
          enhancedAsc.modelId = selectedModel.id;
          
          // Create a special property with all model data organized
          enhancedAsc._modelData = {
            id: enhancedAsc.model,
            name: selectedModel.name,
            serviceId: enhancedAsc.serviceId,
            object: selectedModel
          };
          
          console.log('Pre-loaded model data:', {
            id: enhancedAsc.model,
            name: enhancedAsc.modelName
          });
        } else {
          // Fall back to using the DataManager helper method
          const modelName = this.dataManager.getModelName(enhancedAsc.model);
          console.warn(`Model with ID ${enhancedAsc.model} not found directly, using helper method`);
          enhancedAsc.modelName = modelName || `Unknown (ID: ${enhancedAsc.model})`;
          
          // Create minimal model data
          enhancedAsc._modelData = {
            id: enhancedAsc.model,
            name: enhancedAsc.modelName,
            serviceId: enhancedAsc.serviceId
          };
        }
      } else {
        console.log('ASC has no model assigned');
      }
    } catch (error) {
      console.error('Error pre-loading model data:', error);
    }
    
    // Create a dialog for the ASC form without buttons - we'll add them later
    const ascDialog = new DialogManager({
      title: `Edit ASC-${enhancedAsc.id}`,
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
      // Store the enhanced ASC data directly in the dialog for easy access
      data: enhancedAsc
    });
    
    // For tracking purposes, also store the ID in a data attribute once the dialog is created
    if (ascDialog.dialogElement) {
      ascDialog.dialogElement.dataset.ascId = enhancedAsc.id;
    }
    
    // Hide loading indicator
    this.showLoading(false);
    
    // Log that all data is preloaded and ready
    console.log('ASC data fully pre-loaded and ready for form creation');
    enhancedAsc._readyForForm = true;
    
    // CRITICAL FIX: Force-initialize model to ensure it's always available immediately
    if (enhancedAsc.model) {
      // Create a simplified HTML structure for the model select
      // This will be used as a direct content reference by the form
      enhancedAsc._modelHtml = `<option value="${enhancedAsc.model}" selected>${enhancedAsc.modelName || enhancedAsc.model}</option>`;
      
      // Create direct model data that can't be missed
      enhancedAsc._directModel = {
        id: enhancedAsc.model,
        name: enhancedAsc.modelName || 'Unknown Model',
        html: enhancedAsc._modelHtml,
        timestamp: new Date().toISOString()
      };
      
      console.log('Pre-created model HTML content:', enhancedAsc._modelHtml);
    }
    
    // Create a local reference to this for use in callbacks
    const kanbanBoard = this;
    
    // Define the save function
    const saveAsc = async function(formData) {
      try {
        // Log what we're sending to help with debugging
        console.log('Saving ASC with data:', formData);
        
        // Disable the save button and show loading state
        const saveButton = ascDialog.dialogElement?.querySelector('button[data-action="save"]');
        if (saveButton) {
          saveButton.disabled = true;
          saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
        }
        
        // Find the ASC in the data manager's array and update it
        // This approach mirrors what happens in the drag-and-drop functionality
        const ascIndex = kanbanBoard.dataManager.ascs.findIndex(a => a.id.toString() === formData.id.toString());
        if (ascIndex === -1) {
          throw new Error(`ASC with ID ${formData.id} not found in data manager`);
        }
        
        // Update the ASC in memory
        console.log(`Updating ASC at index ${ascIndex}`);
        kanbanBoard.dataManager.ascs[ascIndex] = formData;
        
        // Save all ASCs using the same method as drag-and-drop
        const success = await kanbanBoard.dataManager.saveAscs();
        
        if (!success) {
          throw new Error('Failed to save ASCs');
        }
        
        // Close dialog
        ascDialog.close();
        
        // Force a complete data refresh by clearing cache and reloading
        console.log('Reloading ASC data...');
        kanbanBoard.dataManager.ascs = [];
        kanbanBoard.dataManager.loaded = false;
        
        // Reload the ASC data completely and ensure we wait for it
        await kanbanBoard.dataManager.init();
        console.log('Data reloaded, ASCs count:', kanbanBoard.dataManager.ascs.length);
        
        // Re-render the board with fresh data
        kanbanBoard.renderBoard();
        
        // Show success toast
        // Use window.UiService if available, otherwise log to console
        if (window.UiService) {
          window.UiService.showNotification('ASC updated successfully!', 'success');
        } else {
          console.log('SUCCESS: ASC updated successfully!');
        }
      } catch (error) {
        console.error('Error updating ASC:', error);
        if (window.UiService) {
          window.UiService.showNotification(`Error: ${error.message}`, 'error');
        } else {
          console.error(`Error: ${error.message}`);
        }
        
        // Re-enable the save button
        const saveButton = ascDialog.dialogElement?.querySelector('button[data-action="save"]');
        if (saveButton) {
          saveButton.disabled = false;
          saveButton.textContent = 'Save ASC';
        }
      }
    };
    
    // Define the delete function
    const deleteAsc = async function(id) {
      try {
        // Log what we're deleting
        console.log('Deleting ASC with ID:', id);
        
        // Show loading state
        const deleteButton = ascDialog.dialogElement?.querySelector('button.btn-danger');
        if (deleteButton) {
          deleteButton.disabled = true;
          deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...';
        }
        
        // Convert to string if needed
        const ascId = id.toString();
        
        // Remove the ASC from the data manager's array
        // This approach mirrors what would happen in updateAscStatus
        const ascIndex = kanbanBoard.dataManager.ascs.findIndex(a => a.id.toString() === ascId);
        if (ascIndex === -1) {
          throw new Error(`ASC with ID ${ascId} not found in data manager`);
        }
        
        // Remove the ASC from the array
        console.log(`Removing ASC at index ${ascIndex}`);
        kanbanBoard.dataManager.ascs.splice(ascIndex, 1);
        
        // Save all ASCs using the same method as drag-and-drop
        const success = await kanbanBoard.dataManager.saveAscs();
        
        if (!success) {
          throw new Error('Failed to save ASCs after deletion');
        }
        
        // Close dialog
        ascDialog.close();
        
        // Force a complete data refresh by clearing cache
        console.log('Reloading ASC data after deletion...');
        kanbanBoard.dataManager.ascs = [];
        kanbanBoard.dataManager.loaded = false;
        
        // Reload the ASC data completely
        await kanbanBoard.dataManager.init();
        console.log('Data reloaded after deletion, ASCs count:', kanbanBoard.dataManager.ascs.length);
        
        // Re-render the board with fresh data
        kanbanBoard.renderBoard();
        
        // Show success toast
        if (window.UiService) {
          window.UiService.showNotification('ASC deleted successfully!', 'success');
        } else {
          console.log('SUCCESS: ASC deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting ASC:', error);
        if (window.UiService) {
          window.UiService.showNotification(`Error: ${error.message}`, 'error');
        } else {
          console.error(`Error: ${error.message}`);
        }
        
        // Re-enable the delete button
        const deleteButton = ascDialog.dialogElement?.querySelector('button.btn-danger');
        if (deleteButton) {
          deleteButton.disabled = false;
          deleteButton.textContent = 'Delete';
        }
      }
    };
    
    // Create the form instance with our completely pre-loaded enhanced data
    const ascFormInstance = new AscForm({
      data: enhancedAsc,  // Pass our fully pre-loaded data with all required fields
      onSubmit: saveAsc,
      onDelete: deleteAsc,
      // Pass additional flags to ensure reliable initialization
      preloadedData: true,
      directInitialization: true,
      skipDataFetching: true  // Skip fetching data since we already have everything
    });
    
    console.log('Form instance created with pre-loaded data');
    
    // Set form as dialog content
    ascDialog.setContent(ascFormInstance.element);
    
    // Give the browser a moment to render
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Add custom footer buttons programmatically to properly connect to form submission
    const footer = ascDialog.dialogElement.querySelector('.dialog-footer');
    if (footer) {
      // Clear any existing buttons
      footer.innerHTML = '';
      
      // Add Cancel button
      const cancelButton = document.createElement('button');
      cancelButton.type = 'button';
      cancelButton.className = 'btn btn-secondary';
      cancelButton.textContent = 'Cancel';
      cancelButton.onclick = () => ascDialog.close();
      footer.appendChild(cancelButton);
      
      // Add Save button with direct link to form's handleSubmit method
      const saveButton = document.createElement('button');
      saveButton.type = 'button';
      saveButton.className = 'btn btn-primary';
      saveButton.textContent = 'Save ASC';
      saveButton.dataset.action = 'save';
      saveButton.onclick = () => {
        console.log('Save button clicked - triggering form submission');
        // This is critical - directly call the form's handleSubmit method
        ascFormInstance.handleSubmit();
      };
      footer.appendChild(saveButton);
      
      // We don't need to add a Delete button here because the AscForm component already adds one
    }
    
    // Now open the dialog
    ascDialog.open();
    
    // For debugging, log when the dialog is opened
    console.log(`Opened ASC edit dialog for ASC-${enhancedAsc.id}`);
    console.log('Form instance:', ascFormInstance);
  }
}

// Initialize Kanban board when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing Kanban board');
  const kanbanBoard = new KanbanBoard();
  kanbanBoard.init();
});
