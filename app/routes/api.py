"""
API routes for the IOCore2 Coverage Analysis Tool.
"""
import logging
import threading
from datetime import datetime
import os
from pathlib import Path
import json
import time # Added for timing load
import ijson # Import ijson

from flask import Blueprint, jsonify, session, request, current_app, url_for # Added url_for
from werkzeug.exceptions import BadRequest, NotFound # Added NotFound

from app.core.auth import login_required, get_api_client
from app.core.exceptions import ApiRequestError, InvalidSession, DataFormatError # Import DataFormatError
from app.config import settings
from app.utils.file_operations import get_dynamic_data_path # Added import for dynamic paths
from app.data_access import gps_repository

# Create blueprint
api_bp = Blueprint('api', __name__)

# --- Actor ID to Name Mapping ---
_actor_map = None
_actor_map_load_lock = threading.Lock() # Prevent race conditions on load

def _load_actor_map():
    """Loads the actor ID to name mapping from actors.json."""
    global _actor_map
    start_time = time.time()
    logging.info("Attempting to load actors.json into memory...")
    # Use dynamic path based on session environment
    # Note: This runs at startup or first request, might not have session context yet.
    # Consider loading lazily within a request context if session is strictly needed here.
    # For now, assuming default 'ciav' is acceptable if no session.
    actors_path = get_dynamic_data_path("actors.json")

    if not actors_path.exists():
        logging.error(f"actors.json not found at {actors_path}.")
        _actor_map = {} # Set to empty dict to avoid reload attempts
        return

    try:
        with open(actors_path, 'r', encoding='utf-8') as f:
            actors_data = json.load(f)

        # Create the map {id: name}
        temp_map = {actor['id']: actor.get('name', 'Unknown Actor') for actor in actors_data if 'id' in actor}
        _actor_map = temp_map

        load_time = time.time() - start_time
        logging.info(f"Successfully loaded {len(_actor_map)} actors into map in {load_time:.2f} seconds.")

    except json.JSONDecodeError as e:
        logging.error(f"Error decoding actors.json: {e}")
        _actor_map = {} # Set to empty dict on error
    except MemoryError:
        logging.error("MemoryError: actors.json is too large to load into memory.")
        _actor_map = {} # Set to empty dict on error
    except Exception as e:
        logging.exception(f"Unexpected error loading actors.json: {e}")
        _actor_map = {} # Set to empty dict on error

# --- API Routes ---

@api_bp.route('/api/actor/<string:actor_id>')
@login_required
def get_actor_name(actor_id):
    """Get the name of an actor by its ID."""
    global _actor_map

    # Load map if not already loaded (thread-safe)
    if _actor_map is None:
        with _actor_map_load_lock:
            # Double-check inside lock
            if _actor_map is None:
                _load_actor_map()
                # If loading failed, _actor_map will be {}
                if _actor_map is None: # Should not happen if _load_actor_map sets it to {} on error
                     return jsonify({'success': False, 'error': 'Actor map could not be loaded.'}), 500

    actor_name = _actor_map.get(actor_id)

    if actor_name is None:
         # Check if the map is empty because loading failed
         # Use dynamic path based on session environment
        actors_path_check = get_dynamic_data_path("actors.json")
        if not _actor_map and actors_path_check.exists():
             return jsonify({'success': False, 'error': 'Actor map failed to load, cannot lookup ID.'}), 500
        # Otherwise, the ID genuinely wasn't found
        # Use raise NotFound for Flask to handle the 404 response
        raise NotFound(f"Actor with ID '{actor_id}' not found.")

    return jsonify({'success': True, 'name': actor_name})


@api_bp.route('/data')
@login_required
def get_data():
    """
    Get organized SREQ data.

    Returns:
        JSON response with organized data
    """
    from app.data.sreq_analysis import organize_tin_data
    from app.utils.file_operations import read_json_file

    try:
        # Use dynamic path based on session environment
        sreq_path = get_dynamic_data_path("SREQ.json")

        if not sreq_path.exists():
            logging.warning(f"SREQ file not found at {sreq_path}")
            return jsonify({
                'success': False,
                'error': 'SREQ data not found. Please fetch SREQ coverage first.'
            })

        data = read_json_file(sreq_path)
        organized_data = organize_tin_data(data)

        return jsonify(organized_data)
    except Exception as e:
        logging.exception("Error getting data")
        return jsonify({
            'success': False,
            'error': str(e)
        })

@api_bp.route('/ier_data')
@login_required
def get_ier_data():
    """
    Get organized IER data.

    Returns:
        JSON response with organized data
    """
    from app.data.ier_analysis import analyze_ier_data, read_tin_data
    from app.utils.file_operations import read_json_file

    try:
        # Use dynamic paths based on session environment
        ier_path = get_dynamic_data_path("IER.json")
        tin_csv_file = get_dynamic_data_path("TIN2.csv")

        if not ier_path.exists():
            logging.warning(f"IER file not found at {ier_path}")
            return jsonify({
                'success': False,
                'error': 'IER data not found. Please fetch IER coverage first.'
            })

        # Read TIN data
        logging.info(f"Reading TIN data from {tin_csv_file}...")
        tin_to_service = read_tin_data(tin_csv_file)

        # Read and analyze IER data
        data = read_json_file(ier_path)
        organized_data = analyze_ier_data(data, tin_to_service)

        return jsonify(organized_data)
    except Exception as e:
        logging.exception("Error getting IER data")
        return jsonify({
            'success': False,
            'error': str(e)
        })

@api_bp.route('/get_ier_coverage')
@login_required
def get_ier_coverage():
    """
    Fetch IER coverage data from IOCore2 API.

    Returns:
        JSON response with results
    """
    try:
        client = get_api_client()
        if not client:
            return jsonify({
                'success': False,
                'error': 'Not authenticated'
            })

        # Get IER coverage data
        # Pass environment explicitly
        environment = session.get('environment', 'ciav')
        result = client.get_ier_coverage(environment=environment) # Pass environment

        # Generate markdown content
        from app.data_models.ier_analysis import analyze_ier_data, generate_ier_markdown_output, read_tin_data # Corrected import path
        from app.utils.file_operations import read_json_file

        # Define dynamic paths
        ier_path = get_dynamic_data_path("IER.json", environment=environment) # Pass environment
        tin_csv_file = get_dynamic_data_path("TIN2.csv", environment=environment) # Pass environment

        # Read TIN data to map TINs to services
        logging.info(f"Reading TIN data from {tin_csv_file}...")
        tin_to_service = read_tin_data(tin_csv_file) # Use dynamic path

        # Process IER data using dynamic path
        logging.info(f"Reading IER data from {ier_path}...")
        data = read_json_file(ier_path) # Use the correctly defined dynamic path
        hierarchy = analyze_ier_data(data, tin_to_service)
        markdown_content = generate_ier_markdown_output(hierarchy)

        return jsonify({
            'success': True,
            'count': result.get('count', 0),
            'duration': result.get('duration', 0),
            'markdown': markdown_content
        })
    except InvalidSession:
        return jsonify({
            'success': False,
            'error': 'Your session has expired. Please log in again.'
        })
    except Exception as e:
        logging.exception("Error getting IER coverage")
        return jsonify({
            'success': False,
            'error': str(e)
        })

@api_bp.route('/get_requirement_coverage')
@login_required
def get_requirement_coverage():
    """
    Start a background process to fetch SREQ coverage data from IOCore2 API.

    Returns:
        JSON response with process start status
    """
    try:
        # Get the necessary data from the session before starting the background thread
        url = session.get('url')
        cookies = session.get('cookies')
        # Get environment from session *before* starting thread
        environment = session.get('environment', 'ciav') # Default to 'ciav'

        if not url or not cookies:
            return jsonify({
                'success': False,
                'error': "Missing URL or cookies in session"
            })

        # Store request info in the session to indicate processing has started
        session['sreq_processing'] = True
        session['sreq_start_time'] = datetime.now().isoformat()

        # Use threading to run the operation in the background
        thread = threading.Thread(
            target=process_sreq_coverage_in_background,
            args=(url, cookies, environment) # Pass environment to background task
        )
        thread.daemon = True  # Make sure thread doesn't block app shutdown
        thread.start()

        return jsonify({
            'success': True,
            'status': 'processing',
            'message': 'SREQ Coverage processing started in background'
        })
    except Exception as e:
        logging.exception("Error starting SREQ background task")
        return jsonify({
            'success': False,
            'error': f"Failed to start background processing: {str(e)}"
        })

@api_bp.route('/check_sreq_status')
@login_required
def check_sreq_status():
    """
    Check the status of background SREQ coverage processing.

    Returns:
        JSON response with process status
    """
    # Check if SREQ files exist and when they were last modified
    # Use dynamic path based on session environment
    sreq_json_path = get_dynamic_data_path("SREQ.json")

    try:
        if not sreq_json_path.exists():
            logging.warning(f"SREQ file not found at {sreq_json_path} for status check.")
            return jsonify({
                'status': 'not_started',
                'message': 'SREQ coverage has not been generated yet'
            })

        # Get file modification time
        mod_time = datetime.fromtimestamp(os.path.getmtime(sreq_json_path))

        # Check if we're currently processing
        processing = session.get('sreq_processing', False)
        start_time_str = session.get('sreq_start_time')

        if processing and start_time_str:
            # We're still processing - check if the file is newer than when we started
            start_time = datetime.fromisoformat(start_time_str)

            if mod_time > start_time:
                # Processing completed - clear the flag
                session.pop('sreq_processing', None)
                session.pop('sreq_start_time', None)

                return jsonify({
                    'status': 'completed',
                    'message': 'SREQ coverage processing completed',
                    'timestamp': mod_time.isoformat(),
                    'elapsed_seconds': (datetime.now() - start_time).total_seconds()
                })
            else:
                # Still processing
                return jsonify({
                    'status': 'processing',
                    'message': 'SREQ coverage is still processing',
                    'elapsed_seconds': (datetime.now() - start_time).total_seconds()
                })

        # Not processing, return status of last run
        return jsonify({
            'status': 'completed',
            'message': 'SREQ coverage is available',
            'timestamp': mod_time.isoformat()
        })

    except Exception as e:
        logging.exception("Error checking SREQ status")
        return jsonify({
            'status': 'error',
            'message': f'Error checking status: {str(e)}'
        })

@api_bp.route('/get_test_cases')
@login_required
def get_test_cases():
    """
    Fetch test case data from IOCore2 API.

    Returns:
        JSON response with results
    """
    try:
        client = get_api_client()
        if not client:
            return jsonify({
                'success': False,
                'error': 'Not authenticated'
            })

        # Get test cases data
        # Pass environment explicitly
        environment = session.get('environment', 'ciav')
        result = client.get_test_cases(environment=environment) # Pass environment

        return jsonify({
            'success': True,
            'count': result.get('count', 0),
            'duration': result.get('duration', 0),
            'message': 'Test cases data fetched and saved successfully'
        })
    except InvalidSession:
        return jsonify({
            'success': False,
            'error': 'Your session has expired. Please log in again.'
        })
    except Exception as e:
        logging.exception("Error getting test cases")
        return jsonify({
            'success': False,
            'error': str(e)
        })

@api_bp.route('/get_test_results')
@login_required
def get_test_results():
    """
    Fetch test results data from IOCore2 API.

    Returns:
        JSON response with results
    """
    try:
        client = get_api_client()
        if not client:
            return jsonify({
                'success': False,
                'error': 'Not authenticated'
            })

        # Get test results data
        # Pass environment explicitly
        environment = session.get('environment', 'ciav')
        result = client.get_test_results(environment=environment) # Pass environment

        return jsonify({
            'success': True,
            'count': result.get('count', 0),
            'duration': result.get('duration', 0),
            'message': 'Test results data fetched and saved successfully'
        })
    except InvalidSession:
        return jsonify({
            'success': False,
            'error': 'Your session has expired. Please log in again.'
        })
    except Exception as e:
        logging.exception("Error getting test results")
        return jsonify({
            'success': False,
            'error': str(e)
        })

@api_bp.route('/get_patterns')
@login_required
def get_patterns():
    """
    Fetch test case patterns data from IOCore2 API.

    Returns:
        JSON response with results
    """
    try:
        logging.info("Handling GET request to /get_patterns")

        client = get_api_client()
        if not client:
            logging.error("Failed to get API client - not authenticated")
            return jsonify({
                'success': False,
                'error': 'Not authenticated'
            })

        # Log the attempt to get patterns
        logging.info("Attempting to fetch patterns data from API")

        # Get patterns data
        # Pass environment explicitly
        environment = session.get('environment', 'ciav')
        result = client.get_patterns(environment=environment) # Pass environment

        logging.info(f"Successfully fetched patterns. Count: {result.get('count', 0)}")

        return jsonify({
            'success': True,
            'count': result.get('count', 0),
            'duration': result.get('duration', 0),
            'message': 'Test case patterns fetched and saved successfully'
        })
    except InvalidSession:
        logging.error("Session expired while fetching patterns")
        return jsonify({
            'success': False,
            'error': 'Your session has expired. Please log in again.'
        })
    except ApiRequestError as e:
        logging.error(f"API request error while fetching patterns: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"API request error: {str(e)}"
        })
    except Exception as e:
        logging.exception(f"Unexpected error getting patterns: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

@api_bp.route('/get_actors')
@login_required
def get_actors():
    """
    Fetch test case actors data from IOCore2 API.

    Returns:
        JSON response with results
    """
    try:
        logging.info("Handling GET request to /get_actors")

        client = get_api_client()
        if not client:
            logging.error("Failed to get API client - not authenticated")
            return jsonify({
                'success': False,
                'error': 'Not authenticated'
            })

        # Log the attempt to get actors
        logging.info("Attempting to fetch actors data from API")

        # Get actors data
        # Pass environment explicitly
        environment = session.get('environment', 'ciav')
        result = client.get_actors(environment=environment) # Pass environment

        logging.info(f"Successfully fetched actors. Count: {result.get('count', 0)}")

        return jsonify({
            'success': True,
            'count': result.get('count', 0),
            'duration': result.get('duration', 0),
            'message': 'Test case actors fetched and saved successfully'
        })
    except InvalidSession:
        logging.error("Session expired while fetching actors")
        return jsonify({
            'success': False,
            'error': 'Your session has expired. Please log in again.'
        })
    except ApiRequestError as e:
        logging.error(f"API request error while fetching actors: {str(e)}")
        return jsonify({
            'success': False,
            'error': f"API request error: {str(e)}"
        })
    except Exception as e:
        logging.exception(f"Unexpected error getting actors: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

@api_bp.route('/test-cases/actors', methods=['GET'])
@login_required
def get_test_case_actors():
    """
    Fetch test case actors data from stored actors.json file.

    Returns:
        JSON response with actor data or error
    """
    try:
        # Define file path using dynamic path
        actors_path = get_dynamic_data_path("actors.json")

        # Check if file exists
        if not actors_path.exists():
            logging.warning(f"Actors file not found at {actors_path}")
            return jsonify({
                'success': False,
                'error': 'Actors data not found. Please save actors first.'
            })

        # Read and return the actor data
        with open(actors_path, 'r', encoding='utf-8') as f:
            actors_data = json.load(f)

        return jsonify({
            'success': True,
            'data': actors_data,
            'message': 'Test case actors retrieved successfully'
        })
    except json.JSONDecodeError as e:
        logging.error(f"Error decoding actors.json: {e}")
        return jsonify({
            'success': False,
            'error': f'Invalid JSON format in actors file: {e}'
        }), 500
    except Exception as e:
        logging.exception("Error retrieving test case actors")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/test-cases/patterns', methods=['GET'])
@login_required
def get_test_case_patterns():
    """
    Fetch test case patterns data from stored pattern.json file.

    Returns:
        JSON response with pattern data or error
    """
    try:
        # Define file path using dynamic path
        pattern_path = get_dynamic_data_path("pattern.json")

        # Check if file exists
        if not pattern_path.exists():
            logging.warning(f"Pattern file not found at {pattern_path}")
            return jsonify({
                'success': False,
                'error': 'Pattern data not found. Please save patterns first.'
            })

        # Read and return the pattern data
        with open(pattern_path, 'r', encoding='utf-8') as f:
            pattern_data = json.load(f)

        return jsonify({
            'success': True,
            'data': pattern_data,
            'message': 'Test case patterns retrieved successfully'
        })
    except json.JSONDecodeError as e:
        logging.error(f"Error decoding pattern.json: {e}")
        return jsonify({
            'success': False,
            'error': f'Invalid JSON format in pattern file: {e}'
        }), 500
    except Exception as e:
        logging.exception("Error retrieving test case patterns")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@api_bp.route('/test-cases/patterns', methods=['POST'])
@login_required
def save_test_case_patterns():
    """
    Receive and store test case patterns data.

    Expects JSON data in the request body.
    Saves the data to static/pattern.json.

    Returns:
        JSON response indicating success or failure.
    """
    try:
        # Get data from request
        data = request.get_json()
        if not data:
            # Use 400 Bad Request for missing data
            return jsonify({'success': False, 'error': 'No data provided in request body'}), 400

        # Define output path using dynamic path
        output_path = get_dynamic_data_path("pattern.json")

        # Write data to JSON file
        # Import write_json_file if not already imported at top level
        from app.utils.file_operations import write_json_file
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            logging.info(f"Test case patterns saved successfully to {output_path}")
            return jsonify({'success': True, 'message': 'Test case patterns saved successfully.'})
        except IOError as e:
            logging.error(f"Failed to write patterns to {output_path}: {e}")
            # Use 500 Internal Server Error for file writing issues
            return jsonify({'success': False, 'error': f'Failed to write file: {e}'}), 500
        except Exception as e:
            # Catch unexpected errors during file writing
            logging.error(f"An unexpected error occurred while writing patterns: {e}")
            return jsonify({'success': False, 'error': f'An unexpected error occurred: {e}'}), 500

    except BadRequest as e:
        # Handle specific Werkzeug BadRequest (e.g., invalid JSON)
        logging.warning(f"Bad request received for save_test_case_patterns: {e.description}")
        return jsonify({'success': False, 'error': f'Invalid request data: {e.description}'}), 400
    except Exception as e:
        # General catch-all for other unexpected errors
        logging.exception("Error processing save_test_case_patterns request")
        return jsonify({'success': False, 'error': f'An internal error occurred: {str(e)}'}), 500


@api_bp.route('/unmapped_sreqs')
@login_required
def get_unmapped_sreqs():
    """
    Get unmapped SREQs from log file.

    Returns:
        JSON response with log content
    """
    try:
        log_file = settings.LOG_FILE

        if not log_file.exists():
            return jsonify({
                'success': True,
                'content': 'No unmapped SREQs log file found.'
            })

        with open(log_file, 'r') as f:
            log_content = f.read()

        return jsonify({
            'success': True,
            'content': log_content
        })
    except Exception as e:
        logging.exception("Error reading unmapped SREQs log")
        return jsonify({
            'success': False,
            'error': str(e)
        })

# System metrics endpoints
@api_bp.route('/system_metrics')
@login_required
def get_system_metrics():
    """
    Get system metrics (CPU and memory usage).

    Returns:
        JSON response with metrics
    """
    try:
        import psutil

        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        memory_used_mb = memory.used / (1024 * 1024)

        return jsonify({
            'cpu': cpu_percent,
            'memory': round(memory_used_mb, 2)
        })
    except Exception as e:
        logging.exception("Error getting system metrics")
        return jsonify({
            'success': False,
            'error': str(e)
        })

@api_bp.route('/get_system_metrics')
@login_required
def get_system_metrics_legacy():
    """
    Legacy endpoint for system metrics (redirects to /system_metrics).
    """
    return get_system_metrics()


@api_bp.route('/api/remote_system_health')
@login_required
def get_remote_system_health():
    """
    Proxy endpoint to fetch system health data from the remote IOCore2 API.

    Returns:
        JSON response with health data or error.
    """
    try:
        client = get_api_client()
        if not client:
            # This case should ideally be handled by @login_required,
            # but added for robustness.
            return jsonify({'success': False, 'error': 'Not authenticated'}), 401

        # Call the new method on the client
        health_data = client.get_system_health()

        # Return the data received from the remote API directly
        # Assuming the remote API returns a JSON object
        return jsonify(health_data)

    except InvalidSession:
        logging.warning("Session expired while fetching remote system health.")
        return jsonify({'success': False, 'error': 'Your session has expired. Please log in again.'}), 401
    except DataFormatError as e:
        logging.error(f"Data format error fetching remote system health: {e.message}")
        return jsonify({'success': False, 'error': f'Invalid data format from remote API: {e.message}'}), 502 # Bad Gateway
    except ApiRequestError as e:
        logging.error(f"API request error fetching remote system health: {e.message}")
        # Return a generic error message to the client, log details
        return jsonify({'success': False, 'error': 'Failed to fetch remote system health data.'}), 502 # Bad Gateway
    except Exception as e:
        logging.exception("Unexpected error fetching remote system health")
        return jsonify({'success': False, 'error': 'An unexpected internal error occurred.'}), 500


# Removed conflicting /api/affiliates route (handled in views.py)


@api_bp.route('/api/asc_services', methods=['GET'])
@login_required
def get_asc_services():
    """API endpoint to get the list of ASC services."""
    try:
        # Use current_app.static_folder for ASC data
        services_path = Path(current_app.static_folder) / 'ASC' / 'data' / 'services.json' # Corrected path
        logging.info(f"Attempting to read services data from: {services_path}")

        if not services_path.exists():
            logging.error(f"Services file not found at {services_path}")
            return jsonify({"error": "Services data file not found."}), 404

        with open(services_path, 'r', encoding='utf-8') as f:
            services_data = json.load(f)

        logging.info(f"Successfully loaded {len(services_data)} services.")
        return jsonify(services_data)

    except FileNotFoundError:
        logging.error(f"Services file not found at {services_path}")
        return jsonify({"error": "Services data file not found."}), 404
    except json.JSONDecodeError:
        logging.exception(f"Error decoding JSON from {services_path}")
        return jsonify({"error": "Failed to parse services data file."}), 500
    except Exception as e:
        logging.exception("Error fetching services data:")
        return jsonify({"error": "An unexpected error occurred while fetching services data."}), 500


@api_bp.route('/api/asc_gps', methods=['GET'])
@login_required
def get_asc_gps():
    """API endpoint to get the list of ASC GPs (Generic Patterns)."""
    try:
        # Use current_app.static_folder for ASC data
        gps_path = Path(current_app.static_folder) / 'ASC' / 'data' / 'gps.json' # Corrected path
        logging.info(f"Attempting to read GPs data from: {gps_path}")

        if not gps_path.exists():
            logging.error(f"GPs file not found at {gps_path}")
            return jsonify({"error": "GPs data file not found."}), 404

        with open(gps_path, 'r', encoding='utf-8') as f:
            gps_data = json.load(f)

        logging.info(f"Successfully loaded {len(gps_data)} GPs.")
        return jsonify(gps_data)

    except FileNotFoundError:
        logging.error(f"GPs file not found at {gps_path}")
        return jsonify({"error": "GPs data file not found."}), 404
    except json.JSONDecodeError:
        logging.exception(f"Error decoding JSON from {gps_path}")
        return jsonify({"error": "Failed to parse GPs data file."}), 500
    except Exception as e:
        logging.exception("Error fetching GPs data:")
        return jsonify({"error": "An unexpected error occurred while fetching GPs data."}), 500


@api_bp.route('/api/asc_form_data', methods=['GET'])
@login_required
def get_asc_form_data():
    """API endpoint to get data needed for the ASC creation/edit form."""
    try:
        # Define paths relative to the static folder
        static_asc_data_path = Path(current_app.static_folder) / 'ASC' / 'data'
        affiliates_path = static_asc_data_path / '_affiliates.json'
        services_path = static_asc_data_path / '_servicesm.json'
        sps_path = static_asc_data_path / '_sps.json' # Path for SPs
        
        logging.info(f"Attempting to read ASC form data from: {static_asc_data_path}")

        # Read Affiliates data
        if not affiliates_path.exists():
            logging.error(f"Affiliates file not found at {affiliates_path}")
            return jsonify({"error": "Affiliates data file not found."}), 404
        with open(affiliates_path, 'r', encoding='utf-8') as f:
            affiliates_data = json.load(f)
        logging.info(f"Successfully loaded {len(affiliates_data)} affiliates.")

        # Read Services data
        if not services_path.exists():
            logging.error(f"Services file not found at {services_path}")
            return jsonify({"error": "Services data file not found."}), 404
        with open(services_path, 'r', encoding='utf-8') as f:
            services_data = json.load(f)
        logging.info(f"Successfully loaded {len(services_data)} services.")

        # Read SPs data
        if not sps_path.exists():
            logging.error(f"SPs file not found at {sps_path}")
            return jsonify({"error": "SPs data file not found."}), 404
        with open(sps_path, 'r', encoding='utf-8') as f:
            sps_data = json.load(f)
        logging.info(f"Successfully loaded {len(sps_data)} SPs.")

        # Read GPs data using repository
        try:
            gps_data = gps_repository.get_all_gps()
            logging.info(f"Successfully loaded {len(gps_data)} GPs using repository.")
        except Exception as e:
            logging.error(f"Error loading GPs data: {str(e)}")
            return jsonify({"error": "GPs data could not be loaded."}), 500

        # Return combined data
        return jsonify({
            'affiliates': affiliates_data,
            'services': services_data,
            'sps': sps_data,
            'gps': gps_data # Include GPs in the response
        })

    except FileNotFoundError as e:
        # This might be redundant if the exists() checks work, but good practice
        logging.error(f"Data file not found during ASC form data fetch: {e}")
        return jsonify({"error": f"Required data file not found: {e.filename}"}), 404
    except json.JSONDecodeError as e:
        logging.exception(f"Error decoding JSON during ASC form data fetch: {e}")
        return jsonify({"error": f"Failed to parse data file: {e.msg}"}), 500
    except Exception as e:
        logging.exception("Error fetching ASC form data:")
        return jsonify({"error": "An unexpected error occurred while fetching ASC form data."}), 500


@api_bp.route('/api/ascs', methods=['POST'])
@login_required
def add_asc():
    """API endpoint to add a new ASC."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        required_fields = ['affiliateId', 'environment', 'serviceId', 'model']
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        affiliate_id = data['affiliateId']
        environment = data['environment']
        service_id = data['serviceId']
        model = data['model']

        # Define paths
        static_asc_data_path = Path(current_app.static_folder) / 'ASC' / 'data'
        ascs_path = static_asc_data_path / '_ascs.json'
        services_path = static_asc_data_path / '_servicesm.json'

        # --- Read existing data ---
        # Read Services to find associated GPs
        if not services_path.exists():
            logging.error(f"Services file not found at {services_path}")
            return jsonify({"error": "Services data file not found."}), 500 # Internal error if services missing
        with open(services_path, 'r', encoding='utf-8') as f:
            services_data = json.load(f)

        # Find the selected service and its GPs
        selected_service = next((s for s in services_data if s.get('id') == service_id), None)
        if not selected_service:
            logging.error(f"Service with ID {service_id} not found.")
            return jsonify({"error": f"Service with ID {service_id} not found."}), 404
        
        # Get the GPs for the service - handle both old and new model structures
        gp_configs_for_service = selected_service.get('gps', [])

        # Read existing ASCs
        if ascs_path.exists():
            with open(ascs_path, 'r', encoding='utf-8') as f:
                ascs_list = json.load(f)
        else:
            ascs_list = []

        # --- Generate new ASC ID ---
        last_id_num = 0
        if ascs_list:
            for asc in reversed(ascs_list): # More robust than just checking the last one
                try:
                    if asc.get('id', '').startswith('ASC-'):
                        last_id_num = max(last_id_num, int(asc['id'].split('-')[1]))
                except (IndexError, ValueError, TypeError):
                    continue # Ignore malformed IDs
        new_id_num = last_id_num + 1
        new_asc_id = f"ASC-{str(new_id_num).zfill(4)}"

        # --- Construct new ASC object ---
        new_asc = {
            "id": new_asc_id,
            "affiliateId": affiliate_id,
            "environment": environment,
            "serviceId": service_id,
            "model": model,
            "ascScore": "0%",
            "status": "Initial", # Default status
            "gpInstances": []
        }

        # Check if client provided gpInstances (client-side filtering)
        if 'gpInstances' in data and isinstance(data['gpInstances'], list):
            # Use client-provided GP instances
            logging.info(f"Using client-filtered GP instances: {len(data['gpInstances'])} GPs provided")
            new_asc["gpInstances"] = data['gpInstances']
        else:
            # Perform server-side filtering based on model compatibility
            logging.info(f"Performing server-side GP filtering for model: {model}")
            filtered_gp_ids = []
            
            # Check if we have the new structure with model compatibility info
            for gp_config in gp_configs_for_service:
                # Handle both string GP IDs and object structures
                if isinstance(gp_config, str):
                    # Legacy format - just a GP ID string with no model info
                    # In this case, we assume it's compatible with all models
                    gp_id = gp_config
                    filtered_gp_ids.append(gp_id)
                elif isinstance(gp_config, dict) and 'id' in gp_config:
                    # New format with model compatibility info
                    gp_id = gp_config['id']
                    supported_models = gp_config.get('supportedModels', [])
                    
                    # If supportedModels is empty or contains the selected model, include this GP
                    if not supported_models or model in supported_models:
                        filtered_gp_ids.append(gp_id)
                        logging.debug(f"Including GP {gp_id} - compatible with model {model}")
                    else:
                        logging.debug(f"Excluding GP {gp_id} - not compatible with model {model}")
            
            # Populate gpInstances based on filtered GPs
            logging.info(f"Filtered {len(filtered_gp_ids)} compatible GPs out of {len(gp_configs_for_service)} total")
            for gp_id in filtered_gp_ids:
                new_asc["gpInstances"].append({
                    "gpId": gp_id,
                    "gpScore": "0%",
                    "instanceLabel": "", # Default empty label
                    "spInstances": []  # Default empty SP instances
                })

        # --- Add and save ---
        ascs_list.append(new_asc)

        # Save back to file
        with open(ascs_path, 'w', encoding='utf-8') as f:
            json.dump(ascs_list, f, indent=2)

        logging.info(f"Successfully added new ASC with ID: {new_asc_id}")
        return jsonify({
            'success': True,
            'message': 'ASC added successfully',
            'asc': new_asc # Return the newly created ASC object
        }), 201 # 201 Created status code

    except json.JSONDecodeError as e:
        logging.exception(f"Error decoding JSON during ASC add: {e}")
        return jsonify({"error": f"Failed to parse data file: {e.msg}"}), 500
    except FileNotFoundError as e:
        logging.error(f"Data file not found during ASC add: {e}")
        return jsonify({"error": f"Required data file not found: {e.filename}"}), 500
    except Exception as e:
        logging.exception("Error adding new ASC:")
        return jsonify({"error": "An unexpected error occurred while adding the ASC."}), 500


@api_bp.route('/api/ascs', methods=['PUT'])
@login_required
def update_asc():
    """API endpoint to update an existing ASC."""
    try:
        asc_id = request.args.get('id') # Get ID from query parameter
        if not asc_id:
             return jsonify({"error": "Missing ASC ID in query parameters"}), 400

        updated_data = request.get_json()
        if not updated_data:
            return jsonify({"error": "No data provided"}), 400

        # Ensure the ID in the body matches the query param if present, or use query param
        if 'id' in updated_data and updated_data['id'] != asc_id:
             return jsonify({"error": "ID mismatch between query parameter and request body"}), 400
        updated_data['id'] = asc_id # Ensure the ID is set correctly

        # Define path
        static_asc_data_path = Path(current_app.static_folder) / 'ASC' / 'data'
        ascs_path = static_asc_data_path / '_ascs.json'

        # --- Read existing data ---
        if not ascs_path.exists():
             logging.error(f"ASC file not found at {ascs_path} for update.")
             return jsonify({"error": "ASC data file not found."}), 500

        with open(ascs_path, 'r', encoding='utf-8') as f:
            ascs_list = json.load(f)

        # --- Find and update ---
        asc_found_index = -1
        for i, asc in enumerate(ascs_list):
            if asc.get('id') == asc_id:
                asc_found_index = i
                break

        if asc_found_index == -1:
            logging.warning(f"ASC with ID {asc_id} not found for update.")
            return jsonify({"error": f"ASC with ID {asc_id} not found."}), 404

        # Basic validation: Ensure essential keys are present in updated_data
        # More robust validation could be added here (e.g., check types, structure)
        # Note: We don't re-validate serviceId/affiliateId existence here, assuming they haven't changed
        # or that the frontend prevents invalid changes.
        required_keys = ['affiliateId', 'environment', 'serviceId', 'model', 'status', 'gpInstances', 'ascScore']
        if not all(k in updated_data for k in required_keys):
             logging.warning(f"Update data for ASC {asc_id} is missing required keys.")
             # Allow partial updates? For now, require all main keys.
             # Consider adding more granular PUT/PATCH later if needed.
             return jsonify({"error": "Update data is missing required keys."}), 400

        # Replace the existing item with the updated data
        ascs_list[asc_found_index] = updated_data

        # --- Save back to file ---
        with open(ascs_path, 'w', encoding='utf-8') as f:
            json.dump(ascs_list, f, indent=2)

        logging.info(f"Successfully updated ASC with ID: {asc_id}")
        return jsonify({
            'success': True,
            'message': 'ASC updated successfully',
            'asc': updated_data # Return the updated ASC object
        })

    except json.JSONDecodeError as e:
        logging.exception(f"Error decoding JSON during ASC update: {e}")
        return jsonify({"error": f"Failed to parse data file: {e.msg}"}), 500
    except FileNotFoundError as e:
        logging.error(f"Data file not found during ASC update: {e}")
        return jsonify({"error": f"Required data file not found: {e.filename}"}), 500
    except Exception as e:
        logging.exception(f"Error updating ASC {asc_id}:")
        return jsonify({"error": "An unexpected error occurred while updating the ASC."}), 500


@api_bp.route('/api/ascs', methods=['DELETE'])
@login_required
def delete_asc():
    """API endpoint to delete an ASC."""
    try:
        asc_id = request.args.get('id') # Get ID from query parameter
        if not asc_id:
             return jsonify({"error": "Missing ASC ID in query parameters"}), 400

        # Define path
        static_asc_data_path = Path(current_app.static_folder) / 'ASC' / 'data'
        ascs_path = static_asc_data_path / '_ascs.json'

        # --- Read existing data ---
        if not ascs_path.exists():
             logging.error(f"ASC file not found at {ascs_path} for delete.")
             # If the file doesn't exist, the item is already effectively deleted.
             return jsonify({'success': True, 'message': 'ASC not found (already deleted or file missing).'}), 200

        with open(ascs_path, 'r', encoding='utf-8') as f:
            ascs_list = json.load(f)

        # --- Find and remove ---
        original_length = len(ascs_list)
        ascs_list_filtered = [asc for asc in ascs_list if asc.get('id') != asc_id]

        if len(ascs_list_filtered) == original_length:
            logging.warning(f"ASC with ID {asc_id} not found for deletion.")
            return jsonify({"error": f"ASC with ID {asc_id} not found."}), 404

        # --- Save back to file ---
        with open(ascs_path, 'w', encoding='utf-8') as f:
            json.dump(ascs_list_filtered, f, indent=2)

        logging.info(f"Successfully deleted ASC with ID: {asc_id}")
        return jsonify({
            'success': True,
            'message': 'ASC deleted successfully'
        }), 200 # OK status for successful deletion

    except json.JSONDecodeError as e:
        logging.exception(f"Error decoding JSON during ASC delete: {e}")
        return jsonify({"error": f"Failed to parse data file: {e.msg}"}), 500
    except FileNotFoundError as e:
         # Should be caught by exists() check, but handle just in case
        logging.error(f"Data file not found during ASC delete: {e}")
        return jsonify({"error": f"Required data file not found: {e.filename}"}), 500
    except Exception as e:
        logging.exception(f"Error deleting ASC {asc_id}:")
        return jsonify({"error": "An unexpected error occurred while deleting the ASC."}), 500


@api_bp.route('/api/patterns_data', methods=['GET'])
@login_required
def get_patterns_data_file():
    """API endpoint to get the content of the patterns data file."""
    try:
        # Use dynamic path
        patterns_path = get_dynamic_data_path('pattern.json')
        logging.info(f"Attempting to read patterns data from: {patterns_path}")

        if not patterns_path.exists():
            logging.error(f"Patterns file not found at {patterns_path}")
            return jsonify({"error": "Patterns data file not found."}), 404

        with open(patterns_path, 'r', encoding='utf-8') as f:
            patterns_data = json.load(f)

        logging.info(f"Successfully loaded patterns data file.")
        return jsonify(patterns_data)

    except FileNotFoundError:
        logging.error(f"Patterns file not found at {patterns_path}")
        return jsonify({"error": "Patterns data file not found."}), 404
    except json.JSONDecodeError:
        logging.exception(f"Error decoding JSON from {patterns_path}")
        return jsonify({"error": "Failed to parse patterns data file."}), 500
    except Exception as e:
        logging.exception("Error fetching patterns data file:")
        return jsonify({"error": "An unexpected error occurred while fetching patterns data file."}), 500

@api_bp.route('/api/test_cases_data', methods=['GET'])
@login_required
def get_test_cases_data_file():
    """API endpoint to get the content of the test cases data file."""
    try:
        # Use dynamic path
        test_cases_path = get_dynamic_data_path('test_cases.json')
        logging.info(f"Attempting to read test cases data from: {test_cases_path}")

        if not test_cases_path.exists():
            logging.error(f"Test cases file not found at {test_cases_path}")
            return jsonify({"error": "Test cases data file not found."}), 404

        with open(test_cases_path, 'r', encoding='utf-8') as f:
            test_cases_data = json.load(f)

        logging.info(f"Successfully loaded test cases data file.")
        return jsonify(test_cases_data)

    except FileNotFoundError:
        logging.error(f"Test cases file not found at {test_cases_path}")
        return jsonify({"error": "Test cases data file not found."}), 404
    except json.JSONDecodeError:
        logging.exception(f"Error decoding JSON from {test_cases_path}")
        return jsonify({"error": "Failed to parse test cases data file."}), 500
    except Exception as e:
        logging.exception("Error fetching test cases data file:")
        return jsonify({"error": "An unexpected error occurred while fetching test cases data file."}), 500

@api_bp.route('/api/test_results_data', methods=['GET'])
@login_required
def get_test_results_data_file():
    """
    API endpoint to stream and process the large test results data file.

    Returns:
        JSON response with processed test results and filter options.
    """
    try:
        # Use dynamic path
        test_results_path = get_dynamic_data_path('test_results.json')
        logging.info(f"Attempting to stream test results data from: {test_results_path}")

        if not test_results_path.exists():
            logging.error(f"Test results file not found at {test_results_path}")
            # Return empty data and filters if file not found
            return jsonify({
                "data": [],
                "filters": {
                    "objectives": [],
                    "statuses": [],
                    "overallResults": [],
                    "participants": []
                },
                "error": "Test results data file not found."
            }), 404

        results_data = []
        objectives = set()
        statuses = set()
        overall_results = set()
        participants = set()

        with open(test_results_path, 'rb') as f: # Open in binary mode for ijson
            # Stream the 'TestPlans' array
            test_plans = ijson.items(f, 'TestPlans.item')
            for test_plan in test_plans:
                objective_key = test_plan.get('Objective', {}).get('Key')
                test_plan_key = test_plan.get('Key')
                if objective_key:
                    objectives.add(objective_key)

                # Iterate through tests within the current test plan
                tests = test_plan.get('Tests', [])
                if tests: # Ensure 'Tests' exists and is a list
                    for test in tests:
                        coordinator = test.get('Coordinator', {}).get('Participant')
                        partners_list = [p.get('Participant') for p in test.get('Partners', []) if p.get('Participant')]
                        status = test.get('Status')
                        overall_result = test.get('AnalysisResult', {}).get('OverallResult', {}).get('Result')

                        if status:
                            statuses.add(status)
                        if overall_result:
                            overall_results.add(overall_result)
                        if coordinator:
                            participants.add(coordinator)
                        for partner in partners_list:
                            participants.add(partner)

                        results_data.append({
                            "objectiveKey": objective_key,
                            "testPlanKey": test_plan_key,
                            "testName": test.get('Name'),
                            "status": status,
                            "coordinator": coordinator,
                            "partners": partners_list,
                            "overallResult": overall_result
                        })

        logging.info(f"Successfully processed {len(results_data)} test results from stream.")

        return jsonify({
            "data": results_data,
            "filters": {
                "objectives": sorted(list(objectives)),
                "statuses": sorted(list(statuses)),
                "overallResults": sorted(list(overall_results)),
                "participants": sorted(list(participants))
            }
        })

    except ijson.JSONError as e:
        logging.exception(f"Error parsing JSON from {test_results_path}: {e}")
        return jsonify({"error": f"Failed to parse test results data file: {e}"}), 500
    except FileNotFoundError:
        logging.error(f"Test results file not found during processing at {test_results_path}")
        return jsonify({"error": "Test results data file not found."}), 404
    except Exception as e:
        logging.exception("Error processing test results data file:")
        return jsonify({"error": "An unexpected error occurred while processing test results data file."}), 500


def process_sreq_coverage_in_background(url, cookies, environment):
    """
    Process SREQ coverage data in a background thread.

    Args:
        url: Base URL for the IOCore2 API
        cookies: Session cookies for authentication
        environment: The environment ('ciav' or 'cwix') to use for saving data.
    """
    from app.api.iocore2 import IOCore2ApiClient

    try:
        logging.info(f"Starting background SREQ coverage processing for environment: {environment}")

        # Create API client
        client = IOCore2ApiClient(base_url=url, cookies=cookies)

        # Get SREQ coverage data, passing the environment
        client.get_requirement_coverage(environment=environment) # Pass environment

        logging.info(f"Background SREQ coverage processing completed for environment: {environment}")

    except Exception as e:
        logging.exception(f"Error in background SREQ processing: {str(e)}")
