// kanban-board.js - Kanban board UI and drag-drop handling

import { DataManager } from './data-manager.js';
import { ThemeManager } from '../../js/components/themeManager.js';

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
          ${serviceName}
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
}

// Initialize Kanban board when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing Kanban board');
  const kanbanBoard = new KanbanBoard();
  kanbanBoard.init();
});
