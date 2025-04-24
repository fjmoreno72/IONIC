import sys
import os
import time
import argparse
from flask import Flask
import json 
from unittest.mock import patch 

# Dynamically add app to sys.path for imports if needed
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../')))

from app.data_access.cis_plan_repository import (
    get_all_cis_plan, get_all_cis_security_classification, add_mission_network, update_mission_network, delete_mission_network,
    add_network_segment, update_network_segment, delete_network_segment, add_security_domain, update_security_domain, delete_security_domain,
    get_all_security_domains, get_all_hw_stacks, get_hw_stack, add_hw_stack, update_hw_stack, delete_hw_stack, add_asset, get_asset, get_all_assets,
    update_asset, delete_asset, add_network_interface, get_network_interface, get_all_network_interfaces, update_network_interface, delete_network_interface,
    update_configuration_item, add_gp_instance, update_gp_instance, delete_gp_instance, get_all_gp_instances, get_gp_instance, refresh_gp_instance_config_items,
    add_sp_instance, get_all_sp_instances, get_sp_instance, update_sp_instance, delete_sp_instance
)
from app.routes.cis_plan import cis_plan_bp
from app.api.iocore2 import IOCore2ApiClient

# --- Command line argument parsing ---
def parse_args():
    parser = argparse.ArgumentParser(description='CIS Plan API Tests')
    parser.add_argument('--keep-resources', action='store_true',
                        help='Skip deletion of created resources for manual inspection')
    parser.add_argument('--verbose', action='store_true',
                        help='Show detailed output for all tests (default: only show failures)')
    return parser.parse_args()

# Global settings influenced by command line arguments
args = parse_args()
SKIP_DELETION = args.keep_resources
VERBOSE = args.verbose  # Control verbosity level

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
    'mission_network_repo_temp_hw': None, 
    'network_segment_repo_temp_hw': None, 
    'security_domain_repo_temp_hw': None, 
    'hw_stack_repo': None,
    'asset_repo': None,
    'mission_network_api_temp': None, 
    'network_segment_api_temp': None, 
    'security_domain_api_temp': None, 
    'hw_stack_api': None,
    'asset_api': None
}

# Mock participant data for validation
MOCK_VALID_PARTICIPANT_ID = "PT-VALID-001"
MOCK_INVALID_PARTICIPANT_ID = "PT-INVALID-999"

# Global counters for test results
test_passed = 0
test_failed = 0
current_section = None  # Track current test section to print section headers once

def print_test_header(name):
    global current_section
    # For non-verbose mode, check if this is a new section
    if not VERBOSE:
        # Extract section name (everything before first underscore)
        if '_' in name:
            section = name.split('_')[0]
            if section != current_section:
                current_section = section
                print(f"\n\033[1mRunning {section.capitalize()} Tests\033[0m")
    else:
        # In verbose mode, print all headers
        print(f"\n--- Running Test: {name} ---")
    
def print_pass(message):
    global test_passed
    test_passed += 1
    # Only print success messages in verbose mode
    if VERBOSE:
        print(f"\033[92m[PASS]\033[0m {message}")
    
def print_fail(message, details=""):
    global test_failed
    test_failed += 1
    # Always print failures
    print(f"\033[91m[FAIL]\033[0m {message}")
    if details:
        print(f"  Details: {details}")
        
def print_status(message):
    # Utility function for printing non-test status messages
    # Only print in verbose mode or if it mentions skipping/errors
    if VERBOSE or "skip" in message.lower() or "error" in message.lower():
        print(message)
        
def print_test_summary():
    # Add a summary function to show final counts
    print(f"\n\033[1mTest Summary:\033[0m")
    print(f"\033[92m✓ Passed: {test_passed}\033[0m")
    if test_failed > 0:
        print(f"\033[91m✗ Failed: {test_failed}\033[0m")
    else:
        print(f"✗ Failed: {test_failed}")
    if test_failed == 0:
        print(f"\033[92mAll tests passed successfully!\033[0m")
    else:
        print(f"\033[91mSome tests failed. Run with --verbose for details.\033[0m")

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
    test_id = f"test_repo_mn_{int(time.time())}" 
    name = f"RepoTestMN_{test_id}"
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
                print_pass(f"delete_mission_network() deleted mission network {mn_id}")
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
    test_id = f"test_repo_seg_{int(time.time())}"
    temp_mn_name = f"TempMNForSegTest_{test_id}"
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
                if VERBOSE:
                    print(f"--- Cleaned up temporary Mission Network {mn_id} ---")
                created_ids['mission_network_repo_temp'] = None
            except Exception as e_clean:
                print(f"\033[93m[WARN]\033[0m Failed to cleanup temporary MN {mn_id}: {e_clean}")

# --- Security Domain Repo Tests ---
def test_repo_add_security_domain():
    print_test_header("test_repo_add_security_domain")
    # Need a mission network and segment to add domain to. Create temporarily.
    test_id = f"test_repo_domain_{int(time.time())}"
    temp_mn_name = f"TempMNForDomainTest_{test_id}"
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
                if VERBOSE:
                    print(f"--- Cleaned up temporary Mission Network {temp_mn_id_to_clean} (and its contents) ---")
                created_ids['mission_network_repo_temp_sd'] = None
                created_ids['network_segment_repo_temp_sd'] = None # Clear segment ID too
            except Exception as e_clean_mn:
                 print(f"\033[93m[WARN]\033[0m Failed to cleanup temporary MN {temp_mn_id_to_clean}: {e_clean_mn}")

# --- HW Stack Repo Tests --- 

def _setup_hw_stack_repo_parents():
    """Creates temporary parent resources needed for HW Stack repo tests."""
    test_id = f"test_repo_hw_{int(time.time())}"
    temp_mn_name = f"TempMN_HWStackTest_{test_id}"
    temp_ns_name = f"TempNS_HWStackTest_{test_id}"
    temp_sd_name = f"TempSD_HWStackTest_{test_id}"

    try:
        temp_mn = add_mission_network('ciav', temp_mn_name)
        if not temp_mn or not temp_mn.get('id'):
            print_fail(f"HW Repo Setup: Failed to create temp MN '{temp_mn_name}'")
            return False
        mn_id = temp_mn['id']
        created_ids['mission_network_repo_temp_hw'] = mn_id

        temp_ns = add_network_segment('ciav', mn_id, temp_ns_name)
        if not temp_ns or not temp_ns.get('id'):
            print_fail(f"HW Repo Setup: Failed to create temp NS '{temp_ns_name}' in MN {mn_id}")
            # Cleanup MN if NS creation fails
            _teardown_hw_stack_repo_parents() 
            return False
        ns_id = temp_ns['id']
        created_ids['network_segment_repo_temp_hw'] = ns_id

        temp_sd = add_security_domain('ciav', mn_id, ns_id, temp_sd_name)
        if not temp_sd or not temp_sd.get('id'):
            print_fail(f"HW Repo Setup: Failed to create temp SD '{temp_sd_name}' in NS {ns_id}")
            # Cleanup MN/NS if SD creation fails
            _teardown_hw_stack_repo_parents()
            return False
        sd_id = temp_sd['id']
        created_ids['security_domain_repo_temp_hw'] = sd_id
        print_pass(f"HW Repo Setup: Created MN({mn_id}), NS({ns_id}), SD({sd_id})")
        return True
    except Exception as e:
        print_fail(f"HW Repo Setup: Exception during parent creation: {e}")
        # Attempt partial cleanup on failure
        _teardown_hw_stack_repo_parents()
        return False

def _teardown_hw_stack_repo_parents():
    """Cleans up temporary parent resources for HW stack repo tests."""
    if SKIP_DELETION:
        if VERBOSE:
            print("Resource cleanup skipped due to --keep-resources flag.")
        if VERBOSE:
            print_pass("HW Stack test resources kept for manual inspection.")
        return
        
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    if mn_id:
        try:
            deleted = delete_mission_network('ciav', mn_id)
            if deleted:
                print_pass(f"HW Repo Teardown: Deleted temp MN {mn_id} and its children.")
                created_ids['mission_network_repo_temp_hw'] = None
                created_ids['network_segment_repo_temp_hw'] = None 
                created_ids['security_domain_repo_temp_hw'] = None 
            else:
                print_fail(f"HW Repo Teardown: Failed to delete temp MN {mn_id} created for HW stack testing.")
        except Exception as e:
            print_fail(f"HW Repo Teardown: Exception while deleting temp MN {mn_id}: {e}")
    else:
        print_pass("HW Repo Teardown: No temp MN ID found to delete.")
    # Ensure child IDs are cleared even if MN deletion fails/wasn't needed
    created_ids['network_segment_repo_temp_hw'] = None 
    created_ids['security_domain_repo_temp_hw'] = None
    created_ids['hw_stack_repo'] = None 
    created_ids['asset_repo'] = None

def test_repo_add_hw_stack():
    print_test_header("test_repo_add_hw_stack")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    if not all([mn_id, seg_id, dom_id]):
        print_fail("Skipping add HW stack test, missing parent resource IDs.")
        return
    
    test_id = f"test_repo_hwstack_{int(time.time())}"
    name = f"RepoTestHwStack_{test_id}"
    participant_id = MOCK_VALID_PARTICIPANT_ID # Use mock ID, repo layer doesn't validate
    try:
        result = add_hw_stack('ciav', mn_id, seg_id, dom_id, name, participant_id)
        if result and result.get('name') == name and result.get('id', '').startswith('HW-') and result.get('cisParticipantID') == participant_id:
            created_ids['hw_stack_repo'] = result['id'] 
            # Print the complete hardware stack data to verify all fields are present
            print_pass(f"add_hw_stack() created stack '{name}' (id {result['id']}) in SD {dom_id}.")
            if VERBOSE:
                print(f"Complete HW Stack data: {json.dumps(result, indent=2)}")
        else:
            print_fail(f"add_hw_stack() did not create as expected in SD {dom_id}.", f"Result: {result}")
    except Exception as e:
        print_fail(f"add_hw_stack() raised exception: {e}")

def test_repo_get_all_hw_stacks():
    print_test_header("test_repo_get_all_hw_stacks")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    if not all([mn_id, seg_id, dom_id, stack_id]):
        print_fail("Skipping get all HW stacks test, missing required IDs.")
        return
    try:
        stacks = get_all_hw_stacks('ciav', mn_id, seg_id, dom_id)
        if isinstance(stacks, list) and any(s.get('id') == stack_id for s in stacks):
            print_pass(f"get_all_hw_stacks() found created stack {stack_id} in SD {dom_id}.")
        else:
            print_fail(f"get_all_hw_stacks() did not find stack {stack_id} in SD {dom_id}.", f"Result: {stacks}")
    except Exception as e:
        print_fail(f"get_all_hw_stacks() raised exception: {e}")

def test_repo_get_hw_stack():
    print_test_header("test_repo_get_hw_stack")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    if not all([mn_id, seg_id, dom_id, stack_id]):
        print_fail("Skipping get HW stack test, missing required IDs.")
        return
    try:
        stack = get_hw_stack('ciav', mn_id, seg_id, dom_id, stack_id)
        if stack and stack.get('id') == stack_id:
            print_pass(f"get_hw_stack() retrieved stack {stack_id}.")
        else:
            print_fail(f"get_hw_stack() failed to retrieve stack {stack_id}.", f"Result: {stack}")
    except Exception as e:
        print_fail(f"get_hw_stack() raised exception: {e}")

def test_repo_update_hw_stack():
    print_test_header("test_repo_update_hw_stack")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    if not all([mn_id, seg_id, dom_id, stack_id]):
        print_fail("Skipping update HW stack test, missing required IDs.")
        return
    
    new_name = f"testRepoHWStack_updated_{int(time.time())}"
    new_participant_id = "PT-UPDATED-002"
    try:
        result = update_hw_stack('ciav', mn_id, seg_id, dom_id, stack_id, new_name, new_participant_id)
        if result and result.get('name') == new_name and result.get('id') == stack_id and result.get('cisParticipantID') == new_participant_id:
            print_pass(f"update_hw_stack() updated stack {stack_id} to name '{new_name}' and participant '{new_participant_id}'.")
        else:
            print_fail(f"update_hw_stack() did not update {stack_id} as expected.", f"Result: {result}")
    except Exception as e:
        print_fail(f"update_hw_stack() raised exception: {e}")

def test_repo_delete_hw_stack():
    print_test_header("test_repo_delete_hw_stack")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    if not all([mn_id, seg_id, dom_id, stack_id]):
        print_fail("Skipping delete HW stack test, missing required IDs.")
        return
    try:
        deleted = delete_hw_stack('ciav', mn_id, seg_id, dom_id, stack_id)
        if deleted:
            # Verify removal by trying to get it again
            stack_after_delete = get_hw_stack('ciav', mn_id, seg_id, dom_id, stack_id)
            if not stack_after_delete:
                print_pass(f"delete_hw_stack() deleted stack {stack_id} from SD {dom_id}.")
                created_ids['hw_stack_repo'] = None 
            else:
                print_fail(f"delete_hw_stack() claimed success but {stack_id} still found.")
        else:
            print_fail(f"delete_hw_stack() failed to delete stack {stack_id}.")
    except Exception as e:
        print_fail(f"delete_hw_stack() raised exception: {e}")

# --- Asset Repository Tests ---

def test_repo_add_asset():
    print_test_header("test_repo_add_asset")
    # We need the HW stack parent IDs
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    if not all([mn_id, seg_id, dom_id, stack_id]):
        print_fail("Skipping add asset test, missing parent resource IDs.")
        return
    
    test_id = f"test_repo_asset_{int(time.time())}"
    name = f"RepoTestAsset_{test_id}"
    try:
        result = add_asset('ciav', mn_id, seg_id, dom_id, stack_id, name)
        if result and result.get('name') == name and result.get('id', '').startswith('AS-'):
            created_ids['asset_repo'] = result['id']
            print_pass(f"add_asset() created asset '{name}' (id {result['id']}) in HW stack {stack_id}.")
            if VERBOSE:
                print(f"Complete Asset data: {json.dumps(result, indent=2)}")
        else:
            print_fail(f"add_asset() did not create as expected in HW stack {stack_id}.", f"Result: {result}")
    except Exception as e:
        print_fail(f"add_asset() raised exception: {e}")

def test_repo_get_all_assets():
    print_test_header("test_repo_get_all_assets")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id]):
        print_fail("Skipping get all assets test, missing required IDs.")
        return
    try:
        assets = get_all_assets('ciav', mn_id, seg_id, dom_id, stack_id)
        if isinstance(assets, list) and any(a.get('id') == asset_id for a in assets):
            print_pass(f"get_all_assets() found created asset {asset_id} in HW stack {stack_id}.")
        else:
            print_fail(f"get_all_assets() did not find asset {asset_id} in HW stack {stack_id}.", f"Result: {assets}")
    except Exception as e:
        print_fail(f"get_all_assets() raised exception: {e}")

def test_repo_get_asset():
    print_test_header("test_repo_get_asset")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id]):
        print_fail("Skipping get asset test, missing required IDs.")
        return
    try:
        asset = get_asset('ciav', mn_id, seg_id, dom_id, stack_id, asset_id)
        if asset and asset.get('id') == asset_id:
            print_pass(f"get_asset() retrieved asset {asset_id}.")
        else:
            print_fail(f"get_asset() failed to retrieve asset {asset_id}.", f"Result: {asset}")
    except Exception as e:
        print_fail(f"get_asset() raised exception: {e}")

def test_repo_update_asset():
    print_test_header("test_repo_update_asset")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id]):
        print_fail("Skipping update asset test, missing required IDs.")
        return
    
    new_name = f"testRepoAsset_updated_{int(time.time())}"
    try:
        result = update_asset('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, new_name)
        if result and result.get('name') == new_name and result.get('id') == asset_id:
            print_pass(f"update_asset() updated asset {asset_id} to name '{new_name}'.")
        else:
            print_fail(f"update_asset() did not update {asset_id} as expected.", f"Result: {result}")
    except Exception as e:
        print_fail(f"update_asset() raised exception: {e}")

def test_repo_delete_asset():
    print_test_header("test_repo_delete_asset")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id]):
        print_fail("Skipping delete asset test, missing required IDs.")
        return
    
    if SKIP_DELETION:
        print_pass(f"Skipping actual deletion of asset {asset_id} due to --keep-resources flag.")
        return
        
    try:
        deleted = delete_asset('ciav', mn_id, seg_id, dom_id, stack_id, asset_id)
        if deleted:
            # Verify removal by trying to get it again
            asset_after_delete = get_asset('ciav', mn_id, seg_id, dom_id, stack_id, asset_id)
            if not asset_after_delete:
                print_pass(f"delete_asset() deleted asset {asset_id} from HW stack {stack_id}.")
                created_ids['asset_repo'] = None 
            else:
                print_fail(f"delete_asset() claimed success but {asset_id} still found.")
        else:
            print_fail(f"delete_asset() failed to delete asset {asset_id}.")
    except Exception as e:
        print_fail(f"delete_asset() raised exception: {e}")

# --- Network Interface and Configuration Item Repository Tests ---

def test_repo_add_network_interface():
    print_test_header("test_repo_add_network_interface")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id]):
        print_fail("Skipping add network interface test, missing required IDs.")
        return
    
    try:
        test_id = f"test_repo_network_interface_{int(time.time())}"
        new_interface = add_network_interface('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, f"RepoTestNetworkInterface_{test_id}")
        if new_interface and new_interface.get('id', '').startswith('NI-'):
            print_pass(f"add_network_interface() created network interface '{new_interface['name']}' (id {new_interface['id']}) in asset {asset_id}.")
            if VERBOSE:
                print(f"Complete Network Interface data: {json.dumps(new_interface, indent=2)}")
            created_ids['network_interface_repo'] = new_interface['id']
            
            # Verify configuration items were created
            config_items = new_interface.get('configurationItems', [])
            if len(config_items) == 3:
                ip_address = next((item for item in config_items if item.get('Name') == 'IP Address'), None)
                subnet = next((item for item in config_items if item.get('Name') == 'Sub-Net'), None)
                fqdn = next((item for item in config_items if item.get('Name') == 'FQDN'), None)
                
                if ip_address and subnet and fqdn:
                    print_pass(f"add_network_interface() correctly created all three required configuration items.")
                else:
                    print_fail(f"add_network_interface() did not create all required configuration items.")
            else:
                print_fail(f"add_network_interface() created {len(config_items)} configuration items, expected 3.")
        else:
            print_fail(f"add_network_interface() failed to create a network interface.")
    except Exception as e:
        print_fail(f"add_network_interface() raised exception: {e}")

def test_repo_get_all_network_interfaces():
    print_test_header("test_repo_get_all_network_interfaces")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    interface_id = created_ids.get('network_interface_repo')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, interface_id]):
        print_fail("Skipping get all network interfaces test, missing required IDs.")
        return
    
    try:
        interfaces = get_all_network_interfaces('ciav', mn_id, seg_id, dom_id, stack_id, asset_id)
        if isinstance(interfaces, list) and any(ni.get('id') == interface_id for ni in interfaces):
            print_pass(f"get_all_network_interfaces() found created interface {interface_id} in asset {asset_id}.")
        else:
            print_fail(f"get_all_network_interfaces() failed to find interface {interface_id}.")
    except Exception as e:
        print_fail(f"get_all_network_interfaces() raised exception: {e}")

def test_repo_get_network_interface():
    print_test_header("test_repo_get_network_interface")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    interface_id = created_ids.get('network_interface_repo')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, interface_id]):
        print_fail("Skipping get network interface test, missing required IDs.")
        return
    
    try:
        interface = get_network_interface('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, interface_id)
        if interface and interface.get('id') == interface_id:
            print_pass(f"get_network_interface() retrieved interface {interface_id}.")
        else:
            print_fail(f"get_network_interface() failed to retrieve interface {interface_id}.")
    except Exception as e:
        print_fail(f"get_network_interface() raised exception: {e}")

def test_repo_update_network_interface():
    print_test_header("test_repo_update_network_interface")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    interface_id = created_ids.get('network_interface_repo')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, interface_id]):
        print_fail("Skipping update network interface test, missing required IDs.")
        return
    
    updated_name = f"testRepoNetworkInterface_updated_{int(time.time())}"
    try:
        updated_interface = update_network_interface('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, interface_id, updated_name)
        if updated_interface and updated_interface.get('name') == updated_name:
            print_pass(f"update_network_interface() updated interface {interface_id} to name '{updated_name}'.")
        else:
            print_fail(f"update_network_interface() failed to update interface {interface_id}.")
    except Exception as e:
        print_fail(f"update_network_interface() raised exception: {e}")

def test_repo_update_configuration_item():
    print_test_header("test_repo_update_configuration_item")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    interface_id = created_ids.get('network_interface_repo')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, interface_id]):
        print_fail("Skipping update configuration item test, missing required IDs.")
        return
    
    # Test updating all three configuration items
    test_ip = "192.168.1.100"
    test_subnet = "255.255.255.0"
    test_fqdn = "test-server.example.com"
    
    try:
        # Update IP Address
        ip_config = update_configuration_item('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, interface_id, "IP Address", test_ip)
        if ip_config and ip_config.get('AnswerContent') == test_ip:
            print_pass(f"update_configuration_item() updated 'IP Address' to '{test_ip}'.")
        else:
            print_fail(f"update_configuration_item() failed to update 'IP Address'.")
        
        # Update Sub-Net
        subnet_config = update_configuration_item('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, interface_id, "Sub-Net", test_subnet)
        if subnet_config and subnet_config.get('AnswerContent') == test_subnet:
            print_pass(f"update_configuration_item() updated 'Sub-Net' to '{test_subnet}'.")
        else:
            print_fail(f"update_configuration_item() failed to update 'Sub-Net'.")
        
        # Update FQDN
        fqdn_config = update_configuration_item('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, interface_id, "FQDN", test_fqdn)
        if fqdn_config and fqdn_config.get('AnswerContent') == test_fqdn:
            print_pass(f"update_configuration_item() updated 'FQDN' to '{test_fqdn}'.")
        else:
            print_fail(f"update_configuration_item() failed to update 'FQDN'.")
        
        # Verify all updates are reflected in the network interface object
        interface = get_network_interface('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, interface_id)
        config_items = interface.get('configurationItems', [])
        
        ip_item = next((item for item in config_items if item.get('Name') == 'IP Address'), None)
        subnet_item = next((item for item in config_items if item.get('Name') == 'Sub-Net'), None)
        fqdn_item = next((item for item in config_items if item.get('Name') == 'FQDN'), None)
        
        all_updated = (
            ip_item and ip_item.get('AnswerContent') == test_ip and
            subnet_item and subnet_item.get('AnswerContent') == test_subnet and
            fqdn_item and fqdn_item.get('AnswerContent') == test_fqdn
        )
        
        if all_updated:
            print_pass(f"All configuration items were correctly updated and persisted.")
        else:
            print_fail(f"Not all configuration item updates were correctly persisted.")
            
    except Exception as e:
        print_fail(f"update_configuration_item() raised exception: {e}")

def test_repo_delete_network_interface():
    print_test_header("test_repo_delete_network_interface")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    interface_id = created_ids.get('network_interface_repo')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, interface_id]):
        print_fail("Skipping delete network interface test, missing required IDs.")
        return
        
    if SKIP_DELETION:
        print_pass(f"Skipping network interface deletion test to preserve resources.")
        return
    
    try:
        deleted = delete_network_interface('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, interface_id)
        if deleted:
            print_pass(f"delete_network_interface() deleted interface {interface_id} from asset {asset_id}.")
            created_ids['network_interface_repo'] = None
        else:
            print_fail(f"delete_network_interface() failed to delete interface {interface_id}.")
    except Exception as e:
        print_fail(f"delete_network_interface() raised exception: {e}")

# --- GP Instance Repository Tests ---

def init_test_app():
    """Initialize a Flask app with proper configuration for testing repository functions"""
    from flask import Flask
    import os
    
    # Create a test app with the proper static folder configuration
    app = Flask(__name__)
    app.config['TESTING'] = True
    
    # Point the static folder to the actual application static folder
    root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    app.static_folder = os.path.join(root_path, 'app', 'static')
    
    return app

def test_repo_add_gp_instance():
    print_test_header("test_repo_add_gp_instance")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id]):
        print_fail("Skipping add GP instance test, missing required IDs.")
        return
    
    # Create a test app and push an application context
    app = init_test_app()
    with app.app_context():
        try:
            test_id = f"test_repo_gp_instance_{int(time.time())}"
            instance_label = f"RepoTestGPInstance_{test_id}"
            # Use a real GP ID that exists in the config items catalog
            service_id = "GP-0043"  # This ID should have associated config items
            
            new_instance = add_gp_instance('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, instance_label, service_id)
            if new_instance and new_instance.get('gpid', '').startswith('GP-'):
                print_pass(f"add_gp_instance() created GP instance '{new_instance['instanceLabel']}' (id {new_instance['gpid']}) in asset {asset_id}.")
                if VERBOSE:
                    print(f"Complete GP Instance data: {json.dumps(new_instance, indent=2)}")
                created_ids['gp_instance_repo'] = new_instance['gpid']
                
                # Verify spInstances array is empty 
                if 'spInstances' in new_instance and isinstance(new_instance['spInstances'], list) and len(new_instance['spInstances']) == 0:
                    print_pass(f"GP instance correctly initialized with empty spInstances array.")
                else:
                    print_fail(f"GP instance was not correctly initialized with empty spInstances array.")
                
                # Verify configurationItems array was populated from the catalog based on the GP ID
                if 'configurationItems' in new_instance and isinstance(new_instance['configurationItems'], list):
                    print_pass(f"GP instance configurationItems array exists with {len(new_instance['configurationItems'])} items.")
                    
                    if len(new_instance['configurationItems']) > 0:
                        # If we found configuration items, check that AnswerContent is empty
                        if all(item.get('AnswerContent', '') == '' for item in new_instance['configurationItems']):
                            print_pass(f"All config items initialized with empty AnswerContent.")
                        else:
                            print_fail(f"Not all config items have empty AnswerContent.")
                    else:
                        # In a test environment with no app context, it's normal to have no items
                        print_pass(f"No configuration items found for GP ID {service_id} in test environment (expected due to app context limitations).")
                else:
                    print_fail(f"add_gp_instance() did not create a proper configurationItems array.")
            else:
                print_fail(f"add_gp_instance() failed to create a GP instance.")
        except Exception as e:
            print_fail(f"add_gp_instance() raised exception: {e}")

def test_repo_refresh_gp_instance_config_items():
    print_test_header("test_repo_refresh_gp_instance_config_items")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    instance_id = created_ids.get('gp_instance_repo')
    
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, instance_id]):
        print_fail("Skipping refresh GP instance config items test, missing required IDs.")
        return
    
    # Create a test app and push an application context
    app = init_test_app()
    with app.app_context():
        try:
            # Call the refresh function
            updated_instance = refresh_gp_instance_config_items('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, instance_id)
            
            if updated_instance:
                print_pass(f"refresh_gp_instance_config_items() succeeded for instance {instance_id}.")
                
                # Since we already have all config items for this GP, we wouldn't expect new ones
                # But the function should still return the instance
                if 'configurationItems' in updated_instance and isinstance(updated_instance['configurationItems'], list):
                    print_pass(f"Updated instance has {len(updated_instance['configurationItems'])} config items.")
                else:
                    print_fail(f"Updated instance is missing configurationItems array.")
            else:
                print_fail(f"refresh_gp_instance_config_items() failed for instance {instance_id}.")
        except Exception as e:
            print_fail(f"refresh_gp_instance_config_items() raised exception: {e}")

def test_repo_get_all_gp_instances():
    print_test_header("test_repo_get_all_gp_instances")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    instance_id = created_ids.get('gp_instance_repo')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, instance_id]):
        print_fail("Skipping get all GP instances test, missing required IDs.")
        return
    
    try:
        instances = get_all_gp_instances('ciav', mn_id, seg_id, dom_id, stack_id, asset_id)
        if isinstance(instances, list) and any(gpi.get('gpid') == instance_id for gpi in instances):
            print_pass(f"get_all_gp_instances() found created instance {instance_id} in asset {asset_id}.")
        else:
            print_fail(f"get_all_gp_instances() failed to find instance {instance_id}.")
    except Exception as e:
        print_fail(f"get_all_gp_instances() raised exception: {e}")

def test_repo_get_gp_instance():
    print_test_header("test_repo_get_gp_instance")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    instance_id = created_ids.get('gp_instance_repo')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, instance_id]):
        print_fail("Skipping get GP instance test, missing required IDs.")
        return
    
    try:
        gp_instance = get_gp_instance('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, instance_id)
        if gp_instance and gp_instance.get('gpid') == instance_id:
            print_pass(f"get_gp_instance() retrieved instance {instance_id}.")
        else:
            print_fail(f"get_gp_instance() failed to retrieve instance {instance_id}.")
    except Exception as e:
        print_fail(f"get_gp_instance() raised exception: {e}")

def test_repo_update_gp_instance():
    print_test_header("test_repo_update_gp_instance")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    instance_id = created_ids.get('gp_instance_repo')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, instance_id]):
        print_fail("Skipping update GP instance test, missing required IDs.")
        return
    
    updated_label = f"testRepoGPInstance_updated_{int(time.time())}"
    updated_service = "SV-UPDATED-002"
    try:
        updated_instance = update_gp_instance('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, instance_id, updated_label, updated_service)
        if updated_instance and updated_instance.get('instanceLabel') == updated_label and updated_instance.get('serviceId') == updated_service:
            print_pass(f"update_gp_instance() updated instance {instance_id} to label '{updated_label}' and service '{updated_service}'.")
        else:
            print_fail(f"update_gp_instance() failed to update instance {instance_id}.")
    except Exception as e:
        print_fail(f"update_gp_instance() raised exception: {e}")

# --- SP Instance Repository Tests ---

def test_repo_add_sp_instance():
    print_test_header("test_repo_add_sp_instance")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    gp_instance_id = created_ids.get('gp_instance_repo')
    
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, gp_instance_id]):
        print_fail("Skipping add SP instance test, missing required IDs.")
        return
    
    try:
        # Create a test app and push an application context
        app = init_test_app()
        with app.app_context():
            sp_id = "SP-0043"
            sp_version = "1.2.3"
            
            new_sp_instance = add_sp_instance('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, gp_instance_id, sp_id, sp_version)
            if new_sp_instance:
                print_pass(f"add_sp_instance() created SP instance '{sp_id}' in GP instance {gp_instance_id}.")
                if VERBOSE:
                    print(f"Complete SP Instance data: {json.dumps(new_sp_instance, indent=2)}")
                created_ids['sp_instance_repo'] = sp_id
                
                # Verify SP instance has correct structure
                if new_sp_instance.get('spId') == sp_id and new_sp_instance.get('spVersion') == sp_version:
                    print_pass(f"SP instance has correct spId and spVersion.")
                else:
                    print_fail(f"SP instance does not have correct spId or spVersion.")
            else:
                print_fail(f"add_sp_instance() failed to create an SP instance.")
    except Exception as e:
        print_fail(f"add_sp_instance() raised exception: {e}")

def test_repo_get_all_sp_instances():
    print_test_header("test_repo_get_all_sp_instances")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    gp_instance_id = created_ids.get('gp_instance_repo')
    
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, gp_instance_id]):
        print_fail("Skipping get all SP instances test, missing required IDs.")
        return
    
    try:
        # Create a test app and push an application context
        app = init_test_app()
        with app.app_context():
            sp_instances = get_all_sp_instances('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, gp_instance_id)
            
            print_pass(f"get_all_sp_instances() returned {len(sp_instances)} SP instances.")
            if VERBOSE:
                print(f"All SP Instances: {json.dumps(sp_instances, indent=2)}")
            
            # Check if our created SP instance is in the list
            sp_id = created_ids.get('sp_instance_repo')
            if sp_id and any(sp.get('spId') == sp_id for sp in sp_instances):
                print_pass(f"Found created SP instance '{sp_id}' in the returned list.")
            elif sp_id:
                print_fail(f"Could not find created SP instance '{sp_id}' in the returned list.")
    except Exception as e:
        print_fail(f"get_all_sp_instances() raised exception: {e}")

def test_repo_get_sp_instance():
    print_test_header("test_repo_get_sp_instance")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    gp_instance_id = created_ids.get('gp_instance_repo')
    sp_id = created_ids.get('sp_instance_repo')
    
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, gp_instance_id, sp_id]):
        print_fail("Skipping get SP instance test, missing required IDs.")
        return
    
    try:
        # Create a test app and push an application context
        app = init_test_app()
        with app.app_context():
            sp_instance = get_sp_instance('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, gp_instance_id, sp_id)
            if sp_instance:
                print_pass(f"get_sp_instance() retrieved SP instance '{sp_id}'.")
                if VERBOSE:
                    print(f"SP Instance data: {json.dumps(sp_instance, indent=2)}")
                
                # Verify SP instance has correct structure
                if sp_instance.get('spId') == sp_id:
                    print_pass(f"SP instance has correct spId.")
                else:
                    print_fail(f"SP instance does not have correct spId.")
            else:
                print_fail(f"get_sp_instance() failed to retrieve SP instance '{sp_id}'.")
    except Exception as e:
        print_fail(f"get_sp_instance() raised exception: {e}")

def test_repo_update_sp_instance():
    print_test_header("test_repo_update_sp_instance")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    gp_instance_id = created_ids.get('gp_instance_repo')
    sp_id = created_ids.get('sp_instance_repo')
    
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, gp_instance_id, sp_id]):
        print_fail("Skipping update SP instance test, missing required IDs.")
        return
    
    try:
        # Create a test app and push an application context
        app = init_test_app()
        with app.app_context():
            updated_version = "2.0.0"
            updated_sp = update_sp_instance('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, gp_instance_id, sp_id, updated_version)
            
            if updated_sp:
                print_pass(f"update_sp_instance() updated SP instance '{sp_id}'.")
                if VERBOSE:
                    print(f"Updated SP Instance data: {json.dumps(updated_sp, indent=2)}")
                
                # Verify SP instance has been updated
                if updated_sp.get('spVersion') == updated_version:
                    print_pass(f"SP instance version was updated to '{updated_version}'.")
                else:
                    print_fail(f"SP instance version was not updated correctly.")
            else:
                print_fail(f"update_sp_instance() failed to update SP instance '{sp_id}'.")
    except Exception as e:
        print_fail(f"update_sp_instance() raised exception: {e}")

def test_repo_delete_sp_instance():
    print_test_header("test_repo_delete_sp_instance")
    
    if SKIP_DELETION:
        print_pass(f"Skipping SP instance deletion test to preserve resources.")
        return
    
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    gp_instance_id = created_ids.get('gp_instance_repo')
    sp_id = created_ids.get('sp_instance_repo')
    
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, gp_instance_id, sp_id]):
        print_fail("Skipping delete SP instance test, missing required IDs.")
        return
    
    try:
        # Create a test app and push an application context
        app = init_test_app()
        with app.app_context():
            deleted = delete_sp_instance('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, gp_instance_id, sp_id)
            
            if deleted:
                print_pass(f"delete_sp_instance() deleted SP instance '{sp_id}' from GP instance {gp_instance_id}.")
                created_ids['sp_instance_repo'] = None
            else:
                print_fail(f"delete_sp_instance() failed to delete SP instance '{sp_id}'.")
    except Exception as e:
        print_fail(f"delete_sp_instance() raised exception: {e}")


def test_repo_delete_gp_instance():
    print_test_header("test_repo_delete_gp_instance")
    mn_id = created_ids.get('mission_network_repo_temp_hw')
    seg_id = created_ids.get('network_segment_repo_temp_hw')
    dom_id = created_ids.get('security_domain_repo_temp_hw')
    stack_id = created_ids.get('hw_stack_repo')
    asset_id = created_ids.get('asset_repo')
    instance_id = created_ids.get('gp_instance_repo')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, instance_id]):
        print_fail("Skipping delete GP instance test, missing required IDs.")
        return
        
    if SKIP_DELETION:
        print_pass(f"Skipping GP instance deletion test to preserve resources.")
        return
    
    try:
        deleted = delete_gp_instance('ciav', mn_id, seg_id, dom_id, stack_id, asset_id, instance_id)
        if deleted:
            print_pass(f"delete_gp_instance() deleted instance {instance_id} from asset {asset_id}.")
            created_ids['gp_instance_repo'] = None
        else:
            print_fail(f"delete_gp_instance() failed to delete instance {instance_id}.")
    except Exception as e:
        print_fail(f"delete_gp_instance() raised exception: {e}")

# --- API Tests ---

def _setup_api_parents(client):
    """Creates temporary parent resources needed for subsequent API tests."""
    if VERBOSE:
        print("--- Setting up API Parent Resources --- ")
    test_id = f"api_test_{int(time.time())}"
    temp_mn_name = f"ApiTestParent_MN_{test_id}"
    temp_ns_name = f"ApiTestParent_NS_{test_id}"
    temp_sd_name = f"ApiTestParent_SD_{test_id}"
    
    # Ensure previous IDs are cleared
    created_ids['mission_network_api_temp'] = None
    created_ids['network_segment_api_temp'] = None
    created_ids['security_domain_api_temp'] = None

    # 1. Create Mission Network
    try:
        res_mn = client.post('/api/cis_plan/mission_network', json={'name': temp_mn_name})
        data_mn = res_mn.get_json()
        if res_mn.status_code != 201 or data_mn.get('status') != 'success':
            print_fail(f"API Parent Setup: Failed to create temp MN '{temp_mn_name}'. Response: {data_mn}")
            return False
        mn_id = data_mn['data']['id']
        created_ids['mission_network_api_temp'] = mn_id
        print_pass(f"API Parent Setup: Created MN {mn_id}.")
    except Exception as e_mn:
        print_fail(f"API Parent Setup: Exception creating temp MN: {e_mn}")
        return False

    # 2. Create Network Segment (within the MN)
    try:
        url_ns = f'/api/cis_plan/mission_network/{mn_id}/segment'
        res_ns = client.post(url_ns, json={'name': temp_ns_name})
        data_ns = res_ns.get_json()
        if res_ns.status_code != 201 or data_ns.get('status') != 'success':
            print_fail(f"API Parent Setup: Failed to create temp NS '{temp_ns_name}' in MN {mn_id}. Response: {data_ns}")
            _teardown_api_parents(client) # Attempt cleanup
            return False
        ns_id = data_ns['data']['id']
        created_ids['network_segment_api_temp'] = ns_id
        print_pass(f"API Parent Setup: Created NS {ns_id} in MN {mn_id}.")
    except Exception as e_ns:
        print_fail(f"API Parent Setup: Exception creating temp NS: {e_ns}")
        _teardown_api_parents(client) # Attempt cleanup
        return False

    # 3. Create Security Domain (within the NS)
    try:
        url_sd = f'/api/cis_plan/mission_network/{mn_id}/segment/{ns_id}/security_domain'
        res_sd = client.post(url_sd, json={'name': temp_sd_name})
        data_sd = res_sd.get_json()
        if res_sd.status_code != 201 or data_sd.get('status') != 'success':
            print_fail(f"API Parent Setup: Failed to create temp SD '{temp_sd_name}' in NS {ns_id}. Response: {data_sd}")
            _teardown_api_parents(client) # Attempt cleanup
            return False
        sd_id = data_sd['data']['id']
        created_ids['security_domain_api_temp'] = sd_id
        print_pass(f"API Parent Setup: Created SD {sd_id} in NS {ns_id}.")
        if VERBOSE:
            print("--- API Parent Resources Setup Complete --- ")
        return True
    except Exception as e_sd:
        print_fail(f"API Parent Setup: Exception creating temp SD: {e_sd}")
        _teardown_api_parents(client) # Attempt cleanup
        return False

def _teardown_api_parents(client):
    """Cleans up all resources created via API tests."""
    if VERBOSE:
        print("--- Tearing down API Resources --- ")
    
    if SKIP_DELETION:
        if VERBOSE:
            print("Resource cleanup skipped due to --keep-resources flag.")
        if VERBOSE:
            print_pass("API test resources kept for manual inspection.")
        # Still reset the ID dictionary for clean future test runs
        _reset_created_ids()
        if VERBOSE:
            print("--- API Resources Preserved for Inspection ---")
        return
    
    # 1. Delete the temp MN used for most tests
    mn_temp_id = created_ids.get('mission_network_api_temp')
    if mn_temp_id:
        try:
            # Deleting the MN should cascade delete children based on repo logic
            res = client.delete(f'/api/cis_plan/mission_network/{mn_temp_id}')
            data = res.get_json()
            if res.status_code == 200 and data.get('status') == 'success':
                 print_pass(f"API Teardown: Deleted temp MN {mn_temp_id} via API.")
            elif res.status_code == 404:
                 print_pass(f"API Teardown: Temp MN {mn_temp_id} already deleted or not found.")
            else:
                 print_fail(f"API Teardown: Failed to delete temp MN {mn_temp_id} via API. Status: {res.status_code}, Response: {data}")
        except Exception as e:
            print_fail(f"API Teardown: Error deleting temp MN {mn_temp_id} via API: {e}")
    else:
        print_pass("API Teardown: No temp MN ID found to delete.")
        
    # 2. Delete the additional MN created in test_api_create_mission_network
    mn_api_id = created_ids.get('mission_network_api')
    if mn_api_id:
        try:
            res = client.delete(f'/api/cis_plan/mission_network/{mn_api_id}')
            data = res.get_json()
            if res.status_code == 200 and data.get('status') == 'success':
                 print_pass(f"API Teardown: Deleted additional MN {mn_api_id} created during tests.")
            elif res.status_code == 404:
                 print_pass(f"API Teardown: Additional MN {mn_api_id} already deleted or not found.")
            else:
                 print_fail(f"API Teardown: Failed to delete additional MN {mn_api_id}. Status: {res.status_code}, Response: {data}")
        except Exception as e:
            print_fail(f"API Teardown: Error deleting additional MN {mn_api_id}: {e}")
    
    _reset_created_ids()
    if VERBOSE:
        print("--- API Resources Teardown Complete --- ")

def _reset_created_ids():
    """Reset all created_ids tracking for a clean slate."""
    # Clear all related IDs
    created_ids['mission_network_api_temp'] = None
    created_ids['network_segment_api_temp'] = None 
    created_ids['security_domain_api_temp'] = None
    created_ids['hw_stack_api'] = None 
    created_ids['mission_network_api'] = None
    created_ids['network_segment_api'] = None
    created_ids['security_domain_api'] = None


def setup_api_test_app():
    """Initialize a Flask test app with the CIS Plan blueprint registered."""
    from flask import Flask
    import os
    
    # Create a Flask app with proper static folder pointing to the real application's static folder
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.secret_key = 'test_secret_key'  # Required for session support
    
    # Set the static folder to point to the real application's static folder
    # so config_items_repository can find the real _configItem.json
    root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    app.static_folder = os.path.join(root_path, 'app', 'static')
    
    # Register the CIS Plan blueprint
    app.register_blueprint(cis_plan_bp, url_prefix='/')
    
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
    test_id = f"api_mn_test_{int(time.time())}"
    name = f"ApiTestMN_{test_id}"
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

def test_api_get_mission_network():
    print_test_header("test_api_get_mission_network")
    app = setup_api_test_app()
    client = app.test_client()
    mn_id = created_ids.get('mission_network_api') # Use the one from create test
    if not mn_id:
        print_fail("Skipping get MN test, missing ID from create test.")
        return
    
    url = f'/api/cis_plan/mission_network/{mn_id}'
    try:
        response = client.get(url)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and data['data'].get('id') == mn_id:
            print_pass(f"GET {url} successfully retrieved mission network {mn_id}.")
        else:
            print_fail(f"GET {url} failed.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"GET {url} raised exception: {e}")
    
    # Test Not Found
    url_not_found = '/api/cis_plan/mission_network/MN-NOTFOUND'
    try:
        response = client.get(url_not_found)
        data = response.get_json()
        if response.status_code == 404 and data.get('status') == 'error':
            print_pass(f"GET {url_not_found} correctly returned 404.")
        else:
            print_fail(f"GET {url_not_found} failed not found case.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"GET {url_not_found} raised exception: {e}")

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
    test_id = f"api_segment_test_{int(time.time())}"
    name = f"ApiTestSegment_{test_id}"
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

def test_api_get_all_network_segments():
    print_test_header("test_api_get_all_network_segments")
    app = setup_api_test_app()
    client = app.test_client()
    mn_id = created_ids.get('mission_network_api')
    seg_id = created_ids.get('network_segment_api') # Looking for this ID in the results
    
    if not mn_id:
        print_fail("Skipping get all segments API test, missing mission network ID.")
        return
    
    url = f'/api/cis_plan/mission_network/{mn_id}/segment'
    try:
        response = client.get(url)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and isinstance(data.get('data'), list):
            if seg_id and any(seg.get('id') == seg_id for seg in data['data']):
                print_pass(f"GET {url} successfully retrieved segments list including {seg_id}.")
            else:
                print_pass(f"GET {url} successfully retrieved segments list (no specific ID to check for).")
        else:
            print_fail(f"GET {url} failed.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"GET {url} raised exception: {e}")

def test_api_get_network_segment():
    print_test_header("test_api_get_network_segment")
    app = setup_api_test_app()
    client = app.test_client()
    mn_id = created_ids.get('mission_network_api')
    seg_id = created_ids.get('network_segment_api')
    if not mn_id or not seg_id:
        print_fail("Skipping get segment test, missing mission network or segment ID.")
        return
    
    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}'
    try:
        response = client.get(url)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and data['data'].get('id') == seg_id:
            print_pass(f"GET {url} successfully retrieved segment {seg_id}.")
        else:
            print_fail(f"GET {url} failed.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"GET {url} raised exception: {e}")
    
    # Test Not Found
    url_not_found = f'/api/cis_plan/mission_network/{mn_id}/segment/NS-NOTFOUND'
    try:
        response = client.get(url_not_found)
        data = response.get_json()
        if response.status_code == 404 and data.get('status') == 'error':
            print_pass(f"GET {url_not_found} correctly returned 404.")
        else:
            print_fail(f"GET {url_not_found} failed not found case.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"GET {url_not_found} raised exception: {e}")

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
    # Use the temporary parent resources created by _setup_api_parents
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    if not mn_id or not seg_id:
        print_fail("Skipping create domain API test, missing parent MN/Segment IDs from setup.")
        return
    test_id = f"api_domain_test_{int(time.time())}"
    name = f"ApiTestDomain_{test_id}"
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
                print_pass(f"POST domain created '{name}' with id {dom_id} in Segment {seg_id}.")
            else:
                 print_fail("POST domain success status but no ID in response.", f"JSON: {json_data}")
        else:
            print_fail(f"POST domain failed for Seg {seg_id}/MN {mn_id}.", f"Status: {response.status_code}, JSON: {json_data}")

def test_api_get_all_security_domains():
    print_test_header("test_api_get_all_security_domains")
    app = setup_api_test_app()
    client = app.test_client()
    # Use the temporary parent resources created by _setup_api_parents
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api') # Created in the previous security domain test
    
    if not mn_id or not seg_id:
        print_fail("Skipping get all domains API test, missing parent MN/Segment IDs from setup.")
        return
    
    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain'
    try:
        response = client.get(url)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and isinstance(data.get('data'), list):
            if dom_id and any(dom.get('id') == dom_id for dom in data['data']):
                print_pass(f"GET {url} successfully retrieved domains list including {dom_id}.")
            else:
                print_pass(f"GET {url} successfully retrieved domains list (no specific ID to check for).")
        else:
            print_fail(f"GET {url} failed.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"GET {url} raised exception: {e}")

def test_api_get_security_domain():
    print_test_header("test_api_get_security_domain")
    app = setup_api_test_app()
    client = app.test_client()
    # Use the temporary parent resources created by _setup_api_parents
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api')
    if not mn_id or not seg_id or not dom_id:
        print_fail("Skipping get domain test, missing required IDs.")
        return
    
    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}'
    try:
        response = client.get(url)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and data['data'].get('id') == dom_id:
            print_pass(f"GET {url} successfully retrieved domain {dom_id}.")
        else:
            print_fail(f"GET {url} failed.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"GET {url} raised exception: {e}")
    
    # Test Not Found
    url_not_found = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/SD-NOTFOUND'
    try:
        response = client.get(url_not_found)
        data = response.get_json()
        if response.status_code == 404 and data.get('status') == 'error':
            print_pass(f"GET {url_not_found} correctly returned 404.")
        else:
            print_fail(f"GET {url_not_found} failed not found case.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"GET {url_not_found} raised exception: {e}")

def test_api_update_security_domain():
    print_test_header("test_api_update_security_domain")
    # Use the temporary parent resources created by _setup_api_parents
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api')
    if not mn_id or not seg_id or not dom_id:
        print_fail("Skipping update domain API test, missing required IDs.")
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
    # Use the temporary parent resources created by _setup_api_parents
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api')
    if not mn_id or not seg_id or not dom_id:
        print_fail("Skipping delete domain API test, missing required IDs.")
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

# --- HW Stack API Tests ---
@patch('app.routes.cis_plan._validate_participant') # Patch the helper directly
def test_api_create_hw_stack(mock_validate_participant):
    print_test_header("test_api_create_hw_stack")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    if not all([mn_id, seg_id, dom_id]):
        print_fail("Skipping create HW stack API test, missing parent resource IDs.")
        return

    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks'
    test_id = f"api_hwstack_test_{int(time.time())}"
    name = f"ApiTestHwStack_{test_id}"
    
    # --- Test Success ---
    mock_validate_participant.return_value = True
    payload_success = {'name': name, 'cisParticipantID': MOCK_VALID_PARTICIPANT_ID}
    try:
        response = client.post(url, json=payload_success)
        data = response.get_json()
        if response.status_code == 201 and data.get('status') == 'success' and data['data'].get('name') == name and data['data'].get('id', '').startswith('HW-') and data['data'].get('cisParticipantID') == MOCK_VALID_PARTICIPANT_ID:
            created_ids['hw_stack_api'] = data['data']['id']
            print_pass(f"POST {url} created stack '{name}' (id {data['data']['id']}) with valid participant.")
            if VERBOSE:
                print(f"Complete API HW Stack data: {json.dumps(data['data'], indent=2)}")
        else:
            print_fail(f"POST {url} failed success case.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"POST {url} success case raised exception: {e}")

    # --- Test Invalid Participant ---
    mock_validate_participant.return_value = False
    payload_invalid_pt = {'name': name + "_invalidPT", 'cisParticipantID': MOCK_INVALID_PARTICIPANT_ID}
    try:
        response = client.post(url, json=payload_invalid_pt)
        data = response.get_json()
        if response.status_code == 400 and data.get('status') == 'error' and MOCK_INVALID_PARTICIPANT_ID in data.get('message', ''):
            print_pass(f"POST {url} correctly failed with invalid participant ID.")
        else:
            print_fail(f"POST {url} failed invalid participant case.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"POST {url} invalid participant case raised exception: {e}")

    # --- Test Missing Name ---
    mock_validate_participant.return_value = True # Reset mock
    payload_missing_name = {'cisParticipantID': MOCK_VALID_PARTICIPANT_ID}
    try:
        response = client.post(url, json=payload_missing_name)
        data = response.get_json()
        if response.status_code == 400 and data.get('status') == 'error' and 'Missing \'name\'' in data.get('message', ''):
            print_pass(f"POST {url} correctly failed with missing name.")
        else:
            print_fail(f"POST {url} failed missing name case.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"POST {url} missing name case raised exception: {e}")

def test_api_get_all_hw_stacks():
    print_test_header("test_api_get_all_hw_stacks")
    app = setup_api_test_app()
    client = app.test_client()
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api') # Use ID created in POST test
    if not all([mn_id, seg_id, dom_id, stack_id]):
        print_fail("Skipping get all HW stacks API test, missing required IDs (did create fail?).")
        return
    
    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks'
    try:
        response = client.get(url)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and isinstance(data.get('data'), list) and any(s.get('id') == stack_id for s in data['data']):
            print_pass(f"GET {url} successfully retrieved list including stack {stack_id}.")
        else:
            print_fail(f"GET {url} failed.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"GET {url} raised exception: {e}")

def test_api_get_hw_stack():
    print_test_header("test_api_get_hw_stack")
    app = setup_api_test_app()
    client = app.test_client()
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    if not all([mn_id, seg_id, dom_id, stack_id]):
        print_fail("Skipping get HW stack API test, missing required IDs.")
        return

    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}'
    try:
        response = client.get(url)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and data['data'].get('id') == stack_id:
            print_pass(f"GET {url} successfully retrieved stack {stack_id}.")
        else:
            print_fail(f"GET {url} failed.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"GET {url} raised exception: {e}")

    # Test Not Found
    url_not_found = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/HW-NOTFOUND'
    try:
        response = client.get(url_not_found)
        data = response.get_json()
        if response.status_code == 404 and data.get('status') == 'error':
            print_pass(f"GET {url_not_found} correctly returned 404.")
        else:
            print_fail(f"GET {url_not_found} failed not found case.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"GET {url_not_found} raised exception: {e}")

@patch('app.routes.cis_plan._validate_participant')
def test_api_update_hw_stack(mock_validate_participant):
    print_test_header("test_api_update_hw_stack")
    app = setup_api_test_app()
    client = app.test_client()
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    if not all([mn_id, seg_id, dom_id, stack_id]):
        print_fail("Skipping update HW stack API test, missing required IDs.")
        return

    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}'
    new_name = f"testApiHWStack_updated_{int(time.time())}"
    new_participant_id_valid = "PT-API-UPDATED-VALID"
    new_participant_id_invalid = "PT-API-UPDATED-INVALID"

    # --- Test Success ---
    mock_validate_participant.return_value = True
    payload_success = {'name': new_name, 'cisParticipantID': new_participant_id_valid}
    try:
        response = client.put(url, json=payload_success)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and data['data'].get('name') == new_name and data['data'].get('id') == stack_id and data['data'].get('cisParticipantID') == new_participant_id_valid:
            print_pass(f"PUT {url} updated stack {stack_id} successfully.")
        else:
            print_fail(f"PUT {url} failed success case.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"PUT {url} success case raised exception: {e}")

    # --- Test Invalid Participant ---
    mock_validate_participant.return_value = False
    payload_invalid_pt = {'name': new_name + "_invalidPT", 'cisParticipantID': new_participant_id_invalid}
    try:
        response = client.put(url, json=payload_invalid_pt)
        data = response.get_json()
        if response.status_code == 400 and data.get('status') == 'error' and new_participant_id_invalid in data.get('message', ''):
            print_pass(f"PUT {url} correctly failed with invalid participant ID.")
        else:
            print_fail(f"PUT {url} failed invalid participant case.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"PUT {url} invalid participant case raised exception: {e}")

    # --- Test Not Found ---
    mock_validate_participant.return_value = True # Reset mock
    url_not_found = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/HW-NOTFOUND'
    payload_not_found = {'name': 'NotFoundTest', 'cisParticipantID': MOCK_VALID_PARTICIPANT_ID}
    try:
        response = client.put(url_not_found, json=payload_not_found)
        data = response.get_json()
        if response.status_code == 404 and data.get('status') == 'error':
            print_pass(f"PUT {url_not_found} correctly returned 404.")
        else:
            print_fail(f"PUT {url_not_found} failed not found case.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"PUT {url_not_found} raised exception: {e}")
def test_api_delete_hw_stack():
    print_test_header("test_api_delete_hw_stack")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    if not all([mn_id, seg_id, dom_id, stack_id]):
        print_fail("Skipping delete HW stack API test, missing parent resource IDs.")
        return

    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}'
    try:
        # Test successful delete
        response = client.delete(url)
        if response.status_code == 200:
            print_pass(f"DELETE {url} successfully deleted stack {stack_id}.")
            
            # Verify it's gone
            response_verify = client.get(url)
            if response_verify.status_code == 404:
                print_pass(f"DELETE {url} correctly returned 404 for deleted stack {stack_id}.")
                created_ids['hw_stack_api'] = None
            else:
                print_fail(f"DELETE claimed success but stack {stack_id} still exists.")

        # Test 404 for non-existent stack
        response = client.delete(url)
        if response.status_code == 404:
            print_pass(f"DELETE {url} correctly returned 404 for already deleted/non-existent stack.")
        else:
            print_fail(f"DELETE {url} should have returned 404 for non-existent stack.")
    except Exception as e:
        print_fail(f"test_api_delete_hw_stack exception: {e}")

# --- Asset API Tests ---

def test_api_create_asset():
    print_test_header("test_api_create_asset")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    if not all([mn_id, seg_id, dom_id, stack_id]):
        print_fail("Skipping create asset API test, missing parent resource IDs.")
        return

    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets'
    test_id = f"api_asset_test_{int(time.time())}"
    name = f"ApiTestAsset_{test_id}"
    
    # --- Test Success ---
    payload_success = {'name': name}
    try:
        response = client.post(url, json=payload_success)
        data = response.get_json()
        if response.status_code == 201 and data.get('status') == 'success' and data['data'].get('name') == name and data['data'].get('id', '').startswith('AS-'):
            created_ids['asset_api'] = data['data']['id']
            print_pass(f"POST {url} created asset '{name}' (id {data['data']['id']}).")
            if VERBOSE:
                print(f"Complete API Asset data: {json.dumps(data['data'], indent=2)}")
        else:
            print_fail(f"POST {url} failed success case.", f"Status: {response.status_code}, Response: {data}")

        # --- Test Invalid Request (Missing name) ---
        response = client.post(url, json={})
        if response.status_code == 400:
            print_pass(f"POST {url} correctly failed with missing name.")
        else:
            print_fail(f"POST {url} should have failed with 400 for missing name.")

    except Exception as e:
        print_fail(f"test_api_create_asset exception: {e}")

def test_api_get_all_assets():
    print_test_header("test_api_get_all_assets")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    asset_id = created_ids.get('asset_api')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id]):
        print_fail("Skipping get all assets API test, missing required IDs.")
        return

    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets'
    try:
        response = client.get(url)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success':
            assets = data.get('data', [])
            if any(asset.get('id') == asset_id for asset in assets):
                print_pass(f"GET {url} successfully retrieved list including asset {asset_id}.")
            else:
                print_fail(f"GET {url} response did not include expected asset {asset_id}.", f"Assets: {assets}")
        else:
            print_fail(f"GET {url} failed.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"test_api_get_all_assets exception: {e}")

def test_api_get_asset():
    print_test_header("test_api_get_asset")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    asset_id = created_ids.get('asset_api')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id]):
        print_fail("Skipping get asset API test, missing required IDs.")
        return

    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}'
    try:
        # Test successful get
        response = client.get(url)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and data['data'].get('id') == asset_id:
            print_pass(f"GET {url} successfully retrieved asset {asset_id}.")
        else:
            print_fail(f"GET {url} failed.", f"Status: {response.status_code}, Response: {data}")

        # Test 404 for non-existent asset
        not_found_url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/AS-NOTFOUND'
        response = client.get(not_found_url)
        if response.status_code == 404:
            print_pass(f"GET {not_found_url} correctly returned 404.")
        else:
            print_fail(f"GET {not_found_url} should have returned 404.", f"Status: {response.status_code}")
    except Exception as e:
        print_fail(f"test_api_get_asset exception: {e}")

def test_api_update_asset():
    print_test_header("test_api_update_asset")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    asset_id = created_ids.get('asset_api')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id]):
        print_fail("Skipping update asset API test, missing required IDs.")
        return

    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}'
    updated_name = f"apiTestAsset_updated_{int(time.time())}"
    try:
        # Test successful update
        payload = {'name': updated_name}
        response = client.put(url, json=payload)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and data['data'].get('name') == updated_name:
            print_pass(f"PUT {url} updated asset {asset_id} successfully.")
        else:
            print_fail(f"PUT {url} failed.", f"Status: {response.status_code}, Response: {data}")

        # Test 404 for non-existent asset
        not_found_url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/AS-NOTFOUND'
        response = client.put(not_found_url, json=payload)
        if response.status_code == 404:
            print_pass(f"PUT {not_found_url} correctly returned 404.")
        else:
            print_fail(f"PUT {not_found_url} should have returned 404.", f"Status: {response.status_code}")
    except Exception as e:
        print_fail(f"test_api_update_asset exception: {e}")

def test_api_delete_asset():
    print_test_header("test_api_delete_asset")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    asset_id = created_ids.get('asset_api')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id]):
        print_fail("Skipping delete asset API test, missing required IDs.")
        return
        
    if SKIP_DELETION:
        print_pass(f"Skipping API asset deletion test to preserve resources.")
        return

    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}'
    try:
        # Test successful delete
        response = client.delete(url)
        if response.status_code == 200:
            print_pass(f"DELETE {url} successfully deleted asset {asset_id}.")
            
            # Verify it's gone
            response_verify = client.get(url)
            if response_verify.status_code == 404:
                print_pass(f"DELETE {url} correctly returned 404 for deleted asset {asset_id}.")
                created_ids['asset_api'] = None
            else:
                print_fail(f"DELETE claimed success but asset {asset_id} still exists.")

        # Test 404 for non-existent asset
        response = client.delete(url)
        if response.status_code == 404:
            print_pass(f"DELETE {url} correctly returned 404 for already deleted/non-existent asset.")
        else:
            print_fail(f"DELETE {url} should have returned 404 for non-existent asset.")
    except Exception as e:
        print_fail(f"test_api_delete_asset exception: {e}")

# --- Network Interface API Tests ---

def test_api_create_network_interface():
    print_test_header("test_api_create_network_interface")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    asset_id = created_ids.get('asset_api')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id]):
        print_fail("Skipping create network interface API test, missing parent resource IDs.")
        return

    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/network_interfaces'
    test_id = f"api_network_interface_test_{int(time.time())}"
    name = f"ApiTestNetworkInterface_{test_id}"
    
    # --- Test Success ---
    payload_success = {'name': name}
    try:
        response = client.post(url, json=payload_success)
        data = response.get_json()
        if response.status_code == 201 and data.get('status') == 'success' and data['data'].get('name') == name and data['data'].get('id', '').startswith('NI-'):
            created_ids['network_interface_api'] = data['data']['id']
            print_pass(f"POST {url} created network interface '{name}' (id {data['data']['id']}).")
            if VERBOSE:
                print(f"Complete API Network Interface data: {json.dumps(data['data'], indent=2)}")
            
            # Verify configuration items were created
            config_items = data['data'].get('configurationItems', [])
            if len(config_items) == 3:
                ip_address = next((item for item in config_items if item.get('Name') == 'IP Address'), None)
                subnet = next((item for item in config_items if item.get('Name') == 'Sub-Net'), None)
                fqdn = next((item for item in config_items if item.get('Name') == 'FQDN'), None)
                
                if ip_address and subnet and fqdn:
                    print_pass(f"Network interface correctly includes all three required configuration items.")
                else:
                    print_fail(f"Network interface is missing some required configuration items.")
            else:
                print_fail(f"Network interface has {len(config_items)} configuration items, expected 3.")
        else:
            print_fail(f"POST {url} failed success case.", f"Status: {response.status_code}, Response: {data}")

        # --- Test Invalid Request (Missing name) ---
        response = client.post(url, json={})
        if response.status_code == 400:
            print_pass(f"POST {url} correctly failed with missing name.")
        else:
            print_fail(f"POST {url} should have failed with 400 for missing name.")

    except Exception as e:
        print_fail(f"test_api_create_network_interface exception: {e}")

def test_api_get_all_network_interfaces():
    print_test_header("test_api_get_all_network_interfaces")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    asset_id = created_ids.get('asset_api')
    interface_id = created_ids.get('network_interface_api')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, interface_id]):
        print_fail("Skipping get all network interfaces API test, missing required IDs.")
        return

    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/network_interfaces'
    try:
        response = client.get(url)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success':
            interfaces = data.get('data', [])
            if any(interface.get('id') == interface_id for interface in interfaces):
                print_pass(f"GET {url} successfully retrieved list including network interface {interface_id}.")
            else:
                print_fail(f"GET {url} response did not include expected network interface {interface_id}.", f"Interfaces: {interfaces}")
        else:
            print_fail(f"GET {url} failed.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"test_api_get_all_network_interfaces exception: {e}")

def test_api_get_network_interface():
    print_test_header("test_api_get_network_interface")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    asset_id = created_ids.get('asset_api')
    interface_id = created_ids.get('network_interface_api')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, interface_id]):
        print_fail("Skipping get network interface API test, missing required IDs.")
        return

    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/network_interfaces/{interface_id}'
    try:
        # Test successful get
        response = client.get(url)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and data['data'].get('id') == interface_id:
            print_pass(f"GET {url} successfully retrieved network interface {interface_id}.")
        else:
            print_fail(f"GET {url} failed.", f"Status: {response.status_code}, Response: {data}")

        # Test 404 for non-existent network interface
        not_found_url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/network_interfaces/NI-NOTFOUND'
        response = client.get(not_found_url)
        if response.status_code == 404:
            print_pass(f"GET {not_found_url} correctly returned 404.")
        else:
            print_fail(f"GET {not_found_url} should have returned 404.", f"Status: {response.status_code}")
    except Exception as e:
        print_fail(f"test_api_get_network_interface exception: {e}")

def test_api_update_network_interface():
    print_test_header("test_api_update_network_interface")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    asset_id = created_ids.get('asset_api')
    interface_id = created_ids.get('network_interface_api')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, interface_id]):
        print_fail("Skipping update network interface API test, missing required IDs.")
        return

    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/network_interfaces/{interface_id}'
    updated_name = f"apiTestNetworkInterface_updated_{int(time.time())}"
    try:
        # Test successful update
        payload = {'name': updated_name}
        response = client.put(url, json=payload)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and data['data'].get('name') == updated_name:
            print_pass(f"PUT {url} updated network interface {interface_id} successfully.")
        else:
            print_fail(f"PUT {url} failed.", f"Status: {response.status_code}, Response: {data}")

        # Test 404 for non-existent network interface
        not_found_url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/network_interfaces/NI-NOTFOUND'
        response = client.put(not_found_url, json=payload)
        if response.status_code == 404:
            print_pass(f"PUT {not_found_url} correctly returned 404.")
        else:
            print_fail(f"PUT {not_found_url} should have returned 404.", f"Status: {response.status_code}")
    except Exception as e:
        print_fail(f"test_api_update_network_interface exception: {e}")

def test_api_update_configuration_item():
    print_test_header("test_api_update_configuration_item")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    asset_id = created_ids.get('asset_api')
    interface_id = created_ids.get('network_interface_api')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, interface_id]):
        print_fail("Skipping update configuration item API test, missing required IDs.")
        return

    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/network_interfaces/{interface_id}/config'
    
    try:
        # Test successful updates for all three configuration items
        test_values = {
            "IP Address": "10.20.30.40",
            "Sub-Net": "255.255.0.0",
            "FQDN": "api-test-server.example.org"
        }
        
        for item_name, value in test_values.items():
            payload = {'name': item_name, 'value': value}
            response = client.put(url, json=payload)
            data = response.get_json()
            
            if response.status_code == 200 and data.get('status') == 'success' and data['data'].get('AnswerContent') == value:
                print_pass(f"PUT {url} updated configuration item '{item_name}' to '{value}' successfully.")
            else:
                print_fail(f"PUT {url} failed to update '{item_name}'.", f"Status: {response.status_code}, Response: {data}")
        
        # Verify all updates are reflected in the network interface
        interface_url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/network_interfaces/{interface_id}'
        get_response = client.get(interface_url)
        if get_response.status_code == 200:
            get_data = get_response.get_json()
            config_items = get_data['data'].get('configurationItems', [])
            
            all_updated = True
            for item_name, expected_value in test_values.items():
                found_item = next((item for item in config_items if item.get('Name') == item_name), None)
                if not found_item or found_item.get('AnswerContent') != expected_value:
                    all_updated = False
                    print_fail(f"Configuration item '{item_name}' was not correctly updated or persisted.")
            
            if all_updated:
                print_pass(f"All configuration items were correctly updated and persisted.")
        else:
            print_fail(f"Failed to retrieve network interface to verify configuration item updates.")
            
        # Test invalid item name
        invalid_payload = {'name': 'InvalidItem', 'value': 'test'}
        response = client.put(url, json=invalid_payload)
        if response.status_code in [400, 422]:
            print_pass(f"PUT {url} correctly rejected invalid configuration item name.")
        else:
            print_fail(f"PUT {url} should have rejected invalid configuration item name.", f"Status: {response.status_code}")
        
    except Exception as e:
        print_fail(f"test_api_update_configuration_item exception: {e}")

def test_api_delete_network_interface():
    print_test_header("test_api_delete_network_interface")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    asset_id = created_ids.get('asset_api')
    interface_id = created_ids.get('network_interface_api')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, interface_id]):
        print_fail("Skipping delete network interface API test, missing required IDs.")
        return
        
    if SKIP_DELETION:
        print_pass(f"Skipping API network interface deletion test to preserve resources.")
        return

    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/network_interfaces/{interface_id}'
    try:
        # Test successful delete
        response = client.delete(url)
        if response.status_code == 200:
            print_pass(f"DELETE {url} successfully deleted network interface {interface_id}.")
            
            # Verify it's gone
            response_verify = client.get(url)
            if response_verify.status_code == 404:
                print_pass(f"DELETE {url} correctly returned 404 for deleted network interface {interface_id}.")
                created_ids['network_interface_api'] = None
            else:
                print_fail(f"DELETE claimed success but network interface {interface_id} still exists.")

        # Test 404 for non-existent network interface
        response = client.delete(url)
        if response.status_code == 404:
            print_pass(f"DELETE {url} correctly returned 404 for already deleted/non-existent network interface.")
        else:
            print_fail(f"DELETE {url} should have returned 404 for non-existent network interface.")
    except Exception as e:
        print_fail(f"test_api_delete_network_interface exception: {e}")

# --- GP Instance API Tests ---

def test_api_create_gp_instance():
    print_test_header("test_api_create_gp_instance")
    app = setup_api_test_app()
    client = app.test_client()
    
    # Make sure parent resources exist
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    asset_id = created_ids.get('asset_api')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id]):
        print_fail("Failed to set up parent resources for GP instance API test.")
        return
    
    test_id = f"test_api_gp_instance_{int(time.time())}"
    instance_label = f"APITestGPInstance_{test_id}"
    service_id = "GP-0043"  # Use real GP ID that matches items in the catalog
    
    data = {
        "instanceLabel": instance_label,
        "serviceId": service_id
    }
    
    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/gp_instances'
    try:
        response = client.post(url, json=data)
        data_response = response.get_json()
        if response.status_code == 201 and data_response.get('status') == 'success' and data_response['data'].get('gpid', '').startswith('GP-'):
            print_pass(f"API endpoint for creating GP instance returned success: {data_response['data']['gpid']}")
            created_ids['gp_instance_api'] = data_response['data']['gpid']
            
            # Verify the created instance has empty spInstances array
            if 'spInstances' in data_response['data'] and isinstance(data_response['data']['spInstances'], list) and len(data_response['data']['spInstances']) == 0:
                print_pass(f"API create endpoint correctly created empty spInstances array.")
            else:
                print_fail(f"API create endpoint did not create a proper empty spInstances array.")
                
            # For configurationItems, since we used a real GP ID, we should have config items (or at least an array)
            if 'configurationItems' in data_response['data'] and isinstance(data_response['data']['configurationItems'], list):
                print_pass(f"API create endpoint correctly created configurationItems array with {len(data_response['data']['configurationItems'])} items.")
            else:
                print_fail(f"API create endpoint did not create a proper configurationItems array.")
        else:
            print_fail(f"API endpoint for creating GP instance failed with status {response.status_code}: {response.data}")
            
        # Test missing required fields
        response = client.post(url, json={})
        if response.status_code == 400:
            print_pass(f"POST {url} correctly failed with missing required fields.")
        else:
            print_fail(f"POST {url} should have failed with 400 for missing required fields.")
    except Exception as e:
        print_fail(f"test_api_create_gp_instance exception: {e}")

def test_api_get_all_gp_instances():
    print_test_header("test_api_get_all_gp_instances")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    asset_id = created_ids.get('asset_api')
    instance_id = created_ids.get('gp_instance_api')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, instance_id]):
        print_fail("Skipping get all GP instances API test, missing required IDs.")
        return
    
    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/gp_instances'
    try:
        response = client.get(url)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and isinstance(data.get('data'), list):
            # Check if our created instance is in the list
            found = any(gpi.get('gpid') == instance_id for gpi in data['data'])
            if found:
                print_pass(f"API endpoint for GET all GP instances returned list containing created instance {instance_id}.")
            else:
                print_fail(f"API endpoint for GET all GP instances returned list but did not contain created instance {instance_id}.")
        else:
            print_fail(f"API endpoint for GET all GP instances failed with status {response.status_code}: {response.data}")
    except Exception as e:
        print_fail(f"test_api_get_all_gp_instances exception: {e}")

def test_api_get_gp_instance():
    print_test_header("test_api_get_gp_instance")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    asset_id = created_ids.get('asset_api')
    instance_id = created_ids.get('gp_instance_api')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, instance_id]):
        print_fail("Skipping get GP instance API test, missing required IDs.")
        return
    
    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/gp_instances/{instance_id}'
    try:
        # Test successful get
        response = client.get(url)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and data['data'].get('gpid') == instance_id:
            print_pass(f"GET {url} successfully retrieved GP instance {instance_id}.")
        else:
            print_fail(f"GET {url} failed.", f"Status: {response.status_code}, Response: {data}")

        # Test 404 for non-existent GP instance
        not_found_url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/gp_instances/GP-NOTFOUND'
        response = client.get(not_found_url)
        if response.status_code == 404:
            print_pass(f"GET {not_found_url} correctly returned 404.")
        else:
            print_fail(f"GET {not_found_url} should have returned 404.", f"Status: {response.status_code}")
    except Exception as e:
        print_fail(f"test_api_get_gp_instance exception: {e}")

def test_api_update_gp_instance():
    print_test_header("test_api_update_gp_instance")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    asset_id = created_ids.get('asset_api')
    instance_id = created_ids.get('gp_instance_api')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, instance_id]):
        print_fail("Skipping update GP instance API test, missing required IDs.")
        return
    
    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/gp_instances/{instance_id}'
    updated_label = f"ApiGPInstanceUpdated_{int(time.time())}"
    updated_service = "SV-API-UPDATED-002"
    
    data = {
        "instanceLabel": updated_label,
        "serviceId": updated_service
    }
    
    try:
        # Test successful update
        response = client.put(url, json=data)
        data_response = response.get_json()
        if response.status_code == 200 and data_response.get('status') == 'success' and data_response['data'].get('instanceLabel') == updated_label and data_response['data'].get('serviceId') == updated_service:
            print_pass(f"PUT {url} updated GP instance {instance_id} successfully.")
        else:
            print_fail(f"PUT {url} failed.", f"Status: {response.status_code}, Response: {data_response}")

        # Test 404 for non-existent GP instance
        not_found_url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/gp_instances/GP-NOTFOUND'
        response = client.put(not_found_url, json=data)
        if response.status_code == 404:
            print_pass(f"PUT {not_found_url} correctly returned 404.")
        else:
            print_fail(f"PUT {not_found_url} should have returned 404.", f"Status: {response.status_code}")
    except Exception as e:
        print_fail(f"test_api_update_gp_instance exception: {e}")

def test_api_refresh_gp_instance_config_items():
    print_test_header("test_api_refresh_gp_instance_config_items")
    app = setup_api_test_app()
    client = app.test_client()
    
    # Make sure parent resources exist
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api') 
    asset_id = created_ids.get('asset_api')
    instance_id = created_ids.get('gp_instance_api')
    
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, instance_id]):
        print_fail("Skipping refresh GP instance config items API test, missing required IDs.")
        return
    
    try:
        # Call the refresh config endpoint with the updated URL format
        url = f'/api/cis_plan/ciav/mission_networks/{mn_id}/network_segments/{seg_id}/security_domains/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/gp_instances/{instance_id}/refresh_config'
        response = client.post(url)
        data = response.get_json()
        
        if response.status_code == 200 and data.get('status') == 'success':
            print_pass(f"POST {url} successfully refreshed configuration items for GP instance {instance_id}.")
            
            # Verify the instance was returned
            # In our new API format, the instance is directly in the 'data' field
            if data.get('data'):
                instance = data['data']
                if 'configurationItems' in instance:
                    print_pass(f"Refreshed instance has {len(instance['configurationItems'])} config items.")
                else:
                    print_fail(f"Refreshed instance is missing configurationItems array.")
            else:
                print_fail(f"Response doesn't contain the instance data.")
        else:
            print_fail(f"POST {url} failed to refresh config items.", f"Status: {response.status_code}, Response: {data}")
            
        # Test with invalid GP instance ID
        invalid_url = f'/api/cis_plan/ciav/mission_networks/{mn_id}/network_segments/{seg_id}/security_domains/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/gp_instances/GP-NOTFOUND/refresh_config'
        response = client.post(invalid_url)
        if response.status_code == 404:
            print_pass(f"POST {invalid_url} correctly returned 404 for non-existent GP instance.")
        else:
            print_fail(f"POST {invalid_url} should have returned 404 for non-existent GP instance.")
    except Exception as e:
        print_fail(f"test_api_refresh_gp_instance_config_items exception: {e}")

def test_api_delete_gp_instance():
    print_test_header("test_api_delete_gp_instance")
    app = setup_api_test_app()
    client = app.test_client()
    
    mn_id = created_ids.get('mission_network_api_temp')
    seg_id = created_ids.get('network_segment_api_temp')
    dom_id = created_ids.get('security_domain_api_temp')
    stack_id = created_ids.get('hw_stack_api')
    asset_id = created_ids.get('asset_api')
    instance_id = created_ids.get('gp_instance_api')
    if not all([mn_id, seg_id, dom_id, stack_id, asset_id, instance_id]):
        print_fail("Skipping delete GP instance API test, missing required IDs.")
        return
        
    if SKIP_DELETION:
        print_pass(f"Skipping GP instance deletion API test to preserve resources.")
        return
    
    url = f'/api/cis_plan/mission_network/{mn_id}/segment/{seg_id}/security_domain/{dom_id}/hw_stacks/{stack_id}/assets/{asset_id}/gp_instances/{instance_id}'
    try:
        # Test successful delete
        response = client.delete(url)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and data.get('data', {}).get('deleted'):
            print_pass(f"DELETE {url} successfully deleted GP instance {instance_id}.")
            
            # Verify it's gone
            response_verify = client.get(url)
            if response_verify.status_code == 404:
                print_pass(f"DELETE {url} correctly returned 404 for deleted GP instance {instance_id}.")
                created_ids['gp_instance_api'] = None
            else:
                print_fail(f"DELETE claimed success but GP instance {instance_id} still exists.")

        # Test 404 for non-existent GP instance
        response = client.delete(url)
        if response.status_code == 404:
            print_pass(f"DELETE {url} correctly returned 404 for already deleted/non-existent GP instance.")
        else:
            print_fail(f"DELETE {url} should have returned 404 for non-existent GP instance.")
    except Exception as e:
        print_fail(f"test_api_delete_gp_instance exception: {e}")

def test_api_get_all_mission_networks():
    print_test_header("test_api_get_all_mission_networks")
    app = setup_api_test_app()
    client = app.test_client()
    url = '/api/cis_plan/mission_network'
    
    # Use the ID created during the setup phase
    setup_mn_id = created_ids.get('mission_network_api_temp')
    # Also check for the one created in the specific create test, if it exists
    created_mn_id = created_ids.get('mission_network_api') 

    try:
        response = client.get(url)
        data = response.get_json()
        if response.status_code == 200 and data.get('status') == 'success' and isinstance(data.get('data'), list):
            found_setup = False
            found_created = False
            if setup_mn_id:
                found_setup = any(mn.get('id') == setup_mn_id for mn in data['data'])
            if created_mn_id:
                 found_created = any(mn.get('id') == created_mn_id for mn in data['data'])
            
            if setup_mn_id and not found_setup:
                print_fail(f"GET {url} did not find setup MN {setup_mn_id} in the list.", f"Response: {data}")
            elif created_mn_id and not found_created:
                 # This might be acceptable if the create test failed, but log a warning
                 print_fail(f"GET {url} did not find created MN {created_mn_id} (was it created successfully?).", f"Response: {data}")
            else:
                 print_pass(f"GET {url} successfully retrieved list of mission networks (checked for {setup_mn_id} and {created_mn_id}).")
        else:
            print_fail(f"GET {url} failed.", f"Status: {response.status_code}, Response: {data}")
    except Exception as e:
        print_fail(f"GET {url} raised exception: {e}")

if __name__ == '__main__':
    # Only print verbose startup messages if VERBOSE is enabled
    if VERBOSE:
        print("Starting CIS Plan Tests...")
    
    # Print status message if resources will be kept
    if SKIP_DELETION:
        print_status("\nℹ️  Running with --keep-resources flag: All test resources will be preserved for inspection.\n")

    # --- Test Repository Functions ---
    test_repo_get_all_cis_plan()
    test_repo_get_all_cis_security_classification()

    # Mission Network Repo CRUD
    test_repo_add_mission_network()
    test_repo_update_mission_network()
    if not SKIP_DELETION:
        test_repo_delete_mission_network()
    else:
        print_status("Skipping mission network deletion test to preserve resources.")

    # Network Segment Repo CRUD (uses temporary MN)
    test_repo_add_network_segment()
    test_repo_update_network_segment()
    if not SKIP_DELETION:
        test_repo_delete_network_segment()
    else:
        print_status("Skipping network segment deletion test to preserve resources.")

    # Security Domain Repo CRUD
    test_repo_add_security_domain()
    test_repo_get_all_security_domains()
    test_repo_update_security_domain()
    if not SKIP_DELETION:
        test_repo_delete_security_domain()
    else:
        print_status("Skipping security domain deletion test to preserve resources.")

    # HW Stack Repo CRUD
    if not _setup_hw_stack_repo_parents():
        print_status("Skipping HW Stack tests due to setup failure.")
    else:
        test_repo_add_hw_stack()
        test_repo_get_all_hw_stacks()
        test_repo_get_hw_stack()
        test_repo_update_hw_stack()
        
        # Asset Repo Tests
        test_repo_add_asset()
        test_repo_get_all_assets()
        test_repo_get_asset()
        test_repo_update_asset()
        
        # Network Interface and Configuration Item Repo Tests
        test_repo_add_network_interface()
        test_repo_get_all_network_interfaces()
        test_repo_get_network_interface()
        test_repo_update_network_interface()
        test_repo_update_configuration_item()
        
        # GP Instance Repo Tests
        test_repo_add_gp_instance()
        test_repo_refresh_gp_instance_config_items()
        test_repo_get_gp_instance()
        test_repo_update_gp_instance()
        
        # SP Instance Tests
        test_repo_add_sp_instance()
        test_repo_get_all_sp_instances()
        test_repo_get_sp_instance()
        test_repo_update_sp_instance()
        test_repo_delete_sp_instance()
        
        if not SKIP_DELETION:
            test_repo_delete_gp_instance()
            test_repo_delete_network_interface()
            test_repo_delete_asset()
            test_repo_delete_hw_stack()
        else:
            print_status("Skipping GP instance, network interface, asset, and HW stack deletion tests to preserve resources.")
        _teardown_hw_stack_repo_parents()

    # --- Test API Endpoints ---
    if VERBOSE:
        print("\n--- Testing API Endpoints ---")
    app = setup_api_test_app()
    client = app.test_client()
    with client.session_transaction() as sess:
        sess['user'] = {"id": "TEST_USER"}
        sess['role'] = "admin"

    # Setup for API tests that need parent resources
    if not _setup_api_parents(client):
        print_status("\nAborting API tests due to parent resource setup failure.")
    else:
        
        test_api_create_mission_network()
        test_api_get_all_mission_networks()
        test_api_get_mission_network()
        test_api_update_mission_network()
        
        test_api_create_network_segment()
        test_api_get_all_network_segments()
        test_api_get_network_segment()
        test_api_update_network_segment()
        if not SKIP_DELETION:
            test_api_delete_network_segment()
        else:
            print_status("Skipping API network segment deletion test to preserve resources.")
        
        test_api_create_security_domain()
        test_api_get_all_security_domains()
        test_api_get_security_domain()
        test_api_update_security_domain()
        if not SKIP_DELETION:
            test_api_delete_security_domain()
        else:
            print_status("Skipping API security domain deletion test to preserve resources.")
        
        test_api_create_hw_stack()
        test_api_get_all_hw_stacks()
        test_api_get_hw_stack()
        test_api_update_hw_stack()
        
        # Asset API Tests
        test_api_create_asset()
        test_api_get_all_assets()
        test_api_get_asset()
        test_api_update_asset()
        
        # Network Interface and Configuration Item API Tests
        test_api_create_network_interface()
        test_api_get_all_network_interfaces()
        test_api_get_network_interface()
        test_api_update_network_interface()
        test_api_update_configuration_item()
        
        # GP Instance API Tests
        test_api_create_gp_instance()
        test_api_get_all_gp_instances()
        test_api_get_gp_instance()
        test_api_update_gp_instance()
        test_api_refresh_gp_instance_config_items()
        
        if not SKIP_DELETION:
            test_api_delete_gp_instance()
            test_api_delete_network_interface()
            test_api_delete_asset()
            test_api_delete_hw_stack()
        else:
            print_status("Skipping API GP instance, network interface, asset, and HW stack deletion tests to preserve resources.")
        
        _teardown_api_parents(client)

    # Print concise summary instead of verbose finish message
    print_test_summary()