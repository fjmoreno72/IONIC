import json
import os
import logging
from flask import current_app

# Define the relative path to the JSON file
# We define it inside the functions to avoid issues with application context
# during import time.
_ASCS_JSON_FILE = 'ASC/data/_ascs.json' # Updated filename

def get_all_ascs():
    """
    Reads all ASCs data from the JSON file.
    """
    try:
        # Construct the full path using the application's static folder
        json_file_path = os.path.join(current_app.static_folder, _ASCS_JSON_FILE)
        
        # Log that we're attempting to read the file
        import logging
        import datetime
        logging.info(f"[{datetime.datetime.now().isoformat()}] Reading ASCs data from: {json_file_path}")
        
        if not os.path.exists(json_file_path):
            # Return an empty list if the file doesn't exist
            logging.warning(f"ASCs file not found at {json_file_path}")
            return []
        
        # Get file stats for debugging
        file_stats = os.stat(json_file_path)
        last_modified = datetime.datetime.fromtimestamp(file_stats.st_mtime)
        file_size = file_stats.st_size
        logging.info(f"ASCs file stats - Last modified: {last_modified.isoformat()}, Size: {file_size} bytes")
            
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Log details about what we read
        logging.info(f"Successfully loaded {len(data)} ASCs from file")
        if data:
            logging.debug(f"First few ASC IDs loaded: {[asc.get('id') for asc in data[:5]]}")
            
        return data
    except FileNotFoundError:
        logging.error(f"Error: ASCs file not found at {json_file_path}")
        return []
    except json.JSONDecodeError as e:
        logging.error(f"Error: Could not decode JSON from {json_file_path}: {e}")
        return []
    except Exception as e:
        logging.exception(f"An unexpected error occurred while reading ASCs: {e}")
        return []

def save_ascs(ascs_data):
    """
    Saves the entire ASCs data list back to the JSON file.
    """
    try:
        # Construct the full path using the application's static folder
        json_file_path = os.path.join(current_app.static_folder, _ASCS_JSON_FILE)
        
        # Log detailed info about the save operation
        logging.info(f"Saving {len(ascs_data)} ASCs to file: {json_file_path}")
        logging.debug(f"First few ASC IDs being saved: {[asc.get('id') for asc in ascs_data[:5]]}")
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(json_file_path), exist_ok=True)
        
        # Backup the existing file first
        if os.path.exists(json_file_path):
            backup_path = f"{json_file_path}.bak"
            logging.info(f"Creating backup of existing ASCs file at: {backup_path}")
            import shutil
            shutil.copy2(json_file_path, backup_path)
        
        # Write the new data
        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(ascs_data, f, indent=2, ensure_ascii=False)
        
        logging.info(f"Successfully saved ASCs data to: {json_file_path}")
        return True
    except Exception as e:
        logging.exception(f"An unexpected error occurred while saving ASCs: {e}")
        return False

def find_asc_by_id(asc_id):
    """Finds a single ASC by its ID."""
    ascs = get_all_ascs()
    for asc in ascs:
        if asc.get('id') == asc_id:
            return asc
    return None

# Note: Add, Update, Delete logic will be handled in the API route for now,
# as it involves ID generation and potentially more complex updates than
# just saving the whole file. The repository provides the basic load/save.
# If more complex logic is needed repeatedly, it could be moved here later.
