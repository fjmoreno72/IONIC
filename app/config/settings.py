"""
Configuration settings for the IOCore2 Coverage Analysis Tool.
"""
import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent # Use resolve() for robustness
DATA_DIR = BASE_DIR / "data" # New directory for data files
# STATIC_DIR and TEMPLATES_DIR are no longer needed; Flask finds them automatically within the 'app' package.

# Ensure necessary directories exist
os.makedirs(DATA_DIR, exist_ok=True)

# Application settings
APP_SECRET_KEY = os.environ.get("IONIC2_SECRET_KEY", "your-secret-key-here")
DEFAULT_URL = os.environ.get("IONIC2_DEFAULT_URL", "https://iocore2-ciav.ivv.ncia.nato.int")
DEBUG = os.environ.get("IONIC2_DEBUG", "False").lower() == "true"

# Logging settings
LOG_FILE = DATA_DIR / "unmapped_sreqs.log" # Updated path
LOG_FORMAT = '%(asctime)s - %(message)s'
LOG_DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
LOG_LEVEL = os.environ.get("IONIC2_LOG_LEVEL", "ERROR")

# API request settings
REQUEST_TIMEOUT = (400, 400)  # (connect timeout, read timeout)

# SSL Configuration
# You can enable SSL verification in several ways:
# 1. Set environment variable: IONIC2_VERIFY_SSL=true
# 2. Change VERIFY_SSL below to True
# 3. Provide a custom CA bundle path in CUSTOM_CA_BUNDLE
VERIFY_SSL = os.environ.get("IONIC2_VERIFY_SSL", "False").lower() == "true"  # Set to "True" to enable by default

# Custom CA Bundle - provide path to your organization's CA certificate file
# Example: "/path/to/nato-ca-bundle.pem" or "/usr/local/share/ca-certificates/nato-ca.crt"
CUSTOM_CA_BUNDLE = os.environ.get("IONIC2_CA_BUNDLE", None)
