# IOCore2 System Monitor - Lightweight Version

This is a lightweight, standalone system monitoring application that provides real-time monitoring of IOCore2 system health with a clean, minimal interface.

## Features

- **Lightweight**: Only includes authentication and system monitoring functionality
- **Real-time Monitoring**: Live charts and metrics updated every 60 seconds
- **Clean Interface**: Modern, responsive design with dark/light theme support
- **Secure Authentication**: Supports CIAV and CWIX environments
- **Standalone Deployment**: Can be deployed independently from the full application

## Architecture

The project uses a **modular architecture** for maximum reusability:

```
├── shared_core/          # Shared components between apps
│   ├── auth/            # Authentication modules
│   ├── config/          # Configuration settings
│   └── templates/       # Shared templates
├── monitor_app/         # Lightweight monitor application
│   ├── routes/          # Monitor-specific routes
│   └── templates/       # Monitor-specific templates
├── app/                 # Full application (unchanged)
└── run_monitor.py       # Monitor app entry point
```

## Quick Start

### 1. Setup the Structure

First, run the setup script to create the directory structure:

```bash
python create_monitor_app.py
```

### 2. Copy Required Files

Copy the API client from your existing app to the shared core:

```bash
# Copy the IOCore2 API client
cp -r app/api shared_core/
cp -r app/core/exceptions.py shared_core/
```

### 3. Install Dependencies

The monitor app uses the same dependencies as the main application:

```bash
pip install -r requirements.txt
```

### 4. Run the Monitor Application

```bash
# Production mode
python run_monitor.py

# Development mode with auth bypass
python run_monitor.py --bypassAuth

# Or set environment variables
export IONIC2_DEBUG=true
export IONIC2_MONITOR_PORT=5007
python run_monitor.py
```

## Configuration

The monitor app uses environment variables for configuration:

```bash
# App Configuration
export IONIC2_SECRET_KEY="your-secret-key-here"
export IONIC2_DEBUG="false"

# Server Configuration
export IONIC2_HOST="0.0.0.0"
export IONIC2_MONITOR_PORT="5007"

# IOCore2 API Configuration
export IONIC2_DEFAULT_URL="https://your-iocore2-instance.com"
export IONIC2_VERIFY_SSL="true"

# Logging
export IONIC2_LOG_LEVEL="INFO"
```

## Deployment Options

### Option 1: Standalone Deployment

Deploy the monitor app as a completely separate service:

1. **Create a new directory** for the monitor app
2. **Copy required files**:
   ```bash
   mkdir iocore2-monitor
   cd iocore2-monitor
   
   # Copy monitor app files
   cp -r /path/to/main/app/shared_core .
   cp -r /path/to/main/app/monitor_app .
   cp /path/to/main/app/run_monitor.py .
   cp /path/to/main/app/requirements.txt .
   ```

3. **Install dependencies** and run:
   ```bash
   pip install -r requirements.txt
   python run_monitor.py
   ```

### Option 2: Docker Deployment

Create a Dockerfile for the monitor app:

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY shared_core/ ./shared_core/
COPY monitor_app/ ./monitor_app/
COPY run_monitor.py .

# Set environment variables
ENV IONIC2_HOST=0.0.0.0
ENV IONIC2_MONITOR_PORT=5007

# Expose port
EXPOSE 5007

# Run the application
CMD ["python", "run_monitor.py"]
```

Build and run:
```bash
docker build -t iocore2-monitor .
docker run -p 5007:5007 \
  -e IONIC2_SECRET_KEY=your-secret-key \
  -e IONIC2_VERIFY_SSL=false \
  iocore2-monitor
```

### Option 3: Systemd Service

Create a systemd service file (`/etc/systemd/system/iocore2-monitor.service`):

```ini
[Unit]
Description=IOCore2 System Monitor
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/iocore2-monitor
Environment=IONIC2_HOST=0.0.0.0
Environment=IONIC2_MONITOR_PORT=5007
Environment=IONIC2_SECRET_KEY=your-secret-key-here
ExecStart=/opt/iocore2-monitor/venv/bin/python run_monitor.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable iocore2-monitor
sudo systemctl start iocore2-monitor
```

## Usage

1. **Access the application**: Open your browser to `http://localhost:5007`
2. **Login**: Select environment (CIAV/CWIX) and enter credentials
3. **Monitor**: View real-time system health metrics and charts

## Customization

### Adding New Metrics

1. **Update the API route** in `monitor_app/routes/monitor.py`
2. **Modify the template** in `monitor_app/templates/system_monitor.html`
3. **Add chart configuration** in the JavaScript section

### Changing the Theme

The application supports custom theming through CSS variables. Edit the `:root` section in the system monitor template.

### Authentication Customization

Modify the authentication logic in `shared_core/auth/auth_service.py` to support additional environments or authentication methods.

## Maintenance

### Updating from Main App

To update the monitor app with changes from the main application:

1. **Update shared components**:
   ```bash
   cp -r app/api shared_core/
   cp app/core/exceptions.py shared_core/
   ```

2. **Update templates** if needed:
   ```bash
   # Compare and merge changes from app/templates/system_monitor.html
   diff app/templates/system_monitor.html monitor_app/templates/system_monitor.html
   ```

### Monitoring Logs

The application logs to stdout by default. For production deployments:

```bash
# View logs (systemd)
journalctl -u iocore2-monitor -f

# View logs (Docker)
docker logs -f iocore2-monitor

# View logs (direct)
python run_monitor.py 2>&1 | tee monitor.log
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all required files are copied to the shared_core directory
2. **Authentication Issues**: Check API URLs and credentials
3. **Port Conflicts**: Use `IONIC2_MONITOR_PORT` to change the default port
4. **SSL Errors**: Set `IONIC2_VERIFY_SSL=false` for development environments

### Debug Mode

Run in debug mode for detailed error information:

```bash
export IONIC2_DEBUG=true
python run_monitor.py --bypassAuth
```

## Security Considerations

- **Change default secret key** in production
- **Use HTTPS** when deploying publicly
- **Restrict network access** to monitoring port
- **Keep dependencies updated** regularly
- **Monitor application logs** for security events

## Support

For issues related to:
- **Monitor app functionality**: Check this README and application logs
- **IOCore2 API integration**: Refer to the main application documentation
- **System health data**: Verify IOCore2 system status and API availability 