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

def add_security_domain(environment: str, mission_network_id: str, segment_id: str, id: str) -> dict:
    try:
        data = _load_cis_plan(environment)
        mission_networks = data.get('missionNetworks', [])
        mn = _find_mission_network(mission_networks, mission_network_id)
        if not mn:
            return None # Mission Network not found
        segments = mn.get('networkSegments', [])
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None # Network Segment not found
        
        security_domains = seg.get('securityDomains', [])
        
        # Check if ID already exists (optional but good practice)
        if any(sd.get('id') == id for sd in security_domains):
            logging.warning(f"Repository: Security domain with id '{id}' already exists in segment '{segment_id}'.")
            # Prevent duplicates by raising an error
            raise ValueError(f"Security domain with id '{id}' already exists in segment '{segment_id}'.")
            
        # Remove internal ID and GUID generation
        # new_id = _get_next_global_security_domain_id(security_domains) # Removed
        new_guid = str(uuid.uuid4())
        
        # Create the new security domain object with the provided ID only
        new_sd = {"id": id, "guid": new_guid}
        
        security_domains.append(new_sd)
        seg['securityDomains'] = security_domains
        _save_cis_plan(environment, data)
        logging.info(f"Repository: Added new security domain with id '{id}' to segment '{segment_id}' in mission network '{mission_network_id}'")
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
    Get the path to the CIS_Security_Classification.json file based on the current environment.
    Uses the get_dynamic_data_path utility to handle 'ciav' or 'cwix' environments.
    Returns:
        Path: The path to the CIS_Security_Classification.json file.
    """
    from flask import session
    from app.utils.file_operations import get_dynamic_data_path
    return get_dynamic_data_path("CIS_Security_Classification.json")


def get_all_cis_security_classification() -> Any:
    """
    Reads the CIS_Security_Classification.json file and returns its contents.
    Always reads directly from the file to get the latest data.
    Returns:
        list or dict: The content of the CIS_Security_Classification.json file.
    """
    json_file_path = _get_cis_security_classification_path()
    logging.info(f"Repository: Attempting to read CIS Security Classification data from: {json_file_path}")
    try:
        # Always read fresh data from the file (no caching)
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        logging.info(f"Repository: JSON loaded successfully. Found {len(data.get('securityClassifications', []))} classifications.")
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

# --- HW Stack Functions ---

def _find_hw_stack(stacks, stack_id):
    """Finds an HW stack by its ID within a list of stacks."""
    return next((stack for stack in stacks if stack.get('id') == stack_id), None)

def _find_asset(assets, asset_id):
    return next((asset for asset in assets if asset.get('id') == asset_id), None)

def _get_global_asset_ids(data):
    """Collects all asset IDs across the entire CIS plan data."""
    asset_ids = []
    for mn in data.get('missionNetworks', []):
        for segment in mn.get('networkSegments', []):
            for domain in segment.get('securityDomains', []):
                for stack in domain.get('hwStacks', []):
                    for asset in stack.get('assets', []):
                        asset_id = asset.get('id', '')
                        if asset_id.startswith('AS-'):
                            try:
                                num = int(asset_id[3:])
                                asset_ids.append(num)
                            except ValueError:
                                continue
    return asset_ids

def _get_next_asset_id(data):
    """Get the next available asset ID by scanning the entire tree."""
    asset_ids = _get_global_asset_ids(data)
    max_id = max(asset_ids) if asset_ids else 0
    return f"AS-{max_id + 1:04d}"

def _get_global_hw_stack_ids(data):
    """Collects all HW stack IDs across the entire CIS plan data."""
    hw_ids = []
    for mn in data.get('missionNetworks', []):
        for segment in mn.get('networkSegments', []):
            for domain in segment.get('securityDomains', []):
                for stack in domain.get('hwStacks', []):
                    stack_id = stack.get('id', '')
                    if stack_id.startswith('HW-'):
                        try:
                            num = int(stack_id.split('-')[1])
                            hw_ids.append(num)
                        except Exception:
                            continue
    return hw_ids

def _get_next_global_hw_stack_id(data):
    """Generates the next available HW stack ID (HW-xxxx) by scanning the entire tree."""
    hw_ids = _get_global_hw_stack_ids(data)
    max_id = max(hw_ids) if hw_ids else 0
    return f"HW-{max_id+1:04d}"

def get_all_hw_stacks(environment: str, mission_network_id: str, segment_id: str, domain_id: str):
    """Gets all HW stacks for a given security domain."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return []
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return []
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return []
        return sd.get('hwStacks', [])
    except Exception as e:
        logging.error(f"Repository: Error reading HW stacks: {str(e)}")
        raise

def get_hw_stack(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str):
    """Gets a specific HW stack by its ID."""
    try:
        stacks = get_all_hw_stacks(environment, mission_network_id, segment_id, domain_id)
        return _find_hw_stack(stacks, stack_id)
    except Exception as e:
        logging.error(f"Repository: Error reading HW stack {stack_id}: {str(e)}")
        raise

def add_hw_stack(environment: str, mission_network_id: str, segment_id: str, domain_id: str, name: str, cis_participant_id: str) -> dict:
    """Adds a new HW stack to a security domain."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None # Or raise error
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None

        hw_stacks = sd.setdefault('hwStacks', [])
        # Now using global ID generation
        new_id = _get_next_global_hw_stack_id(data)
        new_guid = str(uuid.uuid4())
        new_stack = {
            "name": name,
            "guid": new_guid,
            "id": new_id,
            "cisParticipantID": cis_participant_id,
            "assets": [] # Initialize with empty assets
        }
        hw_stacks.append(new_stack)
        _save_cis_plan(environment, data)
        logging.info(f"Repository: Added HW stack '{name}' ({new_id}) to domain '{domain_id}'")
        return new_stack
    except Exception as e:
        logging.error(f"Repository: Error adding HW stack: {str(e)}")
        raise

def update_hw_stack(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, name: str, cis_participant_id: str) -> dict:
    """Updates an existing HW stack."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None
        
        hw_stacks = sd.get('hwStacks', [])
        stack = _find_hw_stack(hw_stacks, stack_id)
        if not stack:
            return None

        stack['name'] = name
        stack['cisParticipantID'] = cis_participant_id
        # Potentially update other fields if needed

        _save_cis_plan(environment, data)
        logging.info(f"Repository: Updated HW stack '{stack_id}' in domain '{domain_id}'")
        return stack
    except Exception as e:
        logging.error(f"Repository: Error updating HW stack: {str(e)}")
        raise

def delete_hw_stack(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str) -> bool:
    """Deletes an HW stack."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return False
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return False
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return False

        hw_stacks = sd.get('hwStacks', [])
        original_len = len(hw_stacks)
        sd['hwStacks'] = [stack for stack in hw_stacks if stack.get('id') != stack_id]

        if len(sd['hwStacks']) < original_len:
            _save_cis_plan(environment, data)
            logging.info(f"Repository: Deleted HW stack '{stack_id}' from domain '{domain_id}'")
            return True
        return False
    except Exception as e:
        logging.error(f"Repository: Error deleting HW stack: {str(e)}")
        raise

# --- Asset Functions ---

def add_asset(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, name: str) -> dict:
    """Adds a new asset to a hardware stack."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None
        stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not stack:
            return None

        assets = stack.setdefault('assets', [])
        # Now using global ID generation
        new_id = _get_next_asset_id(data)
        new_guid = str(uuid.uuid4())
        new_asset = {
            "name": name,
            "guid": new_guid,
            "id": new_id,
            "networkInterfaces": [], # Initialize with empty networkInterfaces
            "gpInstances": []       # Initialize with empty gpInstances array
        }
        assets.append(new_asset)
        _save_cis_plan(environment, data)
        logging.info(f"Repository: Added asset '{name}' ({new_id}) to HW stack '{stack_id}'")
        return new_asset
    except Exception as e:
        logging.error(f"Repository: Error adding asset: {str(e)}")
        raise

def update_asset(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, asset_id: str, name: str) -> dict:
    """Updates an existing asset in a hardware stack."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None
        stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not stack:
            return None
        
        assets = stack.get('assets', [])
        asset = _find_asset(assets, asset_id)
        if not asset:
            return None
            
        # Update the asset properties
        asset['name'] = name
        _save_cis_plan(environment, data)
        logging.info(f"Repository: Updated asset '{name}' ({asset_id}) in HW stack '{stack_id}'")
        return asset
    except Exception as e:
        logging.error(f"Repository: Error updating asset: {str(e)}")
        raise

def get_all_assets(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str) -> list:
    """Gets all assets in a hardware stack."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return []
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return []
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return []
        stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not stack:
            return []
        
        return stack.get('assets', [])
    except Exception as e:
        logging.error(f"Repository: Error getting assets: {str(e)}")
        return []

def get_asset(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, asset_id: str) -> dict:
    """Gets a specific asset by ID."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None
        stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not stack:
            return None
        
        assets = stack.get('assets', [])
        return _find_asset(assets, asset_id)
    except Exception as e:
        logging.error(f"Repository: Error getting asset: {str(e)}")
        return None

def delete_asset(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, asset_id: str) -> bool:
    """Deletes an asset from a hardware stack."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return False
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return False
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return False
        stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not stack:
            return False
        
        assets = stack.get('assets', [])
        original_len = len(assets)
        stack['assets'] = [asset for asset in assets if asset.get('id') != asset_id]
        
        if len(stack['assets']) < original_len:
            _save_cis_plan(environment, data)
            logging.info(f"Repository: Deleted asset '{asset_id}' from HW stack '{stack_id}'")
            return True
        return False
    except Exception as e:
        logging.error(f"Repository: Error deleting asset: {str(e)}")
        raise

# --- Network Interface and Configuration Item Functions ---

def _find_network_interface(network_interfaces, interface_id):
    """Finds a network interface by its ID within a list of interfaces."""
    return next((ni for ni in network_interfaces if ni.get('id') == interface_id), None)

def _get_global_network_interface_ids(data):
    """Collects all network interface IDs across the entire CIS plan data."""
    ni_ids = []
    for mn in data.get('missionNetworks', []):
        for segment in mn.get('networkSegments', []):
            for domain in segment.get('securityDomains', []):
                for stack in domain.get('hwStacks', []):
                    for asset in stack.get('assets', []):
                        for ni in asset.get('networkInterfaces', []):
                            ni_id = ni.get('id', '')
                            if ni_id.startswith('NI-'):
                                try:
                                    num = int(ni_id[3:])
                                    ni_ids.append(num)
                                except ValueError:
                                    continue
    return ni_ids

def _get_next_network_interface_id(data):
    """Get the next available network interface ID by scanning the entire tree."""
    ni_ids = _get_global_network_interface_ids(data)
    max_id = max(ni_ids) if ni_ids else 0
    return f"NI-{max_id + 1:04d}"

def add_network_interface(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, asset_id: str, name: str) -> dict:
    """Adds a new network interface to an asset with the three required configurationItems (IP Address, Sub-Net, FQDN)."""
    try:
        import uuid
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return None
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return None
        
        # Initialize the networkInterfaces list if it doesn't exist
        if 'networkInterfaces' not in asset:
            asset['networkInterfaces'] = []
        
        # Create the new network interface with empty configuration items
        new_interface = {
            "name": name,
            "guid": str(uuid.uuid4()),
            "id": _get_next_network_interface_id(data),
            "configurationItems": [
                {
                    "Name": "IP Address",
                    "ConfigurationAnswerType": "Text Field (Single Line)",
                    "AnswerContent": "",
                    "guid": str(uuid.uuid4())
                },
                {
                    "Name": "Sub-Net",
                    "ConfigurationAnswerType": "Text Field (Single Line)",
                    "AnswerContent": "",
                    "guid": str(uuid.uuid4())
                },
                {
                    "Name": "FQDN",
                    "ConfigurationAnswerType": "Text Field (Single Line)",
                    "AnswerContent": "",
                    "guid": str(uuid.uuid4())
                }
            ]
        }
        
        asset['networkInterfaces'].append(new_interface)
        _save_cis_plan(environment, data)
        logging.info(f"Repository: Added network interface '{new_interface['id']}' to asset '{asset_id}'")
        
        return new_interface
    except Exception as e:
        logging.error(f"Repository: Error adding network interface: {str(e)}")
        raise

def get_all_network_interfaces(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, asset_id: str) -> list:
    """Gets all network interfaces in an asset."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return []
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return []
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return []
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return []
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return []
        
        return asset.get('networkInterfaces', [])
    except Exception as e:
        logging.error(f"Repository: Error getting network interfaces: {str(e)}")
        raise

def get_network_interface(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, asset_id: str, interface_id: str) -> dict:
    """Gets a specific network interface by ID."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return None
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return None
        
        return _find_network_interface(asset.get('networkInterfaces', []), interface_id)
    except Exception as e:
        logging.error(f"Repository: Error getting network interface: {str(e)}")
        raise

def update_network_interface(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, asset_id: str, interface_id: str, name: str) -> dict:
    """Updates the name of a network interface."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return None
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return None
        
        network_interface = _find_network_interface(asset.get('networkInterfaces', []), interface_id)
        if not network_interface:
            return None
        
        network_interface['name'] = name
        _save_cis_plan(environment, data)
        logging.info(f"Repository: Updated network interface '{interface_id}' name to '{name}'")
        
        return network_interface
    except Exception as e:
        logging.error(f"Repository: Error updating network interface: {str(e)}")
        raise

def delete_network_interface(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, asset_id: str, interface_id: str) -> bool:
    """Deletes a network interface from an asset."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return False
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return False
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return False
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return False
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return False
        
        network_interfaces = asset.get('networkInterfaces', [])
        original_len = len(network_interfaces)
        asset['networkInterfaces'] = [ni for ni in network_interfaces if ni.get('id') != interface_id]
        
        if len(asset['networkInterfaces']) < original_len:
            _save_cis_plan(environment, data)
            logging.info(f"Repository: Deleted network interface '{interface_id}' from asset '{asset_id}'")
            return True
        return False
    except Exception as e:
        logging.error(f"Repository: Error deleting network interface: {str(e)}")
        raise

def _find_configuration_item(config_items, item_name):
    """Finds a configuration item by its name within a list of configuration items."""
    return next((ci for ci in config_items if ci.get('Name') == item_name), None)

def update_configuration_item(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, asset_id: str, interface_id: str, item_name: str, answer_content: str) -> dict:
    """Updates a specific configuration item (IP Address, Sub-Net, or FQDN) within a network interface."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return None
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return None
        network_interface = _find_network_interface(asset.get('networkInterfaces', []), interface_id)
        if not network_interface:
            return None
        
        # Validate item_name is one of the allowed values
        if item_name not in ["IP Address", "Sub-Net", "FQDN"]:
            logging.error(f"Repository: Invalid configuration item name: {item_name}")
            return None
        
        config_item = _find_configuration_item(network_interface.get('configurationItems', []), item_name)
        if not config_item:
            # If the configuration item doesn't exist, create it
            import uuid
            config_item = {
                "Name": item_name,
                "ConfigurationAnswerType": "Text Field (Single Line)",
                "AnswerContent": "",  # Initialize as empty
                "guid": str(uuid.uuid4())
            }
            if 'configurationItems' not in network_interface:
                network_interface['configurationItems'] = []
            network_interface['configurationItems'].append(config_item)
        
        # Update the answer content
        config_item['AnswerContent'] = answer_content
        
        _save_cis_plan(environment, data)
        logging.info(f"Repository: Updated configuration item '{item_name}' in network interface '{interface_id}' to '{answer_content}'")
        
        return config_item
    except Exception as e:
        logging.error(f"Repository: Error updating configuration item: {str(e)}")
        raise

# --- GP Instance Functions ---

def _find_gp_instance(gp_instances, instance_id):
    """Finds a GP instance by its gpid within a list of GP instances."""
    return next((gpi for gpi in gp_instances if gpi.get('gpid') == instance_id), None)

# GP instance IDs are set from external file, no need for global ID generation

def _populate_gp_instance_config_items(gp_instance, gp_id):
    """
    Populates the configuration items for a GP instance based on its service ID.
    The service ID should match a GP-XXXX format ID in the configuration items catalog.
    
    Args:
        gp_instance (dict): The GP instance to populate with configuration items
        gp_service_id (str): The service ID to look up configuration items for (e.g., 'GP-0034')
    """
    try:
        # Initialize the configuration items array if it doesn't exist
        if 'configurationItems' not in gp_instance:
            gp_instance['configurationItems'] = []
        
        # In a normal API context, try to get config items from the repository
        # During tests, this may not be possible due to application context issues
        try:
            # Only import here to avoid circular imports
            from app.data_access.config_items_repository import get_config_items_by_gp_id
                
            # Get configuration items for this GP ID
            config_items = get_config_items_by_gp_id(gp_id)
            
            # Add each config item to the GP instance
            import uuid
            for catalog_item in config_items:
                # Create a copy of the catalog item with an empty AnswerContent
                new_config_item = {
                    "Name": catalog_item.get("Name", ""),
                    "ConfigurationAnswerType": catalog_item.get("ConfigurationAnswerType", "Text Field (Single Line)"),
                    "AnswerContent": "",  # Initialize as empty
                    "guid": str(uuid.uuid4()),
                    "DefaultValue": catalog_item.get("DefaultValue", ""),
                    "HelpText": catalog_item.get("HelpText", "")
                }
                
                # Add to the GP instance's configuration items
                gp_instance['configurationItems'].append(new_config_item)
        except Exception as context_e:
            # Log the error but continue - this will just create an empty config items array
            logging.warning(f"Could not load config items from catalog: {str(context_e)}")
            # For test environments, do not add mock items, just log the error
            logging.warning(f"Could not load configuration items for GP ID {gp_service_id} in test environment")
        
        return True
    except Exception as e:
        logging.error(f"Error populating GP instance config items: {str(e)}")
        return False

def refresh_gp_instance_config_items(environment: str, mission_network_id: str, segment_id: str, domain_id: str, 
                                    stack_id: str, asset_id: str, instance_id: str) -> dict:
    """
    Refreshes the configuration items for an existing GP instance based on its service ID.
    This adds any new configuration items from the catalog that weren't previously added.
    It does not remove or modify existing items.
    
    Returns:
        The updated GP instance or None if not found or error
    """
    try:
        # Find the GP instance structure
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return None
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return None
            
        # Find the GP instance
        gp_instances = asset.get('gpInstances', [])
        gp_instance = _find_gp_instance(gp_instances, instance_id)
        if not gp_instance:
            return None
            
        # Get the service ID
        service_id = gp_instance.get('serviceId')
        if not service_id:
            return None
        
        # In a normal API context, try to get config items from the repository
        # During tests, this may not be possible due to application context issues
        import uuid
        added = False
        
        # Initialize the configuration items array if it doesn't exist
        if 'configurationItems' not in gp_instance:
            gp_instance['configurationItems'] = []
        
        # Get a list of existing configuration item names
        existing_names = set(item.get('Name', '') for item in gp_instance.get('configurationItems', []))
            
        try:
            # Only import here to avoid circular imports
            from app.data_access.config_items_repository import get_config_items_by_gp_id
            
            # If this is a test service ID, just return the instance as-is
            if service_id.startswith("SV-TEST-"):
                return gp_instance
                
            # Get configuration items for this GP ID
            config_items = get_config_items_by_gp_id(service_id)
            
            # Add each NEW config item to the GP instance
            for catalog_item in config_items:
                name = catalog_item.get("Name", "")
                # Skip if this item already exists
                if name in existing_names:
                    continue
                    
                # Create a copy of the catalog item with an empty AnswerContent
                new_config_item = {
                    "Name": name,
                    "ConfigurationAnswerType": catalog_item.get("ConfigurationAnswerType", "Text Field (Single Line)"),
                    "AnswerContent": "",  # Initialize as empty
                    "guid": str(uuid.uuid4()),
                    "DefaultValue": catalog_item.get("DefaultValue", ""),
                    "HelpText": catalog_item.get("HelpText", "")
                }
                
                # Add to the GP instance's configuration items
                gp_instance['configurationItems'].append(new_config_item)
                added = True
        except Exception as context_e:
            # Log the error but continue - for tests, add some mock items
            logging.warning(f"Could not load config items from catalog: {str(context_e)}")
            
            # For test environments, do not add mock items, just log the error
            logging.warning(f"Could not load configuration items for GP ID {service_id} in test environment")
        
        if added:
            _save_cis_plan(environment, data)
            logging.info(f"Repository: Refreshed config items for GP instance '{instance_id}'")
        
        return gp_instance
    except Exception as e:
        logging.error(f"Repository: Error refreshing GP instance config items: {str(e)}")
        return None

def add_gp_instance(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, asset_id: str, instance_label: str, service_id: str, gp_id: str) -> dict:
    # instance_label is now optional and can be an empty string
    """Adds a new GP instance to an asset with empty spInstances and configurationItems arrays."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return None
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return None
        
        # Initialize the gpInstances list if it doesn't exist
        if 'gpInstances' not in asset:
            asset['gpInstances'] = []
        
        # Create the new GP instance with empty spInstances and an empty configurationItems array
    
        new_gp_instance = {
            "gpid": gp_id,
            "guid": str(uuid.uuid4()),
            "instanceLabel": instance_label,
            "serviceId": service_id,
            "spInstances": [],
            "configurationItems": []
        }
        
        # Populate the configuration items for this GP instance
        _populate_gp_instance_config_items(new_gp_instance, gp_id)
        
        asset['gpInstances'].append(new_gp_instance)
        _save_cis_plan(environment, data)
        logging.info(f"Repository: Added GP instance '{new_gp_instance['gpid']}' to asset '{asset_id}'")
        
        return new_gp_instance
    except Exception as e:
        logging.error(f"Repository: Error adding GP instance: {str(e)}")
        raise

def get_all_gp_instances(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, asset_id: str) -> list:
    """Gets all GP instances in an asset."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return []
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return []
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return []
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return []
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return []
        
        return asset.get('gpInstances', [])
    except Exception as e:
        logging.error(f"Repository: Error getting GP instances: {str(e)}")
        raise

def get_gp_instance(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, asset_id: str, instance_id: str) -> dict:
    """Gets a specific GP instance by ID."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return None
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return None
        
        return _find_gp_instance(asset.get('gpInstances', []), instance_id)
    except Exception as e:
        logging.error(f"Repository: Error getting GP instance: {str(e)}")
        raise

def update_gp_instance(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, asset_id: str, instance_id: str, instance_label: str, service_id: str) -> dict:
    """Updates a GP instance."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return None
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return None
        
        gp_instance = _find_gp_instance(asset.get('gpInstances', []), instance_id)
        if not gp_instance:
            return None
        
        gp_instance['instanceLabel'] = instance_label
        gp_instance['serviceId'] = service_id
        
        _save_cis_plan(environment, data)
        logging.info(f"Repository: Updated GP instance '{instance_id}' in asset '{asset_id}'")
        
        return gp_instance
    except Exception as e:
        logging.error(f"Repository: Error updating GP instance: {str(e)}")
        raise

def delete_gp_instance(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, asset_id: str, instance_id: str) -> bool:
    """Deletes a GP instance from an asset."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return False
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return False
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return False
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return False
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return False
        
        # Find and remove the GP instance
        for i, gp_instance in enumerate(asset.get('gpInstances', [])):
            # Check by id first (which might be an index), then by guid
            if str(gp_instance.get('id')) == instance_id or gp_instance.get('guid') == instance_id:
                deleted_instance = asset['gpInstances'].pop(i)
                _save_cis_plan(environment, data)
                logging.info(f"Repository: Deleted GP instance '{instance_id}' from asset '{asset_id}'")
                return True
        
        return False
    except Exception as e:
        logging.error(f"Repository: Error deleting GP instance: {str(e)}")
        raise

# --- SP Instance Repository Functions ---

def add_sp_instance(environment: str, mission_network_id: str, segment_id: str, domain_id: str, stack_id: str, 
                  asset_id: str, gp_instance_id: str, sp_id: str, sp_version: str) -> dict:
    """Adds a new SP instance to a GP instance."""
    try:
        import uuid
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return None
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return None
        
        # Find the GP instance
        gp_instance = None
        for gpi in asset.get('gpInstances', []):
            if gpi.get('gpid') == gp_instance_id:
                gp_instance = gpi
                break
        
        if not gp_instance:
            return None
        
        # Initialize the spInstances list if it doesn't exist
        if 'spInstances' not in gp_instance:
            gp_instance['spInstances'] = []
        
        # We're now allowing multiple SP instances with the same SP ID
        # This might be useful for having different versions of the same SP
        
        # Create the new SP instance
        new_sp_instance = {
            "guid": str(uuid.uuid4()),
            "spId": sp_id,
            "spVersion": sp_version
        }
        
        gp_instance['spInstances'].append(new_sp_instance)
        _save_cis_plan(environment, data)
        logging.info(f"Repository: Added SP instance '{sp_id}' to GP instance '{gp_instance_id}'")
        
        return new_sp_instance
    except Exception as e:
        logging.error(f"Repository: Error adding SP instance: {str(e)}")
        raise

def get_all_sp_instances(environment: str, mission_network_id: str, segment_id: str, domain_id: str, 
                        stack_id: str, asset_id: str, gp_instance_id: str) -> list:
    """Gets all SP instances in a GP instance."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return []
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return []
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return []
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return []
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return []
        
        # Find the GP instance
        for gpi in asset.get('gpInstances', []):
            if gpi.get('gpid') == gp_instance_id:
                return gpi.get('spInstances', [])
        
        return []
    except Exception as e:
        logging.error(f"Repository: Error getting SP instances: {str(e)}")
        raise

def get_sp_instance(environment: str, mission_network_id: str, segment_id: str, domain_id: str,
                   stack_id: str, asset_id: str, gp_instance_id: str, sp_id: str) -> dict:
    """Gets a specific SP instance by ID."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return None
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return None
        
        # Find the GP instance
        for gpi in asset.get('gpInstances', []):
            if gpi.get('gpid') == gp_instance_id:
                # Find the SP instance
                for spi in gpi.get('spInstances', []):
                    if spi.get('spId') == sp_id:
                        return spi
                break
        
        return None
    except Exception as e:
        logging.error(f"Repository: Error getting SP instance: {str(e)}")
        raise

def update_sp_instance(environment: str, mission_network_id: str, segment_id: str, domain_id: str,
                      stack_id: str, asset_id: str, gp_instance_id: str, sp_id: str, sp_version: str) -> dict:
    """Updates an SP instance in a GP instance."""
    try:
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            return None
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            return None
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            return None
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            return None
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            return None
        
        # Find the GP instance
        for gpi in asset.get('gpInstances', []):
            if gpi.get('gpid') == gp_instance_id:
                # Find the SP instance
                for spi in gpi.get('spInstances', []):
                    if spi.get('spId') == sp_id:
                        # Update the SP instance
                        spi['spVersion'] = sp_version
                        _save_cis_plan(environment, data)
                        logging.info(f"Repository: Updated SP instance '{sp_id}' in GP instance '{gp_instance_id}'")
                        return spi
                break
        
        return None
    except Exception as e:
        logging.error(f"Repository: Error updating SP instance: {str(e)}")
        raise

def delete_sp_instance(environment: str, mission_network_id: str, segment_id: str, domain_id: str,
                       stack_id: str, asset_id: str, gp_instance_id: str, sp_id: str) -> bool:
    """Deletes an SP instance from a GP instance."""
    try:
        logging.info(f"Repository: Starting deletion of SP instance with params: environment={environment}, "
                    f"mission_network_id={mission_network_id}, segment_id={segment_id}, domain_id={domain_id}, "
                    f"stack_id={stack_id}, asset_id={asset_id}, gp_instance_id={gp_instance_id}, sp_id={sp_id}")
        
        data = _load_cis_plan(environment)
        mn = _find_mission_network(data.get('missionNetworks', []), mission_network_id)
        if not mn:
            logging.error(f"Repository: Mission network not found: {mission_network_id}")
            return False
        seg = _find_network_segment(mn, segment_id)
        if not seg:
            logging.error(f"Repository: Network segment not found: {segment_id}")
            return False
        sd = _find_security_domain(seg.get('securityDomains', []), domain_id)
        if not sd:
            logging.error(f"Repository: Security domain not found: {domain_id}")
            return False
        hw_stack = _find_hw_stack(sd.get('hwStacks', []), stack_id)
        if not hw_stack:
            logging.error(f"Repository: HW stack not found: {stack_id}")
            return False
        asset = _find_asset(hw_stack.get('assets', []), asset_id)
        if not asset:
            logging.error(f"Repository: Asset not found: {asset_id}")
            return False
        
        # Find the GP instance
        gp_instance = None
        for gpi in asset.get('gpInstances', []):
            if gpi.get('gpid') == gp_instance_id:
                gp_instance = gpi
                break
                
        if not gp_instance:
            logging.error(f"Repository: GP instance not found: {gp_instance_id}")
            return False
            
        logging.info(f"Repository: Found GP instance. It has {len(gp_instance.get('spInstances', []))} SP instances")
            
        # Find and remove the SP instance
        for i, spi in enumerate(gp_instance.get('spInstances', [])):
            logging.info(f"Repository: Checking SP instance {i}: {spi.get('spId')} against target {sp_id}")
            if spi.get('spId') == sp_id:
                gp_instance['spInstances'].pop(i)
                _save_cis_plan(environment, data)
                logging.info(f"Repository: Successfully deleted SP instance '{sp_id}' from GP instance '{gp_instance_id}'")
                return True
        
        return False
    except Exception as e:
        logging.error(f"Repository: Error deleting SP instance: {str(e)}")
        raise

# --- Network Segment Functions ---

def _find_network_segment(mn, segment_id):
    return next((seg for seg in mn.get('networkSegments', []) if seg.get('id') == segment_id), None)
