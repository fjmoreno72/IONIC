/**
 * CIS Plan Detail Renderers 2.0
 * 
 * Specialized renderers for different element types in the CIS Plan.
 * Each renderer is responsible for displaying type-specific details.
 */

const CISDetailRenderers2 = {
    /**
     * Get the appropriate renderer for an element type
     * @param {string} type - The element type
     * @returns {Function} The renderer function for the specified type
     */
    getRenderer: function(type) {
        // Map of element types to their specialized renderers
        const renderers = {
            'cisplan': this.renderCISPlanDetails,
            'mission_network': this.renderMissionNetworkDetails,
            'network_segment': this.renderNetworkSegmentDetails,
            'security_domain': this.renderSecurityDomainDetails,
            'hw_stack': this.renderHWStackDetails,
            'asset': this.renderAssetDetails,
            'network_interface': this.renderNetworkInterfaceDetails,
            'gp_instance': this.renderGPInstanceDetails,
            'sp_instance': this.renderSPInstanceDetails
        };
        
        // Return the specialized renderer or the default renderer if not found
        return renderers[type] || this.renderDefaultDetails;
    },
    
    /**
     * Default renderer for any element type
     * @param {Object} element - The element to render
     * @param {string} type - The element type
     * @param {HTMLElement} container - The container to render into
     */
    renderDefaultDetails: function(element, type, container) {
        if (!element || !container) return;
        
        // Create table for details
        const table = document.createElement('table');
        table.className = 'detail-table table table-striped';
        
        // Basic information available in all elements
        let tableContent = '';
        
        // Add element type
        tableContent += `
            <tr>
                <th scope="row">Type</th>
                <td>${CISDetails2.formatElementType(type)}</td>
            </tr>
        `;
        
        // Add name if available
        if (element.name) {
            tableContent += `
                <tr>
                    <th scope="row">Name</th>
                    <td>${element.name}</td>
                </tr>
            `;
        }
        
        // Add ID if available
        if (element.id) {
            tableContent += `
                <tr>
                    <th scope="row">ID</th>
                    <td>${element.id}</td>
                </tr>
            `;
        }
        
        // Add GUID (all elements should have this)
        if (element.guid) {
            tableContent += `
                <tr>
                    <th scope="row">GUID</th>
                    <td>${element.guid}</td>
                </tr>
            `;
        }
        
        // Set table content
        table.innerHTML = `<tbody>${tableContent}</tbody>`;
        container.appendChild(table);
    },
    
    /**
     * Render CIS Plan details
     * @param {Object} element - The CIS Plan element
     * @param {string} type - The element type
     * @param {HTMLElement} container - The container to render into
     */
    renderCISPlanDetails: function(element, type, container) {
        // Start with default rendering
        this.renderDefaultDetails(element, type, container);
        
        // Add CIS Plan specific details
        if (element.fileName) {
            const table = container.querySelector('.detail-table tbody');
            if (table) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <th scope="row">File Name</th>
                    <td>${element.fileName}</td>
                `;
                table.appendChild(row);
            }
        }
    },
    
    /**
     * Render Mission Network details
     * @param {Object} element - The Mission Network element
     * @param {string} type - The element type
     * @param {HTMLElement} container - The container to render into
     */
    renderMissionNetworkDetails: function(element, type, container) {
        // Start with default rendering
        this.renderDefaultDetails(element, type, container);
        
        // Add Mission Network specific details
        const table = container.querySelector('.detail-table tbody');
        if (table) {
            // Add segment count
            const segmentCount = element.networkSegments ? element.networkSegments.length : 0;
            const segmentRow = document.createElement('tr');
            segmentRow.innerHTML = `
                <th scope="row">Network Segments</th>
                <td>${segmentCount}</td>
            `;
            table.appendChild(segmentRow);
        }
    },
    
    /**
     * Render Network Segment details
     * @param {Object} element - The Network Segment element
     * @param {string} type - The element type
     * @param {HTMLElement} container - The container to render into
     */
    renderNetworkSegmentDetails: function(element, type, container) {
        // Start with default rendering
        this.renderDefaultDetails(element, type, container);
        
        // Add Network Segment specific details
        const table = container.querySelector('.detail-table tbody');
        if (table) {
            // Add domain count
            const domainCount = element.securityDomains ? element.securityDomains.length : 0;
            const domainRow = document.createElement('tr');
            domainRow.innerHTML = `
                <th scope="row">Security Domains</th>
                <td>${domainCount}</td>
            `;
            table.appendChild(domainRow);
        }
    },
    
    /**
     * Render Security Domain details
     * @param {Object} element - The Security Domain element
     * @param {string} type - The element type
     * @param {HTMLElement} container - The container to render into
     */
    renderSecurityDomainDetails: async function(element, type, container) {
        // Start with default rendering
        this.renderDefaultDetails(element, type, container);
        
        // Add Security Domain specific details
        const table = container.querySelector('.detail-table tbody');
        if (table) {
            // Add HW Stack count
            const stackCount = element.hwStacks ? element.hwStacks.length : 0;
            const stackRow = document.createElement('tr');
            stackRow.innerHTML = `
                <th scope="row">HW Stacks</th>
                <td>${stackCount}</td>
            `;
            table.appendChild(stackRow);
            
            // Show loading indicator for classification details
            const loadingRow = document.createElement('tr');
            loadingRow.id = 'classification-loading';
            loadingRow.innerHTML = `
                <th scope="row">Classification</th>
                <td><em>Loading classification details...</em></td>
            `;
            table.appendChild(loadingRow);
            
            // Fetch security classification details
            try {
                const classificationId = element.id;
                if (classificationId) {
                    const classification = await CISApi2.getSecurityClassificationById(classificationId);
                    
                    if (classification) {
                        // Remove loading indicator
                        const loadingElement = document.getElementById('classification-loading');
                        if (loadingElement) {
                            loadingElement.remove();
                        }
                        
                        // Add classification name
                        if (classification.name) {
                            const nameRow = document.createElement('tr');
                            nameRow.innerHTML = `
                                <th scope="row">Classification</th>
                                <td>${classification.name}</td>
                            `;
                            table.appendChild(nameRow);
                        }
                        
                        // Add releasability string
                        if (classification.releasabilityString) {
                            const relRow = document.createElement('tr');
                            relRow.innerHTML = `
                                <th scope="row">Releasability</th>
                                <td>${classification.releasabilityString}</td>
                            `;
                            table.appendChild(relRow);
                        }
                        
                        // Add order
                        if (classification.order !== undefined) {
                            const orderRow = document.createElement('tr');
                            orderRow.innerHTML = `
                                <th scope="row">Order</th>
                                <td>${classification.order}</td>
                            `;
                            table.appendChild(orderRow);
                        }
                        
                        // Add color with visual indicator
                        if (classification.colour) {
                            const colorRow = document.createElement('tr');
                            colorRow.innerHTML = `
                                <th scope="row">Color</th>
                                <td>
                                    <div style="display: flex; align-items: center;">
                                        <div style="width: 20px; height: 20px; background-color: ${classification.colour}; border: 1px solid #ccc; margin-right: 10px; border-radius: 3px;"></div>
                                        ${classification.colour}
                                    </div>
                                </td>
                            `;
                            table.appendChild(colorRow);
                        }
                    } else {
                        // Classification not found
                        const notFoundRow = document.createElement('tr');
                        notFoundRow.innerHTML = `
                            <th scope="row">Classification</th>
                            <td><em>Classification details not found</em></td>
                        `;
                        table.appendChild(notFoundRow);
                    }
                }
            } catch (error) {
                console.error('Error fetching classification details:', error);
                const errorRow = document.createElement('tr');
                errorRow.innerHTML = `
                    <th scope="row">Classification</th>
                    <td><em>Error loading classification details</em></td>
                `;
                table.appendChild(errorRow);
            }
        }
    },
    
    /**
     * Render HW Stack details
     * @param {Object} element - The HW Stack element
     * @param {string} type - The element type
     * @param {HTMLElement} container - The container to render into
     */
    renderHWStackDetails: function(element, type, container) {
        // Start with default rendering
        this.renderDefaultDetails(element, type, container);
        
        // Add HW Stack specific details
        const table = container.querySelector('.detail-table tbody');
        if (table) {
            // Add participant ID if available
            if (element.cisParticipantID) {
                const participantIdRow = document.createElement('tr');
                participantIdRow.innerHTML = `
                    <th scope="row">Participant ID</th>
                    <td>${element.cisParticipantID}</td>
                `;
                table.appendChild(participantIdRow);
                
                // Add participant name as a separate row
                const participantNameRow = document.createElement('tr');
                participantNameRow.id = 'participant-name-row';
                participantNameRow.innerHTML = `
                    <th scope="row">Participant Name</th>
                    <td id="participant-name-cell">
                        <span id="participant-name-loading">Loading...</span>
                    </td>
                `;
                table.appendChild(participantNameRow);
                
                // Fetch participant name from the new API endpoint
                fetch(`/api/participants/key_to_name?key=${element.cisParticipantID}`)
                    .then(response => response.json())
                    .then(data => {
                        const nameCell = document.getElementById('participant-name-cell');
                        if (data.status === 'success' && nameCell) {
                            nameCell.innerHTML = data.name;
                        } else if (nameCell) {
                            nameCell.innerHTML = '<em>Not found</em>'; // Show not found message
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching participant name:', error);
                        const nameCell = document.getElementById('participant-name-cell');
                        if (nameCell) {
                            nameCell.innerHTML = '<em>Error loading name</em>';
                        }
                    });
            }
            
            // Add asset count
            const assetCount = element.assets ? element.assets.length : 0;
            const assetRow = document.createElement('tr');
            assetRow.innerHTML = `
                <th scope="row">Assets</th>
                <td>${assetCount}</td>
            `;
            table.appendChild(assetRow);
        }
    },
    
    /**
     * Render Asset details
     * @param {Object} element - The Asset element
     * @param {string} type - The element type
     * @param {HTMLElement} container - The container to render into
     */
    renderAssetDetails: function(element, type, container) {
        // Start with default rendering
        this.renderDefaultDetails(element, type, container);
        
        // Add Asset specific details
        const table = container.querySelector('.detail-table tbody');
        if (table) {
            // Add network interface count
            const interfaceCount = element.networkInterfaces ? element.networkInterfaces.length : 0;
            const interfaceRow = document.createElement('tr');
            interfaceRow.innerHTML = `
                <th scope="row">Network Interfaces</th>
                <td>${interfaceCount}</td>
            `;
            table.appendChild(interfaceRow);
            
            // Add GP instance count
            const gpCount = element.gpInstances ? element.gpInstances.length : 0;
            const gpRow = document.createElement('tr');
            gpRow.innerHTML = `
                <th scope="row">GP Instances</th>
                <td>${gpCount}</td>
            `;
            table.appendChild(gpRow);
        }
    },
    
    /**
     * Render Network Interface details
     * @param {Object} element - The Network Interface element
     * @param {string} type - The element type
     * @param {HTMLElement} container - The container to render into
     */
    renderNetworkInterfaceDetails: function(element, type, container) {
        // Start with default rendering
        this.renderDefaultDetails(element, type, container);
        
        // Add Network Interface specific details
        if (element.configurationItems && element.configurationItems.length > 0) {
            // Create a section for configuration items
            const configSection = document.createElement('div');
            configSection.className = 'mt-4';
            configSection.innerHTML = '<h6>Configuration</h6>';
            container.appendChild(configSection);
            
            // Create table for configuration items
            const configTable = document.createElement('table');
            configTable.className = 'detail-table table table-striped';
            configSection.appendChild(configTable);
            
            let configContent = '';
            
            // Add each configuration item
            element.configurationItems.forEach(item => {
                if (item.Name && item.AnswerContent) {
                    configContent += `
                        <tr>
                            <th scope="row">${item.Name}</th>
                            <td>${item.AnswerContent || '<em>Not set</em>'}</td>
                        </tr>
                    `;
                }
            });
            
            // Set table content
            configTable.innerHTML = `<tbody>${configContent}</tbody>`;
        }
    },
    
    /**
     * Render GP Instance details
     * @param {Object} element - The GP Instance element
     * @param {string} type - The element type
     * @param {HTMLElement} container - The container to render into
     */
    renderGPInstanceDetails: function(element, type, container) {
        // Start with default rendering for GP instances (which use gpid instead of id)
        this.renderDefaultDetails(element, type, container);
        
        // Add GP Instance specific details
        const table = container.querySelector('.detail-table tbody');
        if (table) {
            // Add service ID
            if (element.serviceId) {
                const serviceRow = document.createElement('tr');
                serviceRow.innerHTML = `
                    <th scope="row">Service ID</th>
                    <td>${element.serviceId}</td>
                `;
                table.appendChild(serviceRow);
            }
            
            // Add instance label if available
            if (element.instanceLabel) {
                const labelRow = document.createElement('tr');
                labelRow.innerHTML = `
                    <th scope="row">Instance Label</th>
                    <td>${element.instanceLabel}</td>
                `;
                table.appendChild(labelRow);
            }
            
            // Add SP instance count
            const spCount = element.spInstances ? element.spInstances.length : 0;
            const spRow = document.createElement('tr');
            spRow.innerHTML = `
                <th scope="row">SP Instances</th>
                <td>${spCount}</td>
            `;
            table.appendChild(spRow);
        }
        
        // Add configuration items if available
        if (element.configurationItems && element.configurationItems.length > 0) {
            // Create a section for configuration items
            const configSection = document.createElement('div');
            configSection.className = 'mt-4';
            configSection.innerHTML = '<h6>Configuration</h6>';
            container.appendChild(configSection);
            
            // Create table for configuration items
            const configTable = document.createElement('table');
            configTable.className = 'detail-table table table-striped';
            configSection.appendChild(configTable);
            
            let configContent = '';
            
            // Add each configuration item
            element.configurationItems.forEach(item => {
                if (item.Name) {
                    configContent += `
                        <tr>
                            <th scope="row">${item.Name}</th>
                            <td>${item.AnswerContent || item.DefaultValue || '<em>Not set</em>'}</td>
                        </tr>
                    `;
                }
            });
            
            // Set table content
            configTable.innerHTML = `<tbody>${configContent}</tbody>`;
        }
    },
    
    /**
     * Render SP Instance details
     * @param {Object} element - The SP Instance element
     * @param {string} type - The element type
     * @param {HTMLElement} container - The container to render into
     */
    renderSPInstanceDetails: function(element, type, container) {
        // Start with default rendering
        this.renderDefaultDetails(element, type, container);
        
        // Add SP Instance specific details
        const table = container.querySelector('.detail-table tbody');
        if (table) {
            // Add SP ID
            if (element.spId) {
                const spIdRow = document.createElement('tr');
                spIdRow.innerHTML = `
                    <th scope="row">SP ID</th>
                    <td>${element.spId}</td>
                `;
                table.appendChild(spIdRow);
            }
            
            // Add SP version
            if (element.spVersion) {
                const versionRow = document.createElement('tr');
                versionRow.innerHTML = `
                    <th scope="row">Version</th>
                    <td>${element.spVersion}</td>
                `;
                table.appendChild(versionRow);
            }
        }
    }
};
