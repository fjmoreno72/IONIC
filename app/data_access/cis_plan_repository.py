import json
import logging
from pathlib import Path
from app.utils.file_operations import get_dynamic_data_path
from typing import Dict, Any
import uuid

def _load_cis_plan(environment: str) -> dict:
    json_file_path = _get_cis_plan_path(environment)
    with open(json_file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def _save_cis_plan(environment: str, data: dict):
    json_file_path = _get_cis_plan_path(environment)
    with open(json_file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

def _find_mission_network(mission_networks, mission_network_id):
    return next((mn for mn in mission_networks if mn.get('id') == mission_network_id), None)

def _find_security_domain(domains, domain_id):
    return next((sd for sd in domains if sd.get('id') == domain_id), None)

def _get_next_global_security_domain_id(security_domains):
    max_id = 0
    for sd in security_domains:
        if sd.get('id', '').startswith('SD-'):
            try:
                num = int(sd['id'].split('-')[1])
                if num > max_id:
                    max_id = num
            except Exception:
                continue
    return f"SD-{max_id+1:04d}"

def add_security_domain(environment: str, mission_network_id: str, segment_id: str, name: str) -> dict:
    try:
        data = _load_cis_plan(environment)
        mission_networks = data.get('missionNetworks', [])
        mn = _find_mission_network(mission_networks, mission_network_id)
        if not mn:
            return None
        segments = mn.get('networkSegments', [])
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        security_domains = seg.get('securityDomains', [])
        new_id = _get_next_global_security_domain_id(security_domains)
        new_guid = str(uuid.uuid4())
        new_sd = {"name": name, "guid": new_guid, "id": new_id}
        security_domains.append(new_sd)
        seg['securityDomains'] = security_domains
        _save_cis_plan(environment, data)
        logging.info(f"Repository: Added new security domain '{name}' with id '{new_id}' to segment '{segment_id}' in mission network '{mission_network_id}'")
        return new_sd
    except Exception as e:
        logging.error(f"Repository: Error adding security domain: {str(e)}")
        raise

def get_all_security_domains(environment: str, mission_network_id: str, segment_id: str):
    try:
        data = _load_cis_plan(environment)
        mission_networks = data.get('missionNetworks', [])
        mn = _find_mission_network(mission_networks, mission_network_id)
        if not mn:
            return []
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return []
        return seg.get('securityDomains', [])
    except Exception as e:
        logging.error(f"Repository: Error reading security domains: {str(e)}")
        raise

def update_security_domain(environment: str, mission_network_id: str, segment_id: str, domain_id: str, new_name: str) -> dict:
    try:
        data = _load_cis_plan(environment)
        mission_networks = data.get('missionNetworks', [])
        mn = _find_mission_network(mission_networks, mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        security_domains = seg.get('securityDomains', [])
        sd = _find_security_domain(security_domains, domain_id)
        if not sd:
            return None
        sd['name'] = new_name
        _save_cis_plan(environment, data)
        logging.info(f"Repository: Updated security domain '{domain_id}' to new name '{new_name}' in segment '{segment_id}' of mission network '{mission_network_id}'")
        return sd
    except Exception as e:
        logging.error(f"Repository: Error updating security domain: {str(e)}")
        raise

def delete_security_domain(environment: str, mission_network_id: str, segment_id: str, domain_id: str) -> bool:
    try:
        data = _load_cis_plan(environment)
        mission_networks = data.get('missionNetworks', [])
        mn = _find_mission_network(mission_networks, mission_network_id)
        if not mn:
            return False
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return False
        security_domains = seg.get('securityDomains', [])
        original_len = len(security_domains)
        seg['securityDomains'] = [sd for sd in security_domains if sd.get('id') != domain_id]
        if len(seg['securityDomains']) < original_len:
            _save_cis_plan(environment, data)
            logging.info(f"Repository: Deleted security domain '{domain_id}' from segment '{segment_id}' in mission network '{mission_network_id}'")
            return True
        return False
    except Exception as e:
        logging.error(f"Repository: Error deleting security domain: {str(e)}")
        raise

def _find_network_segment(mn, segment_id):
    return next((seg for seg in mn.get('networkSegments', []) if seg.get('id') == segment_id), None)

def _get_next_global_segment_id(mission_networks):
    max_id = 0
    for network in mission_networks:
        for seg in network.get('networkSegments', []):
            if seg.get('id', '').startswith('NS-'):
                try:
                    num = int(seg['id'].split('-')[1])
                    if num > max_id:
                        max_id = num
                except Exception:
                    continue
    return f"NS-{max_id+1:04d}"

def update_mission_network(environment: str, mission_network_id: str, new_name: str) -> dict:
    try:
        data = _load_cis_plan(environment)
        mission_networks = data.get('missionNetworks', [])
        mn = _find_mission_network(mission_networks, mission_network_id)
        if not mn:
            return None
        mn['name'] = new_name
        _save_cis_plan(environment, data)
        logging.info(f"Repository: Updated mission network '{mission_network_id}' to new name '{new_name}'")
        return mn
    except Exception as e:
        logging.error(f"Repository: Error updating mission network: {str(e)}")
        raise

def delete_mission_network(environment: str, mission_network_id: str) -> bool:
    try:
        data = _load_cis_plan(environment)
        mission_networks = data.get('missionNetworks', [])
        original_len = len(mission_networks)
        data['missionNetworks'] = [mn for mn in mission_networks if mn.get('id') != mission_network_id]
        if len(data['missionNetworks']) < original_len:
            _save_cis_plan(environment, data)
            logging.info(f"Repository: Deleted mission network '{mission_network_id}'")
            return True
        return False
    except Exception as e:
        logging.error(f"Repository: Error deleting mission network: {str(e)}")
        raise

def add_network_segment(environment: str, mission_network_id: str, name: str) -> dict:
    try:
        data = _load_cis_plan(environment)
        mission_networks = data.get('missionNetworks', [])
        mn = _find_mission_network(mission_networks, mission_network_id)
        if not mn:
            return None
        segments = mn.get('networkSegments', [])
        new_id = _get_next_global_segment_id(mission_networks)
        new_guid = str(uuid.uuid4())
        new_seg = {"name": name, "guid": new_guid, "id": new_id}
        segments.append(new_seg)
        mn['networkSegments'] = segments
        _save_cis_plan(environment, data)
        logging.info(f"Repository: Added new network segment '{name}' with id '{new_id}' to mission network '{mission_network_id}'")
        return new_seg
    except Exception as e:
        logging.error(f"Repository: Error adding network segment: {str(e)}")
        raise

def update_network_segment(environment: str, mission_network_id: str, segment_id: str, new_name: str) -> dict:
    try:
        data = _load_cis_plan(environment)
        mission_networks = data.get('missionNetworks', [])
        mn = _find_mission_network(mission_networks, mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        seg['name'] = new_name
        _save_cis_plan(environment, data)
        logging.info(f"Repository: Updated network segment '{segment_id}' to new name '{new_name}' in mission network '{mission_network_id}'")
        return seg
    except Exception as e:
        logging.error(f"Repository: Error updating network segment: {str(e)}")
        raise

def delete_network_segment(environment: str, mission_network_id: str, segment_id: str) -> bool:
    try:
        data = _load_cis_plan(environment)
        mission_networks = data.get('missionNetworks', [])
        mn = _find_mission_network(mission_networks, mission_network_id)
        if not mn:
            return False
        segments = mn.get('networkSegments', [])
        original_len = len(segments)
        mn['networkSegments'] = [seg for seg in segments if seg.get('id') != segment_id]
        if len(mn['networkSegments']) < original_len:
            _save_cis_plan(environment, data)
            logging.info(f"Repository: Deleted network segment '{segment_id}' from mission network '{mission_network_id}'")
            return True
        return False
    except Exception as e:
        logging.error(f"Repository: Error deleting network segment: {str(e)}")
        raise

def add_mission_network(environment: str, name: str) -> dict:
    """
    Add a new mission network to the CIS_Plan.json for the given environment.
    Args:
        environment (str): The environment identifier (e.g., 'dev', 'prod').
        name (str): The name of the new mission network.
    Returns:
        dict: The new mission network object.
    """
    json_file_path = _get_cis_plan_path(environment)
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        mission_networks = data.get('missionNetworks', [])
        # Find the highest MN-XXXX id
        max_id = 0
        for mn in mission_networks:
            if mn.get('id', '').startswith('MN-'):
                try:
                    num = int(mn['id'].split('-')[1])
                    if num > max_id:
                        max_id = num
                except Exception:
                    continue
        new_id = f"MN-{max_id+1:04d}"
        new_guid = str(uuid.uuid4())
        new_mn = {
            "name": name,
            "guid": new_guid,
            "id": new_id,
            "networkSegments": []
        }
        mission_networks.append(new_mn)
        data['missionNetworks'] = mission_networks
        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        logging.info(f"Repository: Added new mission network '{name}' with id '{new_id}' and guid '{new_guid}' to {json_file_path}")
        return new_mn
    except Exception as e:
        logging.error(f"Repository: Error adding mission network: {str(e)}")
        raise


def _get_cis_security_classification_path() -> Path:
    """
    Get the path to the CIS_Security_Classification.json file.
    Returns:
        Path: The path to the CIS_Security_Classification.json file.
    """
    return Path("data/cwix/CIS_Security_Classification.json")


def get_all_cis_security_classification() -> Any:
    """
    Reads the CIS_Security_Classification.json file and returns its contents.
    Returns:
        list or dict: The content of the CIS_Security_Classification.json file.
    """
    json_file_path = _get_cis_security_classification_path()
    logging.info(f"Repository: Attempting to read CIS Security Classification data from: {json_file_path}")
    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        logging.info(f"Repository: JSON loaded successfully. Found {len(data)} items.")
        return data
    except FileNotFoundError:
        logging.error(f"Repository: CIS Security Classification file not found at {json_file_path}")
        return []
    except json.JSONDecodeError:
        logging.error(f"Repository: Invalid JSON in CIS Security Classification file at {json_file_path}")
        return []
    except Exception as e:
        logging.error(f"Repository: Error reading CIS Security Classification file: {str(e)}")
        return []

def _get_cis_plan_path(environment: str) -> Path:
    """
    Get the path to the CIS_Plan.json file.
    Args:
        environment (str, optional): The environment identifier (e.g., 'dev', 'prod').
    Returns:
        Path: The path to the CIS_Plan.json file.
    """
    return get_dynamic_data_path("CIS_Plan.json", environment=environment)

def get_all_cis_plan(environment: str) -> Dict[str, Any]:
    """
    Reads the CIS_Plan.json file using a dynamic path and returns its contents.
    Args:
        environment (str, optional): The environment identifier (e.g., 'dev', 'prod').
    Returns:
        list or dict: The content of the CIS_Plan.json file.
    """
    json_file_path = _get_cis_plan_path(environment)

    # Log the attempt to read
    logging.info(f"Repository: Attempting to read CIS Plan data from: {json_file_path}")

    try:
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Log successful load
        logging.info(f"Repository: JSON loaded successfully. Found {len(data)} items.")
        return data

    except FileNotFoundError:
        logging.error(f"Repository: CIS Plan file not found at {json_file_path}")
        return []
    except json.JSONDecodeError:
        logging.error(f"Repository: Invalid JSON in CIS Plan file at {json_file_path}")
        return []
    except Exception as e:
        logging.error(f"Repository: Error reading CIS Plan file: {str(e)}")
        return []
    
