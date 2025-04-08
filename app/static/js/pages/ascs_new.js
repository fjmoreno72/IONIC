// ascs_new.js - ASCs page using component architecture
import { DataTable } from '../components/tableCore.js';
import { ColumnResizer } from '../components/columnResizer.js';
import { DialogManager } from '../components/dialogManager.js'; // Import DialogManager
import { AscForm } from '../components/ascForm.js'; // Import AscForm
import { UiService } from '../services/uiService.js'; // Correct import path

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Elements specific to the ASCs page
  const noResults = document.getElementById('noResults');
  const affiliateFilter = document.getElementById('affiliateFilter');
  const serviceFilter = document.getElementById('serviceFilter');
  const statusFilter = document.getElementById('statusFilter');
  const environmentFilter = document.getElementById('environmentFilter');

  // Initialize column resizer
  const columnResizer = new ColumnResizer('.test-cases-table');

  // Store affiliates, services, GPs and SPs data for display purposes
  let affiliatesData = [];
  let servicesData = [];
  let gpsData = [];
  let spsData = [];
  let ascsTable = null; // Make table instance accessible globally in this scope

  // --- Dialog Manager Setup ---
  const ascDialog = new DialogManager({
    id: 'ascDialog',
    title: 'Add ASC', // Default title
    size: 'large', // Or 'medium', 'large', 'xlarge'
    onSave: () => {
      // Trigger form submission programmatically
      const form = document.getElementById('ascForm'); // Use the ID set in AscForm
      if (form) {
        // Use requestSubmit() for better form lifecycle handling if available, else fallback
        if (typeof form.requestSubmit === 'function') {
            form.requestSubmit();
        } else {
            form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
      return false; // Prevent DialogManager from closing automatically
    }
    // onCancel is handled by DialogManager closing itself
  });


  // --- CRUD Operations ---

  // Function to open the Add/Edit ASC Dialog
  function openAscDialog(data = null) {
    ascDialog.setTitle(data ? 'Edit ASC' : 'Add ASC');

    // Create the form instance, passing the save function as the onSubmit callback
    const ascFormInstance = new AscForm({
      data: data, // Pass existing data for editing (null for adding)
      onSubmit: saveAsc, // Pass the saveAsc function reference
      onDelete: deleteAsc, // Pass the deleteAsc function reference
    });

    ascDialog.setContent(ascFormInstance.element); // Set the form as the dialog content
    ascDialog.open();
  }

  // Function to save (add or update) an ASC
  async function saveAsc(formData) {
    const isEdit = !!formData.id; // Check if it's an update later
    const method = isEdit ? 'PUT' : 'POST';
    const url = '/api/ascs' + (isEdit ? `?id=${formData.id}` : ''); // Add ID for PUT later

    // Show loading state on the dialog's save button
    // Query the button within the dialog element using its data attribute
    const saveButton = ascDialog.dialogElement?.querySelector('button[data-action="save"]');
     if (saveButton) {
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
    }

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          // Add other headers like CSRF token if needed
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json(); // Try to parse JSON regardless of status

      if (!response.ok) {
        // Use error message from API response if available
        throw new Error(result.error || `HTTP error! Status: ${response.status}`);
      }

      UiService.showNotification(`ASC ${isEdit ? 'updated' : 'added'} successfully!`, 'success'); // Use UiService
      ascDialog.close();

      // Refresh the data table
      if (ascsTable) {
        // Option 1: Refetch all data
        if (ascsTable.fetchData) { // Check if fetchData method exists
             ascsTable.fetchData();
        } else {
             console.warn("DataTable instance does not have fetchData method. Cannot refresh.");
             // Potentially reload the page as a fallback
             // window.location.reload();
        }

        // Option 2: Add/Update data locally (more complex, faster UI) - Requires DataTable methods
        // if (isEdit) {
        //   ascsTable.updateItem(result.asc); // Assuming updateItem method exists
        // } else {
        //   ascsTable.addItem(result.asc); // Assuming addItem method exists
        // }
        // ascsTable.filterAndRender();
      }

    } catch (error) {
      console.error('Error saving ASC:', error);
      UiService.showNotification(`Error saving ASC: ${error.message}`, 'danger'); // Use UiService
    } finally {
      // Reset save button state
       if (saveButton) {
            saveButton.disabled = false;
            saveButton.textContent = 'Save';
        }
    }
  }

   // Function to delete an ASC
  async function deleteAsc(ascId) {
    if (!ascId) {
        console.error("No ASC ID provided for deletion.");
        return;
    }

    // Show loading state on the main dialog's delete button (if it exists within the form)
    // Or potentially disable the main save/cancel buttons
    const deleteButtonInForm = ascDialog.dialogElement?.querySelector('.delete-button-container button');
     if (deleteButtonInForm) {
        deleteButtonInForm.disabled = true;
        deleteButtonInForm.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...';
    }
    // Optionally disable main dialog buttons
    // ascDialog.dialogElement?.querySelectorAll('.dialog-footer button').forEach(btn => btn.disabled = true);


    try {
      const response = await fetch(`/api/ascs?id=${ascId}`, {
        method: 'DELETE',
        headers: {
          // Add other headers like CSRF token if needed
        }
      });

      const result = await response.json(); // Try to parse JSON

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! Status: ${response.status}`);
      }

      UiService.showNotification(`ASC ${ascId} deleted successfully!`, 'success');
      ascDialog.close(); // Close the main dialog

      // Refresh the data table
      if (ascsTable && ascsTable.fetchData) {
        ascsTable.fetchData();
      } else {
        console.warn("DataTable instance or fetchData method not available. Cannot refresh after delete.");
      }

    } catch (error) {
      console.error('Error deleting ASC:', error);
      UiService.showNotification(`Error deleting ASC: ${error.message}`, 'danger');
       // Re-enable buttons on error
       if (deleteButtonInForm) {
            deleteButtonInForm.disabled = false;
            deleteButtonInForm.innerHTML = '<i class="fas fa-trash me-1"></i> Delete ASC';
       }
       // ascDialog.dialogElement?.querySelectorAll('.dialog-footer button').forEach(btn => btn.disabled = false);
    }
    // No finally needed here as the dialog is closed on success, and buttons re-enabled on error.
  }


  // --- Data Fetching Functions ---
  // Fetch required data: affiliates for flag lookup
  const fetchAffiliatesData = async () => {
    try {
      const response = await fetch('/api/affiliates'); // Changed to API endpoint
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      affiliatesData = await response.json();

      // Populate affiliate filter dropdown
      populateAffiliateFilter(affiliatesData);

      return affiliatesData;
    } catch (error) {
      console.error('Error fetching affiliates data:', error);
      return [];
    }
  };

  // Fetch services data for service name lookup
  const fetchServicesData = async () => {
    try {
      const response = await fetch('/api/services'); // Changed to API endpoint
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      servicesData = await response.json();

      // Populate service filter dropdown
      populateServiceFilter(servicesData);

      return servicesData;
    } catch (error) {
      console.error('Error fetching services data:', error);
      return [];
    }
  };

  // Fetch GPs data for GP name lookup from the API
  const fetchGpsData = async () => {
    try {
      const response = await fetch('/api/gps'); // Use the API endpoint
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      gpsData = await response.json();
      console.log('Successfully fetched GPs data:', gpsData.length, 'items'); // Log success
      return gpsData;
    } catch (error) {
      console.error('!!! Critical Error fetching GPs data:', error.message, error.stack); // Log detailed error
      // Display error to user potentially?
      // For now, return empty array but log prominently
      gpsData = []; // Ensure gpsData is empty on error
      return [];
    }
  };

  // Fetch SPs data for SP name lookup
  const fetchSpsData = async () => {
    try {
      const response = await fetch('/api/sps'); // Corrected: Use API endpoint
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      spsData = await response.json();
      return spsData;
    } catch (error) {
      console.error('Error fetching SPs data:', error);
      return [];
    }
  };

  // Function to populate the affiliate filter dropdown
  const populateAffiliateFilter = (affiliates) => {
    if (!affiliateFilter) return;

    // Clear existing options except the default "All" option
    while (affiliateFilter.options.length > 1) {
      affiliateFilter.remove(1);
    }

    // Sort affiliates by name
    const sortedAffiliates = [...affiliates].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Add options for each affiliate
    sortedAffiliates.forEach(affiliate => {
      const option = document.createElement('option');
      option.value = affiliate.id;
      option.textContent = affiliate.name;
      affiliateFilter.appendChild(option);
    });
  };

  // Function to populate the service filter dropdown
  const populateServiceFilter = (services) => {
    if (!serviceFilter) return;

    // Clear existing options except the default "All" option
    while (serviceFilter.options.length > 1) {
      serviceFilter.remove(1);
    }

    // Sort services by name
    const sortedServices = [...services].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Add options for each service
    sortedServices.forEach(service => {
      const option = document.createElement('option');
      option.value = service.id;
      option.textContent = service.name;
      serviceFilter.appendChild(option);
    });
  };

  // Helper function to get affiliate data by ID
  const getAffiliateById = (id) => {
    return affiliatesData.find(affiliate => affiliate.id === id) || null;
  };

  // Helper function to get service data by ID
  const getServiceById = (id) => {
    return servicesData.find(service => service.id === id) || null;
  };

  // Helper function to get GP data by ID
  const getGpById = (id) => {
    return gpsData.find(gp => gp.id === id) || null;
  };

  // Helper function to get SP data by ID
  const getSpById = (id) => {
    // Removed diagnostic logging
    const found = spsData.find(sp => sp.id === id);
    return found || null;
  };
  const getProgressClass = (percentage) => {
    if (percentage >= 100) return 'progress-100';
    if (percentage >= 75) return 'progress-75';
    if (percentage >= 50) return 'progress-50';
    if (percentage >= 25) return 'progress-25';
    return 'progress-0';
  };

  // Format GP Instances for display
  const formatGpInstances = (gpInstances) => {
    if (!gpInstances || !Array.isArray(gpInstances) || gpInstances.length === 0) {
      return '';
    }

    const gpInstancesHtml = gpInstances.map(instance => {
      // Get GP name from ID or keep the ID if not found
      const gpInfo = getGpById(instance.gpId);
      const gpName = gpInfo ? gpInfo.name : instance.gpId;
      const gpId = instance.gpId || 'Unknown';
      const label = instance.instanceLabel || '';

      let spInfo = '';
      if (instance.spInstances && instance.spInstances.length > 0) {
        spInfo = instance.spInstances.map(sp => {
          // Get SP name from ID or keep the ID if not found
          const spInfo = getSpById(sp.spId);
          const spName = spInfo ? spInfo.name : sp.spId;
          return `${spName} (${sp.spVersion})`;
        }).join(', ');
      }

      // Format the HTML string
      if (spInfo) {
        return `<div><strong>${gpName}</strong>${label ? ` - ${label}` : ''} with ${spInfo}</div>`;
      } else {
        return `<div><strong>${gpName}</strong>${label ? ` - ${label}` : ''}</div>`;
      }
    }).join('');

    return gpInstancesHtml;
  };

  // Helper function to fetch ASCs data
  const fetchAscsData = async () => {
    try {
      // Fetch from the new API endpoint
      const response = await fetch('/api/ascs');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching ASCs data:', error);
      return []; // Return empty array on error
    }
  };

  // Initialize data loading - Fetch ALL data needed before initializing table
  Promise.all([
    fetchAffiliatesData(),
    fetchServicesData(),
    fetchGpsData(),
    fetchSpsData()
    // Removed fetchAscsData() - DataTable will fetch it
  ])
    .then(([affiliates, services, gps, sps]) => { // Only destructure needed data
      // Assign to outer scope variables *inside* the .then()
      affiliatesData = affiliates;
      servicesData = services;
      gpsData = gps;
      spsData = sps;

      // Configure and initialize the data table, passing ASCs data directly
      // Assign to the outer scope variable
      ascsTable = new DataTable({
        tableId: 'ascsTable',
        tableBodyId: 'ascsTableBody',
        // data: ascs, // Data will be fetched by the table itself now
        dataUrl: '/api/ascs', // Use the API endpoint to fetch data
        searchInputId: 'ascSearchInput',
        itemsPerPageSelectId: 'itemsPerPageSelect',
        pageInfoId: 'pageInfo',
        prevButtonId: 'prevPageButton',
        nextButtonId: 'nextPageButton',
        defaultSortField: 'id',
        noResultsMessage: 'No ASCs found matching your criteria.',

        // Error handling
        onFetchStart: () => {
          if (noResults) noResults.classList.add('d-none');
        },

        onFetchError: (error) => {
          console.error('Error fetching ASCs:', error);
          if (noResults) {
            noResults.classList.remove('d-none');
            noResults.querySelector('p').textContent = 'Error loading ASC data.';
          }
        },

        onRenderComplete: (itemCount) => {
          if (itemCount === 0 && noResults) {
            noResults.classList.remove('d-none');
          } else if (noResults) {
            noResults.classList.add('d-none');
          }
        },

        // Custom filter function that includes the dropdown filters
        filterFunction: (item, searchTerm) => {
          // Get the current filter values
          const selectedAffiliate = affiliateFilter ? affiliateFilter.value : '';
          const selectedService = serviceFilter ? serviceFilter.value : '';
          const selectedStatus = statusFilter ? statusFilter.value : '';
          const selectedEnvironment = environmentFilter ? environmentFilter.value : '';


          // Check ID, Service, or Affiliate match for the search term
          const itemAffiliate = getAffiliateById(item.affiliateId);
          const itemService = getServiceById(item.serviceId);

          // Only check search term match if there's a search term
          let searchMatch = true;
          if (searchTerm && searchTerm.length > 0) {
            searchMatch = (item.id?.toLowerCase() || '').includes(searchTerm) ||
                          (item.serviceId?.toLowerCase() || '').includes(searchTerm) ||
                          (item.affiliateId?.toLowerCase() || '').includes(searchTerm) ||
                          (itemAffiliate?.name?.toLowerCase() || '').includes(searchTerm) ||
                          (itemService?.name?.toLowerCase() || '').includes(searchTerm);
          }

          // Check filter matches using simple exact matches
          const affiliateMatch = selectedAffiliate === '' || item.affiliateId === selectedAffiliate;
          const serviceMatch = selectedService === '' || item.serviceId === selectedService;
          const statusMatch = selectedStatus === '' || item.status === selectedStatus;
          const environmentMatch = selectedEnvironment === '' || item.environment === selectedEnvironment;


          // All conditions must match
          return searchMatch && affiliateMatch && serviceMatch && statusMatch && environmentMatch;
        },

        columns: [
          { key: 'id', label: 'ID', sortable: true},
          {
            key: 'affiliateId',
            label: 'Flag',
            sortable: false,
            //cellClass: 'text-center',
            render: (value) => {
              const affiliate = getAffiliateById(value);
              if (affiliate && affiliate.flagPath) {
                return `<img src="/static/ASC/${affiliate.flagPath.replace('./', '')}" alt="${affiliate.name || 'Flag'}" class="flag-icon">`;
              }
              return '';
            }
          },
          {
            key: 'affiliateId',
            label: 'Affiliate',
            sortable: true,
            render: (value) => {
              const affiliate = getAffiliateById(value);
              return affiliate ? affiliate.name : value;
            }
          },
          { key: 'environment', label: 'Environment', sortable: true },
          {
            key: 'serviceId',
            label: 'Service',
            sortable: true,
            render: (value) => {
              const service = getServiceById(value);
              return service ? service.name : value;
            }
          },
          { key: 'spiral', label: 'Spiral', sortable: true },
          {
            key: 'status',
            label: 'Status',
            sortable: true,
            //cellClass: 'text-center',
            render: (value) => {
              const statusClass = `status-badge status-${value.toLowerCase().replace(' ', '-')}`;
              return `<span class="${statusClass}">${value}</span>`;
            }

          },
          {
            key: 'ascScore',
            label: 'ASC Score',
            sortable: true,
            cellClass: 'ascScore', // Add a class to the TD element
            render: (value) => {
              // Convert ascScore string to percentage number
              const scoreValue = parseInt(value, 10) || 0;
              const progressClass = getProgressClass(scoreValue);

              // Return the colored indicator span
              return `<span class="progress-indicator ${progressClass}">${scoreValue}%</span>`;
            }
          },
          {
            key: 'gpInstances',
            label: 'GP Instances',
            sortable: false,
            render: (value) => formatGpInstances(value)
          }
        ]
      });

      // Add event listeners for the additional filters
      if (affiliateFilter) {
        affiliateFilter.addEventListener('change', () => {
          ascsTable.filterAndRender();
        });
      }

      if (serviceFilter) {
        serviceFilter.addEventListener('change', () => {
          ascsTable.filterAndRender();
        });
      }

      if (statusFilter) {
        statusFilter.addEventListener('change', () => {
          ascsTable.filterAndRender();
        });
      }

      if (environmentFilter) {
        environmentFilter.addEventListener('change', () => {
          ascsTable.filterAndRender();
        });
      }

      // Add event listener for the Add ASC button
      const addAscButton = document.getElementById('addAscButton');
      if (addAscButton) {
        addAscButton.disabled = false; // Enable the button now
        addAscButton.addEventListener('click', () => {
          openAscDialog(); // Open dialog for adding (no data passed)
        });
      } else {
        console.warn("Add ASC button (#addAscButton) not found.");
      }

      // Add row click listener for editing
      const tableBody = document.getElementById('ascsTableBody');
      if (tableBody && ascsTable) {
          tableBody.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            if (!row) return;

            const ascId = row.dataset.id; // Get ID from data-id attribute
            if (!ascId) {
                 console.warn("Clicked row is missing data-id attribute.");
                 UiService.showNotification("Could not identify data for editing.", "warning");
                 return;
            }

            // Find the item in the DataTable's current full dataset (allItems)
            // This is more reliable than using filteredItems or calculating indices
            const ascData = ascsTable.allItems?.find(item => item.id === ascId);

            if (ascData) {
              console.log("Editing ASC:", ascData);
              // Pass a deep copy to prevent accidental modification of the table's data
              openAscDialog(JSON.parse(JSON.stringify(ascData)));
            } else {
              console.warn(`Could not find ASC data in allItems for ID: ${ascId}`);
              UiService.showNotification("Could not load data for editing.", "warning");
            }
          });
      } else {
           console.warn("Table body (#ascsTableBody) or DataTable instance not found. Cannot add edit listener.");
      }

    })
    .catch(error => {
      console.error('Error initializing ASCs page:', error);
    });
});
