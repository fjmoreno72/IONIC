# Login API URL Modification

## Summary
Modified the login functionality to display and allow overriding the API URL used for authentication. This enables testing against custom/test environments beyond the hardcoded CIAV and CWIX URLs.

## Changes Made

### 1. Frontend Changes (`app/templates/index_ionic.html`)

#### Added API URL Input Field
- Added a new input field between environment selection and username
- Field shows the selected environment's default URL
- User can override the URL for testing purposes
- Includes helpful text explaining the functionality

#### Updated JavaScript Logic
- Added `envUrls` mapping for default environment URLs
- Created `updateApiUrl()` function to populate the URL field when environment is selected
- Modified environment logo click handlers to update the API URL field
- Updated login form handler to include the API URL in the request
- Added validation to ensure API URL is provided

### 2. Backend Changes (`app/routes/auth.py`)

#### Modified Login Route
- Added `api_url` parameter extraction from request
- Updated logic to use provided API URL or fall back to environment defaults
- Enhanced error handling for missing API URLs
- Updated logging to include the actual URL used for authentication

## How It Works

1. **Environment Selection**: User clicks CIAV or CWIX logo
2. **URL Population**: JavaScript automatically populates the API URL field with the default URL for that environment
3. **URL Override**: User can modify the URL field to point to a custom test environment
4. **Authentication**: Login request includes both the environment and the API URL
5. **Server Processing**: Backend uses the provided URL for authentication, falling back to defaults if none provided

## Usage Examples

### Default Environment URLs
- **CIAV**: `https://iocore2-ciav.ivv.ncia.nato.int`
- **CWIX**: `https://iocore2-cwix.ivv.ncia.nato.int`

### Custom Test Environment
- User can enter any URL like: `https://test-environment.example.com`
- Environment selection (CIAV/CWIX) still matters for UI purposes and logging
- The actual authentication will use the custom URL

## Benefits

1. **Flexibility**: Can test against any IOCore2 instance without code changes
2. **Backward Compatibility**: Default behavior unchanged for existing users
3. **User-Friendly**: Clear UI showing what URL will be used
4. **Logging**: Enhanced logging shows which URL was actually used for debugging

## Files Modified

- `app/templates/index_ionic.html` - Added API URL field and updated JavaScript
- `app/routes/auth.py` - Modified login route to handle custom API URLs

## Testing

A test script (`test_login.py`) has been created to validate the functionality with both default and custom URLs. 