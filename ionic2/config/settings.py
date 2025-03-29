"""
Configuration settings for the IOCore2 Coverage Analysis Tool.
"""
import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).parent.parent.parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"

# Ensure necessary directories exist
os.makedirs(STATIC_DIR, exist_ok=True)

# Application settings
APP_SECRET_KEY = os.environ.get("IONIC2_SECRET_KEY", "your-secret-key-here")
DEFAULT_URL = os.environ.get("IONIC2_DEFAULT_URL", "https://iocore2-ciav.ivv.ncia.nato.int")
DEBUG = os.environ.get("IONIC2_DEBUG", "False").lower() == "true"

# Logging settings
LOG_FILE = STATIC_DIR / "unmapped_sreqs.log"
LOG_FORMAT = '%(asctime)s - %(message)s'
LOG_DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
LOG_LEVEL = os.environ.get("IONIC2_LOG_LEVEL", "INFO")

# API request settings
REQUEST_TIMEOUT = (300, 300)  # (connect timeout, read timeout)
VERIFY_SSL = False # Disable SSL verification (necessary for internal CAs without local trust)
# To properly verify, provide the path to the CA bundle file below
# or install the CA certificate in the system's trust store.
CUSTOM_CA_BUNDLE = None # Example: "/path/to/your/ca-bundle.pem"
