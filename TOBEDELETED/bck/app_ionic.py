from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from functools import wraps

import csv
import json
import os
import sys
import threading

import requests
import urllib3
import psutil
import logging
from datetime import datetime
from bs4 import BeautifulSoup
from pathlib import Path
from ier_analysis import analyze_ier_data, generate_ier_markdown_output
from sreq_analysis import extract_null_testcase_entries, organize_hierarchical_data, generate_markdown

# Custom exceptions
class InvalidSession(Exception):
    """Raised when the session is invalid or expired."""
    pass

# Add InvalidSession to requests.exceptions
requests.exceptions.InvalidSession = InvalidSession

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Set up logging
log_file = Path(__file__).parent / "static" / "unmapped_sreqs.log"
logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format='%(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

app = Flask(__name__, static_folder='static')
app.secret_key = 'your-secret-key-here'

# Ensure the static directory exists
os.makedirs(app.static_folder, exist_ok=True)

DEFAULT_URL = "https://iocore2-ciav.ivv.ncia.nato.int"

def check_iocore_session(response, api_url, start_time):
    """Check if IOCore2 session is still valid."""
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    
    logging.info(f"\n=== IOCore2 API Call Details ===")
    logging.info(f"URL: {api_url}")
    logging.info(f"Start Time: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    logging.info(f"End Time: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
    logging.info(f"Duration: {duration:.2f} seconds")
    logging.info(f"Status Code: {response.status_code}")
    
    # Log all response headers for debugging
    logging.info("\nResponse Headers:")
    for header, value in response.headers.items():
        logging.info(f"{header}: {value}")
    
    content_type = response.headers.get('content-type', '')
    logging.info(f"\nContent-Type: {content_type}")
    
    # Check response status
    if response.status_code != 200:
        logging.error(f"API request failed with status code: {response.status_code}")
        if response.status_code == 504:
            return False, "Request timed out. The operation took too long to complete."
        if response.status_code == 302:
            return False, "Your session has expired. Please log in again."
        return False, f"API request failed with status code: {response.status_code}"
    
    # Check content type
    if 'text/html' in content_type.lower():
        logging.info("Response was HTML instead of expected JSON")
        return False, "Your session has expired. Please log in again."
    
    if 'application/json' not in content_type.lower():
        logging.error(f"Unexpected content type: {content_type}")
        return False, "Unexpected response type from server"
    
    # Try to parse response as JSON
    try:
        response_text = response.text
        logging.info(f"Response Length: {len(response_text)} characters")
        
        # Check for session expiration messages in the response
        if "session has expired" in response_text.lower() or "please log in again" in response_text.lower():
            logging.info("Session expiration message found in response")
            return False, "Your session has expired. Please log in again."
            
        # Try parsing as JSON to verify it's valid
        json.loads(response_text)
        logging.info("Response successfully parsed as JSON")
        return True, response_text
    except json.JSONDecodeError as e:
        logging.error(f"JSON Parse Error: {str(e)}")
        logging.error(f"First 500 characters of response: {response_text[:500]}")
        return False, "Invalid JSON response from server"
    except Exception as e:
        logging.error(f"Unexpected error parsing response: {str(e)}")
        logging.exception("Full error traceback:")
        return False, "Invalid response format"

def validate_response(response):
    """Validate response headers to check session state."""
    if response.status_code == 302:
        logging.error("Session validation failed: Got redirect")
        return False, "Your session has expired. Please log in again."
        
    content_type = response.headers.get('content-type', '').lower()
    if 'text/html' in content_type:
        logging.error("Session validation failed: Got HTML response")
        return False, "Your session has expired. Please log in again."
        
    if 'application/json' not in content_type:
        logging.error(f"Session validation failed: Unexpected content type {content_type}")
        return False, "Unexpected response from server"
    
    return True, None

def stream_response(response, start_time):
    """Stream response in chunks with progress logging."""
    chunks = []
    total_size = 0
    chunk_count = 0
    start_chunk_time = datetime.now()
    last_log_time = datetime.now()
    last_progress_time = datetime.now()
    
    logging.info("Starting to read response chunks...")
    
    try:
        # Log initial response info
        logging.info("\nInitial Response Info:")
        logging.info(f"Status Code: {response.status_code}")
        logging.info("Headers:")
        for header, value in response.headers.items():
            logging.info(f"{header}: {value}")
        
        # Check initial response validity
        if response.status_code == 302:
            logging.error("Got redirect response, session likely expired")
            raise requests.exceptions.InvalidSession("Session expired")
            
        content_type = response.headers.get('content-type', '').lower()
        if 'text/html' in content_type:
            logging.error("Got HTML response, session likely expired")
            raise requests.exceptions.InvalidSession("Session expired")
        
        # Stream the response
        for chunk in response.iter_content(chunk_size=8192):
            current_time = datetime.now()
            
            # Check for timeout between chunks
            if (current_time - last_progress_time).total_seconds() > 30:
                logging.error("No progress for 30 seconds, considering connection stalled")
                raise requests.exceptions.ReadTimeout("No progress for 30 seconds")
            
            if chunk:
                last_progress_time = current_time
                chunks.append(chunk)
                total_size += len(chunk)
                chunk_count += 1
                
                # Log progress every 20 chunks or if 5 seconds passed
                if chunk_count % 20 == 0 or (current_time - last_log_time).total_seconds() >= 5:
                    chunk_duration = (current_time - start_chunk_time).total_seconds()
                    transfer_rate = total_size / 1024 / 1024 / chunk_duration  # MB/s
                    logging.info(f"Received {chunk_count} chunks ({total_size/1024/1024:.2f} MB) in {chunk_duration:.2f} seconds ({transfer_rate:.2f} MB/s)")
                    last_log_time = current_time
        
        # Log final statistics
        total_duration = (datetime.now() - start_time).total_seconds()
        logging.info(f"\nTransfer Statistics:")
        logging.info(f"Total size: {total_size/1024/1024:.2f} MB")
        logging.info(f"Total chunks: {chunk_count}")
        if chunk_count > 0:  # Avoid division by zero
            logging.info(f"Average chunk size: {total_size/chunk_count/1024:.2f} KB")
            logging.info(f"Average transfer rate: {(total_size/1024/1024)/total_duration:.2f} MB/s")
        
        return b''.join(chunks)
        
    except requests.exceptions.InvalidSession as e:
        logging.error("Session validation failed during streaming")
        raise
    except requests.exceptions.ReadTimeout as e:
        logging.error("Connection stalled during streaming")
        raise
    except requests.exceptions.RequestException as e:
        logging.error(f"Request error during streaming: {str(e)}")
        raise
    except Exception as e:
        logging.error(f"Unexpected error during streaming: {str(e)}")
        logging.exception("Full error traceback:")
        raise

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'cookies' not in session:
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

def read_and_organize_requirements():
    """Read the JSON file and organize requirements hierarchically."""
    script_dir = Path(__file__).parent
    input_path = script_dir / "static" / "SREQ.json"
    ier_path = script_dir / "static" / "IER.json"

    logging.info("READ AND ORGANIZE")
    try:
        with open(input_path, "r", encoding="utf-8") as file:
            sreq_data = json.load(file)
        
        with open(ier_path, "r", encoding="utf-8") as file_ier:
            ier_data = json.load(file_ier)

         # Create a dictionary to store test cases from IER data
        test_case_ier = {}
        for item in ier_data:
            test_case_key = item.get('testCaseKey')
            test_case_name = item.get('testCaseName')
            if test_case_key is not None and test_case_key not in test_case_ier:
                test_case_ier[test_case_key] = test_case_name

        si_groups = {}
        for item in sreq_data:
            # Use get() with default values for fields that might not exist
            si_key = (item.get('siNumber', ''), item.get('siName', ''))
            sreq_info = (item.get('sreqNumber', ''), item.get('sreqName', ''))
            actor = item.get('actor', 'N/A')
            test_case_key = item.get('testCaseKey')
            test_case_name = item.get('testCaseName')
            test_case_coverage_type = item.get('coverageType')
            status = item.get('status') 

            tin_key = (item.get('tinNumber', ''), item.get('epName', '')) 

            if status == 'Deprecated' or status == 'Draft':
                continue 

            # If the requirement is covered in a dependecy
            if test_case_coverage_type=='tdp':
                continue

            if si_key not in si_groups:
                    si_groups[si_key] = {}

            if tin_key not in si_groups[si_key]:
                    si_groups[si_key][tin_key] = {}

            if sreq_info[0] not in si_groups[si_key][tin_key]:
                    si_groups[si_key][tin_key][sreq_info[0]] = {
                        'sreq_name': sreq_info[1],
                        'test_cases': {}
                    }

            if test_case_key is not None and test_case_name is not None and test_case_key not in test_case_ier:
                    # If test case already exists, append actor to its list
                
                    test_cases = si_groups[si_key][tin_key][sreq_info[0]]['test_cases']
                
                    if test_case_key in test_cases:
                        existing_test = test_cases[test_case_key]
                        if actor not in existing_test[2]:
                            existing_test[2].append(actor)
                    else:
                        # Add new test case with actor
                        test_cases[test_case_key] = (test_case_key, test_case_name, [actor])
           
        return si_groups, "Success"
    except FileNotFoundError:
        return None, f"Error: File not found at {input_path}"
    except json.JSONDecodeError:
        return None, "Error: Invalid JSON format in the input file"
    except Exception as e:
        return None, f"Unexpected error: {str(e)}"

def read_and_organize_requirements_func():
    """Read the JSON files and organize requirements hierarchically."""
    script_dir = Path(__file__).parent

    sreq_path = script_dir / "static" / "SREQ.json"
    func_path = script_dir / "static" / "SP5-Functional.json"
    ier_path = script_dir / "static" / "IER.json"

    logging.info("READ AND ORGANIZE SREQ/FUNC/IER")
    try:
        # Load SREQ data
        with open(sreq_path, "r", encoding="utf-8") as file_sreq:
            sreq_data = json.load(file_sreq)
        
        # Load SP5-Functional data
        with open(func_path, "r", encoding="utf-8") as file_func:
            func_data = json.load(file_func)
        
        with open(ier_path, "r", encoding="utf-8") as file_ier:
            ier_data = json.load(file_ier)

        # Create a dictionary to store test cases from IER data
        test_case_ier = {}
        for item in ier_data:
            test_case_key = item.get('testCaseKey')
            test_case_name = item.get('testCaseName')
            if test_case_key is not None and test_case_key not in test_case_ier:
                test_case_ier[test_case_key] = test_case_name
        
        # Create mapping of SREQ numbers to their function and SI name
        sreq_mapping = {}
        for item in func_data:
            sreq_number = item.get('sreqNumber')
            if sreq_number:
                sreq_mapping[sreq_number] = {
                    'function': item.get('funName', ''),
                    'siName': item.get('siName', '')
                }

        # Track unmapped SREQs
        unmapped_sreqs = []

        si_groups = {}
        for item in sreq_data:
            # Use get() with default values for fields that might not exist
            si_key = (item.get('siNumber', ''), item.get('siName', ''))
            sreq_info = (item.get('sreqNumber', ''), item.get('sreqName', ''))
            actor = item.get('actor', 'N/A')
            test_case_key = item.get('testCaseKey')
            test_case_name = item.get('testCaseName')
            test_case_coverage_type = item.get('coverageType')
            status = item.get('status')

            if status == 'Deprecated' or status == 'Draft':
                continue

            if test_case_coverage_type == 'tdp':
                continue

            # Check if SREQ has a function mapping
            mapping = sreq_mapping.get(sreq_info[0])
            if not mapping:
                unmapped_sreqs.append({
                    'sreqNumber': sreq_info[0],
                    'sreqName': sreq_info[1],
                    'siNumber': si_key[0],
                    'siName': si_key[1]
                })
                continue

            function_name = mapping['function']

            if si_key not in si_groups:
                si_groups[si_key] = {}

            if function_name not in si_groups[si_key]:
                si_groups[si_key][function_name] = {}

            if sreq_info[0] not in si_groups[si_key][function_name]:
                si_groups[si_key][function_name][sreq_info[0]] = {
                    'sreq_name': sreq_info[1],
                    'test_cases': {}
                }

            if test_case_key is not None and test_case_name is not None and test_case_key not in test_case_ier:
                test_cases = si_groups[si_key][function_name][sreq_info[0]]['test_cases']
                

                # If test case already exists, append actor to its list
                if test_case_key in test_cases:
                    existing_test = test_cases[test_case_key]
                    if actor not in existing_test[2]:
                        existing_test[2].append(actor)
                else:
                    # Add new test case with actor
                    test_cases[test_case_key] = (test_case_key, test_case_name, [actor])

        # Log unmapped SREQs with timestamp
        if unmapped_sreqs:
            logging.info("\n" + "="*80)
            logging.info(f"Analysis run at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            logging.info(f"Found {len(unmapped_sreqs)} SREQs without function mappings in SP5-Functional.json:")
            for sreq in unmapped_sreqs:
                logging.info(f"\nSREQ: {sreq.get('sreqNumber', '')}")
                logging.info(f"SI: {sreq.get('siNumber', '')} -> {sreq.get('siName', '')}")
                logging.info(f"Description: {sreq.get('sreqName', '')}")
            logging.info("\nPlease add these SREQs to SP5-Functional.json with appropriate function mappings.")
            logging.info("="*80 + "\n")

            # Also log to console for immediate feedback
            logging.warning(f"\nWARNING: Found {len(unmapped_sreqs)} unmapped SREQs. Check {log_file} for details.")
        
        return si_groups, "Success"
    except FileNotFoundError:
        return None, f"Error: File not found at {script_dir}"
    except json.JSONDecodeError:
        return None, "Error: Invalid JSON format in the input file"
    except Exception as e:
        return None, f"Unexpected error: {str(e)}"

def read_tin_data(tin_csv_file):
    """
    Read TIN data from CSV file to map TINs to services.
    
    Args:
        tin_csv_file (str): Path to the TIN CSV file
        
    Returns:
        dict: Dictionary with TIN as keys and service information as values
    """
    tin_to_service = {}
    
    with open(tin_csv_file, 'r') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            tin = row['TIN']
            service = row['SI']
            title = row['Title']
            tin_type = row['TIN_TYPE']
            
            tin_to_service[tin] = {
                'service': service,
                'title': title,
                'type': tin_type
            }
    
    return tin_to_service

def read_and_organize_ier():
    """Read the IER JSON file and organize data hierarchically."""
    script_dir = Path(__file__).parent
    input_path = script_dir / "static" / "IER.json"
    tin_csv_file = script_dir / "static" /"TIN2.csv"

    logging.info("READ AND ORGANIZE IER")

    logging.info(f"Reading TIN data from {tin_csv_file}...")
    tin_to_service = read_tin_data(tin_csv_file)

    try:
        with open(input_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        # First pass: collect all IDP numbers that have asterisk entries
        asterisk_idps = set()
        for item in data:
            idp_tin_name = item.get('idpTinName', '')
            if '*' in idp_tin_name:
                idp_number = get_idp_number(idp_tin_name)
                if idp_number:
                    asterisk_idps.add(idp_number)

        pi_groups = {}
        for item in data:
            # Use get() with default values for fields that might not exist
            pi_key = (item.get('piNumber', ''), item.get('piName', ''))
            ier_key = (item.get('ierNumber', ''), item.get('ierName', ''))
            tin_info = (item.get('tinName', ''), item.get('idpTinName', ''))
            
            if tin_info[0] != None:
                tin_service = ""
                # Find the TIN key that has the title matching tin_info[0]
                for tin_key, tin_data in tin_to_service.items():
                    if tin_data.get('title') == tin_info[0]:
                        tin_service = tin_data.get('service', '')
                        break

            # Safely get test case information
            test_case_key = item.get('testCaseKey', None)
            test_case_name = item.get('testCaseName', None)
            test_case = (test_case_key, test_case_name)

            status = item.get('testCaseState','')

            if status == 'Deprecated' or status == 'Draft':
                continue

            # Skip this TIN if it shouldn't be included based on asterisk rules
            if not should_include_tin(tin_info, asterisk_idps):
                continue

            # Initialize PI level if not exists
            if pi_key not in pi_groups:
                pi_groups[pi_key] = {}

            # Initialize IER level if not exists
            if ier_key not in pi_groups[pi_key]:
                pi_groups[pi_key][ier_key] = {}

            # Initialize TIN level if not exists with Service Info
            if tin_service not in pi_groups[pi_key][ier_key]:
                pi_groups[pi_key][ier_key][tin_service] = {
                    'idp_tin_name': '',
                    'test_cases': set()
                }

            # Add test case only if both key and name are not None
            if test_case_key is not None and test_case_name is not None:
                pi_groups[pi_key][ier_key][tin_service]['test_cases'].add(test_case)

        return pi_groups, "Success"
    except FileNotFoundError:
        return None, f"Error: File not found at {input_path}"
    except json.JSONDecodeError:
        return None, "Error: Invalid JSON format in the input file"
    except Exception as e:
        return None, f"Unexpected error: {str(e)}"

def get_idp_number(idp_tin_name):
    """Extract IDP number from idpTinName string."""
    if not idp_tin_name:
        return None
    parts = idp_tin_name.split(' -> ')[0].strip()  # Get the part before '->'
    idp_parts = parts.split(' ')[0].strip()  # Get the part before any space
    return idp_parts  # This will be like 'IDP-1242'

def should_include_tin(tin_info, asterisk_idps):
    """
    Determine if a TIN should be included based on asterisk rules.

    Args:
        tin_info: Tuple of (tinName, idpTinName)
        asterisk_idps: Set of IDP numbers that have asterisk entries

    Returns:
        bool: True if the TIN should be included, False otherwise
    """
    idp_tin_name = tin_info[1]
    if not idp_tin_name:
        return True

    # If this is an asterisk entry, always include it
    if '*' in idp_tin_name:
        return True

    # Get the IDP number for this entry
    idp_number = get_idp_number(idp_tin_name)
    if not idp_number:
        return True

    # If there's an asterisk entry for this IDP number, exclude this entry
    return idp_number not in asterisk_idps

@app.route('/')
def index():
    if 'cookies' in session:
        return redirect(url_for('view_tree_func'))
    return render_template('index_ionic.html', default_url=DEFAULT_URL)

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    root_url = data.get('url', DEFAULT_URL)
    username = data.get('username')
    password = data.get('password')

    if not root_url.endswith("/"):
        root_url += "/"

    login_url = f"{root_url}IdentityManagement/Account/Login?ReturnUrl=%2FHome"

    try:
        session_obj = requests.Session()
        login_page_response = session_obj.get(login_url, verify=False)
        login_page_content = login_page_response.text

        html_document = BeautifulSoup(login_page_content, 'html.parser')
        verification_token_node = html_document.find('input', {'name': '__RequestVerificationToken'})
        verification_token = verification_token_node.get('value', '')

        if not verification_token:
            return jsonify({'success': False, 'error': 'Failed to retrieve verification token'})

        login_data = {
            'username': username,
            'password': password,
            '__RequestVerificationToken': verification_token
        }

        response = session_obj.post(login_url, data=login_data, verify=False)
        attempt_page_content = response.text
        attempt_html_document = BeautifulSoup(attempt_page_content, 'html.parser')
        form = attempt_html_document.find('form', {'action': '/Account/LogOff'})

        if form is not None:
            session['cookies'] = requests.utils.dict_from_cookiejar(session_obj.cookies)
            session['url'] = root_url
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'error': 'Invalid credentials'})

    except Exception as ex:
        return jsonify({'success': False, 'error': str(ex)})

@app.route('/logout')
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/check_auth')
def check_auth():
    return jsonify({'authenticated': 'cookies' in session})

@app.route('/view_tree')
@login_required
def view_tree():
    logging.info("VIEW TREE")
    organized_data, message = read_and_organize_requirements()
    if organized_data is None:
        return f"<h1>Error: {message}</h1>"
    return render_template("index_tree_tin.html", data=organized_data)

@app.route('/view_tree_func')
@login_required
def view_tree_func():
    logging.info("VIEW TREE FUNC")
    organized_data, message = read_and_organize_requirements_func()
    if organized_data is None:
        return f"<h1>Error: {message}</h1>"
    return render_template("index_tree_func.html", data=organized_data, default_url=DEFAULT_URL)

@app.route('/api/data')
@login_required
def get_data():
    logging.info("GET DATA")
    organized_data, _ = read_and_organize_requirements()
    return jsonify(organized_data)

@app.route('/get_ier_coverage')
@login_required
def get_ier_coverage():
    url = session['url']
    api_url = f"{url}api/coverage/test-case-coverage/Get-Ier-Coverage"

    s = requests.Session()
    s.cookies = requests.utils.cookiejar_from_dict(session['cookies'])

    try:
        logging.info("\n=== Starting IER Coverage Request ===")
        logging.info(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logging.info(f"URL: {api_url}")
        
        start_time = datetime.now()
        
        # Configure session for long-running request
        s.headers.update({
            'Connection': 'keep-alive',
            'Keep-Alive': 'timeout=600, max=1000'
        })
        
        # Make the request
        response = s.get(
            api_url,
            verify=False,
            timeout=(300, 300),  # (connect timeout, read timeout)
            stream=True,
            headers={'Accept-Encoding': 'gzip, deflate'}
        )
        
        try:
            # Stream and process response
            response._content = stream_response(response, start_time)
            
            # Validate response content
            is_valid, response_text = check_iocore_session(response, api_url, start_time)
            if not is_valid:
                return jsonify({
                    'success': False,
                    'error': response_text
                })
        except requests.exceptions.InvalidSession:
            logging.error("Session expired during request")
            return jsonify({
                'success': False,
                'error': "Your session has expired. Please log in again."
            })

        logging.info("Parsing response as JSON")
        data = json.loads(response_text)
        
        json_file_path = os.path.join(app.static_folder, 'IER.json')
        markdown_file_path = os.path.join(app.static_folder, 'IER.md')

        try:
            logging.info(f"Writing JSON to {json_file_path}")
            with open(json_file_path, 'w') as file:
                json.dump(data, file, indent=4)
        except IOError as error:
            error_msg = f"Error writing to JSON file: {error}"
            logging.error(error_msg)
            return jsonify({
                'success': False,
                'error': error_msg
            })

        logging.info("Processing data for markdown")
        hierarchy = analyze_ier_data(data)
        markdown_content = generate_ier_markdown_output(hierarchy)

        try:
            logging.info(f"Writing markdown to {markdown_file_path}")
            with open(markdown_file_path, 'w', encoding='utf-8') as file:
                file.write(markdown_content)
        except IOError as error:
            error_msg = f"Error writing to markdown file: {error}"
            logging.error(error_msg)
            return jsonify({
                'success': False,
                'error': error_msg
            })

        end_time = datetime.now()
        total_duration = (end_time - start_time).total_seconds()
        logging.info(f"Total operation completed in {total_duration:.2f} seconds")
        
        return jsonify({
            'success': True,
            'markdown': markdown_content
        })
    except requests.Timeout:
        error_msg = "Request timed out after 5 minutes"
        logging.error(error_msg)
        return jsonify({
            'success': False,
            'error': error_msg
        })
    except Exception as ex:
        error_msg = f"Unexpected error: {str(ex)}"
        logging.error(error_msg)
        logging.exception("Full traceback:")
        return jsonify({
            'success': False,
            'error': error_msg
        })

@app.route('/get_requirement_coverage')
@login_required
def get_requirement_coverage():
    """Split the SREQ coverage operation into a background task and return immediately"""
    try:
        # Get the necessary data from the session before starting the background thread
        url = session.get('url')
        cookies = session.get('cookies')
        
        if not url or not cookies:
            return jsonify({
                'success': False,
                'error': "Missing URL or cookies in session"
            })
        
        # Store request in the session to indicate processing has started
        session['sreq_processing'] = True
        session['sreq_start_time'] = datetime.now().isoformat()
        
        # Use threading to run the operation in the background, passing the values directly
        thread = threading.Thread(
            target=process_sreq_coverage_in_background,
            args=(url, cookies)
        )
        thread.daemon = True  # Make sure thread doesn't block app shutdown
        thread.start()
        
        return jsonify({
            'success': True,
            'status': 'processing',
            'message': 'SREQ Coverage processing started in background'
        })
    except Exception as e:
        logging.error(f"Error starting SREQ background task: {str(e)}")
        logging.exception("Full error traceback:")
        return jsonify({
            'success': False,
            'error': f"Failed to start background processing: {str(e)}"
        })

def process_sreq_coverage_in_background(url, cookies):
    """Process SREQ coverage in a background thread
    
    Args:
        url: The base URL from the session
        cookies: The cookies dictionary from the session
    """
    try:
        # No need to access session here - we have the values passed directly
        logging.info(f"Starting background processing with URL: {url}")
            
        api_url = f"{url}api/coverage/test-case-coverage/Get-Requirement-Coverage"
        s = requests.Session()
        s.cookies = requests.utils.cookiejar_from_dict(cookies)
        
        logging.info("\n=== Starting SREQ Coverage Request (Background) ===")
        logging.info(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logging.info(f"URL: {api_url}")
        
        start_time = datetime.now()
        
        # Configure session for long-running request
        s.headers.update({
            'Connection': 'keep-alive',
            'Keep-Alive': 'timeout=600, max=1000'
        })
        
        # Make the request with streaming enabled
        response = s.get(
            api_url,
            verify=False,
            timeout=(600, 600),  # (connect timeout, read timeout)
            stream=True,
            headers={'Accept-Encoding': 'gzip, deflate'}
        )
        
        # Process response
        response._content = stream_response(response, start_time)
        
        # Validate response content
        is_valid, response_text = check_iocore_session(response, api_url, start_time)
        if not is_valid:
            logging.error(f"Invalid response: {response_text}")
            return
            
        # Parse and process data
        data = json.loads(response_text)
        
        json_file_path = os.path.join(app.static_folder, 'SREQ.json')
        markdown_file_path = os.path.join(app.static_folder, 'SREQ.md')
        
        # Write JSON file
        with open(json_file_path, 'w') as file:
            json.dump(data, file, indent=4)
            
        # Generate and write markdown
        null_entries = extract_null_testcase_entries(data)
        hierarchy = organize_hierarchical_data(null_entries)
        markdown_content = generate_markdown(hierarchy)
        
        with open(markdown_file_path, 'w', encoding='utf-8') as file:
            file.write(markdown_content)
            
        # Record completion
        end_time = datetime.now()
        total_duration = (end_time - start_time).total_seconds()
        logging.info(f"Background SREQ processing completed in {total_duration:.2f} seconds")
        
    except Exception as e:
        logging.error(f"Error in background SREQ processing: {str(e)}")
        logging.exception("Full error traceback:")

@app.route('/check_sreq_status')
@login_required
def check_sreq_status():
    """Check the status of SREQ coverage processing"""
    # Check if SREQ files exist and when they were last modified
    sreq_json_path = os.path.join(app.static_folder, 'SREQ.json')
    
    try:
        if not os.path.exists(sreq_json_path):
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
        logging.error(f"Error checking SREQ status: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Error checking status: {str(e)}'
        })
    except requests.Timeout:
        error_msg = "Request timed out after 5 minutes"
        logging.error(error_msg)
        return jsonify({
            'success': False,
            'error': error_msg
        })
    except Exception as ex:
        error_msg = f"Unexpected error: {str(ex)}"
        logging.error(error_msg)
        logging.exception("Full traceback:")
        return jsonify({
            'success': False,
            'error': error_msg
        })

@app.route('/system_monitor')
@login_required
def system_monitor():
    return render_template('system_monitor.html')

@app.route('/test_cases')
@login_required
def test_cases():
    return render_template('test_case.html')

@app.route('/get_system_metrics')
@login_required
def get_system_metrics():
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    memory_used_mb = memory.used / (1024 * 1024)
    return jsonify({
        'cpu': cpu_percent,
        'memory': round(memory_used_mb, 2)
    })

@app.route('/view_ier_tree')
@login_required
def view_ier_tree():
    logging.info("VIEW IER TREE")
    organized_data, message = read_and_organize_ier()
    if organized_data is None:
        return f"<h1>Error: {message}</h1>"
    return render_template("index_ier_tree.html", data=organized_data)

@app.route('/api/ier_data')
@login_required
def get_ier_data():
    logging.info("GET IER DATA")
    organized_data, _ = read_and_organize_ier()
    return jsonify(organized_data)

@app.route('/get_test_cases')
@login_required
def get_test_cases():
    """Fetch test cases from the API and store them in a JSON file"""
    try:
        url = session['url']
        api_url = f"{url}api/test-cases"
        
        s = requests.Session()
        s.cookies = requests.utils.cookiejar_from_dict(session['cookies'])
        
        logging.info("\n=== Starting Test Cases API Request ===")
        logging.info(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logging.info(f"URL: {api_url}")
        
        start_time = datetime.now()
        
        # Configure session for request
        s.headers.update({
            'Connection': 'keep-alive',
            'Keep-Alive': 'timeout=600, max=1000'
        })
        
        # Make the request
        response = s.get(
            api_url,
            verify=False,
            timeout=(60, 60),  # (connect timeout, read timeout)
            headers={'Accept-Encoding': 'gzip, deflate'}
        )
        
        # Check if session is valid
        is_valid, response_text = check_iocore_session(response, api_url, start_time)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': response_text
            })
            
        # Parse response
        data = json.loads(response_text)
        
        # Save to file
        json_file_path = os.path.join(app.static_folder, 'test_cases.json')
        
        try:
            logging.info(f"Writing JSON to {json_file_path}")
            with open(json_file_path, 'w') as file:
                json.dump(data, file, indent=4)
        except IOError as error:
            error_msg = f"Error writing to JSON file: {error}"
            logging.error(error_msg)
            return jsonify({
                'success': False,
                'error': error_msg
            })
            
        end_time = datetime.now()
        total_duration = (end_time - start_time).total_seconds()
        logging.info(f"Test Cases API request completed in {total_duration:.2f} seconds")
        
        return jsonify({
            'success': True,
            'message': 'Test cases data fetched and saved successfully',
            'count': len(data) if isinstance(data, list) else 'unknown'
        })
        
    except requests.Timeout:
        error_msg = "Request timed out"
        logging.error(error_msg)
        return jsonify({
            'success': False,
            'error': error_msg
        })
    except Exception as ex:
        error_msg = f"Unexpected error: {str(ex)}"
        logging.error(error_msg)
        logging.exception("Full traceback:")
        return jsonify({
            'success': False,
            'error': error_msg
        })

@app.route('/get_test_results')
@login_required
def get_test_results():
    """Fetch test results from the API and store them in a JSON file"""
    try:
        url = session['url']
        api_url = f"{url}api/public/test-results"
        
        s = requests.Session()
        s.cookies = requests.utils.cookiejar_from_dict(session['cookies'])
        
        logging.info("\n=== Starting Test Results API Request ===")
        logging.info(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logging.info(f"URL: {api_url}")
        
        start_time = datetime.now()
        
        # Configure session for request
        s.headers.update({
            'Connection': 'keep-alive',
            'Keep-Alive': 'timeout=600, max=1000'
        })
        
        # Make the request
        response = s.get(
            api_url,
            verify=False,
            timeout=(60, 60),  # (connect timeout, read timeout)
            headers={'Accept-Encoding': 'gzip, deflate'}
        )
        
        # Check if session is valid
        is_valid, response_text = check_iocore_session(response, api_url, start_time)
        if not is_valid:
            return jsonify({
                'success': False,
                'error': response_text
            })
            
        # Parse response
        data = json.loads(response_text)
        
        # Save to file
        json_file_path = os.path.join(app.static_folder, 'test_results.json')
        
        try:
            logging.info(f"Writing JSON to {json_file_path}")
            with open(json_file_path, 'w') as file:
                json.dump(data, file, indent=4)
        except IOError as error:
            error_msg = f"Error writing to JSON file: {error}"
            logging.error(error_msg)
            return jsonify({
                'success': False,
                'error': error_msg
            })
            
        end_time = datetime.now()
        total_duration = (end_time - start_time).total_seconds()
        logging.info(f"Test Results API request completed in {total_duration:.2f} seconds")
        
        return jsonify({
            'success': True,
            'message': 'Test results data fetched and saved successfully',
            'count': len(data) if isinstance(data, list) else 'unknown'
        })
        
    except requests.Timeout:
        error_msg = "Request timed out"
        logging.error(error_msg)
        return jsonify({
            'success': False,
            'error': error_msg
        })
    except Exception as ex:
        error_msg = f"Unexpected error: {str(ex)}"
        logging.error(error_msg)
        logging.exception("Full traceback:")
        return jsonify({
            'success': False,
            'error': error_msg
        })

@app.route('/unmapped_sreqs')
@login_required
def get_unmapped_sreqs():
    try:
        with open(log_file, 'r') as f:
            log_content = f.read()
        return jsonify({
            'success': True,
            'content': log_content
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Development server
    app.run(debug=True, port=5005)
else:
    # Production settings - PythonAnywhere will handle the server configuration
    # Make sure debug is False in production
    app.debug = False
