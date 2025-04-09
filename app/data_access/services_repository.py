import json
import logging
import os
from pathlib import Path
from flask import current_app

# Get the logger instance
logger = logging.getLogger(__name__)

def _get_services_path() -> Path:
    """Constructs the path to the services JSON file."""
    # Use current_app.static_folder which points to the 'static' directory
    # Then navigate to ASC/data/_servicesm.json (migrated file with models)
    return Path(current_app.static_folder) / "ASC" / "data" / "_servicesm.json"

def get_all_services() -> list:
    """
    Reads service data from the JSON file.

    Returns:
        list: A list of service dictionaries, or an empty list if the file
              doesn't exist or an error occurs.
    """
    services_path = _get_services_path()
    logger.debug(f"Attempting to read services from: {services_path}")

    if not services_path.exists():
        logger.warning(f"Services file not found at {services_path}. Returning empty list.")
        return []

    try:
        with open(services_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if not isinstance(data, list):
                logger.error(f"Services file at {services_path} does not contain a JSON list.")
                return []
            logger.info(f"Successfully read {len(data)} services from {services_path}.")
            return data
    except json.JSONDecodeError:
        logger.exception(f"Error decoding JSON from {services_path}. Returning empty list.")
        return []
    except Exception:
        logger.exception(f"An unexpected error occurred while reading {services_path}. Returning empty list.")
        return []

def save_services(services_data: list):
    """
    Writes the provided service data list to the JSON file.

    Args:
        services_data (list): A list of service dictionaries to save.

    Raises:
        IOError: If there's an error writing to the file.
        TypeError: If services_data is not a list.
    """
    if not isinstance(services_data, list):
        raise TypeError("Data to save must be a list of services.")

    services_path = _get_services_path()
    logger.debug(f"Attempting to save {len(services_data)} services to: {services_path}")

    try:
        # Ensure the directory exists
        os.makedirs(services_path.parent, exist_ok=True)

        with open(services_path, 'w', encoding='utf-8') as f:
            json.dump(services_data, f, indent=2)
        logger.info(f"Successfully saved {len(services_data)} services to {services_path}.")
    except IOError as e:
        logger.exception(f"Could not write services to {services_path}: {e}")
        raise  # Re-raise the exception to be handled by the caller
    except Exception as e:
        logger.exception(f"An unexpected error occurred while saving services to {services_path}: {e}")
        raise IOError(f"An unexpected error occurred while saving services: {e}") from e
