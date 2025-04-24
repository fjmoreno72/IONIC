from flask import Blueprint, session, jsonify, request, current_app, render_template, redirect, url_for
from app.data_access.cis_plan_repository import (
    get_all_cis_plan, get_all_cis_security_classification,
    add_mission_network, update_mission_network, delete_mission_network,
    add_network_segment, update_network_segment, delete_network_segment,
    add_security_domain, get_all_security_domains, update_security_domain, delete_security_domain,
    get_all_hw_stacks, get_hw_stack, add_hw_stack, update_hw_stack, delete_hw_stack,
    get_all_assets, get_asset, add_asset, update_asset, delete_asset,
    add_network_interface, get_all_network_interfaces, get_network_interface, update_network_interface, delete_network_interface,
    update_configuration_item, get_all_gp_instances, get_gp_instance, add_gp_instance, update_gp_instance, delete_gp_instance,
    refresh_gp_instance_config_items,
    add_sp_instance, get_all_sp_instances, get_sp_instance, update_sp_instance, delete_sp_instance
)
from app.api.iocore2 import IOCore2ApiClient 

cis_plan_bp = Blueprint('cis_plan', __name__)

# --- Helpers ---
def get_environment():
    return session.get('environment', 'ciav')

def get_json_field(data, field):
    if not data or field not in data:
        raise ValueError(f"Missing '{field}' in request body.")
    return data[field]

def success_response(data, status=200):
    return jsonify({"status": "success", "data": data}), status

def error_response(message, status=400, **kwargs):
    resp = {"status": "error", "message": message}
    resp.update(kwargs)
    return jsonify(resp), status

@cis_plan_bp.route('/api/cis_plan/mission_network', methods=['GET', 'POST'])
def handle_mission_networks():
    """Handles GET (all) and POST (create) for Mission Networks."""
    environment = get_environment()
    if request.method == 'POST':
        # --- Create Mission Network --- 
        data = request.get_json()
        name = get_json_field(data, 'name')
        try:
            new_mn = add_mission_network(environment, name)
            if new_mn:
                return success_response(new_mn, 201)
            else:
                # This case might indicate an internal issue if creation unexpectedly fails
                return error_response("Failed to create mission network", 500)
        except ValueError as ve:
            return error_response(str(ve), 400)
        except Exception as e:
            current_app.logger.error(f"Error creating mission network: {e}")
            return error_response(f"Internal server error: {e}", 500)
    
    elif request.method == 'GET':
        # --- Get All Mission Networks ---
        try:
            full_plan = get_all_cis_plan(environment)
            all_mns = full_plan.get('missionNetworks', []) # Extract the list
            return success_response(all_mns)
        except Exception as e:
            current_app.logger.error(f"Error getting all mission networks: {e}")
            return error_response(f"Internal server error: {e}", 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mission_network_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_mission_network(mission_network_id):
    try:
        environment = get_environment()
        if request.method == 'GET':
            # --- Get Single Mission Network ---
            full_plan = get_all_cis_plan(environment)
            mission_networks = full_plan.get('missionNetworks', [])
            mn = next((mn for mn in mission_networks if mn.get('id') == mission_network_id), None)
            if not mn:
                return error_response(f"Mission network {mission_network_id} not found", 404, mission_network_id=mission_network_id)
            return success_response(mn, 200)
        elif request.method == 'PUT':
            data = request.get_json()
            name = get_json_field(data, 'name')
            updated = update_mission_network(environment, mission_network_id, name)
            if updated:
                return success_response(updated)
            else:
                return error_response("Mission network not found.", 404)
        elif request.method == 'DELETE':
            deleted = delete_mission_network(environment, mission_network_id)
            if deleted:
                return jsonify({"status": "success", "deleted": True}), 200
            else:
                return jsonify({"status": "error", "message": "Mission network not found.", "deleted": False}), 404
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        return error_response(str(e), 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mission_network_id>/segment', methods=['GET', 'POST'])
def handle_network_segments(mission_network_id):
    try:
        environment = get_environment()
        if request.method == 'POST':
            # --- Create Network Segment ---
            data = request.get_json()
            name = get_json_field(data, 'name')
            new_segment = add_network_segment(environment, mission_network_id, name)
            if new_segment:
                return success_response(new_segment, 201)
            else:
                return error_response("Failed to create network segment - mission network may not exist.", 404, mission_network_id=mission_network_id)
        elif request.method == 'GET':
            # --- Get All Network Segments ---
            # First need to load the plan and find the mission network
            full_plan = get_all_cis_plan(environment)
            mission_networks = full_plan.get('missionNetworks', [])
            mn = next((mn for mn in mission_networks if mn.get('id') == mission_network_id), None)
            if not mn:
                return error_response(f"Mission network {mission_network_id} not found", 404, mission_network_id=mission_network_id)
            segments = mn.get('networkSegments', [])
            return success_response(segments, 200)
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        current_app.logger.error(f"Error handling segments: {e}")
        return error_response(str(e), 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mission_network_id>/segment/<segment_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_network_segment(mission_network_id, segment_id):
    try:
        environment = get_environment()
        if request.method == 'GET':
            # --- Get Single Network Segment ---
            # First need to load the plan and find the mission network and segment
            full_plan = get_all_cis_plan(environment)
            mission_networks = full_plan.get('missionNetworks', [])
            mn = next((mn for mn in mission_networks if mn.get('id') == mission_network_id), None)
            if not mn:
                return error_response(f"Mission network {mission_network_id} not found", 404, mission_network_id=mission_network_id)
            segment = next((seg for seg in mn.get('networkSegments', []) if seg.get('id') == segment_id), None)
            if not segment:
                return error_response(f"Network segment {segment_id} not found", 404, segment_id=segment_id)
            return success_response(segment, 200)
        elif request.method == 'PUT':
            data = request.get_json()
            name = get_json_field(data, 'name')
            updated = update_network_segment(environment, mission_network_id, segment_id, name)
            if updated:
                return success_response(updated)
            else:
                return error_response("Network segment not found.", 404)
        elif request.method == 'DELETE':
            deleted = delete_network_segment(environment, mission_network_id, segment_id)
            if deleted:
                return jsonify({"status": "success", "deleted": True}), 200
            else:
                return jsonify({"status": "error", "message": "Network segment not found.", "deleted": False}), 404
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        return error_response(str(e), 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mission_network_id>/segment/<segment_id>/security_domain', methods=['GET', 'POST'])
def handle_security_domains(mission_network_id, segment_id):
    try:
        environment = get_environment()
        if request.method == 'POST':
            # --- Create Security Domain ---
            data = request.get_json()
            name = get_json_field(data, 'name')
            new_domain = add_security_domain(environment, mission_network_id, segment_id, name)
            if new_domain:
                return success_response(new_domain, 201)
            else:
                return error_response("Failed to create security domain - parent resources may not exist.", 404, mission_network_id=mission_network_id, segment_id=segment_id)
        elif request.method == 'GET':
            # --- Get All Security Domains ---
            domains = get_all_security_domains(environment, mission_network_id, segment_id)
            return success_response(domains, 200)
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        current_app.logger.error(f"Error handling security domains: {e}")
        return error_response(str(e), 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mission_network_id>/segment/<segment_id>/security_domain/all', methods=['GET'])
def get_security_domains(mission_network_id, segment_id):
    try:
        environment = get_environment()
        domains = get_all_security_domains(environment, mission_network_id, segment_id)
        return success_response(domains)
    except Exception as e:
        return error_response(str(e), 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mission_network_id>/segment/<segment_id>/security_domain/<domain_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_security_domain(mission_network_id, segment_id, domain_id):
    try:
        environment = get_environment()
        if request.method == 'GET':
            # --- Get Single Security Domain ---
            # First need to get all domains in the segment
            domains = get_all_security_domains(environment, mission_network_id, segment_id)
            domain = next((d for d in domains if d.get('id') == domain_id), None)
            if domain:
                return success_response(domain, 200)
            else:
                return error_response(f"Security domain {domain_id} not found.", 404, domain_id=domain_id)
        elif request.method == 'PUT':
            data = request.get_json()
            name = get_json_field(data, 'name')
            updated = update_security_domain(environment, mission_network_id, segment_id, domain_id, name)
            if updated:
                return success_response(updated)
            else:
                return error_response("Security domain not found.", 404)
        elif request.method == 'DELETE':
            deleted = delete_security_domain(environment, mission_network_id, segment_id, domain_id)
            if deleted:
                return jsonify({"status": "success", "deleted": True}), 200
            else:
                return jsonify({"status": "error", "message": "Security domain not found.", "deleted": False}), 404
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        return error_response(str(e), 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mn_id>/segment/<seg_id>/security_domain/<dom_id>/hw_stacks', methods=['GET', 'POST'])
def handle_hw_stacks(mn_id, seg_id, dom_id):
    try:
        environment = get_environment()
        if request.method == 'GET':
            stacks = get_all_hw_stacks(environment, mn_id, seg_id, dom_id)
            return success_response(stacks)
        elif request.method == 'POST':
            data = request.get_json()
            name = get_json_field(data, 'name')
            cis_participant_id = get_json_field(data, 'cisParticipantID')

            # Validate Participant ID
            if not _validate_participant(cis_participant_id):
                return error_response(f"Invalid cisParticipantID: '{cis_participant_id}' not found.", 400, invalid_participant_id=cis_participant_id)

            new_stack = add_hw_stack(environment, mn_id, seg_id, dom_id, name, cis_participant_id)
            if new_stack:
                return success_response(new_stack, 201)
            else:
                return error_response("Failed to create HW Stack. Parent resource not found?", 404, mn_id=mn_id, seg_id=seg_id, dom_id=dom_id)
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        return error_response(str(e), 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mn_id>/segment/<seg_id>/security_domain/<dom_id>/hw_stacks/<stack_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_hw_stack(mn_id, seg_id, dom_id, stack_id):
    """Handle operations for a specific HW stack."""
    env = get_environment()
    try:
        if request.method == 'GET':
            stack = get_hw_stack(env, mn_id, seg_id, dom_id, stack_id)
            if not stack:
                return error_response(f"HW stack {stack_id} not found", 404)
            return jsonify({'status': 'success', 'data': stack})
        
        elif request.method == 'PUT':
            data = request.get_json()
            try:
                name = get_json_field(data, 'name')
                participant_id = get_json_field(data, 'cisParticipantID')
                
                # Validate participant against IOCore2 API before updating
                if not _validate_participant(participant_id):
                    return error_response(f"Invalid cisParticipantID: {participant_id}", 400, validation_error=True)
                    
                updated = update_hw_stack(env, mn_id, seg_id, dom_id, stack_id, name, participant_id)
                if not updated:
                    return error_response(f"Failed to update HW stack {stack_id}", 404)
                return jsonify({'status': 'success', 'data': updated})
            except ValueError as e:
                return error_response(str(e), 400)
            
        elif request.method == 'DELETE':
            deleted = delete_hw_stack(env, mn_id, seg_id, dom_id, stack_id)
            if not deleted:
                return error_response(f"Failed to delete HW stack {stack_id}", 404)
            return jsonify({'status': 'success', 'message': f"HW stack {stack_id} deleted"})
    except Exception as e:
        return error_response(f"Error processing request: {str(e)}", 500)

# --- Asset Endpoints ---

@cis_plan_bp.route('/api/cis_plan/mission_network/<mn_id>/segment/<seg_id>/security_domain/<dom_id>/hw_stacks/<stack_id>/assets', methods=['GET', 'POST'])
def handle_assets(mn_id, seg_id, dom_id, stack_id):
    """Handle operations for all assets in a hardware stack."""
    env = get_environment()
    try:
        if request.method == 'GET':
            assets = get_all_assets(env, mn_id, seg_id, dom_id, stack_id)
            if assets is None:  # Different from empty list
                return error_response(f"Hardware stack {stack_id} not found", 404)
            return jsonify({'status': 'success', 'data': assets})
        
        elif request.method == 'POST':
            data = request.get_json()
            try:
                name = get_json_field(data, 'name')
                
                asset = add_asset(env, mn_id, seg_id, dom_id, stack_id, name)
                if not asset:
                    return error_response(f"Failed to create asset in stack {stack_id}", 404)
                return jsonify({'status': 'success', 'data': asset}), 201
            except ValueError as e:
                return error_response(str(e), 400)
    except Exception as e:
        return error_response(f"Error processing request: {str(e)}", 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mn_id>/segment/<seg_id>/security_domain/<dom_id>/hw_stacks/<stack_id>/assets/<asset_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_asset(mn_id, seg_id, dom_id, stack_id, asset_id):
    """Handle operations for a specific asset within a hardware stack."""
    env = get_environment()
    try:
        if request.method == 'GET':
            asset = get_asset(env, mn_id, seg_id, dom_id, stack_id, asset_id)
            if not asset:
                return error_response(f"Asset {asset_id} not found in stack {stack_id}", 404)
            return jsonify({'status': 'success', 'data': asset})
        
        elif request.method == 'PUT':
            data = request.get_json()
            try:
                name = get_json_field(data, 'name')
                
                updated = update_asset(env, mn_id, seg_id, dom_id, stack_id, asset_id, name)
                if not updated:
                    return error_response(f"Failed to update asset {asset_id}", 404)
                return jsonify({'status': 'success', 'data': updated})
            except ValueError as e:
                return error_response(str(e), 400)
            
        elif request.method == 'DELETE':
            deleted = delete_asset(env, mn_id, seg_id, dom_id, stack_id, asset_id)
            if not deleted:
                return error_response(f"Failed to delete asset {asset_id}", 404)
            return jsonify({'status': 'success', 'message': f"Asset {asset_id} deleted"})
    except Exception as e:
        return error_response(f"Error processing request: {str(e)}", 500)

# --- Network Interface Endpoints ---

@cis_plan_bp.route('/api/cis_plan/mission_network/<mn_id>/segment/<seg_id>/security_domain/<dom_id>/hw_stacks/<stack_id>/assets/<asset_id>/network_interfaces', methods=['GET', 'POST'])
def handle_network_interfaces(mn_id, seg_id, dom_id, stack_id, asset_id):
    """Handle operations for all network interfaces in an asset."""
    env = get_environment()
    
    if request.method == 'GET':
        # Get all network interfaces
        try:
            interfaces = get_all_network_interfaces(env, mn_id, seg_id, dom_id, stack_id, asset_id)
            return success_response(interfaces)
        except Exception as e:
            return error_response(f"Error retrieving network interfaces: {str(e)}")
            
    elif request.method == 'POST':
        # Create new network interface with empty configuration items
        try:
            data = request.get_json()
            name = get_json_field(data, 'name')  # Network interface name is required
            new_interface = add_network_interface(env, mn_id, seg_id, dom_id, stack_id, asset_id, name)
            if not new_interface:
                return error_response(f"Could not create network interface. Parent resource not found.", status=404)
            return success_response(new_interface, status=201)
        except ValueError as e:
            return error_response(str(e))
        except Exception as e:
            return error_response(f"Error creating network interface: {str(e)}")

@cis_plan_bp.route('/api/cis_plan/mission_network/<mn_id>/segment/<seg_id>/security_domain/<dom_id>/hw_stacks/<stack_id>/assets/<asset_id>/network_interfaces/<interface_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_network_interface(mn_id, seg_id, dom_id, stack_id, asset_id, interface_id):
    """Handle operations for a specific network interface within an asset."""
    env = get_environment()
    
    if request.method == 'GET':
        # Get network interface
        try:
            interface = get_network_interface(env, mn_id, seg_id, dom_id, stack_id, asset_id, interface_id)
            if not interface:
                return error_response(f"Network interface {interface_id} not found.", status=404)
            return success_response(interface)
        except Exception as e:
            return error_response(f"Error retrieving network interface: {str(e)}")
            
    elif request.method == 'PUT':
        # Update network interface name
        try:
            data = request.get_json()
            name = get_json_field(data, 'name')  # Network interface name is required
            updated_interface = update_network_interface(env, mn_id, seg_id, dom_id, stack_id, asset_id, interface_id, name)
            if not updated_interface:
                return error_response(f"Network interface {interface_id} not found.", status=404)
            return success_response(updated_interface)
        except ValueError as e:
            return error_response(str(e))
        except Exception as e:
            return error_response(f"Error updating network interface: {str(e)}")
            
    elif request.method == 'DELETE':
        # Delete network interface
        try:
            deleted = delete_network_interface(env, mn_id, seg_id, dom_id, stack_id, asset_id, interface_id)
            if not deleted:
                return error_response(f"Network interface {interface_id} not found.", status=404)
            return success_response({"deleted": True, "id": interface_id})
        except Exception as e:
            return error_response(f"Error deleting network interface: {str(e)}")

# --- Configuration Item Endpoints ---

@cis_plan_bp.route('/api/cis_plan/mission_network/<mn_id>/segment/<seg_id>/security_domain/<dom_id>/hw_stacks/<stack_id>/assets/<asset_id>/network_interfaces/<interface_id>/config', methods=['PUT'])
def handle_configuration_items(mn_id, seg_id, dom_id, stack_id, asset_id, interface_id):
    """Handle operations for configuration items within a network interface."""
    env = get_environment()
    
    if request.method == 'PUT':
        # Update configuration item
        try:
            data = request.get_json()
            item_name = get_json_field(data, 'name')  # Configuration item name is required
            answer_content = get_json_field(data, 'value')  # Configuration item value is required
            
            # Validate item_name is one of the allowed values
            if item_name not in ["IP Address", "Sub-Net", "FQDN"]:
                return error_response(f"Invalid configuration item name: {item_name}. Must be one of: IP Address, Sub-Net, FQDN.")
                
            updated_item = update_configuration_item(env, mn_id, seg_id, dom_id, stack_id, asset_id, interface_id, item_name, answer_content)
            if not updated_item:
                return error_response(f"Could not update configuration item. Parent resource not found.", status=404)
            return success_response(updated_item)
        except ValueError as e:
            return error_response(str(e))
        except Exception as e:
            return error_response(f"Error updating configuration item: {str(e)}")

# --- GP Instance Endpoints ---

@cis_plan_bp.route('/api/cis_plan/mission_network/<mn_id>/segment/<seg_id>/security_domain/<dom_id>/hw_stacks/<stack_id>/assets/<asset_id>/gp_instances', methods=['GET', 'POST'])
def handle_gp_instances(mn_id, seg_id, dom_id, stack_id, asset_id):
    """Handle operations for all GP instances in an asset."""
    env = get_environment()
    
    if request.method == 'GET':
        # Get all GP instances
        try:
            instances = get_all_gp_instances(env, mn_id, seg_id, dom_id, stack_id, asset_id)
            return success_response(instances)
        except Exception as e:
            return error_response(f"Error retrieving GP instances: {str(e)}")
            
    elif request.method == 'POST':
        # Create new GP instance with empty spInstances and configurationItems arrays
        try:
            data = request.get_json()
            instance_label = get_json_field(data, 'instanceLabel')  # Instance label is required
            service_id = get_json_field(data, 'serviceId')  # Service ID is required
            
            new_instance = add_gp_instance(env, mn_id, seg_id, dom_id, stack_id, asset_id, instance_label, service_id)
            if not new_instance:
                return error_response(f"Could not create GP instance. Parent resource not found.", status=404)
            return success_response(new_instance, status=201)
        except ValueError as e:
            return error_response(str(e))
        except Exception as e:
            return error_response(f"Error creating GP instance: {str(e)}")

@cis_plan_bp.route('/api/cis_plan/mission_network/<mn_id>/segment/<seg_id>/security_domain/<dom_id>/hw_stacks/<stack_id>/assets/<asset_id>/gp_instances/<instance_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_gp_instance(mn_id, seg_id, dom_id, stack_id, asset_id, instance_id):
    """Handle operations for a specific GP instance within an asset."""
    env = get_environment()
    
    if request.method == 'GET':
        # Get GP instance
        try:
            instance = get_gp_instance(env, mn_id, seg_id, dom_id, stack_id, asset_id, instance_id)
            if not instance:
                return error_response(f"GP instance {instance_id} not found.", status=404)
            return success_response(instance)
        except Exception as e:
            return error_response(f"Error retrieving GP instance: {str(e)}")
            
    elif request.method == 'PUT':
        # Update GP instance
        try:
            data = request.get_json()
            instance_label = get_json_field(data, 'instanceLabel')  # Instance label is required
            service_id = get_json_field(data, 'serviceId')  # Service ID is required
            
            updated_instance = update_gp_instance(env, mn_id, seg_id, dom_id, stack_id, asset_id, instance_id, instance_label, service_id)
            if not updated_instance:
                return error_response(f"GP instance {instance_id} not found.", status=404)
            return success_response(updated_instance)
        except ValueError as e:
            return error_response(str(e))
        except Exception as e:
            return error_response(f"Error updating GP instance: {str(e)}")
            
    elif request.method == 'DELETE':
        # Delete GP instance
        try:
            deleted = delete_gp_instance(env, mn_id, seg_id, dom_id, stack_id, asset_id, instance_id)
            if not deleted:
                return error_response(f"GP instance {instance_id} not found.", status=404)
            return success_response({"deleted": True, "id": instance_id})
        except Exception as e:
            return error_response(f"Error deleting GP instance: {str(e)}")

@cis_plan_bp.route('/api/cis_plan/<environment>/mission_networks/<mn_id>/network_segments/<seg_id>/security_domains/<dom_id>/hw_stacks/<stack_id>/assets/<asset_id>/gp_instances/<instance_id>/refresh_config', methods=['POST'])
def refresh_gp_instance_configs(environment, mn_id, seg_id, dom_id, stack_id, asset_id, instance_id):
    try:
        # This endpoint only supports POST for refreshing config items
        if request.method == 'POST':
            refreshed_instance = refresh_gp_instance_config_items(environment, mn_id, seg_id, dom_id, stack_id, asset_id, instance_id)
            if refreshed_instance:
                return jsonify({
                    'status': 'success',
                    'message': f"Successfully refreshed config items for GP instance {instance_id}",
                    'data': refreshed_instance
                })
            else:
                return jsonify({
                    'status': 'error',
                    'message': f"Failed to refresh config items for GP instance {instance_id}"
                }), 404
    except Exception as e:
        logging.error(f"API Error refreshing GP instance config items: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error refreshing config items: {str(e)}"
        }), 500

# --- SP Instance API Routes ---

@cis_plan_bp.route('/api/cis_plan/<environment>/mission_networks/<mn_id>/network_segments/<seg_id>/security_domains/<dom_id>/hw_stacks/<stack_id>/assets/<asset_id>/gp_instances/<gp_id>/sp_instances', methods=['GET', 'POST'])
def sp_instances(environment, mn_id, seg_id, dom_id, stack_id, asset_id, gp_id):
    try:
        if request.method == 'GET':
            # Get all SP instances in a GP instance
            instances = get_all_sp_instances(environment, mn_id, seg_id, dom_id, stack_id, asset_id, gp_id)
            return jsonify({
                'status': 'success',
                'message': f"Found {len(instances)} SP instances in GP instance {gp_id}",
                'data': instances
            })
        elif request.method == 'POST':
            # Create a new SP instance
            data = request.json
            if not data or not all(key in data for key in ['spId', 'spVersion']):
                return jsonify({
                    'status': 'error',
                    'message': "Missing required fields: 'spId', 'spVersion'"
                }), 400
            
            sp_id = data.get('spId')
            sp_version = data.get('spVersion')
            
            new_instance = add_sp_instance(environment, mn_id, seg_id, dom_id, stack_id, asset_id, gp_id, sp_id, sp_version)
            if new_instance:
                return jsonify({
                    'status': 'success',
                    'message': f"Successfully added SP instance {sp_id} to GP instance {gp_id}",
                    'data': new_instance
                }), 201
            else:
                return jsonify({
                    'status': 'error',
                    'message': f"Failed to add SP instance to GP instance {gp_id}. It may already exist or the GP instance was not found."
                }), 400
    except Exception as e:
        logging.error(f"API Error processing SP instances: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error processing SP instances: {str(e)}"
        }), 500

@cis_plan_bp.route('/api/cis_plan/<environment>/mission_networks/<mn_id>/network_segments/<seg_id>/security_domains/<dom_id>/hw_stacks/<stack_id>/assets/<asset_id>/gp_instances/<gp_id>/sp_instances/<sp_id>', methods=['GET', 'PUT', 'DELETE'])
def sp_instance(environment, mn_id, seg_id, dom_id, stack_id, asset_id, gp_id, sp_id):
    try:
        if request.method == 'GET':
            # Get a specific SP instance
            instance = get_sp_instance(environment, mn_id, seg_id, dom_id, stack_id, asset_id, gp_id, sp_id)
            if instance:
                return jsonify({
                    'status': 'success',
                    'message': f"Found SP instance {sp_id} in GP instance {gp_id}",
                    'data': instance
                })
            else:
                return jsonify({
                    'status': 'error',
                    'message': f"SP instance {sp_id} not found in GP instance {gp_id}"
                }), 404
        elif request.method == 'PUT':
            # Update an SP instance
            data = request.json
            if not data or 'spVersion' not in data:
                return jsonify({
                    'status': 'error',
                    'message': "Missing required field: 'spVersion'"
                }), 400
            
            sp_version = data.get('spVersion')
            
            updated_instance = update_sp_instance(environment, mn_id, seg_id, dom_id, stack_id, asset_id, gp_id, sp_id, sp_version)
            if updated_instance:
                return jsonify({
                    'status': 'success',
                    'message': f"Successfully updated SP instance {sp_id} in GP instance {gp_id}",
                    'data': updated_instance
                })
            else:
                return jsonify({
                    'status': 'error',
                    'message': f"Failed to update SP instance {sp_id} in GP instance {gp_id}. It may not exist."
                }), 404
        elif request.method == 'DELETE':
            # Delete an SP instance
            success = delete_sp_instance(environment, mn_id, seg_id, dom_id, stack_id, asset_id, gp_id, sp_id)
            if success:
                return jsonify({
                    'status': 'success',
                    'message': f"Successfully deleted SP instance {sp_id} from GP instance {gp_id}"
                })
            else:
                return jsonify({
                    'status': 'error',
                    'message': f"Failed to delete SP instance {sp_id} from GP instance {gp_id}. It may not exist."
                }), 404
    except Exception as e:
        logging.error(f"API Error processing SP instance {sp_id}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Error processing SP instance {sp_id}: {str(e)}"
        }), 500

@cis_plan_bp.route('/api/cis_plan/all', methods=['GET'])
def get_cis_plan_all():
    """
    Get all CIS Plan data.
    Optional: pass 'environment' as a query parameter.
    """
    environment = session.get('environment', 'ciav')
    try:
        data = get_all_cis_plan(environment)
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@cis_plan_bp.route('/api/cis_security_classification/all', methods=['GET'])
def get_cis_security_classification_all():
    """
    Get all CIS Security Classification data.
    """
    try:
        data = get_all_cis_security_classification()
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@cis_plan_bp.route('/api/cis_security_classification/summary', methods=['GET'])
def get_cis_security_classification_summary():
    """
    Get summary of CIS Security Classification data (count).
    """
    try:
        data = get_all_cis_security_classification()
        count = len(data) if isinstance(data, list) else 0
        return jsonify({"status": "success", "count": count})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def _validate_participant(participant_id: str) -> bool:
    """Helper to validate cisParticipantID using IOCore2 API."""
    try:
        # Assuming iocore2_client is attached to current_app or accessible somehow
        # You might need to adjust how the client is obtained based on your app setup
        iocore_client: IOCore2ApiClient = current_app.iocore2_client 
        participants = iocore_client.get_participants()
        return any(p.get('id') == participant_id for p in participants)
    except AttributeError:
         # Handle case where client isn't configured on app
         current_app.logger.error("IOCore2ApiClient not found on current_app. Cannot validate participant ID.")
         # Decide if this should be a hard failure or allow creation without validation
         # For now, let's treat it as a server error preventing the operation.
         raise ConnectionError("Participant validation service not configured.")
    except Exception as e:
        current_app.logger.error(f"Error validating participant ID {participant_id}: {e}")
        # Decide if validation failure should prevent creation/update
        # For now, let's treat it as a server error preventing the operation.
        raise ConnectionError(f"Failed to validate participant ID: {e}")

@cis_plan_bp.route('/cis_plan_view')
@cis_plan_bp.route('/cis_plan_view/')
def cis_plan_view():
    """Render the CIS Plan view page."""
    try:
        environment = get_environment()
        return render_template('pages/cis_plan.html')
    except Exception as e:
        current_app.logger.error(f"Error rendering CIS Plan view: {e}")
        # Redirect to home on error
        return redirect(url_for('views.index'))

# The API route is moved to use the actual API blueprint
from app.routes.api import api_bp

@api_bp.route('/cis_plan/tree', methods=['GET'])
def get_cis_plan_tree():
    """Get CIS Plan data structured for tree visualization."""
    try:
        environment = get_environment()
        data = get_all_cis_plan(environment)
        
        # Return the mission networks with their hierarchical structure
        return jsonify({
            "status": "success",
            "data": data.get('missionNetworks', [])
        })
    except Exception as e:
        current_app.logger.error(f"Error getting CIS Plan tree data: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500
