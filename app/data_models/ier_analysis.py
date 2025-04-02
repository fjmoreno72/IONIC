"""
Analysis functionality for IER (Interface Exchange Requirements) data.
"""
import csv
import logging
from collections import defaultdict
from pathlib import Path
from typing import Dict, Set, List, Any, Tuple, Optional

from app.utils.file_operations import read_json_file, write_markdown_file

def read_tin_data(tin_csv_file: Path) -> Dict[str, Dict[str, str]]:
    """
    Read TIN data from CSV file to map TINs to services.
    
    Args:
        tin_csv_file: Path to the TIN CSV file
        
    Returns:
        Dictionary with TIN as keys and service information as values
    """
    tin_to_service = {}
    
    try:
        with open(tin_csv_file, 'r') as f:
            reader = csv.DictReader(f, delimiter=';')
            for row in reader:
                tin = row['TIN']
                service = row['SI']
                title = row['Title']
                tin_type = row['TIN_TYPE']
                
                tin_to_service[tin] = {
                    'service': service,
                    'title': title,
                    'type': tin_type
                }
        
        logging.info(f"Read {len(tin_to_service)} TIN entries from {tin_csv_file}")
        return tin_to_service
    except FileNotFoundError:
        logging.error(f"TIN CSV file not found: {tin_csv_file}")
        return {}
    except Exception as e:
        logging.exception(f"Error reading TIN data: {e}")
        return {}

def get_idp_number(idp_tin_name: Optional[str]) -> Optional[str]:
    """
    Extract IDP number from idpTinName string.
    
    Args:
        idp_tin_name: The idpTinName string to extract from
        
    Returns:
        IDP number or None if not found
    """
    if not idp_tin_name:
        return None
    parts = idp_tin_name.split(' -> ')[0].strip()  # Get the part before '->'
    idp_parts = parts.split(' ')[0].strip()  # Get the part before any space
    return idp_parts  # This will be like 'IDP-1242'

def should_include_tin(tin_info: Tuple[Optional[str], Optional[str]], asterisk_idps: Set[str]) -> bool:
    """
    Determine if a TIN should be included based on asterisk rules.

    Args:
        tin_info: Tuple of (tinName, idpTinName)
        asterisk_idps: Set of IDP numbers that have asterisk entries

    Returns:
        True if the TIN should be included, False otherwise
    """
    idp_tin_name = tin_info[1]
    if not idp_tin_name:
        return True

    # If this is an asterisk entry, always include it
    if '*' in idp_tin_name:
        return True

    # Get the IDP number for this entry
    idp_number = get_idp_number(idp_tin_name)
    if not idp_number:
        return True

    # If there's an asterisk entry for this IDP number, exclude this entry
    return idp_number not in asterisk_idps

def analyze_ier_data(data: List[Dict[str, Any]], 
                     tin_to_service: Dict[str, Dict[str, str]] = None) -> Dict[str, Dict[str, Dict[str, Any]]]:
    """
    Analyze IER data and organize it hierarchically by PI, IER, and Service instruction.
    
    Args:
        data: List of dictionaries containing IER data
        tin_to_service: Optional dictionary mapping TIN to service information
        
    Returns:
        Dictionary organized by piNumber -> ierNumber -> service -> test_cases
    """
    # Create nested defaultdict for hierarchical storage
    hierarchy = defaultdict(lambda: defaultdict(dict))
    
    # First pass: collect all IDP numbers that have asterisk entries
    asterisk_idps = set()
    for item in data:
        idp_tin_name = item.get('idpTinName', '')
        if '*' in idp_tin_name:
            idp_number = get_idp_number(idp_tin_name)
            if idp_number:
                asterisk_idps.add(idp_number)
    
    # Second pass: organize data by PI -> IER -> Service -> Test Cases
    for item in data:
        # Use get() with default values for missing fields
        pi_key = (item.get('piNumber', ''), item.get('piName', ''))
        ier_key = (item.get('ierNumber', ''), item.get('ierName', ''))
        tin_info = (item.get('tinName', ''), item.get('idpTinName', ''))
        
        # Safely get test case information
        test_case_key = item.get('testCaseKey', None)
        test_case_name = item.get('testCaseName', None)
        
        status = item.get('testCaseState', '')
        
        if status == 'Deprecated' or status == 'Draft':
            continue
        
        # Skip this TIN if it shouldn't be included based on asterisk rules
        if not should_include_tin(tin_info, asterisk_idps):
            continue
        
        # Map TIN to service instruction
        service_instruction = "Service Instructions for Informal Messaging"
        if tin_info[0] and tin_to_service:
            # Find the TIN key that has the title matching tin_info[0]
            for tin_key, tin_data in tin_to_service.items():
                if tin_data.get('title') == tin_info[0]:
                    service_instruction = f"Service Instructions for {tin_data.get('service', 'Informal Messaging')}"
                    break
        
        # Initialize service entry if not exists
        if service_instruction not in hierarchy[pi_key][ier_key]:
            hierarchy[pi_key][ier_key][service_instruction] = {
                "idp_tin_name": tin_info[1] or "",
                "test_cases": []
            }
        
        # Add test case only if both key and name are not None
        if test_case_key is not None and test_case_name is not None:
            test_case = (test_case_key, test_case_name)
            hierarchy[pi_key][ier_key][service_instruction]["test_cases"].append(test_case)
    
    return hierarchy

def generate_ier_markdown_output(hierarchy: Dict[Tuple[str, str], Dict[Tuple[str, str], Dict[str, Any]]]) -> str:
    """
    Generate formatted markdown output from the hierarchical IER data.
    
    Args:
        hierarchy: Dictionary organized by PI -> IER -> TINs -> test_cases
        
    Returns:
        Formatted markdown string
    """
    output = ["# IER Coverage Analysis Report\n"]
    
    # Sort PI numbers for consistent output
    for pi_key in sorted(hierarchy.keys(), key=lambda x: x[0]):
        pi_number, pi_name = pi_key
        output.append(f"\n## PI: {pi_number} - {pi_name}")
        
        # Sort IER numbers within each PI
        for ier_key in sorted(hierarchy[pi_key].keys(), key=lambda x: x[0]):
            ier_number, ier_name = ier_key
            output.append(f"\n### IER: {ier_number} - {ier_name}")
            
            # Sort TINs within each IER
            for tin_name in sorted(hierarchy[pi_key][ier_key].keys()):
                tin_data = hierarchy[pi_key][ier_key][tin_name]
                idp_tin_name = tin_data.get('idp_tin_name', '')
                test_cases = tin_data.get('test_cases', [])
                
                output.append(f"\n#### TIN: {tin_name}")
                if idp_tin_name:
                    output.append(f"IDP TIN: {idp_tin_name}")
                
                if not test_cases:
                    output.append("*No test cases*")
                else:
                    # Sort test cases for consistent output
                    for test_case in sorted(test_cases, key=lambda x: x[0] if x[0] else ""):
                        test_case_key, test_case_name = test_case
                        output.append(f"- **{test_case_key}**: {test_case_name}")
    
    return "\n".join(output)

def analyze_ier_file(input_file: Path, output_file: Optional[Path] = None) -> str:
    """
    Analyze an IER data file and generate a markdown report.
    
    Args:
        input_file: Path to the input JSON file
        output_file: Optional path to write markdown output
        
    Returns:
        Generated markdown content
    """
    logging.info(f"Analyzing IER data from {input_file}")
    
    try:
        # Read and parse data
        data = read_json_file(input_file)
        
        # Analyze data
        hierarchy = analyze_ier_data(data)
        
        # Generate markdown
        markdown_content = generate_ier_markdown_output(hierarchy)
        
        # Save to file if output_file specified
        if output_file:
            write_markdown_file(markdown_content, output_file)
            logging.info(f"IER analysis written to {output_file}")
        
        return markdown_content
        
    except Exception as e:
        logging.exception(f"Error analyzing IER data: {e}")
        raise
