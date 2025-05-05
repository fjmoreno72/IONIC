import json
import os
from flask import current_app

# Path to the JSON file will be determined inside functions using current_app

def get_all_sps():
    """
    Reads all specific products from the JSON file.

    Returns:
        list: A list of specific product dictionaries.
        Returns an empty list if the file doesn't exist or is empty/invalid.
    """
    # Determine path within the function, where app context exists
    json_file_path = os.path.join(current_app.static_folder, 'ASC', 'data', '_sps.json') # Updated filename
    
    try:
        if not os.path.exists(json_file_path):
            current_app.logger.warning(f"SP data file not found at {json_file_path}. Returning empty list.")
            return []
            
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Ensure data is a list, return empty list if not
            return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        current_app.logger.error(f"Error decoding JSON from {json_file_path}. Returning empty list.")
        return []
    except Exception as e:
        current_app.logger.error(f"Error reading SP data file {json_file_path}: {e}")
        return []

def save_sps(sps_data):
    """
    Writes the list of specific products to the JSON file.

    Args:
        sps_data (list): A list of specific product dictionaries to save.

    Raises:
        IOError: If there's an error writing to the file.
        TypeError: If sps_data is not a list.
    """
    # Determine path within the function, where app context exists
    json_file_path = os.path.join(current_app.static_folder, 'ASC', 'data', '_sps.json') # Updated filename
    
    if not isinstance(sps_data, list):
        raise TypeError("sps_data must be a list")
        
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(json_file_path), exist_ok=True)
        
        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(sps_data, f, ensure_ascii=False, indent=2) # Use indent=2 for readability
        current_app.logger.info(f"Successfully saved SP data to {json_file_path}")
    except Exception as e:
        current_app.logger.error(f"Error saving SP data to {json_file_path}: {e}")
        raise

def get_sp_versions_by_id(sp_id):
    """
    Get the list of versions for a specific SP by its ID.
    
    Args:
        sp_id (str): The ID of the specific product (e.g., "SP-0001")
        
    Returns:
        list: A list of version strings for the specified SP.
              Returns an empty list if the SP is not found or has no versions.
    """
    try:
        # Get all SPs
        all_sps = get_all_sps()
        
        # Find the SP with the specified ID
        sp = next((item for item in all_sps if item.get('id') == sp_id), None)
        
        # Return versions if found, empty list otherwise
        if sp and 'versions' in sp and isinstance(sp['versions'], list):
            return sp['versions']
        else:
            return []
    except Exception as e:
        current_app.logger.error(f"Error retrieving versions for SP ID {sp_id}: {e}")
        return []


def get_sp_name_by_id(sp_id):
    """
    Get the name of a specific SP by its ID.
    
    Args:
        sp_id (str): The ID of the specific product (e.g., "SP-0001")
        
    Returns:
        str: The name of the SP if found, None otherwise.
    """
    try:
        # Get all SPs
        all_sps = get_all_sps()
        
        # Find the SP with the specified ID
        sp = next((item for item in all_sps if item.get('id') == sp_id), None)
        
        # Return name if found, None otherwise
        return sp.get('name') if sp else None
    except Exception as e:
        current_app.logger.error(f"Error retrieving name for SP ID {sp_id}: {e}")
        return None


def get_sp_id_by_name(sp_name):
    """
    Get the ID of a specific SP by its name.
    
    Args:
        sp_name (str): The name of the specific product to find
        
    Returns:
        str: The ID of the SP if found, None otherwise.
    """
    try:
        # Get all SPs
        all_sps = get_all_sps()
        
        # Find the SP with the specified name (case-insensitive search)
        sp = next((item for item in all_sps if item.get('name', '').lower() == sp_name.lower()), None)
        
        # Return ID if found, None otherwise
        return sp.get('id') if sp else None
    except Exception as e:
        current_app.logger.error(f"Error retrieving ID for SP name '{sp_name}': {e}")
        return None
