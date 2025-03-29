# Deploying to PythonAnywhere

This document provides step-by-step instructions for deploying this Flask application to PythonAnywhere.

## Prerequisites

- A PythonAnywhere account (free or paid)
- Your application code (all files in this repository)

## Deployment Steps

### 1. Sign Up for PythonAnywhere

If you haven't already, sign up for a PythonAnywhere account at [pythonanywhere.com](https://www.pythonanywhere.com/).

### 2. Upload Your Code

There are two ways to upload your code to PythonAnywhere:

#### Option A: Upload a ZIP file

1. Create a ZIP file of your entire project
2. Log in to PythonAnywhere
3. Go to the "Files" tab
4. Create a new directory for your app (e.g., "myapp")
5. Upload the ZIP file
6. Extract it using the PythonAnywhere console:
   ```bash
   cd myapp
   unzip yourproject.zip
   ```

#### Option B: Use Git

If your code is in a Git repository:

1. Log in to PythonAnywhere
2. Go to the "Consoles" tab
3. Start a new Bash console
4. Clone your repository:
   ```bash
   git clone https://github.com/yourusername/your-repository.git myapp
   ```

### 3. Set Up a Virtual Environment

1. In the PythonAnywhere Bash console, create a virtual environment:
   ```bash
   mkvirtualenv --python=python3.9 myappenv
   ```

2. Activate the environment (if not already activated):
   ```bash
   workon myappenv
   ```

3. Navigate to your project directory:
   ```bash
   cd myapp
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### 4. Configure Your Web App

1. Go to the "Web" tab in your PythonAnywhere dashboard
2. Click "Add a new web app"
3. Choose your domain (fjmoreno72.eu.pythonanywhere.com)
4. Select "Flask" as your framework
5. Choose Python 3.9 as your Python version
6. Set the path to your Flask app:
   - Source code: `/home/fjmoreno72/myapp`
   - Working directory: `/home/fjmoreno72/myapp`
   - WSGI configuration file: `/var/www/fjmoreno72_eu_pythonanywhere_com_wsgi.py`

### 5. Configure Static Files

1. In the "Web" tab, scroll down to "Static files"
2. Add a static file mapping:
   - URL: `/static/`
   - Directory: `/home/fjmoreno72/myapp/static/`

### 6. Edit the WSGI Configuration File

1. In the "Web" tab, click the link to your WSGI configuration file (located at `/var/www/fjmoreno72_eu_pythonanywhere_com_wsgi.py`)
2. Replace the contents with the following:

```python
import sys
import os

# Add your project directory to the Python path
path = '/home/fjmoreno72/myapp'
if path not in sys.path:
    sys.path.append(path)

# Set environment variables
os.environ['SECRET_KEY'] = 'your-secure-secret-key'  # Change this to a secure random string

# Import the Flask app
from app_ionic import app as application
```

Note: You can also use the provided `pythonanywhere_wsgi.py` file as a reference.

### 7. Set Up the Virtual Environment Path

1. In the "Web" tab, scroll down to "Virtualenv"
2. Enter the path to your virtual environment:
   ```
   /home/fjmoreno72/.virtualenvs/myappenv
   ```

### 8. Create Required JSON Files

Before starting your app, make sure these JSON files exist in your static directory:

1. SREQ.json
2. IER.json
3. SP5-Functional.json

If they don't exist, create empty JSON files:

```bash
cd ~/myapp/static
echo "[]" > SREQ.json
echo "[]" > IER.json
echo "[]" > SP5-Functional.json
```

### 9. Reload Your Web App

1. In the "Web" tab, click the "Reload" button to restart your web app with the new configuration

### 10. Visit Your Site

Your application should now be accessible at:
```
https://fjmoreno72.eu.pythonanywhere.com
```

## Troubleshooting

If your app doesn't work immediately, check the error logs in the "Web" tab. Common issues include:

- Missing dependencies: Install them with `pip install package-name`
- File permissions: Fix with `chmod -R 755 /home/fjmoreno72/myapp`
- Path issues: Make sure all paths in the WSGI file are correct
- Missing JSON files: Create the required JSON files in the static directory

## Setting Up Scheduled Tasks

This application includes a script that can be scheduled to run hourly to automatically update the IER.json and SREQ.json files by calling the `/get_ier_coverage` and `/get_requirement_coverage` endpoints.

For detailed instructions on setting up this scheduled task, please refer to the `SCHEDULED_TASK_README.md` file included in the deployment package.

## Updating Your Application

To update your application after making changes:

1. Upload the new files to PythonAnywhere
2. If you used Git, pull the latest changes:
   ```bash
   cd /home/fjmoreno72/myapp
   git pull
   ```
3. Reload your web app in the "Web" tab by clicking the "Reload" button
