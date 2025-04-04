import json
import os
from flask import current_app

# Path to the JSON file will be determined inside functions using current_app

def get_all_config_items():
    """
    Reads all configuration items from the JSON file.

    Returns:
        list: A list of configuration item dictionaries.
        Returns an empty list if the file doesn't exist or is empty/invalid.
    """
    # Determine path within the function, where app context exists
    json_file_path = os.path.join(current_app.static_folder, 'ASC', 'data', '_configItem.json') # Updated filename
    
    try:
        if not os.path.exists(json_file_path):
            current_app.logger.warning(f"Config Item data file not found at {json_file_path}. Returning empty list.")
            return []
            
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Ensure data is a list, return empty list if not
            return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        current_app.logger.error(f"Error decoding JSON from {json_file_path}. Returning empty list.")
        return []
    except Exception as e:
        current_app.logger.error(f"Error reading Config Item data file {json_file_path}: {e}")
        return []

def save_config_items(config_items_data):
    """
    Writes the list of configuration items to the JSON file.

    Args:
        config_items_data (list): A list of configuration item dictionaries to save.

    Raises:
        IOError: If there's an error writing to the file.
        TypeError: If config_items_data is not a list.
    """
    # Determine path within the function, where app context exists
    json_file_path = os.path.join(current_app.static_folder, 'ASC', 'data', '_configItem.json') # Updated filename
    
    if not isinstance(config_items_data, list):
        raise TypeError("config_items_data must be a list")
        
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(json_file_path), exist_ok=True)
        
        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(config_items_data, f, indent=2) # Use indent=2 for readability
        current_app.logger.info(f"Successfully saved Config Item data to {json_file_path}")
    except IOError as e:
        current_app.logger.error(f"Error writing Config Item data file {json_file_path}: {e}")
        raise
    except Exception as e:
        current_app.logger.error(f"An unexpected error occurred while saving Config Item data: {e}")
        raise
