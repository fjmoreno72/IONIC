// links_new.js - Links page with table functionality
import { DataTable } from '../components/tableCore.js';
import { ColumnResizer } from '../components/columnResizer.js';
import { DialogManager } from '../components/dialogManager.js';
import { LinkForm } from '../components/linkForm.js';
import { LinkCIForm } from '../components/linkCIForm.js';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Elements specific to the Links page
  const noResults = document.getElementById('noResults');
  
  // Initialize column resizer
  const columnResizer = new ColumnResizer('.test-cases-table');
  
  // Store all GPs data (for resolving GP IDs to names)
  let allGPs = [];
  // Make the GPs available globally for other components
  window.allGPs = [];
  // Store GP filter selection
  let selectedGP = '';
  
  // Load GPs data for reference
  async function loadGPsData() {
    try {
      const response = await fetch('/static/ASC/data/gps.json');
      if (!response.ok) {
        throw new Error('Failed to load GPs data');
      }
      const data = await response.json();
      allGPs = [...data];
      window.allGPs = [...data]; // Store globally
      
      // Initialize GP dropdown after loading data
      initializeGPDropdown();
      
      return data;
    } catch (error) {
      console.error('Error loading GPs data:', error);
      return [];
    }
  }
  
  // Initialize searchable dropdown for GPs filter
  function initializeGPDropdown() {
    const gpFilterHeader = document.getElementById('gpFilterHeader');
    const gpDropdownMenu = document.getElementById('gpDropdownMenu');
    const gpSearchInput = document.getElementById('gpSearchInput');
    const gpOptionsContainer = document.getElementById('gpOptionsContainer');
    
    if (!gpFilterHeader || !gpDropdownMenu || !gpSearchInput || !gpOptionsContainer) {
      console.error('GP dropdown elements not found');
      return;
    }
    
    // Toggle dropdown visibility
    gpFilterHeader.addEventListener('click', function() {
      gpDropdownMenu.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      if (!gpFilterHeader.contains(event.target) && !gpDropdownMenu.contains(event.target)) {
        gpDropdownMenu.classList.remove('show');
      }
    });
    
    // Filter options when typing in search
    gpSearchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      populateGPOptions(searchTerm);
    });
    
    // Initial population of options
    populateGPOptions('');
  }
  
  // Populate GP options in the dropdown
  function populateGPOptions(searchTerm = '') {
    const gpOptionsContainer = document.getElementById('gpOptionsContainer');
    if (!gpOptionsContainer) return;
    
    // Clear existing options
    gpOptionsContainer.innerHTML = '';
    
    // Add "All" option
    const allOption = document.createElement('div');
    allOption.className = `gp-option ${selectedGP === '' ? 'selected' : ''}`;
    allOption.textContent = 'All Generic Products';
    allOption.addEventListener('click', function() {
      setSelectedGP('');
    });
    gpOptionsContainer.appendChild(allOption);
    
    // Filter and sort GPs
    const filteredGPs = allGPs
      .filter(gp => {
        return gp.name.toLowerCase().includes(searchTerm) || 
               gp.id.toLowerCase().includes(searchTerm) ||
               (gp.description && gp.description.toLowerCase().includes(searchTerm));
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    
    // Add each GP as an option
    filteredGPs.forEach(gp => {
      const option = document.createElement('div');
      option.className = `gp-option ${selectedGP === gp.id ? 'selected' : ''}`;
      option.textContent = `${gp.name}`;
      option.addEventListener('click', function() {
        setSelectedGP(gp.id);
      });
      gpOptionsContainer.appendChild(option);
    });
  }
  
  // Set the selected GP and update the UI
  function setSelectedGP(gpId) {
    selectedGP = gpId;
    
    // Update header text
    const gpFilterHeader = document.getElementById('gpFilterHeader');
    if (gpFilterHeader) {
      if (gpId === '') {
        gpFilterHeader.textContent = 'All Generic Products';
      } else {
        const gp = allGPs.find(g => g.id === gpId);
        gpFilterHeader.textContent = gp ? gp.name : gpId;
      }
    }
    
    // Close dropdown
    const gpDropdownMenu = document.getElementById('gpDropdownMenu');
    if (gpDropdownMenu) {
      gpDropdownMenu.classList.remove('show');
    }
    
    // Refresh the table with filter applied
    if (linksTable) {
      linksTable.filterAndRender();
    }
  }
  
  // Convert GP IDs to names for display
  function getGPNameById(gpId) {
    const gp = allGPs.find(g => g.id === gpId);
    return gp ? gp.name : gpId;
  }
  
  // Get comma-separated list of GP names from array of IDs
  function getGPNamesFromIds(gpIds) {
    if (!Array.isArray(gpIds) || gpIds.length === 0) {
      return '-';
    }
    
    return gpIds.map(id => getGPNameById(id)).join(', ');
  }
  
  // Load GPs data first, then initialize the links table
  let linksTable;
  
  // Load GP data first before initializing the links table
  loadGPsData().then(() => {
    // Configure and initialize the data table
    linksTable = new DataTable({
      tableId: 'linksTable',
      tableBodyId: 'linksTableBody',
      dataUrl: '/static/ASC/data/links.json',
      searchInputId: 'searchInput',
      itemsPerPageSelectId: 'itemsPerPageSelect',
      pageInfoId: 'pageInfo',
      prevButtonId: 'prevPageButton',
      nextButtonId: 'nextPageButton',
      defaultSortField: 'id',
      noResultsMessage: 'No Links found matching your criteria.',
      
      // Special handling for errors
      onFetchStart: () => {
        if (noResults) noResults.classList.add('d-none');
      },
      
      onFetchError: (error) => {
        console.error('Error fetching Links:', error);
        if (noResults) {
          noResults.classList.remove('d-none');
          noResults.querySelector('p').textContent = 'Error loading Links data.';
        }
      },
    
      onRenderComplete: (itemCount) => {
        // Show or hide the "No Results" element
        if (itemCount === 0 && noResults) {
          noResults.classList.remove('d-none');
        } else if (noResults) {
          noResults.classList.add('d-none');
        }
      },
      
      // Custom filter function
      filterFunction: (item, searchTerm) => {
      // Apply GP filter first if selected
      if (selectedGP && (
          !(Array.isArray(item.gps_side_a) && item.gps_side_a.includes(selectedGP)) && 
          !(Array.isArray(item.gps_side_b) && item.gps_side_b.includes(selectedGP))
      )) {
        return false;
      }
      
      // Then apply search term filter
      if (!searchTerm) return true;
      
      searchTerm = searchTerm.toLowerCase();
      
      // Basic fields: ID, name, description
      const basicMatch = (item.id?.toLowerCase() || '').includes(searchTerm) ||
                       (item.name?.toLowerCase() || '').includes(searchTerm) ||
                       (item.description?.toLowerCase() || '').includes(searchTerm);
      
      // Also search in GP names on both sides
      let gpMatchA = false;
      let gpMatchB = false;
      
      if (Array.isArray(item.gps_side_a)) {
        gpMatchA = item.gps_side_a.some(gpId => {
          const gp = allGPs.find(g => g.id === gpId);
          return gp && gp.name.toLowerCase().includes(searchTerm);
        });
      }
      
      if (Array.isArray(item.gps_side_b)) {
        gpMatchB = item.gps_side_b.some(gpId => {
          const gp = allGPs.find(g => g.id === gpId);
          return gp && gp.name.toLowerCase().includes(searchTerm);
        });
      }
      
      return basicMatch || gpMatchA || gpMatchB;
    },
    
    columns: [
      { key: 'id', label: 'ID', sortable: true, headerClass: 'text-center' },
      { key: 'name', label: 'Name', sortable: true, headerClass: 'text-center' },
      { key: 'description', label: 'Description', sortable: true, headerClass: 'text-center' },
      { 
        key: 'gps_side_a', 
        label: 'GP on Side A', 
        sortable: true,
        headerClass: 'text-center',
        render: (value, row) => {
          return getGPNamesFromIds(value);
        }
      },
      { 
        key: 'gps_side_b', 
        label: 'GP on Side B', 
        sortable: true,
        headerClass: 'text-center',
        render: (value, row) => {
          return getGPNamesFromIds(value);
        }
      },
      {
        key: 'actions',
        label: 'CIs',
        sortable: false,
        cellClass: 'text-center',
        headerClass: 'text-center',
        render: (value, row) => {
          if (!row || !row.id) return '';
          
          // Enable the button if there are CIs or always enable for view
          const disabled = false; // We're enabling viewing CIs now
          const ciCount = Array.isArray(row.linkCIs) ? row.linkCIs.length : 0;
          const badgeClass = ciCount > 0 ? 'badge bg-primary rounded-pill ms-1' : 'd-none';
          
          return `<button type="button" class="btn btn-sm btn-outline-primary view-ci-btn" title="View Link CIs" ${disabled ? 'disabled' : ''} 
                    data-link-id="${row.id}" 
                    data-link-name="${row.name || ''}">
                    <i class="fas fa-cog"></i>
                    <span class="${badgeClass}">${ciCount}</span>
                  </button>`;
        }
      }
    ]
    });
  });
  
  // Initialize dialog for adding/editing links
  const linkDialog = new DialogManager({
    id: 'linkDialog',
    title: 'Add Link',
    size: 'medium',
    onSave: () => {
      // Trigger form submission
      const form = document.getElementById('linkForm');
      if (form) {
        form.dispatchEvent(new Event('submit'));
      }
      return false; // Prevent dialog from closing automatically
    }
  });
  
  // Function to open dialog for adding/editing links
  function openLinkDialog(data = null) {
    // Update dialog title based on mode
    linkDialog.setTitle(data ? 'Edit Link' : 'Add Link');
    
    // Create form instance
    const linkForm = new LinkForm({
      data: data,
      onSubmit: (formData) => {
        // Handle form submission
        saveLinkData(formData);
      },
      onDelete: (id) => {
        // Handle link deletion
        deleteLink(id);
      }
    });
    
    // Set dialog content to the form
    linkDialog.setContent(linkForm.element);
    
    // Open dialog
    linkDialog.open();
  }
  
  // Save link data to the server
  async function saveLinkData(formData) {
    try {
      // Show loading state
      const saveButton = document.querySelector('#linkDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
      }
      
      // Determine if this is an edit or create
      const isEditing = !!formData.id;
      const method = isEditing ? 'PUT' : 'POST';
      
      // Send request to API
      const response = await fetch('/api/links', {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error saving link');
      }
      
      // Close dialog
      linkDialog.close();
      
      // Refresh table
      linksTable.fetchData();
      
      // Show success message
      showNotification('Link saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving link:', error);
      showNotification(error.message || 'Error saving link', 'danger');
    } finally {
      // Reset button state
      const saveButton = document.querySelector('#linkDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save';
      }
    }
  }
  
  // Delete link from the server
  async function deleteLink(id) {
    try {
      // Show loading state
      const deleteButton = document.querySelector('.delete-button-container .btn-danger');
      if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Deleting...';
      }
      
      // Send DELETE request to API
      const response = await fetch(`/api/links?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error deleting link');
      }
      
      // Close dialog
      linkDialog.close();
      
      // Refresh table
      linksTable.fetchData();
      
      // Show success message
      showNotification('Link deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting link:', error);
      showNotification(error.message || 'Error deleting link', 'danger');
    }
  }
  
  // Initialize dialog for displaying link CIs
  const ciDialog = new DialogManager({
    id: 'ciForLinkDialog',
    title: 'Link Configuration Items',
    size: 'large',
    onSave: () => {
      // Initially Save will be disabled so this won't be called
      return false;
    }
  });
  
  // Function to show a modal with Configuration Items for a specific Link
  function showLinkCisDialog(linkId, linkName) {
    try {
      // Set the dialog title
      ciDialog.setTitle(`Configuration Items for ${linkName}`);
      
      // Reset dialog buttons to just Close for now
      ciDialog.setButtons([
        { text: 'Close', class: 'btn-secondary', action: 'cancel' }
      ]);
      
      // Show loading state in the dialog content
      const loadingContent = document.createElement('div');
      loadingContent.className = 'text-center p-5';
      loadingContent.innerHTML = `
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3">Loading Configuration Items...</p>
      `;
      ciDialog.setContent(loadingContent);
      ciDialog.open();
      
      // Need to fetch the links data directly from the source to ensure we have it
      fetch('/static/ASC/data/links.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to load links data');
          }
          return response.json();
        })
        .then(linksData => {
          // Find the link by ID in the fetched data
          const link = linksData.find(item => item.id === linkId);
          
          if (!link) {
            throw new Error(`Link with ID ${linkId} not found`);
          }
          
          // Get the CIs from the link
          const linkCIs = Array.isArray(link.linkCIs) ? link.linkCIs : [];
          
          // Create content for the modal
          const modalContent = document.createElement('div');
          modalContent.className = 'ci-modal-content';
          
          // Container for the CI list and add button
          const headerContainer = document.createElement('div');
          headerContainer.className = 'd-flex justify-content-between align-items-center mb-3';
          headerContainer.innerHTML = `
            <h5 class="mb-0">Found ${linkCIs.length} item${linkCIs.length !== 1 ? 's' : ''}</h5>
            <button type="button" class="btn btn-primary btn-sm" id="addCiForLinkBtn">
              <i class="fas fa-plus me-1"></i> Add New Configuration Item
            </button>
          `;
          modalContent.appendChild(headerContainer);
          
          // If there are no CIs, show a message
          if (linkCIs.length === 0) {
            const noCIsMessage = document.createElement('div');
            noCIsMessage.className = 'alert alert-info';
            noCIsMessage.textContent = `No Configuration Items found for ${linkName}.`;
            modalContent.appendChild(noCIsMessage);
          } else {
            // Create a table to display the CIs
            const table = document.createElement('table');
            table.className = 'table table-hover';
            table.innerHTML = `
              <thead>
                <tr>
                  <th class="text-center">Name</th>
                  <th class="text-center">Help Text</th>
                  <th class="text-center">Default Value</th>
                  <th class="text-center">Answer Type</th>
                  <th class="text-center">Answer Content</th>
                  <th class="text-center">Apply A/B</th>
                  <th class="text-center">Edit</th>
                </tr>
              </thead>
              <tbody id="ciModalTableBody">
                ${linkCIs.map(ci => `
                  <tr>
                    <td class="text-center">${ci.Name || ''}</td>
                    <td class="text-center">${ci['Help Text'] || ''}</td>
                    <td class="text-center">${ci['Default Value'] || ''}</td>
                    <td class="text-center">${ci['Answer Type'] || ''}</td>
                    <td class="text-center">${ci['Answer Content'] || ''}</td>
                    <td class="text-center">${ci['Apply A/B'] || ''}</td>
                    <td class="text-center">
                      <button type="button" class="btn btn-sm btn-outline-primary edit-ci-btn"
                              data-ci-name="${ci.Name}">
                        <i class="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            `;
            modalContent.appendChild(table);
          }
          
          // Set the modal content
          ciDialog.setContent(modalContent);
          
          // Add event handlers for CI buttons
          setupCIEventHandlers(linkId, linkName, link, linksData);
        })
        .catch(error => {
          console.error('Error showing Link CIs:', error);
          // Show error message in the dialog
          const errorContent = document.createElement('div');
          errorContent.className = 'alert alert-danger';
          errorContent.textContent = 'Error loading Configuration Items. Please try again.';
          ciDialog.setContent(errorContent);
        });
      
      return; // Early return since we're using a promise-based approach
      
    } catch (error) {
      console.error('Error showing Link CIs:', error);
      // Show error message in the dialog
      const errorContent = document.createElement('div');
      errorContent.className = 'alert alert-danger';
      errorContent.textContent = 'Error loading Configuration Items. Please try again.';
      ciDialog.setContent(errorContent);
    }
  }
  
  // Add row click handler for editing links and showing CIs
  const tableBody = document.getElementById('linksTableBody');
  if (tableBody) {
    tableBody.addEventListener('click', (e) => {
      // Check if the CI button was clicked
      const ciButton = e.target.closest('.view-ci-btn');
      if (ciButton) {
        e.stopPropagation(); // Prevent opening the link edit dialog
        
        // Get the link ID and name from the button data attributes
        const linkId = ciButton.dataset.linkId;
        const linkName = ciButton.dataset.linkName;
        
        if (linkId) {
          // Show CIs dialog for this link
          showLinkCisDialog(linkId, linkName);
        }
        
        return;
      }
      
      // Handle row clicks for editing the link
      const row = e.target.closest('tr');
      if (!row) return;
      
      // Get the row index
      const rowIndex = Array.from(row.parentNode.children).indexOf(row);
      
      // Get the data for this row
      const link = linksTable.filteredItems[rowIndex + (linksTable.currentPage - 1) * linksTable.itemsPerPage];
      
      if (link) {
        // Open edit dialog with this data
        openLinkDialog(link);
      }
    });
  }
  
  // Enable the Add Link button (but keep it disabled as mentioned in requirements)
  const addLinkButton = document.getElementById('addLinkButton');
  if (addLinkButton) {
    // Enable the button for our implementation
    addLinkButton.disabled = false;
    addLinkButton.addEventListener('click', () => {
      openLinkDialog();
    });
  }
  
  // Initialize dialog for editing/adding link CIs
  const linkCIDialog = new DialogManager({
    id: 'linkCIDialog',
    title: 'Configuration Item',
    size: 'medium',
    onSave: () => {
      // Trigger form submission
      const form = document.getElementById('linkCIForm');
      if (form) {
        form.dispatchEvent(new Event('submit'));
      }
      return false; // Prevent dialog from closing automatically
    }
  });
  
  // Function to set up event handlers for CI actions in the modal
  function setupCIEventHandlers(linkId, linkName, link, linksData) {
    // Add event listener for the Add New CI button
    const addCIButton = document.getElementById('addCiForLinkBtn');
    if (addCIButton) {
      addCIButton.addEventListener('click', () => {
        openLinkCIDialog(null, linkId, linkName, link, linksData);
      });
    }
    
    // Add event listeners for the Edit CI buttons
    const editCIButtons = document.querySelectorAll('.edit-ci-btn');
    editCIButtons.forEach(button => {
      button.addEventListener('click', () => {
        const ciName = button.dataset.ciName;
        // Find the CI data
        if (Array.isArray(link.linkCIs)) {
          const ci = link.linkCIs.find(ci => ci.Name === ciName);
          if (ci) {
            openLinkCIDialog(ci, linkId, linkName, link, linksData);
          }
        }
      });
    });
  }
  
  // Function to open the Link CI dialog for adding/editing a CI
  function openLinkCIDialog(ciData, linkId, linkName, link, linksData) {
    // Set dialog title based on mode
    const isEditing = !!ciData;
    linkCIDialog.setTitle(isEditing ? `Edit Configuration Item for ${linkName}` : `Add Configuration Item for ${linkName}`);
    
    // Create the form
    const linkCIForm = new LinkCIForm({
      data: ciData || {},
      linkId: linkId,
      linkName: linkName,
      link: link, // Pass the link data to get GP information
      gpNames: getGPNamesFromIds, // Pass function to resolve GP names
      onSubmit: (formData) => {
        saveLinkCI(formData, linkId, linkName, link, linksData, isEditing ? ciData.Name : null);
      },
      onDelete: (ciName) => {
        deleteLinkCI(ciName, linkId, linkName, link, linksData);
      }
    });
    
    // Set the dialog content
    linkCIDialog.setContent(linkCIForm.element);
    
    // Open the dialog
    linkCIDialog.open();
  }
  
  // Function to save a Link CI (create or update)
  async function saveLinkCI(formData, linkId, linkName, link, linksData, originalName = null) {
    try {
      // Show loading state
      const saveButton = document.querySelector('#linkCIDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';
      }
      
      // Clone the link to avoid mutating the original
      const updatedLink = JSON.parse(JSON.stringify(link)); // Deep clone
      
      // Initialize linkCIs array if it doesn't exist
      if (!Array.isArray(updatedLink.linkCIs)) {
        updatedLink.linkCIs = [];
      }
      
      // If editing, remove the original CI first
      if (originalName) {
        updatedLink.linkCIs = updatedLink.linkCIs.filter(ci => ci.Name !== originalName);
      }
      
      // Add the new/updated CI
      updatedLink.linkCIs.push(formData);
      
      // Now send the updated link to the server using the API
      const response = await fetch('/api/links', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedLink)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error saving configuration item');
      }
      
      try {
        // Close the CI dialog
        linkCIDialog.close();
        
        // Update the link in linksData so it's reflected in the UI
        const linkIndex = linksData.findIndex(item => item.id === linkId);
        if (linkIndex !== -1) {
          linksData[linkIndex] = updatedLink;
        }
        
        // Show success message first
        showNotification(`Configuration item ${originalName ? 'updated' : 'added'} successfully!`, 'success');
        
        // Refresh the main table data to update badge counts
        await linksTable.fetchData();
        
        // Small delay to ensure UI is updated before reopening the dialog
        setTimeout(() => {
          // Refresh the CI list view
          showLinkCisDialog(linkId, linkName);
        }, 100);
      } catch (innerError) {
        console.error('Error in post-save operations:', innerError);
      }
    } catch (error) {
      console.error('Error saving configuration item:', error);
      showNotification(error.message || 'Error saving configuration item', 'danger');
    } finally {
      // Reset button state
      const saveButton = document.querySelector('#linkCIDialog .btn-primary');
      if (saveButton) {
        saveButton.disabled = false;
        saveButton.textContent = 'Save';
      }
    }
  }
  
  // Function to delete a Link CI
  async function deleteLinkCI(ciName, linkId, linkName, link, linksData) {
    try {
      // Show loading state
      const deleteButton = document.querySelector('#linkCIDialog .btn-danger');
      if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Deleting...';
      }
      
      // Clone the link to avoid mutating the original
      const updatedLink = JSON.parse(JSON.stringify(link)); // Deep clone
      
      // Remove the CI from the link
      if (Array.isArray(updatedLink.linkCIs)) {
        updatedLink.linkCIs = updatedLink.linkCIs.filter(ci => ci.Name !== ciName);
        
        // Send the updated link to the server using the API
        const response = await fetch('/api/links', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedLink)
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error deleting configuration item');
        }
        
        try {
          // Update the link in linksData so it's reflected in the UI
          const linkIndex = linksData.findIndex(item => item.id === linkId);
          if (linkIndex !== -1) {
            linksData[linkIndex] = updatedLink;
          }
          
          // Close the CI dialog
          linkCIDialog.close();
          
          // Show success message first
          showNotification('Configuration item deleted successfully!', 'success');
          
          // Refresh the main table data to update badge counts
          await linksTable.fetchData();
          
          // Small delay to ensure UI is updated before reopening the dialog
          setTimeout(() => {
            // Refresh the CI list view
            showLinkCisDialog(linkId, linkName);
          }, 100);
        } catch (innerError) {
          console.error('Error in post-delete operations:', innerError);
        }
      }
    } catch (error) {
      console.error('Error deleting configuration item:', error);
      showNotification(error.message || 'Error deleting configuration item', 'danger');
    }
  }
  
  // Function to show notifications
  function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'notification';
      notification.className = `notification alert alert-${type}`;
      notification.style.position = 'fixed';
      notification.style.top = '20px';
      notification.style.right = '20px';
      notification.style.zIndex = '9999';
      notification.style.minWidth = '300px';
      notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
      notification.style.transition = 'opacity 0.3s ease-in-out';
      document.body.appendChild(notification);
    } else {
      // Update class for the type
      notification.className = `notification alert alert-${type}`;
    }
    
    // Set message
    notification.textContent = message;
    
    // Show notification
    notification.style.display = 'block';
    notification.style.opacity = '1';
    
    // Auto-hide after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.style.display = 'none';
      }, 300);
    }, 3000);
  }
});
