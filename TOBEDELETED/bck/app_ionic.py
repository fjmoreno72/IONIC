from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from functools import wraps
import json
import os
import sys
import csv
import markdown
import requests
import urllib3
import psutil
import logging
from datetime import datetime
from bs4 import BeautifulSoup
from pathlib import Path
from ier_analysis import analyze_ier_data, generate_ier_markdown_output
from sreq_analysis import extract_null_testcase_entries, organize_hierarchical_data, generate_markdown

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
# Secret key will be set from environment variable in production (see wsgi.py)
# For development, we'll use a default value
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-here')

# Ensure the static directory exists
os.makedirs(app.static_folder, exist_ok=True)

DEFAULT_URL = "https://iocore2-ciav.ivv.ncia.nato.int"

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

    print("READ AND ORGANIZE")
    try:
        with open(input_path, "r", encoding="utf-8") as file:
            sreq_data = json.load(file)
        
        with open(ier_path, "r", encoding="utf-8") as file_ier:
            ier_data = json.load(file_ier)

         # Create a dictionary to store test cases from IER data
        test_case_ier = {}
        for item in ier_data:
            if item['testCaseKey'] not in test_case_ier:
                test_case_ier[item['testCaseKey']] = item['testCaseName']

        si_groups = {}
        for item in sreq_data:
            si_key = (item['siNumber'], item['siName'])
            tin_key = (item['tinNumber'], item['epName'])
            sreq_info = (item['sreqNumber'], item['sreqName'])
            test_case_key = item['testCaseKey']
            test_case_name = item['testCaseName']
            actor = item.get('actor', 'N/A')

            status = item.get('status')

            if status == 'Deprecated' or status == 'Draft':
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

    print("READ AND ORGANIZE SREQ/FUNC*/IER")
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
            if item['testCaseKey'] not in test_case_ier:
                test_case_ier[item['testCaseKey']] = item['testCaseName']
        
        # Create mapping of SREQ numbers to their function and SI name
        sreq_mapping = {}
        for item in func_data:
            sreq_mapping[item['sreqNumber']] = {
                'function': item['funName'],
                'siName': item['siName']
            }

        # Track unmapped SREQs
        unmapped_sreqs = []

        si_groups = {}
        for item in sreq_data:
            si_key = (item['siNumber'], item['siName'])
            sreq_info = (item['sreqNumber'], item['sreqName'])
            actor = item.get('actor', 'N/A')

            test_case_key = item['testCaseKey']
            test_case_name = item['testCaseName']
            status = item.get('status')

            if status == 'Deprecated' or status == 'Draft':
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
                logging.info(f"\nSREQ: {sreq['sreqNumber']}")
                logging.info(f"SI: {sreq['siNumber']} -> {sreq['siName']}")
                logging.info(f"Description: {sreq['sreqName']}")
            logging.info("\nPlease add these SREQs to SP5-Functional.json with appropriate function mappings.")
            logging.info("="*80 + "\n")

            # Also print to console for immediate feedback
            print(f"\nWARNING: Found {len(unmapped_sreqs)} unmapped SREQs. Check {log_file} for details.")
        
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
    tin_csv_file = script_dir / "static" / "TIN2.csv"
    
    print("READ AND ORGANIZE IER")
    
    print(f"Reading TIN data from {tin_csv_file}...")
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
            pi_key = (item['piNumber'], item['piName'])
            ier_key = (item['ierNumber'], item['ierName'])
            tin_info = (item['tinName'], item['idpTinName'])
            test_case = (item['testCaseKey'], item['testCaseName'])
            
            if tin_info[0] != None:
                tin_service = ""
                # Find the TIN key that has the title matching tin_info[0]
                for tin_key, tin_data in tin_to_service.items():
                    if tin_data.get('title') == tin_info[0]:
                        tin_service = tin_data.get('service', '')
                        break
                #print(tin_service)

            status = item.get('status')

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

            # Initialize TIN level if not exists
            #if tin_info[0] not in pi_groups[pi_key][ier_key]:
            #    pi_groups[pi_key][ier_key][tin_info[0]] = {
            #        'idp_tin_name': tin_info[1],
            #        'test_cases': set()
            #    }

            # Initialize TIN level if not exists with Service Info
            if tin_service not in pi_groups[pi_key][ier_key]:
                pi_groups[pi_key][ier_key][tin_service] = {
                    'idp_tin_name': tin_service,
                    'test_cases': set()
                }


            # Add test case only if both key and name are not None
            if test_case[0] is not None and test_case[1] is not None:
                pi_groups[pi_key][ier_key][tin_info[0]]['test_cases'].add(test_case)

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
    print("VIEW TREE")
    organized_data, message = read_and_organize_requirements()
    if organized_data is None:
        return f"<h1>Error: {message}</h1>"
    return render_template("index_tree_tin.html", data=organized_data)

@app.route('/view_tree_func')
@login_required
def view_tree_func():
    print("VIEW TREE FUNC")
    organized_data, message = read_and_organize_requirements_func()
    if organized_data is None:
        return f"<h1>Error: {message}</h1>"
    return render_template("index_tree_func.html", data=organized_data, default_url=DEFAULT_URL)

@app.route('/api/data')
@login_required
def get_data():
    print("GET DATA")
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
        response = s.get(api_url, verify=False)
        if response.status_code == 200:
            data = response.json()
            json_file_path = os.path.join(app.static_folder, 'IER.json')
            markdown_file_path = os.path.join(app.static_folder, 'IER.md')

            try:
                with open(json_file_path, 'w') as file:
                    json_object = json.loads(response.text)
                    json.dump(json_object, file, indent=4)
            except IOError as error:
                print(f"Error writing to output file: {error}", file=sys.stderr)
                sys.exit(1)

            hierarchy = analyze_ier_data(data)
            markdown_content = generate_ier_markdown_output(hierarchy)

            try:
                with open(markdown_file_path, 'w', encoding='utf-8') as file:
                    file.write(markdown_content)
                print(f"Analysis report has been written to {'IER.md'}", file=sys.stderr)
            except IOError as error:
                print(f"Error writing to output file: {error}", file=sys.stderr)
                sys.exit(1)

            return jsonify({
                'success': True,
                'markdown': markdown_content
            })
        else:
            return jsonify({
                'success': False,
                'error': f'API request failed with status code: {response.status_code}'
            })
    except Exception as ex:
        return jsonify({'success': False, 'error': str(ex)})

@app.route('/get_requirement_coverage')
@login_required
def get_requirement_coverage():
    url = session['url']
    api_url = f"{url}api/coverage/test-case-coverage/Get-Requirement-Coverage"

    s = requests.Session()
    s.cookies = requests.utils.cookiejar_from_dict(session['cookies'])

    try:
        response = s.get(api_url, verify=False)
        if response.status_code == 200:
            json_file_path = os.path.join(app.static_folder, 'SREQ.json')
            markdown_file_path = os.path.join(app.static_folder, 'SREQ.md')

            try:
                with open(json_file_path, 'w') as file:
                    json_object = json.loads(response.text)
                    json.dump(json_object, file, indent=4)
            except IOError as error:
                print(f"Error writing to output file: {error}", file=sys.stderr)
                sys.exit(1)

            data = response.json()
            null_entries = extract_null_testcase_entries(data)
            hierarchy = organize_hierarchical_data(null_entries)
            markdown_content = generate_markdown(hierarchy)

            try:
                with open(markdown_file_path, 'w', encoding='utf-8') as file:
                    file.write(markdown_content)
                print(f"Analysis report has been written to {'SREQ.md'}", file=sys.stderr)
            except IOError as error:
                print(f"Error writing to output file: {error}", file=sys.stderr)
                sys.exit(1)

            return jsonify({
                'success': True,
                'markdown': markdown_content
            })
        else:
            return jsonify({
                'success': False,
                'error': f'API request failed with status code: {response.status_code}'
            })
    except Exception as ex:
        return jsonify({'success': False, 'error': str(ex)})

@app.route('/system_monitor')
@login_required
def system_monitor():
    return render_template('system_monitor.html')

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
    print("VIEW IER TREE")
    organized_data, message = read_and_organize_ier()
    if organized_data is None:
        return f"<h1>Error: {message}</h1>"
    return render_template("index_ier_tree.html", data=organized_data)

@app.route('/api/ier_data')
@login_required
def get_ier_data():
    print("GET IER DATA")
    organized_data, _ = read_and_organize_ier()
    return jsonify(organized_data)

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
