from pathlib import Path
import json
import logging
import uuid
from flask import Blueprint, jsonify, session, request, current_app
from werkzeug.exceptions import NotFound
from app.utils.file_operations import get_dynamic_data_path
from app.data_access import gps_repository
from app.data_access.ascs_repository import get_all_ascs, save_ascs
from app.data_access.affiliates_repository import get_all_affiliates
from app.data_access.services_repository import get_all_services
from app.data_access.sps_repository import get_all_sps
from app.core.auth import login_required

# Use the existing api blueprint
from app.routes.api import api_bp

# --- ASC Form Data ---
@api_bp.route('/api/asc_form_data', methods=['GET'])
@login_required
def get_asc_form_data():
    """API endpoint to get data needed for the ASC creation/edit form."""
    try:
        #static_asc_data_path = Path(current_app.static_folder) / 'ASC' / 'data'
        affiliates_data = get_all_affiliates()
        services_data = get_all_services()
        sps_data = get_all_sps()

        try:
            gps_data = gps_repository.get_all_gps()
        except Exception as e:
            logging.error(f"Error loading GPs data: {e}")
            return jsonify({"error": "GPs data could not be loaded."}), 500

        return jsonify({
            'affiliates': affiliates_data,
            'services': services_data,
            'sps': sps_data,
            'gps': gps_data
        })

    except Exception as e:
        logging.exception("Error fetching ASC form data.")
        return jsonify({"error": "An unexpected error occurred while fetching ASC form data."}), 500

# --- ASC CRUD Endpoints ---
@api_bp.route('/api/ascs', methods=['GET'])
@login_required
def get_ascs():
    """API endpoint to retrieve all ASCs."""
    try:
        ascs_list = get_all_ascs()
        return jsonify(ascs_list)
    except Exception as e:
        logging.exception("Error fetching ASC list:")
        return jsonify({"error": "Failed to load ASC list."}), 500

@api_bp.route('/api/ascs', methods=['POST'])
@login_required
def add_asc():
    """API endpoint to add a new ASC."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        required_fields = ['affiliateId', 'environment', 'serviceId', 'model']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Load existing ASCs via repository
        ascs_list = get_all_ascs()

        last_id_num = 0
        for asc in reversed(ascs_list or []):
            if isinstance(asc.get('id'), str) and asc['id'].startswith('ASC-'):
                try:
                    last_id_num = max(last_id_num, int(asc['id'].split('-')[1]))
                except:
                    pass
        new_id_num = last_id_num + 1
        new_asc_id = f"ASC-{str(new_id_num).zfill(4)}"

        # Assign unique GUID to each GP instance
        raw_gps = data.get('gpInstances', []) or []
        gp_instances = []
        for gp in raw_gps:
            gp_copy = gp.copy() if isinstance(gp, dict) else {'gpId': gp}
            gp_copy['guid'] = str(uuid.uuid4())
            # Limit GP models to the ASC's model
            gp_copy['models'] = [data['model']]
            gp_instances.append(gp_copy)

        # Construct new ASC
        new_asc = {
            'guid': str(uuid.uuid4()),
            'id': new_asc_id,
            'affiliateId': data['affiliateId'],
            'environment': data['environment'],
            'serviceId': data['serviceId'],
            'model': data['model'],
            'ascScore': '0%',
            'status': 'Initial',
            'gpInstances': gp_instances
        }

        ascs_list.append(new_asc)
        if not save_ascs(ascs_list):
            logging.error("Failed to save ASC data via repository.")
            return jsonify({"error": "Unable to save ASC."}), 500

        return jsonify({'success': True, 'asc': new_asc}), 201

    except Exception as e:
        logging.exception("Error adding new ASC:")
        return jsonify({"error": "An unexpected error occurred while adding the ASC."}), 500

@api_bp.route('/api/ascs', methods=['PUT'])
@login_required
def update_asc():
    """API endpoint to update an existing ASC."""
    try:
        data = request.get_json()
        asc_id = data.get('id')
        if not asc_id:
            return jsonify({"error": "No ASC ID provided."}), 400

        # Load ASCs via repository
        ascs_list = get_all_ascs()

        found = False
        for idx, asc in enumerate(ascs_list):
            if asc.get('id') == asc_id:
                data['guid'] = asc.get('guid') or str(uuid.uuid4())
                ascs_list[idx] = data
                found = True
                break
        if not found:
            return jsonify({"error": f"ASC with ID {asc_id} not found."}), 404

        # Save updated list via repository
        if not save_ascs(ascs_list):
            logging.error("Failed to save updated ASC data.")
            return jsonify({"error": "Unable to save ASC update."}), 500

        return jsonify({'success': True, 'asc': data})

    except Exception as e:
        logging.exception("Error updating ASC:")
        return jsonify({"error": "An unexpected error occurred while updating the ASC."}), 500

@api_bp.route('/api/ascs', methods=['DELETE'])
@login_required
def delete_asc():
    """API endpoint to delete an ASC by its ID."""
    try:
        asc_id = request.args.get('id')
        if not asc_id:
            return jsonify({"error": "No ASC ID provided."}), 400

        # Load ASCs via repository
        ascs_list = get_all_ascs()

        filtered = [asc for asc in ascs_list if asc.get('id') != asc_id]
        if len(filtered) == len(ascs_list):
            return jsonify({"error": f"ASC with ID {asc_id} not found."}), 404

        # Save deletions via repository
        if not save_ascs(filtered):
            logging.error("Failed to save ASC deletion.")
            return jsonify({"error": "Unable to delete ASC."}), 500

        return jsonify({'success': True})

    except Exception as e:
        logging.exception("Error deleting ASC:")
        return jsonify({"error": "An unexpected error occurred while deleting the ASC."}), 500

# Helper to create a GP instance consistently
def create_gp_instance(gp_id, asc_model):
    # Attempt to get default models from service config
    models_list = [asc_model]
    try:
        services = get_all_services()
        svc = next((s for s in services if s.get('id') == asc_model), None)
        # svc.gps is service->gp mapping; skip default for now
    except:
        pass
    return {
        'gpId': gp_id,
        'gpScore': '0%',
        'instanceLabel': '',
        'spInstances': [],
        'models': models_list,
        'guid': str(uuid.uuid4())
    }

@api_bp.route('/api/ascs/<asc_id>/gpInstances', methods=['POST'])
@login_required
def add_gp_instance_to_asc(asc_id):
    """Add a GP instance to an existing ASC."""
    try:
        body = request.get_json()
        gp_id = body.get('gpId')
        if not gp_id:
            return jsonify({"error": "No GP ID provided."}), 400

        ascs_list = get_all_ascs()
        for asc in ascs_list:
            if asc.get('id') == asc_id:
                new_gp = create_gp_instance(gp_id, asc.get('model'))
                asc['gpInstances'].append(new_gp)
                break
        else:
            return jsonify({"error": f"ASC with ID {asc_id} not found."}), 404

        if not save_ascs(ascs_list):
            logging.error("Failed to save ASC after adding GP instance.")
            return jsonify({"error": "Unable to save GP instance."}), 500

        return jsonify(new_gp), 201

    except Exception as e:
        logging.exception("Error adding GP instance to ASC:")
        return jsonify({"error": "An unexpected error occurred."}), 500

@api_bp.route('/api/ascs/<asc_id>/gpInstances/<gp_guid>/spInstances', methods=['POST'])
@login_required
def add_sp_instance(asc_id, gp_guid):
    """Add an SP instance to a specific GP within an ASC."""
    try:
        data = request.get_json() or {}
        sp_id = data.get('spId')
        sp_version = data.get('spVersion', '')
        sp_score = data.get('spScore', '0%')
        if not sp_id:
            return jsonify({"error": "No SP ID provided."}), 400
        ascs_list = get_all_ascs()
        new_sp = None
        for asc in ascs_list:
            if asc.get('id') == asc_id:
                for gp in asc.get('gpInstances', []):
                    if gp.get('guid') == gp_guid:
                        new_sp = {
                            'spId': sp_id,
                            'spVersion': sp_version,
                            'spScore': sp_score,
                            'guid': str(uuid.uuid4())
                        }
                        gp.setdefault('spInstances', []).append(new_sp)
                        break
                break
        if not new_sp:
            return jsonify({"error": "ASC or GP instance not found."}), 404
        if not save_ascs(ascs_list):
            logging.error("Failed to save ASC after adding SP." )
            return jsonify({"error": "Unable to save SP instance."}), 500
        return jsonify(new_sp), 201
    except Exception:
        logging.exception("Error adding SP instance:")
        return jsonify({"error": "An unexpected error occurred."}), 500

@api_bp.route('/api/ascs/<asc_id>/gpInstances/<gp_guid>/spInstances/<sp_guid>', methods=['PUT'])
@login_required
def update_sp_instance(asc_id, gp_guid, sp_guid):
    """Update an SP instance within a GP in an ASC."""
    try:
        data = request.get_json() or {}
        ascs_list = get_all_ascs()
        updated_sp = None
        for asc in ascs_list:
            if asc.get('id') == asc_id:
                for gp in asc.get('gpInstances', []):
                    if gp.get('guid') == gp_guid:
                        for idx, sp in enumerate(gp.get('spInstances', [])):
                            if sp.get('guid') == sp_guid:
                                sp['spId'] = data.get('spId', sp['spId'])
                                sp['spVersion'] = data.get('spVersion', sp.get('spVersion', ''))
                                sp['spScore'] = data.get('spScore', sp.get('spScore', '0%'))
                                updated_sp = sp
                                break
                        break
                break
        if not updated_sp:
            return jsonify({"error": "SP instance not found."}), 404
        if not save_ascs(ascs_list):
            logging.error("Failed to save ASC after updating SP.")
            return jsonify({"error": "Unable to save SP update."}), 500
        return jsonify(updated_sp), 200
    except Exception:
        logging.exception("Error updating SP instance:")
        return jsonify({"error": "An unexpected error occurred."}), 500

@api_bp.route('/api/ascs/<asc_id>/gpInstances/<gp_guid>/spInstances/<sp_guid>', methods=['DELETE'])
@login_required
def delete_sp_instance(asc_id, gp_guid, sp_guid):
    """Delete an SP instance from a GP in an ASC."""
    try:
        ascs_list = get_all_ascs()
        deleted = False
        for asc in ascs_list:
            if asc.get('id') == asc_id:
                for gp in asc.get('gpInstances', []):
                    if gp.get('guid') == gp_guid:
                        sp_list = gp.get('spInstances', [])
                        new_list = [sp for sp in sp_list if sp.get('guid') != sp_guid]
                        if len(new_list) != len(sp_list):
                            gp['spInstances'] = new_list
                            deleted = True
                        break
                break
        if not deleted:
            return jsonify({"error": "SP instance not found."}), 404
        if not save_ascs(ascs_list):
            logging.error("Failed to save ASC after deleting SP.")
            return jsonify({"error": "Unable to delete SP instance."}), 500
        return jsonify({'success': True}), 200
    except Exception:
        logging.exception("Error deleting SP instance:")
        return jsonify({"error": "An unexpected error occurred."}), 500
