import json
import os
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
        
        if not os.path.exists(json_file_path):
            # Return an empty list if the file doesn't exist
            return []
            
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        print(f"Error: ASCs file not found at {json_file_path}")
        return []
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {json_file_path}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred while reading ASCs: {e}")
        return []

def save_ascs(ascs_data):
    """
    Saves the entire ASCs data list back to the JSON file.
    """
    try:
        # Construct the full path using the application's static folder
        json_file_path = os.path.join(current_app.static_folder, _ASCS_JSON_FILE)
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(json_file_path), exist_ok=True)
        
        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(ascs_data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"An unexpected error occurred while saving ASCs: {e}")
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
