"""
CIS Plan Routes 2.0
------------------
A redesigned API for CIS Plan operations based on GUIDs instead of nested IDs.
This simplifies API usage by providing direct access to entities regardless of their
position in the hierarchy.
"""

from flask import Blueprint, session, jsonify, request, current_app, render_template
import logging
from app.data_access.cis_plan_repository_2 import (
    get_all_cis_plan,
    get_entity_by_guid,
    create_entity,
    update_entity,
    delete_entity,
    get_security_classifications,
    get_entities_by_type,
    get_entity_path,
    get_entity_hierarchy,
    update_configuration_item,
    refresh_gp_instance_config_items,
    find_entity_by_guid
)

# Initialize the blueprint
cis_plan_bp_2 = Blueprint('cis_plan_2', __name__)
logger = logging.getLogger(__name__)

# --- Helpers ---

def get_environment():
    """Get the current environment from the session."""
    return session.get('environment', 'ciav')

def get_json_field(data, field, required=True):
    """
    Get a field from JSON data, with validation.
    
    Args:
        data (dict): The JSON data to extract from.
        field (str): The field name to extract.
        required (bool): Whether the field is required. If True and field is missing, raises ValueError.
        
    Returns:
        The value of the field, or None if not required and not present.
    """
    if not data:
        if required:
            raise ValueError(f"Request body is empty, but '{field}' is required.")
        return None
        
    if field not in data:
        if required:
            raise ValueError(f"Missing '{field}' in request body.")
        return None
        
    return data[field]

def success_response(data, status=200):
    """
    Create a success response.
    
    Args:
        data: The data to include in the response.
        status (int): The HTTP status code.
        
    Returns:
        tuple: A tuple containing the response and status code.
    """
    return jsonify({"status": "success", "data": data}), status

def error_response(message, status=400, **kwargs):
    """
    Create an error response.
    
    Args:
        message (str): The error message.
        status (int): The HTTP status code.
        **kwargs: Additional fields to include in the response.
        
    Returns:
        tuple: A tuple containing the response and status code.
    """
    resp = {"status": "error", "message": message}
    resp.update(kwargs)
    return jsonify(resp), status

# --- Core API Routes ---

@cis_plan_bp_2.route('/api/v2/cis_plan', methods=['GET'])
def get_cis_plan():
    """
    Get the entire CIS Plan data structure.
    """
    try:
        environment = get_environment()
        data = get_all_cis_plan(environment)
        return success_response(data)
    except Exception as e:
        logger.error(f"Error getting CIS Plan: {e}")
        return error_response(str(e), 500)

@cis_plan_bp_2.route('/api/v2/cis_plan/entity/<guid>', methods=['GET', 'PUT', 'DELETE'])
def handle_entity(guid):
    """
    Handle operations for a specific entity by GUID.
    
    GET: Retrieve an entity by GUID.
    PUT: Update an entity by GUID.
    DELETE: Delete an entity by GUID.
    """
    try:
        environment = get_environment()
        
        if request.method == 'GET':
            entity = get_entity_by_guid(environment, guid)
            if not entity:
                return error_response(f"Entity with GUID {guid} not found", 404)
            return success_response(entity)
            
        elif request.method == 'PUT':
            data = request.get_json()
            logger.info(f"Received update for entity {guid}: {data}")
            
            # Handle different API payload formats
            if isinstance(data, dict):
                attributes = data.get('attributes', {})
                
                # Check if we're updating a GP instance and need to reset config items
                if data.get('entity_type') == 'gp_instance' and data.get('reset_config_items', False):
                    logger.info(f"Request to reset configuration items for GP instance {guid}")
                    attributes['reset_config_items'] = True
                
                # Preserve reset_config_items flag if present in attributes
                if isinstance(attributes, dict) and attributes.get('reset_config_items', False):
                    logger.info(f"Reset configuration items flag found in attributes")
                    # No need to do anything special here since update_entity handles this flag
                
                updated = update_entity(environment, guid, attributes)
            else:
                # Direct update with the data object
                updated = update_entity(environment, guid, data)
                
            if not updated:
                return error_response(f"Failed to update entity with GUID {guid}", 404)
            return success_response(updated)
            
        elif request.method == 'DELETE':
            deleted = delete_entity(environment, guid)
            if not deleted:
                return error_response(f"Failed to delete entity with GUID {guid}", 404)
            return success_response({"deleted": True})
            
    except ValueError as ve:
        logger.error(f"Value error handling entity {guid}: {str(ve)}")
        return error_response(str(ve), 400)
    except Exception as e:
        logger.error(f"Error handling entity {guid}: {e}")
        return error_response(str(e), 500)

@cis_plan_bp_2.route('/api/v2/cis_plan/entity', methods=['POST'])
def create_new_entity():
    """
    Create a new entity.
    
    Required JSON fields:
    - entity_type: The type of entity to create (e.g., 'mission_network').
    - parent_guid: The GUID of the parent entity (optional for mission_network).
    - attributes: Object containing the attributes for the new entity.
    """
    try:
        environment = get_environment()
        data = request.get_json()
        
        entity_type = get_json_field(data, 'entity_type')
        parent_guid = get_json_field(data, 'parent_guid', required=False)
        attributes = get_json_field(data, 'attributes')
        
        entity = create_entity(environment, entity_type, parent_guid, attributes)
        if not entity:
            return error_response(f"Failed to create {entity_type}", 400)
        
        return success_response(entity, 201)
    
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        logger.error(f"Error creating entity: {e}")
        return error_response(str(e), 500)

@cis_plan_bp_2.route('/api/v2/cis_plan/entities/<entity_type>', methods=['GET'])
def get_entities(entity_type):
    """
    Get all entities of a specific type.
    
    Optional query parameters:
    - parent_guid: The GUID of the parent entity to filter by.
    """
    try:
        environment = get_environment()
        parent_guid = request.args.get('parent_guid')
        
        entities = get_entities_by_type(environment, entity_type, parent_guid)
        return success_response(entities)
    
    except Exception as e:
        logger.error(f"Error getting entities of type {entity_type}: {e}")
        return error_response(str(e), 500)

@cis_plan_bp_2.route('/api/v2/cis_plan/entity/<guid>/path', methods=['GET'])
def get_path_to_entity(guid):
    """
    Get the full path to an entity.
    """
    try:
        environment = get_environment()
        data = get_all_cis_plan(environment)
        path = get_entity_path(data, guid)
        
        if not path:
            return error_response(f"Entity with GUID {guid} not found", 404)
            
        return success_response(path)
    
    except Exception as e:
        logger.error(f"Error getting path for entity {guid}: {e}")
        return error_response(str(e), 500)

@cis_plan_bp_2.route('/api/v2/cis_plan/entity/<guid>/hierarchy', methods=['GET'])
def get_hierarchy_for_entity(guid):
    """
    Get the hierarchy information for an entity (all parent GUIDs).
    """
    try:
        environment = get_environment()
        data = get_all_cis_plan(environment)
        hierarchy = get_entity_hierarchy(data, guid)
        
        if not hierarchy:
            return error_response(f"Entity with GUID {guid} not found", 404)
            
        return success_response(hierarchy)
    
    except Exception as e:
        logger.error(f"Error getting hierarchy for entity {guid}: {e}")
        return error_response(str(e), 500)

# --- Special Entity Type Routes ---

@cis_plan_bp_2.route('/api/v2/cis_plan/security_classifications', methods=['GET'])
def get_security_domains():
    """
    Get all security classifications for the current environment.
    """
    try:
        environment = get_environment()
        classifications = get_security_classifications(environment)
        return success_response(classifications)
    
    except Exception as e:
        logger.error(f"Error getting security classifications: {e}")
        return error_response(str(e), 500)

@cis_plan_bp_2.route('/api/v2/cis_plan/configuration_item/<interface_guid>', methods=['PUT'])
def update_config_item(interface_guid):
    """
    Update a configuration item in a network interface or GP instance.
    
    Required JSON fields:
    - item_name: The name of the configuration item.
    - answer_content: The new content for the configuration item.
    """
    try:
        environment = get_environment()
        data = request.get_json()
        
        item_name = get_json_field(data, 'item_name')
        answer_content = get_json_field(data, 'answer_content')
        
        # Log the incoming request for debugging
        logger.info(f"Updating configuration item: {item_name} for interface/GP instance: {interface_guid}")
        logger.info(f"New answer content: {answer_content}")
        
        updated = update_configuration_item(environment, interface_guid, item_name, answer_content)
        if not updated:
            logger.warning(f"Failed to update configuration item {item_name} for {interface_guid}")
            return error_response(f"Failed to update configuration item", 404)
            
        # Return success with the updated configuration item
        return success_response(updated)
    
    except ValueError as ve:
        logger.error(f"Value error updating configuration item: {str(ve)}")
        return error_response(str(ve), 400)
    except Exception as e:
        logger.error(f"Error updating configuration item: {str(e)}")
        return error_response(str(e), 500)

@cis_plan_bp_2.route('/api/v2/cis_plan/gp_instance/<gp_instance_guid>/refresh_config', methods=['POST'])
def refresh_gp_config(gp_instance_guid):
    """
    Refresh the configuration items for a GP instance based on its GP ID.
    
    This adds any new configuration items from the catalog that weren't previously added.
    It does not remove or modify existing items.
    """
    try:
        environment = get_environment()
        
        # Refresh the configuration items
        updated_instance = refresh_gp_instance_config_items(environment, gp_instance_guid)
        if not updated_instance:
            return error_response(f"Failed to refresh GP instance configuration items", 404)
        
        return success_response(updated_instance)
    
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        logger.error(f"Error refreshing GP instance configuration items: {e}")
        return error_response(str(e), 500)

# --- Backwards Compatibility Routes ---

@cis_plan_bp_2.route('/api/v2/cis_plan/mission_networks', methods=['GET'])
def get_mission_networks():
    """
    Get all mission networks.
    """
    try:
        environment = get_environment()
        data = get_all_cis_plan(environment)
        mission_networks = data.get('missionNetworks', [])
        return success_response(mission_networks)
    
    except Exception as e:
        logger.error(f"Error getting mission networks: {e}")
        return error_response(str(e), 500)

@cis_plan_bp_2.route('/api/v2/cis_plan/mission_network/<guid>/segments', methods=['GET'])
def get_network_segments(guid):
    """
    Get all network segments for a mission network.
    """
    try:
        environment = get_environment()
        entity = get_entity_by_guid(environment, guid)
        
        if not entity:
            return error_response(f"Mission network with GUID {guid} not found", 404)
            
        segments = entity.get('networkSegments', [])
        return success_response(segments)
    
    except Exception as e:
        logger.error(f"Error getting network segments: {e}")
        return error_response(str(e), 500)

# --- View ---

@cis_plan_bp_2.route('/cis_plan_view_2', methods=['GET'])
def cis_plan_view_2():
    """
    Render the CIS Plan view page.
    """
    try:
        return render_template('pages/cis_plan_2.html')
    except Exception as e:
        logger.error(f"Error rendering CIS Plan view: {e}")
        return str(e), 500

@cis_plan_bp_2.route('/api/v2/cis_plan/entity/<guid>/copy', methods=['POST'])
def copy_entity(guid):
    """
    Create a copy of an entity and all its children.
    
    Optional JSON fields:
    - new_name: The name for the copied entity (defaults to original name + "_Copy")
    """
    try:
        logger.info(f"Starting copy operation for entity with GUID: {guid}")
        environment = get_environment()
        data = request.get_json() or {}
        
        # Get the original entity
        original_entity = get_entity_by_guid(environment, guid)
        if not original_entity:
            logger.error(f"Entity with GUID {guid} not found for copying")
            return error_response(f"Entity with GUID {guid} not found", 404)
        
        logger.info(f"Found entity to copy: {original_entity.get('name', 'Unnamed')}")
        
        # Determine the entity type
        entity_type = ''
        if 'entity_type' in original_entity:
            entity_type = original_entity['entity_type']
        elif 'networkSegments' in original_entity:
            entity_type = 'mission_network'
        elif 'securityDomains' in original_entity:
            entity_type = 'network_segment'
        elif 'hwStacks' in original_entity:
            entity_type = 'security_domain'
        elif 'assets' in original_entity:
            entity_type = 'hw_stack'
        elif 'networkInterfaces' in original_entity or 'gpInstances' in original_entity:
            entity_type = 'asset'
        elif 'spInstances' in original_entity:
            entity_type = 'gp_instance'
        else:
            logger.error(f"Cannot determine entity type for GUID {guid}")
            return error_response(f"Cannot determine entity type for GUID {guid}", 400)
        
        logger.info(f"Entity type determined: {entity_type}")
        
        # Set new name based on entity type
        original_name = original_entity.get('name', original_entity.get('id', 'Unnamed'))
        new_name = data.get('new_name', f"{original_name}_Copy")
        logger.info(f"New name for copied entity: {new_name}")
        
        # For non-mission-network entities, get the parent GUID
        parent_guid = None
        if entity_type != 'mission_network':
            try:
                # Get the parent directly using find_entity_by_guid
                cis_data = get_all_cis_plan(environment)
                _, _, _, parent_entity = find_entity_by_guid(cis_data, guid)
                
                if parent_entity:
                    parent_guid = parent_entity.get('guid')
                    logger.info(f"Found parent GUID directly: {parent_guid}")
                else:
                    logger.warning(f"Could not find parent for entity {guid}")
                    return error_response(f"Could not find parent for entity {guid}", 400)
            except Exception as e:
                logger.error(f"Error finding parent for {guid}: {str(e)}")
                return error_response(f"Error finding parent: {str(e)}", 500)
        
        logger.info(f"Using parent GUID: {parent_guid}")
        
        # Prepare minimal attributes based on entity type
        try:
            attributes = {}
            
            if entity_type == 'mission_network':
                attributes = {
                    'name': new_name,
                }
            elif entity_type == 'network_segment':
                attributes = {
                    'name': new_name,
                }
            elif entity_type == 'security_domain':
                # For security domains, we must use the exact same ID since they represent classifications
                if not original_entity.get('id'):
                    logger.error("Security domain ID is missing")
                    return error_response("Security domain ID is required for copying", 400)
                    
                # Check if a security domain with this ID already exists under the parent
                parent_entity = get_entity_by_guid(environment, parent_guid)
                if parent_entity:
                    existing_domains = parent_entity.get('securityDomains', [])
                    domain_id = original_entity.get('id')
                    
                    if any(sd.get('id') == domain_id for sd in existing_domains):
                        logger.error(f"Security domain with ID {domain_id} already exists in this segment")
                        return error_response(f"Security domain with ID {domain_id} already exists in this segment", 400)
                
                attributes = {
                    'id': original_entity.get('id'),
                }
            elif entity_type == 'hw_stack':
                attributes = {
                    'name': new_name,
                    'cisParticipantID': original_entity.get('cisParticipantID', ''),
                }
            elif entity_type == 'asset':
                attributes = {
                    'name': new_name,
                }
            elif entity_type == 'network_interface':
                attributes = {
                    'name': new_name,
                    'ip_address': '',  # Default empty value
                    'subnet': '',      # Default empty value
                    'fqdn': ''         # Default empty value
                }
            elif entity_type == 'gp_instance':
                # For GP instances, we need the GPID
                gpid = original_entity.get('gpid')
                if not gpid:
                    logger.error("GP ID is required for creating a GP instance")
                    return error_response("GP ID is required for copying a GP instance", 400)
                attributes = {
                    'gpid': gpid,
                    'instanceLabel': f"{original_entity.get('instanceLabel', '')}_Copy"
                }
            elif entity_type == 'sp_instance':
                # For SP instances, we need the SPID
                spid = original_entity.get('spId')
                if not spid:
                    logger.error("SP ID is required for creating an SP instance")
                    return error_response("SP ID is required for copying an SP instance", 400)
                attributes = {
                    'spId': spid,
                    'spVersion': original_entity.get('spVersion', '')
                }
            else:
                # Generic fallback for unknown entity types
                attributes = {}
                
                # Include name or id as appropriate
                if 'name' in original_entity:
                    attributes['name'] = new_name
                if 'id' in original_entity and entity_type != 'security_domain':
                    # For non-security domains, we'd generate a new ID in create_entity
                    # For security domains, we use the existing ID
                    pass
                
                # Add any other basic attributes but skip nested objects
                for key, value in original_entity.items():
                    if key not in ['guid', 'name', 'id'] and not isinstance(value, (dict, list)):
                        attributes[key] = value
                
                logger.info(f"Created fallback attributes for unknown entity type {entity_type}")
                
            logger.info(f"Prepared attributes for new entity: {attributes}")
            
            # Create the copied entity in the database
            created_entity = create_entity(
                environment, 
                entity_type,
                parent_guid, 
                attributes
            )
            
            if not created_entity:
                logger.error(f"Failed to create copy of {entity_type}")
                return error_response(f"Failed to create copy of {entity_type}", 400)
            
            logger.info(f"Successfully created copy with GUID: {created_entity.get('guid')}")
            
            # Return the new entity with its GUID
            return success_response({
                "copied": True,
                "originalGuid": guid,
                "newEntityGuid": created_entity.get('guid'),
                "newEntity": created_entity
            }, 201)
            
        except Exception as e:
            logger.error(f"Error creating entity attributes: {str(e)}")
            return error_response(f"Error creating entity attributes: {str(e)}", 500)
    
    except ValueError as ve:
        logger.error(f"Value error copying entity: {str(ve)}")
        return error_response(str(ve), 400)
    except Exception as e:
        logger.error(f"Error copying entity: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return error_response(str(e), 500)
