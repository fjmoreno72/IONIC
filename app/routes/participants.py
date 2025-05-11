"""
Routes for participant-related functionality.
"""
import json
import logging
from pathlib import Path
from flask import Blueprint, render_template, request, jsonify, session
from app.core.auth import login_required

from app import settings
from app.utils.file_operations import get_dynamic_data_path, read_json_file
from app.api.iocore2 import IOCore2ApiClient

# Create a Blueprint for participants routes
participants_bp = Blueprint('participants', __name__)

@participants_bp.route('/participants')
@login_required
def participants_view():
    """
    Render the participants page, loading and processing data.

    Returns:
        Rendered participants template with processed data.
    """
    logging.info("Accessing Participants page")
    processed_participants = []
    test_results_data = [] # Initialize to avoid errors if file loading fails

    try:
        participants_path = get_dynamic_data_path("participants.json")
        test_results_path = get_dynamic_data_path("test_results.json")

        if not participants_path.exists():
            logging.warning(f"Participants file not found at {participants_path}")
            # Optionally render with an error message or empty list
            return render_template('participants.html', participants=[], error="Participants data file not found.")

        participants_data = read_json_file(participants_path)

        # Load test results, but don't fail the whole page if it's missing
        if test_results_path.exists():
            try:
                test_results_data = read_json_file(test_results_path)
            except Exception as e:
                logging.error(f"Error reading test results file {test_results_path}: {e}")
                # Continue without test counts or show an error? For now, continue.
        else:
            logging.warning(f"Test results file not found at {test_results_path}. Test counts will be 0.")
            test_results_data = None # Ensure it's None if file doesn't exist

        # --- Pre-process Test Results Data ONCE ---
        actual_test_list = []
        if test_results_data: # Only process if data was loaded
            # Check if test_results_data was loaded and is a dictionary
            if isinstance(test_results_data, dict):
                # First check for the new format with 'Tests' at the root level
                if 'Tests' in test_results_data:
                    tests_list = test_results_data['Tests']
                    if isinstance(tests_list, list):
                        logging.info(f"Processing {len(tests_list)} Tests from test_results (new format).")
                        actual_test_list = tests_list # Direct assignment since test list is at the root level
                    else:
                        logging.error(f"'Tests' key found in test_results_data, but its value is not a list (type: {type(tests_list)}). Cannot extract tests.")
                # Fallback to old format with 'TestPlans' if new format not found
                elif 'TestPlans' in test_results_data:
                    test_plans_list = test_results_data['TestPlans']
                    if isinstance(test_plans_list, list):
                        logging.info(f"Processing {len(test_plans_list)} TestPlans from test_results (legacy format).")
                        # Iterate through each TestPlan to extract its Tests
                        for test_plan in test_plans_list:
                            if isinstance(test_plan, dict):
                                if 'Tests' in test_plan:
                                     tests_list = test_plan['Tests']
                                     if isinstance(tests_list, list):
                                         actual_test_list.extend(tests_list) # Add tests from this plan to the main list
                                     else:
                                         logging.warning(f"Found 'Tests' key in test_plan, but its value is not a list (type: {type(tests_list)}). Skipping tests in this plan.")
                            else:
                                logging.warning(f"Item in 'TestPlans' list is not a dictionary (type: {type(test_plan)}). Skipping tests in this plan.")
                    else:
                        logging.error(f"'TestPlans' key found in test_results_data, but its value is not a list (type: {type(test_plans_list)}). Cannot extract tests.")
                else:
                    logging.error("Neither 'Tests' nor 'TestPlans' key found in the test_results_data dictionary. Cannot extract tests.")
            elif isinstance(test_results_data, list):
                 # Fallback if the structure is just a flat list (less likely based on API)
                 actual_test_list = test_results_data
                 logging.warning("Test results data is a list. Processing as a flat list of tests.")
            else:
                 # This covers cases where test_results_data is None or other types
                 logging.error(f"Test results data loaded but is not a dictionary with 'Tests', 'TestPlans', or a list (type: {type(test_results_data)}). Cannot calculate test counts accurately.")
        else:
            # This case handles when the file didn't exist or read_json_file returned None/empty
             logging.warning("Test results data is empty or was not loaded. Test counts will be 0.")

        logging.info(f"Compiled list of {len(actual_test_list)} tests for participant matching.") # Log the final length
        if not actual_test_list and test_results_path.exists(): # Add check if file existed but list is empty
             logging.error("Failed to compile actual_test_list from test_results_data, even though the file exists. Check file structure and processing logic.") # Add specific error log

        # --- End Pre-processing Test Results ---

        for participant in participants_data:
            participant_id = participant.get('id')
            name = participant.get('name', 'N/A')
            description = participant.get('description', '')
            nation = 'N/A'
            status = 'N/A'

            # Extract Nation and Status from propertyBag
            properties = participant.get('propertyBag', {}).get('properties', [])
            for prop in properties:
                prop_name = prop.get('name')
                prop_values = prop.get('values')
                if prop_values: # Check if values list exists and is not empty
                    if prop_name == 'Nation':
                        nation = prop_values[0]
                    elif prop_name == 'Status':
                        status = prop_values[0]

            # Calculate test counts using the pre-compiled actual_test_list
            total_test_count = 0
            coordinator_count = 0
            partner_count = 0
            observer_count = 0

            # Extract all identifiers we can match on from the participant
            # First get the participant ID/key (if available)
            participant_id_str = str(participant_id) if participant_id else ''
            
            # Get the participant name from participants.json to use for matching
            participant_name_from_source = participant.get('name')
            # Normalize the name (lowercase, strip whitespace) for robust comparison
            participant_name_normalized = participant_name_from_source.strip().lower() if participant_name_from_source else None
            
            # In the property bag, look for any keys that might be used for matching
            alternative_identifiers = set()
            if participant_name_normalized:
                alternative_identifiers.add(participant_name_normalized)
            
            # Sometimes, participant IDs in test_results_data are in a different format (like '2025-DEU-CC-311')
            # Extract these from the property bag if available
            for prop in properties:
                if prop.get('name') == 'ParticipantKey' and prop.get('values'):
                    for val in prop.get('values'):
                        if val:
                            alternative_identifiers.add(val.strip().lower())
            
            logging.debug(f"Processing participant: '{participant_name_normalized}' with ID '{participant_id_str}' and alternative IDs: {alternative_identifiers}")
            
            # Proceed with counting only if we have a participant to match and a valid list of tests
            if actual_test_list and (participant_name_normalized or alternative_identifiers):
                for test_index, test in enumerate(actual_test_list): # Iterate through each test
                    if not isinstance(test, dict):
                        continue

                    found_in_this_test = False # Flag to track if participant found in any role for overall count
                    found_as_coordinator = False
                    found_as_partner = False
                    found_as_observer = False

                    # Check coordinator
                    coordinator_data = test.get('Coordinator', {})
                    coordinator_participant_raw = coordinator_data.get('Participant') if isinstance(coordinator_data, dict) else None
                    
                    if coordinator_participant_raw:
                        # Try an exact match on the coordinator string
                        coord_lower = coordinator_participant_raw.strip().lower()
                        
                        # Check if the coordinator matches any of our identifiers
                        if (participant_name_normalized and coord_lower == participant_name_normalized) or \
                           coord_lower in alternative_identifiers:
                            found_in_this_test = True
                            found_as_coordinator = True
                            logging.debug(f"    MATCH found in Coordinator '{coordinator_participant_raw}' for participant in test {test_index}")

                    # Check partners (regardless of coordinator match)
                    partners_data = test.get('Partners', [])
                    if isinstance(partners_data, list):
                        for partner_entry in partners_data:
                            partner_participant_raw = partner_entry.get('Participant') if isinstance(partner_entry, dict) else None
                            
                            if partner_participant_raw:
                                # Try an exact match on the partner string
                                partner_lower = partner_participant_raw.strip().lower()
                                
                                # Check if the partner matches any of our identifiers
                                if (participant_name_normalized and partner_lower == participant_name_normalized) or \
                                   partner_lower in alternative_identifiers:
                                    found_in_this_test = True
                                    found_as_partner = True
                                    logging.debug(f"      MATCH found in Partner '{partner_participant_raw}' for participant in test {test_index}")
                                    break # Found as partner, no need to check other partners for this test
                    
                    # Check observers (regardless of coordinator/partner match)
                    observers_data = test.get('Observers', [])
                    if isinstance(observers_data, list):
                        for observer_entry in observers_data:
                            observer_participant_raw = observer_entry.get('Participant') if isinstance(observer_entry, dict) else None
                            
                            if observer_participant_raw:
                                # Try an exact match on the observer string
                                observer_lower = observer_participant_raw.strip().lower()
                                
                                # Check if the observer matches any of our identifiers
                                if (participant_name_normalized and observer_lower == participant_name_normalized) or \
                                   observer_lower in alternative_identifiers:
                                    found_in_this_test = True
                                    found_as_observer = True
                                    logging.debug(f"      MATCH found in Observer '{observer_participant_raw}' for participant in test {test_index}")
                                    break # Found as observer, no need to check other observers for this test

                    # If found in any role for this test, increment overall count
                    if found_in_this_test:
                        total_test_count += 1
                    
                    # Increment individual role counts
                    if found_as_coordinator:
                        coordinator_count += 1
                    if found_as_partner:
                        partner_count += 1
                    if found_as_observer:
                        observer_count += 1

            else:
                 if not participant_name_normalized:
                     logging.warning(f"Participant name is missing or invalid: '{participant_name_from_source}'")
                 if not actual_test_list:
                     logging.warning("actual_test_list is empty, cannot count tests.")

            # logging.debug(f"Final test_count for '{participant_name_normalized}': {test_count}") # Optional: Log final count

            processed_participants.append({
                'id': participant_id, # Keep the original ID
                'name': name,
                'description': description,
                'nation': nation,
                'status': status,
                'test_count': total_test_count,
                'coordinator_count': coordinator_count,
                'partner_count': partner_count,
                'observer_count': observer_count
            })

        return render_template('participants.html', participants=processed_participants)

    except FileNotFoundError as e:
         logging.error(f"Data file not found: {e}")
         # Render with error or empty list
         return render_template('participants.html', participants=[], error=f"Required data file not found: {e.filename}")
    except json.JSONDecodeError as e:
        logging.error(f"Error decoding JSON file: {e}")
        return render_template('participants.html', participants=[], error="Error reading data file format.")
    except Exception as e:
        logging.exception("Error processing participants data:")
        return render_template('participants.html', participants=[], error="An unexpected error occurred while processing participant data.")


@participants_bp.route('/api/participants/key_by_name')
@login_required
def api_get_participant_key_by_name():
    """
    Get participant key by name.
    
    Returns:
        JSON response with participant key.
    """
    name = request.args.get('name')
    if not name:
        return jsonify({'status': 'error', 'message': 'Missing query parameter: name'}), 400
    environment = session.get('environment', 'ciav')
    client = IOCore2ApiClient(base_url=settings.DEFAULT_URL, cookies=session.get('cookies'))
    participant_key = client.get_participant_key_by_name(name, environment)
    if participant_key is None:
        return jsonify({'status': 'error', 'message': 'Participant not found'}), 404
    return jsonify({'status': 'success', 'key': participant_key}), 200


@participants_bp.route('/api/participants/name_by_key')
@login_required
def api_get_participant_name_by_key():
    """
    Get participant name by key.
    
    Returns:
        JSON response with participant name.
    """
    key = request.args.get('key')
    if not key:
        return jsonify({'status': 'error', 'message': 'Missing query parameter: key'}), 400
    environment = session.get('environment', 'ciav')
    client = IOCore2ApiClient(base_url=settings.DEFAULT_URL, cookies=session.get('cookies'))
    name = client.get_participant_name_by_key(key, environment)
    if name is None:
        return jsonify({'status': 'error', 'message': 'Participant not found'}), 404
    return jsonify({'status': 'success', 'name': name}), 200


@participants_bp.route('/api/participants', methods=['GET'])
@login_required
def api_list_participants():
    """
    List all participants from IOCore2.
    
    Returns:
        JSON response with list of participants.
    """
    environment = session.get('environment', 'ciav')
    client = IOCore2ApiClient(base_url=settings.DEFAULT_URL, cookies=session.get('cookies'))
    try:
        resp = client.get_participants(environment)
        if resp.get('success'):
            return jsonify({'status': 'success', 'data': resp.get('data', [])}), 200
        else:
            return jsonify({'status': 'error', 'message': 'Failed to fetch participants'}), 500
    except Exception as e:
        logging.exception('Error listing participants')
        return jsonify({'status': 'error', 'message': str(e)}), 500


@participants_bp.route('/api/participants/key_to_name')
@login_required
def api_get_participant_name_by_key_from_file():
    """
    Get participant name by key (e.g., PAR-CIAV-000026) directly from participants.json file.
    
    Returns:
        JSON response with participant name.
    """
    participant_key = request.args.get('key')
    if not participant_key:
        return jsonify({'status': 'error', 'message': 'Missing query parameter: key'}), 400
    
    environment = session.get('environment', 'ciav')
    
    try:
        # Get participants directly from the JSON file
        participants_path = get_dynamic_data_path("participants.json")
        if not participants_path.exists():
            return jsonify({'status': 'error', 'message': 'Participants file not found'}), 500
            
        participants = read_json_file(participants_path)
        if not participants:
            return jsonify({'status': 'error', 'message': 'Failed to read participants data'}), 500
            
        # Find the participant with the matching key
        for participant in participants:
            if participant.get('key') == participant_key:
                return jsonify({
                    'status': 'success', 
                    'name': participant.get('name', 'Unknown'),
                    'key': participant_key
                }), 200
        
        # If we get here, no participant was found with the given key
        return jsonify({'status': 'error', 'message': f'Participant not found for key: {participant_key}'}), 404
    except Exception as e:
        logging.exception(f'Error getting participant name for key {participant_key}')
        return jsonify({'status': 'error', 'message': str(e)}), 500
