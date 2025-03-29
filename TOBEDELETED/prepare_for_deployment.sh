#!/bin/bash

# Script to prepare the application for deployment to PythonAnywhere

echo "Preparing application for deployment to PythonAnywhere..."

# Create a deployment directory if it doesn't exist
mkdir -p deployment

# Create a list of files to include in the deployment
echo "Creating file list for deployment..."

# Main application files
FILES_TO_INCLUDE=(
    "app_ionic.py"
    "wsgi.py"
    "requirements.txt"
    "ier_analysis.py"
    "sreq_analysis.py"
    "static"
    "templates"
    "DEPLOY.md"
    "pythonanywhere_wsgi.py"
    "scheduled_update.py"
    "SCHEDULED_TASK_README.md"
    "test_scheduled_update.py"
)

# Create the ZIP file
echo "Creating deployment ZIP file..."
zip -r deployment/pythonanywhere_deployment.zip "${FILES_TO_INCLUDE[@]}" -x "**/__pycache__/*" "**/.DS_Store" "**/.git/*"

echo "Deployment package created at: deployment/pythonanywhere_deployment.zip"
echo ""
echo "Next steps:"
echo "1. Log in to your PythonAnywhere account"
echo "2. Go to the Files tab"
echo "3. Create a new directory for your app (e.g., 'myapp')"
echo "4. Upload the ZIP file (deployment/pythonanywhere_deployment.zip)"
echo "5. Extract the ZIP file using the PythonAnywhere console:"
echo "   cd myapp"
echo "   unzip pythonanywhere_deployment.zip"
echo ""
echo "6. Follow the remaining steps in DEPLOY.md to complete the deployment"
