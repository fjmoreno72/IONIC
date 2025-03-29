#!/usr/bin/env python3
"""
Test script for scheduled_update.py

This script allows you to test the scheduled_update.py script locally
before deploying it to PythonAnywhere. It will prompt you for your
credentials and then run the scheduled_update.py script with those
credentials.
"""

import os
import sys
import getpass
import importlib.util

def main():
    print("=" * 60)
    print("Testing scheduled_update.py script")
    print("=" * 60)
    print("\nThis script will help you test the scheduled_update.py script")
    print("locally before deploying it to PythonAnywhere.\n")
    
    # Check if scheduled_update.py exists
    if not os.path.exists("scheduled_update.py"):
        print("Error: scheduled_update.py not found in the current directory.")
        print("Make sure you run this script from the same directory as scheduled_update.py.")
        sys.exit(1)
    
    # Get user credentials
    print("Please enter your credentials for the application:")
    url = input("PythonAnywhere URL (e.g., https://fjmoreno72.eu.pythonanywhere.com): ")
    api_url = input("API URL (e.g., https://iocore2-ciav.ivv.ncia.nato.int): ")
    username = input("Username: ")
    password = getpass.getpass("Password: ")
    
    # Temporarily modify scheduled_update.py with the provided credentials
    with open("scheduled_update.py", "r") as f:
        content = f.read()
    
    # Create a backup of the original file
    with open("scheduled_update.py.bak", "w") as f:
        f.write(content)
    
    # Replace the credentials in the content
    # Ensure URLs end with a slash for consistent formatting (matching app_ionic.py approach)
    if not url.endswith("/"):
        url += "/"
    if not api_url.endswith("/"):
        api_url += "/"
    
    content = content.replace('URL = "https://fjmoreno72.eu.pythonanywhere.com"', f'URL = "{url}"')
    content = content.replace('API_URL = "https://iocore2-ciav.ivv.ncia.nato.int"', f'API_URL = "{api_url}"')
    content = content.replace('USERNAME = "your_username"', f'USERNAME = "{username}"')
    content = content.replace('PASSWORD = "your_password"', f'PASSWORD = "{password}"')
    
    # Write the modified content back to the file
    with open("scheduled_update.py", "w") as f:
        f.write(content)
    
    print("\nCredentials have been temporarily set in scheduled_update.py.")
    print("Running the script now...\n")
    print("=" * 60)
    
    try:
        # Import and run the scheduled_update.py script
        spec = importlib.util.spec_from_file_location("scheduled_update", "scheduled_update.py")
        scheduled_update = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(scheduled_update)
        
        # Run the main function
        scheduled_update.main()
        
        print("\n" + "=" * 60)
        print("Test completed.")
        
    except Exception as e:
        print(f"\nError running scheduled_update.py: {str(e)}")
    
    finally:
        # Restore the original file
        with open("scheduled_update.py.bak", "r") as f:
            original_content = f.read()
        
        with open("scheduled_update.py", "w") as f:
            f.write(original_content)
        
        # Remove the backup file
        os.remove("scheduled_update.py.bak")
        
        print("\nThe original scheduled_update.py file has been restored.")
        print("Your credentials have not been saved to the file.")
        
        # Check if the log file was created
        if os.path.exists("scheduled_update.log"):
            print("\nA log file was created at scheduled_update.log.")
            print("You can check this file for detailed information about the test run.")
        
        print("\nIf the test was successful, you can now deploy the script to PythonAnywhere")
        print("and set up the scheduled task as described in SCHEDULED_TASK_README.md.")

if __name__ == "__main__":
    main()
