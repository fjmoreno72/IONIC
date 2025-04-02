// columnResizer.js - Table column resizing functionality
export class ColumnResizer {
  constructor(tableSelector) {
    this.tableSelector = tableSelector;
    this.init();
  }
  
  init() {
    const table = document.querySelector(this.tableSelector);
    if (!table) return;
    
    const headers = table.querySelectorAll('th');
    this.setupResizableColumns(headers);
  }
  
  setupResizableColumns(headers) {
    headers.forEach(header => {
      // Skip if handle already exists or if it's a special column to ignore
      if (header.querySelector('.resize-handle')) return;
      
      // Create resize handle
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'resize-handle';
      header.appendChild(resizeHandle);
      
      // Set up drag handlers
      this.setupDragHandlers(header, resizeHandle);
    });
  }
  
  setupDragHandlers(header, handle) {
    let startX, startWidth;
    
    const mouseMoveHandler = (e) => {
      // Calculate new width, ensuring it doesn't go below a minimum
      const width = Math.max(10, startWidth + (e.pageX - startX));
      header.style.width = `${width}px`;
      header.style.minWidth = `${width}px`;
    };
    
    const mouseUpHandler = () => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
      document.body.style.userSelect = '';
    };
    
    handle.addEventListener('mousedown', function(e) {
      startX = e.pageX;
      startWidth = header.offsetWidth;
      
      // Add mousemove and mouseup event listeners to the document
      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
      
      // Disable text selection during resize for smoother experience
      document.body.style.userSelect = 'none';
      
      // Prevent default drag behavior
      e.preventDefault();
    });
  }
}
