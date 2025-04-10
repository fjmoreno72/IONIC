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
REQUEST_TIMEOUT = (300, 300)  # (connect timeout, read timeout)
VERIFY_SSL = False # Disable SSL verification (necessary for internal CAs without local trust)
# To properly verify, provide the path to the CA bundle file below
# or install the CA certificate in the system's trust store.
CUSTOM_CA_BUNDLE = None # Example: "/path/to/your/ca-bundle.pem"
