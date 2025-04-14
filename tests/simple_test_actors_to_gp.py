"""
Simple test script for actors_to_gp.py
This script directly calls the functions in actors_to_gp.py to test their functionality.
"""
import sys
import os
import json
from pathlib import Path
from flask import Flask

# Add the app directory to the path so we can import the module
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Create a simple Flask app for testing
app = Flask(__name__)
app.static_folder = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app', 'static'))

# Set the secret key for the Flask app (required for sessions)
app.secret_key = 'test_secret_key'

# Import the modules to test
from app.data_access.actors_to_gp import get_actor_to_gp_path, get_all_actor_gp, update_actor_to_gp, regenerate_actor_to_gp_file, delete_gp_from_actor, clean_old_actors
from app.data_access.services_repository import get_service_id_by_name, get_service_name_by_id
from app.routes.api import get_actor_key_from_name

def test_get_actor_to_gp_path():
    """Test the get_actor_to_gp_path function."""
    with app.app_context():
        path = get_actor_to_gp_path()
        print(f"Actor to GP path: {path}")
        print(f"Path exists: {path.exists()}")
        return path

def test_get_all_actor_gp():
    """Test the get_all_actor_gp function."""
    with app.app_context():
        data = get_all_actor_gp()
        print(f"Found {len(data.get('services', []))} services")
        #print(json.dumps(data, indent=2))
        return data

def test_update_actor_to_gp():
    """Test the update_actor_to_gp function."""
    # Example data for testing
    service_id = "SRV-0001"
    model_id = "MOD-0001"
    actor_id = "ACT-CIAV-000165"
    gps = [
        {
            "gp_id": "GP-TEST-001",
            "gp_name": "Email Sender*"
        }
    ]
    
    with app.app_context():
        print(f"Updating actor {actor_id} in service {service_id} with {len(gps)} GPs")
        result = update_actor_to_gp(service_id, model_id, actor_id, gps)
        print(f"Update result: {'Success' if result else 'Failed'}")
        
        # Verify the update by getting all data again
        data = get_all_actor_gp()
        print("Updated data:")
        #print(json.dumps(data, indent=2))
        return result

def test_update_actor_to_gp_fail():
    """Test the update_actor_to_gp function."""
    # Example data for testing
    service_id = "SRV-0001"
    model_id = "MOD-0001"
    actor_id = "ACT-CIAV-0007X4"
    gps = [
        {
            "gp_id": "GP-TEST-001",
            "gp_name": "Web Client"
        }
    ]
    
    with app.app_context():
        print(f"Updating actor {actor_id} in service {service_id} with {len(gps)} GPs")
        result = update_actor_to_gp(service_id, model_id, actor_id, gps)
        print(f"Update result: {'Failed' if result else 'Success'}")
        
        # Verify the update by getting all data again
        data = get_all_actor_gp()
        print("Updated data:")
        #print(json.dumps(data, indent=2))
        return result


def test_delete_gp_from_actor():
    """Test the delete_gp_from_actor function."""
    # Example data for testing
    service_id = "SRV-0001"
    model_id = "MOD-0001"
    actor_id = "ACT-CIAV-000165"
    
    # First, add two GPs to the actor
    gps = [
        {
            "gp_id": "GP-TEST-001",
            "gp_name": "Email Sender*"
        },
        {
            "gp_id": "GP-TEST-002",
            "gp_name": "File Processor*"
        }
    ]
    
    with app.app_context():
        # First, add the GPs to the actor
        print(f"Setting up: Updating actor {actor_id} in service {service_id} with {len(gps)} GPs")
        update_result = update_actor_to_gp(service_id, model_id, actor_id, gps)
        if not update_result:
            print("Setup failed: Could not add GPs to actor")
            return False
            
        # Test 1: Delete a specific GP
        specific_gp_id = "GP-TEST-001"
        print(f"\nTest 1: Deleting specific GP {specific_gp_id} for actor {actor_id} in service {service_id}")
        result1 = delete_gp_from_actor(service_id, model_id, actor_id, specific_gp_id)
        print(f"Delete specific GP result: {'Success' if result1 else 'Failed'}")
        
        # Verify the deletion by getting all data again
        data = get_all_actor_gp()
        print("Updated data after specific GP deletion:")
        #print(json.dumps(data, indent=2))
        
        # Test 2: Delete all remaining GPs
        print(f"\nTest 2: Deleting all GPs for actor {actor_id} in service {service_id}")
        result2 = delete_gp_from_actor(service_id, model_id, actor_id)
        print(f"Delete all GPs result: {'Success' if result2 else 'Failed'}")
        
        # Verify the deletion by getting all data again
        data = get_all_actor_gp()
        print("Updated data after deleting all GPs:")
        #print(json.dumps(data, indent=2))
        
        return result1 and result2

def test_delete_gp_from_actor_fail():
    """Test the delete_gp_from_actor function with non-existent entities."""
    # Example data for testing with non-existent entities
    service_id = "SRV-NONEXISTENT"
    model_id = "MOD-NONEXISTENT"
    actor_id = "ACT-NONEXISTENT"
    
    with app.app_context():
        print(f"Attempting to delete GPs for non-existent actor {actor_id} in service {service_id}")
        result = delete_gp_from_actor(service_id, model_id, actor_id)
        print(f"Delete result (should fail): {'Failed' if not result else 'Success'}")
        return not result  # Invert the result since we expect it to fail

def test_get_service_id_by_name():
    """Test the get_service_id_by_name function."""
    with app.app_context():
        # Test with a known service name
        service_name = "Air C2 Information Exchange"
        expected_id = "SRV-0001"
        
        print(f"Looking up service ID for name: '{service_name}'")
        service_id = get_service_id_by_name(service_name)
        print(f"Found service ID: '{service_id}'")
        
        if service_id == expected_id:
            print("✅ Test passed: Found correct service ID")
            result = True
        else:
            print(f"❌ Test failed: Expected '{expected_id}', got '{service_id}'")
            result = False
        
        return result

def test_get_service_id_by_name_negative():
    """Test the get_service_id_by_name function with a non-existent service name."""
    with app.app_context():
        # Test with a non-existent service name
        service_name = "Non-existent Service XYZ"
        
        print(f"Looking up service ID for non-existent name: '{service_name}'")
        service_id = get_service_id_by_name(service_name)
        print(f"Result: '{service_id}'")
        
        if service_id == "":
            print("✅ Test passed: Correctly returned empty string for non-existent service")
            result = True
        else:
            print(f"❌ Test failed: Expected empty string, got '{service_id}'")
            result = False
        
        return result

def test_get_service_name_by_id():
    """Test the get_service_name_by_id function."""
    with app.app_context():
        # Test with a known service ID
        service_id = "SRV-0012"
        expected_name = "Audio and Video-based Collaboration"
        
        print(f"Looking up service name for ID: '{service_id}'")
        service_name = get_service_name_by_id(service_id)
        print(f"Found service name: '{service_name}'")
        
        if service_name == expected_name:
            print("✅ Test passed: Found correct service name")
            result = True
        else:
            print(f"❌ Test failed: Expected '{expected_name}', got '{service_name}'")
            result = False
        
        return result

def test_get_service_name_by_id_negative():
    """Test the get_service_name_by_id function with a non-existent service ID."""
    with app.app_context():
        # Test with a non-existent service ID
        service_id = "SRV-9999"
        
        print(f"Looking up service name for non-existent ID: '{service_id}'")
        service_name = get_service_name_by_id(service_id)
        print(f"Result: '{service_name}'")
        
        if service_name == "":
            print("✅ Test passed: Correctly returned empty string for non-existent service")
            result = True
        else:
            print(f"❌ Test failed: Expected empty string, got '{service_name}'")
            result = False
        
        return result

def test_get_actor_id_from_name():
    """Test the get_actor_id_from_name function with a known actor name."""
    with app.app_context():
        # We need to set up a mock session for the get_dynamic_data_path function
        with app.test_request_context():
            from flask import session
            session['environment'] = 'ciav'  # Set the environment to 'ciav'
            
            # Mock the _actor_map global variable in the api module
            #from app.routes import api
            #api._actor_map = {"ACT-CWIX-000066": "CSD IWS ISR Asset"}
            
            actor_name = "CSD IWS ISR Asset"
            expected_id = "ACT-CWIX-000066"
            
            print(f"Looking up actor ID for name: '{actor_name}'")
            actor_id = get_actor_key_from_name(actor_name)
            print(f"Found actor ID: '{actor_id}'")
            
            if actor_id == expected_id:
                print("✅ Test passed: Found correct actor ID")
                result = True
            else:
                print(f"❌ Test failed: Expected '{expected_id}', got '{actor_id}'")
                result = False
            
            return result

def test_get_actor_id_from_name_negative():
    """Test the get_actor_id_from_name function with a non-existent actor name."""
    with app.app_context():
        # We need to set up a mock session for the get_dynamic_data_path function
        with app.test_request_context():
            from flask import session
            session['environment'] = 'ciav'  # Set the environment to 'ciav'
            
            # Mock the _actor_map global variable in the api module
            #from app.routes import api
            #api._actor_map = {"ACT-CWIX-000066": "CSD IWS ISR Asset"}
            
            actor_name = "Non-existent Actor XYZ"
            
            print(f"Looking up actor ID for non-existent name: '{actor_name}'")
            actor_id = get_actor_key_from_name(actor_name)
            print(f"Result: '{actor_id}'")
            
            if actor_id == "":
                print("✅ Test passed: Correctly returned empty string for non-existent actor")
                result = True
            else:
                print(f"❌ Test failed: Expected empty string, got '{actor_id}'")
                result = False
            
            return result

def test_regenerate_actor_to_gp_file():
    """Test the regenerate_actor_to_gp_file function."""
    with app.app_context():
        # We need to set up a mock session for the get_dynamic_data_path function
        with app.test_request_context():
            from flask import session
            import json
            
            session['environment'] = 'ciav'  # Set the environment to 'ciav'
            
            print("Regenerating actor to GP file...")
            # Force regeneration to ensure actors are added
            result = regenerate_actor_to_gp_file(force_regenerate=False)
            print(f"Regeneration result: {'Success' if result else 'Failed'}")
            
            # Verify that actor_last_update field is added to actors
            actor_gp_path = get_actor_to_gp_path()
            with open(actor_gp_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Check if any actors have the actor_last_update field
            has_last_update = False
            for service in data.get('services', []):
                for actor in service.get('actors', []):
                    if 'actor_last_update' in actor:
                        has_last_update = True
                        print(f"Found actor with last_update: {actor['actor_name']} - {actor['actor_last_update']}")
                        break
                if has_last_update:
                    break
            
            print(f"Actors have last_update field: {has_last_update}")
            return result


def test_clean_old_actors():
    """Test the clean_old_actors function."""
    with app.app_context():
        # We need to set up a mock session for the get_dynamic_data_path function
        with app.test_request_context():
            from flask import session
            
            session['environment'] = 'ciav'  # Set the environment to 'ciav'
            
            print("Testing clean_old_actors function...")
            
            # Call the clean_old_actors function with default 60 minutes threshold
            clean_result, actors_removed = clean_old_actors(minutes=60)
            print(f"Clean result: {'Success' if clean_result else 'Failed'}")
            print(f"Number of actors removed: {actors_removed}")
            
            return clean_result

if __name__ == "__main__":
    print("Testing get_actor_to_gp_path()...")
    path = test_get_actor_to_gp_path()
    print("\n" + "-" * 50 + "\n")
    
    print("Testing get_all_actor_gp()...")
    #data = test_get_all_actor_gp()
    print("\n" + "-" * 50 + "\n")
    
    
    
    print("Testing update_actor_to_gp_fail()...")
    #result = test_update_actor_to_gp_fail()
    print("\n" + "-" * 50 + "\n")
    
    print("Testing delete_gp_from_actor()...")
    #result = test_delete_gp_from_actor()
    print("\n" + "-" * 50 + "\n")
    
    print("Testing delete_gp_from_actor_fail()...")
    #result = test_delete_gp_from_actor_fail()
    print("\n" + "-" * 50 + "\n")
    
    print("Testing get_service_id_by_name()...")
    #result = test_get_service_id_by_name()
    print("\n" + "-" * 50 + "\n")
    
    print("Testing get_service_id_by_name_negative()...")
    #result = test_get_service_id_by_name_negative()
    print("\n" + "-" * 50 + "\n")
    
    print("Testing get_service_name_by_id()...")
    #result = test_get_service_name_by_id()
    print("\n" + "-" * 50 + "\n")
    
    print("Testing get_service_name_by_id_negative()...")
    #result = test_get_service_name_by_id_negative()
    print("\n" + "-" * 50 + "\n")
    
    print("Testing get_actor_id_from_name()...")
    #result = test_get_actor_id_from_name()
    print("\n" + "-" * 50 + "\n")
    
    print("Testing get_actor_id_from_name_negative()...")
    #result = test_get_actor_id_from_name_negative()
    print("\n" + "-" * 50 + "\n")
    
    print("Testing regenerate_actor_to_gp_file()...")
    result = test_regenerate_actor_to_gp_file()
    print("\n" + "-" * 50 + "\n")
    
    print("Testing clean_old_actors()...")
    result = test_clean_old_actors()
    print("\n" + "-" * 50 + "\n")

    print("Testing update_actor_to_gp()...")
    #result = test_update_actor_to_gp()
    print("\n" + "-" * 50 + "\n")

    print("Testing delete_gp_from_actor()...")
    #result = test_delete_gp_from_actor()
    print("\n" + "-" * 50 + "\n")

    print("Testing update_actor_to_gp()...")
    #result = test_update_actor_to_gp()
    print("\n" + "-" * 50 + "\n")

    print("All tests completed.")
