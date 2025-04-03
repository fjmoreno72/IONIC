#!/usr/bin/env python3
"""
Diagnostic script to identify login page changes causing the verification token issue.
"""
import sys
import requests
from bs4 import BeautifulSoup
import logging
import argparse

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def diagnose_login_page(url, verify_ssl=False):
    """
    Diagnose issues with retrieving the verification token from the login page.
    
    Args:
        url: The base URL to the application
        verify_ssl: Whether to verify SSL certificates (default: False)
    """
    # Ensure proper URL format
    if not url.endswith("/"):
        url += "/"
    
    login_url = f"{url}IdentityManagement/Account/Login?ReturnUrl=%2FHome"
    
    logging.info(f"Attempting to access login page: {login_url}")
    
    # Create a session with customized headers
    session = requests.Session()
    
    # Add standard browser headers to mimic a real browser
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    try:
        # Try with regular request first
        response = session.get(login_url, headers=headers, verify=verify_ssl)
        logging.info(f"Status Code: {response.status_code}")
        
        # Check if redirected
        if response.url != login_url:
            logging.warning(f"Redirected to: {response.url}")
        
        # Log response headers
        logging.info("Response Headers:")
        for key, value in response.headers.items():
            logging.info(f"  {key}: {value}")
        
        # Check content type
        content_type = response.headers.get('Content-Type', '')
        logging.info(f"Content-Type: {content_type}")
        
        if 'text/html' not in content_type:
            logging.warning("Response is not HTML!")
            
        # Save the raw response content to a file
        with open('login_page_raw.html', 'wb') as f:
            f.write(response.content)
        logging.info("Raw response saved to login_page_raw.html")
            
        # Log response size
        content_size = len(response.content)
        logging.info(f"Response size: {content_size} bytes")
        
        # Try to parse with BeautifulSoup
        try:
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Look for the verification token
            token_input = soup.find('input', {'name': '__RequestVerificationToken'})
            
            if token_input:
                token_value = token_input.get('value', '')
                logging.info(f"Found verification token: {token_value[:10]}... (length: {len(token_value)})")
            else:
                logging.error("Verification token NOT FOUND")
                
                # Look for login form
                form = soup.find('form', {'action': lambda x: x and 'Login' in x})
                if form:
                    logging.info("Login form found, but no verification token inside.")
                    
                    # List all inputs in the form
                    inputs = form.find_all('input')
                    logging.info(f"Form has {len(inputs)} input fields:")
                    for i, input_elem in enumerate(inputs):
                        logging.info(f"  Input {i+1}: name='{input_elem.get('name')}', type='{input_elem.get('type')}'")
                else:
                    logging.error("No login form found!")
                    
                    # Check for any forms
                    all_forms = soup.find_all('form')
                    logging.info(f"Found {len(all_forms)} forms on the page")
                    
                    # Look for common security headers or meta tags
                    csp_meta = soup.find('meta', {'http-equiv': 'Content-Security-Policy'})
                    if csp_meta:
                        logging.info(f"CSP Meta tag found: {csp_meta['content']}")
                        
            # Save formatted HTML for inspection
            formatted_html = soup.prettify()
            with open('login_page_formatted.html', 'w', encoding='utf-8') as f:
                f.write(formatted_html)
            logging.info("Formatted HTML saved to login_page_formatted.html")
                
        except Exception as e:
            logging.error(f"Error parsing HTML: {str(e)}")
            
    except requests.RequestException as e:
        logging.error(f"Request error: {str(e)}")
    
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Diagnose login page verification token issues")
    parser.add_argument("url", help="The base URL of the application")
    parser.add_argument("--verify-ssl", action="store_true", help="Verify SSL certificates (default: False)")
    parser.add_argument("--no-verify-ssl", dest="verify_ssl", action="store_false", help="Do not verify SSL certificates (default)")
    parser.set_defaults(verify_ssl=False)
    args = parser.parse_args()
    
    logging.info(f"SSL Verification: {'Enabled' if args.verify_ssl else 'Disabled'}")
    diagnose_login_page(args.url, verify_ssl=args.verify_ssl)
