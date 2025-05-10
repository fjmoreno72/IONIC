# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IONIC3 is a Flask-based web application for analyzing IOCore2 coverage data, focusing on Interface Exchange Requirements (IER), System Requirements (SREQ), and test cases. It provides visualization of requirement hierarchies, test coverage metrics, and manages Affiliate Service Configurations (ASC).

## Environment Setup

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt
```

## Running the Application

```bash
# Standard run
python run.py

# With development debug mode
IONIC2_DEBUG=True python run.py

# Bypass authentication for development
python run.py --bypassAuth
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| IONIC2_SECRET_KEY | Secret key for Flask sessions | "your-secret-key-here" |
| IONIC2_DEFAULT_URL | Default URL for IOCore2 API | "https://iocore2-ciav.ivv.ncia.nato.int" |
| IONIC2_DEBUG | Enable debug mode | "False" |
| IONIC2_LOG_LEVEL | Logging level | "INFO" |
| IONIC2_PORT | Port to run the application on | 5005 |
| IONIC2_HOST | Host to bind the application to | "0.0.0.0" |

## Running Tests

```bash
# Run a specific test
python -m tests.simple_test

# Run a specific test function (use unittest for larger tests)
python -m unittest tests.cis_plan_test.TestCISPlan.test_specific_function
```

## Architecture Overview

### Module Structure

1. **Flask Application Core**
   - `app/__init__.py`: Application factory with blueprint registration and security settings
   - `app/config/settings.py`: Centralized configuration with environment variable handling

2. **Data Architecture**
   - JSON-based storage system in `/data` directory and `app/static/ASC/data`
   - Data models use Python dataclasses for structured representation
   - Repositories in `app/data_access` provide data retrieval and manipulation functionality

3. **Frontend System**
   - Uses a component-based architecture with reusable JavaScript classes
   - Core UI components like `DataTable`, `DialogManager`, and form components
   - Theme management with light/dark mode support

4. **API Integration**
   - `app/api/client.py`: Base `ApiClient` with robust request handling
   - `app/api/iocore2.py`: Specific `IOCore2ApiClient` for interacting with IOCore2 API

5. **Authentication System**
   - Session-based auth with optional bypass for development
   - Enhanced auth patches for improved robustness
   - `@login_required` decorator for route protection

### Key Features

- Hierarchical views of requirements and test coverage
- ASC management with Kanban board visualization
- CIS Plan functionality with pointer-based navigation
- Test case management and coverage analysis
- Generic Product (GP) and Specific Product (SP) mapping

## Development Workflow

1. API endpoints are organized as Flask Blueprints in `app/routes/`
2. The front-end JavaScript files are located in `app/static/js/`
3. Templates use Jinja2 and are in `app/templates/`
4. Data models are defined in `app/data_models/`

## Common Patterns

1. **Data Access**: Repository pattern for data access (`app/data_access/`)
2. **API Routes**: Blueprint registration for modular routing
3. **Error Handling**: Standardized exceptions with `IOnic2Error` hierarchy
4. **Frontend Components**: Reusable UI components with standardized APIs

## Recent Features

- CISPlanPointer for improved navigation state management
- Test results optimization
- New SP instances and mission network assets