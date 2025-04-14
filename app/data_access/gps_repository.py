import json
import os
import logging
from pathlib import Path
from flask import current_app

# Get a logger instance for this module
logger = logging.getLogger(__name__)

def _get_gps_path():
    """Get the path to the GPs JSON file."""
    # Use the static folder from the app
    static_folder = Path(current_app.static_folder)
    return static_folder / "ASC" / "data" / "_gps.json"

def get_all_gps():
    """Reads all GP data from the JSON file.
    
    Returns:
        list: List of GP objects
    """
    gps_path = _get_gps_path()
    
    # Log the attempt to read
    logger.info(f"Repository: Attempting to read GP data from: {gps_path}")
    
    try:
        with open(gps_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Log successful load
        logger.info(f"Repository: JSON loaded successfully. Found {len(data)} items.")
        return data
    except FileNotFoundError:
        logger.error(f"Repository: GPs file not found at {gps_path}")
        return []
    except json.JSONDecodeError as e:
        logger.error(f"Repository: Invalid JSON in GPs file at {gps_path}. Error: {e}")
        return []
    except Exception as e:
        logger.error(f"Repository: Error reading GPs file: {str(e)}")
        return []


def save_gps(data):
    """Saves the entire GP data list to the JSON file.
    
    Args:
        data (list): List of GP data to save
        
    Returns:
        bool: True if saved successfully, False otherwise
    """
    gps_path = _get_gps_path()
    
    # Log the attempt to save
    logger.info(f"Repository: Attempting to save GP data to: {gps_path}")
    
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(gps_path), exist_ok=True)
        
        with open(gps_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        # Log successful save
        logger.info(f"Repository: Successfully saved {len(data)} items to {gps_path}")
        return True
    except Exception as e:
        logger.error(f"Repository: Error saving GPs file: {str(e)}")
        return False

def create_gp(gp_data):
    """Create a new GP and add it to the JSON file.
    
    Args:
        gp_data (dict): GP data to add
        
    Returns:
        dict: Created GP with generated ID if successful, None otherwise
    """
    gps_path = _get_gps_path()
    
    # Log the attempt to create
    logger.info(f"Repository: Attempting to create new GP at: {gps_path}")
    
    try:
        # Load existing GPs
        gps = get_all_gps()
        
        # Generate a new ID if not provided
        if 'id' not in gp_data or not gp_data['id']:
            # Find the highest existing ID and increment
            max_id = 0
            for gp in gps:
                if 'id' in gp and gp['id'].startswith('GP-'):
                    try:
                        id_num = int(gp['id'].split('-')[1])
                        max_id = max(max_id, id_num)
                    except ValueError:
                        pass
            
            # Format the new ID
            gp_data['id'] = f"GP-{max_id + 1:04d}"
        
        # Add the new GP
        gps.append(gp_data)
        
        # Save the updated GPs
        success = save_gps(gps)
        
        if success:
            # Log successful creation
            logger.info(f"Repository: GP created successfully with ID: {gp_data['id']}")
            return gp_data
        else:
            logger.error(f"Repository: Failed to save GP data after adding new GP")
            return None
        
    except Exception as e:
        logger.error(f"Repository: Error creating GP: {str(e)}")
        return None

def update_gp(gp_id, gp_data):
    """Update an existing GP in the JSON file.
    
    Args:
        gp_id (str): ID of the GP to update
        gp_data (dict): Updated GP data
        
    Returns:
        dict: Updated GP if successful, None if GP not found or error
    """
    gps_path = _get_gps_path()
    
    # Log the attempt to update
    logger.info(f"Repository: Attempting to update GP {gp_id} at: {gps_path}")
    
    try:
        # Load existing GPs
        gps = get_all_gps()
        
        # Find and update the GP
        found = False
        for i, gp in enumerate(gps):
            if gp.get('id') == gp_id:
                # Ensure ID doesn't change
                gp_data['id'] = gp_id
                gps[i] = gp_data
                found = True
                break
        
        if not found:
            logger.warning(f"Repository: GP with ID {gp_id} not found for update")
            return None
        
        # Save the updated GPs
        success = save_gps(gps)
        
        if success:
            # Log successful update
            logger.info(f"Repository: GP {gp_id} updated successfully")
            return gp_data
        else:
            logger.error(f"Repository: Failed to save GP data after updating GP {gp_id}")
            return None
        
    except Exception as e:
        logger.error(f"Repository: Error updating GP: {str(e)}")
        return None

def delete_gp(gp_id):
    """Delete a GP from the JSON file.
    
    Args:
        gp_id (str): ID of the GP to delete
        
    Returns:
        bool: True if deleted successfully, False otherwise
    """


def get_gp_name_by_id(gp_id):
    """Get the name of a GP by its ID.
    
    Args:
        gp_id (str): ID of the GP to find
        
    Returns:
        str: Name of the GP if found, None otherwise
    """
    gps_path = _get_gps_path()
    
    # Log the attempt to find the GP
    logger.info(f"Repository: Attempting to find GP name for ID {gp_id} from: {gps_path}")
    
    try:
        # Load existing GPs
        gps = get_all_gps()
        
        # Find the GP with the matching ID
        for gp in gps:
            if gp.get('id') == gp_id:
                gp_name = gp.get('name')
                logger.info(f"Repository: Found GP name '{gp_name}' for ID {gp_id}")
                return gp_name
        
        # If we get here, the GP was not found
        logger.warning(f"Repository: GP with ID {gp_id} not found")
        return None
        
    except Exception as e:
        logger.error(f"Repository: Error finding GP name for ID {gp_id}: {str(e)}")
        return None
