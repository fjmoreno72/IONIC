# Deployment Guide

This document outlines the steps for deploying the refactored IOCore2 Coverage Analysis Tool in various environments.

## Local Development Deployment

1. Clone the repository and navigate to the project root
   ```bash
   git clone <repository_url>
   cd <project_dir>
   ```

2. Create and activate a virtual environment
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   # OR
   venv\Scripts\activate     # Windows
   ```

3. Install dependencies
   ```bash
   pip install -r ionic2/requirements.txt
   ```

4. Setup static files and templates (choose one method):
   ```bash
   # Using symlinks (recommended for development)
   python ionic2/migrate.py symlink
   
   # OR copying files (recommended for production)
   python ionic2/migrate.py copy
   ```

5. Run the application in development mode
   ```bash
   IONIC2_DEBUG=True python ionic2/app.py
   ```

6. Access the application in a web browser at `http://localhost:5005`

## Production Deployment

### Option 1: Standard WSGI Server

1. Clone the repository and navigate to the project root
   ```bash
   git clone <repository_url>
   cd <project_dir>
   ```

2. Create and activate a virtual environment
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```

3. Install dependencies
   ```bash
   pip install -r ionic2/requirements.txt
   pip install gunicorn # or another WSGI server
   ```

4. Copy static files and templates
   ```bash
   python ionic2/migrate.py copy
   ```

5. Set environment variables
   ```bash
   export IONIC2_SECRET_KEY="your-secure-key-here"
   export IONIC2_DEFAULT_URL="https://iocore2-ciav.ivv.ncia.nato.int"
   export IONIC2_DEBUG="False"
   export IONIC2_LOG_LEVEL="INFO"
   ```

6. Create a WSGI entry point (ionic2_wsgi.py in project root)
   ```python
   from ionic2.web.app import create_app
   application = create_app()
   ```

7. Run with Gunicorn
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5005 ionic2_wsgi:application
   ```

### Option 2: Systemd Service

1. Follow steps 1-5 from Option 1

2. Create a systemd service file at `/etc/systemd/system/ionic2.service`
   ```ini
   [Unit]
   Description=IOCore2 Coverage Analysis Tool
   After=network.target

   [Service]
   User=<your_user>
   WorkingDirectory=/path/to/project
   ExecStart=/path/to/project/venv/bin/gunicorn -w 4 -b 0.0.0.0:5005 ionic2_wsgi:application
   Restart=always
   Environment="IONIC2_SECRET_KEY=your-secure-key-here"
   Environment="IONIC2_DEFAULT_URL=https://iocore2-ciav.ivv.ncia.nato.int"
   Environment="IONIC2_DEBUG=False"
   Environment="IONIC2_LOG_LEVEL=INFO"

   [Install]
   WantedBy=multi-user.target
   ```

3. Enable and start the service
   ```bash
   sudo systemctl enable ionic2
   sudo systemctl start ionic2
   ```

4. Check service status
   ```bash
   sudo systemctl status ionic2
   ```

### Option 3: Docker Deployment

For Docker deployment, create a Dockerfile in the project root:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY . /app/
RUN pip install --no-cache-dir -r ionic2/requirements.txt gunicorn

# Copy files instead of symlinks
RUN python ionic2/migrate.py copy

# Set environment variables
ENV IONIC2_SECRET_KEY="your-secure-key-here" \
    IONIC2_DEFAULT_URL="https://iocore2-ciav.ivv.ncia.nato.int" \
    IONIC2_DEBUG="False" \
    IONIC2_LOG_LEVEL="INFO" \
    IONIC2_HOST="0.0.0.0" \
    IONIC2_PORT="5005"

EXPOSE 5005

# Create WSGI entry point
RUN echo "from ionic2.web.app import create_app\napplication = create_app()" > /app/ionic2_wsgi.py

# Run with Gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5005", "ionic2_wsgi:application"]
```

Build and run the Docker container:

```bash
docker build -t ionic2-coverage-tool .
docker run -d -p 5005:5005 --name ionic2 ionic2-coverage-tool
```

## PythonAnywhere Deployment

For deployment on PythonAnywhere:

1. Upload the project code to your PythonAnywhere account

2. Create a virtual environment and install dependencies
   ```bash
   mkvirtualenv --python=/usr/bin/python3.9 ionic2-env
   workon ionic2-env
   pip install -r ionic2/requirements.txt
   ```

3. Copy static files and templates
   ```bash
   python ionic2/migrate.py copy
   ```

4. Configure a new web app:
   - Go to Web tab on PythonAnywhere dashboard
   - Add a new web app
   - Select Manual Configuration (not Flask)
   - Enter your virtualenv path
   - Edit WSGI configuration file:

   ```python
   import sys
   path = '/home/yourusername/your-project-path'
   if path not in sys.path:
       sys.path.append(path)
   
   from ionic2.web.app import create_app
   application = create_app()
   ```

5. Configure static files:
   - URL: /static/
   - Directory: /home/yourusername/your-project-path/ionic2/static/

6. Save changes and restart the web app

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| IONIC2_SECRET_KEY | Secret key for Flask sessions | "your-secret-key-here" |
| IONIC2_DEFAULT_URL | Default URL for IOCore2 API | "https://iocore2-ciav.ivv.ncia.nato.int" |
| IONIC2_DEBUG | Enable debug mode | "False" |
| IONIC2_LOG_LEVEL | Logging level | "INFO" |
| IONIC2_PORT | Port to run the application on | 5005 |
| IONIC2_HOST | Host to bind the application to | "0.0.0.0" |

## Troubleshooting

- **File Permissions**: Ensure the application has appropriate read/write permissions for the static directory
- **Logging**: Check the application logs in the static directory for detailed error information
- **Database Access**: The application doesn't use a database, but it needs access to various JSON and CSV files
- **API Connectivity**: Ensure the application can access the IOCore2 API from your deployment environment
- **Template Issues**: If you encounter template errors, ensure the template files are correctly copied or linked
