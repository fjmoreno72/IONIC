"""
IOCore2-specific API client implementation.
"""
import json
import logging
import time
from datetime import datetime
from typing import Dict, Any, Optional, Tuple

import requests
from requests.exceptions import HTTPError # Import HTTPError
from bs4 import BeautifulSoup

from app.api.client import ApiClient
from app.core.exceptions import ApiRequestError, InvalidSession, DataFormatError
from app.config import settings
from app.utils.file_operations import write_json_file, write_markdown_file, get_dynamic_data_path, read_json_file # Imported read_json_file

class IOCore2ApiClient(ApiClient):
    """Client for interacting with the IOCore2 API."""

    def __init__(self, base_url: str = None, cookies: Optional[Dict[str, str]] = None):
        """
        Initialize the IOCore2 API client.

        Args:
            base_url: Base URL for the IOCore2 API (defaults to settings.DEFAULT_URL)
            cookies: Dictionary of cookies from a valid session
        """
        super().__init__(
            base_url=base_url or settings.DEFAULT_URL,
            cookies=cookies
        )

    def login(self, username: str, password: str) -> Dict[str, Any]:
        """
        Log in to IOCore2 and obtain session cookies.

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
            # Get login page to extract verification token
            login_page_response = self.session.get(
                login_url,
                verify=self.verify_ssl
            )

            login_page_content = login_page_response.text
            html_document = BeautifulSoup(login_page_content, 'html.parser')
            verification_token_node = html_document.find('input', {'name': '__RequestVerificationToken'})

            if not verification_token_node:
                raise ApiRequestError(
                    message="Failed to retrieve verification token from login page",
                    details={"url": login_url}
                )

            verification_token = verification_token_node.get('value', '')

            # Perform login
            login_data = {
                'username': username,
                'password': password,
                '__RequestVerificationToken': verification_token
            }

            response = self.session.post(
                login_url,
                data=login_data,
                verify=self.verify_ssl,
                timeout=self.timeout
            )

            # Check if login was successful
            attempt_page_content = response.text
            attempt_html_document = BeautifulSoup(attempt_page_content, 'html.parser')
            form = attempt_html_document.find('form', {'action': '/Account/LogOff'})

            if form is not None:
                # Login successful
                return {
                    'success': True,
                    'cookies': self.get_cookies()
                }
            else:
                # Login failed
                return {
                    'success': False,
                    'error': 'Invalid credentials'
                }

        except Exception as ex:
            logging.error(f"Login error: {str(ex)}")
            raise ApiRequestError(
                message=f"Login failed: {str(ex)}",
                details={"url": login_url}
            )

    def get_ier_coverage(self, environment: str) -> Dict[str, Any]:
        """
        Get IER coverage data from IOCore2.

        Args:
            environment: The environment ('ciav' or 'cwix') to use for saving data.

        Returns:
            Dictionary with success status and markdown content

        Raises:
            ApiRequestError: If API request fails
            InvalidSession: If session is expired
        """
        api_url = "api/coverage/test-case-coverage/Get-Ier-Coverage"

        logging.info(f"Getting IER coverage data from {api_url}")
        start_time = datetime.now()

        # Make request with streaming enabled
        response = self.get(api_url, stream=True)

        try:
            # Stream and process response
            content = self.stream_response(response, start_time)
            data = json.loads(content)

            # Save to file using dynamic path based on the provided environment
            json_file_path = get_dynamic_data_path("IER.json", environment=environment)
            markdown_file_path = get_dynamic_data_path("IER.md", environment=environment)

            # Save JSON data
            write_json_file(data, json_file_path)

            # Process and save markdown
            from app.data_models.ier_analysis import analyze_ier_data, generate_ier_markdown_output # Corrected import path
            hierarchy = analyze_ier_data(data)
            markdown_content = generate_ier_markdown_output(hierarchy)
            write_markdown_file(markdown_content, markdown_file_path)

            # Return success response
            end_time = datetime.now()
            total_duration = (end_time - start_time).total_seconds()

            return {
                'success': True,
                'count': len(data) if isinstance(data, list) else 0,
                'duration': total_duration,
                'data': data
            }

        except json.JSONDecodeError as e:
            logging.error(f"Error parsing IER coverage response: {str(e)}")
            raise DataFormatError(
                message=f"Invalid JSON response: {str(e)}",
                details={"url": api_url}
            )

    def get_requirement_coverage(self, environment: str) -> Dict[str, Any]:
        """
        Get SREQ coverage data from IOCore2.

        Args:
            environment: The environment ('ciav' or 'cwix') to use for saving data.

        Returns:
            Dictionary with success status and data

        Raises:
            ApiRequestError: If API request fails
            InvalidSession: If session is expired
        """
        api_url = "api/coverage/test-case-coverage/Get-Requirement-Coverage"

        logging.info(f"Getting SREQ coverage data from {api_url}")
        start_time = datetime.now()

        # Make request with streaming enabled
        response = self.get(api_url, stream=True)

        try:
            # Stream and process response
            content = self.stream_response(response, start_time)
            data = json.loads(content)

            # Save to file using dynamic path based on the provided environment
            json_file_path = get_dynamic_data_path("SREQ.json", environment=environment)
            markdown_file_path = get_dynamic_data_path("SREQ.md", environment=environment)

            # Save JSON data
            write_json_file(data, json_file_path)

            # Process and save markdown
            from app.data_models.sreq_analysis import extract_null_testcase_entries, organize_hierarchical_data, generate_markdown # Corrected import path
            null_entries = extract_null_testcase_entries(data)
            hierarchy = organize_hierarchical_data(null_entries)
            markdown_content = generate_markdown(hierarchy)
            write_markdown_file(markdown_content, markdown_file_path)

            # Return success response
            end_time = datetime.now()
            total_duration = (end_time - start_time).total_seconds()

            return {
                'success': True,
                'count': len(data) if isinstance(data, list) else 0,
                'duration': total_duration,
                'data': data
            }

        except json.JSONDecodeError as e:
            logging.error(f"Error parsing SREQ coverage response: {str(e)}")
            raise DataFormatError(
                message=f"Invalid JSON response: {str(e)}",
                details={"url": api_url}
            )

    def get_test_cases(self, environment: str) -> Dict[str, Any]:
        """
        Get test case data from IOCore2.

        Args:
            environment: The environment ('ciav' or 'cwix') to use for saving data.

        Returns:
            Dictionary with success status and data

        Raises:
            ApiRequestError: If API request fails
            InvalidSession: If session is expired
        """
        api_url = "api/test-cases"

        logging.info(f"Getting test cases data from {api_url}")
        start_time = datetime.now()

        # Make request
        response = self.get(api_url)

        try:
            # Parse response
            data = response.json()

            # Save to file using dynamic path based on the provided environment
            json_file_path = get_dynamic_data_path("test_cases.json", environment=environment)
            write_json_file(data, json_file_path)

            # Return success response
            end_time = datetime.now()
            total_duration = (end_time - start_time).total_seconds()

            return {
                'success': True,
                'count': len(data) if isinstance(data, list) else 0,
                'duration': total_duration,
                'data': data
            }

        except ValueError as e:
            logging.error(f"Error parsing test cases response: {str(e)}")
            raise DataFormatError(
                message=f"Invalid JSON response: {str(e)}",
                details={"url": api_url}
            )

    def get_test_results(self, environment: str) -> Dict[str, Any]:
        """
        Get test results data from IOCore2.

        Args:
            environment: The environment ('ciav' or 'cwix') to use for saving data.

        Returns:
            Dictionary with success status and data

        Raises:
            ApiRequestError: If API request fails
            InvalidSession: If session is expired
        """
        api_url = "api/public/test-results"

        logging.info(f"Getting test results data from {api_url}")
        start_time = datetime.now()

        # Make request
        response = self.get(api_url)

        try:
            # Parse response
            data = response.json()

            # Save to file using dynamic path based on the provided environment
            json_file_path = get_dynamic_data_path("test_results.json", environment=environment)
            write_json_file(data, json_file_path)

            # After successfully getting test results, get objectives and participants
            try:
                logging.info(f"Attempting to fetch objectives after test results for environment: {environment}")
                self.get_objectives(environment=environment)
                
                # After getting objectives, get participants
                logging.info(f"Attempting to fetch participants after objectives for environment: {environment}")
                self.get_participants(environment=environment)
            except Exception as obj_err:
                # Log the error but don't fail the overall operation for test results
                logging.error(f"Failed to get objectives or participants after getting test results: {str(obj_err)}")

            # Return success response for test results
            end_time = datetime.now()
            total_duration = (end_time - start_time).total_seconds()
            
            return {
                'success': True,
                'count': len(data) if isinstance(data, list) else 0,
                'duration': total_duration,
                'data': data
            }
            
        except ValueError as e:
            logging.error(f"Error parsing test results response: {str(e)}")
            raise DataFormatError(
                message=f"Invalid JSON response: {str(e)}",
                details={"url": api_url}
            )

    def get_participants(self, environment: str) -> Dict[str, Any]:
        """
        Get participants data from IOCore2.

        Args:
            environment: The environment ('ciav' or 'cwix') to use for saving data.

        Returns:
            Dictionary with success status and data

        Raises:
            ApiRequestError: If API request fails
            InvalidSession: If session is expired
            DataFormatError: If response is not valid JSON
        """
        api_url = "api/participants"

        logging.info(f"Getting participants data from {api_url} for environment {environment}")
        start_time = datetime.now()

        # Make request
        response = self.get(api_url)

        try:
            # Parse response
            data = response.json()

            # Save to file using dynamic path based on the provided environment
            json_file_path = get_dynamic_data_path("participants.json", environment=environment)
            write_json_file(data, json_file_path)

            # Return success response
            end_time = datetime.now()
            total_duration = (end_time - start_time).total_seconds()
            count = len(data) if isinstance(data, list) else 0
            logging.info(f"Participants data fetched and saved successfully in {total_duration:.2f}s, count: {count}")

            return {
                'success': True,
                'count': count,
                'duration': total_duration,
                'data': data
            }

        except ValueError as e: # Catches JSONDecodeError
            logging.error(f"Error parsing participants response: {str(e)}")
            raise DataFormatError(
                message=f"Invalid JSON response from participants API: {str(e)}",
                details={"url": api_url}
            )
        # ApiRequestError (like InvalidSession) raised by self.get() will be caught by the caller (Flask route)
        except Exception as e:
             logging.exception(f"Unexpected error during participants fetch or processing: {str(e)}")
             # Wrap other unexpected errors for consistent handling in the route
             raise ApiRequestError(
                 message=f"Unexpected error processing participants response: {str(e)}",
                 details={"url": api_url}
             )
             
    def get_objectives(self, environment: str) -> Dict[str, Any]:
        """
        Get objectives data from IOCore2.

        Args:
            environment: The environment ('ciav' or 'cwix') to use for saving data.

        Returns:
            Dictionary with success status and data

        Raises:
            ApiRequestError: If API request fails
            InvalidSession: If session is expired
            DataFormatError: If response is not valid JSON
        """
        api_url = "api/objectives"

        logging.info(f"Getting objectives data from {api_url} for environment {environment}")
        start_time = datetime.now()

        # Make request
        response = self.get(api_url)

        try:
            # Parse response
            data = response.json()

            # Save to file using dynamic path based on the provided environment
            json_file_path = get_dynamic_data_path("objectives.json", environment=environment)
            write_json_file(data, json_file_path)

            # Return success response
            end_time = datetime.now()
            total_duration = (end_time - start_time).total_seconds()
            count = len(data) if isinstance(data, list) else 0
            logging.info(f"Objectives data fetched and saved successfully in {total_duration:.2f}s, count: {count}")

            return {
                'success': True,
                'count': count,
                'duration': total_duration,
                'data': data
            }

        except ValueError as e: # Catches JSONDecodeError
            logging.error(f"Error parsing objectives response: {str(e)}")
            raise DataFormatError(
                message=f"Invalid JSON response from objectives API: {str(e)}",
                details={"url": api_url}
            )
        # ApiRequestError (like InvalidSession) raised by self.get() will be caught by the caller (Flask route)
        except Exception as e:
             logging.exception(f"Unexpected error during objectives fetch or processing: {str(e)}")
             # Wrap other unexpected errors for consistent handling in the route
             raise ApiRequestError(
                 message=f"Unexpected error processing objectives response: {str(e)}",
                 details={"url": api_url}
             )

    def get_patterns(self, environment: str) -> Dict[str, Any]:
        """
        Get test case patterns data from IOCore2.

        Args:
            environment: The environment ('ciav' or 'cwix') to use for saving data.

        Returns:
            Dictionary with success status and data

        Raises:
            ApiRequestError: If API request fails
            InvalidSession: If session is expired
        """
        # For compatibility: use the same endpoint approach as test cases
        api_url = "api/test-cases"
        pattern_url = "api/test-cases/patterns"

        logging.info(f"Attempting to get test case patterns data from {pattern_url}")
        start_time = datetime.now()

        try:
            # First try the patterns endpoint
            logging.debug(f"Making GET request to {pattern_url}")
            response = self.get(pattern_url)

            logging.info(f"Got response from patterns endpoint with status: {response.status_code}")

            # Parse response
            data = response.json()
            logging.info(f"Successfully parsed response JSON from patterns endpoint")

            # If we made it here, we've successfully retrieved the patterns data

            # Create an empty list if no patterns exist
            if data is None:
                logging.warning("Received null data from patterns endpoint, using empty list instead")
                data = []

            # Save to file using dynamic path based on the provided environment
            json_file_path = get_dynamic_data_path("pattern.json", environment=environment)
            logging.info(f"Saving patterns data to {json_file_path}")
            write_json_file(data, json_file_path)
            logging.info(f"Patterns data successfully saved to {json_file_path}")

            # Return success response
            end_time = datetime.now()
            total_duration = (end_time - start_time).total_seconds()

            count = len(data) if isinstance(data, list) else 0
            logging.info(f"Patterns operation completed in {total_duration:.2f}s, count: {count}")

            return {
                'success': True,
                'count': count,
                'duration': total_duration,
                'data': data
            }

        except ApiRequestError as e:
            # If the patterns endpoint fails, create an empty file to initialize the system
            logging.warning(f"API request error: {str(e)}. Creating empty pattern file.")

            # Create empty file using dynamic path based on the provided environment
            json_file_path = get_dynamic_data_path("pattern.json", environment=environment)
            # Create an empty array as the initial patterns files
            empty_data = []
            write_json_file(empty_data, json_file_path)
            logging.info(f"Created empty pattern file at {json_file_path}")
            return {
                'success': True,
                'count': 0,
                'duration': (datetime.now() - start_time).total_seconds(),
                'message': 'Created empty patterns file',
                'data': empty_data
            }

        except ValueError as e:
            logging.error(f"Error parsing patterns response: {str(e)}")
            raise DataFormatError(
                message=f"Invalid JSON response: {str(e)}",
                details={"url": pattern_url}
            )
        except Exception as e:
            logging.exception(f"Unexpected error getting patterns: {str(e)}")
            raise

    def get_actors(self, environment: str) -> Dict[str, Any]:
        """
        Get test case actors data from IOCore2.

        Args:
            environment: The environment ('ciav' or 'cwix') to use for saving data.

        Returns:
            Dictionary with success status and data

        Raises:
            ApiRequestError: If API request fails
            InvalidSession: If session is expired
        """
        # For compatibility: use the same endpoint approach as test cases
        actor_url = "api/test-cases/actors"

        logging.info(f"Attempting to get test case actors data from {actor_url}")
        start_time = datetime.now()

        try:
            # First try the actors endpoint
            logging.debug(f"Making GET request to {actor_url}")
            response = self.get(actor_url)

            logging.info(f"Got response from actors endpoint with status: {response.status_code}")

            # Parse response
            data = response.json()
            logging.info(f"Successfully parsed response JSON from actors endpoint")

            # If we made it here, we've successfully retrieved the actors data

            # Create an empty list if no actors exist
            if data is None:
                logging.warning("Received null data from actors endpoint, using empty list instead")
                data = []

            # Save to file using dynamic path based on the provided environment
            json_file_path = get_dynamic_data_path("actors.json", environment=environment)
            logging.info(f"Saving actors data to {json_file_path}")
            write_json_file(data, json_file_path)
            logging.info(f"Actors data successfully saved to {json_file_path}")

            # Return success response
            end_time = datetime.now()
            total_duration = (end_time - start_time).total_seconds()

            count = len(data) if isinstance(data, list) else 0
            logging.info(f"Actors operation completed in {total_duration:.2f}s, count: {count}")

            return {
                'success': True,
                'count': count,
                'duration': total_duration,
                'data': data
            }

        except ApiRequestError as e:
            # If the actors endpoint fails, create an empty file to initialize the system
            logging.warning(f"API request error: {str(e)}. Creating empty actors file.")

            # Create empty file using dynamic path based on the provided environment
            json_file_path = get_dynamic_data_path("actors.json", environment=environment)
            # Create an empty array as the initial actors file
            empty_data = []
            write_json_file(empty_data, json_file_path)
            logging.info(f"Created empty actors file at {json_file_path}")
            return {
                'success': True,
                'count': 0,
                'duration': (datetime.now() - start_time).total_seconds(),
                'message': 'Created empty actors file',
                'data': empty_data
            }

        except ValueError as e:
            logging.error(f"Error parsing actors response: {str(e)}")
            raise DataFormatError(
                message=f"Invalid JSON response: {str(e)}",
                details={"url": actor_url}
            )
        except Exception as e:
            logging.exception(f"Unexpected error getting actors: {str(e)}")
            raise

    def get_system_health(self) -> Tuple[Dict[str, Any], float]:
        """
        Get system health data from IOCore2 /api/system/health endpoint.

        Returns:
            Tuple containing:
                - Dictionary with health data
                - Request time in milliseconds

        Raises:
            ApiRequestError: If API request fails
            InvalidSession: If session is expired
            DataFormatError: If response is not valid JSON
        """
        api_url = "api/system/health"
        logging.info(f"Getting system health data from {api_url}")
        
        try:
            # Make request
            start_time = datetime.now()
            response = self.get(api_url) # Use the base class get method
            end_time = datetime.now()
            # Parse response
            data = response.json()

            # Calculate request time
            #end_time = datetime.now()
            total_duration = (end_time - start_time).total_seconds()
            print(f"System health data fetched in {total_duration:.2f}s")
            request_time_ms = round(total_duration * 1000, 2)  # Convert to milliseconds
            logging.info(f"System health data fetched in {request_time_ms:.2f}ms")

            # Return both the data and request time
            return data, request_time_ms

        except HTTPError as e:
            # Calculate request time even for errors
            end_time = datetime.now()
            total_duration = (end_time - start_time).total_seconds()
            request_time_ms = round(total_duration * 1000, 2)  # Convert to milliseconds
            logging.warning(f"HTTP error response received in {request_time_ms:.2f}ms")
            
            # Specifically handle 503 errors, attempting to parse the body
            if e.response.status_code == 503:
                logging.warning(f"Received 503 status from {api_url}. Attempting to parse body.")
                try:
                    error_data = e.response.json()
                    logging.warning(f"Parsed 503 response body: {error_data}")
                    # Return the parsed error data, let the frontend decide how to display it
                    # Add a flag to indicate it was a 503 error
                    error_data['is_503_error'] = True
                    error_data['status_code'] = 503
                    return error_data, request_time_ms
                except ValueError: # Handles JSONDecodeError if 503 body isn't JSON
                    logging.error(f"Failed to parse JSON from 503 response body: {e.response.text}")
                    raise ApiRequestError(
                        message=f"API returned 503 Service Unavailable, and response body was not valid JSON.",
                        details={"url": api_url, "status_code": 503, "response_text": e.response.text[:500]} # Limit response text length
                    )
            else:
                # Re-raise other HTTP errors normally (will be caught by base class .get/.post)
                logging.error(f"HTTP error getting system health: {e.response.status_code} - {e.response.text[:200]}")
                raise # Let the base class handler convert this to ApiRequestError

        except ValueError as e: # Handles JSONDecodeError for non-HTTPError cases (e.g., 2xx response with bad JSON)
            logging.error(f"Error parsing system health response (non-HTTPError): {str(e)}")
            raise DataFormatError(
                message=f"Invalid JSON response from system health API: {str(e)}",
                details={"url": api_url}
            )
        # ApiRequestError (like InvalidSession) raised by self.get() or HTTPError handling will be caught by the caller (Flask route)
        except Exception as e:
             logging.exception(f"Unexpected error during system health fetch or processing: {str(e)}")
             # Wrap other unexpected errors for consistent handling in the route
             raise ApiRequestError(
                 message=f"Unexpected error processing system health response: {str(e)}",
                 details={"url": api_url}
             )

    def get_participant_key_by_name(self, name: str, environment: str) -> Optional[str]:
        """
        Lookup participant ID by name from saved participants.json.
        """
        json_file_path = get_dynamic_data_path("participants.json", environment=environment)
        data = read_json_file(json_file_path)
        for p in data:
            if p.get("name") == name:
                return p.get("key")
        return None

    def get_participant_name_by_key(self, participant_key: str, environment: str) -> Optional[str]:
        """
        Lookup participant name by key from saved participants.json.
        """
        json_file_path = get_dynamic_data_path("participants.json", environment=environment)
        data = read_json_file(json_file_path)
        for p in data:
            if p.get("key") == participant_key:
                return p.get("name")
        return None

    def get_test_results_new(self, environment: str) -> Dict[str, Any]:
        """
        Get test results data from IOCore2 using the new job-based API with token authentication and polling.

        Args:
            environment: The environment ('ciav' or 'cwix') to use for saving data.

        Returns:
            Dictionary with success status and data

        Raises:
            ApiRequestError: If API request fails
            InvalidSession: If session is expired
        """
        export_url = "api/public/feed/Export"

        logging.info("=" * 60)
        logging.info("STARTING NEW TEST RESULTS API (Job-based)")
        logging.info("=" * 60)
        logging.info(f"Base URL: {self.base_url}")
        logging.info(f"Export endpoint: {export_url}")
        logging.info(f"Environment: {environment}")
        start_time = datetime.now()
        logging.info(f"Start time: {start_time}")

        try:
            # Step 1: Note - using session-based authentication (existing login cookies)
            # The new API should ideally use token auth, but for compatibility 
            # we'll use the existing session authentication
            logging.info("=== STEP 1: Authentication ===")
            logging.info("Using session-based authentication for new API")
            logging.info(f"Session cookies available: {len(self.session.cookies)} cookies")

            # Step 2: Start the export job
            start_request_body = {
                "$type": "Schema",
                "schema": "TestExecutionReport", 
                "checkOnly": True
            }

            logging.info("=== STEP 2: Starting export job for TestExecutionReport ===")
            logging.info(f"Request body: {start_request_body}")
            logging.info(f"Endpoint: {export_url}")
            
            step2_start = datetime.now()
            start_response = self.post(
                export_url,
                json=start_request_body
            )
            step2_duration = (datetime.now() - step2_start).total_seconds()
            
            logging.info(f"Export job start request completed in {step2_duration:.2f} seconds")
            logging.info(f"Response status: {start_response.status_code}")
            
            start_result = start_response.json()
            logging.info(f"Start response: {start_result}")
            
            job_id = start_result["jobId"]
            logging.info(f"=== Export job started with ID: {job_id} ===")

            # Step 3: Poll for job completion
            check_status_body = {
                "$type": "Job",
                "jobId": job_id,
                "checkOnly": True
            }

            logging.info("=== STEP 3: Starting job polling ===")
            logging.info(f"Status check body: {check_status_body}")
            
            max_attempts = 60  # Maximum 5 minutes (60 * 5 seconds)
            attempt = 0
            polling_start_time = datetime.now()
            
            while attempt < max_attempts:
                attempt_start = datetime.now()
                elapsed_total = (attempt_start - polling_start_time).total_seconds()
                
                logging.info(f"=== Polling attempt {attempt + 1}/{max_attempts} (Total elapsed: {elapsed_total:.1f}s) ===")
                
                status_response = self.post(
                    export_url,
                    json=check_status_body
                )
                
                request_duration = (datetime.now() - attempt_start).total_seconds()
                logging.info(f"Status check request took {request_duration:.2f} seconds")

                status_result = status_response.json()
                logging.info(f"Status response: {status_result}")
                
                status = status_result["status"]
                logging.info(f"*** Current job status: {status} ***")

                if status == "Completed":
                    total_polling_time = (datetime.now() - polling_start_time).total_seconds()
                    logging.info(f"*** JOB COMPLETED! Total polling time: {total_polling_time:.2f} seconds ***")
                    break
                elif status in ("Failed", "Cancelled"):
                    logging.error(f"Job failed with status: {status}")
                    logging.error(f"Full status response: {status_result}")
                    raise ApiRequestError(
                        message=f"Job failed with status: {status}",
                        details={"job_id": job_id, "status": status, "response": status_result}
                    )
                elif status not in ("Processing", "Pending"):
                    logging.warning(f"Unexpected job status: {status} - continuing anyway")
                
                # Wait before checking again
                logging.info("Waiting 5 seconds before next status check...")
                time.sleep(5)
                attempt += 1

            if attempt >= max_attempts:
                total_polling_time = (datetime.now() - polling_start_time).total_seconds()
                logging.error(f"Job polling TIMEOUT after {total_polling_time:.2f} seconds ({max_attempts} attempts)")
                raise ApiRequestError(
                    message=f"Job polling timeout - job did not complete within expected time ({total_polling_time:.2f}s)",
                    details={"job_id": job_id, "max_attempts": max_attempts, "total_time": total_polling_time}
                )

            # Step 4: Download the results
            final_request_body = {
                "$type": "Download",
                "jobId": job_id
            }

            logging.info("=== STEP 4: Downloading job results ===")
            logging.info(f"Download request body: {final_request_body}")
            
            download_start = datetime.now()
            download_response = self.post(
                export_url,
                json=final_request_body
            )
            download_duration = (datetime.now() - download_start).total_seconds()
            
            logging.info(f"Download request completed in {download_duration:.2f} seconds")
            logging.info(f"Download response status: {download_response.status_code}")

            # Parse the final results
            parse_start = datetime.now()
            data = download_response.json()
            parse_duration = (datetime.now() - parse_start).total_seconds()
            
            data_size = len(str(data)) if data else 0
            logging.info(f"JSON parsing completed in {parse_duration:.2f} seconds")
            logging.info(f"Response data size: {data_size} characters")
            logging.info("*** Successfully downloaded and parsed job results ***")

            # Save to file using dynamic path based on the provided environment
            json_file_path = get_dynamic_data_path("test_results.json", environment=environment)
            write_json_file(data, json_file_path)
            logging.info(f"Saved new test results to {json_file_path}")

            # After successfully getting test results, get objectives and participants
            try:
                logging.info(f"Attempting to fetch objectives after test results for environment: {environment}")
                self.get_objectives(environment=environment)
                
                # After getting objectives, get participants
                logging.info(f"Attempting to fetch participants after objectives for environment: {environment}")
                self.get_participants(environment=environment)
            except Exception as obj_err:
                # Log the error but don't fail the overall operation for test results
                logging.error(f"Failed to get objectives or participants after getting test results: {str(obj_err)}")

            # Return success response for test results
            end_time = datetime.now()
            total_duration = (end_time - start_time).total_seconds()
            data_count = len(data) if isinstance(data, list) else 0
            
            logging.info("=" * 60)
            logging.info("NEW TEST RESULTS API COMPLETED SUCCESSFULLY")
            logging.info("=" * 60)
            logging.info(f"Total execution time: {total_duration:.2f} seconds")
            logging.info(f"Data records count: {data_count}")
            logging.info(f"Job ID: {job_id}")
            logging.info(f"File saved to: {json_file_path}")
            logging.info("=" * 60)
            
            return {
                'success': True,
                'count': data_count,
                'duration': total_duration,
                'data': data,
                'job_id': job_id
            }
            
        except ValueError as e:
            error_time = datetime.now()
            elapsed_time = (error_time - start_time).total_seconds()
            logging.error("=" * 60)
            logging.error("JSON PARSING ERROR in new test results API")
            logging.error("=" * 60)
            logging.error(f"Error after {elapsed_time:.2f} seconds: {str(e)}")
            logging.error("=" * 60)
            raise DataFormatError(
                message=f"Invalid JSON response: {str(e)}",
                details={"endpoint": export_url, "elapsed_time": elapsed_time}
            )
        except Exception as e:
            error_time = datetime.now()
            elapsed_time = (error_time - start_time).total_seconds()
            logging.error("=" * 60)
            logging.error("GENERAL ERROR in new test results API")
            logging.error("=" * 60)
            logging.error(f"Error after {elapsed_time:.2f} seconds: {str(e)}")
            logging.error(f"Error type: {type(e).__name__}")
            logging.exception("Full traceback:")
            logging.error("=" * 60)
            raise ApiRequestError(
                message=f"Failed to get test results using new API: {str(e)}",
                details={"endpoint": export_url, "elapsed_time": elapsed_time, "error_type": type(e).__name__}
            )
