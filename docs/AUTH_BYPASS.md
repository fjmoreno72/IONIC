# Authentication Bypass for Development

This document describes how to bypass the standard authentication mechanism for development purposes within the IOCore2 Coverage Analysis Tool.

**WARNING:** This feature is intended **strictly for development environments** and should **NEVER** be enabled in production or any environment accessible by unauthorized users. Bypassing authentication completely disables security checks related to user login.

## Purpose

During development, it can be cumbersome to repeatedly log in after server restarts or session timeouts. This bypass mechanism allows developers to navigate the application freely without needing valid credentials, speeding up the development and testing workflow for UI elements and non-auth-dependent features.

## How to Enable

To enable authentication bypass, start the application using the `--bypassAuth` command-line flag:

```bash
python run.py --bypassAuth
```

When this flag is present:

1.  The `@login_required` decorator will be skipped, allowing access to protected routes without a valid session.
2.  If no valid session exists, the application will automatically inject a *dummy* session context before processing requests. This includes:
    *   Dummy session cookies (`session['cookies']`).
    *   A target API URL (`session['url']`), taken from `settings.IOCORE_API_URL` or defaulting to `http://localhost:8080`.
    *   A dummy user object (`session['user']`) with a username like `bypass_user` and default roles (e.g., `['admin', 'developer']`).

## Implications and Limitations

*   **No Real Authentication:** When bypassed, the application does *not* authenticate against the actual IOCore2 API.
*   **Dummy User Data:** Any functionality relying on specific user details or permissions fetched during a real login might behave differently or use the hardcoded dummy data (`bypass_user`, default roles).
*   **API Calls:** API calls made via `get_api_client()` will use the dummy session cookies and the configured/default URL. These calls may fail if the target API expects valid, non-dummy credentials, or if the dummy user lacks necessary permissions on the actual API side.
*   **Security Risk:** Enabling this bypass removes a critical security layer. Ensure it is only used in isolated development environments.

## How it Works

1.  `run.py` parses the `--bypassAuth` argument.
2.  The `create_app` function in `app/__init__.py` receives the flag and stores it in `app.config['BYPASS_AUTH']`.
3.  If `BYPASS_AUTH` is true, an `app.before_request` hook is registered. This hook checks if a real session (`session['cookies']`) exists. If not, it injects the dummy session data described above.
4.  The `login_required` decorator in `app/core/auth.py` checks `current_app.config['BYPASS_AUTH']`. If true, it immediately allows the request to proceed without checking `session['cookies']`.
