import json
import os
from flask import current_app, jsonify

# Define the relative path to the JSON file
# We define it inside the functions to avoid issues with application context
# during import time.
_LINKS_JSON_FILE = 'ASC/data/_links.json' # Updated filename

def get_all_links():
    """
    Reads all links data from the JSON file.
    """
    try:
        # Construct the full path using the application's static folder
        json_file_path = os.path.join(current_app.static_folder, _LINKS_JSON_FILE)
        
        if not os.path.exists(json_file_path):
            # Return an empty list if the file doesn't exist
            return []
            
        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        # Log error or handle as appropriate
        print(f"Error: Links file not found at {json_file_path}")
        return []
    except json.JSONDecodeError:
        # Log error or handle as appropriate
        print(f"Error: Could not decode JSON from {json_file_path}")
        return []
    except Exception as e:
        # Log general errors
        print(f"An unexpected error occurred while reading links: {e}")
        return []

def save_links(links_data):
    """
    Saves the entire links data list back to the JSON file.
    """
    try:
        # Construct the full path using the application's static folder
        json_file_path = os.path.join(current_app.static_folder, _LINKS_JSON_FILE)
        
        # Ensure the directory exists
        os.makedirs(os.path.dirname(json_file_path), exist_ok=True)
        
        with open(json_file_path, 'w', encoding='utf-8') as f:
            json.dump(links_data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        # Log error
        print(f"An unexpected error occurred while saving links: {e}")
        return False

def find_link_by_id(link_id):
    """Finds a single link by its ID."""
    links = get_all_links()
    for link in links:
        if link.get('id') == link_id:
            return link
    return None

def add_link(new_link_data):
    """Adds a new link to the list and saves."""
    links = get_all_links()
    # Basic validation: check if ID already exists
    if find_link_by_id(new_link_data.get('id')):
        raise ValueError(f"Link with ID {new_link_data.get('id')} already exists.")
    links.append(new_link_data)
    return save_links(links)

def update_link(updated_link_data):
    """Updates an existing link identified by ID."""
    links = get_all_links()
    link_id_to_update = updated_link_data.get('id')
    if not link_id_to_update:
        raise ValueError("Link ID is required for update.")
        
    link_found = False
    for i, link in enumerate(links):
        if link.get('id') == link_id_to_update:
            links[i] = updated_link_data # Replace the entire link object
            link_found = True
            break
            
    if not link_found:
        raise ValueError(f"Link with ID {link_id_to_update} not found.")
        
    return save_links(links)

def delete_link(link_id):
    """Deletes a link identified by ID."""
    links = get_all_links()
    original_length = len(links)
    links = [link for link in links if link.get('id') != link_id]
    
    if len(links) == original_length:
        raise ValueError(f"Link with ID {link_id} not found.")
        
    return save_links(links)
