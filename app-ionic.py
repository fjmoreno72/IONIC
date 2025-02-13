from flask import Flask, render_template, jsonify, request, session, send_file
import json
import os
import sys
import tempfile
import markdown
import pdfkit
import requests
import urllib3
from bs4 import BeautifulSoup
from pathlib import Path
from ier_analysis import analyze_ier_data, generate_ier_markdown_output
from OLD.sreq_analysis import extract_null_testcase_entries, organize_hierarchical_data, generate_markdown

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__, static_folder='static')
app.secret_key = 'your-secret-key-here'

# Ensure the static directory exists
os.makedirs(app.static_folder, exist_ok=True)

# wkhtmltopdf configuration
if os.name == 'nt':  # Windows
    WKHTMLTOPDF_PATH = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
else:  # Linux/Unix/MacOS
    WKHTMLTOPDF_PATH = '/usr/local/bin/wkhtmltopdf'

try:
    config = pdfkit.configuration(wkhtmltopdf=WKHTMLTOPDF_PATH)
except Exception as e:
    print(f"Warning: Could not configure wkhtmltopdf path: {e}")
    config = None

DEFAULT_URL = "https://iocore2-ciav.ivv.ncia.nato.int"

def read_and_organize_requirements():
    """Read the JSON file and organize requirements hierarchically."""
    script_dir = Path(__file__).parent
    input_path = script_dir / "static" / "SREQ.json"
    print("READ AND ORGANIZE")
    try:
        with open(input_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        si_groups = {}
        for item in data:
            si_key = (item['siNumber'], item['siName'])
            tin_key = (item['tinNumber'], item['epName'])
            sreq_info = (item['sreqNumber'], item['sreqName'])
            test_case = (item['testCaseKey'], item['testCaseName'])

            if si_key not in si_groups:
                si_groups[si_key] = {}

            if tin_key not in si_groups[si_key]:
                si_groups[si_key][tin_key] = {}

            if sreq_info[0] not in si_groups[si_key][tin_key]:
                si_groups[si_key][tin_key][sreq_info[0]] = {
                    'sreq_name': sreq_info[1],
                    'test_cases': set()
                }

            if test_case[0] is not None and test_case[1] is not None:
                si_groups[si_key][tin_key][sreq_info[0]]['test_cases'].add(test_case)
        
        return si_groups, "Success"
    except FileNotFoundError:
        return None, f"Error: File not found at {input_path}"
    except json.JSONDecodeError:
        return None, "Error: Invalid JSON format in the input file"
    except Exception as e:
        return None, f"Unexpected error: {str(e)}"

@app.route('/')
def index():
    return render_template('index_ionic.html', default_url=DEFAULT_URL)

@app.route('/view_tree')
def view_tree():
    print("VIEW TREE")
    """Render the tree view page with the organized data."""
    if 'cookies' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'})
        
    organized_data, message = read_and_organize_requirements()
    if organized_data is None:
        return f"<h1>Error: {message}</h1>"

    return render_template("index_tree.html", data=organized_data)


@app.route('/view_tree2')
def view_tree2():
    print("VIEW TREE2")
    """Render the tree view page with the organized data."""
    if 'cookies' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'})

    organized_data, message = read_and_organize_requirements()
    if organized_data is None:
        return f"<h1>Error: {message}</h1>"

    return render_template("index_tree2.html", data=organized_data)

@app.route('/api/data')
def get_data():
    print("GET DATA")
    """Provide the organized data as a JSON API."""
    organized_data, _ = read_and_organize_requirements()
    return jsonify(organized_data)

@app.route('/get_ier_coverage')
def get_ier_coverage():
    if 'cookies' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'})

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
                    # Parse the string to ensure it's valid JSON
                    json_object = json.loads(response.text)
                    # Write to file with proper formatting
                    json.dump(json_object, file, indent=4)
                    file.close()
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
def get_requirement_coverage():
    if 'cookies' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'})

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
                    # Parse the string to ensure it's valid JSON
                    json_object = json.loads(response.text)
                    # Write to file with proper formatting
                    json.dump(json_object, file, indent=4)
                    file.close()
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


@app.route('/generate_pdf/<report_type>')
def generate_pdf(report_type):
    if 'cookies' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    try:
        # Get the report content based on type
        markdown_content = None
        if report_type == 'ier':
            #markdown_file_path = Path("IER.md")
            markdown_file_path = os.path.join(app.static_folder, 'IER.md')
            print(markdown_file_path)
            if os.path.exists(markdown_file_path):
                with open(markdown_file_path, 'r', encoding='utf-8') as file:
                    markdown_content = file.read()
            else:
                return jsonify({'success': False, 'error': 'IER markdown file not found'}), 404
        elif report_type == 'sreq':
            markdown_file_path = os.path.join(app.static_folder, 'SREQ.md')
            #markdown_file_path = Path("SREQ.md")
            print(markdown_file_path)
            if os.path.exists(markdown_file_path):
                with open(markdown_file_path, 'r', encoding='utf-8') as file:
                    markdown_content = file.read()
            else:
                return jsonify({'success': False, 'error': 'SREQ markdown file not found'}), 404
        else:
            return jsonify({'success': False, 'error': 'Invalid report type'}), 400

        if not markdown_content:
            return jsonify({'success': False, 'error': 'Failed to generate report content'}), 500

        # Convert markdown to HTML
        html_content = markdown.markdown(markdown_content)

        # Add some basic styling
        styled_html = f"""
        <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        margin: 40px;
                        line-height: 1.6;
                    }}
                    h1 {{ color: #333; }}
                    h2 {{ color: #444; margin-top: 20px; }}
                    h3 {{ color: #555; }}
                </style>
            </head>
            <body>
                {html_content}
            </body>
        </html>
        """

        # Create temporary file for PDF
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
            temp_path = f.name

        # Configure PDF options
        options = {
            'page-size': 'A4',
            'margin-top': '20mm',
            'margin-right': '20mm',
            'margin-bottom': '20mm',
            'margin-left': '20mm',
            'encoding': 'UTF-8',
            'no-outline': None
        }

        # Generate PDF
        try:
            if config is None:
                raise Exception("wkhtmltopdf configuration is not available")
            pdfkit.from_string(styled_html, temp_path, options=options, configuration=config)

            # Send the file
            return send_file(
                temp_path,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=f"{report_type}_coverage_report.pdf"
            )
        except Exception as error:
            app.logger.error(f"PDF generation error: {str(error)}")
            return jsonify({
                'success': False,
                'error': str(error)
            }), 500
        finally:
            # Clean up the temporary file
            if os.path.exists(temp_path):
                os.unlink(temp_path)

    except Exception as ex:
        app.logger.error(f"PDF generation error: {str(ex)}")
        return jsonify({'success': False, 'error': str(ex)}), 500



# ... [Keep all the existing routes from app_login.py] ...
# Login route
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

# Keep other routes from app_login.py...

def read_and_organize_ier2():
    """Read the IER JSON file and organize data hierarchically."""
    script_dir = Path(__file__).parent
    input_path = script_dir / "static" / "IER.json"
    print("READ AND ORGANIZE IER")
    try:
        with open(input_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        pi_groups = {}
        for item in data:
            pi_key = (item['piNumber'], item['piName'])
            ier_key = (item['ierNumber'], item['ierName'])
            tin_info = (item['tinName'], item['idpTinName'])
            test_case = (item['testCaseKey'], item['testCaseName'])

            # Initialize PI level if not exists
            if pi_key not in pi_groups:
                pi_groups[pi_key] = {}

            # Initialize IER level if not exists
            if ier_key not in pi_groups[pi_key]:
                pi_groups[pi_key][ier_key] = {}

            # Initialize TIN level if not exists
            if tin_info[0] not in pi_groups[pi_key][ier_key]:
                pi_groups[pi_key][ier_key][tin_info[0]] = {
                    'idp_tin_name': tin_info[1],
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


def read_and_organize_ier():
    """Read the IER JSON file and organize data hierarchically."""
    script_dir = Path(__file__).parent
    input_path = script_dir / "static" / "IER.json"
    print("READ AND ORGANIZE IER")
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
            if tin_info[0] not in pi_groups[pi_key][ier_key]:
                pi_groups[pi_key][ier_key][tin_info[0]] = {
                    'idp_tin_name': tin_info[1],
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


# Add these routes to your Flask application
@app.route('/view_ier_tree')
def view_ier_tree():
    print("VIEW IER TREE")
    """Render the IER tree view page with the organized data."""
    if 'cookies' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'})

    organized_data, message = read_and_organize_ier()
    if organized_data is None:
        return f"<h1>Error: {message}</h1>"

    return render_template("index_ier_tree.html", data=organized_data)


@app.route('/api/ier_data')
def get_ier_data():
    print("GET IER DATA")
    """Provide the organized IER data as a JSON API."""
    organized_data, _ = read_and_organize_ier()
    return jsonify(organized_data)



if __name__ == '__main__':
    app.run(debug=False, port=5005)
