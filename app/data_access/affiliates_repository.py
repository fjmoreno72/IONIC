import json
import logging
import os
from pathlib import Path
from flask import current_app

# Get the logger instance
logger = logging.getLogger(__name__)

def _get_affiliates_path() -> Path:
    """Constructs the path to the affiliates JSON file."""
    # Use current_app.static_folder which points to the 'static' directory
    # Then navigate to ASC/data/_affiliates.json (renamed file)
    return Path(current_app.static_folder) / "ASC" / "data" / "_affiliates.json"

def get_all_affiliates() -> list:
    """
    Reads affiliate data from the JSON file.

    Returns:
        list: A list of affiliate dictionaries, or an empty list if the file
              doesn't exist or an error occurs.
    """
    affiliates_path = _get_affiliates_path()
    logger.debug(f"Attempting to read affiliates from: {affiliates_path}")

    if not affiliates_path.exists():
        logger.warning(f"Affiliates file not found at {affiliates_path}. Returning empty list.")
        return []

    try:
        with open(affiliates_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if not isinstance(data, list):
                logger.error(f"Affiliates file at {affiliates_path} does not contain a JSON list.")
                return []
            logger.info(f"Successfully read {len(data)} affiliates from {affiliates_path}.")
            return data
    except json.JSONDecodeError:
        logger.exception(f"Error decoding JSON from {affiliates_path}. Returning empty list.")
        return []
    except Exception:
        logger.exception(f"An unexpected error occurred while reading {affiliates_path}. Returning empty list.")
        return []

def save_affiliates(affiliates_data: list):
    """
    Writes the provided affiliate data list to the JSON file.

    Args:
        affiliates_data (list): A list of affiliate dictionaries to save.

    Raises:
        IOError: If there's an error writing to the file.
        TypeError: If affiliates_data is not a list.
    """
    if not isinstance(affiliates_data, list):
        raise TypeError("Data to save must be a list of affiliates.")

    affiliates_path = _get_affiliates_path()
    logger.debug(f"Attempting to save {len(affiliates_data)} affiliates to: {affiliates_path}")

    try:
        # Ensure the directory exists
        os.makedirs(affiliates_path.parent, exist_ok=True)

        with open(affiliates_path, 'w', encoding='utf-8') as f:
            json.dump(affiliates_data, f, indent=2)
        logger.info(f"Successfully saved {len(affiliates_data)} affiliates to {affiliates_path}.")
    except IOError as e:
        logger.exception(f"Could not write affiliates to {affiliates_path}: {e}")
        raise  # Re-raise the exception to be handled by the caller
    except Exception as e:
        logger.exception(f"An unexpected error occurred while saving affiliates to {affiliates_path}: {e}")
        raise IOError(f"An unexpected error occurred while saving affiliates: {e}") from e
