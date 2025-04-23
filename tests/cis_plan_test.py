import sys
import os
import time
from flask import Flask

# Dynamically add app to sys.path for imports if needed
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from app.data_access.cis_plan_repository import (
    get_all_cis_plan, get_all_cis_security_classification,
    add_mission_network, update_mission_network, delete_mission_network,
    add_network_segment, update_network_segment, delete_network_segment,
    add_security_domain, get_all_security_domains, update_security_domain, delete_security_domain
)
from app.routes.cis_plan import cis_plan_bp

# --- Global state (used cautiously for sequential testing) ---
created_ids = {
    'mission_network_repo': None,
    'mission_network_api': None,
    'network_segment_repo': None,
    'network_segment_api': None,
    'security_domain_repo': None,
    'security_domain_api': None,
    'mission_network_repo_temp': None,
    'network_segment_repo_temp': None,
    'mission_network_repo_temp_sd': None,
    'network_segment_repo_temp_sd': None,
}

def print_test_header(name):
    print(f"\n--- Running Test: {name} ---")

def print_pass(message):
    print(f"\033[92m[PASS]\033[0m {message}")

def print_fail(message, details=""):
    print(f"\033[91m[FAIL]\033[0m {message}")
    if details:
        print(f"  Details: {details}")

# --- Repository Function Tests ---

def test_repo_get_all_cis_plan():
    print_test_header("test_repo_get_all_cis_plan")
    try:
        data = get_all_cis_plan('ciav')
        if data is not None: 
            print_pass("get_all_cis_plan() returned data (could be empty).")
        else:
            print_fail("get_all_cis_plan() returned None.")
    except Exception as e:
        print_fail(f"get_all_cis_plan() raised exception: {e}")

def test_repo_get_all_cis_security_classification():
    print_test_header("test_repo_get_all_cis_security_classification")
    try:
        data = get_all_cis_security_classification()
        if data is not None: 
            print_pass("get_all_cis_security_classification() returned data (could be empty).")
        else:
            print_fail("get_all_cis_security_classification() returned None.")
    except Exception as e:
        print_fail(f"get_all_cis_security_classification() raised exception: {e}")

# --- Mission Network Repo Tests ---
def test_repo_add_mission_network():
    print_test_header("test_repo_add_mission_network")
    name = f"testRepoMissionNetwork_{int(time.time())}" 
    try:
        result = add_mission_network('ciav', name)
        if result and result.get('name') == name and result.get('id', '').startswith('MN-'):
            created_ids['mission_network_repo'] = result['id'] 
            print_pass(f"add_mission_network() created mission network '{name}' with id {result['id']}.")
        else:
            print_fail("add_mission_network() did not create as expected.", f"Result: {result}")
    except Exception as e:
        print_fail(f"add_mission_network() raised exception: {e}")

def test_repo_update_mission_network():
    print_test_header("test_repo_update_mission_network")
    mn_id = created_ids.get('mission_network_repo')
    if not mn_id:
        print_fail("Skipping update test, no mission network ID from add test.")
        return
    new_name = f"testRepoMissionNetwork_updated_{int(time.time())}"
    try:
        result = update_mission_network('ciav', mn_id, new_name)
        if result and result.get('name') == new_name and result.get('id') == mn_id:
            print_pass(f"update_mission_network() updated mission network {mn_id} to name '{new_name}'.")
        else:
            print_fail(f"update_mission_network() did not update {mn_id} as expected.", f"Result: {result}")
    except Exception as e:
        print_fail(f"update_mission_network() raised exception: {e}")

def test_repo_delete_mission_network():
    print_test_header("test_repo_delete_mission_network")
    mn_id = created_ids.get('mission_network_repo')
    if not mn_id:
        print_fail("Skipping delete test, no mission network ID from add test.")
        return
    try:
        deleted = delete_mission_network('ciav', mn_id)
        if deleted:
            all_data = get_all_cis_plan('ciav')
            mission_networks = all_data.get('missionNetworks', []) if isinstance(all_data, dict) else []
            found = any(m.get('id') == mn_id for m in mission_networks)
            if not found:
                print_pass(f"delete_mission_network() deleted mission network {mn_id}.")
                created_ids['mission_network_repo'] = None 
            else:
                print_fail(f"delete_mission_network() claimed success but {mn_id} still found.")
        else:
            print_fail(f"delete_mission_network() failed to delete mission network {mn_id}.")
    except Exception as e:
        print_fail(f"delete_mission_network() raised exception: {e}")

# --- Network Segment Repo Tests ---
def test_repo_add_network_segment():
    print_test_header("test_repo_add_network_segment")
    # Need a mission network to add segment to. Create one temporarily for this test sequence.
    temp_mn_name = f"tempMNForSegmentRepo_{int(time.time())}"
    temp_mn = None
    try:
        temp_mn = add_mission_network('ciav', temp_mn_name)
    except Exception as e_create:
        print_fail(f"Failed to create temporary Mission Network '{temp_mn_name}' for segment tests: {e_create}")
        return # Cannot proceed

    if not temp_mn or not temp_mn.get('id'):
        print_fail(f"Could not create temporary Mission Network '{temp_mn_name}'. Result: {temp_mn}")
        return # Cannot proceed

    mn_id = temp_mn['id']
    created_ids['mission_network_repo_temp'] = mn_id # Store temp MN ID for cleanup

    name = f"testRepoSegment_{int(time.time())}"
    try:
        result = add_network_segment('ciav', mn_id, name)
        if result and result.get('name') == name and result.get('id', '').startswith('NS-'):
            created_ids['network_segment_repo'] = result['id'] # Store ID
            print_pass(f"add_network_segment() created segment '{name}' (id {result['id']}) in MN {mn_id}.")
        else:
            print_fail(f"add_network_segment() did not create as expected in MN {mn_id}.", f"Result: {result}")
            # Cleanup the temp MN if segment creation failed
            delete_mission_network('ciav', mn_id)
            created_ids['mission_network_repo_temp'] = None
    except Exception as e:
        print_fail(f"add_network_segment() raised exception: {e}")
        # Cleanup the temp MN if segment creation failed
        delete_mission_network('ciav', mn_id)
        created_ids['mission_network_repo_temp'] = None

def test_repo_update_network_segment():
    print_test_header("test_repo_update_network_segment")
    mn_id = created_ids.get('mission_network_repo_temp')
    seg_id = created_ids.get('network_segment_repo')
    if not mn_id or not seg_id:
        print_fail("Skipping update test, no mission network/segment ID from add test.")
        # Attempt cleanup if MN id exists but seg id doesn't (add failed?)
        if mn_id:
             try:
                delete_mission_network('ciav', mn_id)
                created_ids['mission_network_repo_temp'] = None
             except: pass
        return
    new_name = f"testRepoSegment_updated_{int(time.time())}"
    try:
        result = update_network_segment('ciav', mn_id, seg_id, new_name)
        if result and result.get('name') == new_name and result.get('id') == seg_id:
            print_pass(f"update_network_segment() updated segment {seg_id} to name '{new_name}'.")
        else:
            print_fail(f"update_network_segment() did not update {seg_id} as expected.", f"Result: {result}")
    except Exception as e:
        print_fail(f"update_network_segment() raised exception: {e}")

def test_repo_delete_network_segment():
    print_test_header("test_repo_delete_network_segment")
    mn_id = created_ids.get('mission_network_repo_temp')
    seg_id = created_ids.get('network_segment_repo')
    if not mn_id or not seg_id:
        print_fail("Skipping delete test, no mission network/segment ID from add/update tests.")
        # Attempt cleanup if MN id exists but seg id doesn't
        if mn_id:
             try:
                delete_mission_network('ciav', mn_id)
                created_ids['mission_network_repo_temp'] = None
             except: pass
        return
    try:
        deleted = delete_network_segment('ciav', mn_id, seg_id)
        if deleted:
            # Verify removal
            all_data = get_all_cis_plan('ciav')
            mn = next((m for m in all_data.get('missionNetworks', []) if m.get('id') == mn_id), None)
            seg_found = False
            if mn:
                seg_found = any(s.get('id') == seg_id for s in mn.get('networkSegments', []))

            if not seg_found:
                print_pass(f"delete_network_segment() deleted segment {seg_id} from MN {mn_id}.")
                created_ids['network_segment_repo'] = None # Clear ID
            else:
                 print_fail(f"delete_network_segment() claimed success but {seg_id} still found in {mn_id}.")
        else:
            print_fail(f"delete_network_segment() failed to delete segment {seg_id} from MN {mn_id}.")
    except Exception as e:
        print_fail(f"delete_network_segment() raised exception: {e}")
    finally:
        # Clean up temporary mission network used for segment tests, regardless of delete success/fail
        if mn_id:
            try:
                delete_mission_network('ciav', mn_id)
                print(f"--- Cleaned up temporary Mission Network {mn_id} ---")
                created_ids['mission_network_repo_temp'] = None
            except Exception as e_clean:
                print(f"\033[93m[WARN]\033[0m Failed to cleanup temporary MN {mn_id}: {e_clean}")

# --- Security Domain Repo Tests ---
def test_repo_add_security_domain():
    print_test_header("test_repo_add_security_domain")
    # Need a mission network and segment to add domain to. Create temporarily.
    temp_mn_name = f"tempMNForDomainRepo_{int(time.time())}"
    temp_mn = None
    mn_id = None
    try:
        temp_mn = add_mission_network('ciav', temp_mn_name)
        if not temp_mn or not temp_mn.get('id'):
             print_fail(f"Could not create temporary MN '{temp_mn_name}'. Result: {temp_mn}")
             return
        mn_id = temp_mn['id']
        created_ids['mission_network_repo_temp_sd'] = mn_id # Store temp MN ID
    except Exception as e_create_mn:
        print_fail(f"Failed to create temporary MN '{temp_mn_name}' for domain tests: {e_create_mn}")
        return # Cannot proceed

    temp_seg_name = f"tempSegForDomainRepo_{int(time.time())}"
    temp_seg = None
    seg_id = None
    try:
        temp_seg = add_network_segment('ciav', mn_id, temp_seg_name)
        if not temp_seg or not temp_seg.get('id'):
            print_fail(f"Could not create temporary Segment '{temp_seg_name}' in MN {mn_id}. Result: {temp_seg}")
            delete_mission_network('ciav', mn_id) # Cleanup MN
            created_ids['mission_network_repo_temp_sd'] = None
            return
        seg_id = temp_seg['id']
        created_ids['network_segment_repo_temp_sd'] = seg_id # Store temp Segment ID
    except Exception as e_create_seg:
        print_fail(f"Failed to create temporary Segment '{temp_seg_name}' in MN {mn_id}: {e_create_seg}")
        delete_mission_network('ciav', mn_id) # Cleanup MN
        created_ids['mission_network_repo_temp_sd'] = None
        return # Cannot proceed

    name = f"testRepoDomain_{int(time.time())}"
    try:
        result = add_security_domain('ciav', mn_id, seg_id, name)
        if result and result.get('name') == name and result.get('id', '').startswith('SD-'):
            created_ids['security_domain_repo'] = result['id'] # Store ID
            print_pass(f"add_security_domain() created domain '{name}' (id {result['id']}) in Seg {seg_id}/MN {mn_id}.")
        else:
            print_fail(f"add_security_domain() did not create as expected.", f"Result: {result}")
            # Cleanup on failure
            delete_mission_network('ciav', mn_id)
            created_ids['mission_network_repo_temp_sd'] = None
            created_ids['network_segment_repo_temp_sd'] = None
    except Exception as e:
        print_fail(f"add_security_domain() raised exception: {e}")
        # Cleanup on exception
        delete_mission_network('ciav', mn_id)
        created_ids['mission_network_repo_temp_sd'] = None
        created_ids['network_segment_repo_temp_sd'] = None

def test_repo_get_all_security_domains():
    print_test_header("test_repo_get_all_security_domains")
    mn_id = created_ids.get('mission_network_repo_temp_sd')
    seg_id = created_ids.get('network_segment_repo_temp_sd')
    dom_id = created_ids.get('security_domain_repo')
    if not mn_id or not seg_id or not dom_id:
        print_fail("Skipping get all test, missing prerequisite IDs (MN/Seg/Domain). Add test likely failed.")
        # Attempt cleanup if MN ID exists
        if mn_id:
             try:
                delete_mission_network('ciav', mn_id)
                created_ids['mission_network_repo_temp_sd'] = None
                created_ids['network_segment_repo_temp_sd'] = None
             except: pass
        return
    try:
        domains = get_all_security_domains('ciav', mn_id, seg_id)
        found = any(d.get('id') == dom_id for d in domains)
        if isinstance(domains, list) and found:
            print_pass(f"get_all_security_domains() returned list containing domain {dom_id}.")
        elif isinstance(domains, list):
             print_fail(f"get_all_security_domains() returned list but did not contain domain {dom_id}.")
        else:
            print_fail(f"get_all_security_domains() did not return a list.", f"Result: {domains}")
    except Exception as e:
        print_fail(f"get_all_security_domains() raised exception: {e}")

def test_repo_update_security_domain():
    print_test_header("test_repo_update_security_domain")
    mn_id = created_ids.get('mission_network_repo_temp_sd')
    seg_id = created_ids.get('network_segment_repo_temp_sd')
    dom_id = created_ids.get('security_domain_repo')
    if not mn_id or not seg_id or not dom_id:
        print_fail("Skipping update test, missing prerequisite IDs (MN/Seg/Domain). Previous tests likely failed.")
        # Attempt cleanup if MN ID exists
        if mn_id:
             try:
                delete_mission_network('ciav', mn_id)
                created_ids['mission_network_repo_temp_sd'] = None
                created_ids['network_segment_repo_temp_sd'] = None
             except: pass
        return
    new_name = f"testRepoDomain_updated_{int(time.time())}"
    try:
        result = update_security_domain('ciav', mn_id, seg_id, dom_id, new_name)
        if result and result.get('name') == new_name and result.get('id') == dom_id:
            print_pass(f"update_security_domain() updated domain {dom_id} to name '{new_name}'.")
        else:
            print_fail(f"update_security_domain() did not update {dom_id} as expected.", f"Result: {result}")
    except Exception as e:
        print_fail(f"update_security_domain() raised exception: {e}")

def test_repo_delete_security_domain():
    print_test_header("test_repo_delete_security_domain")
    mn_id = created_ids.get('mission_network_repo_temp_sd')
    seg_id = created_ids.get('network_segment_repo_temp_sd')
    dom_id = created_ids.get('security_domain_repo')
    if not mn_id or not seg_id or not dom_id:
        print_fail("Skipping delete test, missing prerequisite IDs (MN/Seg/Domain). Previous tests likely failed.")
        # Attempt cleanup if MN ID exists
        if mn_id:
             try:
                delete_mission_network('ciav', mn_id)
                created_ids['mission_network_repo_temp_sd'] = None
                created_ids['network_segment_repo_temp_sd'] = None
             except: pass
        return
    try:
        deleted = delete_security_domain('ciav', mn_id, seg_id, dom_id)
        if deleted:
            # Verify removal
            domains = get_all_security_domains('ciav', mn_id, seg_id)
            found = any(d.get('id') == dom_id for d in domains)
            if not found:
                print_pass(f"delete_security_domain() deleted domain {dom_id} from Seg {seg_id}.")
                created_ids['security_domain_repo'] = None # Clear ID
            else:
                 print_fail(f"delete_security_domain() claimed success but {dom_id} still found in {seg_id}.")
        else:
            print_fail(f"delete_security_domain() failed to delete domain {dom_id} from Seg {seg_id}.")
    except Exception as e:
        print_fail(f"delete_security_domain() raised exception: {e}")
    finally:
        # Clean up temporary segment and mission network used for domain tests
        temp_seg_id_to_clean = created_ids.get('network_segment_repo_temp_sd')
        temp_mn_id_to_clean = created_ids.get('mission_network_repo_temp_sd')
        # No need to explicitly delete segment, it goes with MN
        if temp_mn_id_to_clean:
            try:
                delete_mission_network('ciav', temp_mn_id_to_clean)
                print(f"--- Cleaned up temporary Mission Network {temp_mn_id_to_clean} (and its contents) ---")
                created_ids['mission_network_repo_temp_sd'] = None
                created_ids['network_segment_repo_temp_sd'] = None # Clear segment ID too
            except Exception as e_clean_mn:
                 print(f"\033[93m[WARN]\033[0m Failed to cleanup temporary MN {temp_mn_id_to_clean}: {e_clean_mn}")

# --- API Tests ---

def setup_api_test_app():
    app = Flask(__name__)
    app.secret_key = 'test_api_key'
    # Ensure the blueprint is registered for API routes
    app.register_blueprint(cis_plan_bp, url_prefix='/') # Make sure prefix is handled if needed
    return app

def test_api_get_all_cis_plan():
    print_test_header("test_api_get_all_cis_plan")
    app = setup_api_test_app()
    with app.test_client() as client:
        # Set environment in session for the request
        with client.session_transaction() as sess:
            sess['environment'] = 'ciav'
        response = client.get('/api/cis_plan/all')
        json_data = response.get_json()
        if response.status_code == 200 and json_data and json_data.get('status') == 'success' and 'data' in json_data:
            print_pass("/api/cis_plan/all endpoint returned success.")
        else:
            print_fail("/api/cis_plan/all endpoint failed.", f"Status: {response.status_code}, JSON: {json_data}")

def test_api_get_all_cis_security_classification():
    print_test_header("test_api_get_all_cis_security_classification")
    app = setup_api_test_app()
    with app.test_client() as client:
        response = client.get('/api/cis_security_classification/all')
        json_data = response.get_json()
        if response.status_code == 200 and json_data and json_data.get('status') == 'success' and 'data' in json_data:
            print_pass("/api/cis_security_classification/all endpoint returned success.")
        else:
            print_fail("/api/cis_security_classification/all endpoint failed.", f"Status: {response.status_code}, JSON: {json_data}")

def test_api_get_cis_security_classification_summary():
    print_test_header("test_api_get_cis_security_classification_summary")
    app = setup_api_test_app()
    with app.test_client() as client:
        response = client.get('/api/cis_security_classification/summary')
        json_data = response.get_json()
        if response.status_code == 200 and json_data and json_data.get('status') == 'success' and 'count' in json_data and isinstance(json_data['count'], int):
            print_pass("/api/cis_security_classification/summary endpoint returned success with count.")
        else:
            print_fail("/api/cis_security_classification/summary endpoint failed.", f"Status: {response.status_code}, JSON: {json_data}")

# --- Mission Network API Tests ---
def test_api_create_mission_network():
    print_test_header("test_api_create_mission_network")
    name = f"apiTestMissionNetwork_{int(time.time())}"
    app = setup_api_test_app()
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['environment'] = 'ciav'
        response = client.post('/api/cis_plan/mission_network', json={'name': name})
        json_data = response.get_json()
        if response.status_code == 201 and json_data and json_data.get('status') == 'success' and json_data.get('data', {}).get('name') == name:
            mn_id = json_data.get('data', {}).get('id')
            if mn_id:
                created_ids['mission_network_api'] = mn_id # Store ID
                print_pass(f"POST /api/cis_plan/mission_network created MN '{name}' with id {mn_id}.")
            else:
                 print_fail("POST /api/cis_plan/mission_network success status but no ID in response.", f"JSON: {json_data}")
            # Optional: Verify via GET /all
        else:
            print_fail("POST /api/cis_plan/mission_network failed.", f"Status: {response.status_code}, JSON: {json_data}")

def test_api_update_mission_network():
    print_test_header("test_api_update_mission_network")
    mn_id = created_ids.get('mission_network_api')
    if not mn_id:
        print_fail("Skipping update API test, no mission network ID from create API test.")
        return
    new_name = f"apiTestMissionNetwork_updated_{int(time.time())}"
    app = setup_api_test_app()
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['environment'] = 'ciav'
        response = client.put(f'/api/cis_plan/mission_network/{mn_id}', json={'name': new_name})
        json_data = response.get_json()
        if response.status_code == 200 and json_data and json_data.get('status') == 'success' and json_data.get('data', {}).get('name') == new_name and json_data.get('data', {}).get('id') == mn_id:
            print_pass(f"PUT /api/cis_plan/mission_network/{mn_id} updated MN to name '{new_name}'.")
        else:
            print_fail(f"PUT /api/cis_plan/mission_network/{mn_id} failed.", f"Status: {response.status_code}, JSON: {json_data}")

def test_api_delete_mission_network():
    print_test_header("test_api_delete_mission_network")
    mn_id = created_ids.get('mission_network_api')
    if not mn_id:
        print_fail("Skipping delete API test, no mission network ID from create/update API tests.")
        return
    app = setup_api_test_app()
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['environment'] = 'ciav'
        response = client.delete(f'/api/cis_plan/mission_network/{mn_id}')
        json_data = response.get_json()
        if response.status_code == 200 and json_data and json_data.get('status') == 'success' and json_data.get('deleted') == True:
            print_pass(f"DELETE /api/cis_plan/mission_network/{mn_id} succeeded.")
            created_ids['mission_network_api'] = None # Clear ID
             # Optional: Verify via GET /all that it's gone
        else:
            print_fail(f"DELETE /api/cis_plan/mission_network/{mn_id} failed.", f"Status: {response.status_code}, JSON: {json_data}")

# --- Network Segment API Tests ---
def test_api_create_network_segment():
    print_test_header("test_api_create_network_segment")
    mn_id = created_ids.get('mission_network_api')
    if not mn_id:
        print_fail("Skipping create segment API test, no mission network ID from create MN API test.")
        return
    name = f"apiTestSegment_{int(time.time())}"
    app = setup_api_test_app()
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['environment'] = 'ciav'
        response = client.post(f'/api/cis_plan/mission_network/{mn_id}/segment', json={'name': name})
        json_data = response.get_json()
        if response.status_code == 201 and json_data and json_data.get('status') == 'success' and json_data.get('data', {}).get('name') == name:
            seg_id = json_data.get('data', {}).get('id')
            if seg_id:
                created_ids['network_segment_api'] = seg_id # Store ID
                print_pass(f"POST segment created '{name}' with id {seg_id} in MN {mn_id}.")
            else:
                 print_fail("POST segment success status but no ID in response.", f"JSON: {json_data}")
        else:
            print_fail(f"POST segment failed for MN {mn_id}.", f"Status: {response.status_code}, JSON: {json_data}")

def test_api_update_network_segment():
    print_test_header("test_api_update_network_segment")
    mn_id = created_ids.get('mission_network_api')
    seg_id = created_ids.get('network_segment_api')
    if not mn_id or not seg_id:
        print_fail("Skipping update segment API test, missing MN/Segment ID from create tests.")
        return
    new_name = f"apiTestSegment_updated_{int(time.time())}"
    app = setup_api_test_app()
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['environment'] = 'ciav'
        response = client.put(f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}', json={'name': new_name})
        json_data = response.get_json()
        if response.status_code == 200 and json_data and json_data.get('status') == 'success' and json_data.get('data', {}).get('name') == new_name and json_data.get('data', {}).get('id') == seg_id:
            print_pass(f"PUT segment updated {seg_id} to name '{new_name}'.")
        else:
            print_fail(f"PUT segment update failed for {seg_id}.", f"Status: {response.status_code}, JSON: {json_data}")

def test_api_delete_network_segment():
    print_test_header("test_api_delete_network_segment")
    mn_id = created_ids.get('mission_network_api')
    seg_id = created_ids.get('network_segment_api')
    if not mn_id or not seg_id:
        print_fail("Skipping delete segment API test, missing MN/Segment ID from create/update tests.")
        return
    app = setup_api_test_app()
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['environment'] = 'ciav'
        response = client.delete(f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}')
        json_data = response.get_json()
        if response.status_code == 200 and json_data and json_data.get('status') == 'success' and json_data.get('deleted') == True:
            print_pass(f"DELETE segment {seg_id} succeeded.")
            created_ids['network_segment_api'] = None # Clear ID
        else:
            print_fail(f"DELETE segment failed for {seg_id}.", f"Status: {response.status_code}, JSON: {json_data}")

# --- Security Domain API Tests ---
def test_api_create_security_domain():
    print_test_header("test_api_create_security_domain")
    mn_id = created_ids.get('mission_network_api')
    seg_id = created_ids.get('network_segment_api') # This ID comes from the re-created segment
    if not mn_id or not seg_id:
        print_fail("Skipping create domain API test, missing MN/Segment ID from previous API tests.")
        return
    name = f"apiTestDomain_{int(time.time())}"
    app = setup_api_test_app()
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['environment'] = 'ciav'
        response = client.post(f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain', json={'name': name})
        json_data = response.get_json()
        if response.status_code == 201 and json_data and json_data.get('status') == 'success' and json_data.get('data', {}).get('name') == name:
            dom_id = json_data.get('data', {}).get('id')
            if dom_id:
                created_ids['security_domain_api'] = dom_id # Store ID
                print_pass(f"POST domain created '{name}' with id {dom_id} in Seg {seg_id}/MN {mn_id}.")
            else:
                 print_fail("POST domain success status but no ID in response.", f"JSON: {json_data}")
        else:
            print_fail(f"POST domain failed for Seg {seg_id}/MN {mn_id}.", f"Status: {response.status_code}, JSON: {json_data}")

def test_api_update_security_domain():
    print_test_header("test_api_update_security_domain")
    mn_id = created_ids.get('mission_network_api')
    seg_id = created_ids.get('network_segment_api')
    dom_id = created_ids.get('security_domain_api')
    if not mn_id or not seg_id or not dom_id:
        print_fail("Skipping update domain API test, missing MN/Segment/Domain ID from create tests.")
        return
    new_name = f"apiTestDomain_updated_{int(time.time())}"
    app = setup_api_test_app()
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['environment'] = 'ciav'
        response = client.put(f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}', json={'name': new_name})
        json_data = response.get_json()
        if response.status_code == 200 and json_data and json_data.get('status') == 'success' and json_data.get('data', {}).get('name') == new_name and json_data.get('data', {}).get('id') == dom_id:
            print_pass(f"PUT domain updated {dom_id} to name '{new_name}'.")
        else:
            print_fail(f"PUT domain update failed for {dom_id}.", f"Status: {response.status_code}, JSON: {json_data}")

def test_api_delete_security_domain():
    print_test_header("test_api_delete_security_domain")
    mn_id = created_ids.get('mission_network_api')
    seg_id = created_ids.get('network_segment_api')
    dom_id = created_ids.get('security_domain_api')
    if not mn_id or not seg_id or not dom_id:
        print_fail("Skipping delete domain API test, missing MN/Segment/Domain ID from create/update tests.")
        return
    app = setup_api_test_app()
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['environment'] = 'ciav'
        response = client.delete(f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}')
        json_data = response.get_json()
        if response.status_code == 200 and json_data and json_data.get('status') == 'success' and json_data.get('deleted') == True:
            print_pass(f"DELETE domain {dom_id} succeeded.")
            created_ids['security_domain_api'] = None # Clear ID
        else:
            print_fail(f"DELETE domain failed for {dom_id}.", f"Status: {response.status_code}, JSON: {json_data}")

if __name__ == '__main__':
    print("Starting CIS Plan Tests...")

    # --- Test Repository Functions ---
    test_repo_get_all_cis_plan()
    test_repo_get_all_cis_security_classification()

    # Mission Network Repo CRUD
    test_repo_add_mission_network()
    test_repo_update_mission_network()
    test_repo_delete_mission_network()

    # Network Segment Repo CRUD (uses temporary MN)
    test_repo_add_network_segment()
    test_repo_update_network_segment()
    test_repo_delete_network_segment()

    # Security Domain Repo CRUD
    test_repo_add_security_domain()
    test_repo_get_all_security_domains()
    test_repo_update_security_domain()
    test_repo_delete_security_domain()


    # --- Test API Endpoints ---
    print("\n--- Testing API Endpoints ---")
    test_api_get_all_cis_plan()
    test_api_get_all_cis_security_classification()
    test_api_get_cis_security_classification_summary()

    # Mission Network API CRUD
    test_api_create_mission_network()
    test_api_update_mission_network()
    # Keep MN for segment tests
    # test_api_delete_mission_network() # Keep for segment tests

    # Network Segment API CRUD
    test_api_create_network_segment()
    test_api_update_network_segment()
    # Don't delete segment yet, needed for domain tests.
    # test_api_delete_network_segment()

    # Security Domain API CRUD
    # Re-create a segment first as the previous one might have been deleted or we want a fresh one
    print("\n--- Re-creating Network Segment for Domain API tests ---")
    test_api_create_network_segment() # Create the segment needed for domain tests
    test_api_create_security_domain()
    test_api_update_security_domain()
    test_api_delete_security_domain()

    # Final cleanup for API tests
    print("\n--- Final API Cleanup ---")
    if created_ids['mission_network_api']:
        test_api_delete_mission_network() # Cleanup the API MN

    print("\nCIS Plan Tests Completed.")

    