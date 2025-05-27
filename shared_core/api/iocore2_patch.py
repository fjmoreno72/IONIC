"""
Patch module for IOCore2ApiClient with enhanced login capabilities.
This improves token extraction and adds more robust error handling.
"""
import re
import logging
from typing import Dict, Any, Optional, Tuple
import requests
from bs4 import BeautifulSoup

from app.api.iocore2 import IOCore2ApiClient
from app.core.exceptions import ApiRequestError

class EnhancedIOCore2ApiClient(IOCore2ApiClient):
    """Enhanced IOCore2 API client with more robust login handling."""
    
    def login(self, username: str, password: str) -> Dict[str, Any]:
        """
        Enhanced login method for IOCore2 with better token extraction and error handling.
        
        Args:
            username: User's username
            password: User's password
            
        Returns:
            Dictionary with login result
            
        Raises:
            ApiRequestError: If login fails
        """
        if not self.base_url.endswith("/"):
            self.base_url += "/"

        login_url = f"{self.base_url}IdentityManagement/Account/Login?ReturnUrl=%2FHome"
        
        try:
            # Add browser-like headers to mimic a real browser
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            }
            
            # Add headers to session
            for key, value in headers.items():
                self.session.headers.update({key: value})
            
            # Get login page with enhanced error handling (disable SSL verification for NATO environments)
            login_page_response = self.session.get(
                login_url,
                verify=False,  # NATO servers often use internal CAs
                timeout=self.timeout
            )
            
            # Check response status
            if login_page_response.status_code != 200:
                raise ApiRequestError(
                    message=f"Login page returned status code {login_page_response.status_code}",
                    details={"url": login_url, "status_code": login_page_response.status_code}
                )
                
            # Check content type
            content_type = login_page_response.headers.get('Content-Type', '')
            if 'text/html' not in content_type.lower():
                raise ApiRequestError(
                    message=f"Login page returned non-HTML content type: {content_type}",
                    details={"url": login_url, "content_type": content_type}
                )
                
            # Check if redirected from the login URL (can indicate security measures)
            if login_page_response.url != login_url:
                logging.warning(f"Redirected from login URL to: {login_page_response.url}")
                # Continue anyway - the redirect might still have the login form
            
            login_page_content = login_page_response.text
            
            # Try multiple verification token extraction methods
            verification_token, token_source = self._extract_verification_token(login_page_content, login_url)
            
            if not verification_token:
                logging.error("All verification token extraction methods failed")
                raise ApiRequestError(
                    message="Failed to retrieve verification token from login page",
                    details={"url": login_url, "content_size": len(login_page_content)}
                )
                
            logging.info(f"Found verification token using method: {token_source}")
            
            # Prepare login data with the extracted token
            login_data = {
                'username': username,
                'password': password,
                '__RequestVerificationToken': verification_token
            }
            
            # Try to find additional form fields that might be required
            additional_fields = self._extract_additional_form_fields(login_page_content)
            login_data.update(additional_fields)
            
            # Perform login with enhanced error handling
            response = self.session.post(
                login_url,
                data=login_data,
                verify=False,  # Disable SSL verification for NATO environments
                timeout=self.timeout,
                allow_redirects=True  # Follow redirects to handle security measures
            )
            
            # Check if login was successful - more thorough checks
            success = self._check_login_success(response)
            
            if success:
                logging.info(f"User {username} authenticated successfully")
                return {
                    'success': True,
                    'cookies': self.get_cookies(),
                    'url': self.base_url
                }
            else:
                logging.warning(f"Authentication failed for user {username}")
                return {
                    'success': False,
                    'error': 'Invalid credentials or login denied'
                }
                
        except Exception as ex:
            logging.error(f"Login error: {str(ex)}")
            raise ApiRequestError(
                message=f"Login failed: {str(ex)}",
                details={"url": login_url}
            )
    
    def _extract_verification_token(self, html_content: str, url: str) -> Tuple[Optional[str], str]:
        """
        Extract verification token using multiple methods for robustness.
        
        Args:
            html_content: HTML content from the login page
            url: URL of the login page for error context
            
        Returns:
            Tuple of (token value or None, extraction method used)
        """
        # Method 1: Use BeautifulSoup parser (original method)
        try:
            html_document = BeautifulSoup(html_content, 'html.parser')
            verification_token_node = html_document.find('input', {'name': '__RequestVerificationToken'})
            
            if verification_token_node:
                token = verification_token_node.get('value', '')
                if token:
                    return token, "BeautifulSoup input tag"
        except Exception as e:
            logging.warning(f"BeautifulSoup token extraction failed: {str(e)}")
        
        # Method 2: Try BeautifulSoup with different input selectors
        try:
            html_document = BeautifulSoup(html_content, 'html.parser')
            form = html_document.find('form', {'method': 'post'})
            if form:
                token_input = form.find('input', {'name': '__RequestVerificationToken'})
                if token_input:
                    token = token_input.get('value', '')
                    if token:
                        return token, "BeautifulSoup form + input"
        except Exception as e:
            logging.warning(f"BeautifulSoup form search token extraction failed: {str(e)}")
        
        # Method 3: Use regular expressions
        try:
            pattern = r'<input\s+[^>]*name\s*=\s*["\']__RequestVerificationToken["\'][^>]*value\s*=\s*["\'](.*?)["\'][^>]*>'
            matches = re.findall(pattern, html_content)
            if matches and matches[0]:
                return matches[0], "regex input tag"
        except Exception as e:
            logging.warning(f"Regex token extraction failed: {str(e)}")
            
        # Method 4: Try to find token in any meta tag or hidden field
        try:
            html_document = BeautifulSoup(html_content, 'html.parser')
            meta_token = html_document.find('meta', {'name': 'RequestVerificationToken'})
            if meta_token:
                token = meta_token.get('content', '')
                if token:
                    return token, "meta tag"
        except Exception as e:
            logging.warning(f"Meta tag token extraction failed: {str(e)}")
            
        # Method 5: Try to find token in JavaScript variables
        try:
            pattern = r'var\s+requestVerificationToken\s*=\s*["\']([^"\']+)["\']'
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            if matches and matches[0]:
                return matches[0], "JavaScript variable"
        except Exception as e:
            logging.warning(f"JavaScript token extraction failed: {str(e)}")
            
        # No token found with any method
        return None, "none"
        
    def _extract_additional_form_fields(self, html_content: str) -> Dict[str, str]:
        """
        Extract additional hidden form fields that might be required for login.
        
        Args:
            html_content: HTML content from the login page
            
        Returns:
            Dictionary of field name-value pairs
        """
        additional_fields = {}
        
        try:
            html_document = BeautifulSoup(html_content, 'html.parser')
            login_form = None
            
            # Try to find the login form
            for form in html_document.find_all('form'):
                # Common login form identifiers
                if (form.get('action', '').lower().endswith('login') or 
                    'login' in form.get('id', '').lower() or 
                    'login' in form.get('class', [])):
                    login_form = form
                    break
            
            if not login_form:
                # If no specific login form found, use the first form
                login_form = html_document.find('form')
            
            if login_form:
                # Find all hidden inputs except the verification token
                for hidden_field in login_form.find_all('input', {'type': 'hidden'}):
                    field_name = hidden_field.get('name')
                    field_value = hidden_field.get('value', '')
                    
                    if field_name and field_name != '__RequestVerificationToken':
                        additional_fields[field_name] = field_value
                        logging.info(f"Found additional field: {field_name}")
        except Exception as e:
            logging.warning(f"Error extracting additional form fields: {str(e)}")
            
        return additional_fields
    
    def _check_login_success(self, response) -> bool:
        """
        Check if login was successful using multiple methods.
        
        Args:
            response: Response object from the login request
            
        Returns:
            True if login was successful, False otherwise
        """
        # Method 1: Check for specific logout form (original method)
        try:
            attempt_page_content = response.text
            attempt_html_document = BeautifulSoup(attempt_page_content, 'html.parser')
            logout_form = attempt_html_document.find('form', {'action': '/Account/LogOff'})
            
            if logout_form is not None:
                return True
        except Exception:
            pass
            
        # Method 2: Check for common success indicators in URL or content
        try:
            # Check if redirected to a page that's not the login page
            if 'login' not in response.url.lower():
                # Check if the response contains common dashboard elements
                if ('dashboard' in response.text.lower() or 
                    'welcome' in response.text.lower() or 
                    'logout' in response.text.lower()):
                    return True
        except Exception:
            pass
            
        # Method 3: Check for the absence of login errors
        try:
            attempt_html_document = BeautifulSoup(response.text, 'html.parser')
            error_elements = attempt_html_document.find_all(class_=lambda x: x and ('error' in x.lower() or 'alert' in x.lower()))
            
            # If there are no error elements and not on login page, likely successful
            if not error_elements and 'login' not in response.url.lower():
                return True
        except Exception:
            pass
            
        # Default to the original implementation's result
        try:
            attempt_html_document = BeautifulSoup(response.text, 'html.parser')
            login_form = attempt_html_document.find('form', {'action': lambda x: x and 'Login' in x})
            
            # If no login form is found, it's likely we're logged in
            return login_form is None
        except Exception:
            # Default to false if all checks fail
            return False
