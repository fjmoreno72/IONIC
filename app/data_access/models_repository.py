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

def create_model(model_data):
    """
    Create a new model and add it to the JSON file.
    
    Args:
        model_data (dict): Model data to add
        
    Returns:
        dict: Created model with generated ID if successful, None otherwise
    """
    models_path = _get_models_path()
    
    # Log the attempt to create
    logging.info(f"Repository: Attempting to create new model at: {models_path}")
    
    try:
        # Load existing models
        models = get_all_models()
        
        # Generate a new ID if not provided
        if 'id' not in model_data or not model_data['id']:
            # Find the highest existing ID and increment
            max_id = 0
            for model in models:
                if 'id' in model and model['id'].startswith('MOD-'):
                    try:
                        id_num = int(model['id'].split('-')[1])
                        max_id = max(max_id, id_num)
                    except ValueError:
                        pass
            
            # Format the new ID
            model_data['id'] = f'MOD-{max_id + 1:04d}'
        
        # Add the new model
        models.append(model_data)
        
        # Save the updated models
        with open(models_path, 'w', encoding='utf-8') as f:
            json.dump(models, f, indent=2)
        
        # Log successful creation
        logging.info(f"Repository: Model created successfully with ID: {model_data['id']}")
        return model_data
    
    except Exception as e:
        logging.error(f"Repository: Error creating model: {str(e)}")
        return None

def update_model(model_id, model_data):
    """
    Update an existing model in the JSON file.
    
    Args:
        model_id (str): ID of the model to update
        model_data (dict): Updated model data
        
    Returns:
        dict: Updated model if successful, None if model not found or error
    """
    models_path = _get_models_path()
    
    # Log the attempt to update
    logging.info(f"Repository: Attempting to update model {model_id} at: {models_path}")
    
    try:
        # Load existing models
        models = get_all_models()
        
        # Find and update the model
        found = False
        for i, model in enumerate(models):
            if model.get('id') == model_id:
                # Ensure ID doesn't change
                model_data['id'] = model_id
                models[i] = model_data
                found = True
                break
        
        if not found:
            logging.warning(f"Repository: Model with ID {model_id} not found for update")
            return None
        
        # Save the updated models
        with open(models_path, 'w', encoding='utf-8') as f:
            json.dump(models, f, indent=2)
        
        # Log successful update
        logging.info(f"Repository: Model {model_id} updated successfully")
        return model_data
    
    except Exception as e:
        logging.error(f"Repository: Error updating model: {str(e)}")
        return None

def delete_model(model_id):
    """
    Delete a model from the JSON file.
    
    Args:
        model_id (str): ID of the model to delete
        
    Returns:
        bool: True if deleted successfully, False otherwise
    """
    models_path = _get_models_path()
    
    # Log the attempt to delete
    logging.info(f"Repository: Attempting to delete model {model_id} at: {models_path}")
    
    try:
        # Load existing models
        models = get_all_models()
        
        # Find and remove the model
        initial_length = len(models)
        models = [model for model in models if model.get('id') != model_id]
        
        if len(models) == initial_length:
            logging.warning(f"Repository: Model with ID {model_id} not found for deletion")
            return False
        
        # Save the updated models
        with open(models_path, 'w', encoding='utf-8') as f:
            json.dump(models, f, indent=2)
        
        # Log successful deletion
        logging.info(f"Repository: Model {model_id} deleted successfully")
        return True
    
    except Exception as e:
        logging.error(f"Repository: Error deleting model: {str(e)}")
        return False
