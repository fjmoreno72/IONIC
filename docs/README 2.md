# IOCore2 Coverage Analysis Tool

A refactored version of the IOCore2 Coverage Analysis Tool with improved maintainability and extensibility.

## Project Structure

The application has been refactored into a modular structure:

```
ionic2/
├── api/                  # API client implementation
│   ├── client.py         # Base API client class
│   └── iocore2.py        # IOCore2-specific client
├── config/               # Configuration settings
│   └── settings.py       # Centralized app settings
├── core/                 # Core functionality
│   ├── auth.py           # Authentication logic 
│   └── exceptions.py     # Custom exceptions
├── data/                 # Data analysis components
│   ├── ier_analysis.py   # IER analysis logic
│   ├── models.py         # Data models
│   └── sreq_analysis.py  # SREQ analysis logic
├── utils/                # Utility functions
│   ├── file_operations.py # File I/O utilities
│   └── logging.py        # Logging configuration
├── web/                  # Web application
│   ├── app.py            # Flask app setup
│   └── routes/           # Route blueprints
│       ├── api.py        # API endpoints
│       ├── auth.py       # Authentication endpoints
│       └── views.py      # Page view endpoints
├── app.py                # Application entry point
└── README.md             # This file
```

## Benefits of the New Structure

1. **Modular Architecture**: Components are organized by functionality, making it easier to locate and update code.
2. **Better Code Reuse**: Common functionality is extracted into reusable utilities and base classes.
3. **Improved Exception Handling**: Standardized exception types and handling across the codebase.
4. **Cleaner API Integration**: The API client layer abstracts the details of HTTP requests and response handling.
5. **Proper Data Modeling**: Well-defined data models with appropriate relationships.
6. **Centralized Configuration**: Settings are centralized and can be overridden via environment variables.
7. **Enhanced Logging**: Consistent logging throughout the application.
8. **Blueprint-based Routing**: Flask routes are organized into logical blueprints.

## Running the Application

### Environment Variables

The application can be configured using the following environment variables:

- `IONIC2_SECRET_KEY`: Secret key for Flask sessions (default: "your-secret-key-here")
- `IONIC2_DEFAULT_URL`: Default URL for IOCore2 API (default: "https://iocore2-ciav.ivv.ncia.nato.int")
- `IONIC2_DEBUG`: Enable debug mode ("True" or "False", default: "False")
- `IONIC2_LOG_LEVEL`: Logging level (default: "INFO")
- `IONIC2_PORT`: Port to run the application on (default: 5005)
- `IONIC2_HOST`: Host to bind the application to (default: "0.0.0.0")

### Starting the Server

```bash
# Run in development mode
cd /path/to/project
python ionic2/app.py

# Or with environment variables
IONIC2_DEBUG=True IONIC2_PORT=8080 python ionic2/app.py
```

## Migrating from the Old Structure

The refactored application maintains the same functionality as the original version, but with improved organization and maintainability. All API endpoints, views, and data processing are preserved with the same behavior.

Key differences for developers:

1. Routes are now organized in blueprints instead of directly in the main app file.
2. API interactions use the IOCore2ApiClient class instead of direct requests.
3. Data analysis is separated into dedicated modules.
4. Exception handling is standardized across the application.

## Future Improvements

1. Unit tests for core components
2. API documentation
3. React-based frontend
4. Enhanced data visualization
5. Caching for API responses
6. Async processing for long-running operations
