import json
import os
import logging # Import logging module
# Removed current_app import as it's no longer needed here
from flask import jsonify 

# Removed _get_file_path function

# Get a logger instance for this module
logger = logging.getLogger(__name__)

def get_all_gps(json_file_path):
    """Reads all GP data from the specified JSON file path."""
    # Use the provided file path directly
    logger.info(f"Repository: Attempting to read GP data from: {json_file_path}") # Use logger
    try:
        if not os.path.exists(json_file_path):
            # If the file doesn't exist, log a warning and return an empty list
            logger.warning(f"Repository: GP data file not found at expected path: {json_file_path}") # Use logger
            return []
        logger.debug(f"Repository: File found at {json_file_path}. Attempting to open and read...") # Use logger (debug level)
        with open(json_file_path, 'r', encoding='utf-8') as f:
            logger.debug(f"Repository: File opened successfully. Attempting to load JSON...") # Use logger (debug level)
            data = json.load(f)
            logger.info(f"Repository: JSON loaded successfully. Found {len(data)} items.") # Use logger
        return data
    except FileNotFoundError: # This path should ideally not be reached if os.path.exists works
        logger.error(f"Repository: FileNotFoundError encountered for {json_file_path}", exc_info=True) # Use logger
        return []
    except json.JSONDecodeError as e:
        # Log JSON decoding errors specifically
        logger.error(f"Repository: Could not decode JSON from {json_file_path}. Error: {e}", exc_info=True) # Use logger
        return []
    except IOError as e:
        # Log file I/O errors (e.g., permissions)
        logger.error(f"Repository: IOError reading file {json_file_path}. Error: {e}", exc_info=True) # Use logger
        return []
    except Exception as e:
        # Log other general errors during file read/parse
        logger.error(f"Repository: An unexpected error occurred in get_all_gps after finding the file: {e}", exc_info=True) # Use logger
        return []


def save_gps(data, json_file_path):
    """Saves the entire GP data list to the specified JSON file path."""
    # Use the provided file path directly
    logger.info(f"Repository: Attempting to save GP data to: {json_file_path}") # Use logger
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(json_file_path), exist_ok=True)
        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            logger.info(f"Repository: Successfully saved {len(data)} items to {json_file_path}") # Use logger
        return True
    except IOError as e:
        # Log error or handle appropriately
        logger.error(f"Repository: Error writing to file {json_file_path}: {e}", exc_info=True) # Use logger
        return False
    except Exception as e:
        # Log general errors during save
        logger.error(f"Repository: An unexpected error occurred in save_gps: {e}", exc_info=True) # Use logger
        return False

# Note: Specific functions for add, update, delete by ID might be added later
# if finer-grained control is needed beyond just saving the whole dataset.
# For now, mirroring the structure used for other entities.
