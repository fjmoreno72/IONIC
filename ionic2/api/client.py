"""
Base API client for external API calls.
"""
import logging
import time
from datetime import datetime
from typing import Dict, Any, Optional, Tuple, Union, List

import requests
from requests.exceptions import RequestException, Timeout

from ionic2.config import settings
from ionic2.core.exceptions import ApiRequestError, InvalidSession

class ApiClient:
    """Base API client for making HTTP requests."""
    
    def __init__(
        self, 
        base_url: str, 
        timeout: Optional[Tuple[int, int]] = None,
        verify_ssl: Optional[bool] = None,
        cookies: Optional[Dict[str, str]] = None
    ):
        """
        Initialize the API client.
        
        Args:
            base_url: Base URL for API endpoints
            timeout: Request timeout tuple (connect, read)
            verify_ssl: Whether to verify SSL certificates
            cookies: Dictionary of cookies to use for requests
        """
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout or settings.REQUEST_TIMEOUT
        
        # Determine SSL verification setting
        if hasattr(settings, 'CUSTOM_CA_BUNDLE') and settings.CUSTOM_CA_BUNDLE:
            # Use custom CA bundle if provided
            self.verify_ssl = settings.CUSTOM_CA_BUNDLE
            logging.info(f"Using custom CA bundle for SSL verification: {self.verify_ssl}")
        else:
            # Otherwise, use the VERIFY_SSL setting (True/False)
            self.verify_ssl = verify_ssl if verify_ssl is not None else settings.VERIFY_SSL
            if not self.verify_ssl:
                 logging.warning("SSL verification is disabled. This is insecure.")
            else:
                 logging.info("Using system default CAs for SSL verification.")

        self.session = requests.Session()
        
        if cookies:
            self.set_cookies(cookies)
            
        # Configure session for long-running requests
        self.session.headers.update({
            'Connection': 'keep-alive',
            'Keep-Alive': 'timeout=600, max=1000'
        })
    
    def set_cookies(self, cookies: Dict[str, str]) -> None:
        """
        Set session cookies.
        
        Args:
            cookies: Dictionary of cookies to set
        """
        self.session.cookies = requests.utils.cookiejar_from_dict(cookies)
    
    def get_cookies(self) -> Dict[str, str]:
        """
        Get current session cookies.
        
        Returns:
            Dictionary of cookies
        """
        return requests.utils.dict_from_cookiejar(self.session.cookies)
    
    def get(
        self, 
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        stream: bool = False
    ) -> requests.Response:
        """
        Make a GET request to the API.
        
        Args:
            endpoint: API endpoint (will be appended to base_url)
            params: URL parameters
            headers: Additional headers
            stream: Whether to stream the response
            
        Returns:
            Response object
            
        Raises:
            ApiRequestError: If the request fails
            InvalidSession: If the session is invalid
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        # Add common headers
        request_headers = {'Accept-Encoding': 'gzip, deflate'}
        if headers:
            request_headers.update(headers)
            
        start_time = datetime.now()
        logging.info(f"Making GET request to {url}")
        
        try:
            response = self.session.get(
                url,
                params=params,
                headers=request_headers,
                timeout=self.timeout,
                verify=self.verify_ssl,
                stream=stream
            )
            
            # Check for redirects which might indicate session expiration
            if response.status_code == 302:
                logging.error("Got redirect response (302), session likely expired")
                raise InvalidSession()
                
            # Check for successful response (allow 2xx range and 503 for specific handling later)
            if not (200 <= response.status_code < 300 or response.status_code == 503):
                raise ApiRequestError(
                    message=f"API request failed with status code: {response.status_code}",
                    status_code=response.status_code,
                    details={"url": url, "params": params}
                )
                
            # Validate response content type (only if not 503, as 503 might have error JSON)
            if response.status_code != 503:
                content_type = response.headers.get('content-type', '').lower()
                if 'text/html' in content_type:
                    logging.error("Got HTML response, session likely expired")
                    raise InvalidSession()
            # Removed duplicated content_type check block here
                
            return response
            
        except Timeout:
            logging.error(f"Request to {url} timed out after {self.timeout} seconds")
            raise ApiRequestError(
                message="Request timed out",
                status_code=504,
                details={"url": url, "timeout": self.timeout}
            )
        except RequestException as e:
            logging.error(f"Request to {url} failed: {str(e)}")
            raise ApiRequestError(
                message=f"Request failed: {str(e)}",
                details={"url": url, "exception": str(e)}
            )
        finally:
            # Log request duration if not streaming
            if not stream:
                duration = (datetime.now() - start_time).total_seconds()
                logging.info(f"Request to {url} completed in {duration:.2f} seconds")
    
    def stream_response(self, response: requests.Response, start_time: datetime) -> bytes:
        """
        Stream response in chunks and return the complete content.
        
        Args:
            response: Response object to stream
            start_time: Start time of the request for logging
            
        Returns:
            Complete response content as bytes
            
        Raises:
            ApiRequestError: If streaming fails
            InvalidSession: If session expires during streaming
        """
        chunks = []
        total_size = 0
        chunk_count = 0
        last_progress_time = datetime.now()
        last_log_time = datetime.now()
        
        logging.info("Starting to read response chunks...")
        
        try:
            # Log initial response info
            logging.info(f"Initial Response: Status Code = {response.status_code}")
            
            # Check initial response validity
            if response.status_code == 302:
                logging.error("Got redirect response, session likely expired")
                raise InvalidSession()
                
            content_type = response.headers.get('content-type', '').lower()
            if 'text/html' in content_type:
                logging.error("Got HTML response, session likely expired")
                raise InvalidSession()
            
            # Stream the response
            for chunk in response.iter_content(chunk_size=8192):
                current_time = datetime.now()
                
                # Check for timeout between chunks
                if (current_time - last_progress_time).total_seconds() > 30:
                    logging.error("No progress for 30 seconds, considering connection stalled")
                    raise ApiRequestError(
                        message="Connection stalled during streaming",
                        status_code=504
                    )
                
                if chunk:
                    last_progress_time = current_time
                    chunks.append(chunk)
                    total_size += len(chunk)
                    chunk_count += 1
                    
                    # Log progress every 20 chunks or if 5 seconds passed
                    if chunk_count % 20 == 0 or (current_time - last_log_time).total_seconds() >= 5:
                        duration = (current_time - start_time).total_seconds()
                        transfer_rate = total_size / 1024 / 1024 / duration if duration > 0 else 0  # MB/s
                        logging.info(
                            f"Received {chunk_count} chunks ({total_size/1024/1024:.2f} MB) "
                            f"in {duration:.2f} seconds ({transfer_rate:.2f} MB/s)"
                        )
                        last_log_time = current_time
            
            # Log final statistics
            total_duration = (datetime.now() - start_time).total_seconds()
            logging.info(f"Total size: {total_size/1024/1024:.2f} MB")
            logging.info(f"Total chunks: {chunk_count}")
            if chunk_count > 0:  # Avoid division by zero
                logging.info(f"Average chunk size: {total_size/chunk_count/1024:.2f} KB")
                logging.info(f"Average transfer rate: {(total_size/1024/1024)/total_duration:.2f} MB/s")
            
            return b''.join(chunks)
            
        except InvalidSession:
            logging.error("Session validation failed during streaming")
            raise
        except requests.exceptions.RequestException as e:
            logging.error(f"Request error during streaming: {str(e)}")
            raise ApiRequestError(message=f"Error during streaming: {str(e)}")
        except Exception as e:
            logging.error(f"Unexpected error during streaming: {str(e)}")
            logging.exception("Full error traceback:")
            raise ApiRequestError(message=f"Unexpected error during streaming: {str(e)}")
    
    def post(
        self, 
        endpoint: str,
        data: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None
    ) -> requests.Response:
        """
        Make a POST request to the API.
        
        Args:
            endpoint: API endpoint (will be appended to base_url)
            data: Form data to send
            json: JSON data to send
            params: URL parameters
            headers: Additional headers
            
        Returns:
            Response object
            
        Raises:
            ApiRequestError: If the request fails
            InvalidSession: If the session is invalid
        """
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        
        # Add common headers
        request_headers = {'Accept-Encoding': 'gzip, deflate'}
        if headers:
            request_headers.update(headers)
            
        start_time = datetime.now()
        logging.info(f"Making POST request to {url}")
        
        try:
            response = self.session.post(
                url,
                data=data,
                json=json,
                params=params,
                headers=request_headers,
                timeout=self.timeout,
                verify=self.verify_ssl
            )
            
            # Check for redirects which might indicate session expiration
            if response.status_code == 302:
                logging.error("Got redirect response (302), session likely expired")
                raise InvalidSession()
                
            # Check for successful response (allow 200-299 range)
            if response.status_code < 200 or response.status_code >= 300:
                raise ApiRequestError(
                    message=f"API request failed with status code: {response.status_code}",
                    status_code=response.status_code,
                    details={"url": url}
                )
                
            return response
            
        except Timeout:
            logging.error(f"Request to {url} timed out after {self.timeout} seconds")
            raise ApiRequestError(
                message="Request timed out",
                status_code=504,
                details={"url": url, "timeout": self.timeout}
            )
        except RequestException as e:
            logging.error(f"Request to {url} failed: {str(e)}")
            raise ApiRequestError(
                message=f"Request failed: {str(e)}",
                details={"url": url, "exception": str(e)}
            )
        finally:
            duration = (datetime.now() - start_time).total_seconds()
            logging.info(f"Request to {url} completed in {duration:.2f} seconds")
