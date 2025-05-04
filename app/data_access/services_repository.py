import json
import logging
import os
from pathlib import Path
from typing import List, Optional
from flask import current_app

# Get the logger instance
logger = logging.getLogger(__name__)

def _get_services_path() -> Path:
    """Constructs the path to the services JSON file."""
    # Use current_app.static_folder which points to the 'static' directory
    # Then navigate to ASC/data/_servicesm.json (migrated file with models)
    return Path(current_app.static_folder) / "ASC" / "data" / "_servicesm.json"


def get_service_gps_all(service_id: str) -> List[str]:
    """
    Get all GP IDs that are in a specific service, regardless of model support.
    
    Args:
        service_id (str): The ID of the service to search for
        
    Returns:
        List[str]: A list of all GP IDs in the service
    """
    try:
        # Get the path to the services JSON file
        services_path = _get_services_path()
        
        # Check if the file exists
        if not services_path.exists():
            logger.error(f"Services file not found at {services_path}")
            return []
        
        # Load the services data
        with open(services_path, 'r', encoding='utf-8') as f:
            services_data = json.load(f)
        
        # Find the service with the matching ID
        service = next((s for s in services_data if s.get('id') == service_id), None)
        if not service:
            logger.warning(f"Service with ID {service_id} not found")
            return []
        
        # Get all GP IDs in the service without filtering by model
        gp_ids = [gp.get('id') for gp in service.get('gps', []) if 'id' in gp]
        
        return gp_ids
    
    except Exception as e:
        logger.error(f"Error getting all GPs for service {service_id}: {str(e)}")
        return []


def get_service_gps(service_id: str, model_id: str) -> List[str]:
    """
    Get a list of GP IDs that are in a specific service and support a specific model.
    
    Args:
        service_id (str): The ID of the service to search for
        model_id (str): The ID of the model to filter GPs by
        
    Returns:
        List[str]: A list of GP IDs that match the criteria
    """
    try:
        # Get the path to the services JSON file
        services_path = _get_services_path()
        
        # Check if the file exists
        if not services_path.exists():
            logger.error(f"Services file not found at {services_path}")
            return []
        
        # Load the services data
        with open(services_path, 'r', encoding='utf-8') as f:
            services_data = json.load(f)
        
        # Find the service with the matching ID
        service = next((s for s in services_data if s.get('id') == service_id), None)
        if not service:
            logger.warning(f"Service with ID {service_id} not found")
            return []
        
        # Check if the service supports the specified model
        if model_id not in service.get('models', []):
            logger.warning(f"Service {service_id} does not support model {model_id}")
            return []
        
        # Get all GPs in the service that support the specified model
        gp_ids = []
        for gp in service.get('gps', []):
            if model_id in gp.get('models', []):
                gp_ids.append(gp.get('id'))
        
        return gp_ids
    
    except Exception as e:
        logger.error(f"Error getting GPs for service {service_id} and model {model_id}: {str(e)}")
        return []

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

def get_service_id_by_name(service_name: str) -> str:
    """
    Get the service ID by its name.
    
    Args:
        service_name (str): The name of the service to look up
        
    Returns:
        str: The service ID if found, or an empty string if not found
    """
    services = get_all_services()
    
    for service in services:
        if service.get('name') == service_name:
            return service.get('id', '')
    
    logger.warning(f"No service found with name: {service_name}")
    return ''

def get_service_name_by_id(service_id: str) -> str:
    """
    Get the service name by its ID.
    
    Args:
        service_id (str): The ID of the service to look up
        
    Returns:
        str: The service name if found, or an empty string if not found
    """
    services = get_all_services()
    
    for service in services:
        if service.get('id') == service_id:
            return service.get('name', '')
    
    logger.warning(f"No service found with ID: {service_id}")
    return ''
