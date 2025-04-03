# Refactoring JSON Data Access Strategy

This document outlines the strategy used to refactor the application's access to static JSON data files (like `affiliates.json`, `services.json`) located in `app/static/ASC/data/`. The goal is to encapsulate data access within dedicated Python repository modules and route all interactions through backend API endpoints, preparing for a potential future migration to a database backend.

## General Strategy

The core idea is to introduce a data access layer (repository pattern) for each JSON file and ensure all parts of the application (backend and frontend) use this layer instead of accessing the JSON file directly.

The process for each JSON file (`<entity>.json`, e.g., `affiliates.json`) involves these steps:

1. **Identify Usage:**
    * Search the entire codebase (`app/`) for direct references to the specific JSON file path (e.g., `app/static/ASC/data/<entity>.json`).
    * Examine likely backend routes (e.g., `app/routes/views.py`, `app/routes/<entity>.py`) for API endpoints handling CRUD operations for the entity.
    * Examine relevant frontend JavaScript files (e.g., `app/static/js/pages/<entity>_new.js`, `app/static/ASC/js/data-manager.js`, other pages that might perform lookups) to see how they fetch or use the data.

2. **Create Repository Module:**
    * Create a new Python file: `app/data_access/<entity>_repository.py`.
    * Implement functions within this module to handle reading (e.g., `get_all_<entity>()`) and writing (e.g., `save_<entity>(data)`) data.
    * Initially, these functions read/write the *existing* JSON file (`app/static/ASC/data/<entity>.json`). Use `current_app.static_folder` to construct the path reliably within Flask.

3. **Refactor Backend API:**
    * Locate the Flask route(s) handling API requests for the entity (e.g., `/api/<entity>`).
    * Modify the route handler function(s) to import and use the functions from the new repository module instead of performing direct file I/O.
    * **Lesson Learned:** Ensure there are no conflicting routes for the same API endpoint defined in different blueprint files (e.g., check `views.py` vs. `api.py`). Remove duplicate/obsolete routes.

4. **Refactor Frontend:**
    * Identify all JavaScript files that fetch the static JSON file directly (e.g., using `fetch('/static/ASC/data/<entity>.json')`). This includes main entity pages, data managers, and any other components performing lookups.
    * Modify these fetch calls to use the corresponding backend API endpoint instead (e.g., `fetch('/api/<entity>')`).
    * **Lesson Learned:** Be thorough in identifying *all* frontend fetches. Files like `data-manager.js` or pages displaying related data (like `ascs_new.js` needing service names) are common places for direct fetches used for lookups.
    * **Lesson Learned (Timing/Dependencies):** If a component relies on lookup data (e.g., displaying service *names* based on `serviceId`), ensure the lookup data (fetched via the API) is fully loaded *before* the component attempts to render or perform the lookup. This might involve:
        * Using `Promise.all` to wait for all necessary data fetches to complete before initializing components.
        * Modifying components (like `DataTable` in `tableCore.js`) to correctly handle data passed directly via constructor options (`data: [...]`) instead of relying solely on `dataUrl` for fetching, if data needs to be pre-loaded.

5. **Testing:**
    * Thoroughly test all pages and components related to the entity.
    * Verify data loading, display (including lookups like names/flags), adding, editing, and deleting functionality.
    * Check browser developer console for errors (e.g., 404s, JavaScript errors).

6. **Isolate the Data File (Final Step):**
    * **Only after confirming everything works correctly**, rename the original JSON file (e.g., `app/static/ASC/data/<entity>.json` to `app/static/ASC/data/_<entity>.json`). Using a leading underscore is a common convention for "internal" files.
    * Update the file path *only* inside the corresponding repository module (`app/data_access/<entity>_repository.py`) to point to the new filename.

## Specific Refactoring Done

### 1. Affiliates (`affiliates.json`)

* **Repository:** `app/data_access/affiliates_repository.py` created.
* **Backend:** `/api/affiliates` route in `app/routes/views.py` updated to use the repository. Conflicting `/api/affiliates` route removed from `app/routes/api.py`.
* **Frontend:**
  * `app/static/js/pages/affiliates_new.js`: `DataTable` `dataUrl` changed to `/api/affiliates`.
  * `app/static/ASC/js/data-manager.js`: Fetch changed from static file to `/api/affiliates`.
  * `app/static/js/pages/ascs_new.js`: Fetch changed from static file to `/api/affiliates`.
* **Isolation:** File renamed to `_affiliates.json`, repository updated.

### 2. Services (`services.json`)

* **Repository:** `app/data_access/services_repository.py` created.
* **Backend:** `/api/services` route in `app/routes/services.py` updated to use the repository.
* **Frontend:**
  * `app/static/js/pages/services_new.js`: `DataTable` `dataUrl` changed to `/api/services`.
  * `app/static/ASC/js/data-manager.js`: Fetch changed from static file to `/api/services`.
  * `app/static/js/pages/ascs_new.js`: Fetch changed from static file to `/api/services`.
* **Fixes Applied:**
  * Modified `app/static/js/pages/ascs_new.js` to use `Promise.all` to ensure service data was loaded before initializing `DataTable`.
  * Modified `app/static/js/components/tableCore.js` to correctly handle data passed via the `data` option, fixing an issue where it still tried to fetch using `dataUrl` when `data` was provided.
* **Isolation:** File renamed to `_services.json`, repository updated.

By following this strategy and learning from the encountered issues, refactoring the remaining JSON files should be a smoother process.
