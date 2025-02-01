import json
import os
import sys
import tempfile

import markdown
import pdfkit
import requests
import urllib3
from bs4 import BeautifulSoup
from flask import Flask, render_template, request, jsonify, session, send_file

from ier_analysis import analyze_ier_data, generate_ier_markdown_output
from sreq_analysis import extract_null_testcase_entries, organize_hierarchical_data, generate_markdown

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = Flask(__name__, static_folder='static')
app.secret_key = 'your-secret-key-here'  # Change this to a secure secret key in production

# Ensure the static directory exists
os.makedirs(app.static_folder, exist_ok=True)

# wkhtmltopdf path configuration
if os.name == 'nt':  # Windows
    WKHTMLTOPDF_PATH = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
else:  # Linux/Unix/MacOS
    WKHTMLTOPDF_PATH = '/usr/local/bin/wkhtmltopdf'

# Configure pdfkit with the path
try:
    config = pdfkit.configuration(wkhtmltopdf=WKHTMLTOPDF_PATH)
except Exception as e:
    print(f"Warning: Could not configure wkhtmltopdf path: {e}")
    config = None

DEFAULT_URL = "https://iocore2-ciav.ivv.ncia.nato.int"


@app.route('/')
def index():
    return render_template('index_login.html', default_url=DEFAULT_URL)


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


if __name__ == '__main__':
    app.run(debug=True)