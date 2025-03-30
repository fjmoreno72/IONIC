"""
This is a sample WSGI configuration file for PythonAnywhere.
You'll need to modify this file on PythonAnywhere at:
/var/www/fjmoreno72_eu_pythonanywhere_com_wsgi.py
"""

import sys
import os

# Add your project directory to the Python path
# Update this path to match your actual directory on PythonAnywhere
path = '/home/fjmoreno72/myapp'
if path not in sys.path:
    sys.path.append(path)

# Set environment variables
# Replace 'your-secure-secret-key' with a strong random string
os.environ['SECRET_KEY'] = 'your-secure-secret-key'

# Import the Flask app
# We're using app_ionic instead of app-ionic because Python doesn't allow hyphens in module names
from app_ionic import app as application
