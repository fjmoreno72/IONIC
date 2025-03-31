"""
View routes for the IOCore2 Coverage Analysis Tool.
"""
import logging
import os
import json
import uuid
from pathlib import Path
from flask import Blueprint, render_template, redirect, url_for, request, session, jsonify # Import session

from ionic2.core.auth import login_required
from ionic2.config import settings
from werkzeug.utils import secure_filename

# Create blueprint
views_bp = Blueprint('views', __name__)

@views_bp.route('/')
def index():
    """
    Render the index (login) page.
    
    Returns:
        Rendered index template or redirect to tree view if already logged in
    """
    from flask import session
    
    # Redirect to tree view if already logged in
    if 'cookies' in session:
        return redirect(url_for('views.view_tree_func'))
        
    return render_template('index_ionic.html', default_url=settings.DEFAULT_URL)

@views_bp.route('/view_tree')
@login_required
def view_tree():
    """
    Render the SREQ tree view page.
    
    Returns:
        Rendered tree view template
    """
    from ionic2.data.sreq_analysis import organize_tin_data
    from ionic2.utils.file_operations import read_json_file
    
    logging.info("Accessing SREQ tree view")
    
    try:
        sreq_path = settings.STATIC_DIR / "SREQ.json"
        
        if not sreq_path.exists():
            return render_template("index_tree_tin.html")
        
        data = read_json_file(sreq_path)
        organized_data = organize_tin_data(data)
        
        return render_template("index_tree_tin.html", data=organized_data)
    except Exception as e:
        logging.exception("Error organizing TIN data:")
        return render_template("index_tree_tin.html")

@views_bp.route('/view_tree_func')
@login_required
def view_tree_func():
    """
    Render the SREQ functional tree view page.
    
    Returns:
        Rendered functional tree view template
    """
    from ionic2.data.sreq_analysis import organize_functional_data
    from ionic2.utils.file_operations import read_json_file
    
    logging.info("Accessing functional tree view")
    
    try:
        sreq_path = settings.STATIC_DIR / "SREQ.json"
        func_path = settings.STATIC_DIR / "SP5-Functional.json"
        
        if not sreq_path.exists() or not func_path.exists():
            return render_template("index_tree_func.html", default_url=settings.DEFAULT_URL)
        
        sreq_data = read_json_file(sreq_path)
        func_data = read_json_file(func_path)
        
        # Organize the data
        organized_data = organize_functional_data(sreq_data, func_data)
        
        return render_template("index_tree_func.html", data=organized_data, default_url=settings.DEFAULT_URL)
    except Exception as e:
        logging.exception("Error organizing functional data:")
        return render_template("index_tree_func.html", default_url=settings.DEFAULT_URL)

@views_bp.route('/view_ier_tree')
@login_required
def view_ier_tree():
    """
    Render the IER tree view page.
    
    Returns:
        Rendered IER tree view template
    """
    from ionic2.data.ier_analysis import analyze_ier_data, read_tin_data
    from ionic2.utils.file_operations import read_json_file
    
    logging.info("Accessing IER tree view")
    
    try:
        ier_path = settings.STATIC_DIR / "IER.json"
        tin_csv_file = settings.STATIC_DIR / "TIN2.csv"
        
        if not ier_path.exists():
            return render_template("index_ier_tree.html", data={})
        
        # Read TIN data to map TINs to services
        logging.info(f"Reading TIN data from {tin_csv_file}...")
        tin_to_service = read_tin_data(tin_csv_file)
        
        # Organize the data using the TIN to service mapping
        data = read_json_file(ier_path)
        raw_organized_data = analyze_ier_data(data, tin_to_service=tin_to_service)
        
        # Convert defaultdict to regular dict for template rendering
        organized_data = {}
        for pi_key, iers in raw_organized_data.items():
            organized_data[pi_key] = {}
            for ier_key, services in iers.items():
                organized_data[pi_key][ier_key] = {}
                for service_name, service_data in services.items():
                    organized_data[pi_key][ier_key][service_name] = {
                        "idp_tin_name": service_data["idp_tin_name"],
                        "test_cases": service_data["test_cases"]
                    }
        
        return render_template("index_ier_tree.html", data=organized_data)
    except Exception as e:
        logging.exception("Error organizing IER data:")
        return render_template("index_ier_tree.html", data={})

@views_bp.route('/system_monitor')
@login_required
def system_monitor():
    """
    Render the system monitor page.
    
    Returns:
        Rendered system monitor template
    """
    logging.info("Accessing system monitor")
    server_url = session.get('url', 'Unknown Server') # Get URL from session, default if not found
    return render_template('system_monitor.html', server_url=server_url)

@views_bp.route('/test_cases')
@login_required
def test_cases():
    """
    Render the test cases page.
    
    Returns:
        Rendered test cases template
    """
    logging.info("Accessing test cases")
    return render_template('test_case.html')


# --- Updated ASC Routes ---

@views_bp.route('/affiliates')
@login_required
def affiliates():
    """Renders the affiliates management page."""
    logging.info("Accessing Affiliates page")
    # Now uses the refactored component-based template
    return render_template('pages/affiliates_new.html', title="Affiliates")

@views_bp.route('/asc_services')
@login_required
def asc_services():
    """Render the ASC Services page."""
    logging.info("Accessing ASC Services page")
    # Now uses the refactored component-based template
    return render_template('pages/services_new.html', title="ASC Services")

@views_bp.route('/asc_gps')
@login_required
def asc_gps():
    """Render the ASC GPs page."""
    logging.info("Accessing ASC GPs page")
    # Now uses the refactored component-based template
    return render_template('pages/gps_new.html', title="ASC GPs")

@views_bp.route('/asc_sps')
@login_required
def asc_sps():
    """Render the ASC SPs page."""
    logging.info("Accessing ASC SPs page")
    # Now uses the refactored component-based template
    return render_template('pages/sps_new.html', title="ASC SPs")

# --- Legacy routes for backward compatibility (redirect to main routes) ---

@views_bp.route('/asc_affiliates')
@login_required
def asc_affiliates():
    """Redirects to main affiliates page."""
    logging.info("Redirecting from /asc_affiliates to /affiliates")
    return redirect(url_for('views.affiliates'))

@views_bp.route('/asc_gps_new')
@login_required
def asc_gps_new():
    """Redirects to main GPs page."""
    logging.info("Redirecting from /asc_gps_new to /asc_gps")
    return redirect(url_for('views.asc_gps'))

@views_bp.route('/asc_services_new')
@login_required
def asc_services_new():
    """Redirects to main Services page."""
    logging.info("Redirecting from /asc_services_new to /asc_services")
    return redirect(url_for('views.asc_services'))

@views_bp.route('/asc_sps_new')
@login_required
def asc_sps_new():
    """Redirects to main SPs page."""
    logging.info("Redirecting from /asc_sps_new to /asc_sps")
    return redirect(url_for('views.asc_sps'))

@views_bp.route('/asc_affiliates_new')
@login_required
def asc_affiliates_new():
    """Redirects to main Affiliates page."""
    logging.info("Redirecting from /asc_affiliates_new to /affiliates")
    return redirect(url_for('views.affiliates'))

# --- Other ASC routes ---

@views_bp.route('/asc_ascs')
@login_required
def asc_ascs():
    """Render the ASC ASCs page."""
    logging.info("Accessing ASC ASCs page")
    # Now uses the refactored component-based template
    return render_template('pages/ascs_new.html', title="ASC ASCs")

@views_bp.route('/asc_kanban')
@login_required
def asc_kanban():
    """Render placeholder page for ASC Kanban."""
    logging.info("Accessing ASC Kanban (WIP)")
    return render_template('work_in_progress.html')

# --- API Routes for Affiliates ---

@views_bp.route('/api/affiliates/upload-flag', methods=['POST'])
@login_required
def upload_affiliate_flag():
    """
    API endpoint to handle flag image uploads for affiliates.
    
    Returns:
        JSON response with the saved file path or error message.
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        # Get affiliate name from request to name the flag
        affiliate_name = request.form.get('affiliateName', '')
        if not affiliate_name:
            return jsonify({'error': 'Affiliate name is required'}), 400
            
        # Sanitize the name for filename (remove spaces, special chars)
        safe_name = secure_filename(affiliate_name.lower().replace(' ', '_'))
        filename = f"flag_{safe_name}.png"
        
        # Ensure the flags directory exists
        flags_dir = Path(settings.STATIC_DIR) / "ASC" / "image" / "flags"
        os.makedirs(flags_dir, exist_ok=True)
        
        # Save the file
        file_path = flags_dir / filename
        file.save(file_path)
        
        # Return the relative path for storage in the data file
        relative_path = f"./image/flags/{filename}"
        return jsonify({
            'success': True,
            'path': relative_path,
            'message': 'Flag uploaded successfully'
        })
        
    except Exception as e:
        logging.exception(f"Error uploading flag: {str(e)}")
        return jsonify({'error': f'Error uploading flag: {str(e)}'}), 500

@views_bp.route('/api/affiliates', methods=['GET', 'POST', 'PUT', 'DELETE'])
@login_required
def manage_affiliates():
    """
    API endpoint to manage affiliates data.
    
    Methods:
        GET: Return all affiliates
        POST: Add a new affiliate
        PUT: Update an existing affiliate
        DELETE: Delete an affiliate
    
    Returns:
        JSON response with the result of the operation
    """
    affiliates_path = Path(settings.STATIC_DIR) / "ASC" / "data" / "affiliates.json"
    
    # Ensure the data directory exists
    os.makedirs(os.path.dirname(affiliates_path), exist_ok=True)
    
    try:
        # GET: Return all affiliates
        if request.method == 'GET':
            if not affiliates_path.exists():
                return jsonify([])
                
            with open(affiliates_path, 'r') as f:
                affiliates = json.load(f)
                
            return jsonify(affiliates)
            
        # POST: Add a new affiliate
        elif request.method == 'POST':
            # Load existing data
            if affiliates_path.exists():
                with open(affiliates_path, 'r') as f:
                    affiliates = json.load(f)
            else:
                affiliates = []
                
            new_affiliate = request.json
            
            # Generate a new ID
            last_id = 0
            if affiliates:
                # Extract the numeric part of the last ID
                try:
                    last_id = int(affiliates[-1]['id'].split('-')[1])
                except (IndexError, ValueError):
                    pass
                    
            new_id = f"AFF-{str(last_id + 1).zfill(4)}"
            new_affiliate['id'] = new_id
            
            # Add to list
            affiliates.append(new_affiliate)
            
            # Save back to file
            with open(affiliates_path, 'w') as f:
                json.dump(affiliates, f, indent=2)
                
            return jsonify({
                'success': True,
                'affiliate': new_affiliate,
                'message': 'Affiliate added successfully'
            })
            
        # PUT: Update an existing affiliate
        elif request.method == 'PUT':
            # Load existing data
            if not affiliates_path.exists():
                return jsonify({'error': 'Affiliates file not found'}), 404
                
            with open(affiliates_path, 'r') as f:
                affiliates = json.load(f)
                
            updated_affiliate = request.json
            
            # Find and update the affiliate
            affiliate_id = updated_affiliate.get('id')
            if not affiliate_id:
                return jsonify({'error': 'Affiliate ID is required'}), 400
                
            found = False
            for i, affiliate in enumerate(affiliates):
                if affiliate.get('id') == affiliate_id:
                    affiliates[i] = updated_affiliate
                    found = True
                    break
                    
            if not found:
                return jsonify({'error': f'Affiliate with ID {affiliate_id} not found'}), 404
                
            # Save back to file
            with open(affiliates_path, 'w') as f:
                json.dump(affiliates, f, indent=2)
                
            return jsonify({
                'success': True,
                'affiliate': updated_affiliate,
                'message': 'Affiliate updated successfully'
            })
        
        # DELETE: Delete an affiliate
        elif request.method == 'DELETE':
            # Load existing data
            if not affiliates_path.exists():
                return jsonify({'error': 'Affiliates file not found'}), 404
                
            with open(affiliates_path, 'r') as f:
                affiliates = json.load(f)
            
            # Get the affiliate ID from query params
            affiliate_id = request.args.get('id')
            if not affiliate_id:
                return jsonify({'error': 'Affiliate ID is required'}), 400
            
            # Find and remove the affiliate
            initial_count = len(affiliates)
            affiliates = [a for a in affiliates if a.get('id') != affiliate_id]
            
            if len(affiliates) == initial_count:
                return jsonify({'error': f'Affiliate with ID {affiliate_id} not found'}), 404
            
            # Save back to file
            with open(affiliates_path, 'w') as f:
                json.dump(affiliates, f, indent=2)
            
            return jsonify({
                'success': True,
                'message': f'Affiliate with ID {affiliate_id} deleted successfully'
            })
            
    except Exception as e:
        logging.exception(f"Error managing affiliates: {str(e)}")
        return jsonify({'error': f'Error: {str(e)}'}), 500
