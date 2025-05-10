# CIS Plan API 2.0 Documentation

## Overview

The CIS Plan API 2.0 represents a significant architectural improvement over the previous version. The key advancement is the transition from a deeply nested, hierarchical ID-based approach to a simpler GUID-based system that allows direct entity access regardless of position in the hierarchy.

## Core Concepts

### GUID-Based Architecture

The new API uses globally unique identifiers (GUIDs) for all entities, which provides several advantages:

- **Direct entity access**: Access any entity directly using its GUID without traversing the entire hierarchy
- **Simplified API endpoints**: More consistent and intuitive endpoint structure
- **Improved performance**: Faster lookups and operations, especially for deeply nested entities
- **Better error handling**: More precise error identification and reporting

### Entity Types

The CIS Plan hierarchy includes these entity types:

- `mission_network` - Top-level container for a network
- `network_segment` - Subdivision of a mission network
- `security_domain` - Security classification boundary within a segment
- `hw_stack` - Hardware stack within a security domain
- `asset` - Physical or virtual asset within a hardware stack
- `network_interface` - Network interface attached to an asset
- `gp_instance` - Generic Product instance deployed on an asset
- `sp_instance` - Service Provider instance deployed on a GP instance

## API Endpoints

### Base URL

All API endpoints for the CIS Plan 2.0 are prefixed with:

```
/api/v2/cis_plan
```

### Main Endpoints

#### Get Complete CIS Plan Data

```
GET /api/v2/cis_plan
```

Returns the complete CIS Plan data structure with all entities.

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "missionNetworks": [
      {
        "name": "Test Mission Network",
        "guid": "4f7c9a2d-8f3e-4b8c-9a6d-9e2a5f8d7c5b",
        "id": "MN-0001",
        "networkSegments": [...]
      }
    ]
  }
}
```

#### Create Entity

```
POST /api/v2/cis_plan/entity
```

Creates a new entity in the CIS Plan.

**Request Body:**
```json
{
  "entity_type": "network_segment",
  "parent_guid": "4f7c9a2d-8f3e-4b8c-9a6d-9e2a5f8d7c5b",
  "attributes": {
    "name": "New Network Segment"
  }
}
```

**Notes:**
- For mission networks, `parent_guid` can be null
- For security domains, `attributes` must include a valid classification `id` from the security classifications file

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "name": "New Network Segment",
    "guid": "8a4b2c6d-1e5f-4a9c-8e7d-3b6f2d9a5e4c",
    "id": "NS-0001"
  }
}
```

#### Get Entity by GUID

```
GET /api/v2/cis_plan/entity/{guid}
```

Retrieves a specific entity by its GUID.

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "name": "Test Network Segment",
    "guid": "8a4b2c6d-1e5f-4a9c-8e7d-3b6f2d9a5e4c",
    "id": "NS-0001",
    "securityDomains": [...]
  }
}
```

#### Update Entity

```
PUT /api/v2/cis_plan/entity/{guid}
```

Updates an existing entity.

**Request Body:**
```json
{
  "attributes": {
    "name": "Updated Network Segment Name"
  }
}
```

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "name": "Updated Network Segment Name",
    "guid": "8a4b2c6d-1e5f-4a9c-8e7d-3b6f2d9a5e4c",
    "id": "NS-0001"
  }
}
```

#### Delete Entity

```
DELETE /api/v2/cis_plan/entity/{guid}
```

Deletes an entity and all its children.

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "deleted": true
  }
}
```

#### Get Entities by Type

```
GET /api/v2/cis_plan/entities/{entity_type}
```

Retrieves all entities of a specific type.

**Optional Query Parameters:**
- `parent_guid` - Filter by parent GUID

**Response Example:**
```json
{
  "status": "success",
  "data": [
    {
      "name": "Test Network Segment",
      "guid": "8a4b2c6d-1e5f-4a9c-8e7d-3b6f2d9a5e4c",
      "id": "NS-0001"
    },
    {
      "name": "Another Network Segment",
      "guid": "7b3a1c5d-6e2f-4d9a-8c7b-1e5d3f2a9c6b",
      "id": "NS-0002"
    }
  ]
}
```

#### Get Entity Path

```
GET /api/v2/cis_plan/entity/{guid}/path
```

Retrieves the path from the root to the specified entity.

**Response Example:**
```json
{
  "status": "success",
  "data": [
    {
      "type": "mission_network",
      "name": "Test Mission Network",
      "guid": "4f7c9a2d-8f3e-4b8c-9a6d-9e2a5f8d7c5b",
      "id": "MN-0001"
    },
    {
      "type": "network_segment",
      "name": "Test Network Segment",
      "guid": "8a4b2c6d-1e5f-4a9c-8e7d-3b6f2d9a5e4c",
      "id": "NS-0001"
    }
  ]
}
```

#### Get Entity Hierarchy

```
GET /api/v2/cis_plan/entity/{guid}/hierarchy
```

Retrieves a hierarchical representation of the entity's parent chain.

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "mission_network": {
      "name": "Test Mission Network",
      "guid": "4f7c9a2d-8f3e-4b8c-9a6d-9e2a5f8d7c5b",
      "id": "MN-0001"
    },
    "network_segment": {
      "name": "Test Network Segment",
      "guid": "8a4b2c6d-1e5f-4a9c-8e7d-3b6f2d9a5e4c",
      "id": "NS-0001"
    }
  }
}
```

### Security Classifications

```
GET /api/v2/cis_plan/security_classifications
```

Retrieves all security classifications available in the system.

**Response Example:**
```json
{
  "status": "success",
  "data": [
    {
      "name": "UNCLASSIFIED",
      "guid": "aa1e8400-j79b-41d4-l166-446655476666",
      "id": "CL-UNCLASS",
      "releasabilityString": "REL TO USA",
      "order": 1,
      "colour": "#008000"
    },
    {
      "name": "RESTRICTED",
      "guid": "aa1e8400-j79b-41d4-l166-446655476688",
      "id": "CL-RESTRICTED",
      "releasabilityString": "REL TO USA",
      "order": 2,
      "colour": "#008000"
    }
  ]
}
```

### Configuration Item Management

#### Update Configuration Item

```
PUT /api/v2/cis_plan/configuration_item/{entity_guid}
```

Updates a specific configuration item for a network interface or GP instance.

**Request Body:**
```json
{
  "item_name": "IP Address",
  "answer_content": "192.168.1.100"
}
```

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "name": "Test Network Interface",
    "guid": "9c7b6a5d-4e3f-2d1c-8a9b-7c6d5e4f3a2b",
    "id": "NI-0001",
    "configurationItems": [
      {
        "Name": "IP Address",
        "ConfigurationAnswerType": "Text Field (Single Line)",
        "AnswerContent": "192.168.1.100",
        "guid": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
      }
    ]
  }
}
```

#### Refresh GP Instance Configuration Items

```
POST /api/v2/cis_plan/gp_instance/{gp_instance_guid}/refresh_config
```

Refreshes configuration items for a GP instance based on its GP ID, adding any new items from the catalog.

**Response Example:**
```json
{
  "status": "success",
  "data": {
    "gpid": "GP-0039",
    "guid": "1e2d3c4b-5a6f-7e8d-9c0b-1a2b3c4d5e6f",
    "instanceLabel": "Directory Server",
    "serviceId": "SRV-0016",
    "configurationItems": [
      {
        "Name": "Server Address",
        "ConfigurationAnswerType": "Text Field (Single Line)",
        "AnswerContent": "",
        "guid": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p"
      },
      // Additional configuration items...
    ]
  }
}
```

## Integration Guidelines for Frontend Development

### JavaScript API Client Example

Here's a JavaScript module that provides a clean interface for interacting with the CIS Plan 2.0 API:

```javascript
// cis_api_v2.js
const CISPlanAPI = {
  // Base API call function
  async apiCall(method, endpoint, body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(endpoint, options);
    const data = await response.json();
    
    if (data.status !== 'success') {
      throw new Error(data.message || 'API request failed');
    }
    
    return data.data;
  },
  
  // Get the complete CIS Plan data
  async getCISPlanData() {
    return this.apiCall('GET', '/api/v2/cis_plan');
  },
  
  // Create a new entity
  async createEntity(entityType, parentGuid, attributes) {
    return this.apiCall('POST', '/api/v2/cis_plan/entity', {
      entity_type: entityType,
      parent_guid: parentGuid,
      attributes
    });
  },
  
  // Get an entity by GUID
  async getEntity(guid) {
    return this.apiCall('GET', `/api/v2/cis_plan/entity/${guid}`);
  },
  
  // Update an entity
  async updateEntity(guid, attributes) {
    return this.apiCall('PUT', `/api/v2/cis_plan/entity/${guid}`, {
      attributes
    });
  },
  
  // Delete an entity
  async deleteEntity(guid) {
    return this.apiCall('DELETE', `/api/v2/cis_plan/entity/${guid}`);
  },
  
  // Get entities by type
  async getEntitiesByType(entityType, parentGuid = null) {
    let url = `/api/v2/cis_plan/entities/${entityType}`;
    if (parentGuid) {
      url += `?parent_guid=${parentGuid}`;
    }
    return this.apiCall('GET', url);
  },
  
  // Get entity path
  async getEntityPath(guid) {
    return this.apiCall('GET', `/api/v2/cis_plan/entity/${guid}/path`);
  },
  
  // Get entity hierarchy
  async getEntityHierarchy(guid) {
    return this.apiCall('GET', `/api/v2/cis_plan/entity/${guid}/hierarchy`);
  },
  
  // Get security classifications
  async getSecurityClassifications() {
    return this.apiCall('GET', '/api/v2/cis_plan/security_classifications');
  },
  
  // Update a configuration item
  async updateConfigurationItem(entityGuid, itemName, answerContent) {
    return this.apiCall('PUT', `/api/v2/cis_plan/configuration_item/${entityGuid}`, {
      item_name: itemName,
      answer_content: answerContent
    });
  },
  
  // Refresh GP instance configuration items
  async refreshGPInstanceConfigItems(gpInstanceGuid) {
    return this.apiCall('POST', `/api/v2/cis_plan/gp_instance/${gpInstanceGuid}/refresh_config`);
  }
};
```

### Usage Examples

#### Loading the CIS Plan and Rendering the Tree

```javascript
// Load CIS Plan data and render the tree
async function loadCISPlan() {
  try {
    const cisData = await CISPlanAPI.getCISPlanData();
    renderTree(cisData.missionNetworks);
  } catch (error) {
    showToast('Error loading CIS Plan: ' + error.message, 'error');
  }
}

// Example function to render a tree node
function renderTree(missionNetworks) {
  const container = document.getElementById('tree-container');
  container.innerHTML = '';
  
  missionNetworks.forEach(network => {
    const networkNode = createTreeNode(
      'mission_network',
      network.name,
      network.id,
      network.guid,
      'fa-network-wired'
    );
    
    // Add click handler
    networkNode.addEventListener('click', function(e) {
      e.stopPropagation();
      selectNode(this, network);
    });
    
    // Add to container
    container.appendChild(networkNode);
    
    // Render children
    if (network.networkSegments && network.networkSegments.length > 0) {
      const childContainer = document.createElement('div');
      childContainer.className = 'tree-children';
      networkNode.appendChild(childContainer);
      
      renderNetworkSegments(
        childContainer,
        network.networkSegments,
        network
      );
    }
  });
}
```

#### Creating a New Entity

```javascript
// Example for creating a new security domain
async function addSecurityDomain(parentSegmentGuid) {
  try {
    // Get security classifications for dropdown
    const classifications = await CISPlanAPI.getSecurityClassifications();
    
    // Show modal with dropdown populated from classifications
    const selectedClassification = await showSecurityDomainModal(classifications);
    
    // Create the security domain
    const newDomain = await CISPlanAPI.createEntity(
      'security_domain',
      parentSegmentGuid,
      { id: selectedClassification.id }
    );
    
    // Refresh the tree and select the new domain
    await loadCISPlan();
    selectNodeByGuid(newDomain.guid);
    
    showToast('Security domain created successfully');
  } catch (error) {
    showToast('Error creating security domain: ' + error.message, 'error');
  }
}
```

#### Updating Configuration Items

```javascript
// Example for updating a network interface configuration item
async function updateNetworkInterfaceIP(interfaceGuid, ipAddress) {
  try {
    const updatedInterface = await CISPlanAPI.updateConfigurationItem(
      interfaceGuid,
      'IP Address',
      ipAddress
    );
    
    // Update the UI with the new information
    updateInterfaceDetails(updatedInterface);
    showToast('IP Address updated successfully');
  } catch (error) {
    showToast('Error updating IP Address: ' + error.message, 'error');
  }
}
```

## Migration Guide from Legacy API

### Key Differences

1. **URL Structure**: 
   - Old: `/api/cis_plan/mission_network/{id}/segment/{id}/security_domain/{id}/...`
   - New: `/api/v2/cis_plan/entity/{guid}`

2. **Entity Identification**:
   - Old: Nested IDs required to locate an entity
   - New: Single GUID can access any entity directly

3. **Request Bodies**:
   - Old: Different structures for different entity types
   - New: Consistent structure with `entity_type`, `parent_guid`, and `attributes`

4. **Error Handling**:
   - Old: Various error formats
   - New: Consistent `status`/`message` format

### Migration Steps

1. **Update API Client**:
   - Replace nested-path API calls with GUID-based calls
   - Update request/response handling to match new format

2. **Update State Management**:
   - Store entity GUIDs instead of or alongside IDs
   - Update navigation logic to use GUIDs

3. **Update UI Components**:
   - Modify tree nodes to include GUID attributes
   - Update event handlers to pass GUIDs instead of IDs

### Example Migration

**Old Code:**
```javascript
// Old API call
async function updateNetworkInterface(mnId, segId, domId, stackId, assetId, interfaceId, name) {
  const url = `/api/cis_plan/mission_network/${mnId}/segment/${segId}/security_domain/${domId}/hw_stacks/${stackId}/assets/${assetId}/network_interfaces/${interfaceId}`;
  return apiCall('PUT', url, { name });
}
```

**New Code:**
```javascript
// New API call
async function updateNetworkInterface(interfaceGuid, name) {
  return CISPlanAPI.updateEntity(interfaceGuid, { name });
}
```

## Security Considerations

1. **Security Domain Validation**:
   - Security domain IDs must come from the `CIS_Security_Classification.json` file
   - The API will reject any attempt to create a security domain with an invalid ID

2. **Entity Ownership**:
   - Each entity must have a valid parent (except mission networks)
   - The API validates parent-child relationships

3. **Configuration Items**:
   - GP instance configuration items are validated against the appropriate catalog

## Conclusion

The CIS Plan API 2.0 represents a significant improvement over the previous version. By adopting a GUID-based architecture, it provides a more straightforward, maintainable, and efficient way to access and manipulate CIS Plan data. Frontend applications that integrate with this API will benefit from simplified code, better performance, and improved error handling.
