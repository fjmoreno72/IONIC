"""
Models repository module.
Handles data access for models data.
"""
import json
import logging
from pathlib import Path
from flask import current_app

def _get_models_path():
    """Get the path to the models JSON file."""
    # Use the static folder from the app
    static_folder = Path(current_app.static_folder)
    return static_folder / "ASC" / "data" / "_models.json"

def get_all_models():
    """
    Get all models from the JSON file.
    
    Returns:
        list: List of model objects
    """
    models_path = _get_models_path()
    
    # Log the attempt to read
    logging.info(f"Repository: Attempting to read models data from: {models_path}")
    
    try:
        with open(models_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Log successful load
        logging.info(f"Repository: JSON loaded successfully. Found {len(data)} items.")
        return data
    except FileNotFoundError:
        logging.error(f"Repository: Models file not found at {models_path}")
        return []
    except json.JSONDecodeError:
        logging.error(f"Repository: Invalid JSON in models file at {models_path}")
        return []
    except Exception as e:
        logging.error(f"Repository: Error reading models file: {str(e)}")
        return []
