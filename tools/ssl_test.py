#!/usr/bin/env python3
"""
SSL Certificate Testing Utility

This script helps test SSL certificate verification with different configurations
for the IOCore2 API client.
"""
import sys
import os
import requests
import argparse
import logging
from pathlib import Path

# Add the parent directory to the path so we can import from the project
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.api.client import ApiClient
from app.core.exceptions import ApiRequestError

def test_ssl_config(url, verify_ssl=True, ca_bundle=None):
    """
    Test SSL configuration with the given parameters.
    
    Args:
        url: The URL to test
        verify_ssl: Whether to verify SSL certificates
        ca_bundle: Path to custom CA bundle file
    """
    print(f"\n{'='*60}")
    print(f"Testing SSL Configuration:")
    print(f"URL: {url}")
    print(f"Verify SSL: {verify_ssl}")
    print(f"CA Bundle: {ca_bundle or 'System default'}")
    print(f"{'='*60}")
    
    try:
        # Test with requests directly first
        print("\n1. Testing with requests library directly...")
        
        verify_param = ca_bundle if ca_bundle else verify_ssl
        response = requests.get(url, verify=verify_param, timeout=10)
        
        print(f"✅ Success! Status: {response.status_code}")
        print(f"   Certificate Subject: {response.raw.connection.sock.getpeercert().get('subject', 'N/A')}")
        
    except requests.exceptions.SSLError as e:
        print(f"❌ SSL Error: {e}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Request Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return False
    
    try:
        # Test with ApiClient
        print("\n2. Testing with ApiClient...")
        
        client = ApiClient(
            base_url=url,
            verify_ssl=verify_param
        )
        
        # Try a simple GET request
        response = client.get('/api/health-check')  # or any endpoint that exists
        print(f"✅ ApiClient Success! Status: {response.status_code}")
        return True
        
    except ApiRequestError as e:
        print(f"❌ ApiClient Error: {e}")
        return False
    except Exception as e:
        print(f"❌ ApiClient Unexpected Error: {e}")
        return False

def find_system_ca_bundle():
    """Find the system CA bundle file."""
    common_locations = [
        '/etc/ssl/certs/ca-certificates.crt',  # Debian/Ubuntu
        '/etc/pki/tls/certs/ca-bundle.crt',    # RedHat/CentOS
        '/etc/ssl/ca-bundle.pem',              # OpenSUSE
        '/usr/local/share/certs/ca-root-nss.crt',  # FreeBSD
        '/etc/ssl/cert.pem',                   # macOS
    ]
    
    for location in common_locations:
        if os.path.exists(location):
            return location
    
    return None

def main():
    """Main function."""
    parser = argparse.ArgumentParser(
        description='Test SSL certificate verification configurations'
    )
    parser.add_argument(
        'url', 
        help='URL to test (e.g., https://iocore2-ciav.ivv.ncia.nato.int)'
    )
    parser.add_argument(
        '--no-verify', 
        action='store_true',
        help='Test with SSL verification disabled'
    )
    parser.add_argument(
        '--ca-bundle', 
        help='Path to custom CA bundle file'
    )
    parser.add_argument(
        '--find-system-ca', 
        action='store_true',
        help='Show system CA bundle location'
    )
    parser.add_argument(
        '--verbose', '-v', 
        action='store_true',
        help='Enable verbose logging'
    )
    
    args = parser.parse_args()
    
    # Configure logging
    level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # Show system CA bundle location if requested
    if args.find_system_ca:
        system_ca = find_system_ca_bundle()
        if system_ca:
            print(f"System CA bundle found at: {system_ca}")
        else:
            print("System CA bundle not found in common locations")
        return
    
    # Validate CA bundle file if provided
    if args.ca_bundle and not os.path.exists(args.ca_bundle):
        print(f"❌ Error: CA bundle file not found: {args.ca_bundle}")
        return
    
    # Test configurations
    success_count = 0
    total_tests = 0
    
    if args.no_verify:
        print("Testing with SSL verification disabled...")
        total_tests += 1
        if test_ssl_config(args.url, verify_ssl=False):
            success_count += 1
    else:
        # Test with system default CAs
        print("Testing with system default CAs...")
        total_tests += 1
        if test_ssl_config(args.url, verify_ssl=True):
            success_count += 1
        
        # Test with custom CA bundle if provided
        if args.ca_bundle:
            print(f"Testing with custom CA bundle: {args.ca_bundle}")
            total_tests += 1
            if test_ssl_config(args.url, verify_ssl=True, ca_bundle=args.ca_bundle):
                success_count += 1
    
    # Summary
    print(f"\n{'='*60}")
    print(f"Summary: {success_count}/{total_tests} tests passed")
    print(f"{'='*60}")
    
    if success_count == 0:
        print("\n💡 Suggestions:")
        print("1. Try with --no-verify to test without SSL verification")
        print("2. Check if you have the NATO CA certificate installed")
        print("3. Contact your system administrator for the correct CA bundle")
        print("4. Use --find-system-ca to locate your system's CA bundle")
    elif success_count < total_tests:
        print("\n💡 Some tests failed. Consider using the working configuration.")

if __name__ == '__main__':
    main() 