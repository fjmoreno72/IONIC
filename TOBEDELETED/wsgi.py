import sys
import os

# Add your project directory to the Python path
# This will be updated to the actual path on PythonAnywhere
path = '/home/fjmoreno72/myapp'
if path not in sys.path:
    sys.path.append(path)

# Import the Flask app
# We're using app_ionic instead of app-ionic because Python doesn't allow hyphens in module names
from app_ionic import app as application

# Set environment variables
os.environ['SECRET_KEY'] = 'your-secure-secret-key'
