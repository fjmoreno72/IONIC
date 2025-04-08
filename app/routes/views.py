"""
View routes for the IOCore2 Coverage Analysis Tool.
"""
import logging
import os
import json
import uuid
from pathlib import Path
from flask import Blueprint, render_template, redirect, url_for, request, session, jsonify, current_app # Import session and current_app

# Updated imports
from app.core.auth import login_required
from app.utils.file_operations import get_dynamic_data_path, read_json_file # Added import for dynamic paths and read_json_file
from app.data_access.affiliates_repository import get_all_affiliates, save_affiliates # Added import
from app.data_access.sps_repository import get_all_sps, save_sps # Added SP repository import
from app.data_access.links_repository import get_all_links, add_link, update_link, delete_link # Added Links repository import
from app.data_access.ascs_repository import get_all_ascs, save_ascs # Added ASCs repository import
from app.config import settings
from werkzeug.utils import secure_filename

# Create blueprint
views_bp = Blueprint('views', __name__)

@views_bp.route('/')
def index():
    """
    Render the index (login) page.
    
    Returns:
        Rendered index template or redirect to tree view if already logged in
    """
    from flask import session
    
    # Redirect to tree view if already logged in
    if 'cookies' in session:
        return redirect(url_for('views.view_tree_func'))
        
    return render_template('index_ionic.html', default_url=settings.DEFAULT_URL)

@views_bp.route('/view_tree')
@login_required
def view_tree():
    """
    Render the SREQ tree view page.
    
    Returns:
        Rendered tree view template
    """
    # Updated imports
    from app.data_models.sreq_analysis import organize_tin_data
    from app.utils.file_operations import read_json_file

    logging.info("Accessing SREQ tree view")

    try:
        # Use dynamic path based on session environment
        sreq_path = get_dynamic_data_path("SREQ.json")

        if not sreq_path.exists():
            logging.warning(f"SREQ file not found at {sreq_path}")
            return render_template("index_tree_tin.html")
        
        data = read_json_file(sreq_path)
        organized_data = organize_tin_data(data)
        
        return render_template("index_tree_tin.html", data=organized_data)
    except Exception as e:
        logging.exception("Error organizing TIN data:")
        return render_template("index_tree_tin.html")

@views_bp.route('/view_tree_func')
@login_required
def view_tree_func():
    """
    Render the SREQ functional tree view page.
    
    Returns:
        Rendered functional tree view template
    """
    # Updated imports
    from app.data_models.sreq_analysis import organize_functional_data
    from app.utils.file_operations import read_json_file

    logging.info("Accessing functional tree view")

    try:
        # Use dynamic paths based on session environment
        sreq_path = get_dynamic_data_path("SREQ.json")
        func_path = get_dynamic_data_path("SP5-Functional.json")

        if not sreq_path.exists() or not func_path.exists():
            logging.warning(f"Required file(s) not found: SREQ at {sreq_path}, Functional at {func_path}")
            return render_template("index_tree_func.html", default_url=settings.DEFAULT_URL)
        
        sreq_data = read_json_file(sreq_path)
        func_data = read_json_file(func_path)
        
        # Organize the data
        organized_data = organize_functional_data(sreq_data, func_data)
        
        return render_template("index_tree_func.html", data=organized_data, default_url=settings.DEFAULT_URL)
    except Exception as e:
        logging.exception("Error organizing functional data:")
        return render_template("index_tree_func.html", default_url=settings.DEFAULT_URL)

@views_bp.route('/view_ier_tree')
@login_required
def view_ier_tree():
    """
    Render the IER tree view page.
    
    Returns:
        Rendered IER tree view template
    """
    # Updated imports
    from app.data_models.ier_analysis import analyze_ier_data, read_tin_data
    from app.utils.file_operations import read_json_file

    logging.info("Accessing IER tree view")

    try:
        # Use dynamic paths based on session environment
        ier_path = get_dynamic_data_path("IER.json")
        tin_csv_file = get_dynamic_data_path("TIN2.csv")

        if not ier_path.exists():
            logging.warning(f"IER file not found at {ier_path}")
            return render_template("index_ier_tree.html", data={})
        
        # Read TIN data to map TINs to services
        logging.info(f"Reading TIN data from {tin_csv_file}...")
        tin_to_service = read_tin_data(tin_csv_file)
        
        # Organize the data using the TIN to service mapping
        data = read_json_file(ier_path)
        raw_organized_data = analyze_ier_data(data, tin_to_service=tin_to_service)
        
        # Convert defaultdict to regular dict for template rendering
        organized_data = {}
        for pi_key, iers in raw_organized_data.items():
            organized_data[pi_key] = {}
            for ier_key, services in iers.items():
                organized_data[pi_key][ier_key] = {}
                for service_name, service_data in services.items():
                    organized_data[pi_key][ier_key][service_name] = {
                        "idp_tin_name": service_data["idp_tin_name"],
                        "test_cases": service_data["test_cases"]
                    }
        
        return render_template("index_ier_tree.html", data=organized_data)
    except Exception as e:
        logging.exception("Error organizing IER data:")
        return render_template("index_ier_tree.html", data={})

@views_bp.route('/system_monitor')
@login_required
def system_monitor():
    """
    Render the system monitor page.
    
    Returns:
        Rendered system monitor template
    """
    logging.info("Accessing system monitor")
    server_url = session.get('url', 'Unknown Server') # Get URL from session, default if not found
    return render_template('system_monitor.html', server_url=server_url)

@views_bp.route('/test_cases')
@login_required
def test_cases():
    """
    Render the test cases page.
    
    Returns:
        Rendered test cases template
    """
    logging.info("Accessing test cases")
    return render_template('test_case.html')

@views_bp.route('/work_in_progress')
@login_required
def work_in_progress():
    """
    Render the work in progress page.

    Returns:
        Rendered work in progress template
    """
    logging.info("Accessing work in progress page")
    return render_template('work_in_progress.html')

@views_bp.route('/test_results')
@login_required
def test_results():
    """
    Render the test results page.

    Returns:
        Rendered test results template
    """
    logging.info("Accessing test results")
    return render_template('test_results.html')

@views_bp.route('/participants')
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
                if 'TestPlans' in test_results_data:
                    test_plans_list = test_results_data['TestPlans']
                    if isinstance(test_plans_list, list):
                        # Iterate through each TestPlan to extract its Tests
                        for test_plan in test_plans_list:
                            if isinstance(test_plan, dict):
                                if 'Tests' in test_plan:
                                     tests_list = test_plan['Tests']
                                     if isinstance(tests_list, list):
                                         actual_test_list.extend(tests_list) # Add tests from this plan to the main list
                                     else:
                                         logging.warning(f"Found 'Tests' key in test_plan, but its value is not a list (type: {type(tests_list)}). Skipping tests in this plan.")
                                # else: # Removed log for missing 'Tests' key as it's expected
                                #      logging.warning("Found test_plan dictionary, but it's missing the 'Tests' key. Skipping tests in this plan.")
                            else:
                                logging.warning(f"Item in 'TestPlans' list is not a dictionary (type: {type(test_plan)}). Skipping tests in this plan.")
                        # Removed log for empty actual_test_list after processing TestPlans
                        # if not actual_test_list:
                        #      logging.warning("Successfully processed 'TestPlans' list, but it contained no actual 'Tests' lists within its items.")
                    else:
                        logging.error(f"'TestPlans' key found in test_results_data, but its value is not a list (type: {type(test_plans_list)}). Cannot extract tests.")
                else:
                    logging.error("'TestPlans' key not found in the test_results_data dictionary. Cannot extract tests.")
            elif isinstance(test_results_data, list):
                 # Fallback if the structure is just a flat list (less likely based on API)
                 actual_test_list = test_results_data
                 logging.warning("Test results data is a list. Processing as a flat list of tests.")
            else:
                 # This covers cases where test_results_data is None or other types
                 logging.error(f"Test results data loaded but is not a dictionary with 'TestPlans' or a list (type: {type(test_results_data)}). Cannot calculate test counts accurately.")
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

            # Calculate test count using the pre-compiled actual_test_list
            test_count = 0

            # Get the participant name from participants.json to use for matching
            participant_name_from_source = participant.get('name')
            # Normalize the name (lowercase, strip whitespace) for robust comparison
            participant_name_normalized = participant_name_from_source.strip().lower() if participant_name_from_source else None

            logging.debug(f"Processing participant: '{participant_name_normalized}' (Source: '{participant_name_from_source}')")

            # Proceed with counting only if we have a normalized participant name and a valid list of tests
            if participant_name_normalized and actual_test_list:
                 for test_index, test in enumerate(actual_test_list): # Iterate through each test
                    if not isinstance(test, dict):
                        continue

                    found_in_this_test = False # Flag to track if participant found in this specific test

                    # Check coordinator
                    coordinator_data = test.get('Coordinator', {})
                    coordinator_participant_raw = coordinator_data.get('Participant') if isinstance(coordinator_data, dict) else None
                    coordinator_participant_normalized = coordinator_participant_raw.strip().lower() if coordinator_participant_raw else None

                    if coordinator_participant_normalized and coordinator_participant_normalized == participant_name_normalized:
                        found_in_this_test = True
                        logging.debug(f"    MATCH found in Coordinator for '{participant_name_normalized}' in test {test_index}")

                    # If not found as coordinator, check partners
                    if not found_in_this_test:
                        partners_data = test.get('Partners', [])
                        if isinstance(partners_data, list):
                            for partner_entry in partners_data:
                                partner_participant_raw = partner_entry.get('Participant') if isinstance(partner_entry, dict) else None
                                partner_participant_normalized = partner_participant_raw.strip().lower() if partner_participant_raw else None
                                if partner_participant_normalized and partner_participant_normalized == participant_name_normalized:
                                    found_in_this_test = True
                                    logging.debug(f"      MATCH found in Partners for '{participant_name_normalized}' in test {test_index}")
                                    break # Found as partner, no need to check other partners for this test

                    # If found in either role for this test, increment count
                    if found_in_this_test:
                        test_count += 1
                        # The outer loop will naturally proceed to the next test

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
                'test_count': test_count
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
        # Generic error for unexpected issues
        return render_template('participants.html', participants=[], error="An unexpected error occurred while processing participant data.")


@views_bp.route('/objectives')
@login_required
def objectives_view():
    """
    Render the objectives page, loading and processing data.

    Returns:
        Rendered objectives template with processed data.
    """
    logging.info("Accessing Objectives page")
    processed_objectives = []
    objective_test_counts = {}
    test_results_data = None # Initialize

    # Filter sets
    statuses = set()
    external_statuses = set()
    networks = set()
    focus_areas = set()

    try:
        objectives_path = get_dynamic_data_path("objectives.json")
        test_results_path = get_dynamic_data_path("test_results.json")

        # Load objectives data
        if not objectives_path.exists():
            logging.warning(f"Objectives file not found at {objectives_path}")
            return render_template('objectives.html', objectives=[], error="Objectives data file not found.")
        objectives_data = read_json_file(objectives_path)
        if not objectives_data: # Handle case where file exists but is empty/invalid JSON
             logging.error(f"Objectives file at {objectives_path} is empty or invalid.")
             return render_template('objectives.html', objectives=[], error="Objectives data file is empty or invalid.")


        # Load test results data and calculate counts
        if test_results_path.exists():
            try:
                test_results_data = read_json_file(test_results_path)
                # Ensure test_results_data is a dictionary and contains 'TestPlans' which is a list
                if isinstance(test_results_data, dict) and 'TestPlans' in test_results_data and isinstance(test_results_data['TestPlans'], list):
                    test_plans_list = test_results_data['TestPlans']
                    logging.info(f"Processing {len(test_plans_list)} TestPlans from {test_results_path}.")
                    for i, test_plan in enumerate(test_plans_list):
                        if isinstance(test_plan, dict):
                            # Correctly extract the Objective Key from the nested structure
                            objective_data = test_plan.get('Objective', {}) # Get the Objective dict safely
                            objective_key = objective_data.get('Key') if isinstance(objective_data, dict) else None # Get the key safely (Use 'Key' with uppercase K)

                            tests_list = test_plan.get('Tests', []) # Default to empty list if 'Tests' key is missing

                            # Ensure the objective key exists (and starts with OBJ-) and Tests is actually a list
                            if objective_key and objective_key.startswith('OBJ-') and isinstance(tests_list, list):
                                test_count = len(tests_list)
                                # Use .get to safely handle the first time a key is encountered
                                objective_test_counts[objective_key] = objective_test_counts.get(objective_key, 0) + test_count
                                logging.debug(f"  TestPlan {i}: Key='{objective_key}', Found {test_count} tests. Cumulative count for key: {objective_test_counts[objective_key]}")
                            else:
                                logging.warning(f"  Skipping TestPlan {i}: Invalid structure. Key='{objective_key}' (Type: {type(objective_key)}), Tests Type: {type(tests_list)}")
                        else:
                            logging.warning(f"  Skipping TestPlan {i}: Item is not a dictionary (Type: {type(test_plan)}).")
                else:
                    logging.warning(f"Test results file {test_results_path} loaded but structure is invalid. Expected dict with 'TestPlans' list. Found type: {type(test_results_data)}")

            except json.JSONDecodeError as e:
                logging.error(f"Error decoding test results JSON file {test_results_path}: {e}")
                # Reset counts if file is invalid
                objective_test_counts = {}
            except Exception as e:
                logging.error(f"Unexpected error reading/processing test results file {test_results_path}: {e}")
                # Reset counts on other errors
                objective_test_counts = {}
        else:
            logging.warning(f"Test results file not found at {test_results_path}. Test counts will be 0.")

        # Log the final calculated counts before processing objectives
        logging.info(f"Final calculated objective_test_counts dictionary: {objective_test_counts}")

        # Process objectives data
        for objective in objectives_data:
            key = objective.get('key', 'N/A')
            name = objective.get('name', 'N/A')
            status = objective.get('status', 'N/A')
            if status and status != 'N/A': statuses.add(status)

            # Extract from propertyBag
            main_focus = 'N/A'
            focus_list = []
            ext_status = 'N/A'
            net_list = []
            properties = objective.get('propertyBag', {}).get('properties', [])
            for prop in properties:
                prop_name = prop.get('name')
                prop_values = prop.get('values')
                if prop_values: # Check if values list exists and is not empty
                    first_value = prop_values[0] if prop_values else 'N/A'
                    if prop_name == 'MainFocusArea':
                        main_focus = first_value
                        if main_focus and main_focus != 'N/A': focus_areas.add(main_focus)
                    elif prop_name == 'FocusAreas':
                        focus_list = [val for val in prop_values if val] # Filter out empty strings
                        for fa in focus_list:
                            if fa and fa != 'N/A': focus_areas.add(fa)
                    elif prop_name == 'ExternalStatus':
                        ext_status = first_value
                        if ext_status and ext_status != 'N/A': external_statuses.add(ext_status)
                    elif prop_name == 'Networks':
                        net_list = [val for val in prop_values if val] # Filter out empty strings
                        for net in net_list:
                            if net and net != 'N/A': networks.add(net)

            # Get test count
            test_count = objective_test_counts.get(key, 0)

            processed_objectives.append({
                'key': key,
                'name': name,
                'status': status,
                'main_focus_area': main_focus,
                'focus_areas': focus_list,
                'external_status': ext_status,
                'networks': net_list,
                'test_count': test_count
            })

        # Prepare filter lists for template
        filter_data = {
            'statuses': sorted(list(statuses)),
            'external_statuses': sorted(list(external_statuses)),
            'networks': sorted(list(networks)),
            'focus_areas': sorted(list(focus_areas))
        }

        return render_template('objectives.html', objectives=processed_objectives, filters=filter_data)

    except FileNotFoundError as e:
         logging.error(f"Data file not found: {e}")
         return render_template('objectives.html', objectives=[], error=f"Required data file not found: {e.filename}")
    except json.JSONDecodeError as e:
        logging.error(f"Error decoding objectives JSON file: {e}")
        return render_template('objectives.html', objectives=[], error="Error reading objectives data file format.")
    except Exception as e:
        logging.exception("Error processing objectives data:")
        return render_template('objectives.html', objectives=[], error="An unexpected error occurred while processing objectives data.")


# --- Updated ASC Routes ---

@views_bp.route('/affiliates')
@login_required
def affiliates():
    """Renders the affiliates management page."""
    logging.info("Accessing Affiliates page")
    # Now uses the refactored component-based template
    return render_template('pages/affiliates_new.html', title="Affiliates")

@views_bp.route('/asc_services')
@login_required
def asc_services():
    """Render the ASC Services page."""
    logging.info("Accessing ASC Services page")
    # Now uses the refactored component-based template
    return render_template('pages/services_new.html', title="ASC Services")

@views_bp.route('/asc_gps')
@login_required
def asc_gps():
    """Render the ASC GPs page."""
    logging.info("Accessing ASC GPs page")
    # Now uses the refactored component-based template
    return render_template('pages/gps_new.html', title="ASC GPs")

@views_bp.route('/asc_links')
@login_required
def asc_links():
    """Render the ASC Links page."""
    logging.info("Accessing ASC Links page")
    return render_template('pages/links_new.html', title="ASC Links")

@views_bp.route('/asc_config_items')
@login_required
def asc_config_items():
    """Render the ASC Configuration Items page."""
    logging.info("Accessing ASC Configuration Items page")
    # Uses the new component-based template
    return render_template('pages/CI_new.html', title="ASC Configuration Items")

@views_bp.route('/asc_sps')
@login_required
def asc_sps():
    """Render the ASC SPs page."""
    logging.info("Accessing ASC SPs page")
    # Now uses the refactored component-based template
    return render_template('pages/sps_new.html', title="ASC SPs")

# --- Legacy routes for backward compatibility (redirect to main routes) ---

@views_bp.route('/asc_affiliates')
@login_required
def asc_affiliates():
    """Redirects to main affiliates page."""
    logging.info("Redirecting from /asc_affiliates to /affiliates")
    return redirect(url_for('views.affiliates'))

@views_bp.route('/asc_gps_new')
@login_required
def asc_gps_new():
    """Redirects to main GPs page."""
    logging.info("Redirecting from /asc_gps_new to /asc_gps")
    return redirect(url_for('views.asc_gps'))

@views_bp.route('/asc_services_new')
@login_required
def asc_services_new():
    """Redirects to main Services page."""
    logging.info("Redirecting from /asc_services_new to /asc_services")
    return redirect(url_for('views.asc_services'))

@views_bp.route('/asc_sps_new')
@login_required
def asc_sps_new():
    """Redirects to main SPs page."""
    logging.info("Redirecting from /asc_sps_new to /asc_sps")
    return redirect(url_for('views.asc_sps'))

@views_bp.route('/asc_affiliates_new')
@login_required
def asc_affiliates_new():
    """Redirects to main Affiliates page."""
    logging.info("Redirecting from /asc_affiliates_new to /affiliates")
    return redirect(url_for('views.affiliates'))

# --- Other ASC routes ---

@views_bp.route('/asc_ascs')
@login_required
def asc_ascs():
    """Render the ASC ASCs page."""
    logging.info("Accessing ASC ASCs page")
    # Now uses the refactored component-based template
    return render_template('pages/ascs_new.html', title="ASC ASCs")

@views_bp.route('/asc_kanban')
@login_required
def asc_kanban():
    """Render the ASC Kanban board page."""
    logging.info("Accessing ASC Kanban board")
    return render_template('pages/asc_kanban.html', title="ASC Kanban Board")

@views_bp.route('/update_ascs', methods=['POST'])
@login_required
def update_ascs():
    """
    API endpoint to update ASCs data.
    
    Returns:
        JSON response with success or error message
    """
    try:
        ascs_data = request.json
        if not ascs_data:
            return jsonify({'error': 'No data provided'}), 400

        # Save using the repository function
        if save_ascs(ascs_data):
            return jsonify({
                'success': True,
                'message': 'ASCs updated successfully'
            })
        else:
            return jsonify({'error': 'Failed to save ASCs data'}), 500
            
    except Exception as e:
        logging.exception(f"Error updating ASCs: {str(e)}")
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

@views_bp.route('/api/ascs', methods=['GET'])
@login_required
def api_get_ascs():
    """
    API endpoint to get all ASCs data.
    """
    try:
        ascs_data = get_all_ascs() # Use repository function
        return jsonify(ascs_data)
    except Exception as e:
        logging.exception(f"Error getting ASCs: {str(e)}")
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

# --- API Routes for Affiliates ---

@views_bp.route('/api/sps/upload-icon', methods=['POST'])
@login_required
def upload_sp_icon():
    """
    API endpoint to handle icon image uploads for service providers (SPs).
    
    Returns:
        JSON response with the saved file path or error message.
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        # Get SP name from request to name the icon
        sp_name = request.form.get('spName', '')
        if not sp_name:
            return jsonify({'error': 'SP name is required'}), 400
            
        # Sanitize the name for filename (remove spaces, special chars)
        safe_name = secure_filename(sp_name.lower().replace(' ', '_'))
        filename = f"sp_icon_{safe_name}.png"
        
        # Ensure the sp icons directory exists (Using current_app.static_folder)
        sp_dir = Path(current_app.static_folder) / "ASC" / "image" / "sp" # Corrected path
        os.makedirs(sp_dir, exist_ok=True)

        # Save the file
        file_path = sp_dir / filename
        file.save(file_path)
        
        # Return the relative path for storage in the data file
        relative_path = f"./image/sp/{filename}"
        return jsonify({
            'success': True,
            'path': relative_path,
            'message': 'Icon uploaded successfully'
        })
        
    except Exception as e:
        logging.exception(f"Error uploading SP icon: {str(e)}")
        return jsonify({'error': f'Error uploading SP icon: {str(e)}'}), 500

# Removed service upload endpoints (moved to app/routes/services.py)

@views_bp.route('/api/affiliates/upload-flag', methods=['POST'])
@login_required
def upload_affiliate_flag():
    """
    API endpoint to handle flag image uploads for affiliates.
    
    Returns:
        JSON response with the saved file path or error message.
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        # Get affiliate name from request to name the flag
        affiliate_name = request.form.get('affiliateName', '')
        if not affiliate_name:
            return jsonify({'error': 'Affiliate name is required'}), 400
            
        # Sanitize the name for filename (remove spaces, special chars)
        safe_name = secure_filename(affiliate_name.lower().replace(' ', '_'))
        filename = f"flag_{safe_name}.png"
        
        # Ensure the flags directory exists (Using current_app.static_folder)
        flags_dir = Path(current_app.static_folder) / "ASC" / "image" / "flags" # Corrected path
        os.makedirs(flags_dir, exist_ok=True)

        # Save the file
        file_path = flags_dir / filename
        file.save(file_path)
        
        # Return the relative path for storage in the data file
        relative_path = f"./image/flags/{filename}"
        return jsonify({
            'success': True,
            'path': relative_path,
            'message': 'Flag uploaded successfully'
        })
        
    except Exception as e:
        logging.exception(f"Error uploading flag: {str(e)}")
        return jsonify({'error': f'Error uploading flag: {str(e)}'}), 500

@views_bp.route('/api/gps/upload-icon', methods=['POST'])
@login_required
def upload_gp_icon():
    """
    API endpoint to handle icon image uploads for generic products (GPs).
    
    Returns:
        JSON response with the saved file path or error message.
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        # Get GP name from request to name the icon
        gp_name = request.form.get('gpName', '')
        if not gp_name:
            return jsonify({'error': 'GP name is required'}), 400
            
        # Sanitize the name for filename (remove spaces, special chars)
        safe_name = secure_filename(gp_name.lower().replace(' ', '_'))
        filename = f"gp_icon_{safe_name}.png"
        
        # Ensure the gp icons directory exists (Using current_app.static_folder)
        gp_dir = Path(current_app.static_folder) / "ASC" / "image" / "gp" # Corrected path
        os.makedirs(gp_dir, exist_ok=True)

        # Save the file
        file_path = gp_dir / filename
        file.save(file_path)
        
        # Return the relative path for storage in the data file
        relative_path = f"./image/gp/{filename}"
        return jsonify({
            'success': True,
            'path': relative_path,
            'message': 'Icon uploaded successfully'
        })
        
    except Exception as e:
        logging.exception(f"Error uploading GP icon: {str(e)}")
        return jsonify({'error': f'Error uploading GP icon: {str(e)}'}), 500

@views_bp.route('/api/links', methods=['GET', 'POST', 'PUT', 'DELETE'])
@login_required
def manage_links():
    """
    API endpoint to manage Links data.
    
    Methods:
        GET: Return all Links
        POST: Add a new Link
        PUT: Update an existing Link
        DELETE: Delete a Link
    
    Returns:
        JSON response with the result of the operation
    """
    # Removed direct file path handling - now uses repository
    
    try:
        # GET: Return all Links
        if request.method == 'GET':
            links = get_all_links() # Use repository function
            return jsonify(links)
            
        # POST: Add a new Link
        elif request.method == 'POST':
            new_link_data = request.json
            if not new_link_data or 'name' not in new_link_data: # Basic validation
                 return jsonify({'error': 'Invalid link data provided'}), 400

            # Generate ID and ensure linkCIs exist (handled within repository add_link if needed, or here)
            # Let's keep ID generation here for consistency with previous logic
            links = get_all_links()
            highest_id = 0
            if links:
                try:
                    for link in links:
                        if 'id' in link and link['id'].startswith('LNK-'):
                            try:
                                current_id = int(link['id'].split('-')[1])
                                highest_id = max(highest_id, current_id)
                            except (IndexError, ValueError):
                                pass
                except Exception:
                    pass # Ignore errors during ID finding
            
            new_id = f"LNK-{str(highest_id + 1).zfill(4)}"
            
            # Double-check uniqueness (though repository might also do this)
            while any(link.get('id') == new_id for link in links):
                highest_id += 1
                new_id = f"LNK-{str(highest_id + 1).zfill(4)}"
                
            new_link_data['id'] = new_id
            
            # Ensure linkCIs is initialized as empty array if not provided
            if 'linkCIs' not in new_link_data:
                new_link_data['linkCIs'] = []

            # Add using repository function
            if add_link(new_link_data):
                return jsonify({
                    'success': True,
                    'link': new_link_data, # Return the data that was added
                    'message': 'Link added successfully'
                }), 201 # Use 201 Created status code
            else:
                return jsonify({'error': 'Failed to save link'}), 500
            
        # PUT: Update an existing Link
        elif request.method == 'PUT':
            updated_link_data = request.json
            link_id = updated_link_data.get('id')
            
            if not link_id:
                return jsonify({'error': 'Link ID is required for update'}), 400
            
            # Ensure linkCIs exists if not provided (optional, repo might handle)
            # If we want to preserve existing CIs if not sent, we'd need to load first:
            # existing_link = find_link_by_id(link_id) # Need find_link_by_id in repo
            # if existing_link and 'linkCIs' not in updated_link_data:
            #     updated_link_data['linkCIs'] = existing_link.get('linkCIs', [])

            # Update using repository function
            try:
                if update_link(updated_link_data):
                    return jsonify({
                        'success': True,
                        'link': updated_link_data,
                        'message': 'Link updated successfully'
                    })
                else:
                    # This case might not be reachable if update_link raises ValueError
                    return jsonify({'error': 'Failed to update link'}), 500
            except ValueError as e: # Catch specific error from repository
                 return jsonify({'error': str(e)}), 404 # Not found or other validation error

        # DELETE: Delete a Link
        elif request.method == 'DELETE':
            link_id = request.args.get('id')
            if not link_id:
                return jsonify({'error': 'Link ID is required for deletion'}), 400
            
            # Delete using repository function
            try:
                if delete_link(link_id):
                    return jsonify({
                        'success': True,
                        'message': f'Link with ID {link_id} deleted successfully'
                    })
                else:
                    # This case might not be reachable if delete_link raises ValueError
                    return jsonify({'error': 'Failed to delete link'}), 500
            except ValueError as e: # Catch specific error from repository
                 return jsonify({'error': str(e)}), 404 # Not found

    except ValueError as ve: # Catch validation errors from repository
        logging.warning(f"Validation error managing Links: {str(ve)}")
        return jsonify({'error': str(ve)}), 400 # Bad request
    except Exception as e:
        logging.exception(f"Error managing Links: {str(e)}")
        return jsonify({'error': f'An unexpected error occurred: {str(e)}'}), 500

# Removed conflicting /api/gps route (now handled in app/routes/gps.py)

@views_bp.route('/api/sps', methods=['GET', 'POST', 'PUT', 'DELETE'])
@login_required
def manage_sps():
    """
    API endpoint to manage Service Providers (SPs) data.
    
    Methods:
        GET: Return all SPs
        POST: Add a new SP
        PUT: Update an existing SP
        DELETE: Delete an SP
    
    Returns:
        JSON response with the result of the operation
    """
    # Removed direct path construction and directory creation (handled by repository)
    
    try:
        # GET: Return all SPs
        if request.method == 'GET':
            sps = get_all_sps() # Use repository function
            return jsonify(sps)
            
        # POST: Add a new SP
        elif request.method == 'POST':
            sps = get_all_sps() # Load existing data via repository
            new_sp = request.json
            
            # Generate a new ID - find the highest existing ID
            highest_id = 0
            if sps:
                try:
                    # Extract all numeric parts and find the highest
                    for sp in sps:
                        if 'id' in sp and sp['id'].startswith('SP-'):
                            try:
                                current_id = int(sp['id'].split('-')[1])
                                highest_id = max(highest_id, current_id)
                            except (IndexError, ValueError):
                                pass
                except Exception:
                    pass
                    
            new_id = f"SP-{str(highest_id + 1).zfill(4)}"
            
            # Double-check that the ID is unique
            while any(sp.get('id') == new_id for sp in sps):
                highest_id += 1
                new_id = f"SP-{str(highest_id + 1).zfill(4)}"
                
            new_sp['id'] = new_id
            
            # Add to list
            sps.append(new_sp)
            
            save_sps(sps) # Save back via repository
                
            return jsonify({
                'success': True,
                'sp': new_sp,
                'message': 'Service Provider added successfully'
            })
            
        # PUT: Update an existing SP
        elif request.method == 'PUT':
            sps = get_all_sps() # Load existing data via repository
            updated_sp = request.json
            
            # Find and update the SP
            sp_id = updated_sp.get('id')
            if not sp_id:
                return jsonify({'error': 'SP ID is required'}), 400
                
            found = False
            for i, sp in enumerate(sps):
                if sp.get('id') == sp_id:
                    sps[i] = updated_sp
                    found = True
                    break
                    
            if not found:
                return jsonify({'error': f'SP with ID {sp_id} not found'}), 404
                
            save_sps(sps) # Save back via repository
                
            return jsonify({
                'success': True,
                'sp': updated_sp,
                'message': 'Service Provider updated successfully'
            })
        
        # DELETE: Delete an SP
        elif request.method == 'DELETE':
            sps = get_all_sps() # Load existing data via repository
            
            # Get the SP ID from query params
            sp_id = request.args.get('id')
            if not sp_id:
                return jsonify({'error': 'SP ID is required'}), 400
            
            # Find the SP to get its icon path before removal
            sp_to_delete = next((sp for sp in sps if sp.get('id') == sp_id), None)
            
            # Remove SP from list
            initial_count = len(sps)
            sps = [sp for sp in sps if sp.get('id') != sp_id]
            
            if len(sps) == initial_count:
                return jsonify({'error': f'SP with ID {sp_id} not found'}), 404
            
            save_sps(sps) # Save back via repository
            
            # Try to delete the icon file if it exists
            if sp_to_delete and sp_to_delete.get('iconPath'):
                try:
                    # Use current_app.static_folder reference
                    icon_path = Path(current_app.static_folder) / "ASC" / sp_to_delete['iconPath'].replace('./', '') # Corrected path
                    if icon_path.exists():
                        os.remove(icon_path)
                except Exception as e:
                    logging.warning(f"Could not delete icon file: {str(e)}")
            
            return jsonify({
                'success': True,
                'message': f'Service Provider with ID {sp_id} deleted successfully'
            })
            
    except Exception as e:
        logging.exception(f"Error managing SPs: {str(e)}")
        return jsonify({'error': f'Error: {str(e)}'}), 500

@views_bp.route('/api/affiliates', methods=['GET', 'POST', 'PUT', 'DELETE'])
@login_required
def manage_affiliates():
    """
    API endpoint to manage affiliates data.
    
    Methods:
        GET: Return all affiliates
        POST: Add a new affiliate
        PUT: Update an existing affiliate
        DELETE: Delete an affiliate
    
    Returns:
        JSON response with the result of the operation
    """
    # Removed direct path construction and directory creation
    
    try:
        # GET: Return all affiliates
        if request.method == 'GET':
            affiliates = get_all_affiliates() # Use repository function
            return jsonify(affiliates)
            
        # POST: Add a new affiliate
        elif request.method == 'POST':
            affiliates = get_all_affiliates() # Load existing data via repository
            new_affiliate = request.json
            
            # Generate a new ID - find the highest existing ID
            highest_id = 0
            if affiliates:
                try:
                    # Extract all numeric parts and find the highest
                    for affiliate in affiliates:
                        if 'id' in affiliate and affiliate['id'].startswith('AFF-'):
                            try:
                                current_id = int(affiliate['id'].split('-')[1])
                                highest_id = max(highest_id, current_id)
                            except (IndexError, ValueError):
                                pass
                except Exception:
                    pass
                    
            new_id = f"AFF-{str(highest_id + 1).zfill(4)}"
            
            # Double-check that the ID is unique
            while any(affiliate.get('id') == new_id for affiliate in affiliates):
                highest_id += 1
                new_id = f"AFF-{str(highest_id + 1).zfill(4)}"
                
            new_affiliate['id'] = new_id
            
            # Add to list
            affiliates.append(new_affiliate)
            
            save_affiliates(affiliates) # Save back via repository
                
            return jsonify({
                'success': True,
                'affiliate': new_affiliate,
                'message': 'Affiliate added successfully'
            })
            
        # PUT: Update an existing affiliate
        elif request.method == 'PUT':
            affiliates = get_all_affiliates() # Load existing data via repository
            
            # Check if data loading failed (e.g., file not found handled by repo)
            # Note: get_all_affiliates returns [] if file not found, so this check might not be strictly needed
            # depending on desired behavior, but keeping it explicit for clarity.
            # if not affiliates and affiliates_path.exists(): # Check if repo returned empty but file existed
            #     return jsonify({'error': 'Could not load affiliates data'}), 500

            updated_affiliate = request.json
            
            # Find and update the affiliate
            affiliate_id = updated_affiliate.get('id')
            if not affiliate_id:
                return jsonify({'error': 'Affiliate ID is required'}), 400
                
            found = False
            for i, affiliate in enumerate(affiliates):
                if affiliate.get('id') == affiliate_id:
                    affiliates[i] = updated_affiliate
                    found = True
                    break
                    
            if not found:
                return jsonify({'error': f'Affiliate with ID {affiliate_id} not found'}), 404
                
            save_affiliates(affiliates) # Save back via repository
                
            return jsonify({
                'success': True,
                'affiliate': updated_affiliate,
                'message': 'Affiliate updated successfully'
            })
        
        # DELETE: Delete an affiliate
        elif request.method == 'DELETE':
            affiliates = get_all_affiliates() # Load existing data via repository

            # Get the affiliate ID from query params
            affiliate_id = request.args.get('id')
            if not affiliate_id:
                return jsonify({'error': 'Affiliate ID is required'}), 400
            
            # Find and remove the affiliate
            initial_count = len(affiliates)
            affiliates = [a for a in affiliates if a.get('id') != affiliate_id]
            
            if len(affiliates) == initial_count:
                return jsonify({'error': f'Affiliate with ID {affiliate_id} not found'}), 404
            
            save_affiliates(affiliates) # Save back via repository
            
            return jsonify({
                'success': True,
                'message': f'Affiliate with ID {affiliate_id} deleted successfully'
            })
            
    except Exception as e:
        logging.exception(f"Error managing affiliates: {str(e)}")
