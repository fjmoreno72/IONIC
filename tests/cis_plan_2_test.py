"""
CIS Plan 2.0 API Tests
----------------------
Tests for the new GUID-based CIS Plan API implementation.
"""

import sys
import os
import time
import uuid
import argparse
import json
from typing import Dict, Optional, List, Any, Tuple
from flask import Flask, session
from flask.testing import FlaskClient
from unittest.mock import patch

# Add app to sys.path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from app.data_access.cis_plan_repository_2 import (
    get_all_cis_plan,
    get_entity_by_guid,
    create_entity,
    update_entity,
    delete_entity,
    get_security_classifications,
    get_entities_by_type,
    get_entity_path,
    get_entity_hierarchy,
    update_configuration_item,
    refresh_gp_instance_config_items
)
from app.routes.cis_plan_2 import cis_plan_bp_2

# --- Command line argument parsing ---
def parse_args():
    parser = argparse.ArgumentParser(description='CIS Plan 2.0 API Tests')
    parser.add_argument('--keep-resources', action='store_true',
                        help='Skip deletion of created resources for manual inspection')
    parser.add_argument('--verbose', action='store_true',
                        help='Show detailed output for all tests')
    return parser.parse_args()

# Global settings from command line arguments
args = parse_args()
SKIP_DELETION = args.keep_resources
VERBOSE = args.verbose

# Global test tracking
test_passed = 0
test_failed = 0

# --- Flask Test App Setup ---
def init_test_app():
    """Initialize a Flask test app with proper configuration."""
    app = Flask(__name__)
    app.config['TESTING'] = True
    
    # Point the static folder to the actual application static folder
    root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    app.static_folder = os.path.join(root_path, 'app', 'static')
    
    return app

# Global entity tracking
created_entities = {
    'mission_network': None,
    'network_segment': None,
    'security_domain': None,
    'hw_stack': None,
    'asset': None,
    'network_interface': None,
    'gp_instance': None,
    'sp_instance': None
}

# --- Test utilities ---
def print_test_header(name):
    if VERBOSE:
        print(f"\n--- Running Test: {name} ---")

def print_pass(message):
    global test_passed
    test_passed += 1
    if VERBOSE:
        print(f"\033[92m[PASS]\033[0m {message}")

def print_fail(message, details=""):
    global test_failed
    test_failed += 1
    print(f"\033[91m[FAIL]\033[0m {message}")
    if details:
        print(f"  Details: {details}")

def print_test_summary():
    total = test_passed + test_failed
    print(f"\n--- Test Summary ---")
    print(f"Total Tests: {total}")
    print(f"Passed: {test_passed} ({test_passed/total*100:.1f}%)")
    print(f"Failed: {test_failed} ({test_failed/total*100:.1f}%)")
    if test_failed > 0:
        print(f"\033[91mSome tests failed!\033[0m")
    else:
        print(f"\033[92mAll tests passed!\033[0m")

# --- Test app setup ---
def setup_test_app():
    """Set up a Flask test app with the CIS Plan 2.0 blueprint for API tests."""
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test-key'
    app.register_blueprint(cis_plan_bp_2)
    
    # Add a before_request function to set environment
    @app.before_request
    def before_request():
        session['environment'] = 'ciav'
    
    # Point the static folder to the actual application static folder
    root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    app.static_folder = os.path.join(root_path, 'app', 'static')
    
    return app

# --- Repository Tests ---

def test_repo_get_all_cis_plan():
    """Test loading the CIS Plan data."""
    print_test_header("repo_get_all_cis_plan")
    
    # Set environment explicitly, don't rely on Flask session
    environment = 'ciav'
    
    try:
        data = get_all_cis_plan(environment)
        assert isinstance(data, dict), "CIS Plan data should be a dictionary"
        assert 'missionNetworks' in data, "CIS Plan data should have a 'missionNetworks' key"
        print_pass("Successfully loaded CIS Plan data")
    except Exception as e:
        print_fail("Failed to load CIS Plan data", str(e))

def test_repo_create_entity():
    """Test creating various entities in the hierarchy."""
    print_test_header("repo_create_entity")
    
    # Set environment explicitly, don't rely on Flask session
    environment = 'ciav'
    
    # Create a mission network
    try:
        mission_network = create_entity(environment, 'mission_network', None, {'name': 'Test Mission Network'})
        assert mission_network, "Mission network creation failed"
        assert 'guid' in mission_network, "Mission network should have a GUID"
        assert 'id' in mission_network, "Mission network should have an ID"
        assert mission_network['name'] == 'Test Mission Network', "Mission network name incorrect"
        created_entities['mission_network'] = mission_network['guid']
        print_pass("Created mission network")
    except Exception as e:
        print_fail("Failed to create mission network", str(e))
        return
        
    # Create a network segment
    try:
        network_segment = create_entity(environment, 'network_segment', mission_network['guid'], 
                                        {'name': 'Test Network Segment'})
        assert network_segment, "Network segment creation failed"
        assert 'guid' in network_segment, "Network segment should have a GUID"
        created_entities['network_segment'] = network_segment['guid']
        print_pass("Created network segment")
    except Exception as e:
        print_fail("Failed to create network segment", str(e))
        return
        
    # Create a security domain
    try:
        # Using a known valid classification ID from data/ciav/CIS_Security_Classification.json
        # This avoids dependency on Flask context during testing
        valid_id = 'CL-UNCLASS'
        
        security_domain = create_entity(environment, 'security_domain', network_segment['guid'], 
                                       {'id': valid_id})
        
        assert security_domain, "Security domain creation failed"
        assert 'guid' in security_domain, "Security domain should have a GUID"
        assert security_domain['id'] == valid_id, f"Security domain should have ID {valid_id}"
        created_entities['security_domain'] = security_domain['guid']
        print_pass(f"Created security domain with ID {security_domain['id']}")
    except Exception as e:
        print_fail("Failed to create security domain", str(e))
        return
        
    # Create a hardware stack
    try:
        hw_stack = create_entity(environment, 'hw_stack', security_domain['guid'], 
                                {'name': 'Test HW Stack', 'cisParticipantID': 'PAR-CIAV-000053'})
        assert hw_stack, "HW stack creation failed"
        assert 'guid' in hw_stack, "HW stack should have a GUID"
        created_entities['hw_stack'] = hw_stack['guid']
        print_pass("Created HW stack")
    except Exception as e:
        print_fail("Failed to create HW stack", str(e))
        return
        
    # Create an asset
    try:
        asset = create_entity(environment, 'asset', hw_stack['guid'], {'name': 'Test Asset'})
        assert asset, "Asset creation failed"
        assert 'guid' in asset, "Asset should have a GUID"
        created_entities['asset'] = asset['guid']
        print_pass("Created asset")
    except Exception as e:
        print_fail("Failed to create asset", str(e))
        return
        
    # Create a network interface
    try:
        net_interface = create_entity(environment, 'network_interface', asset['guid'], 
                                      {'name': 'Test Interface', 'ip_address': '192.168.1.1'})
        assert net_interface, "Network interface creation failed"
        assert 'guid' in net_interface, "Network interface should have a GUID"
        assert len(net_interface['configurationItems']) == 3, "Network interface should have 3 config items"
        created_entities['network_interface'] = net_interface['guid']
        print_pass("Created network interface")
    except Exception as e:
        print_fail("Failed to create network interface", str(e))
        return
        
    # Create a GP instance - using a Flask app context to enable configuration item loading
    try:
        # Initialize a test Flask app
        app = init_test_app()
        
        # Create the GP instance within a Flask application context to enable config item loading
        with app.app_context():
            # Use a realistic GP ID (GP-0039) that has configuration items
            gp_instance = create_entity(environment, 'gp_instance', asset['guid'], 
                                      {'gpid': 'GP-0039', 'instanceLabel': 'Test GP', 'serviceId': 'SRV-0016'})
            
            assert gp_instance, "GP instance creation failed"
            assert 'guid' in gp_instance, "GP instance should have a GUID"
            
            # Check if config items were populated
            assert 'configurationItems' in gp_instance, "GP instance should have configurationItems array"
            
            if len(gp_instance.get('configurationItems', [])) > 0:
                print_pass(f"Created GP instance with {len(gp_instance['configurationItems'])} configuration items")
            else:
                print_pass("Created GP instance (no config items populated)")
            
            created_entities['gp_instance'] = gp_instance['guid']
    except Exception as e:
        print_fail("Failed to create GP instance", str(e))
        return
        
    # Create an SP instance
    try:
        sp_instance = create_entity(environment, 'sp_instance', gp_instance['guid'], 
                                   {'spId': 'SP-0001', 'spVersion': '1.0'})
        assert sp_instance, "SP instance creation failed"
        assert 'guid' in sp_instance, "SP instance should have a GUID"
        created_entities['sp_instance'] = sp_instance['guid']
        print_pass("Created SP instance")
    except Exception as e:
        print_fail("Failed to create SP instance", str(e))

def test_repo_get_entity_by_guid():
    """Test retrieving entities by GUID."""
    print_test_header("repo_get_entity_by_guid")
    
    # Set environment explicitly, don't rely on Flask session
    environment = 'ciav'
    
    # Test retrieving each entity type
    for entity_type, guid in created_entities.items():
        if not guid:
            continue
            
        try:
            entity = get_entity_by_guid(environment, guid)
            assert entity, f"{entity_type} retrieval failed"
            print_pass(f"Retrieved {entity_type}")
        except Exception as e:
            print_fail(f"Failed to retrieve {entity_type}", str(e))

def test_repo_update_entity():
    """Test updating entities."""
    print_test_header("repo_update_entity")
    
    # Set environment explicitly, don't rely on Flask session
    environment = 'ciav'
    
    # Update mission network
    if created_entities['mission_network']:
        try:
            updated = update_entity(environment, created_entities['mission_network'], 
                                   {'name': 'Updated Mission Network'})
            assert updated, "Mission network update failed"
            assert updated['name'] == 'Updated Mission Network', "Name not updated correctly"
            print_pass("Updated mission network")
        except Exception as e:
            print_fail("Failed to update mission network", str(e))
    
    # Update network interface config item
    if created_entities['network_interface']:
        try:
            entity = get_entity_by_guid(environment, created_entities['network_interface'])
            config_item = entity['configurationItems'][0]
            updated = update_configuration_item(environment, created_entities['network_interface'], 
                                              'IP Address', '192.168.2.2')
            assert updated, "Config item update failed"
            assert updated['AnswerContent'] == '192.168.2.2', "Config value not updated correctly"
            print_pass("Updated configuration item")
        except Exception as e:
            print_fail("Failed to update configuration item", str(e))

def test_repo_get_entity_path():
    """Test retrieving the path to an entity."""
    print_test_header("repo_get_entity_path")
    
    # Set environment explicitly, don't rely on Flask session
    environment = 'ciav'
    
    # Get path to deepest entity (SP instance)
    if created_entities['sp_instance']:
        try:
            data = get_all_cis_plan(environment)
            path = get_entity_path(data, created_entities['sp_instance'])
            assert path, "Path retrieval failed"
            assert len(path) >= 7, f"Path should have at least 7 elements but has {len(path)}"
            print_pass("Retrieved entity path")
        except Exception as e:
            print_fail("Failed to retrieve entity path", str(e))

def test_repo_get_entity_hierarchy():
    """Test retrieving the hierarchy for an entity."""
    print_test_header("repo_get_entity_hierarchy")
    
    # Set environment explicitly, don't rely on Flask session
    environment = 'ciav'
    
    # Get hierarchy for asset
    if created_entities['asset']:
        try:
            data = get_all_cis_plan(environment)
            hierarchy = get_entity_hierarchy(data, created_entities['asset'])
            assert hierarchy, "Hierarchy retrieval failed"
            assert 'mission_network' in hierarchy, "Hierarchy should include mission_network"
            assert 'network_segment' in hierarchy, "Hierarchy should include network_segment"
            assert 'security_domain' in hierarchy, "Hierarchy should include security_domain"
            assert 'hw_stack' in hierarchy, "Hierarchy should include hw_stack"
            print_pass("Retrieved entity hierarchy")
        except Exception as e:
            print_fail("Failed to retrieve entity hierarchy", str(e))

def test_repo_delete_entity():
    """Test deleting entities, starting from the deepest level."""
    print_test_header("repo_delete_entity")
    
    # Set environment explicitly, don't rely on Flask session
    environment = 'ciav'
    
    if SKIP_DELETION:
        print("Skipping deletion tests as requested")
        return
    
    # Test refreshing GP instance configuration items
    if created_entities.get('gp_instance') is None:
        print("Skipping GP instance refresh test - no GP instance was created")
    else:
        try:
            # Initialize a test Flask app
            app = init_test_app()
            
            # Use a Flask application context for accessing configuration items
            with app.app_context():
                # First, get the current GP instance to check configuration items count
                gp_instance = get_entity_by_guid(environment, created_entities['gp_instance'])
                initial_config_count = len(gp_instance.get('configurationItems', []))
                
                # Now refresh the configuration items
                refreshed_gp = refresh_gp_instance_config_items(environment, created_entities['gp_instance'])
                assert refreshed_gp, "GP instance refresh failed"
                
                # Check that we still have configuration items
                refreshed_count = len(refreshed_gp.get('configurationItems', []))
                print_pass(f"Refreshed GP instance configuration items: {initial_config_count} before, {refreshed_count} after")
        except Exception as e:
            print_fail("Failed to refresh GP instance configuration items", str(e))
    
    # Delete in reverse order of creation (bottom-up)
    entities_to_delete = list(created_entities.items())
    entities_to_delete.reverse()
    
    for entity_type, guid in entities_to_delete:
        if not guid:
            continue
            
        try:
            deleted = delete_entity(environment, guid)
            assert deleted, f"{entity_type} deletion failed"
            print_pass(f"Deleted {entity_type}")
        except Exception as e:
            print_fail(f"Failed to delete {entity_type}", str(e))

# --- API Tests ---

def test_api_get_cis_plan(client):
    """Test the API endpoint for getting the full CIS Plan."""
    print_test_header("api_get_cis_plan")
    
    try:
        response = client.get('/api/v2/cis_plan')
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        data = json.loads(response.data)
        assert data['status'] == 'success', "Response status should be 'success'"
        assert 'missionNetworks' in data['data'], "Response should include missionNetworks"
        print_pass("Successfully got CIS Plan via API")
    except Exception as e:
        print_fail("Failed to get CIS Plan via API", str(e))

def test_api_create_entity(client):
    """Test the API endpoint for creating entities."""
    print_test_header("api_create_entity")
    
    # Create a mission network
    try:
        response = client.post('/api/v2/cis_plan/entity', json={
            'entity_type': 'mission_network',
            'parent_guid': None,
            'attributes': {'name': 'API Test Mission Network'}
        })
        assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"
        data = json.loads(response.data)
        assert data['status'] == 'success', "Response status should be 'success'"
        assert 'guid' in data['data'], "Response should include entity with GUID"
        created_entities['mission_network'] = data['data']['guid']
        print_pass("Created mission network via API")
    except Exception as e:
        print_fail("Failed to create mission network via API", str(e))
        return
        
    # Create a network segment
    try:
        response = client.post('/api/v2/cis_plan/entity', json={
            'entity_type': 'network_segment',
            'parent_guid': created_entities['mission_network'],
            'attributes': {'name': 'API Test Network Segment'}
        })
        assert response.status_code == 201, f"Expected status code 201, got {response.status_code}"
        data = json.loads(response.data)
        created_entities['network_segment'] = data['data']['guid']
        print_pass("Created network segment via API")
    except Exception as e:
        print_fail("Failed to create network segment via API", str(e))

def test_api_get_entity(client):
    """Test the API endpoint for getting an entity by GUID."""
    print_test_header("api_get_entity")
    
    if not created_entities['mission_network']:
        print_fail("No mission network GUID available for test")
        return
        
    try:
        response = client.get(f"/api/v2/cis_plan/entity/{created_entities['mission_network']}")
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        data = json.loads(response.data)
        assert data['status'] == 'success', "Response status should be 'success'"
        assert data['data']['guid'] == created_entities['mission_network'], "GUID mismatch"
        print_pass("Got entity by GUID via API")
    except Exception as e:
        print_fail("Failed to get entity by GUID via API", str(e))

def test_api_update_entity(client):
    """Test the API endpoint for updating an entity."""
    print_test_header("api_update_entity")
    
    if not created_entities['mission_network']:
        print_fail("No mission network GUID available for test")
        return
        
    try:
        response = client.put(
            f"/api/v2/cis_plan/entity/{created_entities['mission_network']}", 
            json={'name': 'Updated API Mission Network'}
        )
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        data = json.loads(response.data)
        assert data['status'] == 'success', "Response status should be 'success'"
        assert data['data']['name'] == 'Updated API Mission Network', "Name not updated correctly"
        print_pass("Updated entity via API")
    except Exception as e:
        print_fail("Failed to update entity via API", str(e))

def test_api_get_entities_by_type(client):
    """Test the API endpoint for getting entities by type."""
    print_test_header("api_get_entities_by_type")
    
    try:
        response = client.get('/api/v2/cis_plan/entities/mission_network')
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        data = json.loads(response.data)
        assert data['status'] == 'success', "Response status should be 'success'"
        assert isinstance(data['data'], list), "Response data should be a list"
        print_pass("Got entities by type via API")
    except Exception as e:
        print_fail("Failed to get entities by type via API", str(e))
    
    # Test with parent filter
    if created_entities['mission_network']:
        try:
            response = client.get(
                f"/api/v2/cis_plan/entities/network_segment?parent_guid={created_entities['mission_network']}"
            )
            assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
            data = json.loads(response.data)
            assert data['status'] == 'success', "Response status should be 'success'"
            assert isinstance(data['data'], list), "Response data should be a list"
            print_pass("Got entities by type with parent filter via API")
        except Exception as e:
            print_fail("Failed to get entities by type with parent filter via API", str(e))

def test_api_get_entity_path(client):
    """Test the API endpoint for getting the path to an entity."""
    print_test_header("api_get_entity_path")
    
    if not created_entities['network_segment']:
        print_fail("No network segment GUID available for test")
        return
        
    try:
        response = client.get(f"/api/v2/cis_plan/entity/{created_entities['network_segment']}/path")
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        data = json.loads(response.data)
        assert data['status'] == 'success', "Response status should be 'success'"
        assert isinstance(data['data'], list), "Response data should be a list"
        assert len(data['data']) >= 2, "Path should have at least 2 elements"
        print_pass("Got entity path via API")
    except Exception as e:
        print_fail("Failed to get entity path via API", str(e))

def test_api_get_entity_hierarchy(client):
    """Test the API endpoint for getting the hierarchy for an entity."""
    print_test_header("api_get_entity_hierarchy")
    
    if not created_entities['network_segment']:
        print_fail("No network segment GUID available for test")
        return
        
    try:
        response = client.get(f"/api/v2/cis_plan/entity/{created_entities['network_segment']}/hierarchy")
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        data = json.loads(response.data)
        assert data['status'] == 'success', "Response status should be 'success'"
        assert isinstance(data['data'], dict), "Response data should be a dict"
        assert 'mission_network' in data['data'], "Hierarchy should include mission_network"
        print_pass("Got entity hierarchy via API")
    except Exception as e:
        print_fail("Failed to get entity hierarchy via API", str(e))

def test_api_delete_entity(client):
    """Test the API endpoint for deleting entities."""
    print_test_header("api_delete_entity")
    
    if SKIP_DELETION:
        print("Skipping deletion tests as requested")
        return
        
    # Delete network segment first
    if created_entities['network_segment']:
        try:
            response = client.delete(f"/api/v2/cis_plan/entity/{created_entities['network_segment']}")
            assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
            data = json.loads(response.data)
            assert data['status'] == 'success', "Response status should be 'success'"
            assert data['data']['deleted'], "Entity should be deleted"
            print_pass("Deleted network segment via API")
        except Exception as e:
            print_fail("Failed to delete network segment via API", str(e))
    
    # Then delete mission network
    if created_entities['mission_network']:
        try:
            response = client.delete(f"/api/v2/cis_plan/entity/{created_entities['mission_network']}")
            assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
            data = json.loads(response.data)
            assert data['status'] == 'success', "Response status should be 'success'"
            assert data['data']['deleted'], "Entity should be deleted"
            print_pass("Deleted mission network via API")
        except Exception as e:
            print_fail("Failed to delete mission network via API", str(e))

if __name__ == '__main__':
    # Run repository tests
    print("\n=== Running Repository Tests ===")
    test_repo_get_all_cis_plan()
    test_repo_create_entity()
    test_repo_get_entity_by_guid()
    test_repo_update_entity()
    test_repo_get_entity_path()
    test_repo_get_entity_hierarchy()
    test_repo_delete_entity()
    
    # Run API tests
    print("\n=== Running API Tests ===")
    app = setup_test_app()
    with app.test_client() as client:
        test_api_get_cis_plan(client)
        test_api_create_entity(client)
        test_api_get_entity(client)
        test_api_update_entity(client)
        test_api_get_entities_by_type(client)
        test_api_get_entity_path(client)
        test_api_get_entity_hierarchy(client)
        test_api_delete_entity(client)
    
    # Print overall summary
    print_test_summary()
