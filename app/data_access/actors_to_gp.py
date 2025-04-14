"""
Actors to GP repository module.
Handles data access for actor to GP mapping data.
"""
import json
import logging
from pathlib import Path
from datetime import datetime, timedelta
from flask import current_app
from app.utils.file_operations import get_dynamic_data_path
from app.data_access.services_repository import get_service_id_by_name
from app.routes.api import get_actor_key_from_name

def get_actor_to_gp_path():
    """Get the path to the actor to GP JSON file."""
    # Use the static folder from the app
    static_folder = Path(current_app.static_folder)
    return static_folder / "ASC" / "data" / "_actor_to_gp.json"

def regenerate_actor_to_gp_file(force_regenerate=False):
    """
    Regenerate the actor to GP JSON file using data from service_actors.json.
    
    This function reads the service_actors.json file and updates the actor to GP
    mapping file with the latest data.
    
    Args:
        force_regenerate (bool): If True, will clear existing actors and regenerate them
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Get the path to the service_actors.json file
        service_actors_path = get_dynamic_data_path("service_actors.json")
        
        # Log the path for debugging
        logging.info(f"Service actors path: {service_actors_path}")
        print(f"Service actors path: {service_actors_path}")
        
        # 1. Read service_actors.json
        with open(service_actors_path, 'r', encoding='utf-8') as f:
            service_actors_data = json.load(f)
        
        # Get the current actor to GP data
        actor_gp_path = get_actor_to_gp_path()
        try:
            with open(actor_gp_path, 'r', encoding='utf-8') as f:
                actor_gp_data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            # Initialize with empty structure if file doesn't exist or is invalid
            actor_gp_data = {"services": []}
        
        # Get the existing services from actor_gp_data
        existing_services = actor_gp_data.get("services", [])
        
        # Ensure each existing service has an actors list
        for service in existing_services:
            if "actors" not in service:
                service["actors"] = []
                logging.info(f"Initialized empty actors list for service {service.get('service_name', 'Unknown')}")
            elif force_regenerate:
                # Clear existing actors if force_regenerate is True
                service["actors"] = []
                logging.info(f"Cleared actors list for service {service.get('service_name', 'Unknown')} for regeneration")
        
        existing_service_ids = [service.get("service_id") for service in existing_services]
        
        # Process each service in service_actors.json
        services_added = 0
        actors_added = 0
        for service_key, actors in service_actors_data.items():
            # Extract service name by removing everything up to the first underscore
            if "_" in service_key:
                service_name = service_key.split("_", 1)[1]
            else:
                service_name = service_key
                logging.warning(f"Service key '{service_key}' does not contain an underscore")
            
            # Get service ID from the name
            service_id = get_service_id_by_name(service_name)
            
            if not service_id:
                logging.warning(f"Could not find service ID for name: '{service_name}'")
                continue
            
            # Check if service already exists in actor_gp_data
            if service_id in existing_service_ids:
                # Find the existing service
                existing_service = next((s for s in existing_services if s.get("service_id") == service_id), None)
                
                # Ensure it has an actors list
                if existing_service and "actors" not in existing_service:
                    existing_service["actors"] = []
                    logging.info(f"Initialized empty actors list for existing service '{service_name}' (ID: {service_id})")
                
                # Add actors to the existing service
                logging.info(f"Adding actors to existing service '{service_name}' (ID: {service_id})")
                for actor_name in actors:
                    #print(f"Adding actor: {actor_name}")
                    # Look up the actor key using the actor name
                    actor_key = get_actor_key_from_name(actor_name)
                    
                    # If no key is found, use a placeholder
                    if not actor_key:
                        actor_key = "KEY-NOT-FOUND"
                        logging.warning(f"Could not find actor key for name: '{actor_name}'")
                    
                    # Check if actor already exists in this service
                    actor_exists = False
                    for actor in existing_service["actors"]:
                        if actor.get("actor_name") == actor_name:
                            actor_exists = True
                            # Update the last update timestamp for existing actor
                            actor["actor_last_update"] = datetime.now().isoformat()
                            break
                    
                    if not actor_exists:
                        existing_service["actors"].append({
                            "actor_key": actor_key,
                            "actor_name": actor_name,
                            "actor_last_update": datetime.now().isoformat()
                            # Note: No GPs added initially
                        })
                        actors_added += 1
                        logging.info(f"Added actor '{actor_name}' to service '{service_name}'")
                
                continue
            
            # Create new service entry
            new_service = {
                "service_id": service_id,
                "service_name": service_name,
                "model_id": "MOD-0001",  # Default model ID
                "model_name": "SP5",  # Default model name  
                "actors": []
            }
            
            # Add actors to the service
            for actor_name in actors:
                print(actor_name)
                # Look up the actor key using the actor name
                actor_key = get_actor_key_from_name(actor_name)
                
                # If no key is found, use a placeholder
                if not actor_key:
                    actor_key = "KEY-NOT-FOUND"
                    logging.warning(f"Could not find actor key for name: '{actor_name}'")
                
                new_service["actors"].append({
                    "actor_key": actor_key,
                    "actor_name": actor_name,
                    "actor_last_update": datetime.now().isoformat()
                    # Note: No GPs added initially
                })
                actors_added += 1
            
            # Add the new service to the data
            existing_services.append(new_service)
            services_added += 1
        
        # Update the services in the data
        actor_gp_data["services"] = existing_services
        
        # Write the updated data back to the file
        with open(actor_gp_path, 'w', encoding='utf-8') as f:
            json.dump(actor_gp_data, f, indent=2)
        
        logging.info(f"Successfully regenerated actor to GP file. Added {services_added} new services and {actors_added} new actors.")
        print(f"Successfully regenerated actor to GP file. Added {services_added} new services and {actors_added} new actors.")
        
        return True
    except Exception as e:
        logging.error(f"Error regenerating actor to GP file: {str(e)}")
        print(f"Error regenerating actor to GP file: {str(e)}")
        return False

def get_all_actor_gp():
    """
    Get all actor to GP mappings from the JSON file.
    
    Returns:
        dict: Dictionary containing services with actor to GP mappings
    """
    actor_gp_path = get_actor_to_gp_path()
    
    # Log the attempt to read
    logging.info(f"Repository: Attempting to read actor to GP data from: {actor_gp_path}")
    
    try:
        with open(actor_gp_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Log successful load
        logging.info(f"Repository: JSON loaded successfully. Found {len(data.get('services', []))} services.")
        return data
    except FileNotFoundError:
        logging.error(f"Repository: Actor to GP file not found at {actor_gp_path}")
        return {"services": []}
    except json.JSONDecodeError:
        logging.error(f"Repository: Invalid JSON in actor to GP file at {actor_gp_path}")
        return {"services": []}
    except Exception as e:
        logging.error(f"Repository: Error reading actor to GP file: {str(e)}")
        return {"services": []}

def update_actor_to_gp(service_id, model_id, actor_key, gps):
    """
    Update the GP list for a specific actor in a service.
    Only updates if the service_id, model_id, and actor_key all exist.
    
    Args:
        service_id (str): ID of the service
        model_id (str): ID of the model
        actor_key (str): Key of the actor
        gps (list): List of GP objects with id and name
        
    Returns:
        bool: True if updated successfully, False if any entity doesn't exist or on error
    """
    actor_gp_path = get_actor_to_gp_path()
    
    # Log the attempt to update
    logging.info(f"Repository: Attempting to update GPs for actor {actor_key} in service {service_id}")
    
    try:
        # Load existing data
        data = get_all_actor_gp()
        services = data.get('services', [])
        
        # Find the service
        service_found = False
        for service in services:
            if service.get('service_id') == service_id:
                service_found = True
                
                # Check if model_id matches
                if service.get('model_id') != model_id:
                    logging.warning(f"Repository: Model ID mismatch for service {service_id}. Expected {model_id}, found {service.get('model_id')}")
                    return False
                
                # Find the actor
                actors = service.get('actors', [])
                actor_found = False
                
                for i, actor in enumerate(actors):
                    if actor.get('actor_key') == actor_key:
                        # Update the GPs for this actor
                        actor['gps'] = gps
                        actor_found = True
                        break
                
                # If actor not found, return False
                if not actor_found:
                    logging.warning(f"Repository: Actor {actor_key} not found in service {service_id}")
                    return False
                
                break
        
        # If service not found, return False
        if not service_found:
            logging.warning(f"Repository: Service {service_id} not found")
            return False
        
        # Save the updated data
        with open(actor_gp_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        
        # Log successful update
        logging.info(f"Repository: GPs for actor {actor_key} in service {service_id} updated successfully")
        print(f"Repository: GPs for actor {actor_key} in service {service_id} updated successfully")
        return True
    
    except Exception as e:
        logging.error(f"Repository: Error updating actor to GP mapping: {str(e)}")
        return False

def delete_gp_from_actor(service_id, model_id, actor_key, gp_id=None):
    """
    Delete all GPs associated with a specific actor in a service.
    Only deletes if the service_id, model_id, and actor_key all exist.
    
    Args:
        service_id (str): ID of the service
        model_id (str): ID of the model
        actor_key (str): Key of the actor
        gp_id (str, optional): ID of the GP to delete. If None, all GPs are deleted.
        
    Returns:
        bool: True if deleted successfully, False if any entity doesn't exist or on error
    """
    actor_gp_path = get_actor_to_gp_path()
    
    # Log the attempt to delete
    logging.info(f"Repository: Attempting to delete GPs for actor {actor_key} in service {service_id}")
    
    try:
        # Load existing data
        data = get_all_actor_gp()
        services = data.get('services', [])
        
        # Find the service
        service_found = False
        for service in services:
            if service.get('service_id') == service_id:
                service_found = True
                
                # Check if model_id matches
                if service.get('model_id') != model_id:
                    logging.warning(f"Repository: Model ID mismatch for service {service_id}. Expected {model_id}, found {service.get('model_id')}")
                    return False
                
                # Find the actor
                actors = service.get('actors', [])
                actor_found = False
                
                for i, actor in enumerate(actors):
                    if actor.get('actor_key') == actor_key:
                        actor_found = True
                        # If gp_id is provided, only delete that specific GP
                        if gp_id is not None and 'gps' in actor:
                            gps = actor.get('gps', [])
                            gp_found = False
                            # Filter out the specific GP
                            actor['gps'] = [gp for gp in gps if gp.get('gp_id') != gp_id]
                            # Check if any GP was removed
                            if len(actor['gps']) < len(gps):
                                gp_found = True
                            if not gp_found:
                                logging.warning(f"Repository: GP {gp_id} not found for actor {actor_key} in service {service_id}")
                                return False
                        # If gp_id is None, remove all GPs for this actor
                        elif 'gps' in actor:
                            del actor['gps']
                        break
                
                # If actor not found, return False
                if not actor_found:
                    logging.warning(f"Repository: Actor {actor_key} not found in service {service_id}")
                    return False
                
                break
        
        # If service not found, return False
        if not service_found:
            logging.warning(f"Repository: Service {service_id} not found")
            return False
        
        # Save the updated data
        with open(actor_gp_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        
        # Log successful deletion
        if gp_id is not None:
            logging.info(f"Repository: GP {gp_id} for actor {actor_key} in service {service_id} deleted successfully")
            print(f"Repository: GP {gp_id} for actor {actor_key} in service {service_id} deleted successfully")
        else:
            logging.info(f"Repository: All GPs for actor {actor_key} in service {service_id} deleted successfully")
            print(f"Repository: GPs for actor {actor_key} in service {service_id} deleted successfully")
        return True
    
    except Exception as e:
        logging.error(f"Repository: Error deleting GPs from actor: {str(e)}")
        return False


def clean_old_actors(minutes=60):
    """
    Clean up actors that haven't been updated in the last X minutes.
    
    Args:
        minutes (int): Number of minutes to consider an actor as old if not updated within this time
        
    Returns:
        bool: True if successful, False otherwise
        int: Number of actors removed
    """
    try:
        # Get the current actor to GP data
        actor_gp_path = get_actor_to_gp_path()
        
        try:
            with open(actor_gp_path, 'r', encoding='utf-8') as f:
                actor_gp_data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            logging.error("Could not read actor to GP file for cleaning old actors")
            return False, 0
        
        # Get the existing services
        existing_services = actor_gp_data.get("services", [])
        
        # Calculate the cutoff time
        cutoff_time = datetime.now() - timedelta(minutes=minutes)
        cutoff_time_str = cutoff_time.isoformat()
        
        total_actors_removed = 0
        
        # Process each service
        for service in existing_services:
            actors = service.get("actors", [])
            initial_actor_count = len(actors)
            
            # Filter out old actors
            updated_actors = []
            for actor in actors:
                last_update = actor.get("actor_last_update")
                
                # Keep actors only if they have a last_update field AND their last_update is newer than the cutoff time
                # Actors without a last_update field are considered old and will be removed
                if last_update and last_update > cutoff_time_str:
                    updated_actors.append(actor)
            
            # Update the actors list
            service["actors"] = updated_actors
            
            # Count removed actors
            actors_removed = initial_actor_count - len(updated_actors)
            total_actors_removed += actors_removed
            
            if actors_removed > 0:
                logging.info(f"Removed {actors_removed} old actors from service {service.get('service_name', 'Unknown')}")
        
        # Write the updated data back to the file
        with open(actor_gp_path, 'w', encoding='utf-8') as f:
            json.dump(actor_gp_data, f, indent=2)
        
        logging.info(f"Successfully cleaned up old actors. Removed {total_actors_removed} actors.")
        return True, total_actors_removed
    
    except Exception as e:
        logging.error(f"Error cleaning up old actors: {str(e)}")
        return False, 0
