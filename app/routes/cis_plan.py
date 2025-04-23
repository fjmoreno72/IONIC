from flask import Blueprint, session, jsonify, request
from app.data_access.cis_plan_repository import (
    get_all_cis_plan, get_all_cis_security_classification,
    add_mission_network, update_mission_network, delete_mission_network,
    add_network_segment, update_network_segment, delete_network_segment,
    add_security_domain, get_all_security_domains, update_security_domain, delete_security_domain
)

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

@cis_plan_bp.route('/api/cis_plan/mission_network', methods=['POST'])
def create_mission_network():
    try:
        environment = get_environment()
        data = request.get_json()
        name = get_json_field(data, 'name')
        new_mn = add_mission_network(environment, name)
        return success_response(new_mn, 201)
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        return error_response(str(e), 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mission_network_id>', methods=['PUT'])
def update_mission_network_route(mission_network_id):
    try:
        environment = get_environment()
        data = request.get_json()
        name = get_json_field(data, 'name')
        updated = update_mission_network(environment, mission_network_id, name)
        if updated:
            return success_response(updated)
        else:
            return error_response("Mission network not found.", 404)
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        return error_response(str(e), 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mission_network_id>', methods=['DELETE'])
def delete_mission_network_route(mission_network_id):
    try:
        environment = get_environment()
        deleted = delete_mission_network(environment, mission_network_id)
        if deleted:
            return jsonify({"status": "success", "deleted": True}), 200
        else:
            return jsonify({"status": "error", "message": "Mission network not found.", "deleted": False}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@cis_plan_bp.route('/api/cis_plan/mission_network/<mission_network_id>/segment', methods=['POST'])
def create_network_segment(mission_network_id):
    try:
        environment = get_environment()
        data = request.get_json()
        name = get_json_field(data, 'name')
        new_seg = add_network_segment(environment, mission_network_id, name)
        if new_seg:
            return success_response(new_seg, 201)
        else:
            return error_response("Mission network not found.", 404)
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        return error_response(str(e), 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mission_network_id>/segment/<segment_id>', methods=['PUT'])
def update_network_segment_route(mission_network_id, segment_id):
    try:
        environment = get_environment()
        data = request.get_json()
        name = get_json_field(data, 'name')
        updated = update_network_segment(environment, mission_network_id, segment_id, name)
        if updated:
            return success_response(updated)
        else:
            return error_response("Network segment not found.", 404)
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        return error_response(str(e), 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mission_network_id>/segment/<segment_id>', methods=['DELETE'])
def delete_network_segment_route(mission_network_id, segment_id):
    try:
        environment = get_environment()
        deleted = delete_network_segment(environment, mission_network_id, segment_id)
        if deleted:
            return jsonify({"status": "success", "deleted": True}), 200
        else:
            return jsonify({"status": "error", "message": "Network segment not found.", "deleted": False}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@cis_plan_bp.route('/api/cis_plan/mission_network/<mission_network_id>/segment/<segment_id>/security_domain', methods=['POST'])
def create_security_domain(mission_network_id, segment_id):
    try:
        environment = get_environment()
        data = request.get_json()
        name = get_json_field(data, 'name')
        new_sd = add_security_domain(environment, mission_network_id, segment_id, name)
        if new_sd:
            return success_response(new_sd, 201)
        else:
            return error_response("Mission network or segment not found.", 404)
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        return error_response(str(e), 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mission_network_id>/segment/<segment_id>/security_domain/all', methods=['GET'])
def get_security_domains(mission_network_id, segment_id):
    try:
        environment = get_environment()
        domains = get_all_security_domains(environment, mission_network_id, segment_id)
        return success_response(domains)
    except Exception as e:
        return error_response(str(e), 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mission_network_id>/segment/<segment_id>/security_domain/<domain_id>', methods=['PUT'])
def update_security_domain_route(mission_network_id, segment_id, domain_id):
    try:
        environment = get_environment()
        data = request.get_json()
        name = get_json_field(data, 'name')
        updated = update_security_domain(environment, mission_network_id, segment_id, domain_id, name)
        if updated:
            return success_response(updated)
        else:
            return error_response("Security domain not found.", 404)
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        return error_response(str(e), 500)

@cis_plan_bp.route('/api/cis_plan/mission_network/<mission_network_id>/segment/<segment_id>/security_domain/<domain_id>', methods=['DELETE'])
def delete_security_domain_route(mission_network_id, segment_id, domain_id):
    try:
        environment = get_environment()
        deleted = delete_security_domain(environment, mission_network_id, segment_id, domain_id)
        if deleted:
            return jsonify({"status": "success", "deleted": True}), 200
        else:
            return jsonify({"status": "error", "message": "Security domain not found.", "deleted": False}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

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
