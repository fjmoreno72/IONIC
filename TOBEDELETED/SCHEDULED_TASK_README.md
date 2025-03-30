# Setting Up Hourly JSON Update Task on PythonAnywhere

This document provides instructions for setting up a scheduled task on PythonAnywhere that will automatically update your IER.json and SREQ.json files every hour by calling the `/get_ier_coverage` and `/get_requirement_coverage` endpoints.

## Prerequisites

- A PythonAnywhere account with your Flask application deployed
- Access to the PythonAnywhere dashboard
- Your application username and password

## Step 1: Test the Script Locally (Optional)

Before deploying to PythonAnywhere, you can test the script locally to ensure it works with your credentials:

1. Make sure you have Python 3.6+ installed on your local machine
2. Run the test script:
   ```bash
   python test_scheduled_update.py
   ```
3. Follow the prompts to enter your credentials
4. The script will temporarily update the scheduled_update.py file with your credentials, run it, and then restore the original file
5. Check the output and the generated log file to verify that the script works correctly

## Step 2: Upload the Script

1. Log in to your PythonAnywhere account
2. Navigate to the "Files" tab
3. Go to your application directory (e.g., `/home/fjmoreno72/myapp`)
4. Upload the `scheduled_update.py` script to this directory

## Step 3: Configure the Script

1. Open the `scheduled_update.py` file in the PythonAnywhere editor
2. Update the configuration variables at the top of the file:
   ```python
   URL = "https://fjmoreno72.eu.pythonanywhere.com"  # Your PythonAnywhere URL
   USERNAME = "your_username"  # Your application username
   PASSWORD = "your_password"  # Your application password
   API_URL = "https://iocore2-ciav.ivv.ncia.nato.int"  # The API URL used in your application
   
   # Note: Make sure your URLs end with a trailing slash (/)
   # Correct: "https://example.com/"
   # Incorrect: "https://example.com"
   ```
3. Replace these values with your actual deployment information
4. Save the file

## Step 4: Make the Script Executable

1. Open a Bash console in PythonAnywhere
2. Navigate to your application directory:
   ```bash
   cd ~/myapp
   ```
3. Make the script executable:
   ```bash
   chmod +x scheduled_update.py
   ```

## Step 5: Test the Script

Before scheduling it, test the script to make sure it works correctly:

1. In the Bash console, run:
   ```bash
   python3 scheduled_update.py
   ```
2. Check the output and verify that:
   - The script successfully logs in
   - Both JSON files are updated
   - No errors are reported
3. Check the `scheduled_update.log` file for detailed logs:
   ```bash
   cat scheduled_update.log
   ```

## Step 6: Set Up the Scheduled Task

1. Go to the "Tasks" tab in your PythonAnywhere dashboard
2. In the "Schedule a new task" section:
   - Set the time to run hourly (e.g., "0 * * * *" to run at the top of every hour)
   - Enter the command to run the script:
     ```
     cd /home/fjmoreno72/myapp && python3 scheduled_update.py
     ```
   - Replace `/home/fjmoreno72/myapp` with your actual application directory path
3. Click "Add task" to create the scheduled task

## Step 7: Monitor the Task

1. After the task has run for the first time, check the task log in the "Tasks" tab
2. You can also check the `scheduled_update.log` file in your application directory for detailed logs
3. Verify that the JSON files in your static directory are being updated correctly

## Troubleshooting

If the task is not working as expected:

1. Check the task log in the "Tasks" tab for any errors
2. Check the `scheduled_update.log` file for detailed error messages
3. Common issues include:
   - Incorrect username or password
   - URL formatting issues (make sure URLs end with a trailing slash)
   - Path issues (make sure all paths in the script are correct)
   - Permission issues (make sure the script is executable and has write access to the static directory)
   - Network issues (make sure the API URL is accessible from PythonAnywhere)

## Notes

- The script logs all activity to `scheduled_update.log` in your application directory
- The script will update both IER.json and SREQ.json files in your static directory
- If one update fails, the script will still attempt to update the other file
- The script includes error handling to prevent crashes and logs all errors for troubleshooting
