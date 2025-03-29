#!/usr/bin/env python3
"""
Scheduled task script for PythonAnywhere to update IER and SREQ JSON files.
This script should be scheduled to run every hour.
"""

import requests
import json
import os
import sys
from bs4 import BeautifulSoup
import logging
from datetime import datetime

# Configure logging
log_dir = os.path.dirname(os.path.abspath(__file__))
log_file = os.path.join(log_dir, "scheduled_update.log")
logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Configuration
# Update these values with your actual deployment information
URL = "https://fjmoreno72.eu.pythonanywhere.com"  # Your PythonAnywhere URL
USERNAME = "francisco.moreno@ncia.nato.int"  # Your application username
PASSWORD = "CIAVabc123!!"  # Your application password
API_URL = "https://iocore2-ciav.ivv.ncia.nato.int"  # The API URL used in your application

def log_message(message, level="info"):
    """Log a message to both the log file and stdout."""
    print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - {message}")
    if level.lower() == "info":
        logging.info(message)
    elif level.lower() == "error":
        logging.error(message)
    elif level.lower() == "warning":
        logging.warning(message)

def login():
    """Log in to the application and return the session with cookies."""
    log_message("Starting login process...")
    session = requests.Session()
    
    # Get the login page to retrieve the verification token
    # Make sure API_URL ends with a slash (matching app_ionic.py approach)
    api_base = API_URL
    if not api_base.endswith("/"):
        api_base += "/"
    login_url = f"{api_base}IdentityManagement/Account/Login?ReturnUrl=%2FHome"
    try:
        login_page_response = session.get(login_url, verify=False)
        login_page_content = login_page_response.text
        
        html_document = BeautifulSoup(login_page_content, 'html.parser')
        verification_token_node = html_document.find('input', {'name': '__RequestVerificationToken'})
        
        if not verification_token_node:
            log_message("Failed to retrieve verification token", "error")
            return None
            
        verification_token = verification_token_node.get('value', '')
        
        # Submit login form
        login_data = {
            'username': USERNAME,
            'password': PASSWORD,
            '__RequestVerificationToken': verification_token
        }
        
        response = session.post(login_url, data=login_data, verify=False)
        attempt_page_content = response.text
        attempt_html_document = BeautifulSoup(attempt_page_content, 'html.parser')
        form = attempt_html_document.find('form', {'action': '/Account/LogOff'})
        
        if form is not None:
            log_message("Login successful")
            return session
        else:
            log_message("Login failed: Invalid credentials", "error")
            return None
            
    except Exception as ex:
        log_message(f"Login error: {str(ex)}", "error")
        return None

def update_ier_coverage(session):
    """Call the get_ier_coverage endpoint to update IER.json."""
    log_message("Updating IER coverage...")
    # Make sure API_URL ends with a slash (matching app_ionic.py approach)
    api_base = API_URL
    if not api_base.endswith("/"):
        api_base += "/"
    api_url = f"{api_base}api/coverage/test-case-coverage/Get-Ier-Coverage"
    
    try:
        response = session.get(api_url, verify=False)
        if response.status_code == 200:
            data = response.json()
            
            # Save the JSON file
            static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
            json_file_path = os.path.join(static_folder, "IER.json")
            
            with open(json_file_path, 'w') as file:
                json.dump(data, file, indent=4)
                
            log_message(f"IER.json updated successfully. Size: {len(data)} records")
            return True
        else:
            log_message(f"Failed to update IER coverage. Status code: {response.status_code}", "error")
            return False
    except Exception as ex:
        log_message(f"Error updating IER coverage: {str(ex)}", "error")
        return False

def update_requirement_coverage(session):
    """Call the get_requirement_coverage endpoint to update SREQ.json."""
    log_message("Updating requirement coverage...")
    # Make sure API_URL ends with a slash (matching app_ionic.py approach)
    api_base = API_URL
    if not api_base.endswith("/"):
        api_base += "/"
    api_url = f"{api_base}api/coverage/test-case-coverage/Get-Requirement-Coverage"
    
    try:
        response = session.get(api_url, verify=False)
        if response.status_code == 200:
            data = response.json()
            
            # Save the JSON file
            static_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
            json_file_path = os.path.join(static_folder, "SREQ.json")
            
            with open(json_file_path, 'w') as file:
                json.dump(data, file, indent=4)
                
            log_message(f"SREQ.json updated successfully. Size: {len(data)} records")
            return True
        else:
            log_message(f"Failed to update requirement coverage. Status code: {response.status_code}", "error")
            return False
    except Exception as ex:
        log_message(f"Error updating requirement coverage: {str(ex)}", "error")
        return False

def main():
    """Main function to update both JSON files."""
    log_message("=" * 50)
    log_message(f"Starting scheduled update at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Disable SSL warnings
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    
    # Login
    session = login()
    if not session:
        log_message("Exiting due to login failure", "error")
        return
    
    # Update IER coverage
    ier_success = update_ier_coverage(session)
    
    # Update requirement coverage
    req_success = update_requirement_coverage(session)
    
    # Log summary
    if ier_success and req_success:
        log_message("Scheduled update completed successfully")
    else:
        log_message("Scheduled update completed with errors", "warning")
    
    log_message("=" * 50)

if __name__ == "__main__":
    main()
