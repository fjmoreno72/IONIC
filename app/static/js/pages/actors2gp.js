// Actors to Generic Products mapping management

import { DataTable } from '../components/tableCore.js';
import { ColumnResizer } from '../components/columnResizer.js';
import { DialogManager } from '../components/dialogManager.js';
import { ActorGpForm } from '../components/actorGpForm.js';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize components when DOM is loaded
    
    // Initialize dialog for editing actor to GP mappings
    const actorGpDialog = new DialogManager({
        id: 'actorGpDialog',
        title: 'Edit Actor to GP Mapping',
        size: 'medium',
        onSave: () => {
            // Trigger form submission
            const form = document.getElementById('actorGpDialog').querySelector('form');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
            return false; // Prevent dialog from closing automatically
        }
    });

    // Track unique services and models for filters
    let uniqueServices = new Set();
    let uniqueModels = new Set();
    
    // Store filter selections for persistence
    let persistentFilterState = {
        service: '',
        model: ''
    };
    
    const actors2gpTable = new DataTable({
        tableId: 'actors2gpTable',
        tableBodyId: 'actors2gpTableBody',
        dataUrl: '/api/actors2gp/all',
        searchInputId: 'searchInput',
        itemsPerPageSelectId: 'itemsPerPageSelect',
        pageInfoId: 'pageInfo',
        prevButtonId: 'prevPageButton',
        nextButtonId: 'nextPageButton',
        defaultSortField: 'service_name',
        noResultsMessage: 'No Actor to GP mappings found matching your criteria.',
        columns: [
            { key: 'service_name', label: 'Service Name', sortable: true },
            { key: 'model_name', label: 'Model Name', sortable: true },
            { key: 'actor_name', label: 'Actor Name', sortable: true },
            { 
                key: 'gp_name', 
                label: 'GP Name(s)', 
                sortable: true, 
                render: (value) => {
                    if (Array.isArray(value)) {
                        return value.length > 0 ? value.join(', ') : '(None)';
                    }
                    return value || '(None)';
                }
            }
        ],
        onDataFetched: (data) => {
            if (data && data.data && Array.isArray(data.data.services)) {
                // Clear unique sets before repopulating
                uniqueServices.clear();
                uniqueModels.clear();
                
                const flattenedData = flattenData(data.data.services);
                
                // Store filter values before updating filters
                const previousServiceFilter = persistentFilterState.service;
                const previousModelFilter = persistentFilterState.model;
                
                // Update filters after data is fetched
                updateFilters(flattenedData);
                
                // Apply filters explicitly after data refresh if we have saved values
                setTimeout(() => {
                    const serviceFilter = document.getElementById('serviceFilter');
                    const modelFilter = document.getElementById('modelFilter');
                    
                    if (previousServiceFilter && serviceFilter) {
                        serviceFilter.value = previousServiceFilter;
                    }
                    
                    if (previousModelFilter && modelFilter) {
                        modelFilter.value = previousModelFilter;
                    }
                    
                    // Only trigger filtering if we have filter values
                    if ((previousServiceFilter || previousModelFilter) && 
                        (serviceFilter || modelFilter)) {
                        persistentFilterState.service = previousServiceFilter;
                        persistentFilterState.model = previousModelFilter;
                        actors2gpTable.filterAndRender();
                    }
                }, 0);
                
                return flattenedData;
            }
            return [];
        },
        // Custom filter function to handle service and model filtering
        filterFunction: (item, searchTerm) => {
            // First check if the item matches the text search
            const textMatch = Object.values(item).some(value => {
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchTerm.toLowerCase());
                } else if (Array.isArray(value)) {
                    return value.some(v => typeof v === 'string' && v.toLowerCase().includes(searchTerm.toLowerCase()));
                }
                return false;
            });
            
            if (!textMatch) return false;
            
            // Then check if it matches the service filter
            const selectedService = serviceFilter ? serviceFilter.value : '';
            if (selectedService && item.service_name !== selectedService) {
                return false;
            }
            
            // Then check if it matches the model filter
            const selectedModel = modelFilter ? modelFilter.value : '';
            if (selectedModel && item.model_name !== selectedModel) {
                return false;
            }
            
            return true;
        }
    });

    function flattenData(services) {
        const rows = [];

        
        services.forEach(service => {
            // Extract service and model information, providing defaults if missing
            const service_id = service.service_id || 'SVC-0001';
            const service_name = service.service_name || 'Unknown Service';
            const model_id = service.model_id || 'MOD-0001';
            const model_name = service.model_name || 'Unknown Model';
            const actors = service.actors || [];
            

            
            // Add to unique sets for filters
            if (service_name) uniqueServices.add(service_name);
            if (model_name) uniqueModels.add(model_name);
            
            if (Array.isArray(actors)) {
                actors.forEach(actor => {

                    
                    // Process GP names more robustly
                    let gpNames = [];
                    if (actor.gps && Array.isArray(actor.gps)) {
                        // Handle array of GP objects
                        gpNames = actor.gps.map(gp => {
                            // Handle different possible formats
                            if (typeof gp === 'string') return gp;
                            return gp.gp_name || gp.name || gp.id || '';
                        }).filter(Boolean);
                    } else if (actor.gp_name) {
                        // Direct GP name property
                        gpNames = [actor.gp_name];
                    } else if (actor.gp && typeof actor.gp === 'object') {
                        // Single GP object
                        gpNames = [actor.gp.gp_name || actor.gp.name || actor.gp.id || ''];
                    }
                    

                    
                    rows.push({
                        service_id: service_id,
                        service_name: service_name,
                        model_id: model_id,
                        model_name: model_name,
                        actor_key: actor.actor_key || '',
                        actor_name: actor.actor_name || '',
                        gp_name: gpNames,
                        // Store the original gps array for reference
                        gps: actor.gps || []
                    });
                });
            }
        });
        return rows;
    }

    // DataTable initialized
    
    // Initialize column resizer
    const columnResizer = new ColumnResizer('.test-cases-table');
    
    // Set up regenerate button click handler
    const regenerateButton = document.getElementById('regenerateButton');
    if (regenerateButton) {
        regenerateButton.addEventListener('click', handleRegenerate);
    }

    
    /**
     * Update service and model filters with unique values from the data
     * @param {Array} data - Flattened data array
     */
    function updateFilters(data) {
        // Refetch the filter elements to ensure we have the latest DOM references
        const serviceFilter = document.getElementById('serviceFilter');
        const modelFilter = document.getElementById('modelFilter');
        
        if (!serviceFilter || !modelFilter) {
            console.warn('Filter elements not found in the DOM');
            return;
        }
        
        // Simpler approach: Instead of replacing elements, just update the options
        //console.log('Updating filter options...');

        // Store the current filter values before updating
        // Note: We're deliberately NOT using these values right away to prevent immediate filter application
        // That will happen in a separate step to ensure it occurs AFTER all options are populated
        // (Otherwise we might try to select a value that doesn't exist in the dropdown yet)
        const currentServiceValue = serviceFilter.value;
        const currentModelValue = modelFilter.value;
        const savedServiceValue = persistentFilterState.service;
        const savedModelValue = persistentFilterState.model;
        
        //console.log('Current values:', { 
        //    serviceSelect: currentServiceValue,
        //    modelSelect: currentModelValue,
        //    savedService: savedServiceValue,
        //    savedModel: savedModelValue
        //});
        
        // Clear existing options except the first one (All Services/Models)
        while (serviceFilter.options.length > 1) {
            serviceFilter.remove(1);
        }
        
        while (modelFilter.options.length > 1) {
            modelFilter.remove(1);
        }
        
        // Sort the unique values
        const sortedServices = Array.from(uniqueServices).sort();
        const sortedModels = Array.from(uniqueModels).sort();
        
        //console.log('Available filter options:', { services: sortedServices, models: sortedModels });
        
        // Add options for services
        sortedServices.forEach(service => {
            const option = document.createElement('option');
            option.value = service;
            option.textContent = service;
            serviceFilter.appendChild(option);
        });
        
        // Add options for models
        sortedModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            modelFilter.appendChild(option);
        });
        
        // We'll intentionally NOT restore the values here.
        // Instead, we'll let the onDataFetched callback handle this
        // after all the options are fully populated
        
        // Just populate the options without setting values yet
        
        // Remove existing event listeners by cloning and re-adding
        const newServiceFilter = serviceFilter.cloneNode(true);
        const newModelFilter = modelFilter.cloneNode(true);
        
        // Only try to replace if parent nodes exist
        if (serviceFilter.parentNode) {
            serviceFilter.parentNode.replaceChild(newServiceFilter, serviceFilter);
        }
        
        if (modelFilter.parentNode) {
            modelFilter.parentNode.replaceChild(newModelFilter, modelFilter);
        }
        
        // Add event listeners to the new elements
        document.getElementById('serviceFilter')?.addEventListener('change', (e) => {
            //console.log('Service filter changed to:', e.target.value);
            // Update persistent state when filter changes
            persistentFilterState.service = e.target.value;
            actors2gpTable.filterAndRender();
        });
        
        document.getElementById('modelFilter')?.addEventListener('change', (e) => {
            //console.log('Model filter changed to:', e.target.value);
            // Update persistent state when filter changes
            persistentFilterState.model = e.target.value;
            actors2gpTable.filterAndRender();
        });
        
        //console.log('Filters updated with services:', sortedServices.length, 'and models:', sortedModels.length);
    }
    
    // Add click event listener to table rows
    document.getElementById('actors2gpTableBody').addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        if (!row) return;
        
        // Get the data for the clicked row
        const rowIndex = Array.from(row.parentNode.children).indexOf(row);
        const rowData = actors2gpTable.getPageItems()[rowIndex];
        
        if (rowData) {
            openActorGpDialog(rowData);
        }
    });
    
    /**
     * Open dialog for editing actor to GP mapping
     * @param {Object} data - Row data for the selected actor
     */
    function openActorGpDialog(data) {
        //console.log('Opening dialog for:', data);
        
        // Detailed logging of input data
        //console.log('Raw data - service_name:', data.service_name, 'model_name:', data.model_name);
        
        // Ensure we have all the required data with explicit defaults
        const formData = {
            ...data,
            service_id: data.service_id || 'SVC-0001',
            service_name: data.service_name || 'Unknown Service',
            model_id: data.model_id || 'MOD-0001',
            model_name: data.model_name || 'Unknown Model',
            actor_key: data.actor_key || '',
            actor_name: data.actor_name || 'Unknown Actor'
        };
        
        // Detailed logging of prepared data
        //console.log('Prepared form data:', formData);
        //console.log('IMPORTANT - Explicitly check service_name:', formData.service_name, 'model_name:', formData.model_name);
        
        // Create the form component
        const actorGpForm = new ActorGpForm({
            data: formData,
            onSubmit: saveActorGp,
            onDelete: deleteActorGp
        });
        
        // Set dialog content and open it
        actorGpDialog.setContent(actorGpForm.element);
        actorGpDialog.setTitle(`Edit Actor: ${formData.actor_name}`);
        actorGpDialog.open(formData);
    }
    
    /**
     * Save actor to GP mapping
     * @param {Object} formData - Form data from the dialog
     */
    async function saveActorGp(formData) {
        try {

            
            const response = await fetch('/api/actors2gp/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();

            
            if (result.status === 'success') {
                showNotification('Actor to GP mapping updated successfully', 'success');
                actorGpDialog.close();
                
                // Use a safer approach to refresh the table

                try {
                    // Make sure we capture the CURRENT filter values before any refresh
                    const serviceFilter = document.getElementById('serviceFilter');
                    const modelFilter = document.getElementById('modelFilter');
                    
                    if (serviceFilter && serviceFilter.value) {
                        persistentFilterState.service = serviceFilter.value;
                    }
                    
                    if (modelFilter && modelFilter.value) {
                        persistentFilterState.model = modelFilter.value;
                    }
                    

                    
                    // Reset the data but preserve filter selections
                    uniqueServices.clear();
                    uniqueModels.clear();
                    
                    // Then fetch the data with a delay to ensure server has processed the update
                    setTimeout(() => {

                        actors2gpTable.fetchData(); // Refresh the table
                    }, 300);
                } catch (refreshError) {
                    // Log error but no details to console
            console.error('Error refreshing table');
                    // If refresh fails, try a page reload as fallback
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } else {
                showNotification(`Error: ${result.message}`, 'error');
            }
        } catch (error) {
            // Log error but no details to console
            console.error('Error saving actor to GP mapping');
            showNotification('An error occurred while saving', 'error');
        }
    }
    
    /**
     * Delete specific GP from actor or all GPs if no specific GP ID is provided
     * @param {Object} formData - Form data containing actor and service information
     */
    async function deleteActorGp(formData) {
        try {

            
            // Load current actor data to get all current GPs
            const loadResponse = await fetch('/api/actors2gp/all');
            const loadResult = await loadResponse.json();
            
            if (loadResult.status !== 'success') {
                throw new Error('Failed to load current actor data');
            }
            
            // Find the current actor in the data
            const actorData = findActorInData(loadResult.data, formData.service_id, formData.model_id, formData.actor_key);
            
            if (!actorData) {
                throw new Error('Could not find actor data');
            }
            
            // Get current GPs for this actor
            const currentGps = actorData.gps || [];

            
            // If gpId is provided, filter out just that one GP
            // Otherwise, remove all GPs (set to empty array)
            let updatedGps = [];
            
            if (formData.gp_id) {
                // Remove just the specific GP
                updatedGps = currentGps.filter(gp => gp.id !== formData.gp_id);

            } else {
                // Remove all GPs (for backwards compatibility)
            }
            
            // Prepare the update data
            const updateData = {
                service_id: formData.service_id,
                model_id: formData.model_id,
                actor_key: formData.actor_key,
                gps: updatedGps
            };
            
            // Send the update
            const response = await fetch('/api/actors2gp/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                // Determine message based on whether we removed one or all GPs
                const message = formData.gp_id 
                    ? 'Generic Product removed successfully' 
                    : 'All Generic Products removed successfully';
                    
                showNotification(message, 'success');
                
                // Capture the current filter state before refreshing
                const serviceFilter = document.getElementById('serviceFilter');
                const modelFilter = document.getElementById('modelFilter');
                
                if (serviceFilter && serviceFilter.value) {
                    persistentFilterState.service = serviceFilter.value;
                }
                
                if (modelFilter && modelFilter.value) {
                    persistentFilterState.model = modelFilter.value;
                }
                

                
                // Close dialog and refresh table
                actorGpDialog.close();
                
                // Refresh with a small delay to ensure server has processed the update
                setTimeout(() => {
                    actors2gpTable.fetchData();
                }, 300);
            } else {
                showNotification(`Error: ${result.message}`, 'error');
            }
        } catch (error) {
            // Log error but no details to console
            console.error('Error deleting GP from actor');
            showNotification('An error occurred while deleting: ' + error.message, 'error');
        }
    }
    
    /**
     * Handle regenerate button click - calls regenerate and clean endpoints in sequence
     */
    async function handleRegenerate() {
        try {
            // Disable button and show loading state
            const regenerateButton = document.getElementById('regenerateButton');
            const originalContent = regenerateButton.innerHTML;
            regenerateButton.disabled = true;
            regenerateButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...`;
            
            // First, call the regenerate endpoint
            const regenerateResponse = await fetch('/api/actors2gp/regenerate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ force_regenerate: false })
            });
            
            const regenerateResult = await regenerateResponse.json();
            
            if (regenerateResult.status !== 'success') {
                throw new Error(`Regenerate failed: ${regenerateResult.message}`);
            }
            
            // Then call the clean endpoint to remove old actors
            const cleanResponse = await fetch('/api/actors2gp/clean', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ minutes: 30 }) // Clean actors older than 30 minutes
            });
            
            const cleanResult = await cleanResponse.json();
            
            if (cleanResult.status !== 'success') {
                throw new Error(`Clean failed: ${cleanResult.message}`);
            }
            
            // Show success message
            showNotification(
                `Successfully regenerated data and cleaned ${cleanResult.actors_removed || 0} old actors.`, 
                'success'
            );
            
            // Refresh table data
            uniqueServices.clear();
            uniqueModels.clear();
            actors2gpTable.fetchData();
        } catch (error) {
            // Log error but no details to console
            console.error('Error during regenerate process');
            showNotification(`An error occurred: ${error.message}`, 'error');
        } finally {
            // Reset button state
            const regenerateButton = document.getElementById('regenerateButton');
            if (regenerateButton) {
                regenerateButton.disabled = false;
                regenerateButton.innerHTML = `<i class="fas fa-sync-alt me-1"></i>Regenerate`;
            }
        }
    }
    
    /**
     * Helper function to find an actor in the data
     */
    function findActorInData(services, serviceId, modelId, actorKey) {
        if (!Array.isArray(services)) return null;
        
        for (const service of services) {
            if (service.service_id === serviceId && service.model_id === modelId) {
                if (Array.isArray(service.actors)) {
                    const actor = service.actors.find(a => a.actor_key === actorKey);
                    if (actor) return actor;
                }
            }
        }
        
        return null;
    }
    
    /**
     * Show notification message
     * @param {string} message - Message to display
     * @param {string} type - Notification type ('success', 'error', 'info')
     */
    function showNotification(message, type = 'info') {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
            
            // Add notification styles if not already in document
            if (!document.getElementById('notification-styles')) {
                const style = document.createElement('style');
                style.id = 'notification-styles';
                style.textContent = `
                    .notification {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        padding: 15px 20px;
                        border-radius: 4px;
                        color: white;
                        font-weight: 500;
                        z-index: 9999;
                        opacity: 0;
                        transform: translateY(-20px);
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        max-width: 350px;
                    }
                    .notification.show {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    .notification.success {
                        background-color: #28a745;
                    }
                    .notification.error {
                        background-color: #dc3545;
                    }
                    .notification.info {
                        background-color: #17a2b8;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // Set notification content and type
        notification.textContent = message;
        notification.className = `notification ${type}`;
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 3000);
        
        notification.style.display = 'block';
    }
});